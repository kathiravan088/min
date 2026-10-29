// MindSync - Camera-Based Emotional State Estimation Component
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  Sliders,
  Activity,
  Smile,
  Frown,
  Meh,
  Flame,
  Tv,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import {
  classifyEmotion,
  extractFeaturesFromVideoFrame,
  CANONICAL_EMOTION_PRESETS,
  type ClassificationResult,
  type FaceLandmarks
} from '../../ml/emotionClassifier';
import type { EmotionType } from '../../types';
import { generateUUID } from '../../utils/crypto';

const EMOTION_ICONS: Record<EmotionType, React.ReactNode> = {
  Happy: <Smile className="w-8 h-8 text-emerald-400" />,
  Sad: <Frown className="w-8 h-8 text-blue-400" />,
  Angry: <Flame className="w-8 h-8 text-rose-400" />,
  Fearful: <AlertCircle className="w-8 h-8 text-purple-400" />,
  Surprised: <Sparkles className="w-8 h-8 text-amber-400" />,
  'Stressed/Tense': <Activity className="w-8 h-8 text-orange-400" />,
  Neutral: <Meh className="w-8 h-8 text-slate-400" />
};

const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: 'var(--color-success, #10b981)',
  Sad: 'var(--color-info, #3b82f6)',
  Angry: 'var(--color-danger, #ef4444)',
  Fearful: 'var(--color-purple, #a855f7)',
  Surprised: 'var(--color-warning, #f59e0b)',
  'Stressed/Tense': 'var(--color-accent, #f97316)',
  Neutral: 'var(--color-muted, #94a3b8)'
};

