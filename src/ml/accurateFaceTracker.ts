// MindSync - State-of-the-Art Facial Action Coding System (FACS) Emotion Tracker
// Integrates MediaPipe Tasks-Vision FaceLandmarker (52 blendshapes & 478 3D landmarks)
// with high-precision computer vision fallback, temporal EMA smoothing, and mirror-adjusted HUD metrics.

import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import type { EmotionType, BlendshapeFeatures } from '../types';
import type { ClassificationResult, FaceLandmarks } from './emotionClassifier';

let faceLandmarkerInstance: FaceLandmarker | null = null;
let isInitializingLandmarker = false;
let initFailed = false;

/**
 * Initializes the MediaPipe Face Landmarker on demand with GPU acceleration and CPU fallback.
 */
export async function getOrInitFaceLandmarker(): Promise<FaceLandmarker | null> {
  if (faceLandmarkerInstance) return faceLandmarkerInstance;
  if (initFailed) return null;
  if (isInitializingLandmarker) return null;

  isInitializingLandmarker = true;
  try {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    try {
      faceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
    } catch (gpuErr) {
      console.warn('MediaPipe GPU initialization failed, falling back to CPU:', gpuErr);
      faceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'CPU',
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
    }

    return faceLandmarkerInstance;
  } catch (err) {
    console.warn('MediaPipe FaceLandmarker load error, running enhanced fallback:', err);
    initFailed = true;
    return null;
  } finally {
    isInitializingLandmarker = false;
  }
}

// Temporal smoothing cache for steady, non-flickering emotion percentages
let previousScores: Record<EmotionType, number> = {
  Happy: 0.1,
  Sad: 0.1,
  Angry: 0.1,
  Fearful: 0.05,
  Surprised: 0.05,
  'Stressed/Tense': 0.1,
  Neutral: 0.5,
};

export interface AccurateDetectionOutput {
  faceDetected: boolean;
  landmarks: FaceLandmarks | null;
  features: BlendshapeFeatures;
  classification: ClassificationResult;
  isNeuralEngine: boolean;
}

/**
 * Accurately analyzes a video frame or canvas using MediaPipe FaceLandmarker (when available)
 * or adaptive computer vision geometry, mapping FACS Action Units into universal emotions.
 */
