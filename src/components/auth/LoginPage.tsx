// MindSync - Immersive Full-Screen Authentication Page
import React, { useState, useEffect } from 'react';
import {
  Brain,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Clock,
  MapPin,
  Camera,
  Activity,
  Smartphone,
  Heart,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Wind,
  Zap,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FEATURES = [
  { icon: Camera,     color: '#14b8a6', grad: 'linear-gradient(135deg,#14b8a6,#06b6d4)', label: 'FACS Camera Emotion Detection',     sub: 'Zero raw video storage — 100% on-device' },
  { icon: Smartphone, color: '#6366f1', grad: 'linear-gradient(135deg,#6366f1,#818cf8)', label: 'Routine-Aware Screen Time',          sub: 'Gentle reminders before burnout strikes' },
  { icon: Activity,   color: '#a855f7', grad: 'linear-gradient(135deg,#a855f7,#c084fc)', label: 'Keystroke Stress Telemetry',         sub: 'Detects fatigue from your typing rhythm' },
  { icon: Heart,      color: '#f43f5e', grad: 'linear-gradient(135deg,#f43f5e,#fb7185)', label: 'Verified Counselors & Crisis Lines', sub: 'Book telehealth sessions instantly' },
  { icon: Wind,       color: '#10b981', grad: 'linear-gradient(135deg,#10b981,#34d399)', label: 'Guided Breathwork & Wellness',      sub: 'Interactive tools to calm instantly' },
  { icon: Zap,        color: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)', label: 'Real-Time AI Companion',            sub: 'Clarify doubts, explore wellbeing tips' },
];

interface LoginPageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ theme, onToggleTheme, onLoginSuccess }) => {
  const { login, register } = useAuth();

