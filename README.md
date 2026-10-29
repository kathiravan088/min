# 🧠 MindSync – AI-Powered Mental Wellness & Personalized Support Platform

> **An Academic Mini-Project & Privacy-Conscious Multimodal Mental Wellness Application**  
> *Estimates transient emotional states from permitted signals, tracks behavioral stress dynamics, provides routine-aware device reminders, and connects users with verified mental healthcare professionals.*

---

## 🌟 Overview & Problem Statement

Modern individuals experience heightened levels of digital fatigue, workplace anxiety, and acute neuromotor stress. However, traditional mental health platforms suffer from severe drawbacks:
1. **Intrusive surveillance**: Sending raw facial video or unencrypted keylogs to remote servers violates privacy.
2. **Diagnostic overreach**: Many consumer apps irresponsibly claim to diagnose clinical psychiatric disorders.
3. **Fragmented care**: Disconnect between daily personal self-regulation tools and verified clinical telehealth access.

**MindSync** solves these challenges by implementing an **Edge-First, Privacy-Preserving Multimodal Platform**:
- Real-time facial expression estimation using **FACS (Facial Action Coding System) Action Units** processed 100% locally in-browser.
- In-app behavioral stress tracking using keystroke timing dynamics against personalized statistical baselines.
- Screen-time awareness attuned to circadian sleep schedules and continuous usage limits.
- Interactive somatic wellness toolkit (4-4-4-4 Box Breathing, 4-7-8 Sphere, 5-4-3-2-1 Sensory Grounding).
- Verified mental healthcare directory with Haversine GPS radius filtering and mock encrypted telehealth room.
- Complete **16-table relational database architecture** with full GDPR/DPDP data export and one-click total erasure.

---

## 🚀 Key Features

### 1. 🔐 Privacy-First Authentication & Routine Configuration
- Client-side SHA-256 password hashing via Web Cryptography API (`crypto.subtle.digest`).
- Cryptographically random session tokens (`crypto.getRandomValues()`).
- Circadian profile configuration: typical sleep/wake schedule, daily screen targets, and quiet hours.

### 2. 📷 Camera-Based Emotional State Estimation (FACS AU1 – AU26)
- Explicit opt-in with unmistakable camera-active indicator.
- MediaPipe Face Landmarker integration with 478 3D landmarks mapped to Action Units:
  - **AU1/AU2**: Brow Raisers (Surprise / Sadness)
  - **AU4**: Brow Lowerer (Tension / Anger)
  - **AU6/AU12**: Cheek Raiser & Smile Puller (Duchenne Happiness)
  - **AU7**: Lid Tightener (Stress / Fatigue)
  - **AU15**: Lip Corner Depressor (Sadness)
- Softmax confidence normalization with interactive calibration feedback loop (*"Correct"* / *"Not Correct"*).
- **Academic Expression Tester**: Allows evaluators without a physical webcam to simulate facial blendshapes with preset buttons.

### 3. ⌨️ Behavioral Stress Dynamics (Keystroke Cadence)
- Analyzes typing velocity (WPM), backspace correction percentage ($B_r$), and hesitation latencies ($> 1200\text{ ms}$) within an in-app sandbox.
- Establishes a personal baseline $(\mu, \sigma)$ to prevent bias between fast and slow typists.
- Triggers a **Multimodal Stress Anomaly Alert** when real-time deviations exceed $2.0\sigma$.

### 4. 📱 Screen-Time Tracking & Circadian Reminders
- Category breakdown (Social, Productivity, Entertainment, Utility, Reading).
- Automatic detection of continuous usage breaches ($> 4\text{ hours}$) and late-night sleep window violations.
- Educational architectural blueprint contrasting Web Sandbox limitations with Android native `android.permission.PACKAGE_USAGE_STATS`.

### 5. 🧘 Personalized Somatic Wellness Toolkit
- **Box Breathing (4-4-4-4)** with expanding SVG visual guidance and phase counters.
- **4-7-8 Deep Relaxation** breathing sphere.
- **5-4-3-2-1 Sensory Grounding** exercise for acute panic or sensory overload.
- **20-20-20 Visual Break** for ocular fatigue.
- **Private Encrypted Journal** with local mood sentiment tagging.

### 6. 🩺 Verified Provider Directory & Telehealth Room
- Filter clinical psychologists, psychiatrists, and counselors by specialization, verified fee (₹500 – ₹3,000 INR), and GPS radius.
- Real-time Haversine spherical distance calculation from user coordinates.
- Appointment scheduling modal for both **Virtual Telehealth** and **In-Person Clinic** visits.
- **Mock Telehealth Consultation Room**: Simulated encrypted video bridge, real-time dynamic audio waveform, in-call chat, duration timer, and post-session doctor notes.

### 7. 🛡️ Emergency Support & Regulatory Compliance
- Instant one-tap access to verified national crisis lines: **Tele-MANAS (14416)**, **KIRAN Mental Health (1800-599-0019)**, and **National Emergency (112)**.
- Trusted emergency contact management.
- Complete compliance with **DPDP Act, 2023 (India)** and **GDPR (EU)**:
  - **One-click complete data purge** across all 16 relational tables.
  - **Open JSON data download** for full data portability.
  - Interactive SQL DDL schema viewer.

---

## 🏗️ System Architecture & Database Design