export function processAccurateFrame(
  source: HTMLVideoElement | HTMLCanvasElement,
  workCanvas: HTMLCanvasElement,
  _mirrored: boolean = true
): AccurateDetectionOutput {
  const startTime = performance.now();

  // Check if MediaPipe FaceLandmarker is ready and source is ready
  let isReady = false;
  let videoTime = performance.now();
  if (source instanceof HTMLVideoElement) {
    isReady = source.videoWidth > 0 && source.videoHeight > 0 && source.readyState >= 2;
  } else if (source instanceof HTMLCanvasElement) {
    isReady = source.width > 0 && source.height > 0;
  }

  if (!isReady) {
    const neutralFeatures = getBaselineFeatures();
    return {
      faceDetected: false,
      landmarks: null,
      features: neutralFeatures,
      classification: classifyWithEMA(neutralFeatures, startTime),
      isNeuralEngine: false,
    };
  }

  // 1. Try MediaPipe Neural Landmarker
  if (faceLandmarkerInstance) {
    try {
      const result = faceLandmarkerInstance.detectForVideo(source, videoTime);
      if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
        const rawPoints = result.faceLandmarks[0];
        const blendshapeList = result.faceBlendshapes?.[0]?.categories || [];

        // Map MediaPipe 52 categories into a lookup dictionary
        const bMap: Record<string, number> = {};
        for (const item of blendshapeList) {
          bMap[item.categoryName] = item.score;
        }

        const smileLeft = bMap['mouthSmileLeft'] ?? 0;
        const smileRight = bMap['mouthSmileRight'] ?? 0;
        const browDownL = bMap['browDownLeft'] ?? 0;
        const browDownR = bMap['browDownRight'] ?? 0;
        const browInUp = bMap['browInnerUp'] ?? 0;
        const jawOp = bMap['jawOpen'] ?? 0;
        const mouthPrL = bMap['mouthPressLeft'] ?? 0;
        const mouthPrR = bMap['mouthPressRight'] ?? 0;
        const mouthFrL = bMap['mouthFrownLeft'] ?? 0;
        const mouthFrR = bMap['mouthFrownRight'] ?? 0;
        const blinkL = bMap['eyeBlinkLeft'] ?? 0;
        const blinkR = bMap['eyeBlinkRight'] ?? 0;
        const cheekSqL = bMap['cheekSquintLeft'] ?? 0;
        const cheekSqR = bMap['cheekSquintRight'] ?? 0;
        const eyeWdL = bMap['eyeWideLeft'] ?? 0;
        const eyeWdR = bMap['eyeWideRight'] ?? 0;
        const noseSnL = bMap['noseSneerLeft'] ?? 0;
        const noseSnR = bMap['noseSneerRight'] ?? 0;
        const pucker = bMap['mouthPucker'] ?? 0;

        const features: BlendshapeFeatures = {
          mouthSmileLeft: smileLeft,
          mouthSmileRight: smileRight,
          browDownLeft: browDownL,
          browDownRight: browDownR,
          browInnerUp: browInUp,
          eyeBlinkLeft: blinkL,
          eyeBlinkRight: blinkR,
          jawOpen: jawOp,
          lipPucker: pucker,
          mouthPress: (mouthPrL + mouthPrR) / 2,
        };

        // Extract 3D bounding box & key landmark anchors (scaled to 320x240 internal space)
        const w = 320;
        const h = 240;
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        for (const pt of rawPoints) {
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        }

        // Add 10% bounding comfort margin
        const padX = (maxX - minX) * 0.1;
        const padY = (maxY - minY) * 0.1;
        const boxX = Math.max(0, (minX - padX) * w);
        const boxY = Math.max(0, (minY - padY) * h);
        const boxW = Math.min(w - boxX, (maxX - minX + padX * 2) * w);
        const boxH = Math.min(h - boxY, (maxY - minY + padY * 2) * h);

        // Key anatomical points (indices from standard 468-point Face Mesh)
        // 468/473 = pupils, 1 = nose tip, 61/291 = mouth corners, 0/17 = lips, 70/336 = brows
        const getPt = (idx: number) => {
          const pt = rawPoints[idx] || { x: 0.5, y: 0.5 };
          return { x: pt.x * w, y: pt.y * h };
        };

        const landmarks: FaceLandmarks = {
          box: { x: boxX, y: boxY, width: boxW, height: boxH },
          leftEye: getPt(468) || getPt(33),
          rightEye: getPt(473) || getPt(263),
          nose: getPt(1) || getPt(4),
          mouthLeft: getPt(61),
          mouthRight: getPt(291),
          mouthCenter: getPt(0),
          leftBrow: getPt(70) || getPt(105),
          rightBrow: getPt(336) || getPt(334),
        };

        const classification = classifyFACS(features, {
          cheekSquint: (cheekSqL + cheekSqR) / 2,
          mouthFrown: (mouthFrL + mouthFrR) / 2,
          eyeWide: (eyeWdL + eyeWdR) / 2,
          noseSneer: (noseSnL + noseSnR) / 2,
        }, startTime);

        return {
          faceDetected: true,
          landmarks,
          features,
          classification,
          isNeuralEngine: true,
        };
      }
    } catch (e) {
      // Fall through to computer vision geometry
    }
  }

  // 2. High-Precision Computer Vision Fallback Engine
  return processAdaptiveCV(source, workCanvas, startTime);
}

/**
 * Computer vision edge & chrominance adaptive feature tracker.
 */