  const [activeTab, setActiveTab]     = useState<'login' | 'register'>('login');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName]               = useState('');
  const [regEmail, setRegEmail]       = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPwd, setShowRegPwd]   = useState(false);
  const [age, setAge]                 = useState(22);
  const [gender, setGender]           = useState<'female'|'male'|'non-binary'|'prefer-not-to-say'>('male');
  const [location, setLocation]       = useState('Bengaluru, Karnataka');
  const [wakeUpTime, setWakeUpTime]   = useState('06:30');
  const [sleepTime, setSleepTime]     = useState('22:30');

  const [isLoading, setIsLoading]     = useState(false);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);
  const [featIndex, setFeatIndex]     = useState(0);

  useEffect(() => {
    const t = setInterval(() => setFeatIndex(i => (i + 1) % FEATURES.length), 3200);
    return () => clearInterval(t);
  }, []);

  const clearMsgs = () => { setErrorMsg(null); setSuccessMsg(null); };



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setErrorMsg('Please enter your email and password.'); return; }
    setIsLoading(true); clearMsgs();
    const res = await login(email.trim(), password.trim());
    setIsLoading(false);
    if (res.success) onLoginSuccess?.();
    else setErrorMsg(res.message);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !regEmail.trim() || !regPassword.trim()) { setErrorMsg('Please complete all required fields.'); return; }
    if (regPassword.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    setIsLoading(true); clearMsgs();
    const res = await register({ name: name.trim(), email: regEmail.trim(), passwordPlain: regPassword, age, gender, location, wakeUpTime, sleepTime });
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('Account created! Redirecting to your dashboard…');
      setTimeout(() => onLoginSuccess?.(), 900);
    } else setErrorMsg(res.message);
  };

  const feat = FEATURES[featIndex];
  const FeatIcon = feat.icon;

  return (
    <div className="ms-login-root">
      {/* ── Animated background orbs ── */}
      <div aria-hidden="true" className="ms-login-orbs">
        <div className="ms-orb ms-orb1" />
        <div className="ms-orb ms-orb2" />
        <div className="ms-orb ms-orb3" />
        <div className="ms-orb ms-orb4" />
        <div className="ms-grid-overlay" />
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="ms-login-left">
        {/* Brand */}
        <div className="ms-brand">
          <div className="ms-brand-icon">
            <Brain size={28} color="#fff" />
          </div>
          <div>
            <div className="ms-brand-name">
              MindSync <span className="ms-badge">AI</span>
            </div>
            <div className="ms-brand-sub">Multimodal Mental Wellness Platform</div>
          </div>
        </div>

        {/* Hero */}
        <div className="ms-hero">
          <div className="ms-pill">
            <Sparkles size={14} /> Next-Generation Mental Well-Being
          </div>
          <h1 className="ms-hero-title">
            Your Mind,<br />
            <span className="ms-grad-text">Understood.</span>
          </h1>
          <p className="ms-hero-sub">
            MindSync unifies real-time facial emotion telemetry, behavioral stress cadence,
            routine-aware digital boundaries, and licensed counselor access — all privacy-first,
            all on-device.
          </p>

          {/* Animated feature card */}
          <div className="ms-feat-card" key={featIndex}>
            <div className="ms-feat-icon" style={{ background: feat.grad }}>
              <FeatIcon size={20} color="#fff" />
            </div>
            <div>
              <div className="ms-feat-label">{feat.label}</div>
              <div className="ms-feat-sub">{feat.sub}</div>
            </div>
          </div>

          {/* Dot nav */}
          <div className="ms-dots">
            {FEATURES.map((_, i) => (
              <button key={i} onClick={() => setFeatIndex(i)}
                className="ms-dot" style={{ width: i === featIndex ? 24 : 8, background: i === featIndex ? '#aa3bff' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div className="ms-trust">
          {[{ icon: ShieldCheck, label: 'On-Device Privacy' }, { icon: Star, label: 'HIPAA Aligned' }, { icon: Zap, label: 'Real-Time AI' }].map(({ icon: Icon, label }) => (
            <div key={label} className="ms-trust-badge"><Icon size={14} className="ms-trust-icon" />{label}</div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL – Auth card ── */}
      <div className="ms-login-right">
        <div className="ms-auth-card">
          {/* Mobile brand */}
          <div className="ms-mobile-brand">
            <div className="ms-brand-icon-sm"><Brain size={20} color="#fff" /></div>
            <span className="ms-mobile-brand-name">MindSync <span className="ms-grad-text">AI</span></span>
          </div>

          {/* Card header */}
          <div className="ms-card-header">
            <div>
              <div className="ms-card-eyebrow">{activeTab === 'login' ? 'Welcome Back' : 'Get Started Free'}</div>
              <h2 className="ms-card-title">{activeTab === 'login' ? 'Sign In to MindSync' : 'Create Your Space'}</h2>
              <p className="ms-card-desc">
                {activeTab === 'login'
                  ? 'Access your emotional trends and AI wellness companion.'
                  : 'Set your wellness baseline and begin your journey.'}
              </p>
            </div>
            <button onClick={onToggleTheme} className="ms-theme-btn" title="Toggle theme">
              {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#94a3b8" />}
            </button>
          </div>

          {/* Tab switcher */}
          <div className="ms-tabs">
            {(['login', 'register'] as const).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); clearMsgs(); }}
                className={`ms-tab${activeTab === tab ? ' ms-tab-active' : ''}`}>
                {tab === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="ms-msg ms-msg-err">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="ms-msg ms-msg-ok">
              <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {successMsg}
            </div>
          )}

          {/* ── SIGN IN ── */}
          {activeTab === 'login' ? (
            <div className="ms-form-section">

              <form onSubmit={handleLogin} className="ms-form">
                <div className="ms-field">
                  <label className="ms-label">Email Address</label>
                  <div className="ms-input-wrap">
                    <Mail size={15} className="ms-input-icon" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" className="ms-input ms-input-icon-pl" />
                  </div>
                </div>
                <div className="ms-field">
                  <div className="ms-label-row">
                    <label className="ms-label">Password</label>
                  </div>
                  <div className="ms-input-wrap">
                    <Lock size={15} className="ms-input-icon" />
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••" className="ms-input ms-input-icon-pl ms-input-icon-pr" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="ms-eye-btn">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="ms-btn ms-btn-grad">
                  {isLoading ? <><span className="ms-spinner" /><span>Verifying…</span></> : <><span>Sign In to MindSync</span><ArrowRight size={15} /></>}
                </button>
              </form>
            </div>

          ) : (
          /* ── REGISTER ── */
            <form onSubmit={handleRegister} className="ms-form ms-form-scroll">
              <div className="ms-field">
                <label className="ms-label">Full Name *</label>
                <div className="ms-input-wrap">
                  <User size={15} className="ms-input-icon" />
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Priya Sharma" className="ms-input ms-input-icon-pl" />
                </div>
              </div>
              <div className="ms-field">
                <label className="ms-label">Email Address *</label>
                <div className="ms-input-wrap">
                  <Mail size={15} className="ms-input-icon" />
                  <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="priya@example.com" className="ms-input ms-input-icon-pl" />
                </div>
              </div>
              <div className="ms-field">
                <label className="ms-label">Password (min 6 chars) *</label>
                <div className="ms-input-wrap">
                  <Lock size={15} className="ms-input-icon" />
                  <input type={showRegPwd ? 'text' : 'password'} required value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Create strong password" className="ms-input ms-input-icon-pl ms-input-icon-pr" />
                  <button type="button" onClick={() => setShowRegPwd(v => !v)} className="ms-eye-btn">
                    {showRegPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="ms-grid2">
                <div className="ms-field">
                  <label className="ms-label">Age</label>
                  <input type="number" min={13} max={100} value={age} onChange={e => setAge(parseInt(e.target.value) || 20)} className="ms-input ms-input-pad" />
                </div>
                <div className="ms-field">
                  <label className="ms-label">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value as any)} className="ms-input ms-input-pad">
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div className="ms-field">
                <label className="ms-label">City / Region</label>
                <div className="ms-input-wrap">
                  <MapPin size={15} className="ms-input-icon" />
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Bengaluru, Karnataka" className="ms-input ms-input-icon-pl" />
                </div>
              </div>
              <div className="ms-sleep-box">
                <div className="ms-sleep-title"><Clock size={13} /> Sleep Schedule Targets</div>
                <div className="ms-grid2">
                  <div className="ms-field">
                    <label className="ms-label">Wake-up</label>
                    <input type="time" value={wakeUpTime} onChange={e => setWakeUpTime(e.target.value)} className="ms-input ms-input-pad" />
                  </div>
                  <div className="ms-field">
                    <label className="ms-label">Bedtime</label>
                    <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)} className="ms-input ms-input-pad" />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="ms-btn ms-btn-grad">
                {isLoading ? <><span className="ms-spinner" /><span>Creating Account…</span></> : <><span>Complete Registration</span><ArrowRight size={15} /></>}
              </button>
            </form>
          )}

          {/* Privacy footer */}
          <div className="ms-privacy">
            <ShieldCheck size={13} color="#10b981" /> Private client-side storage &nbsp;•&nbsp; Zero tracking cookies
          </div>
        </div>
      </div>

      {/* ══ All styles scoped inside the component ══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

        /* Root */
        .ms-login-root {
          min-height: 100vh; width: 100%; display: flex; overflow: hidden;
          position: relative; background: #0c0d13;
          font-family: 'Outfit', -apple-system, sans-serif;
        }

        /* Orbs & Dynamic Background */
        .ms-login-orbs { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
        .ms-orb { position:absolute; border-radius:50%; filter:blur(95px); }
        .ms-orb1 { width:580px;height:580px; background:radial-gradient(circle,#aa3bff 0%,transparent 70%); top:-200px;left:-140px; opacity:.55; animation:msOrb1 18s ease-in-out infinite alternate; }
        .ms-orb2 { width:460px;height:460px; background:radial-gradient(circle,#6366f1 0%,transparent 70%); bottom:-120px;right:24%; opacity:.4; animation:msOrb2 22s ease-in-out infinite alternate-reverse; }
        .ms-orb3 { width:340px;height:340px; background:radial-gradient(circle,#06b6d4 0%,transparent 70%); top:38%;right:4%; opacity:.28; animation:msOrb3 15s ease-in-out infinite alternate; }
        .ms-orb4 { width:260px;height:260px; background:radial-gradient(circle,#f43f5e 0%,transparent 70%); bottom:15%;left:20%; opacity:.22; animation:msOrb1 26s ease-in-out infinite alternate-reverse; }

        @keyframes msOrb1 { 0%{transform:translate(0,0) scale(1);} 50%{transform:translate(35px,-45px) scale(1.12);} 100%{transform:translate(-25px,30px) scale(0.92);} }
        @keyframes msOrb2 { 0%{transform:translate(0,0) scale(1);} 50%{transform:translate(-40px,30px) scale(1.08);} 100%{transform:translate(30px,-35px) scale(0.95);} }
        @keyframes msOrb3 { 0%{transform:translate(0,0) scale(1);} 50%{transform:translate(25px,35px) scale(1.15);} 100%{transform:translate(-30px,-20px) scale(0.9);} }

        /* Grid */
        .ms-grid-overlay {
          position:absolute;inset:0;
          background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);
          background-size:52px 52px;
          mask-image:radial-gradient(ellipse 85% 85% at 50% 50%,black 40%,transparent 100%);
          animation: msGridFade 8s ease-in-out infinite alternate;
        }
        @keyframes msGridFade { 0%{opacity:.7;} 100%{opacity:1;} }

        /* Left panel */
        .ms-login-left { display:none; flex-direction:column; justify-content:space-between; padding:48px 64px; position:relative; z-index:2; }
        @media(min-width:1024px){ .ms-login-left{display:flex;width:58%;} }

        /* Brand */
        .ms-brand { display:flex; align-items:center; gap:14px; }
        .ms-brand-icon {
          width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(135deg,#aa3bff,#6366f1);
          box-shadow:0 8px 32px rgba(170,59,255,.35);
          position:relative;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1);
          animation: msPulseRing 3.5s ease-in-out infinite;
        }
        .ms-brand-icon:hover { transform:scale(1.08) rotate(3deg); }
        @keyframes msPulseRing {
          0%, 100% { box-shadow:0 8px 32px rgba(170,59,255,.35), 0 0 0 0 rgba(170,59,255,.3); }
          50% { box-shadow:0 12px 38px rgba(170,59,255,.5), 0 0 0 10px rgba(170,59,255,0); }
        }
        .ms-brand-name { font-size:22px;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px;letter-spacing:-.5px; }
        .ms-badge {
          font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;
          background:rgba(170,59,255,.18);color:#c084fc;border:1px solid rgba(170,59,255,.35);
          animation: msBadgeGlow 2.5s ease-in-out infinite alternate;
        }
        @keyframes msBadgeGlow {
          from { border-color: rgba(170,59,255,.3); }
          to { border-color: rgba(170,59,255,.7); box-shadow: 0 0 12px rgba(170,59,255,.35); }
        }
        .ms-brand-sub { font-size:11px;color:rgba(255,255,255,.45);margin-top:1px; }

        /* Hero */
        .ms-hero { display:flex;flex-direction:column;gap:20px; }
        .ms-pill {
          display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:99px;
          background:rgba(170,59,255,.12);border:1px solid rgba(170,59,255,.35);color:#c084fc;
          font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
          animation: msFloat 4s ease-in-out infinite;
        }
        @keyframes msFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .ms-hero-title { font-size:clamp(40px,5vw,62px);font-weight:900;color:#fff;line-height:1.07;letter-spacing:-2px;margin:0; }
        .ms-grad-text {
          background:linear-gradient(135deg,#aa3bff,#6366f1,#06b6d4,#aa3bff);
          background-size: 300% 300%;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation: msShimmerText 6s ease-in-out infinite alternate;
        }
        @keyframes msShimmerText {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .ms-hero-sub { font-size:15px;line-height:1.65;color:rgba(255,255,255,.6);max-width:500px;margin:0; }

        /* Feature card */
        .ms-feat-card {
          display:flex;align-items:flex-start;gap:16px;padding:20px;border-radius:20px;
          background:rgba(26,28,39,.65);border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(16px);
          animation: msFeatIn .45s cubic-bezier(.16,1,.3,1) both, msFeatGlow 3.5s ease-in-out infinite alternate;
          transition: transform .25s ease, border-color .25s ease;
        }
        .ms-feat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(170,59,255,.35);
        }
        @keyframes msFeatIn { from{opacity:0;transform:translateY(12px) scale(.98);} to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes msFeatGlow { from{box-shadow:0 4px 20px rgba(0,0,0,.25);} to{box-shadow:0 8px 32px rgba(170,59,255,.28);} }
        .ms-feat-icon {
          width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;
          flex-shrink:0;box-shadow:0 4px 18px rgba(0,0,0,.35);
          transition: transform .3s ease;
        }
        .ms-feat-card:hover .ms-feat-icon { transform: scale(1.08); }
        .ms-feat-label { font-size:14px;font-weight:700;color:#fff; }
        .ms-feat-sub { font-size:12px;color:rgba(255,255,255,.5);margin-top:3px; }

        /* Dots */
        .ms-dots { display:flex;gap:6px;align-items:center; }
        .ms-dot { height:8px;border-radius:99px;border:none;cursor:pointer;padding:0;transition:all .35s cubic-bezier(.34,1.56,.64,1); }
        .ms-dot:hover { transform: scale(1.2); }

        /* Trust */
        .ms-trust { display:flex;flex-wrap:wrap;gap:20px; }
        .ms-trust-badge {
          display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;
          color:rgba(255,255,255,.45);
          transition: color .2s, transform .2s;
        }
        .ms-trust-badge:hover { color:rgba(255,255,255,.8); transform: translateY(-1px); }
        .ms-trust-icon { color:#c084fc; transition: transform .2s ease; }
        .ms-trust-badge:hover .ms-trust-icon { transform: rotate(10deg); }

        /* Right panel */
        .ms-login-right { flex:1;display:flex;align-items:center;justify-content:center;padding:32px 20px;position:relative;z-index:2; }

        /* Auth card */
        .ms-auth-card {
          width:100%;max-width:440px;border-radius:28px;padding:32px;
          background:rgba(14,16,24,.88);border:1.5px solid rgba(255,255,255,.1);
          backdrop-filter:blur(24px);
          box-shadow:0 24px 80px rgba(0,0,0,.65), 0 0 50px rgba(170,59,255,.1);
          animation: msCardIn .7s cubic-bezier(.16,1,.3,1) both;
          display:flex;flex-direction:column;gap:20px;
          position:relative;
        }
        @keyframes msCardIn { from{opacity:0;transform:translateY(32px) scale(.96);} to{opacity:1;transform:translateY(0) scale(1);} }

        /* Mobile brand */
        .ms-mobile-brand { display:flex;align-items:center;gap:10px; }
        @media(min-width:1024px){ .ms-mobile-brand{display:none;} }
        .ms-brand-icon-sm { width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#aa3bff,#6366f1);box-shadow:0 4px 16px rgba(170,59,255,.3); }
        .ms-mobile-brand-name { font-size:18px;font-weight:900;color:#fff; }

        /* Card header */
        .ms-card-header { display:flex;align-items:flex-start;justify-content:space-between;gap:12px; }
        .ms-card-eyebrow { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#c084fc;margin-bottom:4px; }
        .ms-card-title { font-size:24px;font-weight:900;color:#fff;margin:0 0 4px; }
        .ms-card-desc { font-size:12px;color:rgba(255,255,255,.45);margin:0; }
        .ms-theme-btn {
          padding:8px;border-radius:12px;border:1.5px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.05);cursor:pointer;
          transition:all .25s ease;flex-shrink:0;
        }
        .ms-theme-btn:hover { transform:scale(1.12) rotate(15deg); border-color: rgba(170,59,255,.4); }

        /* Tabs */
        .ms-tabs { display:flex;gap:4px;padding:4px;border-radius:16px;background:rgba(255,255,255,.05); }
        .ms-tab {
          flex:1;padding:10px;font-size:12px;font-weight:700;border-radius:12px;border:none;cursor:pointer;
          transition:all .25s cubic-bezier(.34,1.56,.64,1);color:rgba(255,255,255,.45);background:transparent;
        }
        .ms-tab:hover:not(.ms-tab-active) { color:#fff; background:rgba(255,255,255,.04); }
        .ms-tab-active {
          background:linear-gradient(135deg,#aa3bff,#6366f1);color:#fff;
          box-shadow:0 4px 20px rgba(170,59,255,.45);
          transform: scale(1.02);
        }

        /* Messages */
        .ms-msg { display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:12px;font-size:12px;line-height:1.5;animation:msMsg .3s ease both; }
        @keyframes msMsg { from{opacity:0;transform:translateY(-8px) scale(.98);} to{opacity:1;transform:translateY(0) scale(1);} }
        .ms-msg-err { background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);color:#fca5a5; }
        .ms-msg-ok  { background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.35);color:#6ee7b7; }

        /* Form section */
        .ms-form-section { display:flex;flex-direction:column;gap:16px; }
        .ms-form { display:flex;flex-direction:column;gap:14px; }
        .ms-form-scroll { max-height:420px;overflow-y:auto;padding-right:4px;gap:14px; }
        .ms-form-scroll::-webkit-scrollbar { width:4px; }
        .ms-form-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,.15);border-radius:99px; }

        /* Fields */
        .ms-field { display:flex;flex-direction:column;gap:6px; }
        .ms-label { font-size:12px;font-weight:600;color:rgba(255,255,255,.65); }
        .ms-label-row { display:flex;align-items:center;justify-content:space-between; }
        .ms-input-wrap { position:relative; }
        .ms-input-icon { position:absolute;left:13px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.35);pointer-events:none;transition:color .2s; }
        .ms-eye-btn { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);padding:2px;transition:color .2s, transform .2s; }
        .ms-eye-btn:hover { color:rgba(255,255,255,.8); transform:translateY(-50%) scale(1.1); }
        .ms-input {
          width:100%;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);
          border-radius:12px;color:#f5f6fa;font-family:'Outfit',sans-serif;font-size:12px;
          transition:border-color .25s ease,box-shadow .25s ease,transform .2s ease;outline:none;
        }
        .ms-input::placeholder { color:rgba(255,255,255,.28); }
        .ms-input:focus {
          border-color:#aa3bff;
          box-shadow:0 0 0 3px rgba(170,59,255,.25), 0 4px 16px rgba(170,59,255,.15);
          transform: translateY(-1px);
        }
        .ms-input-wrap:focus-within .ms-input-icon { color: #c084fc; }
        .ms-input option { background:#161720;color:#f5f6fa; }
        .ms-input-pl { padding:11px 14px; }
        .ms-input-icon-pl { padding:11px 14px 11px 38px; }
        .ms-input-icon-pr { padding-right:38px; }
        .ms-input-pad { padding:11px 14px; }
        .ms-grid2 { display:grid;grid-template-columns:1fr 1fr;gap:12px; }

        /* Sleep box */
        .ms-sleep-box { padding:14px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);transition: border-color .2s; }
        .ms-sleep-box:focus-within { border-color: rgba(170,59,255,.3); }
        .ms-sleep-title { display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#c084fc;margin-bottom:10px; }

        /* Buttons */
        .ms-btn {
          display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px;border-radius:14px;
          font-size:13px;font-weight:800;border:none;cursor:pointer;letter-spacing:.02em;
          position:relative; overflow:hidden;
          transition:all .25s cubic-bezier(.34,1.56,.64,1);
        }
        .ms-btn:disabled { opacity:.6;cursor:not-allowed; }
        .ms-btn-grad {
          background:linear-gradient(135deg,#aa3bff,#6366f1,#06b6d4,#aa3bff);
          background-size:250% 100%;
          color:#fff;
          box-shadow:0 4px 24px rgba(170,59,255,.4);
          animation: msBtnGrad 5s ease infinite alternate;
        }
        @keyframes msBtnGrad {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .ms-btn-grad:not(:disabled):hover {
          transform:translateY(-1px) scale(1.02);
          box-shadow:0 8px 30px rgba(170,59,255,.55);
        }
        .ms-btn-grad:not(:disabled):active { transform:scale(.98); }

        /* Spinner */
        .ms-spinner { width:16px;height:16px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }
        @keyframes spin { to{transform:rotate(360deg);} }

        /* Privacy */
        .ms-privacy { display:flex;align-items:center;justify-content:center;gap:6px;font-size:10px;color:rgba(255,255,255,.35);padding-top:12px;border-top:1px solid rgba(255,255,255,.06); }
      `}</style>
    </div>
  );
};

export default LoginPage;