```
+----------------------------------------------------------------------------------+
|                            MINDSYNC PRESENTATION LAYER                           |
|       (Responsive UI, Camera HUD, Emotion Gauge, Interactive Breathing Pacer)     |
+----------------------------------------------------------------------------------+
          |                                  |                             |
          v                                  v                             v
+-----------------------+        +-----------------------+     +-----------------------+
| Camera & FACS Engine  |        | Keystroke Stress Engine|    | Screen Time & Routine |
| - MediaPipe Landmarks |        | - WPM & Latency Calc  |     | - Sleep Window Checks |
| - Softmax Classifier  |        | - Z-Score Anomaly     |     | - 4h Threshold Breaker|
+-----------------------+        +-----------------------+     +-----------------------+
          \                                  |                             /
           \                                 |                            /
            v                                v                           v
+----------------------------------------------------------------------------------+
|                       MULTIMODAL STRESS SYNTHESIS ENGINE                         |
|             MSI = 0.40(Facial) + 0.35(Keystroke) + 0.25(Circadian)               |
+----------------------------------------------------------------------------------+
                                         |
                                         v
+----------------------------------------------------------------------------------+
|                         RELATIONAL CLIENT-SIDE DATABASE                          |
|  [users] [user_sessions] [user_routines] [emotion_logs] [behavior_baselines]     |
|  [behavior_logs] [screen_time_logs] [wellness_activities] [journal_entries]      |
|  [providers] [provider_slots] [appointments] [telehealth_sessions]               |
|  [consultation_notes] [emergency_contacts] [audit_logs]                          |
+----------------------------------------------------------------------------------+
```

For complete architectural documents, see:
- [System Architecture & Flowcharts](file:///d:/Min/docs/SYSTEM_ARCHITECTURE.md)
- [Relational Database Schema & SQL DDL](file:///d:/Min/docs/DATABASE_SCHEMA.md)
- [Machine Learning & FACS Pipelines](file:///d:/Min/docs/ML_PIPELINE.md)
- [Privacy Model & Android Permissions](file:///d:/Min/docs/PRIVACY_AND_PERMISSIONS.md)
- [Academic Testing Strategy (15 Test Cases)](file:///d:/Min/docs/TESTING_STRATEGY.md)

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript
- **Build Tool**: Vite 6
- **Styling**: Vanilla CSS (Modern CSS variables, glassmorphic surfaces, responsive layouts, micro-animations)
- **Computer Vision & ML**: FACS Action Unit estimation, MediaPipe Blendshape algorithms
- **Cryptography**: Web Cryptography API (`SubtleCrypto` for SHA-256, CSPRNG for session IDs)
- **Spatial Geometry**: Haversine formula for spherical distance calculations
- **State Management**: React Context + Indexed Relational Database Engine

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd Min
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### 3. Build for Production
```bash
npm run build
```
Generates an optimized production bundle in the `dist/` directory with zero TypeScript errors.

---

## 🎓 Academic Evaluator & Demo Guide

MindSync includes a dedicated **Demo Mode** banner at the top of the application for instantaneous evaluation:

1. **Test Face Emotion Recognition**:
   - Navigate to the **"Face Scan"** tab.
   - If a camera is connected, grant permission to see the real-time HUD and FACS blendshapes.
   - If no camera is available, use the **Expression Tester** below the preview to simulate *Happy*, *Sad*, *Angry*, *Surprised*, or *Stressed* states.
   - Test the adaptive feedback loop by clicking *"Not Correct"* and providing a correction.
2. **Trigger Multimodal Anomaly Preset**:
   - Click the banner preset: **"Simulate High Stress (FACS + Typing Anomaly)"**.
   - Observe how the Multimodal Stress Index jumps to 88/100, the warning banner highlights neuromotor tension, and recommended calming exercises appear.
3. **Simulate Sleep Window Violation**:
   - Click the banner preset: **"Simulate Late Night (Sleep Violation)"**.
   - Navigate to the **"Screen Time"** tab to verify circadian sleep window violation warnings.
4. **Test Provider Search & Telehealth Room**:
   - Navigate to the **"Directory"** tab.
   - Adjust the fee slider (e.g. max ₹1,200) and city radius to watch providers filter dynamically.
   - Click **"Book Appointment"** on any therapist, select tomorrow's date, and confirm.
   - Navigate to the **"Appointments"** tab and click **"Join Virtual Room"** to experience the virtual consultation room with video, audio waveform, and notes.
5. **Inspect SQL DDL & Verify Data Purge**:
   - Navigate to the **"Privacy"** tab.
   - View the generated SQL DDL for all 16 tables.
   - Click **"Download My Data (JSON)"** to verify export.
   - Click **"Purge All Local Data"** to verify GDPR erasure.

---

## ⚖️ Ethical AI & Medical Disclaimer

> **IMPORTANT DISCLAIMER**:  
> MindSync is an academic software prototype developed solely for educational, research, and supportive wellness purposes. It is **not** a certified medical diagnostic device and does **not** provide clinical diagnosis, medical treatment, or psychiatric assessment. Facial expressions and keystroke dynamics provide probabilistic estimates of transient emotional state and neuromotor tension, but do not prove internal affective state or clinical condition. Anyone experiencing severe emotional distress or suicidal thoughts should contact national crisis helplines immediately (Tele-MANAS: **14416** | KIRAN: **1800-599-0019** | Emergency: **112**).

---

## 📄 License
Academic Mini-Project – Developed for educational evaluation.
