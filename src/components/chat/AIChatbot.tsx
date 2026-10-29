// MindSync - AI Wellness Chatbot & Clarification Assistant
import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  ShieldCheck,
  Heart,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  Camera,
  Smartphone,
  Keyboard,
  Wind
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionTag?: 'emergency' | 'screentime' | 'mood' | 'providers' | 'wellness';
  actionLabel?: string;
  actionTarget?: string;
}

const PRESET_QUESTIONS = [
  { label: 'Is my camera feed private?', icon: Camera },
  { label: 'Why is my screen time flagged?', icon: Smartphone },
  { label: 'What does typing cadence measure?', icon: Keyboard },
  { label: 'Quick stress relief exercise', icon: Wind },
  { label: 'How to book a verified therapist?', icon: Heart }
];

interface AIChatbotProps {
  onNavigate?: (tab: string) => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  onNavigate,
  isOpenExternal,
  onCloseExternal
}) => {
  const { user, routine, screenTimeGoal } = useAuth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init_msg_1',
      sender: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm your MindSync AI Companion. I'm here to clarify any doubts you have about your emotional telemetry, camera landmarks privacy, screen time health, or wellness exercises. What would you like to know today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync external open state if controlled
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg_${Date.now()}`,
        sender: 'ai',
        text: `Chat history cleared. How can I assist you with your mental wellness or answer platform doubts?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Comprehensive Knowledge Engine to resolve user doubts
  const generateAIResponse = (query: string): { text: string; actionTag?: ChatMessage['actionTag']; actionLabel?: string; actionTarget?: string } => {
    const q = query.toLowerCase();

    // 1. Crisis / Emergency Triggers (Safety-first protocol)
    if (
      q.includes('suicide') ||
      q.includes('kill myself') ||
      q.includes('die') ||
      q.includes('end it all') ||
      q.includes('hurt myself') ||
      q.includes('hopeless') ||
      q.includes('emergency') ||
      q.includes('crisis')
    ) {
      return {
        text: `⚠️ **Please know you are not alone, and immediate compassionate support is available right now.**\n\nIf you are in distress or having thoughts of self-harm, please reach out immediately:\n• **KIRAN Mental Health Toll-Free (India)**: 1800-599-0019 (24/7)\n• **Vandrevala Foundation Helpline**: +91 9999 666 555\n• **National Emergency**: 112\n• **988 Suicide & Crisis Lifeline (US)**: 988\n\nYou matter, and qualified professionals are ready to listen without judgment.`,
        actionTag: 'emergency',
        actionLabel: 'Open Crisis & Emergency Helplines',
        actionTarget: 'emergency'
      };
    }

    // 2. Camera Landmark & Privacy Doubts
    if (
      q.includes('camera') ||
      q.includes('landmark') ||
      q.includes('facs') ||
      q.includes('video') ||
      q.includes('privacy') ||
      q.includes('face') ||
      q.includes('watch me') ||
      q.includes('recorded')
    ) {
      return {
        text: `🔒 **100% Privacy Guarantee:**\n\nMindSync's camera estimator runs **completely on your local device browser** using geometric Facial Action Coding System (FACS) math. Here is how your privacy is protected:\n\n1. **Zero Video Recording**: No video or photos are ever saved, recorded, or transmitted to any server.\n2. **Coordinates Only**: The algorithm computes mathematical distances between 468 landmark coordinates (e.g. eye aperture, eyebrow furrow, lip corner pull).\n3. **Local Memory Only**: Once the geometric inference finishes, the frame is instantly discarded from RAM.\n4. You can grant or revoke camera access anytime from your browser or the Privacy Center.`,
        actionTag: 'mood',
        actionLabel: 'Test Camera Landmark Estimator',
        actionTarget: 'mood'
      };
    }

    // 3. Screen Time & Night Blue Light Doubts
    if (
      q.includes('screen') ||
      q.includes('phone') ||
      q.includes('unlock') ||
      q.includes('night') ||
      q.includes('blue light') ||
      q.includes('sleep')
    ) {
      const bedtime = routine?.sleepTime || '22:30';
      const goal = screenTimeGoal?.dailyTargetMin ? Math.round(screenTimeGoal.dailyTargetMin / 60) : 5;
      return {
        text: `📱 **Screen Time & Sleep Architecture:**\n\nYour target bedtime is set for **${bedtime}**, with a daily goal of **${goal} hours**.\n\n• **Why night screen time is flagged**: Blue-wavelength light from screens suppresses melatonin secretion by up to 50%, delaying REM onset and causing unrefreshing sleep.\n• **The 20-20-20 Rule**: Every 20 minutes of screen work, look at an object 20 feet away for at least 20 seconds to relax ciliary eye muscles.\n• **Routine-Aware Warnings**: MindSync automatically raises gentle reminders when you exceed your evening threshold so your body can wind down naturally.`,
        actionTag: 'screentime',
        actionLabel: 'View Your Screen Time Telemetry',
        actionTarget: 'screentime'
      };
    }

    // 4. Behavioral Stress & Typing Dynamics
    if (
      q.includes('typing') ||
      q.includes('keystroke') ||
      q.includes('behavior') ||
      q.includes('cadence') ||
      q.includes('fatigue')
    ) {
      return {
        text: `⌨️ **How Behavioral Dynamics Measure Stress:**\n\nCognitive overload and emotional distress manifest through subtle motor rhythm shifts:\n\n• **Correction Bursts**: Frequent rapid backspacing or delete key strokes often indicate cognitive fatigue or frustration.\n• **Flight Time Variability**: The elapsed interval between key release and next key press becomes irregular under stress compared to your relaxed baseline.\n• **Pause Patterns**: Unusually long pauses in midsentence signal attention fragmentation.\n\nAll tracking runs anonymously in memory to alert you before burnout occurs.`,
        actionTag: 'screentime',
        actionLabel: 'Check Behavioral Stress Metrics',
        actionTarget: 'behavior'
      };
    }

    // 5. Breathing & Stress Relief Exercises
    if (
      q.includes('breath') ||
      q.includes('anxiety') ||
      q.includes('anxious') ||
      q.includes('relax') ||
      q.includes('panic') ||
      q.includes('stress') ||
      q.includes('grounding') ||
      q.includes('calm')
    ) {
      return {
        text: `🌿 **Instant Box Breathing (Sama Vritti):**\n\nTry this proven parasympathetic nervous system reset right now:\n\n1. **Inhale slowly** through your nose for **4 seconds**.\n2. **Hold your breath** gently for **4 seconds**.\n3. **Exhale smoothly** through parted lips for **4 seconds**.\n4. **Rest empty** for **4 seconds**.\n\nRepeat for 3 cycles. This stimulates the vagus nerve, rapidly lowering heart rate and cortisol levels. You can also use our interactive guided breathing tool!`,
        actionTag: 'wellness',
        actionLabel: 'Open Guided Breathwork Tool',
        actionTarget: 'wellness'
      };
    }

    // 6. Finding Therapists & Booking Appointments
    if (
      q.includes('counselor') ||
      q.includes('therapist') ||
      q.includes('doctor') ||
      q.includes('psychologist') ||
      q.includes('psychiatrist') ||
      q.includes('appointment') ||
      q.includes('book') ||
      q.includes('fee')
    ) {
      return {
        text: `🩺 **Verified Healthcare Counselors Directory:**\n\nMindSync maintains a verified directory of licensed clinical psychologists, psychiatrists (AIIMS/NIMHANS trained), and counselors:\n\n• **Filters**: Search by specialty (Anxiety, ADHD, Depression, Burnout), language (English, Hindi, Bengali), and fee.\n• **Online Telehealth & In-Person**: Book instant 1-on-1 confidential video consultations or in-clinic visits.\n• **Zero Hidden Fees**: Clear consultation pricing displayed upfront before you confirm.`,
        actionTag: 'providers',
        actionLabel: 'Browse Counselor Directory',
        actionTarget: 'providers'
      };
    }

    // 7. General / Theme / Account Questions
    if (q.includes('theme') || q.includes('dark') || q.includes('light')) {
      return {
        text: `🎨 **Dark & Light Mode:**\n\nYou can toggle between Dark Mode and Light Mode anytime by clicking the **Sun / Moon icon** in the top navigation bar (or on the Login Page). MindSync dynamically recalibrates high-contrast colors, card backgrounds, and typography tokens instantly.`
      };
    }

    if (q.includes('who are you') || q.includes('what is mindsync') || q.includes('how does this work')) {
      return {
        text: `🧠 **About MindSync AI:**\n\nMindSync is an AI-powered multimodal mental wellness platform designed to estimate emotional states, encourage balanced device habits, and offer confidential support.\n\nIt combines:\n1. **Camera Landmark FACS Geometry** (emotion valence estimation)\n2. **Screen Time & Night Vigilance** (healthy digital boundaries)\n3. **Behavioral Dynamics** (typing cadence & stress telemetry)\n4. **Interactive Wellness Toolkit** (breathing, journaling, soundscapes)\n5. **Verified Counselors & Crisis Helplines**`
      };
    }

    // Default Empathetic Response
    return {
      text: `Thank you for asking! MindSync is here to support your mental well-being and answer any questions you have about your emotional trends, privacy, digital routines, or stress patterns.\n\nWould you like to explore **camera landmark privacy**, **reduce screen time fatigue**, or **try a 2-minute breathwork exercise**?`,
      actionTag: 'wellness',
      actionLabel: 'Explore Wellness Toolkit',
      actionTarget: 'wellness'
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const responseData = generateAIResponse(query);
      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: responseData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTag: responseData.actionTag,
        actionLabel: responseData.actionLabel,
        actionTarget: responseData.actionTarget
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to render bold markers and bullets cleanly
  const renderFormattedText = (rawText: string) => {
    return rawText.split('\n').map((line, lineIdx) => {
      // Line with bullet or numbered list
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const isNumbered = /^\d+\.\s/.test(line.trim());
      
      // Parse **bold** parts
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const parsedContent = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-bold text-teal-300">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <div
          key={lineIdx}
          className={`${lineIdx > 0 ? 'mt-1.5' : ''} ${
            isBullet || isNumbered ? 'pl-2 border-l-2 border-teal-500/30' : ''
          }`}
        >
          {parsedContent}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Icon with Attractive Attention Animations */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Animated Attention Pill Callout */}
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-teal-500/40 text-teal-300 text-xs font-semibold shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
            style={{ animation: 'msChatFloat 3.6s ease-in-out infinite' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Need advice? Chat with AI</span>
            <ChevronRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Glowing Animated Circular Trigger Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 bg-gradient-to-tr from-teal-500 via-teal-600 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white rounded-full shadow-2xl shadow-teal-500/40 transition-all duration-300 hover:scale-110 active:scale-95 border border-teal-400/40 flex items-center justify-center cursor-pointer"
            style={{ animation: 'msChatGlowPulse 3s ease-in-out infinite' }}
            title="Open MindSync AI Wellness Assistant"
            aria-label="Open MindSync AI Chatbot"
          >
            {/* Ambient Pulse Ripple Rings */}
            <span className="absolute inset-0 rounded-full bg-teal-400/25 animate-ping pointer-events-none" style={{ animationDuration: '2.4s' }} />

            {/* Bot Icon with Micro-float */}
            <Bot className="w-6 h-6 text-white relative z-10 drop-shadow" />

            {/* Online Pulse Dot */}
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 z-10" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping z-10 pointer-events-none" />
          </button>
        </div>
      )}

      {/* Floating AI Chat Assistant Window / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl rounded-2xl border overflow-hidden backdrop-blur-xl ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 sm:bottom-6 right-4 sm:right-6 w-[94vw] sm:w-[450px] h-[600px] max-h-[92vh]'
          }`}
          style={{
            backgroundColor: 'var(--card-bg, #0f172a)',
            borderColor: 'var(--border-color, #1e293b)',
            animation: 'msWindowPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) both'
          }}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white tracking-tight">MindSync AI Companion</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Empathetic guidance, privacy &amp; wellness clarification
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleResetChat}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                title="Clear Chat History"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 items-center justify-center transition-colors"
                title={isExpanded ? 'Restore window size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 flex items-center justify-center transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preset Quick Chips Bar */}
          <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto flex gap-2 no-scrollbar items-center">
            {PRESET_QUESTIONS.map((q, idx) => {
              const Icon = q.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.label)}
                  className="h-7 px-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-teal-300 text-[11px] font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-all duration-150 shadow-sm leading-none"
                >
                  <Icon className="w-3 h-3 text-teal-400 shrink-0" />
                  <span className="whitespace-nowrap">{q.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-start ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
                style={{ animation: 'msMsgFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}
              >
                {/* AI Avatar */}
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed relative group shadow-md transition-all ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-tr from-teal-600 to-teal-500 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{renderFormattedText(msg.text)}</div>

                  {/* Interactive Target Action Button if provided */}
                  {msg.actionTag && msg.actionTarget && onNavigate && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          onNavigate(msg.actionTarget!);
                          if (!isExpanded) setIsOpen(false);
                        }}
                        className={`w-full h-8 px-3 rounded-lg text-xs font-bold flex items-center justify-between transition-all leading-none ${
                          msg.actionTag === 'emergency'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                            : 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 shadow-sm'
                        }`}
                      >
                        <span className="truncate">{msg.actionLabel || 'Navigate to Feature'}</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Bottom Meta & Copy Action */}
                  <div
                    className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-800/40 text-[10px] ${
                      msg.sender === 'user' ? 'text-teal-100' : 'text-slate-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            ))}

            {/* Animated Typing Indicator */}
            {isTyping && (
              <div
                className="flex items-start gap-2.5"
                style={{ animation: 'msMsgFadeIn 0.25s ease both' }}
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-900/90 border border-slate-800/90 flex items-center gap-2 text-xs text-slate-400 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-teal-400" style={{ animation: 'msTypingBounce 1.2s infinite ease-in-out', animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-400" style={{ animation: 'msTypingBounce 1.2s infinite ease-in-out', animationDelay: '200ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-400" style={{ animation: 'msTypingBounce 1.2s infinite ease-in-out', animationDelay: '400ms' }} />
                  <span className="ml-1.5 text-[11px] text-teal-300 font-medium">MindSync AI is thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Form with Centered Layout */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about emotion estimation, screen time, stress, or crisis..."
                className="w-full h-10 pl-4 pr-11 rounded-xl text-xs bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className={`absolute right-1.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  inputMessage.trim() && !isTyping
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white shadow-md shadow-teal-500/20 scale-100 hover:scale-105 active:scale-95 cursor-pointer'
                    : 'text-slate-500 bg-transparent cursor-not-allowed'
                }`}
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 px-1 leading-none">
              <span className="flex items-center gap-1.5 text-teal-400/90 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Confidential &amp; on-device inference
              </span>
              <span className="text-slate-500">Press Enter ↵ to send</span>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS animations for AIChatbot */}
      <style>{`
        @keyframes msChatFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes msChatGlowPulse {
          0%, 100% {
            box-shadow: 0 8px 30px rgba(20, 184, 166, 0.35);
          }
          50% {
            box-shadow: 0 12px 38px rgba(20, 184, 166, 0.6), 0 0 0 6px rgba(20, 184, 166, 0.15);
          }
        }
        @keyframes msWindowPop {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes msMsgFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes msTypingBounce {
          0%, 80%, 100% {
            transform: scale(0.75);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};
