import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Reminder, DocumentItem } from '../types';
import { 
  Clock, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Bell,
  Calendar,
  FileText,
  Pill,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from 'lucide-react';

export const RemindersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const docId = searchParams.get('doc');

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(!!docId);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('BD (Twice Daily)');
  const [timeOfDay, setTimeOfDay] = useState('08:00 AM, 08:00 PM');
  const [selectedDocId, setSelectedDocId] = useState<string>(docId || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReminders = async () => {
    try {
      const res = await api.get<Reminder[]>('/reminders');
      setReminders(res.data);
    } catch (err) {
      console.error('Failed to fetch reminders', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get<DocumentItem[]>('/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  useEffect(() => {
    fetchReminders();
    fetchDocuments();
  }, []);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) {
      setError('Please provide a medication name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.post<Reminder>('/reminders', {
        document_id: selectedDocId ? parseInt(selectedDocId) : null,
        medication_name: medName.trim(),
        dosage: dosage.trim() || undefined,
        frequency,
        time_of_day: timeOfDay,
      });
      setReminders([res.data, ...reminders]);
      setMedName('');
      setDosage('');
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this medicine reminder?')) return;
    try {
      await api.delete(`/reminders/${id}`);
      setReminders(reminders.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete reminder', err);
    }
  };

  const handleToggle = async (reminder: Reminder) => {
    try {
      const res = await api.patch(`/reminders/${reminder.id}`, {
        is_active: !reminder.is_active,
      });
      setReminders(reminders.map((r) => (r.id === reminder.id ? res.data : r)));
    } catch (err) {
      console.error('Failed to toggle reminder status', err);
    }
  };

  const frequencyOptions = [
    { label: 'OD (Once Daily)', times: '08:00 AM' },
    { label: 'BD (Twice Daily)', times: '08:00 AM, 08:00 PM' },
    { label: 'TDS (Three Times Daily)', times: '08:00 AM, 02:00 PM, 08:00 PM' },
    { label: 'QID (Four Times Daily)', times: '06:00 AM, 12:00 PM, 06:00 PM, 10:00 PM' },
    { label: 'SOS / PRN (As Needed)', times: 'As needed upon symptom' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242424] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#282828] text-[#EF2929] text-xs font-semibold uppercase tracking-wider mb-2">
            <Bell className="w-3.5 h-3.5" />
            Adherence Management
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Verified Medicine Reminders</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Organize daily medication routines verified from your clinical prescriptions.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold tracking-wide shadow-glow-red hover:shadow-glow-red-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'New Reminder'}</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-[#1A1512] border border-amber-900/50 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 space-y-1">
          <p className="font-bold text-amber-300">Medication Safety Principle</p>
          <p className="leading-relaxed">
            MedEase schedules reminders exclusively from prescription instructions verified by you. Always confirm drug dosages and timing with your pharmacist before taking medication.
          </p>
        </div>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateReminder}
          className="bg-[#151515] rounded-3xl border border-[#282828] shadow-card-dark p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-[#242424] pb-4">
            <Pill className="w-5 h-5 text-[#EF2929]" />
            <h2 className="text-lg font-bold text-white">Add Medicine Schedule</h2>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#EF2929]" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Medication Name <span className="text-[#EF2929]">*</span>
              </label>
              <input
                type="text"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                placeholder="e.g., Metformin, Paracetamol, Amoxicillin"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Dosage & Strength
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g., 500mg, 1 tablet, 5ml"
                className="w-full px-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => {
                  setFrequency(e.target.value);
                  const matched = frequencyOptions.find((opt) => opt.label === e.target.value);
                  if (matched) setTimeOfDay(matched.times);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] transition"
              >
                {frequencyOptions.map((opt) => (
                  <option key={opt.label} value={opt.label} className="bg-[#202020] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Daily Scheduled Times
              </label>
              <input
                type="text"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                placeholder="e.g., 08:00 AM, 08:00 PM"
                className="w-full px-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Linked Prescription (Optional)
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] transition"
              >
                <option value="" className="bg-[#202020] text-neutral-400">No linked document (Manual entry)</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id} className="bg-[#202020] text-white">
                    {doc.title || `Document #${doc.id}`} ({new Date(doc.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242424]">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold shadow-glow-red transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Reminder'}
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#EF2929] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400 font-medium">Loading medicine schedule...</p>
        </div>
      ) : reminders.length === 0 ? (
        <div className="bg-[#151515] border border-dashed border-[#282828] rounded-3xl p-12 text-center space-y-4 shadow-card-dark">
          <div className="w-14 h-14 rounded-2xl bg-[#202020] text-[#EF2929] flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No active reminders</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
              Add your daily prescription reminders to stay on schedule and share adherence alerts with family caregivers.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold shadow-glow-red transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Reminder</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`p-5 rounded-3xl border transition shadow-card-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                r.is_active ? 'bg-[#151515] border-[#262626]' : 'bg-[#111111] border-[#1D1D1D] opacity-60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    r.is_active ? 'bg-[#202020] text-[#EF2929]' : 'bg-[#1A1A1A] text-neutral-500'
                  }`}
                >
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white">{r.medication_name}</h3>
                    {r.dosage && (
                      <span className="px-2 py-0.5 rounded-md bg-[#222222] text-neutral-300 text-xs font-semibold">
                        {r.dosage}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-[#1C1C1C] text-neutral-400 text-xs font-medium">
                      {r.frequency}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <Clock className="w-3.5 h-3.5 text-[#EF2929]" />
                      {r.time_of_day}
                    </span>
                    {r.document_id && (
                      <Link
                        to={`/documents/${r.document_id}`}
                        className="flex items-center gap-1 text-[#EF2929] hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Prescription #{r.document_id}
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggle(r)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    r.is_active
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/80'
                      : 'bg-[#202020] text-neutral-400 hover:text-white border border-[#2A2A2A]'
                  }`}
                >
                  {r.is_active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Active</span>
                    </>
                  ) : (
                    <span>Paused</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-[#202020] rounded-xl transition"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
