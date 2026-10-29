// MindSync – Left Sidebar Navigation (FreeDash-style)
import React, { useState } from 'react';
import {
  Brain,
  Camera,
  Smartphone,
  Keyboard,
  Heart,
  UserCheck,
  Calendar,
  ShieldCheck,
  PhoneCall,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Bot,
  LayoutDashboard,
  User,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuthModal: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenChat?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'mood',         label: 'Mood & Camera',    icon: Camera },
  { id: 'screentime',   label: 'Screen Time',      icon: Smartphone },
  { id: 'behavior',     label: 'Behavior',         icon: Keyboard },
  { id: 'wellness',     label: 'Wellness',         icon: Heart },
  { id: 'providers',    label: 'Find Counselor',   icon: UserCheck },
  { id: 'appointments', label: 'Appointments',     icon: Calendar },
  { id: 'privacy',      label: 'Privacy',          icon: ShieldCheck },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onOpenAuthModal,
  theme,
  onToggleTheme,
  onOpenChat,
}) => {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allItems = [
    ...NAV_ITEMS,
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Portal', icon: ShieldCheck }] : []),
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setDrawerOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div
        className="ms-sidebar-brand"
        onClick={() => handleNav('dashboard')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleNav('dashboard')}
      >
        <div className="ms-sidebar-brand-icon">
          <Brain size={18} />
        </div>
        <div className="ms-sidebar-brand-text">
          <span className="ms-sidebar-brand-name">
            MindSync
            <span className="ms-sidebar-brand-badge">AI</span>
          </span>
          <span className="ms-sidebar-brand-sub">Wellness Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="ms-sidebar-nav">
        <div className="ms-sidebar-section-label">Navigation</div>

        {allItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`ms-nav-item${isActive ? ' active' : ''}`}
              title={item.label}
            >
              <Icon className="ms-nav-icon" size={15} />
              <span className="ms-nav-label">{item.label}</span>
              {isActive && <ChevronRight size={12} style={{ color: '#2dd4bf', flexShrink: 0 }} />}
            </button>
          );
        })}

        <div className="ms-sidebar-section-label" style={{ marginTop: '8px' }}>Support</div>

        {/* Emergency */}
        <button
          className="ms-nav-emergency"
          onClick={() => handleNav('emergency')}
          title="Emergency Helplines"
        >
          <PhoneCall size={15} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Emergency Helplines
          </span>
        </button>

        {/* AI Chat */}
        {onOpenChat && (
          <button
            className={`ms-nav-item${activeTab === '__chat__' ? ' active' : ''}`}
            onClick={() => { onOpenChat(); setDrawerOpen(false); }}
            title="Ask AI Companion"
          >
            <Bot className="ms-nav-icon" size={15} />
            <span className="ms-nav-label">Ask AI Companion</span>
          </button>
        )}

        {/* Profile */}
        <button
          className={`ms-nav-item${activeTab === 'profile' ? ' active' : ''}`}
          onClick={() => handleNav('profile')}
          title="My Profile"
        >
          <User className="ms-nav-icon" size={15} />
          <span className="ms-nav-label">My Profile</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="ms-sidebar-footer">
        {user ? (
          <>
            <button
              className="ms-sidebar-user"
              onClick={() => handleNav('profile')}
              title="View profile"
            >
              <div className="ms-sidebar-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="ms-sidebar-user-name">{user.name}</div>
                <div className="ms-sidebar-user-role">
                  {user.role === 'admin' ? 'Admin' : 'Member'}
                </div>
              </div>
            </button>
            <div className="ms-sidebar-actions">
              <button
                className="ms-icon-btn"
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                style={{ flex: 1 }}
              >
                {theme === 'dark'
                  ? <Sun size={13} style={{ color: '#fbbf24' }} />
                  : <Moon size={13} />
                }
              </button>
              <button
                className="ms-icon-btn danger"
                onClick={logout}
                title="Sign out"
                style={{ flex: 1 }}
              >
                <LogOut size={13} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={onOpenAuthModal}
              className="ms-btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Sign In
            </button>
            <button
              className="ms-icon-btn"
              onClick={onToggleTheme}
              title="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun size={13} style={{ color: '#fbbf24' }} />
                : <Moon size={13} />
              }
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="ms-sidebar">
        <SidebarContent />
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="ms-mobile-header">
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          onClick={() => handleNav('dashboard')}
        >
          <div className="ms-sidebar-brand-icon" style={{ width: 30, height: 30, borderRadius: 8 }}>
            <Brain size={15} />
          </div>
          <span style={{ fontWeight: 900, color: '#f8fafc', fontSize: 14 }}>MindSync</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="ms-topbar-btn emergency"
            onClick={() => handleNav('emergency')}
          >
            <PhoneCall size={13} />
          </button>
          <button
            className="ms-icon-btn"
            onClick={() => setDrawerOpen(true)}
            title="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <>
          <div className="ms-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="ms-drawer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-color,#1e2e4c)' }}>
              <span style={{ fontWeight: 900, color: '#f8fafc', fontSize: 14 }}>MindSync AI</span>
              <button className="ms-icon-btn" onClick={() => setDrawerOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};
