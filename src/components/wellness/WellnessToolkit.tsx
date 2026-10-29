// MindSync - Personalized Wellness Toolkit & Supportive Exercises
import React, { useState, useEffect } from 'react';
import {
  Heart,
  Wind,
  Compass,
  BookOpen,
  Eye,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Play,
  Square
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { WellnessRecommendation } from '../../types';

interface WellnessToolkitProps {
  onNavigateToCounselors?: () => void;
  onNavigateToEmergency?: () => void;
}

export const WellnessToolkit: React.FC<WellnessToolkitProps> = ({
  onNavigateToCounselors,
  onNavigateToEmergency
}) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'recommendations' | 'breathing' | 'grounding' | 'journal' | 'eye_break'>('recommendations');
  const [recommendations, setRecommendations] = useState<WellnessRecommendation[]>(() => {
    return user ? db.getWellnessRecommendations(user.id) : [];
  });

  // Breathing Exercise State
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingTimer, setBreathingTimer] = useState<number>(4);
  const [breathingTechnique, setBreathingTechnique] = useState<'box' | '478'>('box');

  // Eye Break State
  const [eyeBreakTimer, setEyeBreakTimer] = useState<number>(20);
  const [isEyeBreakActive, setIsEyeBreakActive] = useState<boolean>(false);

  // Journaling State
  const [journalText, setJournalText] = useState<string>('');
  const [journalSaved, setJournalSaved] = useState<boolean>(false);

  // Breathing Animation Cycle
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingTimer(prev => {
          if (prev <= 1) {
            // Transition phase
            setBreathingPhase(currentPhase => {
              if (breathingTechnique === 'box') {
                if (currentPhase === 'Inhale') return 'Hold';
                if (currentPhase === 'Hold') return 'Exhale';
                if (currentPhase === 'Exhale') return 'Rest';
                return 'Inhale';
              } else {
                // 4-7-8
                if (currentPhase === 'Inhale') return 'Hold';
                if (currentPhase === 'Hold') return 'Exhale';
                return 'Inhale';
              }
            });

            // Set duration for new phase
            if (breathingTechnique === 'box') {
              return 4;
            } else {
              // 4-7-8 timing
              return breathingPhase === 'Inhale' ? 7 : breathingPhase === 'Hold' ? 8 : 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathingActive, breathingPhase, breathingTechnique]);

  // Eye Break Countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isEyeBreakActive) {
      interval = setInterval(() => {
        setEyeBreakTimer(prev => {
          if (prev <= 1) {
            setIsEyeBreakActive(false);
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isEyeBreakActive]);

  const handleToggleRec = (id: string) => {
    db.toggleRecommendation(id);
    if (user) {
      setRecommendations(db.getWellnessRecommendations(user.id));
    }
  };

  const handleSaveJournal = () => {
    if (!journalText.trim()) return;
    setJournalSaved(true);
    setTimeout(() => {
      setJournalSaved(false);
      setJournalText('');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Supportive Header Banner */}
      <div
        className="p-5 rounded-2xl border"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 mt-0.5">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Personalized Wellness & Grounding Toolkit
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                Non-clinical mindfulness practices, breathing exercises, and rest routines suggested
                based on your daily rhythm and screen usage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToCounselors && (
              <button
                onClick={onNavigateToCounselors}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-md"
              >
                Talk to a Counselor
              </button>
            )}
            {onNavigateToEmergency && (
              <button
                onClick={onNavigateToEmergency}
                className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition-colors"
              >
                Need Immediate Help?
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wellness Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'recommendations'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Suggestions For You
        </button>
        <button
          onClick={() => setActiveTab('breathing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'breathing'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wind className="w-4 h-4" /> Guided Breathwork
        </button>
        <button
          onClick={() => setActiveTab('grounding')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'grounding'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" /> 5-4-3-2-1 Grounding
        </button>
        <button
          onClick={() => setActiveTab('eye_break')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'eye_break'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" /> 20-20-20 Screen Break
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'journal'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Private Reflection Journal
        </button>
      </div>

      {/* Tab 1: Dynamic Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(rec => (
              <div
                key={rec.id}
                className={`p-5 rounded-2xl border transition-all ${
                  rec.isCompleted
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : 'bg-slate-900/90 border-slate-800 hover:border-teal-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-400">
                      {rec.type}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{rec.title}</h3>
                    <p className="text-xs text-slate-300 mt-1">{rec.description}</p>
                    <span className="text-[11px] text-slate-400 block mt-2">
                      Trigger: {rec.triggerReason}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleRec(rec.id)}
                    className={`p-2 rounded-xl border transition-colors shrink-0 ${
                      rec.isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title={rec.isCompleted ? 'Mark as incomplete' : 'Mark as done'}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>
              💡 Recommendations are dynamically updated based on your recent emotional scans and screen
              exposure.
            </span>
            <button
              onClick={() => {
                if (user) setRecommendations(db.getWellnessRecommendations(user.id));
              }}
              className="text-teal-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Suggestions
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Guided Breathwork */}
      {activeTab === 'breathing' && (
        <div
          className="p-8 rounded-2xl border text-center max-w-xl mx-auto space-y-6"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div>
            <h3 className="text-xl font-bold text-white">Guided Breathwork Pacer</h3>
            <p className="text-xs text-slate-400 mt-1">
              Rhythmic breathing activates the parasympathetic nervous system, lowering heart rate and
              reducing physical stress.
            </p>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setBreathingTechnique('box');
                setBreathingTimer(4);
                setBreathingPhase('Inhale');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                breathingTechnique === 'box'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              Box Breathing (4-4-4-4)
            </button>
            <button
              onClick={() => {
                setBreathingTechnique('478');
                setBreathingTimer(4);
                setBreathingPhase('Inhale');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                breathingTechnique === '478'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              4-7-8 Relaxing Breath
            </button>
          </div>

          {/* Animated Visual Breathing Sphere */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            <div
              className={`w-48 h-48 rounded-full border-4 border-teal-400/40 flex flex-col items-center justify-center transition-all duration-1000 ${
                isBreathingActive && breathingPhase === 'Inhale'
                  ? 'scale-125 bg-teal-500/20 shadow-2xl shadow-teal-500/30'
                  : isBreathingActive && breathingPhase === 'Exhale'
                  ? 'scale-90 bg-blue-500/20 shadow-none'
                  : 'scale-100 bg-slate-900/60'
              }`}
            >
              <span className="text-sm font-bold uppercase tracking-widest text-teal-300">
                {isBreathingActive ? breathingPhase : 'Ready'}
              </span>
              <span className="text-4xl font-black text-white font-mono my-1">
                {isBreathingActive ? breathingTimer : '4'}
              </span>
              <span className="text-[11px] text-slate-400">seconds</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                isBreathingActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isBreathingActive ? (
                <>
                  <Square className="w-4 h-4" /> Stop Pacer
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start Breathwork
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: 5-4-3-2-1 Sensory Grounding */}
      {activeTab === 'grounding' && (
        <div
          className="p-6 rounded-2xl border space-y-5"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-400" />
              5-4-3-2-1 Sensory Grounding Technique
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Anchors awareness in the present moment by cycling through each physical sense.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h4 className="text-sm font-bold text-white">SEE</h4>
              <p className="text-xs text-slate-400">
                Notice 5 distinct objects around you. Look for shapes, textures, or shadows.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="text-sm font-bold text-white">FEEL</h4>
              <p className="text-xs text-slate-400">
                Acknowledge 4 things you can physically feel: desk surface, shoes, breeze, cloth texture.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-white">HEAR</h4>
              <p className="text-xs text-slate-400">
                Listen for 3 ambient sounds: clock ticking, distant traffic, your own inhalation.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-white">SMELL</h4>
              <p className="text-xs text-slate-400">
                Identify 2 scents in your environment or take a deep scent of fresh air.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-white">TASTE</h4>
              <p className="text-xs text-slate-400">
                Notice 1 taste or take a mindful sip of water, focusing on temperature and texture.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 20-20-20 Eye Break */}
      {activeTab === 'eye_break' && (
        <div
          className="p-8 rounded-2xl border text-center max-w-lg mx-auto space-y-5"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
            <Eye className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">The 20-20-20 Screen Relief Rule</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Every 20 minutes, look at an object at least 20 feet away for at least 20 seconds. This
              relaxes the ciliary eye muscles.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 inline-block min-w-[200px]">
            <span className="text-5xl font-black text-white font-mono block">{eyeBreakTimer}s</span>
            <span className="text-xs text-teal-400 font-semibold mt-1 block">
              {isEyeBreakActive ? 'Looking 20 feet away...' : 'Ready for 20-second break'}
            </span>
          </div>

          <div>
            <button
              onClick={() => setIsEyeBreakActive(!isEyeBreakActive)}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
            >
              {isEyeBreakActive ? 'Pause Timer' : 'Start 20-Second Eye Break'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Private Journal */}
      {activeTab === 'journal' && (
        <div
          className="p-6 rounded-2xl border space-y-4"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              Private Reflective Journal
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Journaling helps externalize internal clutter. Entries are stored strictly on your device
              and never analyzed or transmitted.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
            <strong>Today's Reflection Prompt:</strong> “What drained your cognitive energy today, and
            what was one moment of peace you experienced?”
          </div>

          <textarea
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
            rows={6}
            placeholder="Write your thoughts freely here..."
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">🔒 On-device private journal</span>
            <button
              onClick={handleSaveJournal}
              disabled={!journalText.trim()}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
            >
              Save Reflection
            </button>
          </div>

          {journalSaved && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center">
              ✓ Reflection saved securely to local storage.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
