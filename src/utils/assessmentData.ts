// MindSync - Standardized Mental Wellness Assessment Instruments
// Implements clinically validated protocols (PHQ-9, GAD-7, PSS-10, and MindSync Holistic Screener)
// with scoring algorithms, indicative result interpretation, and personalized guidance pathways.

import type { AssessmentInstrument, AssessmentRecord, AssessmentType } from '../types';
import { generateUUID } from './crypto';

export const STANDARD_FREQUENCY_OPTIONS = [
  { text: 'Not at all', points: 0 },
  { text: 'Several days', points: 1 },
  { text: 'More than half the days', points: 2 },
  { text: 'Nearly every day', points: 3 },
];

export const STRESS_FREQUENCY_OPTIONS = [
  { text: 'Never', points: 0 },
  { text: 'Almost Never', points: 1 },
  { text: 'Sometimes', points: 2 },
  { text: 'Fairly Often', points: 3 },
  { text: 'Very Often', points: 4 },
];

export const ASSESSMENT_INSTRUMENTS: Record<AssessmentType, AssessmentInstrument> = {
  phq9: {
    id: 'phq9',
    title: 'PHQ-9: Depression & Mood Vitality Screener',
    shortTitle: 'PHQ-9 Mood Screener',
    description: 'A 9-question clinical screener assessing mood patterns, interest levels, fatigue, and cognitive vitality over the past two weeks.',
    scoringMethod: 'Summation of 9 items scored 0-3 (0 = Not at all to 3 = Nearly every day). Maximum score: 27.',
    totalMaxScore: 27,
    timeEstimateMin: 3,
    clinicalReference: 'Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: validity of a brief depression severity measure.',
    questions: [
      {
        id: 'phq_1',
        question: 'Little interest or pleasure in doing things you usually enjoy?',
        category: 'Anhedonia & Motivation',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'phq_2',
        question: 'Feeling down, depressed, hopeless, or carrying heavy emotional weight?',
        category: 'Depressed Affect',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'phq_3',
        question: 'Trouble falling or staying asleep, or sleeping significantly too much?',
        category: 'Circadian & Sleep Architecture',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'phq_4',
        question: 'Feeling tired, sluggish, or having little physical and mental energy?',
        category: 'Energy & Fatigue',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'phq_5',
        question: 'Poor appetite, skipping meals, or overeating for emotional comfort?',
        category: 'Appetite & Somatic State',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'phq_6',
        question: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
        category: 'Self-Perception & Cognitive Bias',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'phq_7',
        question: 'Trouble concentrating on things, such as reading documents, watching videos, or working?',
        category: 'Attention & Executive Function',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'phq_8',
        question: 'Moving or speaking so slowly that other people have noticed, or being unusually fidgety or restless?',
        category: 'Psychomotor Agitation / Retardation',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'phq_9',
        question: 'Thoughts that you would be better off dead, or wanting to harm yourself in some way?',
        context: 'If you are experiencing acute distress, immediate 24/7 confidential help is available.',
        category: 'Safety & Crisis Indicator',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
    ],
    severityTiers: [
      {
        minScore: 0,
        maxScore: 4,
        level: 'Minimal',
        color: '#10b981',
        title: 'Minimal or No Depressive Symptoms',
        indicativeSummary: 'Your responses indicate a stable, healthy baseline mood with resilient emotional regulation and motivation.',
        guidance: [
          'Maintain your regular sleep-wake schedule and morning natural daylight exposure.',
          'Continue engaging in energizing hobbies, social connections, and physical movement.',
          'Use MindSync’s weekly wellness check-in to track emotional variance over time.',
        ],
        recommendedAction: 'Keep up your current healthy lifestyle habits and routine sleep balance.',
        suggestConsultation: false,
      },
      {
        minScore: 5,
        maxScore: 9,
        level: 'Mild',
        color: '#f59e0b',
        title: 'Mild Depressive Symptoms',
        indicativeSummary: 'Your score suggests mild emotional fatigue or situational low mood that may occasionally sap energy or concentration.',
        guidance: [
          'Implement regular digital boundaries — avoid late-night doomscrolling to protect melatonin release.',
          'Schedule at least 15 minutes of structured aerobic exercise or sunlight walks daily.',
          'Practice positive micro-journaling in MindSync to reframe automatic negative cognitive loops.',
          'Monitor your mood trend over the next 2 weeks to observe if symptoms fluctuate with work/study load.',
        ],
        recommendedAction: 'Focus on sleep hygiene, physical recovery, and structured mood reflection.',
        suggestConsultation: false,
      },
      {
        minScore: 10,
        maxScore: 14,
        level: 'Moderate',
        color: '#f97316',
        title: 'Moderate Depressive Symptoms',
        indicativeSummary: 'Noticeable symptoms affecting energy, sleep, or focus. You may find regular routines harder to sustain.',
        guidance: [
          'Break daily obligations into manageable micro-tasks to avoid executive paralysis.',
          'Prioritize non-negotiable sleep hygiene: target 7.5+ hours with 30-minute pre-bed wind-down.',
          'Reach out to trusted friends, family, or academic mentors to discuss current pressures.',
          'Consider scheduling a confidential consultation with a licensed psychologist for evidence-based CBT strategies.',
        ],
        recommendedAction: 'We recommend discussing these results with a licensed counselor or physician.',
        suggestConsultation: true,
      },
      {
        minScore: 15,
        maxScore: 19,
        level: 'Moderately Severe',
        color: '#ef4444',
        title: 'Moderately Severe Depressive Symptoms',
        indicativeSummary: 'Significant depressive burden actively interfering with work, relationships, and physiological vitality.',
        guidance: [
          'Connect with a qualified mental healthcare specialist for comprehensive clinical evaluation and support.',
          'Inform a trusted person in your inner circle about what you are currently navigating.',
          'Utilize MindSync’s verified counselor directory to schedule a telehealth session.',
          'If feeling overwhelmed, utilize our verified 24/7 crisis helplines for immediate supportive listening.',
        ],
        recommendedAction: 'Professional clinical evaluation and therapeutic guidance strongly advised.',
        suggestConsultation: true,
      },
      {
        minScore: 20,
        maxScore: 27,
        level: 'Severe',
        color: '#dc2626',
        title: 'Severe Depressive Symptoms',
        indicativeSummary: 'High symptom severity with marked impact on daily function, emotional well-being, and vitality.',
        guidance: [
          'Please seek immediate consultation with a psychiatrist, clinical psychologist, or healthcare professional.',
          'Do not carry this weight alone — reach out to our Emergency Support tab for 24/7 verified crisis lines.',
          'Book an urgent confidential telehealth session with our top-rated specialists.',
          'Ensure you are in a safe, supportive environment surrounded by people who care about your wellbeing.',
        ],
        recommendedAction: 'Immediate medical or clinical professional care is strongly recommended.',
        suggestConsultation: true,
      },
    ],
  },

  gad7: {
    id: 'gad7',
    title: 'GAD-7: Generalized Anxiety & Tension Screener',
    shortTitle: 'GAD-7 Anxiety Screener',
    description: 'A 7-question clinical assessment measuring nervous anticipation, somatic restlessness, difficulty controlling worry, and irritability over the past 2 weeks.',
    scoringMethod: 'Summation of 7 items scored 0-3. Maximum score: 21.',
    totalMaxScore: 21,
    timeEstimateMin: 2,
    clinicalReference: 'Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder: the GAD-7.',
    questions: [
      {
        id: 'gad_1',
        question: 'Feeling nervous, anxious, on edge, or physically tense?',
        category: 'Psychological Tension',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'gad_2',
        question: 'Not being able to stop or control worrying once a train of thought begins?',
        category: 'Cognitive Control',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'gad_3',
        question: 'Worrying too much about different things (e.g. work, health, deadlines, finances)?',
        category: 'Generalized Worry',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'gad_4',
        question: 'Trouble relaxing, feeling physically unable to settle down or unwind?',
        category: 'Autonomic Arousal',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'gad_5',
        question: 'Being so restless that it is hard to sit still without fidgeting or pacing?',
        category: 'Psychomotor Restlessness',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'gad_6',
        question: 'Becoming easily annoyed, irritated, or short-tempered with people or delays?',
        category: 'Affective Irritability',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'gad_7',
        question: 'Feeling afraid, as if something awful might happen without a clear external reason?',
        category: 'Apprehensive Dread',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
    ],
    severityTiers: [
      {
        minScore: 0,
        maxScore: 4,
        level: 'Minimal',
        color: '#10b981',
        title: 'Minimal or Baseline Anxiety',
        indicativeSummary: 'Your responses reflect healthy nervous system equilibrium with normal situational stress tolerance.',
        guidance: [
          'Continue utilizing restorative micro-breaks throughout high-cadence work sessions.',
          'Practice physiological sigh breathwork (2 inhales through nose, 1 slow exhale through mouth) when facing acute deadlines.',
          'Maintain balanced caffeine intake and consistent sleep timing.',
        ],
        recommendedAction: 'Sustain your grounded daily habits and proactive stress awareness.',
        suggestConsultation: false,
      },
      {
        minScore: 5,
        maxScore: 9,
        level: 'Mild',
        color: '#f59e0b',
        title: 'Mild Anxiety',
        indicativeSummary: 'You are experiencing periodic nervous tension or worry spikes, likely triggered by recent deadlines or environmental demands.',
        guidance: [
          'Engage in MindSync’s Box Breathing or 4-7-8 Breathing exercises 2 times a day.',
          'Reduce caffeine intake after 1:00 PM to lower sympathetic nervous system activation.',
          'Practice externalizing worries by writing a 5-minute "worry dump" in your private journal.',
        ],
        recommendedAction: 'Incorporate nervous system down-regulation exercises and sleep boundaries.',
        suggestConsultation: false,
      },
      {
        minScore: 10,
        maxScore: 14,
        level: 'Moderate',
        color: '#f97316',
        title: 'Moderate Anxiety',
        indicativeSummary: 'Elevated anxiety that may be causing muscle tension, sleep disruptions, digestive sensitivity, or racing thoughts.',
        guidance: [
          'Adopt the 5-4-3-2-1 Sensory Grounding technique whenever you notice hyper-arousal or spiraling thoughts.',
          'Set a strict cutoff for work notifications and blue-light screens at least 90 minutes before sleep.',
          'Consult with a licensed counselor or therapist specializing in Cognitive Behavioral Therapy (CBT) or Acceptance & Commitment Therapy (ACT).',
        ],
        recommendedAction: 'Therapeutic guidance is recommended to acquire targeted cognitive coping strategies.',
        suggestConsultation: true,
      },
      {
        minScore: 15,
        maxScore: 21,
        level: 'Severe',
        color: '#ef4444',
        title: 'Severe Anxiety',
        indicativeSummary: 'High autonomic arousal and persistent worry causing notable functional and somatic strain.',
        guidance: [
          'Schedule an assessment with a licensed mental health clinician or psychiatrist.',
          'Communicate with a trusted support person so you have day-to-day empathetic backing.',
          'Use MindSync’s instant consultation room or crisis helpline for on-demand assistance.',
        ],
        recommendedAction: 'Comprehensive clinical evaluation and personalized therapeutic plan strongly advised.',
        suggestConsultation: true,
      },
    ],
  },

  pss10: {
    id: 'pss10',
    title: 'PSS-10: Perceived Stress & Coping Index',
    shortTitle: 'PSS Stress Scale',
    description: 'Measures how unpredictable, uncontrollable, and overloaded you find your life circumstances over the past month.',
    scoringMethod: 'Standard Perceived Stress Scale: 10 items scored 0-4 (with reverse-scoring on positive coping items 4, 5, 7, 8). Maximum score: 40.',
    totalMaxScore: 40,
    timeEstimateMin: 3,
    clinicalReference: 'Cohen, S., Kamarck, T., & Mermelstein, R. (1983). A global measure of perceived stress. Journal of Health and Social Behavior.',
    questions: [
      {
        id: 'pss_1',
        question: 'In the last month, how often have you been upset because of something that happened unexpectedly?',
        category: 'Unpredictability',
        options: STRESS_FREQUENCY_OPTIONS,
      },
      {
        id: 'pss_2',
        question: 'In the last month, how often have you felt that you were unable to control the important things in your life?',
        category: 'Controllability',
        options: STRESS_FREQUENCY_OPTIONS,
      },
      {
        id: 'pss_3',
        question: 'In the last month, how often have you felt nervous and stressed?',
        category: 'Perceived Load',
        options: STRESS_FREQUENCY_OPTIONS,
      },
      {
        id: 'pss_4',
        question: 'In the last month, how often have you felt confident about your ability to handle personal problems?',
        category: 'Self-Efficacy',
        // Reverse-scored: 0 points for very often, 4 points for never
        options: [
          { text: 'Very Often', points: 0 },
          { text: 'Fairly Often', points: 1 },
          { text: 'Sometimes', points: 2 },
          { text: 'Almost Never', points: 3 },
          { text: 'Never', points: 4 },
        ],
      },
      {
        id: 'pss_5',
        question: 'In the last month, how often have you felt that things were going your way?',
        category: 'Life Trajectory',
        options: [
          { text: 'Very Often', points: 0 },
          { text: 'Fairly Often', points: 1 },
          { text: 'Sometimes', points: 2 },
          { text: 'Almost Never', points: 3 },
          { text: 'Never', points: 4 },
        ],
      },
      {
        id: 'pss_6',
        question: 'In the last month, how often have you found that you could not cope with all the things that you had to do?',
        category: 'Overload',
        options: STRESS_FREQUENCY_OPTIONS,
      },
      {
        id: 'pss_7',
        question: 'In the last month, how often have you been able to control irritations in your life?',
        category: 'Frustration Tolerance',
        options: [
          { text: 'Very Often', points: 0 },
          { text: 'Fairly Often', points: 1 },
          { text: 'Sometimes', points: 2 },
          { text: 'Almost Never', points: 3 },
          { text: 'Never', points: 4 },
        ],
      },
      {
        id: 'pss_8',
        question: 'In the last month, how often have you felt that you were on top of things?',
        category: 'Mastery',
        options: [
          { text: 'Very Often', points: 0 },
          { text: 'Fairly Often', points: 1 },
          { text: 'Sometimes', points: 2 },
          { text: 'Almost Never', points: 3 },
          { text: 'Never', points: 4 },
        ],
      },
      {
        id: 'pss_9',
        question: 'In the last month, how often have you been angered because of things that happened outside of your control?',
        category: 'Reactivity',
        options: STRESS_FREQUENCY_OPTIONS,
      },
      {
        id: 'pss_10',
        question: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
        category: 'Cumulative Strain',
        options: STRESS_FREQUENCY_OPTIONS,
      },
    ],
    severityTiers: [
      {
        minScore: 0,
        maxScore: 13,
        level: 'Minimal',
        color: '#10b981',
        title: 'Low Perceived Stress',
        indicativeSummary: 'You perceive your life demands as manageable and feel equipped with adequate coping reserves.',
        guidance: [
          'Sustain your proactive boundaries between work and restorative leisure.',
          'Help friends and colleagues build resilience by sharing healthy habits.',
        ],
        recommendedAction: 'Continue your balanced routine and restorative habits.',
        suggestConsultation: false,
      },
      {
        minScore: 14,
        maxScore: 26,
        level: 'Moderate',
        color: '#f59e0b',
        title: 'Moderate Perceived Stress',
        indicativeSummary: 'You are experiencing substantial environmental demands that frequently challenge your coping capacity.',
        guidance: [
          'Perform a calendar audit: identify 2 non-essential commitments you can pause or delegate.',
          'Implement the 20-20-20 rule during screen sessions to reduce cognitive and optic strain.',
          'Utilize physiological down-regulation tools (cold water face splash, 4-7-8 breathwork).',
        ],
        recommendedAction: 'Schedule weekly recovery buffers and evaluate workload boundaries.',
        suggestConsultation: false,
      },
      {
        minScore: 27,
        maxScore: 40,
        level: 'Severe',
        color: '#ef4444',
        title: 'High Perceived Stress / High Burnout Risk',
        indicativeSummary: 'Current challenges exceed perceived coping capabilities, putting you at acute risk of burnout, sleep debt, and somatic fatigue.',
        guidance: [
          'Take a full mental wellness pause day if feasible to reset biological equilibrium.',
          'Consult with a certified organizational psychologist or counselor for workload triage.',
          'Establish strict quiet-hours protection on your devices using MindSync settings.',
        ],
        recommendedAction: 'Professional burnout counseling and structured workload reduction strongly advised.',
        suggestConsultation: true,
      },
    ],
  },

  holistic: {
    id: 'holistic',
    title: 'MindSync: Multimodal Wellness & Vitality Index',
    shortTitle: 'Holistic Wellness Index',
    description: 'A comprehensive 8-item screener evaluating circadian alignment, screen fatigue, social connection, and emotional vitality.',
    scoringMethod: 'Weighted 0-3 scale across 4 core wellness domains. Maximum score: 24.',
    totalMaxScore: 24,
    timeEstimateMin: 2,
    clinicalReference: 'MindSync Multimodal Behavioral Wellness Architecture (FACS, Keystroke Cadence, Circadian Telemetry).',
    questions: [
      {
        id: 'hol_1',
        question: 'How often do you wake up feeling unrefreshed, groggy, or longing for several more hours of sleep?',
        category: 'Circadian Vitality',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'hol_2',
        question: 'Do you spend more than 60 minutes on digital screens right before falling asleep?',
        category: 'Blue-Light Hygiene',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'hol_3',
        question: 'How often do you experience sudden irritability, eye strain, or head tension after long device sessions?',
        category: 'Digital Fatigue',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'hol_4',
        question: 'Do you find yourself multitasking constantly without being able to complete one task in a flow state?',
        category: 'Executive Cadence',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'hol_5',
        question: 'How often do you skip water, healthy meals, or physical movement because of screen immersion?',
        category: 'Somatic Nutrition',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'hol_6',
        question: 'Do you feel socially isolated or disconnected from friends and loved ones in the real world?',
        category: 'Social Connection',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'hol_7',
        question: 'How often do you experience physical muscle tension in your shoulders, neck, or jaw while working?',
        category: 'Somatic Tension',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
      {
        id: 'hol_8',
        question: 'How often do you feel that your daily routine lacks meaning, playful joy, or restorative moments?',
        category: 'Emotional Fulfillment',
        options: STANDARD_FREQUENCY_OPTIONS,
      },
    ],
    severityTiers: [
      {
        minScore: 0,
        maxScore: 6,
        level: 'Minimal',
        color: '#10b981',
        title: 'Optimal Holistic Vitality',
        indicativeSummary: 'You maintain excellent harmony across sleep, device boundaries, nutrition, and psychological restoration.',
        guidance: [
          'Maintain your regular routine settings in MindSync.',
          'Track your facial emotional Action Units weekly to stay attuned to baseline affective health.',
        ],
        recommendedAction: 'Excellent vitality balance. Keep maintaining your routines!',
        suggestConsultation: false,
      },
      {
        minScore: 7,
        maxScore: 12,
        level: 'Mild',
        color: '#f59e0b',
        title: 'Mild Lifestyle & Screen Imbalance',
        indicativeSummary: 'Minor routine friction: occasional screen fatigue or irregular bedtime boundaries are beginning to introduce subtle wear and tear.',
        guidance: [
          'Enable MindSync Screen Time reminders to notify you after 45 minutes of continuous screen use.',
          'Drink at least 2 liters of water daily and take 5-minute movement pauses between tasks.',
        ],
        recommendedAction: 'Tweak your digital boundaries and evening wind-down routine.',
        suggestConsultation: false,
      },
      {
        minScore: 13,
        maxScore: 18,
        level: 'Moderate',
        color: '#f97316',
        title: 'Moderate Circadian & Digital Strain',
        indicativeSummary: 'Substantial screen fatigue and circadian misalignment are impacting your daytime energy and cognitive focus.',
        guidance: [
          'Enforce strict Quiet Hours in MindSync to silence non-emergency app notifications.',
          'Introduce guided breathwork sessions before starting high-intensity work blocks.',
          'Consider a consultation with a wellness counselor to rebuild sustainable daily baselines.',
        ],
        recommendedAction: 'Adopt intentional digital detox buffers and sleep boundary enforcement.',
        suggestConsultation: true,
      },
      {
        minScore: 19,
        maxScore: 24,
        level: 'Severe',
        color: '#ef4444',
        title: 'Severe Multimodal Burnout',
        indicativeSummary: 'High cumulative strain across sleep, somatic posture, digital immersion, and emotional vitality.',
        guidance: [
          'Immediately reduce discretionary screen time and set hard device shutdown hours.',
          'Connect with a verified mental wellness counselor through MindSync for personalized coaching.',
          'Schedule an appointment with a healthcare professional to address sleep deficit and burnout.',
        ],
        recommendedAction: 'Active lifestyle restructuring and professional counseling strongly recommended.',
        suggestConsultation: true,
      },
    ],
  },
};

/**
 * Evaluates responses for an assessment instrument, calculates the total score and category scores,
 * matches the appropriate severity tier, and produces indicative results with personalized guidance.
 */
export function evaluateAssessment(
  instrumentId: AssessmentType,
  answers: Record<string, number>,
  userId: string
): AssessmentRecord {
  const instrument = ASSESSMENT_INSTRUMENTS[instrumentId];
  if (!instrument) {
    throw new Error(`Unknown assessment instrument: ${instrumentId}`);
  }

  let totalScore = 0;
  const categoryBreakdown: Record<string, number> = {};

  instrument.questions.forEach((q) => {
    const points = answers[q.id] ?? 0;
    totalScore += points;
    if (q.category) {
      categoryBreakdown[q.category] = (categoryBreakdown[q.category] || 0) + points;
    }
  });

  const maxScore = instrument.totalMaxScore;
  const scorePercentage = Math.round((totalScore / maxScore) * 100);

  // Match severity tier
  const tier = instrument.severityTiers.find(
    (t) => totalScore >= t.minScore && totalScore <= t.maxScore
  ) || instrument.severityTiers[instrument.severityTiers.length - 1];

  return {
    id: generateUUID(),
    userId,
    assessmentType: instrumentId,
    assessmentTitle: instrument.title,
    totalScore,
    maxScore,
    scorePercentage,
    severityLevel: tier.level,
    indicativeResult: tier.indicativeSummary,
    personalizedGuidance: tier.guidance,
    recommendedAction: tier.recommendedAction,
    suggestConsultation: tier.suggestConsultation,
    categoryBreakdown,
    answers,
    completedAt: new Date().toISOString(),
  };
}

