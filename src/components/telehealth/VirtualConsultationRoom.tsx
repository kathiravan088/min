// MindSync - Virtual Telehealth Consultation Room (Mock Telemedicine Environment)
import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  FileText,
  User,
  Send,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { Appointment } from '../../types';

interface VirtualConsultationRoomProps {
  appointment: Appointment;
  onExitConsultation: () => void;
}

export const VirtualConsultationRoom: React.FC<VirtualConsultationRoomProps> = ({
  appointment,
  onExitConsultation
}) => {
  const { user } = useAuth();

  const [callState, setCallState] = useState<'pre_call' | 'in_call' | 'post_call'>('pre_call');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoActive, setIsVideoActive] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);

  // Chat messages
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'doctor'; text: string; time: string }[]>([
    {
      sender: 'doctor',
      text: `Hello ${user?.name || 'there'}, welcome to our confidential consultation. How are you feeling today?`,
      time: 'Just now'
    }
  ]);
  const [currentChatInput, setCurrentChatInput] = useState<string>('');

  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start webcam for user video
  useEffect(() => {
    if (callState === 'in_call' && isVideoActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then(stream => {
          streamRef.current = stream;
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
            userVideoRef.current.play();
          }
        })
        .catch(err => {
          console.warn('Could not access user webcam for teleconsultation:', err);
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [callState, isVideoActive]);

  // Call duration counter
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (callState === 'in_call') {
      interval = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const handleStartCall = () => {
    setCallState('in_call');
    setCallDurationSeconds(0);
  };

  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    // Mark appointment as completed in database with doctor notes
    const doctorNotes =
      'Session completed. Client reports periodic work-related cognitive fatigue and late-night screen exposure. Advised 4-7-8 breathing pacer twice daily, strict sleep window adherence, and weekly self-check-ins.';

    db.completeAppointment(appointment.id, doctorNotes, [
      'Practice 4-7-8 Box Breathing before bedtime',
      'Digital quiet hours after 10:30 PM',
      'Hydration replenishment during morning study sessions'
    ]);

    setCallState('post_call');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChatInput.trim()) return;

    const newMsg = {
      sender: 'user' as const,
      text: currentChatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setCurrentChatInput('');

    // Simulated doctor response after 2 seconds
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'doctor',
          text: 'I understand. Focusing on gradual routine calibration and breathwork will help ease that tension.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 2000);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  };

  // State 1: Pre-Call Check
  if (callState === 'pre_call') {
    return (
      <div
        className="max-w-2xl mx-auto p-8 rounded-2xl border space-y-6 animate-fadeIn"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20">
            <ShieldCheck className="w-4 h-4" /> End-to-End Encrypted Telehealth
          </div>
          <h2 className="text-2xl font-black text-white">Virtual Consultation Waiting Room</h2>
          <p className="text-xs text-slate-400">
            Please review session details and verify audio/camera before joining your provider.
          </p>
        </div>

        {/* Provider Profile Summary */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <img
            src={appointment.providerPhotoUrl}
            alt={appointment.providerName}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shrink-0"
          />
          <div>
            <h3 className="text-base font-bold text-white">{appointment.providerName}</h3>
            <span className="text-xs text-teal-400 font-semibold block">
              {appointment.providerSpecialization}
            </span>
            <span className="text-xs text-slate-300 block mt-1">
              Scheduled Slot: <strong>{appointment.timeSlot}</strong> • {appointment.date}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-teal-400" /> Pre-Session Guidelines:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
            <li>Ensure you are in a quiet, private space where you feel safe to speak openly.</li>
            <li>Use headphones for optimal audio clarity and acoustic privacy.</li>
            <li>
              MindSync provides this encrypted telehealth environment. No recordings are retained on
              remote servers.
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onExitConsultation}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Back to Appointments
          </button>

          <button
            onClick={handleStartCall}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-lg flex items-center gap-2"
          >
            <Video className="w-4 h-4" /> Enter Consultation Room
          </button>
        </div>
      </div>
    );
  }

  // State 2: Active Call Room
  if (callState === 'in_call') {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Top Call Info Bar */}
        <div
          className="p-3.5 rounded-2xl border flex items-center justify-between"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-2">
                Consultation with {appointment.providerName}
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  1080p HD • Encrypted
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-white bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              {formatTime(callDurationSeconds)}
            </span>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                isChatOpen
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Chat
            </button>
          </div>
        </div>

        {/* Video Grid & Optional Chat Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Video Streams */}
          <div className={`${isChatOpen ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
            {/* Main Stage: Provider Video Simulation */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              <img
                src={appointment.providerPhotoUrl}
                alt={appointment.providerName}
                className="w-full h-full object-cover filter brightness-90"
              />

              {/* Provider Overlay Info */}
              <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-black/60 backdrop-blur-sm text-xs space-y-0.5">
                <span className="font-bold text-white block">{appointment.providerName}</span>
                <span className="text-[10px] text-teal-400 block">{appointment.providerSpecialization}</span>
              </div>

              {/* Audio Waveform Speaking Simulation Indicator */}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1 h-3 bg-emerald-400 animate-pulse rounded-full" />
                <span className="w-1 h-4 bg-emerald-400 animate-pulse delay-75 rounded-full" />
                <span className="w-1 h-2 bg-emerald-400 animate-pulse delay-150 rounded-full" />
                <span className="text-[11px] text-white ml-1">Doctor speaking...</span>
              </div>

              {/* User Picture-in-Picture Floating Window */}
              <div className="absolute bottom-4 right-4 w-40 h-28 sm:w-48 sm:h-36 rounded-xl bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden">
                {isVideoActive ? (
                  <video
                    ref={userVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950">
                    <User className="w-8 h-8" />
                    <span className="text-[10px] mt-1 text-slate-400">Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-1 left-2 text-[10px] text-white/90 font-medium drop-shadow">
                  You ({isMuted ? 'Muted' : 'Unmuted'})
                </div>
              </div>
            </div>

            {/* Bottom In-Call Control Bar */}
            <div
              className="p-4 rounded-2xl border flex items-center justify-center gap-4 shadow-xl"
              style={{
                backgroundColor: 'var(--card-bg, #182234)',
                borderColor: 'var(--border-color, #2d3e5b)'
              }}
            >
              {/* Audio Mute Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center transition-all ${
                  isMuted
                    ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Video Camera Toggle */}
              <button
                onClick={() => setIsVideoActive(!isVideoActive)}
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center transition-all ${
                  !isVideoActive
                    ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isVideoActive ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-colors shadow-lg shadow-rose-900/30"
              >
                <PhoneOff className="w-5 h-5" /> End Consultation
              </button>
            </div>
          </div>

          {/* Chat Sidebar */}
          {isChatOpen && (
            <div
              className="lg:col-span-4 rounded-2xl border p-4 flex flex-col justify-between h-[450px]"
              style={{
                backgroundColor: 'var(--card-bg, #182234)',
                borderColor: 'var(--border-color, #2d3e5b)'
              }}
            >
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  In-Session Secure Chat
                </h4>

                <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs ${
                        msg.sender === 'user'
                          ? 'bg-teal-600/20 text-teal-200 border border-teal-500/30 ml-4'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 mr-4'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>{msg.sender === 'user' ? 'You' : appointment.providerName}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={currentChatInput}
                  onChange={e => setCurrentChatInput(e.target.value)}
                  placeholder="Type a confidential note..."
                  className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // State 3: Post-Call Summary
  return (
    <div
      className="max-w-xl mx-auto p-8 rounded-2xl border space-y-6 text-center animate-fadeIn"
      style={{
        backgroundColor: 'var(--card-bg, #182234)',
        borderColor: 'var(--border-color, #2d3e5b)'
      }}
    >
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <h2 className="text-2xl font-black text-white">Consultation Completed</h2>
        <p className="text-xs text-slate-400 mt-1">
          Your session with {appointment.providerName} lasted {formatTime(callDurationSeconds)}.
          The appointment has been archived to your records.
        </p>
      </div>

      {/* Doctor's Post-Session Recommendations */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-3">
        <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> Provider Notes & Prescribed Wellness Actions
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          “Advised client on sleep hygiene and progressive muscle relaxation. Recommended 4-7-8
          breathing pacer twice daily and setting digital quiet hours past 10:30 PM.”
        </p>
        <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Practice 4-7-8 box breathing twice daily</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Digital quiet hours after 10:30 PM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Stay hydrated during prolonged screen study hours</span>
          </div>
        </div>
      </div>

      <button
        onClick={onExitConsultation}
        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
      >
        Return to My Appointments
      </button>
    </div>
  );
};
