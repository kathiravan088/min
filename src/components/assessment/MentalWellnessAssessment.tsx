// MindSync - Mental Wellness Assessment & Diagnostic Guidance Component
import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Brain,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Info,
  Heart,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import {
  ASSESSMENT_INSTRUMENTS,
  evaluateAssessment
} from '../../utils/assessmentData';
import type { AssessmentType, AssessmentRecord } from '../../types';

interface MentalWellnessAssessmentProps {
  onNavigateTab?: (tab: string) => void;
}

export const MentalWellnessAssessment: React.FC<MentalWellnessAssessmentProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<AssessmentType>('phq9');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completedResult, setCompletedResult] = useState<AssessmentRecord | null>(null);
  const [history, setHistory] = useState<AssessmentRecord[]>([]);

  const instrument = ASSESSMENT_INSTRUMENTS[selectedType];
  const questions = instrument.questions;
  const currentQuestion = questions[currentQuestionIndex];

  // Load past user assessments from database
  useEffect(() => {
    if (user) {
      setHistory(db.getAssessments(user.id));
    }
  }, [user, completedResult]);

  // Reset state when switching instruments
  const handleSelectInstrument = (type: AssessmentType) => {
    setSelectedType(type);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCompletedResult(null);
  };

  const handleSelectOption = (questionId: string, points: number) => {
    const updated = { ...answers, [questionId]: points };
    setAnswers(updated);

    // Auto-advance to next question if not at the end
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(i => i + 1), 220);
    }
  };

  const isAllAnswered = questions.every(q => answers[q.id] !== undefined);

  const handleSubmit = () => {
    if (!user) return;
    const result = evaluateAssessment(selectedType, answers, user.id);
    db.saveAssessment(result);
    setCompletedResult(result);
    setHistory(db.getAssessments(user.id));
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setCompletedResult(null);
  };

  const getSeverityBadgeColor = (level: string) => {
    switch (level) {
      case 'Minimal': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Mild': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Moderate': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Moderately Severe':
      case 'Severe': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div
        className="p-6 rounded-3xl border shadow-xl relative overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 mt-1 border border-teal-500/20">
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Evidence-Based Clinical Screeners
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Mental Wellness Assessment & Guidance
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Answer structured clinical questions. Responses are evaluated according to standardized clinical scoring
                methods to provide an indicative result and personalized, actionable guidance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              100% Confidential & On-Device
            </span>
          </div>
        </div>

        {/* Instrument Selector Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap gap-2">
          {(Object.keys(ASSESSMENT_INSTRUMENTS) as AssessmentType[]).map(type => {
            const inst = ASSESSMENT_INSTRUMENTS[type];
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => handleSelectInstrument(type)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{inst.shortTitle}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-900/20 text-slate-950 font-mono' : 'bg-slate-800 text-slate-400'}`}>
                  {inst.questions.length}Q • ~{inst.timeEstimateMin}m
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Assessment Body */}
      {!completedResult ? (
        <div
          className="p-6 sm:p-8 rounded-3xl border shadow-xl relative"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 block mb-1">
                {instrument.title}
              </span>
              <span className="text-xs text-slate-400">
                {instrument.description}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-white block">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-[11px] text-slate-400">
                {Object.keys(answers).length} answered
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-8">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Current Question Card */}
          {currentQuestion && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                {currentQuestion.category && (
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    Domain: {currentQuestion.category}
                  </span>
                )}
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </h3>
                {currentQuestion.context && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    {currentQuestion.context}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = answers[currentQuestion.id] === opt.points;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, opt.points)}
                      className={`p-4 rounded-2xl text-left border transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold block">{opt.text}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Score weight: +{opt.points} pts
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-teal-500 border-teal-500 text-slate-950 font-bold'
                            : 'border-slate-700 group-hover:border-slate-500'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-8">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      disabled={answers[currentQuestion.id] === undefined}
                      onClick={() => setCurrentQuestionIndex(i => Math.min(questions.length - 1, i + 1))}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-all shadow-md"
                    >
                      Next Question <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!isAllAnswered}
                      onClick={handleSubmit}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Evaluate Assessment
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Evaluation Results Card */
        <div className="space-y-6 animate-fadeIn">
          <div
            className="p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden"
            style={{
              backgroundColor: 'var(--card-bg, #182234)',
              borderColor: 'var(--border-color, #2d3e5b)'
            }}
          >
            {/* Result Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">
                  Indicative Assessment Result
                </span>
                <h3 className="text-2xl font-black text-white">
                  {completedResult.assessmentTitle}
                </h3>
                <span className="text-xs text-slate-400">
                  Evaluated at {new Date(completedResult.completedAt).toLocaleString()} • Stored in User Database
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake
                </button>
              </div>
            </div>

            {/* Score & Severity Gauge Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Total Evaluated Score</span>
                <div className="text-3xl font-black text-white flex items-baseline gap-2">
                  <span>{completedResult.totalScore}</span>
                  <span className="text-base text-slate-500 font-normal">/ {completedResult.maxScore}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full"
                    style={{ width: `${completedResult.scorePercentage}%` }}
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Severity Band</span>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getSeverityBadgeColor(completedResult.severityLevel)}`}>
                    {completedResult.severityLevel}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Calculated using standard clinical cutoffs
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Recommended Primary Action</span>
                <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                  {completedResult.recommendedAction}
                </p>
              </div>
            </div>

            {/* Indicative Summary Narrative */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 mb-6">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-teal-400" />
                Indicative Clinical Interpretation
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {completedResult.indicativeResult}
              </p>
            </div>

            {/* Domain / Category Breakdown */}
            {completedResult.categoryBreakdown && Object.keys(completedResult.categoryBreakdown).length > 0 && (
              <div className="mb-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Domain & Symptom Category Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(completedResult.categoryBreakdown).map(([cat, score]) => (
                    <div key={cat} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate">{cat}</span>
                        <span className="text-teal-400 font-mono font-bold">+{score} pts</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${Math.min(100, score * 25)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized Guidance Pathways */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Personalized Wellness Guidance & Intervention Pathways
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {completedResult.personalizedGuidance.map((guide, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {guide}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Consultation Callout */}
            {completedResult.suggestConsultation && (
              <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Connect with a Verified Clinical Counselor</h5>
                    <p className="text-xs text-indigo-200/80">
                      Confidential telehealth consultations are available with licensed psychologists and psychiatrists.
                    </p>
                  </div>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('providers')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 flex items-center gap-1.5 transition-all shadow-md"
                  >
                    View Verified Counselors <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Assessment Log */}
      {history.length > 0 && (
        <div
          className="p-6 rounded-3xl border shadow-xl"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Past Completed Assessments in Database ({history.length})
            </h4>
            <span className="text-xs text-slate-400">Synced to Client Relational Database</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {history.slice(0, 5).map(record => (
              <div key={record.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{record.assessmentTitle}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getSeverityBadgeColor(record.severityLevel)}`}>
                      {record.severityLevel}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {new Date(record.completedAt).toLocaleDateString()} at {new Date(record.completedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-cyan-400 block">
                      {record.totalScore} / {record.maxScore}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {record.scorePercentage}% index
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentalWellnessAssessment;

