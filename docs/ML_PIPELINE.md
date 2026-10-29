# MindSync Machine Learning & Analytical Pipelines

This document provides the theoretical foundation, mathematical formulation, Action Unit definitions, adaptive feedback calibration, and multimodal synthesis algorithms powering **MindSync**.

---

## 1. Facial Expression & Emotion Estimation Architecture

MindSync adopts the **Facial Action Coding System (FACS)** developed by Paul Ekman and Wallace V. Friesen, mapped to 3D facial landmark blendshape coefficients derived from MediaPipe Face Landmarker (478 3D facial landmarks).

### 1.1 Action Unit (AU) Reference Mapping

| Action Unit | Anatomical Description | MediaPipe Blendshape Target | Primary Emotion Association |
|---|---|---|---|
| **AU1** | Inner Brow Raiser | `browInnerUp` | Sadness, Fear, Surprise |
| **AU2** | Outer Brow Raiser | `browOuterUpLeft`, `browOuterUpRight` | Surprise |
| **AU4** | Brow Lowerer | `browDownLeft`, `browDownRight` | Anger, Sadness, Tension |
| **AU5** | Upper Lid Raiser | `eyeWideLeft`, `eyeWideRight` | Surprise, Fear |
| **AU6** | Cheek Raiser | `cheekSquintLeft`, `cheekSquintRight` | Genuine Happiness (Duchenne smile) |
| **AU7** | Lid Tightener | `eyeSquintLeft`, `eyeSquintRight` | Stress, Tension, Anger |
| **AU9** | Nose Wrinkler | `noseSneerLeft`, `noseSneerRight` | Disgust, Discomfort |
| **AU12** | Lip Corner Puller | `mouthSmileLeft`, `mouthSmileRight` | Happiness, Joy |
| **AU15** | Lip Corner Depressor | `mouthFrownLeft`, `mouthFrownRight` | Sadness, Disappointment |
| **AU17** | Chin Raiser | `mouthShrugLower` | Doubt, Sadness |
| **AU20** | Lip Stretcher | `mouthStretchLeft`, `mouthStretchRight` | Fear, Agitation |
| **AU24** | Lip Pressor | `mouthPressLeft`, `mouthPressRight` | Stress, Frustration, Repression |
| **AU26** | Jaw Drop | `jawOpen` | Surprise |
| **AU43** | Eye Closure / Squint | `eyeBlinkLeft`, `eyeBlinkRight` | Fatigue, Prolonged Blink Strain |

---

### 1.2 Mathematical Formulation of Emotion Classification

Let $\mathbf{v} = [v_1, v_2, \dots, v_n]^T \in [0, 1]^n$ be the normalized vector of extracted blendshape coefficients at time $t$.

For each canonical emotion $e \in \mathcal{E} = \{\text{Neutral}, \text{Happy}, \text{Sad}, \text{Angry}, \text{Fearful}, \text{Surprised}, \text{Stressed/Tense}\}$, we define an empirical prototypical prototype vector $\mathbf{P}_e \in [0, 1]^n$ and a feature importance mask $\mathbf{w}_e \in [0, 1]^n$.

#### Weighted Euclidean Distance:
$$D(e, \mathbf{v}) = \sqrt{\sum_{i=1}^n w_{e, i} \cdot (v_i - P_{e, i})^2}$$

#### Similarity Score:
$$S(e, \mathbf{v}) = \exp\left(-\frac{D(e, \mathbf{v})}{\tau}\right)$$
Where $\tau$ is a temperature hyperparameter (calibrated to $\tau = 0.52$).

#### Softmax Confidence Normalization:
$$C(e) = \frac{S(e, \mathbf{v})}{\sum_{k \in \mathcal{E}} S(k, \mathbf{v})}$$

The predicted emotional state $\hat{y}$ is selected as:
$$\hat{y} = \arg\max_{e \in \mathcal{E}} C(e)$$
Subject to a confidence threshold $\theta_{\text{min}} = 0.40$. If $\max C(e) < \theta_{\text{min}}$, the model defaults to `Neutral` with low confidence.

---

### 1.3 Personal Calibration & Adaptive Feedback Loop

Human facial structures exhibit wide baseline variance (e.g., natural resting mouth shape or eyebrow slant). When a user provides feedback (*"Not Correct" -> Selects Ground Truth Emotion $e^*$*), MindSync updates the user's localized adjustment vector:

$$\mathbf{P}_{e^*}^{(t+1)} = (1 - \alpha)\mathbf{P}_{e^*}^{(t)} + \alpha \mathbf{v}_t$$

Where $\alpha = 0.12$ is the learning rate. This guarantees that idiosyncratic resting facial features do not cause persistent classification bias.

---

## 2. Behavioral Stress Dynamics (Typing Cadence)

