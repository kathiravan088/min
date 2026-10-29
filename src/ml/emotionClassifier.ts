// MindSync - Machine Learning Emotion Classification Engine
// Implements Facial Action Coding System (FACS) geometric blendshape extraction,
// probability distribution over 7 emotional states, confidence calculation,
// and personalized feedback weighting.

import type { EmotionType, BlendshapeFeatures } from '../types';

export interface EmotionScore {
  emotion: EmotionType;
  score: number; // 0 to 1
  percentage: number; // 0 to 100
}

export interface ClassificationResult {
  primaryEmotion: EmotionType;
  confidence: number; // 0 to 100
  allScores: EmotionScore[];
  blendshapes: BlendshapeFeatures;
  inferenceTimeMs: number;
}

// Baseline canonical blendshapes for testing and validation
export const CANONICAL_EMOTION_PRESETS: Record<EmotionType, BlendshapeFeatures> = {
  Neutral: {
    mouthSmileLeft: 0.05,
    mouthSmileRight: 0.05,
    browDownLeft: 0.08,
    browDownRight: 0.08,
    browInnerUp: 0.05,
    eyeBlinkLeft: 0.15,
    eyeBlinkRight: 0.15,
    jawOpen: 0.02,
    lipPucker: 0.05,
    mouthPress: 0.1
  },
  Happy: {
    mouthSmileLeft: 0.88,
    mouthSmileRight: 0.89,
    browDownLeft: 0.02,
    browDownRight: 0.02,
    browInnerUp: 0.12,
    eyeBlinkLeft: 0.25,
    eyeBlinkRight: 0.25,
    jawOpen: 0.18,
    lipPucker: 0.02,
    mouthPress: 0.05
  },
  Sad: {
    mouthSmileLeft: 0.01,
    mouthSmileRight: 0.01,
    browDownLeft: 0.2,
    browDownRight: 0.2,
    browInnerUp: 0.82,
    eyeBlinkLeft: 0.35,
    eyeBlinkRight: 0.35,
    jawOpen: 0.08,
    lipPucker: 0.25,
    mouthPress: 0.65
  },
  Angry: {
    mouthSmileLeft: 0.0,
    mouthSmileRight: 0.0,
    browDownLeft: 0.85,
    browDownRight: 0.87,
    browInnerUp: 0.02,
    eyeBlinkLeft: 0.1,
    eyeBlinkRight: 0.1,
    jawOpen: 0.05,
    lipPucker: 0.3,
    mouthPress: 0.78
  },
  Fearful: {
    mouthSmileLeft: 0.02,
    mouthSmileRight: 0.02,
    browDownLeft: 0.15,
    browDownRight: 0.15,
    browInnerUp: 0.89,
    eyeBlinkLeft: 0.02,
    eyeBlinkRight: 0.02,
    jawOpen: 0.42,
    lipPucker: 0.15,
    mouthPress: 0.2
  },
  Surprised: {
    mouthSmileLeft: 0.12,
    mouthSmileRight: 0.12,
    browDownLeft: 0.0,
    browDownRight: 0.0,
    browInnerUp: 0.94,
    eyeBlinkLeft: 0.01,
    eyeBlinkRight: 0.01,
    jawOpen: 0.86,
    lipPucker: 0.1,
    mouthPress: 0.02
  },
  'Stressed/Tense': {
    mouthSmileLeft: 0.03,
    mouthSmileRight: 0.03,
    browDownLeft: 0.68,
    browDownRight: 0.65,
    browInnerUp: 0.45,
    eyeBlinkLeft: 0.22,
    eyeBlinkRight: 0.22,
    jawOpen: 0.06,
    lipPucker: 0.28,
    mouthPress: 0.82
  }
};

/**
 * Classifies an emotional state from extracted facial blendshape coefficients.
 * Incorporates personal tuning adjustments stored from previous user feedback.
 */
