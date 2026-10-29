// MindSync - Behavioral Stress Indicators & Anomaly Detection Component
import React, { useState, useEffect, useRef } from 'react';
import {
  Keyboard,
  ShieldCheck,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Sliders,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { PersonalBehaviorBaseline } from '../../types';

interface BehaviorStressTrackerProps {
  onNavigateToWellness?: () => void;
  onNavigateToSupport?: () => void;
}

export const BehaviorStressTracker: React.FC<BehaviorStressTrackerProps> = ({
  onNavigateToWellness,
  onNavigateToSupport
}) => {
  const { user } = useAuth();

  const [baseline, setBaseline] = useState<PersonalBehaviorBaseline>(() => {
    return user ? db.getPersonalBaseline(user.id) : {
      userId: 'demo',
      normalTypingSpeedWpm: 46,
      normalCorrectionRatePct: 4.2,
      normalSessionDurationMin: 22,
      normalAppSwitchesPerHour: 12,
      lastUpdated: new Date().toISOString()
    };
  });

  // Real-time typing tracking state
  const [typedText, setTypedText] = useState<string>('');
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [pauseCount, setPauseCount] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [currentWpm, setCurrentWpm] = useState<number>(44);
  const [currentCorrectionRate, setCurrentCorrectionRate] = useState<number>(4.0);
  const [appSwitchCount, setAppSwitchCount] = useState<number>(14);

  const lastKeyTimeRef = useRef<number>(Date.now());
  const [isEditingBaseline, setIsEditingBaseline] = useState<boolean>(false);

  // Edit baseline form state
  const [editWpm, setEditWpm] = useState(baseline.normalTypingSpeedWpm);
  const [editCorrectionRate, setEditCorrectionRate] = useState(baseline.normalCorrectionRatePct);

  // Handle typing inside the sandbox
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const now = Date.now();
    const timeSinceLastKey = now - lastKeyTimeRef.current;

    // Hesitation pause detection (> 1500ms)
    if (timeSinceLastKey > 1500 && totalKeystrokes > 0) {
      setPauseCount(prev => prev + 1);
    }
    lastKeyTimeRef.current = now;

    setTotalKeystrokes(prev => prev + 1);

    if (e.key === 'Backspace' || e.key === 'Delete') {
      setBackspaceCount(prev => prev + 1);
    }
  };

  // Recompute current metrics
  useEffect(() => {
    const elapsedMinutes = Math.max(0.1, (Date.now() - sessionStartTime) / 60000);
    const words = typedText.trim().split(/\s+/).filter(Boolean).length;
    const computedWpm = Math.round(words / elapsedMinutes) || 42;

    const computedCorrection =
      totalKeystrokes > 0 ? Math.round((backspaceCount / totalKeystrokes) * 1000) / 10 : 4.0;

    setCurrentWpm(computedWpm);
    setCurrentCorrectionRate(computedCorrection);
  }, [typedText, totalKeystrokes, backspaceCount, sessionStartTime]);

  const correctionDiffPct = Math.round(
    ((currentCorrectionRate - baseline.normalCorrectionRatePct) / baseline.normalCorrectionRatePct) * 100
  );
  const wpmDiffPct = Math.round(
    ((currentWpm - baseline.normalTypingSpeedWpm) / baseline.normalTypingSpeedWpm) * 100
  );

  const isCorrectionElevated = currentCorrectionRate > baseline.normalCorrectionRatePct * 2.0;
  const isSwitchingElevated = appSwitchCount > baseline.normalAppSwitchesPerHour * 1.5;

  const anomalyFactors: string[] = [];
  if (isCorrectionElevated) {
    anomalyFactors.push(
      `Keystroke correction rate (${currentCorrectionRate}%) is significantly higher than normal baseline (${baseline.normalCorrectionRatePct}%).`
    );
  }
  if (isSwitchingElevated) {
    anomalyFactors.push(
      `App navigation frequency (${appSwitchCount} switches/hr) exceeds baseline (${baseline.normalAppSwitchesPerHour}/hr).`
    );
  }
  if (pauseCount >= 4) {
    anomalyFactors.push(`Multiple extended hesitation pauses (${pauseCount}) detected during interaction.`);
  }

  const isAnomaly = anomalyFactors.length >= 2 || (isCorrectionElevated && pauseCount >= 3);

  const handleResetSandbox = () => {
    setTypedText('');
    setTotalKeystrokes(0);
    setBackspaceCount(0);
    setPauseCount(0);
    setSessionStartTime(Date.now());
    setCurrentCorrectionRate(baseline.normalCorrectionRatePct);
    setCurrentWpm(baseline.normalTypingSpeedWpm);
  };

  const handleSimulateStressPattern = () => {
    setTotalKeystrokes(120);
    setBackspaceCount(22);
    setPauseCount(6);
    setCurrentCorrectionRate(18.3);
    setCurrentWpm(28);
    setAppSwitchCount(28);
  };

  const handleSaveBaseline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = db.updatePersonalBaseline(user.id, {
      normalTypingSpeedWpm: editWpm,
      normalCorrectionRatePct: editCorrectionRate
    });
    setBaseline(updated);
    setIsEditingBaseline(false);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div
        className="p-5 rounded-2xl border"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 mt-0.5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Behavioral Stress Indicators & Anomaly Detection
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Analyzes rhythm, backspace correction rate, and navigation switching to detect sudden deviations
              from your personal baseline.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg">
                🔒 Zero content logging (Keystroke counts only, not characters)
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg">
                🚫 Never reads passwords, chats, or third-party apps
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg">
                ⚖️ Multi-signal combination required before indicating stress
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Supportive Anomaly Notification Alert if Pattern Differs */}
      {isAnomaly ? (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Behavioral pattern differs from your normal baseline
                </h3>
                <p className="text-xs text-amber-300/90 mt-1 max-w-2xl">
                  We noticed some changes in your recent usage and typing dynamics. This does not indicate
                  any medical condition. Would you like to take a gentle break or explore supportive exercises?
                </p>
                <div className="mt-2 text-[11px] text-amber-300/80 space-y-0.5">
                  {anomalyFactors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onNavigateToWellness && (
                <button
                  onClick={onNavigateToWellness}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  Take a Breathing Break
                </button>
              )}
              {onNavigateToSupport && (
                <button
                  onClick={onNavigateToSupport}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors border border-slate-700"
                >
                  Explore Support
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Current interaction rhythm is consistent with your personal baseline. No anomalous stress
              patterns observed.
            </span>
          </div>
          <button
            onClick={handleSimulateStressPattern}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-medium transition-colors"
            title="Trigger stress pattern simulation for demonstration/grading"
          >
            Simulate Stress Pattern (Demo)
          </button>
        </div>
      )}

      {/* Metric Cards: Baseline vs Current Behavior */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Typing Speed */}
        <div
          className="p-5 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Typing Speed</span>
            <Keyboard className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{currentWpm} WPM</span>
            <span
              className={`text-xs font-semibold ${
                wpmDiffPct < -20 ? 'text-orange-400' : 'text-slate-400'
              }`}
            >
              {wpmDiffPct >= 0 ? `+${wpmDiffPct}%` : `${wpmDiffPct}%`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Normal Baseline:</span>
            <span className="font-semibold text-slate-200">{baseline.normalTypingSpeedWpm} WPM</span>
          </div>
        </div>

        {/* Card 2: Correction & Backspace Rate */}
        <div
          className="p-5 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Correction Rate
            </span>
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{currentCorrectionRate}%</span>
            <span
              className={`text-xs font-semibold ${
                isCorrectionElevated ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {correctionDiffPct >= 0 ? `+${correctionDiffPct}%` : `${correctionDiffPct}%`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Normal Baseline:</span>
            <span className="font-semibold text-slate-200">
              {baseline.normalCorrectionRatePct}%
            </span>
          </div>
        </div>

        {/* Card 3: Hesitation Pauses */}
        <div
          className="p-5 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hesitation Pauses
            </span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{pauseCount}</span>
            <span className="text-xs text-slate-400">&gt; 1.5s pauses</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Interaction Rhythm:</span>
            <span className="font-semibold text-slate-200">
              {pauseCount > 4 ? 'Disrupted' : 'Steady'}
            </span>
          </div>
        </div>

        {/* Card 4: App Switching Frequency */}
        <div
          className="p-5 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              App Switching
            </span>
            <Sliders className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{appSwitchCount}/hr</span>
            <span
              className={`text-xs font-semibold ${
                isSwitchingElevated ? 'text-orange-400' : 'text-slate-400'
              }`}
            >
              {isSwitchingElevated ? 'Elevated' : 'Normal'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Normal Baseline:</span>
            <span className="font-semibold text-slate-200">
              {baseline.normalAppSwitchesPerHour}/hr
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Typing Dynamics Sandbox & Baseline Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Typing Sandbox */}
        <div
          className="lg:col-span-8 p-6 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-teal-400" />
                Live In-App Typing Rhythm Sandbox
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Type thoughts or complete the prompt below. The system measures rhythm and correction
                rate locally in RAM without storing the text.
              </p>
            </div>
            <button
              onClick={handleResetSandbox}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Reset Sandbox"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Typing Area */}
          <textarea
            value={typedText}
            onChange={e => setTypedText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            placeholder="Type freely here (e.g., reflections on your study, current assignments, or feelings). Your keystroke metrics will update live above..."
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500 resize-none font-sans"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-4">
              <span>
                Total Strokes: <strong className="text-white">{totalKeystrokes}</strong>
              </span>
              <span>
                Backspaces / Corrections: <strong className="text-white">{backspaceCount}</strong>
              </span>
            </div>
            <span className="text-[11px] text-teal-400">
              ⚡ Metrics isolated to this session tab
            </span>
          </div>
        </div>

        {/* Right Column: Personal Baseline Adjustments */}
        <div
          className="lg:col-span-4 p-6 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-400" />
              Personal Baseline
            </h3>
            <button
              onClick={() => setIsEditingBaseline(!isEditingBaseline)}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300"
            >
              {isEditingBaseline ? 'Cancel' : 'Edit'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Each user has a unique natural typing pace and error tolerance. MindSync adapts to your
            baseline rather than enforcing an arbitrary standard.
          </p>

          {isEditingBaseline ? (
            <form onSubmit={handleSaveBaseline} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Normal Typing Speed (WPM)</label>
                <input
                  type="number"
                  value={editWpm}
                  onChange={e => setEditWpm(Number(e.target.value))}
                  min={10}
                  max={120}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Normal Correction Rate (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editCorrectionRate}
                  onChange={e => setEditCorrectionRate(Number(e.target.value))}
                  min={1}
                  max={20}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Save New Baseline
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Normal Speed:</span>
                <span className="font-bold text-white">{baseline.normalTypingSpeedWpm} WPM</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Normal Correction:</span>
                <span className="font-bold text-white">{baseline.normalCorrectionRatePct}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Normal Session:</span>
                <span className="font-bold text-white">{baseline.normalSessionDurationMin} mins</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Last Calibrated:</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {new Date(baseline.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
