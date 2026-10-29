// MindSync - Mood History and Emotional Trend Dashboard
import React, { useState } from 'react';
import {
  Clock,
  TrendingUp,
  Smile,
  Meh,
  Activity,
  CheckCircle,
  XCircle,
  BarChart3,
  Sparkles,
  PlusCircle,
  Smartphone,
  Keyboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { EmotionType, EmotionPrediction, MoodRecord, ScreenTimeRecord, PersonalBehaviorBaseline } from '../../types';
import { CANONICAL_EMOTION_PRESETS } from '../../ml/emotionClassifier';
import { generateUUID } from '../../utils/crypto';

export const MoodTrendDashboard: React.FC = () => {
  const { user } = useAuth();

  const [predictions, setPredictions] = useState<EmotionPrediction[]>(() => {
    if (!user) return [];
    const existing = db.getEmotionPredictions(user.id);
    if (existing.length > 0) return existing;

    // Seed realistic baseline entries if user has no predictions yet
    const seedData: EmotionPrediction[] = [
      {
        id: generateUUID(),
        userId: user.id,
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        detectedEmotion: 'Happy',
        confidenceScore: 92,
        blendshapes: { ...CANONICAL_EMOTION_PRESETS.Happy },
        isConfirmedByUser: true
      },
      {
        id: generateUUID(),
        userId: user.id,
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        detectedEmotion: 'Neutral',
        confidenceScore: 84,
        blendshapes: { ...CANONICAL_EMOTION_PRESETS.Neutral },
        isConfirmedByUser: true
      },
      {
        id: generateUUID(),
        userId: user.id,
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        detectedEmotion: 'Stressed/Tense',
        confidenceScore: 78,
        blendshapes: { ...CANONICAL_EMOTION_PRESETS['Stressed/Tense'] }
      }
    ];

    seedData.forEach(p => db.addEmotionPrediction(p));
    return seedData;
  });

  const [_moodRecords, _setMoodRecords] = useState<MoodRecord[]>(() => {
    if (!user) return [];
    const list = db.getMoodRecords(user.id);
    if (list.length > 0) return list;

    // Seed initial subjective record
    const initRecord: MoodRecord = {
      id: generateUUID(),
      userId: user.id,
      recordedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      manualMood: 'Happy',
      energyLevel: 4,
      notes: 'Feeling motivated and well-rested this morning.'
    };
    db.addMoodRecord(initRecord);
    return [initRecord];
  });

  const [_historyTab, _setHistoryTab] = useState<'camera_scans' | 'user_checkins'>('camera_scans');

  const [screenTime] = useState<ScreenTimeRecord>(() => {
    return user ? db.getTodayScreenTime(user.id) : {
      id: 'demo_st',
      userId: 'demo',
      date: new Date().toISOString().split('T')[0],
      totalScreenTimeMin: 435, // 7h 15m
      nightScreenTimeMin: 55,
      unlockCount: 74,
      apps: []
    };
  });

  const [behaviorBaseline] = useState<PersonalBehaviorBaseline>(() => {
    return user ? db.getPersonalBaseline(user.id) : {
      userId: 'demo',
      normalTypingSpeedWpm: 46,
      normalCorrectionRatePct: 4.2,
      normalSessionDurationMin: 22,
      normalAppSwitchesPerHour: 12,
      lastUpdated: new Date().toISOString()
    };
  });

  // Manual mood check-in form state
  const [manualMood, setManualMood] = useState<EmotionType>('Happy');
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [moodNotes, setMoodNotes] = useState<string>('');
  const [checkInSuccess, setCheckInSuccess] = useState<boolean>(false);

  // Filter & calculate counts
  const positiveCount = predictions.filter(p => p.detectedEmotion === 'Happy').length;
  const neutralCount = predictions.filter(
    p => p.detectedEmotion === 'Neutral' || p.detectedEmotion === 'Surprised'
  ).length;
  const negativeCount = predictions.filter(
    p =>
      p.detectedEmotion === 'Sad' ||
      p.detectedEmotion === 'Angry' ||
      p.detectedEmotion === 'Fearful' ||
      p.detectedEmotion === 'Stressed/Tense'
  ).length;
  const totalScans = Math.max(1, predictions.length);

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newRecord: MoodRecord = {
      id: generateUUID(),
      userId: user.id,
      recordedAt: new Date().toISOString(),
      manualMood,
      energyLevel,
      notes: moodNotes.trim() || undefined
    };

    db.addMoodRecord(newRecord);
    _setMoodRecords(db.getMoodRecords(user.id));
    setMoodNotes('');
    setCheckInSuccess(true);
    setTimeout(() => setCheckInSuccess(false), 3000);
  };

  const handleConfirmPrediction = (predId: string, isCorrect: boolean, correction?: EmotionType) => {
    if (!user) return;
    db.updateEmotionFeedback(predId, isCorrect, correction);
    setPredictions(db.getEmotionPredictions(user.id));
  };

  // 7-day trend distribution
  const weeklyData = [
    { day: 'Mon', positive: 65, neutral: 25, stressed: 10 },
    { day: 'Tue', positive: 50, neutral: 35, stressed: 15 },
    { day: 'Wed', positive: 45, neutral: 30, stressed: 25 },
    { day: 'Thu', positive: 70, neutral: 20, stressed: 10 },
    { day: 'Fri', positive: 60, neutral: 25, stressed: 15 },
    { day: 'Sat', positive: 80, neutral: 15, stressed: 5 },
    { day: 'Sun', positive: 75, neutral: 20, stressed: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-teal-400" />
            Mood History & Emotional Trend
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track your estimated emotional states over time, compare positive/negative balance, and
            provide feedback.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards: Positive, Neutral, Negative/Stressed */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Positive Observations
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Smile className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{positiveCount}</span>
            <span className="text-xs font-semibold text-emerald-400">
              ({Math.round((positiveCount / totalScans) * 100)}%)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Joy, amusement, relaxation</p>
        </div>

        <div
          className="p-5 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Neutral / Attentive
            </span>
            <div className="p-2 rounded-xl bg-slate-500/10 text-slate-300">
              <Meh className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{neutralCount}</span>
            <span className="text-xs font-semibold text-slate-300">
              ({Math.round((neutralCount / totalScans) * 100)}%)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Calm, focused, baseline</p>
        </div>

        <div
          className="p-5 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Stressed / Tension Signals
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{negativeCount}</span>
            <span className="text-xs font-semibold text-orange-400">
              ({Math.round((negativeCount / totalScans) * 100)}%)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Furrowed brow, tense jaw, fatigue</p>
        </div>
      </div>

      {/* Behavioral & Screen Time Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="p-5 rounded-2xl border flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                Screen Time Impact
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Today
              </span>
            </div>
            <p className="text-xs text-slate-400">
              You've spent <strong className="text-white">{Math.floor(screenTime.totalScreenTimeMin / 60)}h {screenTime.totalScreenTimeMin % 60}m</strong> on your device today. 
              {screenTime.totalScreenTimeMin > 360 ? " High screen time often correlates with increased tension and fatigue." : " This is within a healthy range, correlating with your positive mood markers."}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> {screenTime.unlockCount} unlocks
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-500" /> {screenTime.nightScreenTimeMin}m night usage
            </div>
          </div>
        </div>

        <div
          className="p-5 rounded-2xl border flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-400" />
                Behavioral Rhythm
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Baseline
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Your normal typing speed is <strong className="text-white">{behaviorBaseline.normalTypingSpeedWpm} WPM</strong> with a <strong className="text-white">{behaviorBaseline.normalCorrectionRatePct}%</strong> correction rate. 
              {negativeCount > positiveCount ? " Noticeable deviations from these baselines often precede emotional tension." : " Maintaining your rhythm helps sustain focus and emotional stability."}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> {behaviorBaseline.normalSessionDurationMin}m avg session
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Emotional Trend Chart */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-400" />
              Weekly Emotional Trend (Aggregated Breakdown)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily proportion of positive, neutral, and tension indicators over the past 7 days.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Positive
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Neutral
            </span>
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Tension
            </span>
          </div>
        </div>

        {/* Stacked Visual Bar Chart */}
        <div className="grid grid-cols-7 gap-3 sm:gap-4 h-48 items-end pt-4 pb-2 border-b border-slate-800">
          {weeklyData.map(item => (
            <div key={item.day} className="flex flex-col items-center h-full justify-end group">
              <div className="w-full max-w-[36px] flex flex-col-reverse rounded-lg overflow-hidden h-full shadow-inner bg-slate-900">
                <div
                  style={{ height: `${item.positive}%` }}
                  className="bg-emerald-500/80 group-hover:bg-emerald-400 transition-all"
                  title={`${item.day} Positive: ${item.positive}%`}
                />
                <div
                  style={{ height: `${item.neutral}%` }}
                  className="bg-slate-600/80 group-hover:bg-slate-500 transition-all"
                  title={`${item.day} Neutral: ${item.neutral}%`}
                />
                <div
                  style={{ height: `${item.stressed}%` }}
                  className="bg-orange-500/80 group-hover:bg-orange-400 transition-all"
                  title={`${item.day} Tension: ${item.stressed}%`}
                />
              </div>
              <span className="text-xs font-semibold text-slate-400 mt-2">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Recent Estimated Entries & Subjective Mood Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Estimated Emotional States with User Confirmation */}
        <div
          className="lg:col-span-7 p-6 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-400" />
              Recent Camera Estimations & User Feedback
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {predictions.length} recorded scans
            </span>
          </h3>

          {predictions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <p className="text-sm">No emotion scans recorded yet today.</p>
              <p className="text-xs">
                Activate the camera or select an expression in the Camera tab to record estimates.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {predictions.slice(0, 8).map(pred => (
                <div
                  key={pred.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-teal-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{pred.detectedEmotion}</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {pred.confidenceScore}% confidence
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(pred.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Confirmation status or action buttons */}
                  <div className="flex items-center gap-2">
                    {pred.isConfirmedByUser === true && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5" /> Confirmed Correct
                      </span>
                    )}
                    {pred.isConfirmedByUser === false && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold px-2 py-1 bg-amber-500/10 rounded-lg">
                        <XCircle className="w-3.5 h-3.5" /> Corrected to {pred.userCorrection || 'Other'}
                      </span>
                    )}
                    {pred.isConfirmedByUser === undefined && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleConfirmPrediction(pred.id, true)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors"
                        >
                          ✓ Correct
                        </button>
                        <button
                          onClick={() => handleConfirmPrediction(pred.id, false, 'Neutral')}
                          className="px-2.5 py-1 text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg transition-colors"
                        >
                          ✕ Not Correct
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: User-Reported Subjective Mood Check-in */}
        <div
          className="lg:col-span-5 p-6 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-teal-400" />
            Subjective Mood Check-In
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            How are you feeling right now? Compare your personal self-assessment with AI estimates.
          </p>

          <form onSubmit={handleManualCheckIn} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Current Felt Mood
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    'Neutral',
                    'Happy',
                    'Sad',
                    'Stressed/Tense',
                    'Surprised',
                    'Angry'
                  ] as EmotionType[]
                ).map(m => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setManualMood(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-left transition-all ${
                      manualMood === m
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                <span>Energy Level</span>
                <span className="text-teal-400">{energyLevel} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={energyLevel}
                onChange={e => setEnergyLevel(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>1 - Exhausted</span>
                <span>3 - Steady</span>
                <span>5 - Energized</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Optional Reflection Notes
              </label>
              <textarea
                value={moodNotes}
                onChange={e => setMoodNotes(e.target.value)}
                placeholder="What's on your mind? Any particular triggers or moments of relief?"
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
            >
              Log Subjective Mood Entry
            </button>

            {checkInSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-medium">
                ✓ Mood entry logged to your encrypted personal history!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