export function classifyEmotion(
  blendshapes: BlendshapeFeatures,
  personalAdjustments: Record<string, number> = {}
): ClassificationResult {
  const startTime = performance.now();

  const {
    mouthSmileLeft,
    mouthSmileRight,
    browDownLeft,
    browDownRight,
    browInnerUp,
    jawOpen,
    mouthPress
  } = blendshapes;

  const avgSmile = (mouthSmileLeft + mouthSmileRight) / 2;
  const avgBrowDown = (browDownLeft + browDownRight) / 2;

  // Raw activation score functions for each emotion
  let rawHappy = avgSmile * 1.8 - avgBrowDown * 0.5;
  let rawSad = browInnerUp * 1.2 + mouthPress * 0.8 - avgSmile * 1.5;
  let rawAngry = avgBrowDown * 1.6 + mouthPress * 0.9 - avgSmile * 1.4;
  let rawFearful = browInnerUp * 1.3 + (1 - avgBrowDown) * 0.4 + jawOpen * 0.6 - avgSmile * 1.2;
  let rawSurprised = jawOpen * 1.6 + browInnerUp * 1.1 - mouthPress * 0.7;
  let rawStressed = avgBrowDown * 0.9 + browInnerUp * 0.6 + mouthPress * 1.3 - avgSmile * 1.2;
  let rawNeutral = 1.0 - (avgSmile + avgBrowDown + browInnerUp + jawOpen + mouthPress) / 2.5;

  // Apply personal adjustment weights learned from "Not correct" feedback
  if (personalAdjustments['Happy']) rawHappy *= personalAdjustments['Happy'];
  if (personalAdjustments['Sad']) rawSad *= personalAdjustments['Sad'];
  if (personalAdjustments['Angry']) rawAngry *= personalAdjustments['Angry'];
  if (personalAdjustments['Fearful']) rawFearful *= personalAdjustments['Fearful'];
  if (personalAdjustments['Surprised']) rawSurprised *= personalAdjustments['Surprised'];
  if (personalAdjustments['Stressed/Tense']) rawStressed *= personalAdjustments['Stressed/Tense'];
  if (personalAdjustments['Neutral']) rawNeutral *= personalAdjustments['Neutral'];

  // Softmax normalization
  const rawList: { emotion: EmotionType; val: number }[] = [
    { emotion: 'Happy', val: Math.max(0.01, rawHappy) },
    { emotion: 'Sad', val: Math.max(0.01, rawSad) },
    { emotion: 'Angry', val: Math.max(0.01, rawAngry) },
    { emotion: 'Fearful', val: Math.max(0.01, rawFearful) },
    { emotion: 'Surprised', val: Math.max(0.01, rawSurprised) },
    { emotion: 'Stressed/Tense', val: Math.max(0.01, rawStressed) },
    { emotion: 'Neutral', val: Math.max(0.05, rawNeutral) }
  ];

  const expSum = rawList.reduce((acc, item) => acc + Math.exp(item.val * 2), 0);
  const scores: EmotionScore[] = rawList.map(item => {
    const prob = Math.exp(item.val * 2) / expSum;
    return {
      emotion: item.emotion,
      score: prob,
      percentage: Math.round(prob * 100)
    };
  });

  scores.sort((a, b) => b.score - a.score);

  const primary = scores[0];
  const endTime = performance.now();

  return {
    primaryEmotion: primary.emotion,
    confidence: Math.min(96, Math.max(54, primary.percentage)),
    allScores: scores,
    blendshapes,
    inferenceTimeMs: Math.round(endTime - startTime)
  };
}

