// MindSync - TypeScript Type Definitions

export type EmotionType =
  | 'Neutral'
  | 'Happy'
  | 'Sad'
  | 'Angry'
  | 'Fearful'
  | 'Surprised'
  | 'Stressed/Tense';

export type ConsultationType = 'virtual' | 'in-person';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ProviderCategory = 'Psychologist' | 'Psychiatrist' | 'Counselor' | 'Therapist';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role?: 'user' | 'admin';
  age: number;
  gender: 'female' | 'male' | 'non-binary' | 'prefer-not-to-say';
  location: string;
  lat?: number;
  lng?: number;
  isLoggedIn: boolean;
  createdAt: string;
}

export interface UserPreferences {
  userId: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  cameraPermissionGranted: boolean;
  locationPermissionGranted: boolean;
  usageAccessGranted: boolean;
  behaviorTrackingGranted: boolean;
  dataSharingOptIn: boolean;
}

export interface DailyRoutine {
  userId: string;
  wakeUpTime: string; // e.g. "06:30"
  sleepTime: string;  // e.g. "22:30"
  studyWorkStart: string; // e.g. "09:00"
  studyWorkEnd: string;   // e.g. "17:00"
  exerciseTime: string;   // e.g. "18:00"
  breakIntervalMin: number; // e.g. 45
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
}

export interface BlendshapeFeatures {
  mouthSmileLeft: number;
  mouthSmileRight: number;
  browDownLeft: number;
  browDownRight: number;
  browInnerUp: number;
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  jawOpen: number;
  lipPucker: number;
  mouthPress: number;
}

export interface EmotionPrediction {
  id: string;
  userId: string;
  timestamp: string;
  detectedEmotion: EmotionType;
  confidenceScore: number; // 0 to 100
  blendshapes: BlendshapeFeatures;
  isConfirmedByUser?: boolean;
  userCorrection?: EmotionType;
  feedbackNote?: string;
}

export interface MoodRecord {
  id: string;
  userId: string;
  recordedAt: string;
  manualMood: EmotionType;
  energyLevel: number; // 1 to 5
  notes?: string;
}

export interface BehaviorMetrics {
  id: string;
  userId: string;
  timestamp: string;
  typingSpeedWpm: number;
  backspaceRatePct: number; // percentage of total keystrokes
  pauseDurationMs: number;
  sessionDurationMin: number;
  appSwitchCount: number;
  isAnomaly?: boolean;
}

export interface PersonalBehaviorBaseline {
  userId: string;
  normalTypingSpeedWpm: number;
  normalCorrectionRatePct: number;
  normalSessionDurationMin: number;
  normalAppSwitchesPerHour: number;
  lastUpdated: string;
}

export interface AppUsageRecord {
  id: string;
  appName: string;
  category: 'Productivity' | 'Social Media' | 'Entertainment' | 'Study & Work' | 'Wellness & Utilities';
  durationMin: number;
  icon?: string;
  lastOpened: string;
}

export interface ScreenTimeRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  totalScreenTimeMin: number;
  nightScreenTimeMin: number; // usage between sleepTime and wakeUpTime
  unlockCount: number;
  apps: AppUsageRecord[];
}

export interface ScreenTimeGoal {
  userId: string;
  dailyTargetMin: number; // e.g. 300 (5 hours)
  warningThresholdMin: number; // e.g. 240 (4 hours)
  highUsageThresholdMin: number; // e.g. 360 (6 hours)
}

export interface AnomalyDetectionResult {
  id: string;
  timestamp: string;
  triggered: boolean;
  severity: 'low' | 'moderate' | 'high';
  factors: string[];
  message: string;
  suggestedAction: string;
}

export interface WellnessRecommendation {
  id: string;
  userId: string;
  type: 'breathing' | 'walk' | 'hydration' | 'sleep' | 'journaling' | 'counseling';
  title: string;
  description: string;
  triggerReason: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface HealthcareProvider {
  id: string;
  name: string;
  photoUrl: string;
  qualification: string;
  specialization: ProviderCategory;
  focusAreas: string[];
  experienceYears: number;
  consultationFee: number; // in INR ₹
  clinicLocation: string;
  city: string;
  lat: number;
  lng: number;
  languages: string[];
  isOnlineAvailable: boolean;
  isInPersonAvailable: boolean;
  rating: number;
  reviewCount: number;
  availableDays: string[];
  availableTimeSlots: string[];
  distanceKm?: number;
}

export interface Appointment {
  id: string;
  userId: string;
  providerId: string;
  providerName: string;
  providerSpecialization: ProviderCategory;
  providerPhotoUrl: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  consultationType: ConsultationType;
  status: AppointmentStatus;
  notes?: string;
  bookedAt: string;
  doctorNotes?: string;
  prescribedWellness?: string[];
}

export interface ConsultationSession {
  id: string;
  appointmentId: string;
  providerId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationMin?: number;
  status: 'connecting' | 'connected' | 'completed' | 'disconnected';
  doctorSummaryNotes?: string;
  clientFeedback?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface CrisisHelpline {
  id: string;
  name: string;
  country: string;
  number: string;
  hours: string;
  description: string;
  type: 'government' | 'ngo' | 'emergency';
  verified: boolean;
}
