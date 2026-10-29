// MindSync - Relational Client-Side Database Engine
// Implements full relational structure representing the 16 core entities with schema export,
// foreign keys, indexed lookups, and localStorage persistence.

import type {
  UserProfile,
  UserPreferences,
  DailyRoutine,
  EmotionPrediction,
  MoodRecord,
  BehaviorMetrics,
  PersonalBehaviorBaseline,
  ScreenTimeRecord,
  ScreenTimeGoal,
  HealthcareProvider,
  Appointment,
  ConsultationSession,
  EmergencyContact,
  CrisisHelpline,
  WellnessRecommendation,
  EmotionType
} from '../types';

import { generateUUID } from '../utils/crypto';

export interface UserFeedbackRecord {
  id: string;
  predictionId: string;
  userId: string;
  isCorrect: boolean;
  correctedEmotion?: EmotionType;
  feedbackText?: string;
  timestamp: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: 'screen_time_warning' | 'sleep_reminder' | 'wellness_tip' | 'anomaly_alert' | 'appointment';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}

// Initial Seed Data for Healthcare Providers (Realistic verified-style directory)
export const SEED_PROVIDERS: HealthcareProvider[] = [
  {
    id: 'prov-001',
    name: 'Dr. Radhika Sen',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    qualification: 'M.Phil Clinical Psychology (NIMHANS), Ph.D.',
    specialization: 'Psychologist',
    focusAreas: ['Stress & Anxiety', 'Academic Burnout', 'Cognitive Behavioral Therapy (CBT)'],
    experienceYears: 9,
    consultationFee: 1200,
    clinicLocation: 'Koramangala 4th Block, Bengaluru',
    city: 'Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    languages: ['English', 'Hindi', 'Bengali'],
    isOnlineAvailable: true,
    isInPersonAvailable: true,
    rating: 4.9,
    reviewCount: 148,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    availableTimeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM']
  },
  {
    id: 'prov-002',
    name: 'Dr. Vikramaditya Joshi',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    qualification: 'MD Psychiatry (AIIMS New Delhi), DPM',
    specialization: 'Psychiatrist',
    focusAreas: ['Adult ADHD', 'Mood Dysregulation', 'Sleep Disorders', 'Pharmacotherapy'],
    experienceYears: 14,
    consultationFee: 1800,
    clinicLocation: 'Connaught Place, Central Delhi',
    city: 'Delhi NCR',
    lat: 28.6304,
    lng: 77.2177,
    languages: ['English', 'Hindi', 'Punjabi'],
    isOnlineAvailable: true,
    isInPersonAvailable: true,
    rating: 4.8,
    reviewCount: 230,
    availableDays: ['Tue', 'Wed', 'Fri', 'Sat'],
    availableTimeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '05:30 PM']
  },
  {
    id: 'prov-003',
    name: 'Ananya Deshmukh',
    photoUrl: 'https://images.unsplash.com/photo-1594824813588-4f107316715f?auto=format&fit=crop&q=80&w=300',
    qualification: 'M.Sc. Counseling Psychology, Certified Mindfulness Practitioner',
    specialization: 'Counselor',
    focusAreas: ['Relationship Issues', 'Self-Esteem', 'Workplace Pressure', 'Emotional Regulation'],
    experienceYears: 6,
    consultationFee: 850,
    clinicLocation: 'Bandra West, Mumbai',
    city: 'Mumbai',
    lat: 19.0596,
    lng: 72.8295,
    languages: ['English', 'Hindi', 'Marathi'],
    isOnlineAvailable: true,
    isInPersonAvailable: false,
    rating: 4.7,
    reviewCount: 92,
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sun'],
    availableTimeSlots: ['11:00 AM', '01:30 PM', '04:00 PM', '07:00 PM']
  },
  {
    id: 'prov-004',
    name: 'Dr. Siddharth Venkat',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    qualification: 'M.Sc. Clinical Psychology, Certified REBT Specialist',
    specialization: 'Therapist',
    focusAreas: ['Panic Disorders', 'Perfectionism', 'Somatic Stress', 'Breathwork Integration'],
    experienceYears: 8,
    consultationFee: 1100,
    clinicLocation: 'Hitec City, Madhapur, Hyderabad',
    city: 'Hyderabad',
    lat: 17.4483,
    lng: 78.3915,
    languages: ['English', 'Telugu', 'Hindi'],
    isOnlineAvailable: true,
    isInPersonAvailable: true,
    rating: 4.9,
    reviewCount: 114,
    availableDays: ['Mon', 'Wed', 'Thu', 'Sat'],
    availableTimeSlots: ['10:00 AM', '12:00 PM', '03:30 PM', '05:00 PM', '06:30 PM']
  },
  {
    id: 'prov-005',
    name: 'Pooja Krishnan',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    qualification: 'MA Psychology, Diploma in Youth & Adolescent Mental Health',
    specialization: 'Counselor',
    focusAreas: ['Student Counseling', 'Social Anxiety', 'Exam Stress', 'Habit Management'],
    experienceYears: 5,
    consultationFee: 650,
    clinicLocation: 'T. Nagar, Chennai',
    city: 'Chennai',
    lat: 13.0418,
    lng: 80.2341,
    languages: ['English', 'Tamil'],
    isOnlineAvailable: true,
    isInPersonAvailable: true,
    rating: 4.8,
    reviewCount: 86,
    availableDays: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'],
    availableTimeSlots: ['09:00 AM', '11:00 AM', '02:30 PM', '04:30 PM']
  },
  {
    id: 'prov-006',
    name: 'Dr. Meera Kulkarni',
    photoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300',
    qualification: 'MD Psychiatry, Fellowship in Neuropsychiatry',
    specialization: 'Psychiatrist',
    focusAreas: ['Clinical Depression', 'Chronic Insomnia', 'Generalized Anxiety', 'Adult Mental Health'],
    experienceYears: 16,
    consultationFee: 2000,
    clinicLocation: 'Shivaji Nagar, Pune',
    city: 'Pune',
    lat: 18.5314,
    lng: 73.8446,
    languages: ['English', 'Hindi', 'Marathi'],
    isOnlineAvailable: true,
    isInPersonAvailable: true,
    rating: 4.9,
    reviewCount: 310,
    availableDays: ['Tue', 'Thu', 'Sat'],
    availableTimeSlots: ['10:30 AM', '12:30 PM', '04:00 PM', '06:00 PM']
  }
];