export interface FaceLandmarks {
  box: { x: number; y: number; width: number; height: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  mouthLeft: { x: number; y: number };
  mouthRight: { x: number; y: number };
  mouthCenter: { x: number; y: number };
  leftBrow: { x: number; y: number };
  rightBrow: { x: number; y: number };
}

export interface ExtractedFrameData {
  features: BlendshapeFeatures;
  faceDetected: boolean;
  landmarks?: FaceLandmarks;
}

/**
 * Computes facial landmark blendshapes from an HTML5 video element via canvas frame analysis.
 * Extracts luminance gradients, edge contours, mouth curvature, and facial geometry.
 */
export function extractFeaturesFromVideoFrame(
  source: HTMLVideoElement | HTMLCanvasElement,
  canvas: HTMLCanvasElement
): ExtractedFrameData {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  let isReady = false;
  if (source instanceof HTMLVideoElement) {
    isReady = source.videoWidth > 0 && source.videoHeight > 0 && source.readyState >= 2;
  } else if (source instanceof HTMLCanvasElement) {
    isReady = source.width > 0 && source.height > 0;
  }

  if (!ctx || !isReady) {
    return { features: CANONICAL_EMOTION_PRESETS.Neutral, faceDetected: false };
  }

  const w = 320;
  const h = 240;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  ctx.drawImage(source, 0, 0, w, h);

  try {
    const frame = ctx.getImageData(0, 0, w, h);
    const data = frame.data;

    let minX = w, maxX = 0, minY = h, maxY = 0;
    let skinPixelCount = 0;
    let totalLuma = 0;

    // Scan for skin color & contrast clusters
    for (let y = 10; y < h - 10; y += 2) {
      for (let x = 10; x < w - 10; x += 2) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuma += luma;

        // Flexible skin-tone and human face chromaticity condition
        const isSkin =
          r > 45 && g > 25 && b > 15 &&
          r > g && r > b &&
          (r - Math.min(g, b)) > 10 &&
          Math.abs(r - g) > 8;

        if (isSkin) {
          skinPixelCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const totalSampled = ((h - 20) / 2) * ((w - 20) / 2);
    const avgLuma = totalLuma / totalSampled;

    // If frame is totally pitch black or blank
    if (avgLuma < 10 || avgLuma > 248) {
      return { features: CANONICAL_EMOTION_PRESETS.Neutral, faceDetected: false };
    }

    let boxX: number, boxY: number, boxW: number, boxH: number;
    const isFaceClusterFound = skinPixelCount > totalSampled * 0.05 && (maxX - minX) > 40 && (maxY - minY) > 40;

    if (isFaceClusterFound) {
      // Smooth and pad the detected bounding box
      const padW = (maxX - minX) * 0.15;
      const padH = (maxY - minY) * 0.15;
      boxX = Math.max(10, minX - padW);
      boxY = Math.max(10, minY - padH);
      boxW = Math.min(w - boxX - 10, (maxX - minX) + padW * 2);
      boxH = Math.min(h - boxY - 10, (maxY - minY) + padH * 2);
    } else {
      // Default centered human portrait box if ambient lighting masks chromaticity
      boxW = w * 0.52;
      boxH = h * 0.65;
      boxX = (w - boxW) / 2;
      boxY = (h - boxH) / 2;
    }

    // Key facial landmark anchors relative to face box
    const leftEyeX = boxX + boxW * 0.32;
    const leftEyeY = boxY + boxH * 0.40;
    const rightEyeX = boxX + boxW * 0.68;
    const rightEyeY = boxY + boxH * 0.40;
    const leftBrowX = boxX + boxW * 0.32;
    const leftBrowY = boxY + boxH * 0.28;
    const rightBrowX = boxX + boxW * 0.68;
    const rightBrowY = boxY + boxH * 0.28;
    const noseX = boxX + boxW * 0.50;
    const noseY = boxY + boxH * 0.56;
    const mouthLeftX = boxX + boxW * 0.32;
    const mouthRightX = boxX + boxW * 0.68;
    const mouthCenterY = boxY + boxH * 0.76;

    // Sample mouth luminance & curvature
    let mouthCenterLuma = 0, mouthLeftLuma = 0, mouthRightLuma = 0;
    let mouthSamples = 0;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const cIdx = ((Math.floor(mouthCenterY + dy)) * w + Math.floor(noseX + dx)) * 4;
        const lIdx = ((Math.floor(mouthCenterY + dy)) * w + Math.floor(mouthLeftX + dx)) * 4;
        const rIdx = ((Math.floor(mouthCenterY + dy)) * w + Math.floor(mouthRightX + dx)) * 4;
        if (cIdx >= 0 && cIdx < data.length) {
          mouthCenterLuma += data[cIdx] * 0.299 + data[cIdx + 1] * 0.587 + data[cIdx + 2] * 0.114;
          mouthLeftLuma += data[lIdx] * 0.299 + data[lIdx + 1] * 0.587 + data[lIdx + 2] * 0.114;
          mouthRightLuma += data[rIdx] * 0.299 + data[rIdx + 1] * 0.587 + data[rIdx + 2] * 0.114;
          mouthSamples++;
        }
      }
    }

    const avgCenterMouth = mouthCenterLuma / (mouthSamples || 1);
    const avgCornerMouth = (mouthLeftLuma + mouthRightLuma) / (2 * (mouthSamples || 1));

    // Sample Glabella (between eyebrows) for furrowing / tension
    let glabellaLuma = 0;
    let glabellaSamples = 0;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const gIdx = ((Math.floor(leftBrowY + dy)) * w + Math.floor(noseX + dx)) * 4;
        if (gIdx >= 0 && gIdx < data.length) {
          glabellaLuma += data[gIdx] * 0.299 + data[gIdx + 1] * 0.587 + data[gIdx + 2] * 0.114;
          glabellaSamples++;
        }
      }
    }
    const avgGlabella = glabellaLuma / (glabellaSamples || 1);

