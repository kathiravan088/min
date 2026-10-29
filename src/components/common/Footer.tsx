// MindSync - Academic Project Footer & Ethical Boundary Declarations
import React from 'react';
import { Brain } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90 text-slate-400 py-10 mt-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Project Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-base font-black tracking-tight">MindSync</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">
                Mini Project
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              AI-Powered Mental Wellness and Personalized Support Platform. Engineered with on-device
              landmark estimation, routine-aware screen time reminders, behavioral stress baselines, and
              verified healthcare provider integration.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-teal-400 font-mono pt-1">
              <span>● Privacy-by-Design</span>
              <span>● Zero Remote Video Storage</span>
              <span>● DPDP / GDPR Aligned</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Features</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('mood')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Camera Emotion Check
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('screentime')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Device Screen Time
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('behavior')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Behavioral Rhythm
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('wellness')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Breathwork & Grounding
                </button>
              </li>
            </ul>
          </div>

          {/* Healthcare & Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Healthcare & Help</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('providers')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Counselor Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('appointments')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Telehealth Consultation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('emergency')}
                  className="hover:text-rose-400 transition-colors text-rose-300 font-semibold"
                >
                  Crisis Helplines (14416)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Privacy & Data Matrix
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical Non-Diagnostic Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300 block mb-0.5">Ethical & Clinical Boundary Disclaimer:</strong>
          MindSync is designed solely for supportive wellness guidance and academic demonstration. Facial
          expression estimations and behavioral stress indicators represent statistical inferences, not medical or
          psychiatric diagnoses. If you or someone you know is in severe distress or acute danger, please contact
          official national emergency hotlines (Tele-MANAS: 14416 or 112) immediately.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-900">
          <span>MindSync © 2026 • Final-Year Academic Mini-Project</span>
          <span>Built with React, TypeScript, FACS Facial Geometry & Relational Data Engine</span>
        </div>
      </div>
    </footer>
  );
};
