import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n/i18n';
import api from '../services/api';
import { User } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Save, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  LogOut,
  Lock,
  Globe,
  Bell
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(authUser);
  const [fullName, setFullName] = useState(authUser?.full_name || '');
  const [phone, setPhone] = useState(authUser?.phone || '');
  const [isLoading, setIsLoading] = useState(!authUser);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentLang = i18n.language || 'en';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<User>('/profile');
        setUser(res.data);
        setFullName(res.data.full_name);
        setPhone(res.data.phone || '');
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const res = await api.patch<User>('/profile', {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      setUser(res.data);
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLangChange = (lang: string) => {
    changeLanguage(lang);
    setMessage(`Language updated to ${lang === 'en' ? 'English' : 'മലയാളം'}.`);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/profile');
      logout();
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account', err);
      alert('Failed to delete account. Please try again later.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#EF2929] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400 font-medium">Loading user profile...</p>
      </div>
    );
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242424] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#282828] text-[#EF2929] text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Patient Account Settings
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Profile & Preferences</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your personal medical contact information, language preferences, and security.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#181818] text-neutral-300 hover:text-white hover:bg-[#202020] text-xs font-semibold transition self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 text-neutral-500" />
          <span>Sign Out</span>
        </button>
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

      {/* Profile Card */}
      <div className="bg-[#151515] rounded-3xl border border-[#282828] shadow-card-dark p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-[#242424] pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EF2929] to-[#991B1B] text-white flex items-center justify-center text-2xl font-bold shadow-glow-red">
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{fullName || 'User'}</h2>
            <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-neutral-500" /> {user?.email}
            </p>
            <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-600" /> Member since {memberSince}
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Full Legal Name <span className="text-[#EF2929]">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="e.g., Alexandra Smith"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Primary Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#282828] bg-[#1A1A1A] text-neutral-400 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Email cannot be changed once verified.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Language Preference
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleLangChange('en')}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                    currentLang === 'en'
                      ? 'border-[#EF2929] bg-[#EF2929]/15 text-[#EF2929]'
                      : 'border-[#2E2E2E] bg-[#202020] text-neutral-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleLangChange('ml')}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition font-malayalam ${
                    currentLang === 'ml'
                      ? 'border-[#EF2929] bg-[#EF2929]/15 text-[#EF2929]'
                      : 'border-[#2E2E2E] bg-[#202020] text-neutral-400 hover:text-white'
                  }`}
                >
                  മലയാളം
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold shadow-glow-red hover:shadow-glow-red-lg transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Privacy Box */}
      <div className="bg-[#151515] rounded-3xl border border-[#282828] p-6 sm:p-8 space-y-3 shadow-card-dark">
        <div className="flex items-center gap-2 text-white font-bold">
          <Lock className="w-5 h-5 text-[#EF2929]" />
          <h3 className="text-base">Medical Privacy & Data Governance</h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          MedEase protects your clinical data under end-to-end encrypted storage standards. Your health records and prescription images are accessible solely by you and any caregivers you explicitly authorize. We do not sell or monetize personal medical data.
        </p>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-red-950/20 rounded-3xl border border-red-900/40 p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-base font-bold text-red-400">Danger Zone: Delete Account</h3>
          <p className="text-xs text-red-300/80 mt-1">
            Permanently delete your MedEase account along with all uploaded prescriptions, extracted medication history, adherence reminders, and caregiver authorizations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-900/80 hover:bg-red-800 text-white text-xs font-bold shadow-sm transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Permanently Delete My Account</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#151515] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-900/50 space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-7 h-7 flex-shrink-0" />
              <h3 className="text-xl font-extrabold text-white">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you completely sure? This will permanently delete your account, prescriptions, medication records, and reminders. This operation is irreversible.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl bg-[#EF2929] hover:bg-[#DC2626] text-white text-xs font-bold shadow-glow-red transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
