// MindSync – AI-Powered Mental Wellness Platform
// Main Application Orchestrator
import { useState, useEffect } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

import { DashboardPage }            from './components/dashboard/DashboardPage';
import { CameraEmotionEstimator }   from './components/camera/CameraEmotionEstimator';
import { MoodTrendDashboard }       from './components/mood/MoodTrendDashboard';
import { ScreenTimeMonitor }        from './components/screentime/ScreenTimeMonitor';
import { BehaviorStressTracker }    from './components/behavior/BehaviorStressTracker';
import { WellnessToolkit }          from './components/wellness/WellnessToolkit';
import { ProviderDirectory }        from './components/directory/ProviderDirectory';
import { AdminDashboard }           from './components/admin/AdminDashboard';
import { MyAppointments }           from './components/appointments/MyAppointments';
import { AppointmentBookingModal }  from './components/appointments/AppointmentBookingModal';
import { VirtualConsultationRoom }  from './components/telehealth/VirtualConsultationRoom';
import { EmergencySupport }         from './components/emergency/EmergencySupport';
import { PrivacyCenter }            from './components/privacy/PrivacyCenter';
import { UserProfileView }          from './components/profile/UserProfileView';
import { AuthModal }                from './components/auth/AuthModal';
import { LoginPage }                from './components/auth/LoginPage';
import { AIChatbot }                from './components/chat/AIChatbot';
import { MentalWellnessAssessment } from './components/assessment/MentalWellnessAssessment';
import type { HealthcareProvider, Appointment } from './types';
import { PhoneCall, Bot, Sun, Moon } from 'lucide-react';

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard:    { title: 'Dashboard Overview',                subtitle: 'Real-time mental wellness telemetry & insights' },
  assessment:   { title: 'Mental Wellness Assessment & Guidance', subtitle: 'Clinical PHQ-9, GAD-7 & indicative evaluations' },
  mood:         { title: 'Mood & Camera Landmark Estimation', subtitle: 'FACS geometric valence & emotion tracking' },
  screentime:   { title: 'Routine-Aware Screen Time',        subtitle: 'Circadian blue-light vigilance & app usage limits' },
  behavior:     { title: 'Behavioral Stress Telemetry',      subtitle: 'Typing cadence dynamics & cognitive fatigue' },
  wellness:     { title: 'Interactive Wellness Toolkit',     subtitle: 'Guided breathwork, grounding & journaling' },
  providers:    { title: 'Verified Counselor Directory',     subtitle: 'Licensed psychologists & clinical specialists' },
  appointments: { title: 'My Consultations & Appointments',  subtitle: 'Confidential telehealth sessions & booking' },
  privacy:      { title: 'Privacy & Data Governance',        subtitle: 'On-device local processing & HIPAA compliance' },
  admin:        { title: 'Administrator Control Portal',     subtitle: 'System governance, user telemetry & logs' },
  profile:      { title: 'Profile & Daily Routine Settings', subtitle: 'Sleep targets, personal baselines & preferences' },
  emergency:    { title: 'Immediate Crisis Support',         subtitle: 'Verified 24/7 helplines & emergency assistance' },
};

function MindSyncContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('mindsync_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    try { localStorage.setItem('mindsync_theme', theme); } catch { /* noop */ }
  }, [theme]);

  const [isAuthModalOpen,       setIsAuthModalOpen]       = useState<boolean>(false);
  const [bookingProvider,       setBookingProvider]       = useState<HealthcareProvider | null>(null);
  const [activeVirtualSession,  setActiveVirtualSession]  = useState<Appointment | null>(null);
  const [toastMessage,          setToastMessage]          = useState<string | null>(null);
  const [moodSubTab,            setMoodSubTab]            = useState<'camera' | 'trends'>('camera');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNavigate = (page: string) => {
    setActiveTab(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ── Auth Gate ──
  if (!user) {
    return (
      <LoginPage
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLoginSuccess={() => setActiveTab('dashboard')}
      />
    );
  }

  const pageInfo = TAB_TITLES[activeTab] ?? { title: 'MindSync', subtitle: 'Multimodal mental wellness & support' };

  return (
    <div className="ms-shell" data-theme={theme}>

      {/* ── Left Sidebar ── */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* ── Main Content ── */}
      <main className="ms-main">

        {/* Desktop Top Bar */}
        <header className="ms-topbar">
          <div className="ms-topbar-left">
            <div className="ms-page-title">{pageInfo.title}</div>
            <div className="ms-page-sub">{pageInfo.subtitle}</div>
          </div>
          <div className="ms-topbar-right">
            <button
              className="ms-topbar-btn emergency"
              onClick={() => handleNavigate('emergency')}
              title="Emergency Helplines"
            >
              <PhoneCall size={12} />
              <span>Emergency Help</span>
            </button>
            <button
              className="ms-topbar-btn ai"
              onClick={() => setIsChatOpen(true)}
              title="AI Companion"
            >
              <Bot size={12} />
              <span>AI Chat</span>
            </button>
            <button
              className="ms-icon-btn"
              onClick={handleToggleTheme}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark'
                ? <Sun size={13} style={{ color: '#fbbf24' }} />
                : <Moon size={13} />}
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="ms-content">

          {/* Virtual consultation overrides page routing */}
          {activeVirtualSession ? (
            <VirtualConsultationRoom
              appointment={activeVirtualSession}
              onExitConsultation={() => {
                setActiveVirtualSession(null);
                showToast('Virtual consultation ended and saved.');
                setActiveTab('appointments');
              }}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage onNavigate={handleNavigate} />
              )}

              {activeTab === 'assessment' && (
                <MentalWellnessAssessment onNavigateTab={handleNavigate} />
              )}

              {activeTab === 'mood' && (
                <div className="space-y-6">
                  <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color,#1e2e4c)', paddingBottom: '12px' }}>
                    <button
                      onClick={() => setMoodSubTab('camera')}
                      className={moodSubTab === 'camera' ? 'ms-btn-primary' : 'ms-btn-secondary'}
                    >
                      Live Camera Estimation
                    </button>
                    <button
                      onClick={() => setMoodSubTab('trends')}
                      className={moodSubTab === 'trends' ? 'ms-btn-primary' : 'ms-btn-secondary'}
                    >
                      Weekly Mood History
                    </button>
                  </div>
                  {moodSubTab === 'camera' ? <CameraEmotionEstimator /> : <MoodTrendDashboard />}
                </div>
              )}

              {activeTab === 'screentime'   && <ScreenTimeMonitor />}
              {activeTab === 'behavior'     && (
                <BehaviorStressTracker
                  onNavigateToWellness={() => handleNavigate('wellness')}
                  onNavigateToSupport={() => handleNavigate('providers')}
                />
              )}
              {activeTab === 'wellness'     && (
                <WellnessToolkit
                  onNavigateToCounselors={() => handleNavigate('providers')}
                  onNavigateToEmergency={() => handleNavigate('emergency')}
                />
              )}
              {activeTab === 'providers'    && (
                <ProviderDirectory onSelectProviderForBooking={setBookingProvider} />
              )}
              {activeTab === 'appointments' && (
                <MyAppointments
                  onJoinVirtualConsultation={setActiveVirtualSession}
                  onBookNewAppointment={() => handleNavigate('providers')}
                />
              )}
              {activeTab === 'emergency'    && <EmergencySupport />}
              {activeTab === 'privacy'      && <PrivacyCenter />}
              {activeTab === 'admin'        && <AdminDashboard />}
              {activeTab === 'profile'      && <UserProfileView />}
            </>
          )}

          <Footer onNavigate={handleNavigate} />
        </div>
      </main>

      {/* ── Modals & Overlays ── */}
      <AppointmentBookingModal
        provider={bookingProvider}
        isOpen={Boolean(bookingProvider)}
        onClose={() => setBookingProvider(null)}
        onSuccess={(apt) => {
          setBookingProvider(null);
          showToast(`Appointment confirmed with ${apt.providerName} for ${apt.date}!`);
          setActiveTab('appointments');
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => { showToast('Signed in successfully.'); setIsAuthModalOpen(false); }}
      />

      <AIChatbot
        onNavigate={handleNavigate}
        isOpenExternal={isChatOpen}
        onCloseExternal={() => setIsChatOpen(false)}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 18px',
            borderRadius: '12px',
            background: '#0d9488',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            animation: 'ms-slide-in 0.25s ease',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', display: 'inline-block' }} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MindSyncContent />
    </AuthProvider>
  );
}

export default App;