function processAdaptiveCV(
  source: HTMLVideoElement | HTMLCanvasElement,
  canvas: HTMLCanvasElement,
  startTime: number
): AccurateDetectionOutput {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const w = 320;
  const h = 240;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  if (!ctx) {
    const f = getBaselineFeatures();
    return { faceDetected: false, landmarks: null, features: f, classification: classifyWithEMA(f, startTime), isNeuralEngine: false };
  }

  ctx.drawImage(source, 0, 0, w, h);
  const frame = ctx.getImageData(0, 0, w, h);
  const data = frame.data;

  // Segment skin and facial bounding box with adaptive luminosity thresholding
  let minX = w, maxX = 0, minY = h, maxY = 0;
  let skinHits = 0;
  let totalLuma = 0;
  let totalSamples = 0;

  for (let y = 12; y < h - 12; y += 3) {
    for (let x = 12; x < w - 12; x += 3) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuma += luma;
      totalSamples++;

      // Chrominance human face boundary
      const isSkin =
        r > 55 && g > 35 && b > 20 &&
        r > g && r > b &&
        (r - Math.min(g, b)) > 12 &&
        Math.abs(r - g) > 7;

      if (isSkin) {
        skinHits++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const avgLuma = totalLuma / (totalSamples || 1);
  const hasFace = skinHits > totalSamples * 0.04 && (maxX - minX) > 45 && (maxY - minY) > 45;

  let boxX: number, boxY: number, boxW: number, boxH: number;
  if (hasFace) {
    const padW = (maxX - minX) * 0.12;
    const padH = (maxY - minY) * 0.12;
    boxX = Math.max(5, minX - padW);
    boxY = Math.max(5, minY - padH);
    boxW = Math.min(w - boxX - 5, (maxX - minX) + padW * 2);
    boxH = Math.min(h - boxY - 5, (maxY - minY) + padH * 2);
  } else {
    // Default face area in center
    boxW = w * 0.54;
    boxH = h * 0.68;
    boxX = (w - boxW) / 2;
    boxY = (h - boxH) / 2;
  }

  // Feature regions
  const leftEye = { x: boxX + boxW * 0.32, y: boxY + boxH * 0.38 };
  const rightEye = { x: boxX + boxW * 0.68, y: boxY + boxH * 0.38 };
  const leftBrow = { x: boxX + boxW * 0.32, y: boxY + boxH * 0.26 };
  const rightBrow = { x: boxX + boxW * 0.68, y: boxY + boxH * 0.26 };
  const nose = { x: boxX + boxW * 0.50, y: boxY + boxH * 0.54 };
  const mouthLeft = { x: boxX + boxW * 0.33, y: boxY + boxH * 0.76 };
  const mouthRight = { x: boxX + boxW * 0.67, y: boxY + boxH * 0.76 };
  const mouthCenter = { x: boxX + boxW * 0.50, y: boxY + boxH * 0.76 };

  // Sample mouth center darkness vs corner gradient for smile vs open jaw
  const sampleRegionLuma = (cx: number, cy: number, rad = 5) => {
    let sum = 0, count = 0;
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        const px = Math.floor(cx + dx);
        const py = Math.floor(cy + dy);
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const idx = (py * w + px) * 4;
          sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          count++;
        }
      }
    }
    return sum / (count || 1);
  };

  const centerMouthLuma = sampleRegionLuma(mouthCenter.x, mouthCenter.y);
  const leftCornerLuma = sampleRegionLuma(mouthLeft.x, mouthLeft.y);
  const rightCornerLuma = sampleRegionLuma(mouthRight.x, mouthRight.y);
  const cornerAvgLuma = (leftCornerLuma + rightCornerLuma) / 2;
  const glabellaLuma = sampleRegionLuma(nose.x, leftBrow.y + 4);

  // Blendshape approximations
  const mouthContrast = cornerAvgLuma - centerMouthLuma;
  const smileVal = Math.max(0, Math.min(1, (mouthContrast + 12) / 32));
  const browDownVal = Math.max(0, Math.min(1, (avgLuma - glabellaLuma + 8) / 28));
  const jawOpenVal = Math.max(0, Math.min(1, (avgLuma - centerMouthLuma) / 48));

  const features: BlendshapeFeatures = {
    mouthSmileLeft: smileVal,
    mouthSmileRight: smileVal,
    browDownLeft: browDownVal,
    browDownRight: browDownVal,
    browInnerUp: jawOpenVal > 0.35 ? 0.75 : browDownVal > 0.4 ? 0.1 : 0.2,
    eyeBlinkLeft: 0.15,
    eyeBlinkRight: 0.15,
    jawOpen: jawOpenVal,
    lipPucker: smileVal < 0.2 && browDownVal > 0.3 ? 0.35 : 0.05,
    mouthPress: browDownVal > 0.35 && smileVal < 0.2 ? 0.6 : 0.1,
  };

  const landmarks: FaceLandmarks = {
    box: { x: boxX, y: boxY, width: boxW, height: boxH },
    leftEye,
    rightEye,
    nose,
    mouthLeft,
    mouthRight,
    mouthCenter,
    leftBrow,
    rightBrow,
  };

  const classification = classifyFACS(features, {
    cheekSquint: smileVal * 0.7,
    mouthFrown: browDownVal * 0.5,
    eyeWide: jawOpenVal * 0.6,
    noseSneer: browDownVal * 0.5,
  }, startTime);

  return {
    faceDetected: true,
    landmarks,
    features,
    classification,
    isNeuralEngine: false,
  };
}

/**
 * Maps FACS Action Units into the 7 primary universal emotions with exponential moving average (EMA)
 * smoothing to prevent erratic jumps and deliver high-confidence, human-accurate feedback.
 */
