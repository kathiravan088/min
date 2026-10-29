// MindSync - Comprehensive Administrative Dashboard
import React, { useEffect, useState } from 'react';
import { db } from '../../db/database';
import { useAuth } from '../../context/AuthContext';
import type {
  ScreenTimeRecord,
  BehaviorMetrics,
  MoodRecord,
  UserProfile,
  EmotionPrediction,
  Appointment
} from '../../types';
import {
  ShieldAlert,
  Users,
  Smartphone,
  Activity,
  Heart,
  Calendar,
  Camera,
  Search,
  CheckCircle,
  MapPin,
  Lock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'screentime' | 'behavior' | 'mood' | 'emotions' | 'appointments'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [screenTimes, setScreenTimes] = useState<ScreenTimeRecord[]>([]);
  const [behaviors, setBehaviors] = useState<BehaviorMetrics[]>([]);
  const [moods, setMoods] = useState<MoodRecord[]>([]);
  const [emotions, setEmotions] = useState<EmotionPrediction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const role = user.role;
    setUsersList(db.getUsersForUser(role));
    setScreenTimes(db.getScreenTimeRecordsForUser(user.id, role));
    setBehaviors(db.getBehaviorMetricsForUser(user.id, role));
    setMoods(db.getMoodRecordsForUser(user.id, role));
    setEmotions(db.getEmotionPredictionsForUser(user.id, role));
    setAppointments(db.getAppointmentsForUser(user.id, role));
  }, [user]);

  if (!user) return null;

  if (user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-300">
          This administrative control plane is restricted to system administrators with verified admin privileges.
        </p>
      </div>
    );
  }

  // Filtered datasets based on search
  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredScreenTimes = screenTimes.filter(s =>
    s.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.date.includes(searchTerm)
  );

  const filteredBehaviors = behaviors.filter(b =>
    b.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMoods = moods.filter(m =>
    m.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.manualMood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmotions = emotions.filter(e =>
    e.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.detectedEmotion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAppointments = appointments.filter(a =>
    a.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Role-Based Admin Console & Audit Log
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              MindSync Central Data Portal
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Real-time audit access across all registered user telemetry, behavioral baselines, clinical appointments, and multi-user relational records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Admin Account</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {user.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Registered Users', count: usersList.length, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Screen Logs', count: screenTimes.length, icon: Smartphone, color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { label: 'Behavior Dynamics', count: behaviors.length, icon: Activity, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Mood Logs', count: moods.length, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'FACS Predictions', count: emotions.length, icon: Camera, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Appointments', count: appointments.length, icon: Calendar, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{stat.count}</div>
            </div>
          );
        })}
      </div>

      {/* Search & Navigation Control */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
          {[
            { id: 'users', label: 'Users', icon: Users, count: usersList.length },
            { id: 'screentime', label: 'Screen Time', icon: Smartphone, count: screenTimes.length },
            { id: 'behavior', label: 'Behavior Telemetry', icon: Activity, count: behaviors.length },
            { id: 'mood', label: 'Mood History', icon: Heart, count: moods.length },
            { id: 'emotions', label: 'Camera Inferences', icon: Camera, count: emotions.length },
            { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search records, users, emails…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden shadow-xl">
        {/* 1. USERS TABLE */}
        {activeAdminTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User / Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Demographics</th>
                  <th className="px-5 py-3.5">Account ID</th>
                  <th className="px-5 py-3.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                      No registered user accounts match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                          {u.name.charAt(0)}
                        </div>
                        {u.name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-300">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {u.location || 'Bengaluru, India'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {u.age} yrs • {u.gender}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                        {u.id.substring(0, 12)}…
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. SCREEN TIME TABLE */}
        {activeAdminTab === 'screentime' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User ID</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Total Usage</th>
                  <th className="px-5 py-3.5">Night Time</th>
                  <th className="px-5 py-3.5">Unlocks</th>
                  <th className="px-5 py-3.5">Active Applications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredScreenTimes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      No screen time logs found.
                    </td>
                  </tr>
                ) : (
                  filteredScreenTimes.map(st => (
                    <tr key={st.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-200">{st.userId}</td>
                      <td className="px-5 py-3.5 text-slate-400">{st.date}</td>
                      <td className="px-5 py-3.5 font-bold text-teal-300">
                        {Math.floor(st.totalScreenTimeMin / 60)}h {st.totalScreenTimeMin % 60}m
                      </td>
                      <td className="px-5 py-3.5 text-rose-300 font-medium">
                        {st.nightScreenTimeMin} mins
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{st.unlockCount} pickups</td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {st.apps?.length || 0} apps recorded
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. BEHAVIOR DYNAMICS TABLE */}
        {activeAdminTab === 'behavior' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User ID</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Typing Cadence (WPM)</th>
                  <th className="px-5 py-3.5">Correction / Backspace</th>
                  <th className="px-5 py-3.5">Session Length</th>
                  <th className="px-5 py-3.5">Anomaly Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBehaviors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      No behavior telemetry logs found.
                    </td>
                  </tr>
                ) : (
                  filteredBehaviors.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-200">{b.userId}</td>
                      <td className="px-5 py-3.5 text-slate-400">{new Date(b.timestamp).toLocaleString()}</td>
                      <td className="px-5 py-3.5 font-bold text-violet-300">{b.typingSpeedWpm} WPM</td>
                      <td className="px-5 py-3.5 text-slate-300">{b.backspaceRatePct}%</td>
                      <td className="px-5 py-3.5 text-slate-400">{b.sessionDurationMin || 15} mins</td>
                      <td className="px-5 py-3.5">
                        {b.isAnomaly ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Fatigue Anomaly
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. MOOD HISTORY TABLE */}
        {activeAdminTab === 'mood' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User ID</th>
                  <th className="px-5 py-3.5">Recorded At</th>
                  <th className="px-5 py-3.5">Self-Reported Mood</th>
                  <th className="px-5 py-3.5">Energy Rating</th>
                  <th className="px-5 py-3.5">User Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMoods.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      No subjective mood check-ins found.
                    </td>
                  </tr>
                ) : (
                  filteredMoods.map(m => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-200">{m.userId}</td>
                      <td className="px-5 py-3.5 text-slate-400">{new Date(m.recordedAt).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {m.manualMood}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-amber-300 font-bold">
                        {'★'.repeat(m.energyLevel)}{'☆'.repeat(5 - m.energyLevel)} ({m.energyLevel}/5)
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">
                        {m.notes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. CAMERA PREDICTIONS TABLE */}
        {activeAdminTab === 'emotions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User ID</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Predicted Emotion</th>
                  <th className="px-5 py-3.5">Model Confidence</th>
                  <th className="px-5 py-3.5">User Confirmation</th>
                  <th className="px-5 py-3.5">Correction Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEmotions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      No facial expression inference logs found.
                    </td>
                  </tr>
                ) : (
                  filteredEmotions.map(e => (
                    <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-200">{e.userId}</td>
                      <td className="px-5 py-3.5 text-slate-400">{new Date(e.timestamp).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {e.detectedEmotion}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-200">{e.confidenceScore}%</td>
                      <td className="px-5 py-3.5">
                        {e.isConfirmedByUser === true ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle className="w-3 h-3" /> Confirmed
                          </span>
                        ) : e.isConfirmedByUser === false ? (
                          <span className="text-rose-400 font-semibold text-[11px]">Corrected</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Pending review</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {e.userCorrection ? `Corrected to: ${e.userCorrection}` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. APPOINTMENTS TABLE */}
        {activeAdminTab === 'appointments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User ID</th>
                  <th className="px-5 py-3.5">Healthcare Provider</th>
                  <th className="px-5 py-3.5">Date & Slot</th>
                  <th className="px-5 py-3.5">Consultation Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Booking ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      No clinical appointments booked across users.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-200">{a.userId}</td>
                      <td className="px-5 py-3.5 font-bold text-white">{a.providerName}</td>
                      <td className="px-5 py-3.5 text-slate-300">
                        {a.date} at {a.timeSlot}
                      </td>
                      <td className="px-5 py-3.5 capitalize text-slate-400">{a.consultationType}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : a.status === 'completed'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                        {a.id.substring(0, 10)}…
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