Typing cadence reflects fine motor control, neuromotor arousal, and cognitive load. Under acute mental fatigue or psychological distress, users typically demonstrate:
1. Significant velocity drop or jerky typing bursts.
2. Increased backspace / deletion rate reflecting elevated hesitation and cognitive editing.
3. Elongated hesitation pauses ($> 1200\text{ ms}$) between words or sentences.

### 2.1 Feature Extraction Vector
From in-app keystroke interactions (captured strictly within sandboxed input forms):
- $\text{WPM} = \frac{\text{Characters} / 5}{\text{Duration in Minutes}}$
- $\text{Error Rate } (B_r) = \frac{\text{Backspace and Delete Stroke Count}}{\text{Total Keystrokes}}$
- $\text{Hesitation Index } (H_p) = \frac{\text{Number of Inter-Keystroke Latencies } > 1200\text{ ms}}{\text{Total Words}}$

### 2.2 Z-Score Anomaly Formulation
For a user with personal baseline statistics $(\mu_{\text{wpm}}, \sigma_{\text{wpm}})$, $(\mu_{\text{err}}, \sigma_{\text{err}})$, and $(\mu_{\text{pause}}, \sigma_{\text{pause}})$:

$$Z_{\text{wpm}} = \frac{\mu_{\text{wpm}} - \text{WPM}_{\text{current}}}{\sigma_{\text{wpm}}}$$
$$Z_{\text{err}} = \frac{B_{r, \text{current}} - \mu_{\text{err}}}{\sigma_{\text{err}}}$$
$$Z_{\text{pause}} = \frac{H_{p, \text{current}} - \mu_{\text{pause}}}{\sigma_{\text{pause}}}$$

A composite Behavioral Stress Score $B_{\text{score}}$ is calculated:
$$B_{\text{score}} = 0.35 \cdot \max(0, Z_{\text{wpm}}) + 0.45 \cdot Z_{\text{err}} + 0.20 \cdot Z_{\text{pause}}$$

When $B_{\text{score}} \ge 2.0$, the system triggers the **Stress Anomaly Alert** and proactively offers targeted grounding exercises.

---

## 3. Multimodal Stress Index (MSI) Synthesis

MindSync synthesizes three distinct signal domains into a holistic, real-time **Multimodal Stress Index** $\mathcal{M} \in [0, 100]$:

$$\mathcal{M} = \lambda_{\text{face}} \cdot S_{\text{face}} + \lambda_{\text{keystroke}} \cdot S_{\text{keystroke}} + \lambda_{\text{device}} \cdot S_{\text{device}}$$

### Signal Weights and Dynamic Normalization:
- **Facial Tension Signal ($S_{\text{face}} \in [0, 100]$)**:
  Derived from confidence in Stressed, Angry, or Fearful blendshapes plus eye squint/blink strain.
  Weight $\lambda_{\text{face}} = 0.40$ (when camera is active; if inactive, redistributed equally).

- **Keystroke Anomaly Signal ($S_{\text{keystroke}} \in [0, 100]$)**:
  Scaled linearly from $B_{\text{score}}$, capped at 100.
  Weight $\lambda_{\text{keystroke}} = 0.35$.

- **Screen Time & Circadian Fatigue Signal ($S_{\text{device}} \in [0, 100]$)**:
  Calculated from cumulative screen hours against threshold and late-night sleep window violations:
  $$S_{\text{device}} = \min\left(100, \left(\frac{\text{Screen Hours}}{4.0}\right) \times 50 + \mathbf{1}_{\text{sleep\_violation}} \times 40\right)$$
  Weight $\lambda_{\text{device}} = 0.25$.

### State Escalation Matrix:

| Multimodal Stress Index ($\mathcal{M}$) | Classification Tier | System Response |
|---|---|---|
| **0 – 34** | Balanced / Calm | Standard ambient dashboard; positive reinforcement. |
| **35 – 64** | Moderate Tension | Passive suggestion: 20-20-20 visual rest, gentle hydration reminder. |
| **65 – 84** | High Acute Stress | Proactive alert: Guided Box Breathing (4-4-4-4) or 5-4-3-2-1 Sensory Grounding. |
| **85 – 100** | Critical Distress | Compassionate crisis overlay; Tele-MANAS (14416) & KIRAN helplines; SOS Contact alert. |

---

## 4. Ethical Boundaries & Non-Diagnostic Guarantee

1. **No Medical Claims**: Outputs are strictly probabilistic estimates of transient emotional state and neuromotor tension. They **never** constitute clinical diagnoses of Major Depressive Disorder (MDD), Generalized Anxiety Disorder (GAD), or any DSM-5/ICD-11 psychiatric conditions.
2. **Context Awareness**: Facial expressions alone do not equate to internal mood. Emotional display rules, neurodiversity, and cultural variances cause varied facial expressions. Therefore, the user confirmation and self-reporting check-in is treated as the primary ground truth.
3. **Zero Remote Telemetry**: Landmark extraction and keystroke cadence are processed 100% on the client device. Raw frames and unhashed keystrokes never leave the client environment.
