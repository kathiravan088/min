// MindSync – Dashboard Overview (FreeDash-style layout)
import React, { useState } from 'react';
import {
  Activity,
  Smile,
  Smartphone,
  Clock,
  TrendingUp,
  Calendar,
  Video,
  Wind,
  PhoneCall,
  ChevronRight,
  Camera,
  Keyboard,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { EmotionPrediction, ScreenTimeRecord } from '../../types';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, routine } = useAuth();

  const [predictions] = useState<EmotionPrediction[]>(() =>
    user ? db.getEmotionPredictions(user.id) : []
  );
  const [todayScreenTime] = useState<ScreenTimeRecord>(() =>
    user
      ? db.getTodayScreenTime(user.id)
      : {
          id: 'd_st',
          userId: 'demo',
          date: new Date().toISOString().split('T')[0],
          totalScreenTimeMin: 345,
          nightScreenTimeMin: 30,
          unlockCount: 65,
          apps: [],
        }
  );

  const latestPrediction = predictions[0] ?? { detectedEmotion: 'Neutral', confidenceScore: 78 };
  const totalScreenHours = Math.floor(todayScreenTime.totalScreenTimeMin / 60);
  const totalScreenMins  = todayScreenTime.totalScreenTimeMin % 60;

  const greetHour = new Date().getHours();
  const greeting  = greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening';

  const weekBars = [
    { day: 'Mon', pos: 60, neu: 30, tns: 10 },
    { day: 'Tue', pos: 55, neu: 35, tns: 10 },
    { day: 'Wed', pos: 45, neu: 35, tns: 20 },
    { day: 'Thu', pos: 70, neu: 20, tns: 10 },
    { day: 'Fri', pos: 65, neu: 25, tns: 10 },
    { day: 'Sat', pos: 80, neu: 15, tns:  5 },
    { day: 'Sun', pos: 75, neu: 20, tns:  5 },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="ms-welcome-banner">
        <div>
          <div className="ms-welcome-label">Personalized Wellness Companion</div>
          <h1 className="ms-welcome-title">
            {greeting}, {user?.name || 'Aarav'} 👋
          </h1>
          <p className="ms-welcome-desc">
            MindSync integrates camera expression estimation, typing dynamics, and device screen time
            to support your mental equilibrium today.
          </p>
        </div>
        <div className="ms-welcome-actions">
          <button className="ms-btn-primary" onClick={() => onNavigate('mood')}>
            <Camera size={14} /> Start Camera Check
          </button>
          <button className="ms-btn-secondary" onClick={() => onNavigate('wellness')}>
            <Wind size={14} /> Breathing Break
          </button>
        </div>
      </div>

      {/* Section heading */}
      <div className="ms-section-heading">
        <Activity size={13} style={{ color: '#2dd4bf' }} />
        Today's Telemetry Overview
      </div>

      {/* Stat Cards */}
      <div className="ms-stat-grid">
        {/* Card 1 – Emotional State */}
        <div className="ms-stat-card" onClick={() => onNavigate('mood')} role="button" tabIndex={0}>
          <div className="ms-stat-card-header">
            <span className="ms-stat-label">Emotional State</span>
            <div className="ms-stat-icon" style={{ background: 'rgba(20,184,166,0.12)' }}>
              <Smile size={16} style={{ color: '#2dd4bf' }} />
            </div>
          </div>
          <div className="ms-stat-value">{latestPrediction.detectedEmotion}</div>
          <div className="ms-stat-sub" style={{ color: '#2dd4bf' }}>
            {latestPrediction.confidenceScore}% confidence
          </div>
          <div className="ms-stat-footer">
            <span>FACS Geometry Model</span>
            <ChevronRight size={13} style={{ color: '#64748b' }} />
          </div>
        </div>

        {/* Card 2 – Screen Time */}
        <div className="ms-stat-card" onClick={() => onNavigate('screentime')} role="button" tabIndex={0}>
          <div className="ms-stat-card-header">
            <span className="ms-stat-label">Screen Time Today</span>
            <div className="ms-stat-icon" style={{ background: 'rgba(96,165,250,0.12)' }}>
              <Smartphone size={16} style={{ color: '#60a5fa' }} />
            </div>
          </div>
          <div className="ms-stat-value">{totalScreenHours}h {totalScreenMins}m</div>
          <div className="ms-stat-sub">Target: 5h 00m</div>
          <div className="ms-stat-footer">
            <span>{todayScreenTime.unlockCount} unlocks</span>
            <ChevronRight size={13} style={{ color: '#64748b' }} />
          </div>
        </div>

        {/* Card 3 – Behavioral Stress */}
        <div className="ms-stat-card" onClick={() => onNavigate('behavior')} role="button" tabIndex={0}>
          <div className="ms-stat-card-header">
            <span className="ms-stat-label">Behavioral Stress</span>
            <div className="ms-stat-icon" style={{ background: 'rgba(52,211,153,0.12)' }}>
              <Keyboard size={16} style={{ color: '#34d399' }} />
            </div>
          </div>
          <div className="ms-stat-value" style={{ color: '#34d399' }}>Steady</div>
          <div className="ms-stat-sub">4.1% correction rate</div>
          <div className="ms-stat-footer">
            <span>Baseline: 46 WPM</span>
            <ChevronRight size={13} style={{ color: '#64748b' }} />
          </div>
        </div>

        {/* Card 4 – Sleep Window */}
        <div className="ms-stat-card" onClick={() => onNavigate('screentime')} role="button" tabIndex={0}>
          <div className="ms-stat-card-header">
            <span className="ms-stat-label">Sleep Window</span>
            <div className="ms-stat-icon" style={{ background: 'rgba(192,132,252,0.12)' }}>
              <Clock size={16} style={{ color: '#c084fc' }} />
            </div>
          </div>
          <div className="ms-stat-value">{routine?.sleepTime ?? '22:30'}</div>
          <div className="ms-stat-sub" style={{ color: '#c084fc' }}>
            Wake: {routine?.wakeUpTime ?? '06:30'}
          </div>
          <div className="ms-stat-footer">
            <span>Quiet hours on</span>
            <ChevronRight size={13} style={{ color: '#64748b' }} />
          </div>
        </div>
      </div>

      {/* Chart + Actions */}
      <div className="ms-widget-grid" style={{ marginTop: '20px' }}>

        {/* Weekly Emotional Trend Chart */}
        <div className="ms-widget-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div>
              <div className="ms-widget-title">
                <TrendingUp size={16} style={{ color: '#2dd4bf' }} />
                Weekly Emotional Equilibrium
              </div>
              <div className="ms-widget-sub">
                Positive, neutral & tension spread over the past 7 days
              </div>
            </div>
            <button
              onClick={() => onNavigate('mood')}
              style={{ fontSize: '11px', fontWeight: 700, color: '#2dd4bf', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              Full Details →
            </button>
          </div>

          {/* Bar chart */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '10px',
            height: '130px',
            alignItems: 'flex-end',
            paddingTop: '12px',
            borderBottom: '1px solid var(--border-color,#1e2e4c)',
            marginBottom: '12px',
          }}>
            {weekBars.map(({ day, pos, neu, tns }) => (
              <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', maxWidth: '28px', borderRadius: '5px', overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse', height: '100%', background: 'var(--bg-secondary,#0f172a)' }}>
                  <div style={{ height: `${pos}%`, background: 'rgba(52,211,153,0.75)' }} />
                  <div style={{ height: `${neu}%`, background: 'rgba(100,116,139,0.6)' }} />
                  <div style={{ height: `${tns}%`, background: 'rgba(251,146,60,0.75)' }} />
                </div>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginTop: '5px' }}>{day}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              Positive (64% avg)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b', display: 'inline-block' }} />
              Neutral (26% avg)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fb923c', display: 'inline-block' }} />
              Tension (10% avg)
            </span>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="ms-widget-card">
          <div className="ms-widget-title">
            <Heart size={16} style={{ color: '#2dd4bf' }} />
            Quick Wellness Actions
          </div>
          <div className="ms-widget-sub">Navigate to key features instantly</div>

          <div
            className="ms-action-row"
            onClick={() => onNavigate('providers')}
            role="button" tabIndex={0}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="ms-action-icon" style={{ background: 'rgba(20,184,166,0.12)' }}>
                <Calendar size={15} style={{ color: '#2dd4bf' }} />
              </div>
              <div>
                <div className="ms-action-title">Find Counselor & Book</div>
                <div className="ms-action-sub">Verified psychologists & therapists</div>
              </div>
            </div>
            <ChevronRight size={14} style={{ color: '#64748b', flexShrink: 0 }} />
          </div>

          <div
            className="ms-action-row"
            onClick={() => onNavigate('wellness')}
            role="button" tabIndex={0}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="ms-action-icon" style={{ background: 'rgba(52,211,153,0.12)' }}>
                <Wind size={15} style={{ color: '#34d399' }} />
              </div>
              <div>
                <div className="ms-action-title">Box Breathing Pacer</div>
                <div className="ms-action-sub">4-4-4-4 cycle to calm instantly</div>
              </div>
            </div>
            <ChevronRight size={14} style={{ color: '#64748b', flexShrink: 0 }} />
          </div>

          <div
            className="ms-action-row"
            onClick={() => onNavigate('appointments')}
            role="button" tabIndex={0}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="ms-action-icon" style={{ background: 'rgba(96,165,250,0.12)' }}>
                <Video size={15} style={{ color: '#60a5fa' }} />
              </div>
              <div>
                <div className="ms-action-title">My Appointments & Video</div>
                <div className="ms-action-sub">Join or reschedule sessions</div>
              </div>
            </div>
            <ChevronRight size={14} style={{ color: '#64748b', flexShrink: 0 }} />
          </div>

          <div
            className="ms-action-row danger"
            onClick={() => onNavigate('emergency')}
            role="button" tabIndex={0}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="ms-action-icon" style={{ background: 'rgba(244,63,94,0.15)' }}>
                <PhoneCall size={15} style={{ color: '#fb7185' }} />
              </div>
              <div>
                <div className="ms-action-title" style={{ color: '#fda4af' }}>
                  Need Help Now? 24/7 Lines
                </div>
                <div className="ms-action-sub">KIRAN 1800-599-0019 · NIMHANS 080-46110007</div>
              </div>
            </div>
            <ChevronRight size={14} style={{ color: '#fb7185', flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </div>
  );
};