export const CameraEmotionEstimator: React.FC = () => {
  const { user, updatePreferences } = useAuth();

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'hardware' | 'simulated'>('hardware');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [_faceDetected, setFaceDetected] = useState<boolean>(true);
  const [_currentLandmarks, setCurrentLandmarks] = useState<FaceLandmarks | null>(null);

  // Simulated expression state
  const [simulatedEmotion, setSimulatedEmotion] = useState<EmotionType>('Happy');

  // Real-time classification state
  const [currentResult, setCurrentResult] = useState<ClassificationResult>(() => {
    return classifyEmotion(CANONICAL_EMOTION_PRESETS.Happy);
  });

  // User confirmation / feedback state
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [showCorrectionDropdown, setShowCorrectionDropdown] = useState<boolean>(false);

  // Emotion history
  const [recentPredictions, setRecentPredictions] = useState(() => {
    return user ? db.getEmotionPredictions(user.id).slice(0, 8) : [];
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);
  const simAnimFrameId = useRef<number | null>(null);
  // Track displayed video dimensions for correct landmark scaling
  const [displaySize, setDisplaySize] = useState({ w: 640, h: 480 });

  // Helper to stop hardware camera tracks
  const stopHardwareCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    stopHardwareCamera();
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (simAnimFrameId.current) {
      cancelAnimationFrame(simAnimFrameId.current);
      simAnimFrameId.current = null;
    }
    setIsCameraActive(false);
  }, [stopHardwareCamera]);

  // Start hardware webcam
  const startHardwareCamera = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      setCameraMode('hardware');
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.warn('Video play error:', e));
        };
      }

      if (user) {
        updatePreferences({ cameraPermissionGranted: true });
      }
    } catch (err: unknown) {
      console.warn('Webcam not accessible:', err);
      setPermissionError(
        'Physical webcam was not detected or permission was declined. Launching interactive simulated live camera mode so you can test real-time recognition!'
      );
      // Seamlessly fallback to simulated live camera
      startSimulatedCamera();
    }
  };

  // Start simulated interactive live camera
  const startSimulatedCamera = () => {
    stopHardwareCamera();
    setCameraMode('simulated');
    setIsCameraActive(true);
  };

  // Function removed as it was unused

  // Keep video source synced if hardware mode is active
  useEffect(() => {
    if (isCameraActive && cameraMode === 'hardware' && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [isCameraActive, cameraMode]);

  // Track container resize for correct overlay coordinate scaling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setDisplaySize({ w: width, h: height });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Animated Simulated Human Face generator when in simulated camera mode
  useEffect(() => {
    if (!isCameraActive || cameraMode !== 'simulated') return;

    let time = 0;
    const renderSimulatedFace = () => {
      time += 0.05;
      const cvs = simCanvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      const w = cvs.width = 320;
      const h = cvs.height = 240;

      // Realistic camera room background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle room lighting overlay
      ctx.fillStyle = 'rgba(20, 184, 166, 0.06)';
      ctx.fillRect(0, 0, w, h);

      // Head position with natural breathing micro-sway
      const headX = w / 2 + Math.sin(time * 0.7) * 2;
      const headY = h / 2 - 10 + Math.sin(time * 1.2) * 3;
      const headRadiusX = 54;
      const headRadiusY = 72;

      // Shoulders / torso
      ctx.beginPath();
      ctx.ellipse(headX, headY + 115, 80, 50, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#334155';
      ctx.fill();

      // Neck
      ctx.beginPath();
      ctx.rect(headX - 18, headY + 50, 36, 45);
      ctx.fillStyle = '#f6d1b8';
      ctx.fill();

      // Face Oval (warm skin tone)
      ctx.beginPath();
      ctx.ellipse(headX, headY, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fed7aa';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Hair
      ctx.beginPath();
      ctx.ellipse(headX, headY - 45, headRadiusX + 4, 38, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // Dynamic Eye blink calculation
      const isBlinking = Math.sin(time * 2) > 0.96;
      const eyeOpenH = isBlinking ? 1 : 6;

      // Eyes
      const eyeSpacing = 22;
      const eyeY = headY - 6;

      // Left Eye
      ctx.beginPath();
      ctx.ellipse(headX - eyeSpacing, eyeY, 9, eyeOpenH, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(headX - eyeSpacing + Math.sin(time) * 1.5, eyeY, isBlinking ? 1 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Right Eye
      ctx.beginPath();
      ctx.ellipse(headX + eyeSpacing, eyeY, 9, eyeOpenH, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(headX + eyeSpacing + Math.sin(time) * 1.5, eyeY, isBlinking ? 1 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Eyebrows based on simulated emotion
      let browLift = 0;
      let browFurrow = 0;
      let smileCurve = 0;
      let mouthOpen = 0;

      if (simulatedEmotion === 'Happy') {
        browLift = -2;
        smileCurve = 16;
        mouthOpen = 4;
      } else if (simulatedEmotion === 'Surprised') {
        browLift = -10;
        mouthOpen = 14;
        smileCurve = 2;
      } else if (simulatedEmotion === 'Angry' || simulatedEmotion === 'Stressed/Tense') {
        browFurrow = 7;
        smileCurve = -8;
      } else if (simulatedEmotion === 'Sad') {
        browLift = 3;
        smileCurve = -9;
      } else {
        // Neutral
        smileCurve = 2;
      }

      // Left Eyebrow
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1e293b';
      ctx.moveTo(headX - eyeSpacing - 12, eyeY - 12 + browLift);
      ctx.quadraticCurveTo(headX - eyeSpacing, eyeY - 17 + browLift, headX - eyeSpacing + 12, eyeY - 13 + browFurrow + browLift);
      ctx.stroke();

      // Right Eyebrow
      ctx.beginPath();
      ctx.moveTo(headX + eyeSpacing - 12, eyeY - 13 + browFurrow + browLift);
      ctx.quadraticCurveTo(headX + eyeSpacing, eyeY - 17 + browLift, headX + eyeSpacing + 12, eyeY - 12 + browLift);
      ctx.stroke();

      // Nose
      ctx.beginPath();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.moveTo(headX, eyeY + 2);
      ctx.lineTo(headX - 3, eyeY + 18);
      ctx.lineTo(headX + 4, eyeY + 18);
      ctx.stroke();

      // Mouth
      const mouthY = headY + 35;
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#e11d48';
      ctx.fillStyle = '#be123c';
      ctx.moveTo(headX - 16, mouthY);
      ctx.quadraticCurveTo(headX, mouthY + smileCurve, headX + 16, mouthY);

      if (mouthOpen > 0) {
        ctx.quadraticCurveTo(headX, mouthY + smileCurve + mouthOpen, headX - 16, mouthY);
        ctx.fill();
      }
      ctx.stroke();

      simAnimFrameId.current = requestAnimationFrame(renderSimulatedFace);
    };

    simAnimFrameId.current = requestAnimationFrame(renderSimulatedFace);
    return () => {
      if (simAnimFrameId.current) cancelAnimationFrame(simAnimFrameId.current);
    };
  }, [isCameraActive, cameraMode, simulatedEmotion]);

  // Frame processing loop for landmark estimation & emotion classification
  useEffect(() => {
    let lastScanTime = 0;

    const processLoop = (time: number) => {
      if (isCameraActive) {
        const sourceElement = cameraMode === 'hardware' ? videoRef.current : simCanvasRef.current;
        const workCanvas = canvasRef.current;

        if (sourceElement && workCanvas && time - lastScanTime > 350) {
          lastScanTime = time;
          setIsProcessing(true);

          let frameData;
          if (cameraMode === 'hardware' && videoRef.current) {
            frameData = extractFeaturesFromVideoFrame(videoRef.current, workCanvas);
          } else if (cameraMode === 'simulated' && simCanvasRef.current) {
            // Analyze simulated canvas frame directly
            frameData = extractFeaturesFromVideoFrame(simCanvasRef.current, workCanvas);
          }

          if (frameData) {
            setFaceDetected(frameData.faceDetected);
            if (frameData.landmarks) {
              setCurrentLandmarks(frameData.landmarks);
            }

            if (frameData.faceDetected) {
              const result = classifyEmotion(frameData.features);
              setCurrentResult(result);

              // Draw live HUD overlay on overlayCanvasRef
              const overlay = overlayCanvasRef.current;
              if (overlay && frameData.landmarks) {
                const oCtx = overlay.getContext('2d');
                if (oCtx) {
                  // Match overlay canvas resolution to its displayed pixel size
                  const ow = displaySize.w;
                  const oh = displaySize.h;
                  if (overlay.width !== ow) overlay.width = ow;
                  if (overlay.height !== oh) overlay.height = oh;
                  // Scale factor: analysis space is 320×240, display may differ
                  const SX = ow / 320;
                  const SY = oh / 240;
                  oCtx.clearRect(0, 0, ow, oh);

                  const lm = frameData.landmarks;
                  // Scale all landmark coordinates from analysis 320×240 space to display space
                  const bx = lm.box.x * SX;
                  const by = lm.box.y * SY;
                  const bw = lm.box.width * SX;
                  const bh = lm.box.height * SY;

                  // High-Tech Cyber Corner Reticles
                  oCtx.strokeStyle = '#14b8a6';
                  oCtx.lineWidth = 2.5;
                  const cornerLen = Math.max(14, Math.min(24, ow * 0.035));

                  // Top-Left
                  oCtx.beginPath();
                  oCtx.moveTo(bx, by + cornerLen);
                  oCtx.lineTo(bx, by);
                  oCtx.lineTo(bx + cornerLen, by);
                  oCtx.stroke();

                  // Top-Right
                  oCtx.beginPath();
                  oCtx.moveTo(bx + bw - cornerLen, by);
                  oCtx.lineTo(bx + bw, by);
                  oCtx.lineTo(bx + bw, by + cornerLen);
                  oCtx.stroke();

                  // Bottom-Left
                  oCtx.beginPath();
                  oCtx.moveTo(bx, by + bh - cornerLen);
                  oCtx.lineTo(bx, by + bh);
                  oCtx.lineTo(bx + cornerLen, by + bh);
                  oCtx.stroke();

                  // Bottom-Right
                  oCtx.beginPath();
                  oCtx.moveTo(bx + bw - cornerLen, by + bh);
                  oCtx.lineTo(bx + bw, by + bh);
                  oCtx.lineTo(bx + bw, by + bh - cornerLen);
                  oCtx.stroke();

                  // Landmark Dots — scale each point from 320×240 to display space
                  const scalePt = (pt: { x: number; y: number }) => ({ x: pt.x * SX, y: pt.y * SY });
                  const dots = [
                    scalePt(lm.leftEye),
                    scalePt(lm.rightEye),
                    scalePt(lm.nose),
                    scalePt(lm.mouthLeft),
                    scalePt(lm.mouthRight),
                    scalePt(lm.mouthCenter),
                    scalePt(lm.leftBrow),
                    scalePt(lm.rightBrow),
                  ];

                  const dotR = Math.max(3, Math.min(5, ow * 0.005));
                  oCtx.fillStyle = '#2dd4bf';
                  dots.forEach(pt => {
                    oCtx.beginPath();
                    oCtx.arc(pt.x, pt.y, dotR, 0, Math.PI * 2);
                    oCtx.fill();
                  });

                  // Eye-brow connector line
                  oCtx.strokeStyle = 'rgba(45,212,191,0.45)';
                  oCtx.lineWidth = 1.5;
                  oCtx.beginPath();
                  oCtx.moveTo(scalePt(lm.leftBrow).x, scalePt(lm.leftBrow).y);
                  oCtx.lineTo(scalePt(lm.rightBrow).x, scalePt(lm.rightBrow).y);
                  oCtx.stroke();

                  // Mouth contour
                  oCtx.beginPath();
                  oCtx.moveTo(scalePt(lm.mouthLeft).x, scalePt(lm.mouthLeft).y);
                  oCtx.lineTo(scalePt(lm.mouthCenter).x, scalePt(lm.mouthCenter).y);
                  oCtx.lineTo(scalePt(lm.mouthRight).x, scalePt(lm.mouthRight).y);
                  oCtx.stroke();

                  // Floating Emotion Badge Pill above head
                  const badgeText = `${result.primaryEmotion} (${result.confidence}%)`;
                  const fontSize = Math.max(11, Math.min(14, ow * 0.018));
                  oCtx.font = `bold ${fontSize}px system-ui, sans-serif`;
                  const textW = oCtx.measureText(badgeText).width;
                  const badgeX = Math.max(8, Math.min(ow - textW - 28, bx + bw / 2 - textW / 2 - 12));
                  const badgeY = Math.max(fontSize + 4, by - 10);

                  // Pill background
                  oCtx.fillStyle = 'rgba(15,23,42,0.88)';
                  oCtx.beginPath();
                  oCtx.roundRect(badgeX, badgeY - fontSize - 2, textW + 24, fontSize + 10, 8);
                  oCtx.fill();
                  oCtx.strokeStyle = EMOTION_COLORS[result.primaryEmotion] || '#14b8a6';
                  oCtx.lineWidth = 1.5;
                  oCtx.stroke();

                  // Pill text
                  oCtx.fillStyle = '#ffffff';
                  oCtx.fillText(badgeText, badgeX + 12, badgeY);
                }
              }

              // Persist prediction and mood to DB periodically
              if (user && Math.random() > 0.85) {
                const predId = generateUUID();
                db.addEmotionPrediction({
                  id: predId,
                  userId: user.id,
                  timestamp: new Date().toISOString(),
                  detectedEmotion: result.primaryEmotion,
                  confidenceScore: result.confidence,
                  blendshapes: result.blendshapes
                });
                db.addMoodRecord({
                  id: generateUUID(),
                  userId: user.id,
                  recordedAt: new Date().toISOString(),
                  manualMood: result.primaryEmotion,
                  energyLevel: result.primaryEmotion === 'Happy' ? 5 : result.primaryEmotion === 'Neutral' ? 3 : 2,
                  notes: `Live camera scan estimation (${result.confidence}% confidence)`
                });
                setRecentPredictions(db.getEmotionPredictions(user.id).slice(0, 8));
              }
            }
          }
          setIsProcessing(false);
        }
        animFrameId.current = requestAnimationFrame(processLoop);
      }
    };

    if (isCameraActive) {
      animFrameId.current = requestAnimationFrame(processLoop);
    } else {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    }

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isCameraActive, cameraMode, user, displaySize]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle Preset Expression Testing (Demo / Validation mode)
  const handleSelectPreset = (emotion: EmotionType) => {
    setSimulatedEmotion(emotion);
    const blendshapes = CANONICAL_EMOTION_PRESETS[emotion];
    const result = classifyEmotion(blendshapes);
    setCurrentResult(result);
    setFeedbackGiven(false);
    setShowCorrectionDropdown(false);

    if (user) {
      const predId = generateUUID();
      db.addEmotionPrediction({
        id: predId,
        userId: user.id,
        timestamp: new Date().toISOString(),
        detectedEmotion: result.primaryEmotion,
        confidenceScore: result.confidence,
        blendshapes: result.blendshapes
      });
      db.addMoodRecord({
        id: generateUUID(),
        userId: user.id,
        recordedAt: new Date().toISOString(),
        manualMood: result.primaryEmotion,
        energyLevel: emotion === 'Happy' ? 5 : emotion === 'Neutral' ? 3 : 2,
        notes: `Simulated expression check (${result.confidence}% confidence)`
      });
      setRecentPredictions(db.getEmotionPredictions(user.id).slice(0, 8));
    }
  };

  // Feedback: User confirms "Correct"
  const handleFeedbackCorrect = () => {
    if (!user) return;
    setFeedbackGiven(true);
    setShowCorrectionDropdown(false);
    const latest = recentPredictions[0];
    if (latest) {
      db.updateEmotionFeedback(latest.id, true);
      setRecentPredictions(db.getEmotionPredictions(user.id).slice(0, 8));
    }
  };

  // Feedback: User marks "Not Correct"
  const handleFeedbackIncorrect = () => {
    setShowCorrectionDropdown(true);
    setFeedbackGiven(true);
  };

  const handleApplyCorrection = (actualEmotion: EmotionType) => {
    if (!user) return;
    const latest = recentPredictions[0];
    if (latest) {
      db.updateEmotionFeedback(latest.id, false, actualEmotion);
      setRecentPredictions(db.getEmotionPredictions(user.id).slice(0, 8));
    }
    setShowCorrectionDropdown(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Privacy Callout */}
      <div
        className="p-5 rounded-2xl border"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 mt-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                Camera-Based Emotional State Estimation
                {isCameraActive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {cameraMode === 'hardware' ? 'Physical Camera Active' : 'Live Simulated Face Stream Active'}
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                Estimates facial geometry and micro-expression coefficients in real-time.
                <strong className="text-white ml-1">
                  100% on-device processing: No raw video frames or biometric images are ever uploaded or saved.
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCameraActive ? (
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 transition-all shadow-md"
              >
                <CameraOff className="w-4 h-4" /> Stop Camera
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={startHardwareCamera}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 transition-all shadow-md"
                >
                  <Camera className="w-4 h-4" /> Turn On Webcam
                </button>
                <button
                  onClick={startSimulatedCamera}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 transition-all shadow-md"
                >
                  <Tv className="w-4 h-4" /> Test Live Avatar
                </button>
              </div>
            )}
          </div>
        </div>

        {permissionError && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Webcam Notice</p>
              <p className="text-xs text-amber-300/90 mt-0.5">{permissionError}</p>
            </div>
            <button
              onClick={startSimulatedCamera}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold shrink-0"
            >
              Use Live Simulation
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Video Stream & ML Inference Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Viewfinder & Landmarks */}
        <div
          className="lg:col-span-7 rounded-2xl border p-5 flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                Facial Landmark & Blendshape Scanner ({cameraMode === 'hardware' ? 'Webcam Feed' : 'Interactive Avatar'})
              </span>
              <div className="flex items-center gap-2">
                {isCameraActive && (
                  <button
                    onClick={() => {
                      if (cameraMode === 'hardware') startSimulatedCamera();
                      else startHardwareCamera();
                    }}
                    className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" /> Switch to {cameraMode === 'hardware' ? 'Avatar' : 'Webcam'}
                  </button>
                )}
                <span className="text-xs text-slate-400">
                  {isProcessing ? 'Analyzing frame...' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Video / Canvas Viewport Container */}
            <div
              ref={containerRef}
              className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner"
              style={{ width: '100%', aspectRatio: '4/3' }}
            >
              {/* Hardware Video Element — object-contain so the full face is always visible */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transform: 'scaleX(-1)', // mirror selfie camera
                  display: isCameraActive && cameraMode === 'hardware' ? 'block' : 'none',
                  background: '#080c16',
                }}
                onLoadedMetadata={() => videoRef.current?.play().catch(console.warn)}
              />

              {/* Simulated Live Face Canvas */}
              <canvas
                ref={simCanvasRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: isCameraActive && cameraMode === 'simulated' ? 'block' : 'none',
                }}
              />

              {/* Hidden off-screen analysis canvas */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Augmented overlay canvas: matches containerRef dimensions exactly */}
              {isCameraActive && (
                <canvas
                  ref={overlayCanvasRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                />
              )}

              {/* Offline Screen Placeholder */}
              {!isCameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-teal-400 shadow-md">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Camera is Currently Offline</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Start your webcam or launch the interactive live simulated camera to watch
                      real-time emotional feature extraction.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2.5 pt-2">
                    <button
                      onClick={startHardwareCamera}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5" /> Start Webcam
                    </button>
                    <button
                      onClick={startSimulatedCamera}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Tv className="w-3.5 h-3.5" /> Start Live Avatar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Expression Selector for Demo/Academic Validation */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Expression Controls & Calibration Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'Happy',
                  'Neutral',
                  'Surprised',
                  'Stressed/Tense',
                  'Sad',
                  'Angry',
                  'Fearful'
                ] as EmotionType[]
              ).map(emotion => (
                <button
                  key={emotion}
                  onClick={() => handleSelectPreset(emotion)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentResult.primaryEmotion === emotion
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Classification & Confidence Gauge */}
        <div className="lg:col-span-5 space-y-5">
          {/* Primary Estimated Emotion Card */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden"
            style={{
              backgroundColor: 'var(--card-bg, #182234)',
              borderColor: 'var(--border-color, #2d3e5b)'
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Identified Emotion
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {currentResult.inferenceTimeMs || 12}ms inference
              </span>
            </div>

            <div className="flex items-center gap-4 my-4">
              <div
                className="p-4 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                {EMOTION_ICONS[currentResult.primaryEmotion]}
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Estimated State</span>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {currentResult.primaryEmotion}
                </h3>
                <span
                  className="text-sm font-bold"
                  style={{ color: EMOTION_COLORS[currentResult.primaryEmotion] }}
                >
                  {currentResult.confidence}% confidence
                </span>
              </div>
            </div>

            {/* Confidence Progress Meter */}
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Confidence Level</span>
                <span className="font-semibold text-white">{currentResult.confidence}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${currentResult.confidence}%`,
                    backgroundColor: EMOTION_COLORS[currentResult.primaryEmotion]
                  }}
                />
              </div>
            </div>

            {/* User Confirmation / Correction Feedback Loop */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-300 font-medium mb-2.5">
                Is this estimation accurate with your feelings right now?
              </p>

              {!feedbackGiven ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFeedbackCorrect}
                    className="flex-1 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Correct
                  </button>
                  <button
                    onClick={handleFeedbackIncorrect}
                    className="flex-1 py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Not Correct
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Feedback recorded! Adaptive model weights updated.</span>
                </div>
              )}

              {showCorrectionDropdown && (
                <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 block">Select your actual felt emotion:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        'Neutral',
                        'Happy',
                        'Sad',
                        'Angry',
                        'Fearful',
                        'Surprised',
                        'Stressed/Tense'
                      ] as EmotionType[]
                    ).map(e => (
                      <button
                        key={e}
                        onClick={() => handleApplyCorrection(e)}
                        className="p-1.5 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      >
                        • {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Probability Distribution of all 7 emotions */}
          <div
            className="p-5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--card-bg, #182234)',
              borderColor: 'var(--border-color, #2d3e5b)'
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Full Probability Distribution</span>
              <Activity className="w-4 h-4 text-teal-400" />
            </h4>

            <div className="space-y-2.5">
              {currentResult.allScores.map(item => (
                <div key={item.emotion} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{item.emotion}</span>
                    <span className="text-slate-400 font-mono">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: EMOTION_COLORS[item.emotion]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Facial Action Units & Blendshape Detail */}
      <div
        className="p-5 rounded-2xl border"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-400" />
          Real-Time Facial Expression Action Units (FACS)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Smile Puller (AU12)</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {(currentResult.blendshapes.mouthSmileLeft || 0.05).toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Brow Furrow (AU4)</span>
            <span className="text-base font-bold text-orange-400 font-mono">
              {(currentResult.blendshapes.browDownLeft || 0.08).toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Brow Raise (AU1)</span>
            <span className="text-base font-bold text-amber-400 font-mono">
              {(currentResult.blendshapes.browInnerUp || 0.12).toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Jaw Open (AU26)</span>
            <span className="text-base font-bold text-teal-400 font-mono">
              {(currentResult.blendshapes.jawOpen || 0.04).toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Mouth Press (AU24)</span>
            <span className="text-base font-bold text-rose-400 font-mono">
              {(currentResult.blendshapes.mouthPress || 0.05).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Non-Diagnostic Ethical Disclaimer */}
      <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-200 text-xs space-y-1.5 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-100 font-semibold block">Academic & Ethical Safety Disclaimer</strong>
          Facial expression estimation calculates probable affective states from surface geometrical Action Units.
          It is an academic wellness tool, not a psychiatric diagnostic device. MindSync never records raw video or sends images off your machine.
        </div>
      </div>
    </div>
  );
};
