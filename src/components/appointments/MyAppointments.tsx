// MindSync - My Appointments Dashboard (Upcoming, Past, Reschedule, Cancel)
import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Building,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { Appointment } from '../../types';

interface MyAppointmentsProps {
  onJoinVirtualConsultation: (appointment: Appointment) => void;
  onBookNewAppointment: () => void;
}

export const MyAppointments: React.FC<MyAppointmentsProps> = ({
  onJoinVirtualConsultation,
  onBookNewAppointment
}) => {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    return user ? db.getAppointments(user.id) : [];
  });

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [rescheduleModalApt, setRescheduleModalApt] = useState<Appointment | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<string>('');
  const [newRescheduleSlot, setNewRescheduleSlot] = useState<string>('11:00 AM');

  const filtered = appointments.filter(apt => {
    if (activeTab === 'upcoming') return apt.status === 'confirmed' || apt.status === 'pending';
    if (activeTab === 'completed') return apt.status === 'completed';
    return apt.status === 'cancelled';
  });

  const handleCancel = (appointmentId: string) => {
    if (window.confirm('Are you sure you wish to cancel this appointment?')) {
      db.cancelAppointment(appointmentId);
      if (user) setAppointments(db.getAppointments(user.id));
    }
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleModalApt(apt);
    setNewRescheduleDate(apt.date);
    setNewRescheduleSlot(apt.timeSlot);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalApt) return;

    db.rescheduleAppointment(rescheduleModalApt.id, newRescheduleDate, newRescheduleSlot);
    if (user) setAppointments(db.getAppointments(user.id));
    setRescheduleModalApt(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="p-5 rounded-2xl border"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-teal-400" />
              My Appointments & Consultations
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Manage upcoming virtual or in-person sessions, access teleconsultation rooms, or view
              past provider summaries.
            </p>
          </div>

          <button
            onClick={onBookNewAppointment}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center gap-1.5 self-start sm:self-auto"
          >
            + Find & Book Doctor
          </button>
        </div>

        {/* Tab Filters */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Upcoming ({appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'completed'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Past & Completed ({appointments.filter(a => a.status === 'completed').length})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cancelled'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Appointment Cards List */}
      {filtered.length === 0 ? (
        <div
          className="p-12 rounded-2xl border text-center space-y-3"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No {activeTab} appointments found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'upcoming'
              ? 'You do not have any scheduled appointments. Explore verified doctors and counselors to book your first session.'
              : `No ${activeTab} consultation records stored in your profile.`}
          </p>
          {activeTab === 'upcoming' && (
            <button
              onClick={onBookNewAppointment}
              className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors inline-block"
            >
              Browse Directory
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(apt => (
            <div
              key={apt.id}
              className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              style={{
                backgroundColor: 'var(--card-bg, #182234)',
                borderColor: 'var(--border-color, #2d3e5b)'
              }}
            >
              <div className="flex items-start gap-4">
                <img
                  src={apt.providerPhotoUrl}
                  alt={apt.providerName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{apt.providerName}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : apt.status === 'completed'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <span className="text-xs text-teal-400 block font-medium">
                    {apt.providerSpecialization}
                  </span>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      {new Date(apt.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      {apt.timeSlot}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      {apt.consultationType === 'virtual' ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-emerald-400" /> Virtual Video
                        </>
                      ) : (
                        <>
                          <Building className="w-3.5 h-3.5 text-blue-400" /> In-Person Clinic
                        </>
                      )}
                    </span>
                  </div>

                  {apt.notes && (
                    <p className="text-[11px] text-slate-400 italic mt-1">
                      Reason / Note: “{apt.notes}”
                    </p>
                  )}

                  {apt.doctorNotes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <span className="font-bold text-teal-400 block mb-0.5">Doctor's Recommendations:</span>
                      {apt.doctorNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {apt.status === 'confirmed' && apt.consultationType === 'virtual' && (
                  <button
                    onClick={() => onJoinVirtualConsultation(apt)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <Video className="w-4 h-4" /> Join Virtual Call
                  </button>
                )}

                {apt.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => handleOpenReschedule(apt)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--card-bg, #182234)',
              borderColor: 'var(--border-color, #2d3e5b)'
            }}
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-teal-400" />
              Reschedule Appointment with {rescheduleModalApt.providerName}
            </h3>

            <form onSubmit={handleConfirmReschedule} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Select New Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newRescheduleDate}
                  onChange={e => setNewRescheduleDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Select New Time Slot</label>
                <select
                  value={newRescheduleSlot}
                  onChange={e => setNewRescheduleSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                >
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalApt(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