export const SEED_CRISIS_HELPLINES: CrisisHelpline[] = [
  {
    id: 'hl-001',
    name: 'Tele-MANAS (Govt. of India 24x7)',
    country: 'India',
    number: '14416 / 1800-891-4416',
    hours: '24 Hours / 7 Days (Toll-Free)',
    description: 'National Tele Mental Health Programme of India providing free, comprehensive psychological counseling across 20+ regional languages.',
    type: 'government',
    verified: true
  },
  {
    id: 'hl-002',
    name: 'KIRAN Mental Health Helpline',
    country: 'India',
    number: '1800-599-0019',
    hours: '24 Hours / 7 Days (Toll-Free)',
    description: 'Central govt helpline by Ministry of Social Justice & Empowerment for early screening, psychological first aid and distress management.',
    type: 'government',
    verified: true
  },
  {
    id: 'hl-003',
    name: 'Vandrevala Foundation',
    country: 'India',
    number: '+91 9999 666 555',
    hours: '24 Hours / 7 Days',
    description: 'Free crisis intervention and mental health support by experienced clinical psychologists and counselors.',
    type: 'ngo',
    verified: true
  },
  {
    id: 'hl-004',
    name: 'AASRA Crisis Support',
    country: 'India',
    number: '+91 98204 66726',
    hours: '24 Hours / 7 Days',
    description: 'Voluntary non-governmental organization providing non-judgmental crisis intervention and emotional support.',
    type: 'ngo',
    verified: true
  },
  {
    id: 'hl-005',
    name: 'Emergency Response Support System (ERSS)',
    country: 'India',
    number: '112',
    hours: '24 Hours / 7 Days',
    description: 'Single pan-India emergency number for immediate police, medical, and rescue assistance.',
    type: 'emergency',
    verified: true
  },
  {
    id: 'hl-006',
    name: '988 Suicide & Crisis Lifeline (US/Intl)',
    country: 'United States',
    number: '988',
    hours: '24 Hours / 7 Days',
    description: 'Free, confidential support for people in suicidal crisis or emotional distress across the US.',
    type: 'government',
    verified: true
  }
];

class MindSyncDatabase {
  private prefix = 'mindsync_db_';

