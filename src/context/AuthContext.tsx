// MindSync - Authentication & Session Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserPreferences, DailyRoutine, ScreenTimeGoal } from '../types';
import { db } from '../db/database';
import { hashPassword, generateUUID, generateSessionToken } from '../utils/crypto';

interface AuthContextType {
  user: UserProfile | null;
  preferences: UserPreferences | null;
  routine: DailyRoutine | null;
  screenTimeGoal: ScreenTimeGoal | null;
  login: (email: string, passwordPlain: string) => Promise<{ success: boolean; message: string }>;
  register: (data: {
    name: string;
    email: string;
    passwordPlain: string;
    age: number;
    gender: 'female' | 'male' | 'non-binary' | 'prefer-not-to-say';
    location: string;
    wakeUpTime?: string;
    sleepTime?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updateRoutine: (updates: Partial<DailyRoutine>) => void;
  updateScreenTimeGoal: (updates: Partial<ScreenTimeGoal>) => void;
  activeSessionToken: string | null;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {


  // Restore session from localStorage if valid, otherwise remain null (requiring login)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const activeId = localStorage.getItem('mindsync_active_user_id');
      const token = localStorage.getItem('mindsync_session_token');
      if (activeId && token) {
        const found = db.getUserById(activeId);
        if (found) return found;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [activeSessionToken, setActiveSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('mindsync_session_token');
  });

  const [preferences, setPreferences] = useState<UserPreferences | null>(() => {
    return user ? db.getPreferences(user.id) : null;
  });

  const [routine, setRoutine] = useState<DailyRoutine | null>(() => {
    return user ? db.getDailyRoutine(user.id) : null;
  });

  const [screenTimeGoal, setScreenTimeGoal] = useState<ScreenTimeGoal | null>(() => {
    return user ? db.getScreenTimeGoal(user.id) : null;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mindsync_demo_mode') === 'true';
    } catch {
      return false;
    }
  });

  const setDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    try {
      localStorage.setItem('mindsync_demo_mode', String(val));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      setPreferences(db.getPreferences(user.id));
      setRoutine(db.getDailyRoutine(user.id));
      setScreenTimeGoal(db.getScreenTimeGoal(user.id));
    } else {
      setPreferences(null);
      setRoutine(null);
      setScreenTimeGoal(null);
    }
  }, [user]);

  const login = async (email: string, passwordPlain: string): Promise<{ success: boolean; message: string }> => {
    const existing = db.getUserByEmail(email);
    if (!existing) {
      return { success: false, message: 'No account found with this email address. Please register.' };
    }

    const hashed = await hashPassword(passwordPlain);
    if (!existing.passwordHash || existing.passwordHash !== hashed) {
      return { success: false, message: 'Invalid credentials. Please verify your password.' };
    }

    const token = generateSessionToken(existing.id);
    existing.isLoggedIn = true;
    db.saveUser(existing);
    setUser(existing);
    setActiveSessionToken(token);
    localStorage.setItem('mindsync_active_user_id', existing.id);
    localStorage.setItem('mindsync_session_token', token);
    return { success: true, message: `Welcome back, ${existing.name}!` };
  };



  const register = async (data: {
    name: string;
    email: string;
    passwordPlain: string;
    age: number;
    gender: 'female' | 'male' | 'non-binary' | 'prefer-not-to-say';
    location: string;
    wakeUpTime?: string;
    sleepTime?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const existing = db.getUserByEmail(data.email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    const passwordHash = await hashPassword(data.passwordPlain);
    const newUser: UserProfile = {
      id: generateUUID(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash,
      age: data.age,
      gender: data.gender,
      location: data.location.trim() || 'Bengaluru, India',
      lat: 12.9716,
      lng: 77.5946,
      role: 'user',
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };

    db.saveUser(newUser);

    if (data.wakeUpTime || data.sleepTime) {
      db.updateDailyRoutine(newUser.id, {
        wakeUpTime: data.wakeUpTime || '06:30',
        sleepTime: data.sleepTime || '22:30'
      });
    }

    const token = generateSessionToken(newUser.id);
    setUser(newUser);
    setActiveSessionToken(token);
    localStorage.setItem('mindsync_active_user_id', newUser.id);
    localStorage.setItem('mindsync_session_token', token);
    return { success: true, message: `Account created successfully. Welcome to MindSync, ${newUser.name}!` };
  };

  const logout = () => {
    if (user) {
      user.isLoggedIn = false;
      db.saveUser(user);
    }
    setUser(null);
    setActiveSessionToken(null);
    localStorage.removeItem('mindsync_active_user_id');
    localStorage.removeItem('mindsync_session_token');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    db.saveUser(updated);
    setUser(updated);
  };

  const updatePreferencesState = (updates: Partial<UserPreferences>) => {
    if (!user) return;
    const updated = db.updatePreferences(user.id, updates);
    setPreferences(updated);
  };

  const updateRoutineState = (updates: Partial<DailyRoutine>) => {
    if (!user) return;
    const updated = db.updateDailyRoutine(user.id, updates);
    setRoutine(updated);
  };

  const updateScreenTimeGoalState = (updates: Partial<ScreenTimeGoal>) => {
    if (!user) return;
    const updated = db.updateScreenTimeGoal(user.id, updates);
    setScreenTimeGoal(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        routine,
        screenTimeGoal,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences: updatePreferencesState,
        updateRoutine: updateRoutineState,
        updateScreenTimeGoal: updateScreenTimeGoalState,
        activeSessionToken,
        isDemoMode,
        setDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
