# MindSync Privacy Architecture & Permission Model

Privacy is the central architectural pillar of **MindSync**. Mental wellness data represents the most sensitive category of personal information. MindSync is engineered according to **Privacy by Design** principles, zero-knowledge processing, and strict compliance with the **Digital Personal Data Protection (DPDP) Act, 2023 (India)** and the **General Data Protection Regulation (GDPR, EU)**.

---

## 1. Tiered Permission Model

MindSync operates a granular, opt-in permission structure. Denying any permission degrades only the corresponding feature without locking the user out of the platform.

```
+-------------------------------------------------------------------------+
|                         MINDSYNC CORE PLATFORM                          |
+-------------------------------------------------------------------------+
       |                         |                       |
       v                         v                       v
+------------------+    +------------------+    +------------------+
|  Tier 1: Camera  |    | Tier 2: Behavior |    | Tier 3: Usage    |
| (FACS Landmarker)|    | (Keystroke Time) |    | (Screen Time)    |
+------------------+    +------------------+    +------------------+
       |                         |                       |
       | Edge Processing         | In-App Sandbox        | Aggregate Only
       v                         v                       v
[Local Memory Only]     [Timing Latency Only]   [Category Durations]
(Raw Video Discarded)   (No Keystroke Content)  (No Content Inspected)
```

### 1.1 Permission Matrix

| Capability | Scope & Mechanism | Data Stored | Data Never Stored | Revocation Impact |
|---|---|---|---|---|
| **Camera Access** | WebRTC `navigator.mediaDevices.getUserMedia({ video: true })` | 478 Landmark coordinates, blendshape floats | Raw image frames, video recordings, audio | Facial emotion estimator disabled; user enters mood manually. |
| **Keystroke Cadence** | In-app DOM event listeners (`keydown`, `keyup`) | Inter-key latencies ($\Delta t$), WPM, error rates | Character keys typed, passwords, journal text | Behavioral stress tracker disabled; uses default population baseline. |
| **Screen Time Monitoring** | Web Local Storage / Android `PACKAGE_USAGE_STATS` | Category names, daily minutes, timestamp | Visited URLs, message content, app notifications | Screen time warnings & 20-20-20 break suggestions disabled. |
| **Emergency SOS** | Web SMS URI `sms:`, `tel:` / Android `SEND_SMS` | Contact names, phone numbers | Contact call history, SMS logs | Emergency modal requires manual dialing of helplines. |

---

## 2. Web Application Sandboxing vs. Android Native Architecture

A frequent point of academic evaluation is understanding the technical boundary between browser web applications and native mobile operating systems.

### 2.1 Web Platform Constraints
- **Cross-Origin & Process Isolation**: In compliance with modern browser security sandboxes, web applications **cannot**:
  - Monitor keystrokes typed into other browser tabs, desktop applications, or third-party keyboards.
  - Access system-wide screen time or read application usage from other software running on the operating system.
  - Silently record camera or audio without persistent hardware and browser notification indicators.
- **MindSync Web Implementation**:
  - Keystroke dynamics are analyzed strictly inside MindSync’s interactive behavioral sandbox and private journal.
  - Screen time uses category-level device time logs populated through explicit user routine tracking or simulated telemetry during academic evaluation.

### 2.2 Android Native Migration Architecture
In a native Android deployment, MindSync utilizes the following operating system APIs:

#### `android.permission.PACKAGE_USAGE_STATS` (UsageStatsManager)
- **Manifest Declaration**:
  ```xml
  <uses-permission
      android:name="android.permission.PACKAGE_USAGE_STATS"
      tools:ignore="ProtectedPermissions" />
  ```
- **Runtime Flow**: The user is guided via Intent to `Settings.ACTION_USAGE_ACCESS_SETTINGS`.
- **Telemetry Processing**: MindSync queries `UsageStatsManager.queryUsageStats()` with `INTERVAL_DAILY`, extracts cumulative foreground duration per `packageCategory` (e.g., `CATEGORY_SOCIAL`, `CATEGORY_PRODUCTIVITY`), and discards app specific details.
- **Continuous Usage Breaker**: A background foreground service checks if continuous usage exceeds the user’s `max_continuous_hours` limit and triggers a heads-up notification.

#### Non-Invasive Keystroke Monitoring
- Under Android native, MindSync intentionally **refrains** from registering an `AccessibilityService` or custom software keyboard (IME). Global accessibility keylogging creates catastrophic security and credential leakage risks (e.g., banking passwords, private chat). MindSync restricts cadence tracking strictly to its own in-app wellness forms.

---

## 3. Data Protection Compliance (DPDP Act 2023 & GDPR)

| Legal Principle | DPDP Act (India) Reference | GDPR (EU) Reference | MindSync Technical Implementation |
|---|---|---|---|
| **Explicit Consent** | Section 6 (Notice and Consent) | Article 6 & 7 (Lawfulness of Consent) | Dedicated Privacy Center toggles for each sensor category prior to activation. |
| **Purpose Limitation** | Section 7 (Processing for specific purposes) | Article 5(1)(b) (Purpose Limitation) | Sensor signals are used solely for real-time wellness insights, never advertising or tracking. |
| **Data Minimization** | Section 4(2) (Fair and reasonable processing) | Article 5(1)(c) (Data Minimization) | Facial landmarks are extracted in memory and instantly dropped; only AU scalar floats are persisted. |
| **Right to Erasure** | Section 12(3) (Right to erasure) | Article 17 (Right to be Forgotten) | One-click **"Purge All Local Data"** permanently deletes all 16 database tables and local storage keys. |
| **Data Portability** | Section 12(1) (Right to access information) | Article 20 (Right to Data Portability) | One-click **"Download My Data (JSON)"** exports the user's complete history in an open JSON format. |
| **Tamper-Evident Auditing** | Section 8 (Obligations of Data Fiduciary) | Article 30 (Records of Processing Activities) | Cryptographic `audit_logs` record every export, purge, login, and consent modification with SHA-256 hashes. |

---

## 4. Zero Remote Telemetry & Cryptographic Protections

1. **Client-Side SHA-256 Password Hashing**: Passwords never touch memory in plaintext. Hashing is performed using browser-native Web Cryptography API (`crypto.subtle.digest('SHA-256', ...)`).
2. **Local Relational Storage**: The application operates with client-side relational storage. No third-party analytics trackers (e.g., Google Analytics, Meta Pixel) are bundled.
3. **Session Invalidation**: Session tokens are cryptographically secure random values generated via `crypto.getRandomValues()`. Immediate invalidation is enforced upon sign-out.
4. **Emergency Contact Safeguard**: Emergency contacts stored in `emergency_contacts` are kept strictly on-device and accessed only when the user triggers the SOS modal or authorizes automated crisis escalation.
