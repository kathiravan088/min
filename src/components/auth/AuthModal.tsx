// MindSync - Authentication Modal (Login / Register / Secure Session)
import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  MapPin,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess
}) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(22);
  const [gender, setGender] = useState<'female' | 'male' | 'non-binary' | 'prefer-not-to-say'>('male');
  const [location, setLocation] = useState<string>('Bengaluru, Karnataka');
  const [wakeUpTime, setWakeUpTime] = useState<string>('06:30');
  const [sleepTime, setSleepTime] = useState<string>('22:30');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (mode === 'login') {
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    } else {
      const res = await register({
        name,
        email,
        passwordPlain: password,
        age,
        gender,
        location,
        wakeUpTime,
        sleepTime
      });
      setIsLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl relative space-y-5"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              MindSync Secure Access
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create MindSync Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Enter your credentials to access your personalized wellness records.'
              : 'Sign up with privacy-conscious profile settings and daily routine targets.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              mode === 'login' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              mode === 'register' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Aarav Patel"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Age</label>
                  <input
                    type="number"
                    required
                    min={13}
                    max={100}
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  City / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Wake Time</label>
                  <input
                    type="time"
                    value={wakeUpTime}
                    onChange={e => setWakeUpTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Sleep Time</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={e => setSleepTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md mt-2"
          >
            {isLoading
              ? 'Securing Session...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create My Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
