// MindSync - Appointment Booking Modal
import React, { useState } from 'react';
import {
  X,
  Calendar,
  Video,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { HealthcareProvider, ConsultationType, Appointment } from '../../types';
import { generateUUID } from '../../utils/crypto';

interface AppointmentBookingModalProps {
  provider: HealthcareProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  provider,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();

  const [consultationType, setConsultationType] = useState<ConsultationType>('virtual');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !provider) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Please log in to confirm an appointment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const newAppointment: Appointment = {
        id: `apt-${generateUUID().substring(0, 8)}`,
        userId: user.id,
        providerId: provider.id,
        providerName: provider.name,
        providerSpecialization: provider.specialization,
        providerPhotoUrl: provider.photoUrl,
        date: selectedDate,
        timeSlot: selectedSlot,
        consultationType,
        status: 'confirmed',
        notes: notes.trim() || undefined,
        bookedAt: new Date().toISOString()
      };

      db.saveAppointment(newAppointment);

      // Also add a user notification
      db.addNotification({
        id: generateUUID(),
        userId: user.id,
        type: 'appointment',
        title: 'Appointment Confirmed',
        message: `Your ${consultationType} appointment with ${provider.name} is booked for ${selectedDate} at ${selectedSlot}.`,
        isRead: false,
        timestamp: new Date().toISOString()
      });

      setIsSubmitting(false);
      onSuccess(newAppointment);
    } catch (err: unknown) {
      console.error('Failed to book appointment:', err);
      setErrorMsg('Could not book appointment. Please try selecting a different slot.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative space-y-5"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            Book Consultation Appointment
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose your preferred date, time slot, and session modality.
          </p>
        </div>

        {/* Doctor Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <img
            src={provider.photoUrl}
            alt={provider.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{provider.name}</h3>
            <span className="text-xs text-teal-400 block">{provider.specialization}</span>
            <span className="text-[11px] text-slate-400 block truncate">
              {provider.clinicLocation} • ₹{provider.consultationFee}
            </span>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Consultation Modality: Virtual vs In-Person */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Consultation Modality
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!provider.isOnlineAvailable}
                onClick={() => setConsultationType('virtual')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  consultationType === 'virtual'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                } ${!provider.isOnlineAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <Video className="w-4 h-4" /> Virtual Telehealth Video
              </button>

              <button
                type="button"
                disabled={!provider.isInPersonAvailable}
                onClick={() => setConsultationType('in-person')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  consultationType === 'in-person'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                } ${!provider.isInPersonAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <Building className="w-4 h-4" /> In-Person Clinic Visit
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Available Time Slots
            </label>
            <div className="grid grid-cols-3 gap-2">
              {provider.availableTimeSlots.map(slot => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedSlot === slot
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Brief Note / Primary Concern (Optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Work-related anxiety, sleep disruption, guidance with stress..."
              rows={2}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Confirm Button */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-400 block">Total Due at Session:</span>
              <span className="text-base font-black text-white">₹{provider.consultationFee}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
