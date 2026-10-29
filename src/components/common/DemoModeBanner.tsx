// MindSync - Academic Demo Mode Banner & Presets Generator
import React from 'react';
import { X, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { generateUUID } from '../../utils/crypto';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, setDemoMode, user } = useAuth();

  if (!isDemoMode) return null;

  const handleInjectHighStressPreset = () => {
    if (!user) return;

    // Inject high stress emotional scans
    db.addEmotionPrediction({
      id: generateUUID(),
      userId: user.id,
      timestamp: new Date().toISOString(),
      detectedEmotion: 'Stressed/Tense',
      confidenceScore: 84,
      blendshapes: {
        mouthSmileLeft: 0.02,
        mouthSmileRight: 0.02,
        browDownLeft: 0.75,
        browDownRight: 0.72,
        browInnerUp: 0.5,
        eyeBlinkLeft: 0.2,
        eyeBlinkRight: 0.2,
        jawOpen: 0.08,
        lipPucker: 0.3,
        mouthPress: 0.85
      }
    });

    // Inject high screen time
    db.saveScreenTimeRecord({
      id: generateUUID(),
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
      totalScreenTimeMin: 455, // 7h 35m
      nightScreenTimeMin: 70,
      unlockCount: 88,
      apps: [
        { id: '1', appName: 'Study IDE', category: 'Study & Work', durationMin: 220, lastOpened: '10 mins ago' },
        { id: '2', appName: 'Social Media', category: 'Social Media', durationMin: 120, lastOpened: '30 mins ago' },
        { id: '3', appName: 'Browser', category: 'Productivity', durationMin: 85, lastOpened: '1 hour ago' },
        { id: '4', appName: 'MindSync', category: 'Wellness & Utilities', durationMin: 30, lastOpened: 'Just now' }
      ]
    });

    alert('High Stress Anomaly preset injected into active user session! Check Dashboard & Behavior tabs.');
    window.location.reload();
  };

  const handleInjectLateNightPreset = () => {
    if (!user) return;

    db.saveScreenTimeRecord({
      id: generateUUID(),
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
      totalScreenTimeMin: 490, // 8h 10m
      nightScreenTimeMin: 140, // High late night
      unlockCount: 95,
      apps: [
        { id: '1', appName: 'Video Streaming', category: 'Entertainment', durationMin: 240, lastOpened: 'Just now' },
        { id: '2', appName: 'Messaging & Social', category: 'Social Media', durationMin: 160, lastOpened: '10 mins ago' },
        { id: '3', appName: 'MindSync', category: 'Wellness & Utilities', durationMin: 90, lastOpened: 'Just now' }
      ]
    });

    alert('Late-Night Sleep Window Violation preset injected! Check Screen Time tab.');
    window.location.reload();
  };

  return (
    <aside
      aria-label="Demo mode control banner"
      className="bg-gradient-to-r from-amber-600/30 via-slate-900 to-teal-900/40 border-b border-amber-500/40 px-4 py-2.5 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
    >
      <div className="flex items-center gap-2.5">
        <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-wider shrink-0">
          Demo Mode Active
        </span>
        <span className="text-amber-100 font-medium">
          Simulated Academic Telemetry loaded for college project evaluation. All doctor profiles & telemetry
          are labeled as <strong>Simulated Demo Data</strong>.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInjectHighStressPreset}
          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1"
        >
          <Play className="w-3 h-3" /> Preset: High Stress Anomaly
        </button>

        <button
          onClick={handleInjectLateNightPreset}
          className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1"
        >
          <Play className="w-3 h-3" /> Preset: Night-Owl Violation
        </button>

        <button
          onClick={() => setDemoMode(false)}
          className="p-1 text-amber-400 hover:text-white rounded transition-colors"
          title="Turn off demo mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