  private getItem<T>(table: string, fallback: T): T {
    try {
      const data = localStorage.getItem(this.prefix + table);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(table: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + table, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save table ${table} to localStorage`, e);
    }
  }

  // --- 1. USERS & PROFILES ---
  getUsers(): UserProfile[] {
    let users = this.getItem<UserProfile[]>('users', []);
    if (users.length === 0) {
      users = [
        {
          id: 'usr-admin-01',
          name: 'MindSync Administrator',
          email: 'admin@mindsync.com',
          passwordHash: '10c93112f967e2a86efbd5bc04cbbf86e4849d6984fcdc2f21140eb061ec991f', // password: admin123
          role: 'admin',
          age: 32,
          gender: 'prefer-not-to-say',
          location: 'Bengaluru, India',
          isLoggedIn: false,
          createdAt: new Date().toISOString()
        }
      ];
      this.setItem('users', users);
    } else if (!users.some(u => u.role === 'admin')) {
      users.push({
        id: 'usr-admin-01',
        name: 'MindSync Administrator',
        email: 'admin@mindsync.com',
        passwordHash: '10c93112f967e2a86efbd5bc04cbbf86e4849d6984fcdc2f21140eb061ec991f',
        role: 'admin',
        age: 32,
        gender: 'prefer-not-to-say',
        location: 'Bengaluru, India',
        isLoggedIn: false,
        createdAt: new Date().toISOString()
      });
      this.setItem('users', users);
    }
    return users;
  }

  saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    this.setItem('users', users);
  }

  getUserById(id: string): UserProfile | null {
    return this.getUsers().find(u => u.id === id) || null;
  }

  getUserByEmail(email: string): UserProfile | null {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // --- 2. USER PREFERENCES ---
  getPreferences(userId: string): UserPreferences {
    const list = this.getItem<UserPreferences[]>('user_preferences', []);
    const found = list.find(p => p.userId === userId);
    if (found) return found;

    const defaultPrefs: UserPreferences = {
      userId,
      darkMode: false,
      notificationsEnabled: true,
      quietHoursEnabled: true,
      cameraPermissionGranted: false,
      locationPermissionGranted: false,
      usageAccessGranted: true,
      behaviorTrackingGranted: true,
      dataSharingOptIn: false
    };
    list.push(defaultPrefs);
    this.setItem('user_preferences', list);
    return defaultPrefs;
  }

  updatePreferences(userId: string, updates: Partial<UserPreferences>): UserPreferences {
    const list = this.getItem<UserPreferences[]>('user_preferences', []);
    const idx = list.findIndex(p => p.userId === userId);
    const existing = idx >= 0 ? list[idx] : this.getPreferences(userId);
    const updated = { ...existing, ...updates };
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    this.setItem('user_preferences', list);
    return updated;
  }

  // --- 3. DAILY ROUTINES ---
  getDailyRoutine(userId: string): DailyRoutine {
    const list = this.getItem<DailyRoutine[]>('daily_routines', []);
    const found = list.find(r => r.userId === userId);
    if (found) return found;

    const defaultRoutine: DailyRoutine = {
      userId,
      wakeUpTime: '06:30',
      sleepTime: '22:30',
      studyWorkStart: '09:00',
      studyWorkEnd: '17:00',
      exerciseTime: '18:00',
      breakIntervalMin: 45,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00'
    };
    list.push(defaultRoutine);
    this.setItem('daily_routines', list);
    return defaultRoutine;
  }

  updateDailyRoutine(userId: string, updates: Partial<DailyRoutine>): DailyRoutine {
    const list = this.getItem<DailyRoutine[]>('daily_routines', []);
    const idx = list.findIndex(r => r.userId === userId);
    const existing = idx >= 0 ? list[idx] : this.getDailyRoutine(userId);
    const updated = { ...existing, ...updates };
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    this.setItem('daily_routines', list);
    return updated;
  }

  // --- 4 & 5. EMOTION PREDICTIONS & MOOD RECORDS ---
  getEmotionPredictions(userId: string): EmotionPrediction[] {
    const list = this.getItem<EmotionPrediction[]>('emotion_predictions', []);
    return list.filter(p => p.userId === userId);
  }

  addEmotionPrediction(prediction: EmotionPrediction): void {
    const list = this.getItem<EmotionPrediction[]>('emotion_predictions', []);
    list.unshift(prediction);
    // keep maximum 200 records per client
    this.setItem('emotion_predictions', list.slice(0, 200));
  }

  updateEmotionFeedback(predictionId: string, isCorrect: boolean, correction?: EmotionType, note?: string): void {
    const list = this.getItem<EmotionPrediction[]>('emotion_predictions', []);
    const item = list.find(p => p.id === predictionId);
    if (item) {
      item.isConfirmedByUser = isCorrect;
      item.userCorrection = correction;
      item.feedbackNote = note;
      this.setItem('emotion_predictions', list);

      // Also record in user_feedback relational table
      this.addUserFeedback({
        id: generateUUID(),
        predictionId,
        userId: item.userId,
        isCorrect,
        correctedEmotion: correction,
        feedbackText: note,
        timestamp: new Date().toISOString()
      });
    }
  }

  addUserFeedback(record: UserFeedbackRecord): void {
    const list = this.getItem<UserFeedbackRecord[]>('user_feedback', []);
    list.unshift(record);
    this.setItem('user_feedback', list);
  }

  getUserFeedbacks(userId: string): UserFeedbackRecord[] {
    const list = this.getItem<UserFeedbackRecord[]>('user_feedback', []);
    return list.filter(f => f.userId === userId);
  }

  getMoodRecords(userId: string): MoodRecord[] {
    const list = this.getItem<MoodRecord[]>('mood_records', []);
    return list.filter(m => m.userId === userId);
  }

  addMoodRecord(record: MoodRecord): void {
    const list = this.getItem<MoodRecord[]>('mood_records', []);
    list.unshift(record);
    this.setItem('mood_records', list);
  }

  // --- 6. BEHAVIOR METRICS & BASELINE ---
  getBehaviorMetrics(userId: string): BehaviorMetrics[] {
    const list = this.getItem<BehaviorMetrics[]>('behavior_metrics', []);
    return list.filter(b => b.userId === userId);
  }

  addBehaviorMetric(metric: BehaviorMetrics): void {
    const list = this.getItem<BehaviorMetrics[]>('behavior_metrics', []);
    list.unshift(metric);
    this.setItem('behavior_metrics', list.slice(0, 100));
  }

  getPersonalBaseline(userId: string): PersonalBehaviorBaseline {
    const list = this.getItem<PersonalBehaviorBaseline[]>('behavior_baselines', []);
    const found = list.find(b => b.userId === userId);
    if (found) return found;

    const defaultBaseline: PersonalBehaviorBaseline = {
      userId,
      normalTypingSpeedWpm: 46,
      normalCorrectionRatePct: 4.2,
      normalSessionDurationMin: 22,
      normalAppSwitchesPerHour: 12,
      lastUpdated: new Date().toISOString()
    };
    list.push(defaultBaseline);
    this.setItem('behavior_baselines', list);
    return defaultBaseline;
  }

  updatePersonalBaseline(userId: string, updates: Partial<PersonalBehaviorBaseline>): PersonalBehaviorBaseline {
    const list = this.getItem<PersonalBehaviorBaseline[]>('behavior_baselines', []);
    const idx = list.findIndex(b => b.userId === userId);
    const existing = idx >= 0 ? list[idx] : this.getPersonalBaseline(userId);
    const updated = { ...existing, ...updates, lastUpdated: new Date().toISOString() };
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    this.setItem('behavior_baselines', list);
    return updated;
  }

  // --- 7 & 8. SCREEN TIME & APP USAGE ---
  // Role‑aware data fetchers – admins can retrieve all records, users only their own
  getScreenTimeRecordsForUser(requestingUserId: string, role: 'admin' | 'user'): ScreenTimeRecord[] {
    if (role === 'admin') {
      // Return every record regardless of user
      return this.getItem<ScreenTimeRecord[]>('screen_time_records', []);
    }
    return this.getScreenTimeRecords(requestingUserId);
  }

  getBehaviorMetricsForUser(requestingUserId: string, role: 'admin' | 'user'): BehaviorMetrics[] {
    if (role === 'admin') {
      return this.getItem<BehaviorMetrics[]>('behavior_metrics', []);
    }
    return this.getBehaviorMetrics(requestingUserId);
  }

  getMoodRecordsForUser(requestingUserId: string, role: 'admin' | 'user'): MoodRecord[] {
    if (role === 'admin') {
      return this.getItem<MoodRecord[]>('mood_records', []);
    }
    return this.getMoodRecords(requestingUserId);
  }

  getEmotionPredictionsForUser(requestingUserId: string, role: 'admin' | 'user'): EmotionPrediction[] {
    if (role === 'admin') {
      return this.getItem<EmotionPrediction[]>('emotion_predictions', []);
    }
    return this.getEmotionPredictions(requestingUserId);
  }

  getAppointmentsForUser(requestingUserId: string, role: 'admin' | 'user'): Appointment[] {
    if (role === 'admin') {
      return this.getItem<Appointment[]>('appointments', []);
    }
    return this.getAppointments(requestingUserId);
  }

  getUsersForUser(role: 'admin' | 'user'): UserProfile[] {
    if (role === 'admin') {
      return this.getUsers();
    }
    return [];
  }

  getScreenTimeRecords(userId: string): ScreenTimeRecord[] {
    return this.getItem<ScreenTimeRecord[]>('screen_time_records', []).filter(r => r.userId === userId);
  }

  getTodayScreenTime(userId: string): ScreenTimeRecord {
    const todayStr = new Date().toISOString().split('T')[0];
    const records = this.getScreenTimeRecords(userId);
    const found = records.find(r => r.date === todayStr);
    if (found) return found;

    const defaultToday: ScreenTimeRecord = {
      id: generateUUID(),
      userId,
      date: todayStr,
      totalScreenTimeMin: 345, // 5h 45m
      nightScreenTimeMin: 45,
      unlockCount: 68,
      apps: [
        { id: 'app-1', appName: 'VS Code / Study IDE', category: 'Study & Work', durationMin: 150, lastOpened: '10 mins ago' },
        { id: 'app-2', appName: 'MindSync Wellness', category: 'Wellness & Utilities', durationMin: 25, lastOpened: 'Just now' },
        { id: 'app-3', appName: 'Browser & Research', category: 'Productivity', durationMin: 95, lastOpened: '25 mins ago' },
        { id: 'app-4', appName: 'Messaging & Social', category: 'Social Media', durationMin: 55, lastOpened: '1 hour ago' },
        { id: 'app-5', appName: 'Media Player', category: 'Entertainment', durationMin: 20, lastOpened: '3 hours ago' }
      ]
    };
    const all = this.getItem<ScreenTimeRecord[]>('screen_time_records', []);
    all.push(defaultToday);
    this.setItem('screen_time_records', all);
    return defaultToday;
  }

  saveScreenTimeRecord(record: ScreenTimeRecord): void {
    const list = this.getItem<ScreenTimeRecord[]>('screen_time_records', []);
    const idx = list.findIndex(r => r.userId === record.userId && r.date === record.date);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    this.setItem('screen_time_records', list);
  }

  getScreenTimeGoal(userId: string): ScreenTimeGoal {
    const list = this.getItem<ScreenTimeGoal[]>('screen_time_goals', []);
    const found = list.find(g => g.userId === userId);
    if (found) return found;

    const defaultGoal: ScreenTimeGoal = {
      userId,
      dailyTargetMin: 300, // 5 hours
      warningThresholdMin: 240, // 4 hours
      highUsageThresholdMin: 360 // 6 hours
    };
    list.push(defaultGoal);
    this.setItem('screen_time_goals', list);
    return defaultGoal;
  }

  updateScreenTimeGoal(userId: string, updates: Partial<ScreenTimeGoal>): ScreenTimeGoal {
    const list = this.getItem<ScreenTimeGoal[]>('screen_time_goals', []);
    const idx = list.findIndex(g => g.userId === userId);
    const existing = idx >= 0 ? list[idx] : this.getScreenTimeGoal(userId);
    const updated = { ...existing, ...updates };
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    this.setItem('screen_time_goals', list);
    return updated;
  }

  // --- 9. WELLNESS RECOMMENDATIONS ---
  getWellnessRecommendations(userId: string): WellnessRecommendation[] {
    const list = this.getItem<WellnessRecommendation[]>('wellness_recommendations', []);
    const userList = list.filter(w => w.userId === userId);
    if (userList.length > 0) return userList;

    const defaultRecs: WellnessRecommendation[] = [
      {
        id: generateUUID(),
        userId,
        type: 'breathing',
        title: 'Take a 3-Minute Box Breathing Break',
        description: 'Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. Lowers sympathetic nervous arousal.',
        triggerReason: 'High interaction rate and continuous screen session',
        isCompleted: false,
        createdAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        userId,
        type: 'walk',
        title: '5-Minute Posture Reset & Short Walk',
        description: 'Step away from screen light, stretch shoulders and neck, and let eye muscles relax at distance.',
        triggerReason: 'Over 2 hours continuous screen exposure',
        isCompleted: false,
        createdAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        userId,
        type: 'hydration',
        title: 'Drink a Glass of Cool Water',
        description: 'Physical hydration replenishes mental acuity and eases fatigue.',
        triggerReason: 'Afternoon energy drop indicator',
        isCompleted: false,
        createdAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        userId,
        type: 'journaling',
        title: 'Mindful Journaling Reflection',
        description: 'Jot down 2 things that gave you clarity today and 1 friction you want to let go of.',
        triggerReason: 'Mild tension pattern detected',
        isCompleted: false,
        createdAt: new Date().toISOString()
      }
    ];
    this.setItem('wellness_recommendations', [...list, ...defaultRecs]);
    return defaultRecs;
  }

  toggleRecommendation(id: string): void {
    const list = this.getItem<WellnessRecommendation[]>('wellness_recommendations', []);
    const item = list.find(w => w.id === id);
    if (item) {
      item.isCompleted = !item.isCompleted;
      this.setItem('wellness_recommendations', list);
    }
  }

  // --- 10, 11 & 12. HEALTHCARE PROVIDERS & AVAILABILITY ---
  getProviders(): HealthcareProvider[] {
    const list = this.getItem<HealthcareProvider[]>('providers', []);
    if (list.length === 0) {
      this.setItem('providers', SEED_PROVIDERS);
      return SEED_PROVIDERS;
    }
    return list;
  }

  getProviderById(id: string): HealthcareProvider | null {
    return this.getProviders().find(p => p.id === id) || null;
  }

  // --- 13 & 14. APPOINTMENTS & CONSULTATION SESSIONS ---
  getAppointments(userId: string): Appointment[] {
    const list = this.getItem<Appointment[]>('appointments', []);
    return list.filter(a => a.userId === userId);
  }

  saveAppointment(appointment: Appointment): void {
    const list = this.getItem<Appointment[]>('appointments', []);
    const idx = list.findIndex(a => a.id === appointment.id);
    if (idx >= 0) {
      list[idx] = appointment;
    } else {
      list.unshift(appointment);
    }
    this.setItem('appointments', list);
  }

  cancelAppointment(appointmentId: string): void {
    const list = this.getItem<Appointment[]>('appointments', []);
    const item = list.find(a => a.id === appointmentId);
    if (item) {
      item.status = 'cancelled';
      this.setItem('appointments', list);
    }
  }

  rescheduleAppointment(appointmentId: string, newDate: string, newTimeSlot: string): void {
    const list = this.getItem<Appointment[]>('appointments', []);
    const item = list.find(a => a.id === appointmentId);
    if (item) {
      item.date = newDate;
      item.timeSlot = newTimeSlot;
      item.status = 'confirmed';
      this.setItem('appointments', list);
    }
  }

  completeAppointment(appointmentId: string, notes?: string, wellness?: string[]): void {
    const list = this.getItem<Appointment[]>('appointments', []);
    const item = list.find(a => a.id === appointmentId);
    if (item) {
      item.status = 'completed';
      if (notes) item.doctorNotes = notes;
      if (wellness) item.prescribedWellness = wellness;
      this.setItem('appointments', list);

      // Record consultation session
      this.saveConsultationSession({
        id: generateUUID(),
        appointmentId,
        providerId: item.providerId,
        userId: item.userId,
        startTime: new Date(Date.now() - 30 * 60000).toISOString(),
        endTime: new Date().toISOString(),
        durationMin: 30,
        status: 'completed',
        doctorSummaryNotes: notes || 'Consultation concluded successfully. Client encouraged to practice regular sleep hygiene.'
      });
    }
  }

  getConsultationSessions(userId: string): ConsultationSession[] {
    const list = this.getItem<ConsultationSession[]>('consultation_sessions', []);
    return list.filter(c => c.userId === userId);
  }

  saveConsultationSession(session: ConsultationSession): void {
    const list = this.getItem<ConsultationSession[]>('consultation_sessions', []);
    list.unshift(session);
    this.setItem('consultation_sessions', list);
  }

  // --- 15. EMERGENCY CONTACTS & CRISIS HELPLINES ---
  getEmergencyContacts(userId: string): EmergencyContact[] {
    const list = this.getItem<EmergencyContact[]>('emergency_contacts', []);
    const userContacts = list.filter(c => c.id.startsWith(userId));
    if (userContacts.length > 0) return userContacts;

    const defaultContact: EmergencyContact = {
      id: `${userId}_ec_1`,
      name: 'Aditya Sharma',
      relationship: 'Brother / Guardian',
      phone: '+91 98765 43210',
      isPrimary: true
    };
    list.push(defaultContact);
    this.setItem('emergency_contacts', list);
    return [defaultContact];
  }

  saveEmergencyContact(contact: EmergencyContact): void {
    const list = this.getItem<EmergencyContact[]>('emergency_contacts', []);
    const idx = list.findIndex(c => c.id === contact.id);
    if (idx >= 0) {
      list[idx] = contact;
    } else {
      list.push(contact);
    }
    this.setItem('emergency_contacts', list);
  }

  deleteEmergencyContact(id: string): void {
    const list = this.getItem<EmergencyContact[]>('emergency_contacts', []);
    this.setItem('emergency_contacts', list.filter(c => c.id !== id));
  }

  getCrisisHelplines(): CrisisHelpline[] {
    return SEED_CRISIS_HELPLINES;
  }

  // --- 16. NOTIFICATIONS & ANOMALIES ---
  getNotifications(userId: string): NotificationRecord[] {
    const list = this.getItem<NotificationRecord[]>('notifications', []);
    return list.filter(n => n.userId === userId);
  }

  addNotification(notification: NotificationRecord): void {
    const list = this.getItem<NotificationRecord[]>('notifications', []);
    list.unshift(notification);
    this.setItem('notifications', list.slice(0, 50));
  }

  markAllNotificationsRead(userId: string): void {
    const list = this.getItem<NotificationRecord[]>('notifications', []);
    list.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.setItem('notifications', list);
  }

  // --- DATA AUDIT, EXPORT & PURGE (PRIVACY COMPLIANCE) ---
  exportAllUserData(userId: string): Record<string, unknown> {
    return {
      exportedAt: new Date().toISOString(),
      user: this.getUserById(userId),
      preferences: this.getPreferences(userId),
      dailyRoutine: this.getDailyRoutine(userId),
      emotionPredictions: this.getEmotionPredictions(userId),
      userFeedback: this.getUserFeedbacks(userId),
      moodRecords: this.getMoodRecords(userId),
      behaviorMetrics: this.getBehaviorMetrics(userId),
      baseline: this.getPersonalBaseline(userId),
      screenTimeRecords: this.getScreenTimeRecords(userId),
      appointments: this.getAppointments(userId),
      consultationSessions: this.getConsultationSessions(userId),
      emergencyContacts: this.getEmergencyContacts(userId),
      privacyNote: 'MindSync processes facial inference and behavioral dynamics on-device. No raw camera frames or third-party message logs are collected.'
    };
  }

  purgeUserData(userId: string): void {
    const filterOutUser = (key: string) => {
      try {
        const raw = localStorage.getItem(this.prefix + key);
        if (!raw) return;
        const items = JSON.parse(raw);
        if (Array.isArray(items)) {
          const filtered = items.filter((item: Record<string, unknown>) => item.userId !== userId && item.id !== userId);
          localStorage.setItem(this.prefix + key, JSON.stringify(filtered));
        }
      } catch {
        // ignore
      }
    };

    filterOutUser('users');
    filterOutUser('user_preferences');
    filterOutUser('daily_routines');
    filterOutUser('emotion_predictions');
    filterOutUser('user_feedback');
    filterOutUser('mood_records');
    filterOutUser('behavior_metrics');
    filterOutUser('behavior_baselines');
    filterOutUser('screen_time_records');
    filterOutUser('appointments');
    filterOutUser('consultation_sessions');
    filterOutUser('emergency_contacts');
    filterOutUser('notifications');
  }

  // --- SQL DDL SCHEMA GENERATOR ---
  generateSQLDDL(): string {
    return `-- ==========================================================
-- MindSync - Relational Database Schema DDL
-- Platform: AI-Powered Mental Wellness & Personalized Support
-- Supports PostgreSQL, MySQL 8+, and SQLite3
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INT CHECK (age >= 13 AND age <= 120),
    gender VARCHAR(32) DEFAULT 'prefer-not-to-say',
    location VARCHAR(120),
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);

-- 2. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    dark_mode BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT TRUE,
    camera_permission_granted BOOLEAN DEFAULT FALSE,
    location_permission_granted BOOLEAN DEFAULT FALSE,
    usage_access_granted BOOLEAN DEFAULT FALSE,
    behavior_tracking_granted BOOLEAN DEFAULT TRUE,
    data_sharing_opt_in BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Daily Routines Table
CREATE TABLE IF NOT EXISTS daily_routines (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    wake_up_time TIME NOT NULL DEFAULT '06:30',
    sleep_time TIME NOT NULL DEFAULT '22:30',
    study_work_start TIME DEFAULT '09:00',
    study_work_end TIME DEFAULT '17:00',
    exercise_time TIME DEFAULT '18:00',
    break_interval_min INT DEFAULT 45,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '07:00'
);

-- 4. Mood Records Table (User-reported subjective mood)
CREATE TABLE IF NOT EXISTS mood_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    manual_mood VARCHAR(32) NOT NULL,
    energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
    notes TEXT
);
CREATE INDEX idx_mood_records_user ON mood_records(user_id, recorded_at);

-- 5. Emotion Predictions Table (Camera landmark inference)
CREATE TABLE IF NOT EXISTS emotion_predictions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    detected_emotion VARCHAR(32) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    blendshapes_json JSON,
    is_confirmed_by_user BOOLEAN DEFAULT NULL,
    user_correction VARCHAR(32) DEFAULT NULL,
    feedback_note TEXT
);
CREATE INDEX idx_emotion_predictions_user ON emotion_predictions(user_id, timestamp);

-- 6. Behavior Metrics Table (Keystroke & interaction dynamics)
CREATE TABLE IF NOT EXISTS behavior_metrics (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    typing_speed_wpm DECIMAL(5,2),
    backspace_rate_pct DECIMAL(5,2),
    pause_duration_ms INT,
    session_duration_min INT,
    app_switch_count INT,
    is_anomaly BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_behavior_metrics_user ON behavior_metrics(user_id, timestamp);

-- 7. Screen Time Records Table
CREATE TABLE IF NOT EXISTS screen_time_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    total_screen_time_min INT NOT NULL DEFAULT 0,
    night_screen_time_min INT NOT NULL DEFAULT 0,
    unlock_count INT DEFAULT 0,
    CONSTRAINT uq_user_screentime_date UNIQUE (user_id, record_date)
);

-- 8. App Usage Records Table
CREATE TABLE IF NOT EXISTS app_usage_records (
    id VARCHAR(64) PRIMARY KEY,
    screen_time_record_id VARCHAR(64) NOT NULL REFERENCES screen_time_records(id) ON DELETE CASCADE,
    app_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    duration_min INT NOT NULL DEFAULT 0,
    last_opened TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_app_usage_screentime ON app_usage_records(screen_time_record_id);

-- 9. Wellness Recommendations Table
CREATE TABLE IF NOT EXISTS wellness_recommendations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    trigger_reason VARCHAR(255),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Healthcare Providers Directory Table
CREATE TABLE IF NOT EXISTS providers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    qualification VARCHAR(200) NOT NULL,
    specialization VARCHAR(64) NOT NULL,
    experience_years INT NOT NULL,
    consultation_fee INT NOT NULL,
    clinic_location VARCHAR(255) NOT NULL,
    city VARCHAR(64) NOT NULL,
    lat DECIMAL(9,6) NOT NULL,
    lng DECIMAL(9,6) NOT NULL,
    languages TEXT NOT NULL,
    is_online_available BOOLEAN DEFAULT TRUE,
    is_in_person_available BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    photo_url VARCHAR(500)
);
CREATE INDEX idx_providers_specialization ON providers(specialization);
CREATE INDEX idx_providers_city ON providers(city);
CREATE INDEX idx_providers_fee ON providers(consultation_fee);

-- 11. Provider Specializations Table (Normalized)
CREATE TABLE IF NOT EXISTS provider_specializations (
    id VARCHAR(64) PRIMARY KEY,
    provider_id VARCHAR(64) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    focus_area VARCHAR(100) NOT NULL
);

-- 12. Provider Availability Slots Table
CREATE TABLE IF NOT EXISTS provider_availability (
    id VARCHAR(64) PRIMARY KEY,
    provider_id VARCHAR(64) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    available_day VARCHAR(10) NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE
);

-- 13. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id VARCHAR(64) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    consultation_type VARCHAR(20) NOT NULL CHECK (consultation_type IN ('virtual', 'in-person')),
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    doctor_notes TEXT,
    prescribed_wellness TEXT
);
CREATE INDEX idx_appointments_user ON appointments(user_id, appointment_date);

-- 14. Consultation Sessions Table (Telehealth records)
CREATE TABLE IF NOT EXISTS consultation_sessions (
    id VARCHAR(64) PRIMARY KEY,
    appointment_id VARCHAR(64) NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    provider_id VARCHAR(64) NOT NULL REFERENCES providers(id),
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_min INT,
    status VARCHAR(32) NOT NULL,
    doctor_summary_notes TEXT,
    client_feedback TEXT
);

-- 15. User Feedback Table (ML Personalization loop)
CREATE TABLE IF NOT EXISTS user_feedback (
    id VARCHAR(64) PRIMARY KEY,
    prediction_id VARCHAR(64) NOT NULL REFERENCES emotion_predictions(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    corrected_emotion VARCHAR(32),
    feedback_text TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Notifications & Alerts Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
`;
  }
}

export const db = new MindSyncDatabase();
