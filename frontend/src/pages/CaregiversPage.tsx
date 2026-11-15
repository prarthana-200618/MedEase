import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CaregiverItem } from '../types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Lock,
  Eye,
  Bell
} from 'lucide-react';

export const CaregiversPage: React.FC = () => {
  const [caregivers, setCaregivers] = useState<CaregiverItem[]>([]);
  const [email, setEmail] = useState('');
  const [canViewDocs, setCanViewDocs] = useState(true);
  const [canViewReminders, setCanViewReminders] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [isInviting, setIsInviting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCaregivers = async () => {
    try {
      const res = await api.get<CaregiverItem[]>('/caregivers');
      setCaregivers(res.data);
    } catch (err) {
      console.error('Failed to load caregivers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setMessage(null);
    setIsInviting(true);

    try {
      const res = await api.post('/caregivers/invite', {
        caregiver_email: email.trim(),
        permissions: { 
          can_view_documents: canViewDocs, 
          can_view_reminders: canViewReminders 
        },
        expires_in_days: expiresInDays,
      });
      setCaregivers([res.data, ...caregivers]);
      setEmail('');
      setMessage(`Caregiver invitation sent successfully to ${email}.`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send caregiver invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!window.confirm('Are you sure you want to revoke this caregiver’s access? They will immediately lose access to your documents and reminders.')) {
      return;
    }

    try {
      await api.delete(`/caregivers/${id}`);
      setCaregivers(
        caregivers.map((c) => (c.id === id ? { ...c, status: 'revoked' as const } : c))
      );
    } catch (err) {
      console.error('Failed to revoke access', err);
      alert('Unable to revoke access. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#242424] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#282828] text-[#EF2929] text-xs font-semibold uppercase tracking-wider mb-2">
          <Users className="w-3.5 h-3.5" />
          Caregiver Network
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Caregiver Access</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Grant secure, read-only access to trusted family members or caregivers to view your verified medicine schedules and prescriptions.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#EF2929]" />
          <span>{error}</span>
        </div>
      )}

      {/* Invite Caregiver Card */}
      <div className="bg-[#151515] rounded-3xl border border-[#282828] shadow-card-dark p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#242424] pb-4">
          <UserPlus className="w-5 h-5 text-[#EF2929]" />
          <h2 className="text-lg font-bold text-white">Authorize New Caregiver</h2>
        </div>

        <form onSubmit={handleInvite} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Caregiver Email Address <span className="text-[#EF2929]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="caregiver@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Access Duration
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] transition"
              >
                <option value={7} className="bg-[#202020] text-white">7 Days</option>
                <option value={30} className="bg-[#202020] text-white">30 Days</option>
                <option value={90} className="bg-[#202020] text-white">90 Days</option>
                <option value={365} className="bg-[#202020] text-white">1 Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Granted Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#262626] bg-[#1C1C1C] cursor-pointer hover:bg-[#222222] transition">
                <input
                  type="checkbox"
                  checked={canViewDocs}
                  onChange={(e) => setCanViewDocs(e.target.checked)}
                  className="w-4 h-4 text-[#EF2929] rounded border-[#333] focus:ring-[#EF2929] bg-[#252525]"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">View Medical Documents</span>
                  <span className="text-neutral-400">Allow viewing translated prescriptions and reports</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#262626] bg-[#1C1C1C] cursor-pointer hover:bg-[#222222] transition">
                <input
                  type="checkbox"
                  checked={canViewReminders}
                  onChange={(e) => setCanViewReminders(e.target.checked)}
                  className="w-4 h-4 text-[#EF2929] rounded border-[#333] focus:ring-[#EF2929] bg-[#252525]"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">View Medicine Reminders</span>
                  <span className="text-neutral-400">Allow viewing medication adherence times</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isInviting || !email.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold shadow-glow-red hover:shadow-glow-red-lg transition disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isInviting ? 'Sending Invite...' : 'Send Caregiver Invitation'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Caregivers List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Authorized Caregivers & Status</h2>

        {isLoading ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-8 h-8 border-4 border-[#EF2929] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Loading authorized caregivers...</p>
          </div>
        ) : caregivers.length === 0 ? (
          <div className="bg-[#151515] rounded-3xl border border-[#262626] p-8 text-center text-neutral-500 space-y-2">
            <Users className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm font-semibold text-neutral-300">No authorized caregivers yet</p>
            <p className="text-xs text-neutral-500">Invite a family member above to share access to your health records.</p>
          </div>
        ) : (
          <div className="bg-[#151515] rounded-3xl border border-[#262626] overflow-hidden shadow-card-dark divide-y divide-[#222222]">
            {caregivers.map((cg) => {
              const createdDate = new Date(cg.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const expireDate = cg.expires_at
                ? new Date(cg.expires_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;

              return (
                <div key={cg.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1A1A1A] transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#202020] text-[#EF2929] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{cg.caregiver_email}</h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            cg.status === 'accepted'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                              : cg.status === 'pending'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                              : 'bg-neutral-800 text-neutral-400 border border-[#333]'
                          }`}
                        >
                          {cg.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2 flex-wrap">
                        <span>Invited on {createdDate}</span>
                        {expireDate && (
                          <>
                            <span>•</span>
                            <span>Expires {expireDate}</span>
                          </>
                        )}
                        <span>•</span>
                        <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                          {cg.permissions?.can_view_documents && (
                            <span className="flex items-center gap-1 text-[#EF2929]">
                              <Eye className="w-3 h-3" /> Records
                            </span>
                          )}
                          {cg.permissions?.can_view_reminders && (
                            <span className="flex items-center gap-1 text-[#EF2929] ml-2">
                              <Bell className="w-3 h-3" /> Reminders
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {cg.status !== 'revoked' && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(cg.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-900/60 bg-red-950/30 text-red-400 hover:bg-red-950/70 text-xs font-semibold transition self-end sm:self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke Access</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-2xl bg-[#151515] border border-[#262626] text-xs text-neutral-400 flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#EF2929] flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy Commitment:</strong> Caregivers receive strict read-only access. They cannot edit your medical files or delete prescriptions. You retain full control and can instantly revoke access at any time.
        </p>
      </div>
    </div>
  );
};

export default CaregiversPage;
