// MindSync - Emergency / Crisis Support & Verified Helplines
import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  Trash2,
  Info,
  Globe,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { EmergencyContact, CrisisHelpline } from '../../types';
import { generateUUID } from '../../utils/crypto';

export const EmergencySupport: React.FC = () => {
  const { user } = useAuth();

  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [helplines] = useState<CrisisHelpline[]>(() => db.getCrisisHelplines());
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    return user ? db.getEmergencyContacts(user.id) : [];
  });

  // Add Contact Form State
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>('');
  const [contactRelation, setContactRelation] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');

  const filteredHelplines = helplines.filter(hl =>
    selectedCountry === 'All' ? true : hl.country === selectedCountry
  );

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contactName.trim() || !contactPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `${user.id}_ec_${generateUUID().substring(0, 6)}`,
      name: contactName.trim(),
      relationship: contactRelation.trim() || 'Trusted Person',
      phone: contactPhone.trim(),
      isPrimary: contacts.length === 0
    };

    db.saveEmergencyContact(newContact);
    setContacts(db.getEmergencyContacts(user.id));
    setContactName('');
    setContactRelation('');
    setContactPhone('');
    setIsAddingContact(false);
  };

  const handleDeleteContact = (id: string) => {
    db.deleteEmergencyContact(id);
    if (user) setContacts(db.getEmergencyContacts(user.id));
  };

  return (
    <div className="space-y-6">
      {/* High-Visibility Crisis Header Banner */}
      <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 shadow-xl space-y-3 animate-fadeIn">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 mt-0.5 shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              Need Immediate Help? Crisis Support
            </h2>
            <p className="text-sm text-rose-200/90 mt-1 max-w-3xl">
              If you or someone you know is experiencing acute emotional distress, thoughts of
              self-harm, or an immediate emergency, free confidential help is available 24/7.
            </p>
          </div>
        </div>

        {/* Prominent Disclaimer */}
        <div className="p-3 rounded-xl bg-black/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-rose-400" />
          <span>
            <strong>Crucial Notice:</strong> MindSync is an educational wellness support platform, not
            an emergency response service. The platform does not diagnose medical emergencies or claim
            to prevent crises. Please reach out to the verified hotlines below.
          </span>
        </div>
      </div>

      {/* Quick Action One-Tap Indian Emergency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tele-MANAS */}
        <a
          href="tel:14416"
          className="p-5 rounded-2xl border bg-gradient-to-br from-teal-950/60 to-slate-900 border-teal-500/30 hover:border-teal-400 transition-all group block shadow-md"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
            Govt. of India 24x7 Toll-Free
          </span>
          <h3 className="text-lg font-black text-white group-hover:text-teal-300 transition-colors">
            Tele-MANAS
          </h3>
          <span className="text-2xl font-black text-teal-400 block my-1 font-mono">14416</span>
          <span className="text-xs text-slate-300 block">
            National Tele Mental Health Programme (20+ languages)
          </span>
        </a>

        {/* KIRAN Helpline */}
        <a
          href="tel:18005990019"
          className="p-5 rounded-2xl border bg-gradient-to-br from-blue-950/60 to-slate-900 border-blue-500/30 hover:border-blue-400 transition-all group block shadow-md"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
            Ministry of Social Justice
          </span>
          <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors">
            KIRAN Mental Health
          </h3>
          <span className="text-xl font-black text-blue-400 block my-1 font-mono">1800-599-0019</span>
          <span className="text-xs text-slate-300 block">
            24/7 Psychological First-Aid & Distress Support
          </span>
        </a>

        {/* National Emergency 112 */}
        <a
          href="tel:112"
          className="p-5 rounded-2xl border bg-gradient-to-br from-rose-950/60 to-slate-900 border-rose-500/30 hover:border-rose-400 transition-all group block shadow-md"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
            Immediate Physical Danger
          </span>
          <h3 className="text-lg font-black text-white group-hover:text-rose-300 transition-colors">
            National Emergency (ERSS)
          </h3>
          <span className="text-2xl font-black text-rose-400 block my-1 font-mono">112</span>
          <span className="text-xs text-slate-300 block">
            Immediate Police, Ambulance & Rescue Dispatch
          </span>
        </a>
      </div>

      {/* Two Columns: Verified Helpline Directory & Personal Emergency Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Verified Helplines Directory */}
        <div
          className="lg:col-span-7 p-6 rounded-2xl border space-y-4"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-400" />
                Verified Crisis Helplines Directory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Official hotlines verified from institutional and governmental registries.
              </p>
            </div>

            {/* Country Selector */}
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 self-start sm:self-auto"
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="All">All Regions</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredHelplines.map(hl => (
              <div
                key={hl.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{hl.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        hl.type === 'government'
                          ? 'bg-blue-500/20 text-blue-300'
                          : hl.type === 'emergency'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-teal-500/20 text-teal-300'
                      }`}
                    >
                      {hl.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{hl.description}</p>
                  <span className="text-[11px] text-slate-400 block">Hours: {hl.hours}</span>
                </div>

                <a
                  href={`tel:${hl.number.replace(/[^0-9+]/g, '')}`}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2 shadow"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call {hl.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Personal Trusted Emergency Contacts */}
        <div
          className="lg:col-span-5 p-6 rounded-2xl border space-y-4"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-teal-400" />
                Trusted Emergency Contacts
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Designate family members or close friends for one-tap contact.
              </p>
            </div>
            <button
              onClick={() => setIsAddingContact(!isAddingContact)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-xl transition-colors text-xs font-semibold"
            >
              {isAddingContact ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {/* Add Contact Form */}
          {isAddingContact && (
            <form onSubmit={handleAddContact} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Relationship</label>
                <input
                  type="text"
                  value={contactRelation}
                  onChange={e => setContactRelation(e.target.value)}
                  placeholder="e.g. Sister / Close Friend"
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Save Contact
              </button>
            </form>
          )}

          {/* Contact List */}
          <div className="space-y-2.5">
            {contacts.map(c => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white text-xs block">{c.name}</span>
                  <span className="text-[11px] text-slate-400 block">
                    {c.relationship} • {c.phone}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${c.phone}`}
                    className="p-2 rounded-lg bg-teal-600/20 text-teal-300 hover:bg-teal-600/30 transition-colors"
                    title="Call Contact"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-2 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 transition-colors"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