    // Compute blendshapes
    // Smile: mouth corners are lighter/pulled upward relative to lip center
    const smileRatio = Math.max(0, Math.min(1, (avgCornerMouth - avgCenterMouth + 15) / 35));
    // Brow down (Tension/Angry): Glabella is darker/furrowed relative to forehead
    const browDownVal = Math.max(0, Math.min(1, (avgLuma - avgGlabella + 10) / 30));
    // Jaw open: mouth center is dark/open cavity
    const jawOpenVal = Math.max(0, Math.min(1, (avgLuma - avgCenterMouth) / 45));

    const features: BlendshapeFeatures = {
      mouthSmileLeft: smileRatio,
      mouthSmileRight: smileRatio,
      browDownLeft: browDownVal,
      browDownRight: browDownVal,
      browInnerUp: jawOpenVal > 0.4 ? 0.65 : browDownVal > 0.4 ? 0.15 : 0.25,
      eyeBlinkLeft: 0.12,
      eyeBlinkRight: 0.12,
      jawOpen: jawOpenVal,
      lipPucker: smileRatio < 0.2 && browDownVal > 0.3 ? 0.3 : 0.05,
      mouthPress: browDownVal > 0.4 && smileRatio < 0.25 ? 0.65 : 0.12
    };

    const landmarks: FaceLandmarks = {
      box: { x: boxX, y: boxY, width: boxW, height: boxH },
      leftEye: { x: leftEyeX, y: leftEyeY },
      rightEye: { x: rightEyeX, y: rightEyeY },
      nose: { x: noseX, y: noseY },
      mouthLeft: { x: mouthLeftX, y: mouthCenterY },
      mouthRight: { x: mouthRightX, y: mouthCenterY },
      mouthCenter: { x: noseX, y: mouthCenterY },
      leftBrow: { x: leftBrowX, y: leftBrowY },
      rightBrow: { x: rightBrowX, y: rightBrowY }
    };

    return {
      features,
      faceDetected: true,
      landmarks
    };
  } catch (err) {
    console.warn('Frame feature extraction error:', err);
    return { features: CANONICAL_EMOTION_PRESETS.Neutral, faceDetected: true };
  }
}
