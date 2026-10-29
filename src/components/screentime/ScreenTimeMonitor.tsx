// MindSync - Device Screen-Time Monitoring & Routine-Aware Healthy Reminders
import React, { useState } from 'react';
import {
  Smartphone,
  Clock,
  AlertCircle,
  Bell,
  Moon,
  Sun,
  Laptop,
  Info,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { ScreenTimeRecord, ScreenTimeGoal, DailyRoutine } from '../../types';

export const ScreenTimeMonitor: React.FC = () => {
  const { user, routine, screenTimeGoal, updateRoutine, updateScreenTimeGoal } = useAuth();

  const [todayRecord] = useState<ScreenTimeRecord>(() => {
    return user ? db.getTodayScreenTime(user.id) : {
      id: 'demo_st',
      userId: 'demo',
      date: new Date().toISOString().split('T')[0],
      totalScreenTimeMin: 435, // 7h 15m
      nightScreenTimeMin: 55,
      unlockCount: 74,
      apps: [
        { id: '1', appName: 'Visual Studio Code / Study IDE', category: 'Study & Work', durationMin: 180, lastOpened: '15 mins ago' },
        { id: '2', appName: 'Research & Browser', category: 'Productivity', durationMin: 110, lastOpened: '30 mins ago' },
        { id: '3', appName: 'Social & Communication', category: 'Social Media', durationMin: 75, lastOpened: '1 hour ago' },
        { id: '4', appName: 'Video Streaming', category: 'Entertainment', durationMin: 45, lastOpened: '2 hours ago' },
        { id: '5', appName: 'MindSync Wellness', category: 'Wellness & Utilities', durationMin: 25, lastOpened: 'Just now' }
      ]
    };
  });

  const [goals, setGoals] = useState<ScreenTimeGoal>(() => {
    return screenTimeGoal || {
      userId: user?.id || 'demo',
      dailyTargetMin: 300, // 5 hours
      warningThresholdMin: 240, // 4 hours
      highUsageThresholdMin: 360 // 6 hours
    };
  });

  const [currentRoutine, setCurrentRoutine] = useState<DailyRoutine>(() => {
    return routine || {
      userId: user?.id || 'demo',
      wakeUpTime: '06:30',
      sleepTime: '22:30',
      studyWorkStart: '09:00',
      studyWorkEnd: '17:00',
      exerciseTime: '18:00',
      breakIntervalMin: 45,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00'
    };
  });

  const [isEditingGoals, setIsEditingGoals] = useState<boolean>(false);
  const [isEditingRoutine, setIsEditingRoutine] = useState<boolean>(false);

  // Form states for goals
  const [formTargetHours, setFormTargetHours] = useState(Math.round(goals.dailyTargetMin / 60));
  const [formWarningHours, setFormWarningHours] = useState(Math.round(goals.warningThresholdMin / 60));
  const [formHighHours, setFormHighHours] = useState(Math.round(goals.highUsageThresholdMin / 60));

  // Form states for routine
  const [formWakeTime, setFormWakeTime] = useState(currentRoutine.wakeUpTime);
  const [formSleepTime, setFormSleepTime] = useState(currentRoutine.sleepTime);
  const [formBreakInterval, setFormBreakInterval] = useState(currentRoutine.breakIntervalMin);

  // Normal user average for comparison
  const normalUserAverageMin = 290; // 4h 50m
  const totalHours = Math.floor(todayRecord.totalScreenTimeMin / 60);
  const totalRemainingMins = todayRecord.totalScreenTimeMin % 60;

  const normalHours = Math.floor(normalUserAverageMin / 60);
  const normalRemainingMins = normalUserAverageMin % 60;

  // Determine threshold status
  const isHighUsage = todayRecord.totalScreenTimeMin >= goals.highUsageThresholdMin;
  const isWarningUsage = todayRecord.totalScreenTimeMin >= goals.warningThresholdMin;
  const isConsiderablyHigherThanAverage = todayRecord.totalScreenTimeMin > normalUserAverageMin + 60;

  // Sleep time simulation check
  const now = new Date();
  const currentHourMinute = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [simulateNightUsage, setSimulateNightUsage] = useState<boolean>(false);

  const isWithinSleepHours =
    simulateNightUsage ||
    currentHourMinute >= currentRoutine.sleepTime ||
    currentHourMinute < currentRoutine.wakeUpTime;

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<ScreenTimeGoal> = {
      dailyTargetMin: formTargetHours * 60,
      warningThresholdMin: formWarningHours * 60,
      highUsageThresholdMin: formHighHours * 60
    };
    updateScreenTimeGoal(updated);
    setGoals(prev => ({ ...prev, ...updated }));
    setIsEditingGoals(false);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<DailyRoutine> = {
      wakeUpTime: formWakeTime,
      sleepTime: formSleepTime,
      breakIntervalMin: formBreakInterval
    };
    updateRoutine(updated);
    setCurrentRoutine(prev => ({ ...prev, ...updated }));
    setIsEditingRoutine(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
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
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Device Screen-Time Monitoring & Healthy Reminders
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                Monitors daily device usage duration, session frequency, and compares patterns against
                your planned routine. Designed around gentle, non-punitive mindfulness.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSimulateNightUsage(!simulateNightUsage)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              simulateNightUsage
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Toggle late-night routine trigger simulation for demonstration"
          >
            <Moon className="w-3.5 h-3.5 text-purple-400" />
            {simulateNightUsage ? 'Simulating Late-Night Sleep Window (ON)' : 'Simulate Late-Night Window'}
          </button>
        </div>
      </div>

      {/* Sleep Period Gentle Notification Reminder */}
      {isWithinSleepHours && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <Moon className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Rest & Sleep Window Reminder
                <span className="text-xs font-normal text-indigo-300">
                  (Planned sleep: {currentRoutine.sleepTime} - {currentRoutine.wakeUpTime})
                </span>
              </h3>
              <p className="text-xs text-indigo-200/90 mt-1 max-w-2xl">
                “It is within your planned sleep period. Consider putting the phone aside and getting
                some rest to support cognitive recovery.”
              </p>
            </div>
          </div>
          <span className="text-[11px] text-indigo-300 bg-indigo-900/50 px-3 py-1 rounded-full border border-indigo-700/50 self-start sm:self-center">
            Non-punitive reminder
          </span>
        </div>
      )}

      {/* High Usage / Pattern Deviation Alert Banner */}
      {isConsiderablyHigherThanAverage && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Usage Pattern Notice</span>
            <span>
              Your screen time today ({totalHours}h {totalRemainingMins}m) is considerably higher than your
              usual pattern ({normalHours}h {normalRemainingMins}m). Consider scheduling a short pause.
            </span>
          </div>
        </div>
      )}

      {/* Screen Time Primary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Screen Time Today
            </span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {totalHours}h {totalRemainingMins}m
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Daily Goal Target:</span>
            <span className="font-semibold text-slate-200">
              {Math.round(goals.dailyTargetMin / 60)}h 00m
            </span>
          </div>
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
              Normal User Baseline
            </span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {normalHours}h {normalRemainingMins}m
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Difference Today:</span>
            <span className="font-semibold text-orange-400">+2h 25m higher</span>
          </div>
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
              Device Unlocks / Sessions
            </span>
            <Smartphone className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{todayRecord.unlockCount}</span>
            <span className="text-xs text-slate-400">unlocks</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Avg Session:</span>
            <span className="font-semibold text-slate-200">
              {Math.round(todayRecord.totalScreenTimeMin / (todayRecord.unlockCount || 1))} mins
            </span>
          </div>
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
              Night Screen Time
            </span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {todayRecord.nightScreenTimeMin}m
            </span>
            <span className="text-xs text-indigo-400">after bedtime</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Quiet Hours Target:</span>
            <span className="font-semibold text-slate-200">0 mins</span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Threshold Warnings */}
      <div
        className="p-6 rounded-2xl border space-y-4"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white">Configurable Usage Thresholds</h3>
            <p className="text-xs text-slate-400">
              Visual gauge showing your daily target (5h), warning threshold (4h), and high threshold (6h).
            </p>
          </div>
          <button
            onClick={() => setIsEditingGoals(!isEditingGoals)}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 self-start sm:self-auto"
          >
            {isEditingGoals ? 'Cancel' : 'Edit Thresholds'}
          </button>
        </div>

        {/* Multi-Threshold Bar */}
        <div className="space-y-1.5">
          <div className="relative w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isHighUsage
                  ? 'bg-rose-500'
                  : isWarningUsage
                  ? 'bg-amber-500'
                  : 'bg-teal-500'
              }`}
              style={{
                width: `${Math.min(100, (todayRecord.totalScreenTimeMin / (goals.highUsageThresholdMin + 60)) * 100)}%`
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0h</span>
            <span>Warning ({Math.round(goals.warningThresholdMin / 60)}h)</span>
            <span>Target ({Math.round(goals.dailyTargetMin / 60)}h)</span>
            <span>High Usage ({Math.round(goals.highUsageThresholdMin / 60)}h)</span>
          </div>
        </div>

        {isEditingGoals && (
          <form onSubmit={handleSaveGoals} className="p-4 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Daily Target (Hours)</label>
              <input
                type="number"
                value={formTargetHours}
                onChange={e => setFormTargetHours(Number(e.target.value))}
                min={1}
                max={16}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Warning Threshold (Hours)</label>
              <input
                type="number"
                value={formWarningHours}
                onChange={e => setFormWarningHours(Number(e.target.value))}
                min={1}
                max={16}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">High Usage Alert (Hours)</label>
              <input
                type="number"
                value={formHighHours}
                onChange={e => setFormHighHours(Number(e.target.value))}
                min={1}
                max={16}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Update Thresholds
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Individual App Breakdown & Daily Routine Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Individual Application Usage */}
        <div
          className="lg:col-span-7 p-6 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-teal-400" />
              Application Usage Duration Breakdown
            </span>
            <span className="text-xs text-slate-400 font-normal">Today's metrics</span>
          </h3>

          <div className="space-y-4">
            {todayRecord.apps.map(app => {
              const pct = Math.round((app.durationMin / todayRecord.totalScreenTimeMin) * 100);
              const hrs = Math.floor(app.durationMin / 60);
              const mins = app.durationMin % 60;

              return (
                <div key={app.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{app.appName}</span>
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {app.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-200">
                        {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
                      </span>
                      <span className="text-slate-400 ml-1.5">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Routine Schedule & Quiet Hours */}
        <div
          className="lg:col-span-5 p-6 rounded-2xl border space-y-4"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              Daily Routine & Quiet Hours
            </h3>
            <button
              onClick={() => setIsEditingRoutine(!isEditingRoutine)}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300"
            >
              {isEditingRoutine ? 'Cancel' : 'Edit Routine'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            MindSync avoids intrusive notifications during planned sleep, study/work sessions, and quiet
            hours.
          </p>

          {isEditingRoutine ? (
            <form onSubmit={handleSaveRoutine} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Wake-up Time</label>
                <input
                  type="time"
                  value={formWakeTime}
                  onChange={e => setFormWakeTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Sleep Time</label>
                <input
                  type="time"
                  value={formSleepTime}
                  onChange={e => setFormSleepTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Break Interval (Minutes)</label>
                <input
                  type="number"
                  value={formBreakInterval}
                  onChange={e => setFormBreakInterval(Number(e.target.value))}
                  min={15}
                  max={120}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Save Daily Routine
              </button>
            </form>
          ) : (
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" /> Wake-up Time:
                </span>
                <span className="font-bold text-white">{currentRoutine.wakeUpTime} AM</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-400" /> Study / Work Hours:
                </span>
                <span className="font-bold text-white">
                  {currentRoutine.studyWorkStart} - {currentRoutine.studyWorkEnd}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" /> Sleep Bedtime:
                </span>
                <span className="font-bold text-white">{currentRoutine.sleepTime} PM</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-400" /> Healthy Break Interval:
                </span>
                <span className="font-bold text-white">Every {currentRoutine.breakIntervalMin} mins</span>
              </div>
            </div>
          )}

          {/* Android Mobile Platform Architecture Callout */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>Android Implementation Reference</span>
            </div>
            <p className="text-slate-400">
              On Android, device-level screen time utilizes <code className="text-slate-200">UsageStatsManager</code> with the user-granted{' '}
              <code className="text-slate-200">android.permission.PACKAGE_USAGE_STATS</code> permission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
