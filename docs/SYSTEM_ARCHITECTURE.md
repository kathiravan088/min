# MindSync: System Architecture & Technical Specifications

**Project Title:** MindSync – AI-Powered Mental Wellness and Personalized Support Platform  
**Academic Level:** College Final-Year Mini Project  
**Architecture Domain:** Privacy-Preserving Multimodal Mental Wellness & Telemedicine  

---

## 1. High-Level System Architecture

MindSync decouples client-side biometric inference from network communication, ensuring that all facial geometry and typing dynamics remain strictly on the user's device.

```mermaid
graph TD
    subgraph Client Device [Client Mobile / PWA Device]
        UI[MindSync UI Layer React 19 + TypeScript]
        
        subgraph OnDeviceML [On-Device Multimodal ML Pipeline]
            CAM[HTML5 Video / Camera Feed] --> LAND[FACS Facial Landmark Tracker]
            LAND --> BLEND[Blendshape Coefficients AU1-AU26]
            BLEND --> CLF[Emotion Classifier 7 States + Confidence]
            
            KEY[In-App Keystroke Dynamics] --> METRIC[WPM, Backspace %, Hesitation]
            METRIC --> BASE[Personal Baseline Comparator]
            BASE --> ANOM[Rule-Based Anomaly Detector]
            
            SCR[Device Usage / Screen Time Telemetry] --> ROUT[Sleep Window & Routine Engine]
        end
        
        subgraph Synthesis [Multimodal State Synthesis]
            CLF --> SYNTH[Holistic Wellness Assessment]
            ANOM --> SYNTH
            ROUT --> SYNTH
            FEEDBACK[User Confirmed / Corrected Mood] -->|Personalization Tuning| CLF
        end
        
        subgraph LocalData [Local Relational Data Engine - 16 Tables]
            SYNTH --> RDB[(Indexed Storage / Relational Client DB)]
            AUTH[Web Crypto SHA-256 Auth & Session Token] --> RDB
        end
    end
    
    subgraph ExternalServices [External & Telehealth Services]
        RDB -.->|Appointment State| TELE[Encrypted Telehealth Consultation Room]
        DIR[Provider Directory & Geolocation Radius] --> UI
        CRISIS[Verified 24/7 Crisis Helplines Tele-MANAS 14416] --> UI
    end
```

---

## 2. Module Architecture

The application is structured into 8 modular, loosely coupled subsystems:

| Module | Core Responsibility | Files |
| :--- | :--- | :--- |
| **Authentication & Profile** | User registration, SHA-256 client password hashing, session tokens, daily routine configuration | `src/context/AuthContext.tsx`, `src/utils/crypto.ts`, `src/components/profile/UserProfileView.tsx`, `src/components/auth/AuthModal.tsx` |
| **Relational Database** | 16-table relational schema abstraction, foreign-key relationships, CRUD, JSON export, and SQL DDL generator | `src/db/database.ts`, `src/types/index.ts` |
| **Camera & Facial ML** | WebCam video streaming, FACS geometric action unit extraction, emotion inference, confidence gauge, and user feedback loop | `src/ml/emotionClassifier.ts`, `src/components/camera/CameraEmotionEstimator.tsx` |
| **Mood Analytics** | Today's timeline, 7-day stacked trend graph, positive/neutral/tension ratios, subjective check-in logger | `src/components/mood/MoodTrendDashboard.tsx` |
| **Behavior Dynamics** | In-app typing test, WPM and correction rate tracking, personal baseline calibration, and multimodal anomaly alerts | `src/components/behavior/BehaviorStressTracker.tsx` |
| **Screen Time & Routine** | App duration tracking, multi-threshold warnings (4h/6h), sleep window evaluation, and quiet hours enforcement | `src/components/screentime/ScreenTimeMonitor.tsx` |
| **Wellness & Grounding** | Interactive box breathing (4-4-4-4) & 4-7-8 pacer, 5-4-3-2-1 grounding, 20-20-20 screen break, private journal | `src/components/wellness/WellnessToolkit.tsx` |
| **Healthcare & Telehealth** | Provider directory with location/radius filters, price range slider, booking modal, appointments manager, and mock teleconsultation | `src/components/directory/ProviderDirectory.tsx`, `src/components/appointments/`, `src/components/telehealth/` |
| **Crisis & Emergency** | Verified national 24/7 helplines (Tele-MANAS 14416, KIRAN, 112), trusted emergency contact manager | `src/components/emergency/EmergencySupport.tsx` |
| **Privacy & Sovereignty** | Sensor permission controls, data audit, GDPR export, and technical limitations matrix | `src/components/privacy/PrivacyCenter.tsx` |

---

## 3. Data-Flow Diagrams (DFD)

### DFD Level 0 (Context Diagram)

