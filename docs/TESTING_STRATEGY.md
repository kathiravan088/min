# MindSync Testing Strategy & Academic Verification Suite

This document presents the complete testing methodology, automated test coverage, edge-case mitigation, and a formalized test matrix comprising 15 comprehensive academic test cases.

---

## 1. Testing Methodology

MindSync adheres to a multi-layered verification strategy:

```
+-------------------------------------------------------------+
|               LAYER 4: REGULATORY & SECURITY VERIFICATION   |
|     (DPDP / GDPR Compliance, Data Purge, Zero Leakage)      |
+-------------------------------------------------------------+
                              ^
+-------------------------------------------------------------+
|               LAYER 3: END-TO-END MULTIMODAL FLOWS          |
|    (Camera Scan -> Feedback Loop -> Anomaly -> Telehealth)  |
+-------------------------------------------------------------+
                              ^
+-------------------------------------------------------------+
|               LAYER 2: COMPONENT & INTEGRATION TESTS        |
|    (Modal Mounts, Distance Filters, State Synchronization)  |
+-------------------------------------------------------------+
                              ^
+-------------------------------------------------------------+
|               LAYER 1: CORE MATHEMATICAL & ALGORITHMIC UNIT |
|    (SHA-256 Hashes, FACS Softmax, Z-Scores, Haversine Dist) |
+-------------------------------------------------------------+
```

---

## 2. Comprehensive Academic Test Matrix (15 Test Cases)

| Test ID | Module | Test Scenario & Objective | Input / Test Action | Expected Result | Status |
|---|---|---|---|---|---|
| **TC-01** | **Authentication** | SHA-256 client password hashing and session token generation. | Register user with password `"SecureP@ss123"`. Inspect database records. | Password stored as 64-char hex string (`hashPassword`). Raw text never stored. Active session token generated. | **PASSED** |
| **TC-02** | **Camera & FACS** | Camera permission denial graceful degradation. | Revoke / reject camera permission prompt in browser settings. | Clear fallback banner shown. Application prompts manual mood input without crashing. Hardware light remains dark. | **PASSED** |
| **TC-03** | **Camera & FACS** | Real-time FACS Action Unit blendshape extraction and emotion estimation. | Camera feed active; user presents smile (AU6 + AU12 $> 0.50$). | System estimates `"Happy"` with confidence $> 75\%$. HUD highlights AU6 and AU12 in green. | **PASSED** |
| **TC-04** | **Adaptive ML** | User feedback correction updates personalized prototype vector. | Classifier predicts `"Surprised"`. User clicks `"Not Correct"` and selects `"Neutral"`. | Weight vector for Neutral adapts via $\mathbf{P}_e^{(t+1)}$. Subsequent resting-face scans classify as Neutral. | **PASSED** |
| **TC-05** | **Expression Tester** | Academic evaluator preset simulation with canned FACS vectors. | Select `"Simulate Angry"` preset in Expression Tester. | Blendshapes `browDown` (AU4) set to 0.88, `eyeSquint` (AU7) to 0.72. Emotion classifies as `"Angry"` ($91\%$). | **PASSED** |
| **TC-06** | **Behavioral Stress** | Keystroke dynamics detection of high error rate & hesitation pauses. | Evaluator inputs text with $22\%$ backspace strokes and inter-key latencies $> 1500\text{ ms}$. | WPM drops below baseline; $Z_{\text{err}} > 2.0$. System triggers `"Multimodal Stress Anomaly Alert"`. | **PASSED** |
| **TC-07** | **Demo Mode** | Instant trigger of Academic Evaluation Presets. | Click `"High Stress Anomaly (FACS + Typing)"` banner preset. | State updates instantaneously to 88/100 Stress Index, flags anomaly banner, suggests 4-4-4-4 Box Breathing. | **PASSED** |
| **TC-08** | **Screen Time** | Continuous usage threshold breach ($> 4\text{ hours}$). | Total screen time set to 5.2 hours (exceeding 4.0h routine target). | High-visibility warning alert displayed with recommendation to take 20-20-20 visual rest. | **PASSED** |
| **TC-09** | **Screen Time** | Sleep window violation detection. | Device logged at 23:45 with sleep schedule defined as 23:00 – 07:00. | Amber badge `"Active During Sleep Window"` activates; blue light filter reminder displayed. | **PASSED** |
| **TC-10** | **Wellness Tools** | Interactive Box Breathing (4-4-4-4) cycle timer accuracy. | Activate Box Breathing. Track SVG circle expansion and step progression. | Circle expands over 4s (Inhale), holds 4s (Hold), contracts 4s (Exhale), rests 4s (Hold). Cycles count accurately. | **PASSED** |
| **TC-11** | **Provider Search** | Haversine GPS radius and verified fee filtering. | Filter for `"Psychiatrist"`, max fee ₹1,500, radius 25 km from user coordinates (12.9716, 77.5946). | Only providers matching specialization, fee $\le 1500$, and computed distance $\le 25\text{ km}$ are displayed. | **PASSED** |
| **TC-12** | **Appointments** | End-to-end appointment booking and slot reservation. | Select Dr. Priya Sharma, choose tomorrow 10:00 AM, select `"Virtual Telehealth"`, confirm. | Slot marked booked. Appointment stored in database. Displays in `"My Appointments"` dashboard. | **PASSED** |
| **TC-13** | **Telehealth Room** | Virtual consultation room launch, simulated video, and timer. | Click `"Join Virtual Room"` on confirmed telehealth appointment. | Video frames initialize with simulated encrypted bridge, dynamic audio waveform animates, timer ticks up. | **PASSED** |
| **TC-14** | **Data Portability** | GDPR Article 20 / DPDP Section 12 open JSON export. | Click `"Download My Data (JSON)"` in Privacy Center. | Generates and downloads valid JSON file containing full audit logs, emotion logs, and appointments. | **PASSED** |
| **TC-15** | **Right to Erasure** | One-click total data purge and session invalidation. | Click `"Purge All Local Data"` and confirm modal alert. | All 16 database tables dropped/cleared from local storage. Active session destroyed. User returned to logged-out state. | **PASSED** |

---

## 3. Edge Case Handling & Fault Tolerance

1. **Camera Occlusion or Sensor Failure**:
   - Handled via `try/catch` in WebRTC initialization. If the camera stream throws `NotAllowedError` or `NotFoundError`, MindSync renders an informative fallback message with a direct link to the simulated test mode.
2. **Extreme Typing Baseline Drift**:
   - If a user changes keyboards or types on mobile, baselines adapt gradually with minimum sample caps ($N \ge 200\text{ keystrokes}$) before adjusting standard deviations, avoiding instantaneous skew from accidental rapid bursts.
3. **Provider Geo-Radius Out-of-Bounds**:
   - If no verified therapists exist within the specified radius, the directory gracefully provides an empty-state card with a one-click action: `"Expand search to 50 km or switch to Virtual Consultations"`.
4. **Offline Resilience**:
   - Database and ML models run 100% locally in-browser. If network connectivity is lost, all emotion estimation, typing baselines, breathing exercises, and emergency helpline dialers continue to function without interruption.
