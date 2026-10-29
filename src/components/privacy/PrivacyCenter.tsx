// MindSync - Privacy & Permissions Center & Technical Limitations
import React, { useState } from 'react';
import {
  ShieldCheck,
  Camera,
  MapPin,
  Smartphone,
  Keyboard,
  Download,
  Trash2,
  Lock,
  FileCode,
  CheckCircle2,
  Info,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';

export const PrivacyCenter: React.FC = () => {
  const { user, preferences, updatePreferences } = useAuth();

  const [cameraPerm, setCameraPerm] = useState<boolean>(
    preferences?.cameraPermissionGranted ?? false
  );
  const [locationPerm, setLocationPerm] = useState<boolean>(
    preferences?.locationPermissionGranted ?? false
  );
  const [usagePerm, setUsagePerm] = useState<boolean>(
    preferences?.usageAccessGranted ?? true
  );
  const [behaviorPerm, setBehaviorPerm] = useState<boolean>(
    preferences?.behaviorTrackingGranted ?? true
  );

  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [sqlContent, setSqlContent] = useState<string>('');

  const handleToggleCamera = (val: boolean) => {
    setCameraPerm(val);
    updatePreferences({ cameraPermissionGranted: val });
  };

  const handleToggleLocation = (val: boolean) => {
    setLocationPerm(val);
    updatePreferences({ locationPermissionGranted: val });
  };

  const handleToggleUsage = (val: boolean) => {
    setUsagePerm(val);
    updatePreferences({ usageAccessGranted: val });
  };

  const handleToggleBehavior = (val: boolean) => {
    setBehaviorPerm(val);
    updatePreferences({ behaviorTrackingGranted: val });
  };

  // Export JSON Data
  const handleExportJSON = () => {
    if (!user) return;
    const data = db.exportAllUserData(user.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindsync_data_export_${user.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Data export generated and downloaded successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // View SQL DDL
  const handleViewSQL = () => {
    const ddl = db.generateSQLDDL();
    setSqlContent(ddl);
    setShowSqlModal(true);
  };

  // Purge All Data
  const handlePurgeData = () => {
    if (!user) return;
    if (
      window.confirm(
        'Are you sure you want to permanently purge all your stored data? This action cannot be undone.'
      )
    ) {
      db.purgeUserData(user.id);
      alert('All local database records associated with your account have been permanently erased.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
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
              Privacy & Permissions Dashboard
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              MindSync operates on a strict Privacy-by-Design foundation. You have absolute granular
              control over every sensor and telemetry signal.
            </p>
          </div>
        </div>
      </div>

      {/* Permissions Control Matrix */}
      <div
        className="p-6 rounded-2xl border space-y-5"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-teal-400" />
          Device Permissions & Sensor Access Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Camera Permission */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-bold text-white">Camera Access</span>
              </div>
              <p className="text-xs text-slate-300">
                Used strictly on-demand for micro-expression FACS landmark extraction.
              </p>
              <span className="text-[11px] text-teal-400 block font-mono">
                🔒 In-memory RAM processing only. No video recordings saved.
              </span>
            </div>

            <input
              type="checkbox"
              checked={cameraPerm}
              onChange={e => handleToggleCamera(e.target.checked)}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer mt-1"
            />
          </div>

          {/* Location Permission */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-white">Location Access</span>
              </div>
              <p className="text-xs text-slate-300">
                Used only when searching for nearby counselors and calculating clinic distances.
              </p>
              <span className="text-[11px] text-blue-400 block font-mono">
                📍 Never tracks background location. Manual city option available.
              </span>
            </div>

            <input
              type="checkbox"
              checked={locationPerm}
              onChange={e => handleToggleLocation(e.target.checked)}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer mt-1"
            />
          </div>

          {/* Usage Access / Screen Time */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white">Usage Access Telemetry</span>
              </div>
              <p className="text-xs text-slate-300">
                Tracks daily screen time duration and time-of-day distribution for sleep reminders.
              </p>
              <span className="text-[11px] text-purple-400 block font-mono">
                📱 Android: android.permission.PACKAGE_USAGE_STATS
              </span>
            </div>

            <input
              type="checkbox"
              checked={usagePerm}
              onChange={e => handleToggleUsage(e.target.checked)}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer mt-1"
            />
          </div>

          {/* In-App Behavioral Dynamics */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">In-App Behavioral Rhythm</span>
              </div>
              <p className="text-xs text-slate-300">
                Measures typing cadence and backspace correction rates within MindSync notes.
              </p>
              <span className="text-[11px] text-amber-400 block font-mono">
                ⚡ Never inspects typed characters or external applications.
              </span>
            </div>

            <input
              type="checkbox"
              checked={behaviorPerm}
              onChange={e => handleToggleBehavior(e.target.checked)}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer mt-1"
            />
          </div>
        </div>
      </div>

      {/* Transparent Technical Limitations Table (Section 20 requirement) */}
      <div
        className="p-6 rounded-2xl border space-y-4"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-teal-400" />
            Platform Scope & Technical Limitations Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent breakdown of what MindSync is technically designed to access versus ethical and
            OS platform restrictions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Column 1: Available & Permitted */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[11px]">
              ✓ Available & Implemented
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              <li>Camera landmark feature extraction (user-permitted)</li>
              <li>In-app typing dynamics & backspace correction rates</li>
              <li>Device screen-time monitoring via Usage Access API</li>
              <li>Approximate distance via Geolocation API</li>
              <li>Sleep window routine awareness and rest reminders</li>
              <li>Encrypted mock telemedicine video consultation</li>
            </ul>
          </div>

          {/* Column 2: Restricted / Platform Limited */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <span className="font-bold text-amber-400 uppercase tracking-wider block text-[11px]">
              ⚠️ Restricted / Platform Limited
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              <li>Detailed system-wide typing (sandboxed by OS)</li>
              <li>Touch coordinate gestures inside other apps</li>
              <li>Continuous background camera without notification</li>
              <li>Detailed internal logs of closed third-party apps</li>
            </ul>
          </div>

          {/* Column 3: Prohibited / Never Implemented */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
            <span className="font-bold text-rose-400 uppercase tracking-wider block text-[11px]">
              🚫 Prohibited / Never Touched
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              <li>Reading private WhatsApp / Instagram messages</li>
              <li>Capturing account passwords or banking information</li>
              <li>Secret microphone or video wiretapping</li>
              <li>Selling or transmitting biometric identifiers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Sovereignty: GDPR / DPDP Export & Erase */}
      <div
        className="p-6 rounded-2xl border space-y-4"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400" />
            Data Sovereignty & Academic Submission Tools
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Download your personal database records, inspect the relational schema, or permanently
            purge your account history.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Complete Data (JSON)
          </button>

          <button
            onClick={handleViewSQL}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <FileCode className="w-4 h-4 text-teal-400" /> Export Relational SQL DDL (16 Tables)
          </button>

          <button
            onClick={handlePurgeData}
            className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Purge All My Stored Data
          </button>
        </div>

        {exportNotice && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* SQL DDL Viewer Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-3xl rounded-2xl border p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            style={{
              backgroundColor: 'var(--card-bg, #182234)',
              borderColor: 'var(--border-color, #2d3e5b)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-400" />
                  Relational SQL DDL Schema (All 16 Tables)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Production PostgreSQL / MySQL / SQLite DDL script with foreign keys and indexes.
                </p>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <pre className="flex-1 p-4 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 font-mono text-[11px] overflow-auto select-all leading-relaxed">
              {sqlContent}
            </pre>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Ready for database submission or evaluation</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sqlContent);
                  alert('SQL DDL copied to clipboard!');
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
              >
                Copy SQL to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