```mermaid
flowchart LR
    User([User])
    MS((MindSync Platform))
    Doctor([Healthcare Provider])
    Helpline([Crisis Helplines / ERSS])

    User -->|Camera Permission + Facial Feed| MS
    User -->|In-App Typing Dynamics| MS
    User -->|Daily Routine Times & Mood Feedback| MS
    MS -->|Estimated State, Reminders & Grounding| User
    MS -->|Appointment Request & Video Session| Doctor
    Doctor -->|Consultation Summary & Notes| MS
    MS -->|Direct Emergency Dial 14416 / 112| Helpline
```

### DFD Level 1 (Subsystem Decomposition)

```mermaid
flowchart TD
    U[User] --> P1[1.0 Authentication & Session]
    P1 --> D1[(Users & Routines)]
    
    U --> P2[2.0 Facial Action Unit Extraction]
    P2 --> P3[3.0 Emotion Classification Engine]
    P3 --> D2[(Emotion Predictions & Feedback)]
    
    U --> P4[4.0 In-App Behavioral Monitor]
    P4 --> P5[5.0 Baseline Anomaly Comparator]
    D1 -.-> P5
    P5 --> D3[(Behavioral Metrics)]
    
    P6[6.0 Screen Time & Sleep Engine] --> D4[(Screen Time Records)]
    D1 -.-> P6
    
    P3 & P5 & P6 --> P7[7.0 Multimodal Synthesis & Alert Engine]
    P7 --> U
    
    U --> P8[8.0 Provider Directory & Telehealth]
    P8 --> D5[(Appointments & Teleconsultations)]
```

---

## 4. Application Flowchart

```mermaid
flowchart TD
    Start([User Opens MindSync]) --> CheckAuth{Is Authenticated?}
    CheckAuth -- No --> AuthChoice[Sign In or Register with Routine Settings]
    AuthChoice --> Dashboard[Main Dashboard Overview]
    CheckAuth -- Yes --> Dashboard

    Dashboard --> Choice{Select Action}
    
    Choice --> Mood[Mood & Camera Scan]
    Mood --> CamPerm{Camera Permission Granted?}
    CamPerm -- Yes --> RunLandmarks[Extract FACS Landmarks AU1-26]
    RunLandmarks --> Classify[Compute Emotion & Confidence]
    Classify --> FeedbackPrompt[User Feedback: Correct / Not Correct]
    FeedbackPrompt --> StorePred[Store in Database & Tune Weights]
    CamPerm -- No --> PresetSim[Use Expression Tester / Simulator]
    
    Choice --> Screen[Screen Time Monitor]
    Screen --> CheckSleep{Current Time in Sleep Window?}
    CheckSleep -- Yes --> SleepAlert[Show Gentle Sleep Rest Reminder]
    CheckSleep -- No --> CheckGoal{Screen Time > Target?}
    CheckGoal -- Yes --> BreakAlert[Show Healthy Break Reminder]
    CheckGoal -- No --> NormalScreen[Display Per-App Breakdown]
    
    Choice --> Typing[Behavioral Rhythm Sandbox]
    Typing --> TrackStrokes[Compute WPM & Correction %]
    TrackStrokes --> CompareBase{Differs from Baseline by >2x?}
    CompareBase -- Yes --> AnomalySupport[Trigger Gentle Supportive Banner]
    CompareBase -- No --> BaselineNormal[Confirm Rhythm Consistent]
    
    Choice --> Doctor[Find Counselor & Book]
    Doctor --> LocFilter[Filter by City / GPS Radius & Price Range]
    LocFilter --> SelectDoc[Select Date, Time Slot, Virtual/In-Person]
    SelectDoc --> BookApt[Confirm Appointment & Notify]
    BookApt --> TeleRoom[Launch Encrypted Virtual Video Room]
```

---

## 5. Mock REST API Specifications

The relational database engine supports the following API contracts:

### Authentication Endpoints
- `POST /api/v1/auth/register`
  - Body: `{ name, email, passwordPlain, age, gender, location, wakeUpTime, sleepTime }`
  - Response: `{ success: true, token: "ms_...", user: UserProfile }`
- `POST /api/v1/auth/login`
  - Body: `{ email, passwordPlain }`
  - Response: `{ success: true, token: "ms_...", user: UserProfile }`

### Telemetry & Inferences
- `POST /api/v1/ml/emotion-predictions`
  - Body: `{ detectedEmotion, confidenceScore, blendshapes }`
  - Response: `{ id: "pred-...", timestamp: "..." }`
- `PUT /api/v1/ml/emotion-predictions/:id/feedback`
  - Body: `{ isCorrect: boolean, correctedEmotion?: EmotionType, note?: string }`
  - Response: `{ success: true, updatedPersonalAdjustments: Record<string, number> }`

### Appointments & Telehealth
- `GET /api/v1/providers?category=Psychologist&maxPrice=1500&city=Bengaluru`
  - Response: `{ providers: HealthcareProvider[] }`
- `POST /api/v1/appointments`
  - Body: `{ providerId, date, timeSlot, consultationType, notes }`
  - Response: `{ appointment: Appointment }`
- `POST /api/v1/telehealth/sessions/:id/complete`
  - Body: `{ durationMin: number, doctorNotes: string, prescribedWellness: string[] }`
  - Response: `{ session: ConsultationSession }`
