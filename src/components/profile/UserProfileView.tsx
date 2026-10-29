// MindSync - User Profile & Account Settings
import React, { useState } from 'react';
import {
  User,
  Shield,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserProfileView: React.FC = () => {
  const { user, routine, logout, updateProfile, updateRoutine, activeSessionToken } = useAuth();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(user?.name || '');
  const [age, setAge] = useState<number>(user?.age || 22);
  const [gender, setGender] = useState(user?.gender || 'male');
  const [location, setLocation] = useState<string>(user?.location || 'Bengaluru, Karnataka');

  // Routine fields
  const [wakeTime, setWakeTime] = useState<string>(routine?.wakeUpTime || '06:30');
  const [sleepTime, setSleepTime] = useState<string>(routine?.sleepTime || '22:30');
  const [studyStart, setStudyStart] = useState<string>(routine?.studyWorkStart || '09:00');
  const [studyEnd, setStudyEnd] = useState<string>(routine?.studyWorkEnd || '17:00');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateProfile({
      name: name.trim(),
      age,
      gender: gender as any,
      location: location.trim()
    });

    updateRoutine({
      wakeUpTime: wakeTime,
      sleepTime,
      studyWorkStart: studyStart,
      studyWorkEnd: studyEnd
    });

    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {user.name}
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-semibold">
                  Active Session
                </span>
              </h2>
              <span className="text-xs text-slate-400 block">{user.email}</span>
              <span className="text-xs text-teal-400/90 block mt-0.5">
                {user.location} • Age {user.age} • {user.gender}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile and routine preferences updated successfully.</span>
          </div>
        )}
      </div>

      {/* Profile Details & Routine Configuration Form */}
      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="p-6 rounded-2xl border space-y-5"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <h3 className="text-base font-bold text-white">Edit Profile & Daily Routine</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">City / Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Age</label>
              <input
                type="number"
                min={13}
                max={100}
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider pt-3 border-t border-slate-800">
            Daily Routine Targets
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Wake-up Time</label>
              <input
                type="time"
                value={wakeTime}
                onChange={e => setWakeTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Planned Sleep Time</label>
              <input
                type="time"
                value={sleepTime}
                onChange={e => setSleepTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Study/Work Start</label>
              <input
                type="time"
                value={studyStart}
                onChange={e => setStudyStart(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Study/Work End</label>
              <input
                type="time"
                value={studyEnd}
                onChange={e => setStudyEnd(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Save Profile
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Account Details Card */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: 'var(--card-bg, #182234)',
              borderColor: 'var(--border-color, #2d3e5b)'
            }}
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" /> Account Information
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-semibold text-white">{user.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-semibold text-white">{user.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">City / Location:</span>
                <span className="font-semibold text-white">{user.location}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Age / Gender:</span>
                <span className="font-semibold text-white">
                  {user.age} years • {user.gender}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Registered On:</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Session & Security Card */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: 'var(--card-bg, #182234)',
              borderColor: 'var(--border-color, #2d3e5b)'
            }}
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Security & Session Management
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Active Session Token
                </span>
                <span className="font-mono text-teal-300 text-[11px] break-all">
                  {activeSessionToken || 'None (Guest Mode)'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Password Encryption
                </span>
                <span className="text-slate-200 text-[11px]">
                  Client-side SHA-256 with dynamic per-user salt
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Planned Sleep Schedule
                </span>
                <span className="text-slate-200 text-[11px]">
                  {routine?.sleepTime} PM – {routine?.wakeUpTime} AM (Break every {routine?.breakIntervalMin}m)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
