// Knowledge base and conversational engine for Maya AI Health Assistant

export interface AIResponse {
  answer: string;
  category: string;
  isEmergency?: boolean;
  suggestedActions: string[];
}

export function getMayaResponse(userPrompt: string): AIResponse {
  const query = userPrompt.toLowerCase().trim();

  // 1. Emergency keyword detection
  if (
    query.includes('severe bleeding') ||
    query.includes('heavy bleeding') ||
    query.includes('chest pain') ||
    query.includes('cant breathe') ||
    query.includes('cannot breathe') ||
    query.includes('fainted') ||
    query.includes('unconscious') ||
    query.includes('severe abdominal pain') ||
    query.includes('convulsion') ||
    query.includes('suicid')
  ) {
    return {
      category: 'Emergency Alert',
      isEmergency: true,
      answer: `⚠️ **URGENT MEDICAL ALERT**: Based on your symptoms, this requires immediate professional emergency medical care. Please do not wait. Call 108 immediately or proceed to the nearest emergency hospital.`,
      suggestedActions: [
        'Call 108 (National Emergency Ambulance)',
        'Activate Emergency Mode in App',
        'Contact Your Doctor'
      ]
    };
  }

  // 2. Menstrual / Period / Cramps
  if (query.includes('period') || query.includes('menstrual') || query.includes('cramp') || query.includes('pms')) {
    return {
      category: 'Menstrual Health',
      answer: `Managing menstrual discomfort effectively involves a combination of warmth, hydration, and gentle care:

1. **Thermal Relief**: Apply a heating pad (around 40°C) across your lower abdomen to ease uterine muscle contractions.
2. **Herbal Teas**: Ginger and chamomile teas have mild natural anti-inflammatory properties.
3. **Hydration & Magnesium**: Drink warm water and consume magnesium-rich foods (bananas, pumpkin seeds, dark leafy greens) to reduce muscle spasms.
4. **Light Movement**: Gentle yoga poses like Child's Pose and Cat-Cow help improve pelvic blood flow.

*Note: If pain is severe or unmanageable, please consult your doctor to screen for conditions like endometriosis or fibroids.*`,
      suggestedActions: [
        'Log cycle symptoms in Life Stage Tracker',
        'Check nearby specialists',
        'Explore pain relief guide'
      ]
    };
  }

  // 3. Pregnancy / Trimester / Morning sickness
  if (query.includes('pregnancy') || query.includes('pregnant') || query.includes('trimester') || query.includes('morning sickness') || query.includes('nausea')) {
    return {
      category: 'Pregnancy Care',
      answer: `Here is clinical guidance for pregnancy support:

- **First Trimester Care**: Nausea, fatigue, and sensitivity are very common due to rising hormones.
- **Managing Nausea**: Eat small, frequent meals. Ginger candies, cold lemon water, and dry crackers before getting up can help.
- **Essential Supplements**: Ensure daily **Folic Acid (400–800 mcg)** for neural tube development, plus Iron and Vitamin D3 as prescribed.
- **Partners**: Stay involved in prenatal visits, learn about birth plans, and support nutrition and rest needs.
- **Warning Signs**: Severe persistent vomiting, spotting, or sharp pelvic pain require prompt medical review.`,
      suggestedActions: [
        'Track pregnancy week-by-week',
        'Schedule prenatal checkup',
        'View trimester nutrition guide'
      ]
    };
  }

  // 4. Male health / testosterone / andropause
  if (query.includes('testosterone') || query.includes('andropause') || query.includes('male fertility') || query.includes('sperm') || query.includes('erectile') || query.includes('men')) {
    return {
      category: 'Male Reproductive Health',
      answer: `Men's health concerns are equally important and deserve proactive care:

- **Testosterone Levels**: Low testosterone (hypogonadism) can cause fatigue, mood changes, reduced libido, and weight gain. A simple blood test (Total & Free Testosterone, LH, FSH) confirms levels.
- **Andropause**: Gradual testosterone decline from age 40+ is normal. Symptoms include low energy, brain fog, and reduced muscle mass. Lifestyle changes (exercise, sleep, diet) and medical guidance help significantly.
- **Male Fertility**: Semen analysis is the first step. Key parameters: sperm count, motility (movement), and morphology (shape). Zinc, Vitamin D, and antioxidants support sperm health.
- **Prostate Health**: Annual PSA screening is recommended for men over 50, or earlier with family history.`,
      suggestedActions: [
        'Book endocrinology consultation',
        'Track energy and mood in dashboard',
        'Join Men\'s Health Community'
      ]
    };
  }

  // 5. PCOS / Hormonal Imbalance
  if (query.includes('pcos') || query.includes('pcod') || query.includes('irregular') || query.includes('hormon')) {
    return {
      category: 'Hormonal & Metabolic Health',
      answer: `Hormonal imbalances affect both men and women and respond well to lifestyle interventions:

- **Balanced Glycemic Nutrition**: Focus on low glycemic index complex carbohydrates, lean proteins, and fiber to stabilize insulin.
- **Regular Exercise**: 30 minutes of moderate strength training or brisk walking improves insulin sensitivity for all genders.
- **Stress & Sleep Management**: Chronic cortisol elevation worsens hormonal imbalances. Prioritize 7-8 hours of quality sleep.
- **Diagnostic Testing**: For PCOS — Ultrasound, Fasting Insulin, Free Testosterone, LH/FSH ratio. For men — Total Testosterone, SHBG, Prolactin.`,
      suggestedActions: [
        'Book hormonal consultation',
        'Track cycle or energy patterns',
        'Join Hormonal Health Community'
      ]
    };
  }

  // 6. Postpartum & Parenting
  if (query.includes('postpartum') || query.includes('breastfeed') || query.includes('lactat') || query.includes('baby blues') || query.includes('new parent') || query.includes('father')) {
    return {
      category: 'Parenthood & Postnatal Care',
      answer: `Postnatal recovery and parenting require support for both parents:

1. **New Mothers**: Hydration, rest, and pelvic floor recovery are priorities. Monitor for postpartum mood changes beyond 2 weeks.
2. **New Fathers / Partners**: Paternal postpartum depression is real, affecting approximately 10% of new fathers. Low mood, withdrawal, and irritability are signs to watch.
3. **Shared Parenting**: Divide night duties, communicate openly, and attend postnatal check-ins together when possible.
4. **Professional Help**: Both parents can access counselling — seeking support is a sign of strength, not weakness.`,
      suggestedActions: [
        'Complete Postnatal Mood Check-in',
        'Book Family Health Consultation',
        'Join New Parents Community Circle'
      ]
    };
  }

  // 7. Menopause / Andropause / Healthy Ageing
  if (query.includes('menopause') || query.includes('perimenopause') || query.includes('hot flash') || query.includes('aging') || query.includes('ageing') || query.includes('elderly')) {
    return {
      category: 'Healthy Ageing',
      answer: `Healthy ageing strategies for men and women:

- **For Women — Menopause**: Hot flashes, vaginal dryness, and mood changes are common. Layered clothing, cooling strategies, and discussing HRT with your doctor all help.
- **For Men — Andropause**: Gradual testosterone decline causes fatigue, reduced libido, and muscle loss. Resistance training, quality sleep, and hormonal panels are key.
- **For All**: Annual cardiovascular screening, bone density scans (especially post-50), lipid panels, blood pressure monitoring, and cognitive check-ins.
- **Nutrition**: Adequate Calcium (1200mg/day), Vitamin D3, Omega-3s, and lean protein support healthy ageing for everyone.`,
      suggestedActions: [
        'Book Healthy Ageing consultation',
        'Log energy and sleep patterns',
        'Explore ageing wellness resources'
      ]
    };
  }

  // 8. Diet / Nutrition / Fitness / Hydration
  if (query.includes('diet') || query.includes('water') || query.includes('nutrition') || query.includes('exercise') || query.includes('food') || query.includes('fitness')) {
    return {
      category: 'Lifestyle & Wellness',
      answer: `Optimal nutrition and physical activity for everyone:

- **Hydration**: Drink 2.5 to 3 liters of water daily. Men may need slightly more depending on activity level.
- **Macro-Balance**: Every meal should combine lean protein, colored vegetables/fiber, and healthy fats (omega-3s from flaxseeds, walnuts, or fish).
- **Movement**: Aim for 150 minutes of moderate aerobic activity and 2 strength-training sessions per week — this applies to all adults.
- **Sleep**: 7-9 hours of quality sleep is foundational to hormonal health, metabolism, and mental clarity for both men and women.`,
      suggestedActions: [
        'Set daily water intake goal',
        'Explore meal planning guide',
        'Track daily wellness stats'
      ]
    };
  }

  // 9. Mental health
  if (query.includes('mental') || query.includes('anxiety') || query.includes('stress') || query.includes('depression') || query.includes('mood') || query.includes('sad')) {
    return {
      category: 'Mental Health & Wellbeing',
      answer: `Mental health is equally important for men and women:

- **Breaking Stigma**: Men are statistically less likely to seek mental health help. It is a sign of strength to ask for support, not weakness.
- **Common Signs to Watch**: Persistent low mood, sleep disturbances, irritability, withdrawal from social activities, loss of interest, or changes in appetite.
- **Immediate Steps**: Talk to someone you trust, start with your primary care doctor, or use our Maya crisis support channel.
- **Practical Tools**: Regular physical activity reduces anxiety by 30-40%. Mindfulness practices, journaling, and sleep hygiene are evidence-based supports.
- **Professional Care**: Cognitive Behavioural Therapy (CBT) is effective for all genders. Medication may be appropriate — discuss with a psychiatrist or GP.`,
      suggestedActions: [
        'Complete Mental Wellness Check-in',
        'Find a counsellor near you',
        'Join Mental Health Support Community'
      ]
    };
  }

  // Default response
  return {
    category: 'General Health',
    answer: `Thank you for sharing that question. Good health is for everyone — regardless of gender.

To give you the most accurate guidance:
1. Consider keeping a daily symptom journal for 3-5 days noting timestamps and triggers.
2. If this is a recurring concern, consult a certified physician for personalized assessment.

Feel free to ask me about symptoms, fitness, nutrition, reproductive health, mental wellness, or emergency protocols — for anyone in your family!`,
    suggestedActions: [
      'Ask about reproductive health',
      'Ask about mental wellness',
      'Find nearby clinics'
    ]
  };
}