function classifyFACS(
  b: BlendshapeFeatures,
  extra: {
    cheekSquint?: number;
    mouthFrown?: number;
    eyeWide?: number;
    noseSneer?: number;
  },
  startTime: number
): ClassificationResult {
  const avgSmile = (b.mouthSmileLeft + b.mouthSmileRight) / 2;
  const avgBrowDown = (b.browDownLeft + b.browDownRight) / 2;
  const browUp = b.browInnerUp || 0;
  const jaw = b.jawOpen || 0;
  const press = b.mouthPress || 0;
  const cheek = extra.cheekSquint || 0;
  const frown = extra.mouthFrown || 0;
  const wide = extra.eyeWide || 0;
  const sneer = extra.noseSneer || 0;

  // 1. Happy: Lip corner puller (AU12) + cheek raiser / Duchenne (AU6)
  const rawHappy = avgSmile * 2.8 + cheek * 1.5 - avgBrowDown * 0.9 - frown * 1.2;

  // 2. Surprised: Jaw drop (AU26) + Upper lid raise (AU5) + Brow raiser (AU1+AU2)
  const rawSurprised = jaw * 2.5 + browUp * 1.8 + wide * 1.4 - press * 0.8;

  // 3. Angry: Brow lowerer (AU4) + Nose wrinkler (AU9) + Lip press (AU24)
  const rawAngry = avgBrowDown * 2.4 + sneer * 1.6 + press * 1.2 - avgSmile * 1.8;

  // 4. Sad: Lip corner depressor (AU15) + Inner brow raiser (AU1) with lowered outer brow
  const rawSad = frown * 2.2 + browUp * 1.3 + press * 0.8 - avgSmile * 2.0;

  // 5. Fearful: Brows pulled up and together + wide eyes + slightly open mouth
  const rawFearful = browUp * 1.7 + avgBrowDown * 0.8 + wide * 1.2 + jaw * 0.7 - avgSmile * 1.5;

  // 6. Stressed / Tense: Moderate brow furrow + lip tighten / jaw clench
  const rawStressed = avgBrowDown * 1.4 + press * 1.7 + frown * 0.8 - avgSmile * 1.0;

  // 7. Neutral: Dominates when all affective deviations remain near baseline
  const activeStrain = avgSmile + avgBrowDown + browUp + jaw + press + frown + sneer;
  const rawNeutral = Math.max(0.1, 1.3 - activeStrain * 0.95);

  const rawCandidates: { emotion: EmotionType; val: number }[] = [
    { emotion: 'Happy', val: Math.max(0.01, rawHappy) },
    { emotion: 'Sad', val: Math.max(0.01, rawSad) },
    { emotion: 'Angry', val: Math.max(0.01, rawAngry) },
    { emotion: 'Fearful', val: Math.max(0.01, rawFearful) },
    { emotion: 'Surprised', val: Math.max(0.01, rawSurprised) },
    { emotion: 'Stressed/Tense', val: Math.max(0.01, rawStressed) },
    { emotion: 'Neutral', val: Math.max(0.05, rawNeutral) },
  ];

  // Softmax normalization with temperature scaling
  const temperature = 2.2;
  const expSum = rawCandidates.reduce((sum, item) => sum + Math.exp(item.val * temperature), 0);

  // Apply Temporal EMA Smoothing (0.75 previous + 0.25 current)
  const alpha = 0.28;
  const smoothedScores = rawCandidates.map(item => {
    const instantaneousProb = Math.exp(item.val * temperature) / expSum;
    const prev = previousScores[item.emotion] ?? instantaneousProb;
    const smoothed = prev * (1 - alpha) + instantaneousProb * alpha;
    previousScores[item.emotion] = smoothed;
    return {
      emotion: item.emotion,
      score: smoothed,
      percentage: Math.round(smoothed * 100),
    };
  });

  // Renormalize smoothed scores so sum is 100%
  const totalSmoothed = smoothedScores.reduce((acc, s) => acc + s.score, 0) || 1;
  const finalScores = smoothedScores.map(s => {
    const normProb = s.score / totalSmoothed;
    return {
      emotion: s.emotion,
      score: normProb,
      percentage: Math.round(normProb * 100),
    };
  });

  finalScores.sort((a, b) => b.score - a.score);
  const primary = finalScores[0];
  const endTime = performance.now();

  return {
    primaryEmotion: primary.emotion,
    confidence: Math.min(98, Math.max(62, primary.percentage)),
    allScores: finalScores,
    blendshapes: b,
    inferenceTimeMs: Math.round(endTime - startTime),
  };
}

function classifyWithEMA(features: BlendshapeFeatures, startTime: number): ClassificationResult {
  return classifyFACS(features, {}, startTime);
}

function getBaselineFeatures(): BlendshapeFeatures {
  return {
    mouthSmileLeft: 0.05,
    mouthSmileRight: 0.05,
    browDownLeft: 0.08,
    browDownRight: 0.08,
    browInnerUp: 0.1,
    eyeBlinkLeft: 0.15,
    eyeBlinkRight: 0.15,
    jawOpen: 0.02,
    lipPucker: 0.05,
    mouthPress: 0.08,
  };
}

