import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DocumentItem, Reminder } from '../types';
import { 
  UploadCloud, 
  FileText, 
  Clock, 
  Bot, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  Users,
  Plus,
  ShieldCheck,
  Calendar,
  Bell,
  ChevronRight,
  Languages,
  Activity,
  AlertCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, remsRes] = await Promise.all([
          api.get<DocumentItem[]>('/documents'),
          api.get<Reminder[]>('/reminders'),
        ]);
        setDocuments(docsRes.data);
        setReminders(remsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeRemindersCount = reminders.filter((r) => r.is_active).length;
  const processedDocsCount = documents.filter((d) => d.status === 'completed').length;
  const latestDoc = documents.length > 0 ? documents[0] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ======================================================== */}
      {/* PRIMARY HEALTH HERO CARD (Matches Attached Reference)     */}
      {/* ======================================================== */}
      <div className="relative rounded-3xl bg-[#151515] border border-[#282828] p-6 sm:p-8 shadow-card-dark overflow-hidden">
        {/* Subtle atmospheric crimson glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EF2929]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="relative z-10 flex items-start justify-between pb-6 border-b border-[#242424]">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 tracking-widest uppercase block">
              YOUR HEALTH. BETTER UNDERSTOOD.
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Hello, {user?.full_name || 'Alexandra'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Your health documents, simplified.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-10 h-10 rounded-2xl bg-[#202020] border border-[#2E2E2E] flex items-center justify-center text-neutral-300 hover:text-white hover:border-[#EF2929] transition relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-[#EF2929]" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#EF2929] shadow-glow-red" />
            </button>
          </div>
        </div>

        {/* Reference Metrics Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* Main Card: Medical documents */}
          <Link
            to="/documents"
            className="md:col-span-2 p-6 rounded-2xl bg-[#202020] hover:bg-[#252525] border border-[#2A2A2A] hover:border-[#383838] transition flex justify-between items-start group"
          >
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                Medical documents
              </h2>
              <p className="text-4xl font-extrabold text-white tracking-tight mt-2">
                {isLoading ? '--' : documents.length < 10 && documents.length > 0 ? `0${documents.length}` : documents.length}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Documents in your library
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-[#282828] text-[#EF2929] group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
          </Link>

          {/* Explanations count */}
          <div className="p-6 rounded-2xl bg-[#202020] border border-[#2A2A2A] flex justify-between items-start">
            <div>
              <h2 className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-[#EF2929]" />
                <span>Explanations</span>
              </h2>
              <p className="text-4xl font-extrabold text-white tracking-tight mt-2">
                {isLoading ? '--' : processedDocsCount < 10 && processedDocsCount > 0 ? `0${processedDocsCount}` : processedDocsCount}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Malayalam & English
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-[#282828] text-[#EF2929]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Active reminders */}
          <Link
            to="/reminders"
            className="p-6 rounded-2xl bg-[#202020] hover:bg-[#252525] border border-[#2A2A2A] flex justify-between items-start group"
          >
            <div>
              <h2 className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#EF2929]" />
                <span>Active reminders</span>
              </h2>
              <p className="text-4xl font-extrabold text-white tracking-tight mt-2">
                {isLoading ? '--' : activeRemindersCount < 10 && activeRemindersCount > 0 ? `0${activeRemindersCount}` : activeRemindersCount}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Scheduled daily doses
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-[#282828] text-[#EF2929] group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </Link>

          {/* AI Assistant Status */}
          <Link
            to="/assistant"
            className="md:col-span-2 p-6 rounded-2xl bg-[#202020] hover:bg-[#252525] border border-[#2A2A2A] flex justify-between items-center group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#282828] flex items-center justify-center text-[#EF2929] group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                  AI Medical Assistant
                </h3>
                <p className="text-xs text-neutral-400">
                  Ask questions about medical abbreviations (OD, BD, TDS) or your prescriptions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#EF2929]">
              <span>Ask Questions</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Reference: Recent Document Row */}
        <div className="relative z-10 mt-5 p-5 rounded-2xl bg-[#202020] border border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Recent document
            </h3>
            {latestDoc && (
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                latestDoc.status === 'completed'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
                  : latestDoc.status === 'processing'
                  ? 'bg-amber-950/80 text-amber-400 border-amber-800/40'
                  : 'bg-[#2E2E2E] text-neutral-400 border-[#3A3A3A]'
              }`}>
                {latestDoc.status === 'completed' ? 'Processed' : latestDoc.status}
              </span>
            )}
          </div>

          {latestDoc ? (
            <Link
              to={`/documents/${latestDoc.id}`}
              className="flex items-center justify-between p-3 rounded-xl bg-[#191919] hover:bg-[#242424] transition group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#262626] flex items-center justify-center text-[#EF2929] flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                    {latestDoc.title || latestDoc.original_filename}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Malayalam explanation available • {new Date(latestDoc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>
          ) : (
            <div className="p-4 text-center rounded-xl bg-[#191919] text-xs text-neutral-500">
              No recent documents uploaded yet. Upload a prescription below.
            </div>
          )}
        </div>

        {/* Reference: Prominent Crimson Upload Button */}
        <div className="relative z-10 mt-5">
          <Link
            to="/upload"
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-sm font-bold tracking-wide shadow-glow-red hover:shadow-glow-red-lg transition group active:scale-[0.99]"
          >
            <UploadCloud className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span>Upload Medical Document</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECONDARY DASHBOARD SECTIONS                             */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#EF2929]" />
              <span>Document History</span>
            </h2>
            <Link
              to="/documents"
              className="text-xs font-semibold text-[#EF2929] hover:text-red-300 transition flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#151515] border border-[#242424] text-center space-y-3">
              <FileText className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-neutral-300">No medical documents uploaded yet</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Upload prescriptions, lab reports, or hospital summaries to generate simple Malayalam explanations.
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#202020] hover:bg-[#282828] text-white text-xs font-semibold border border-[#303030] transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#EF2929]" />
                <span>Upload First Document</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 4).map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="p-4 rounded-2xl bg-[#151515] hover:bg-[#1C1C1C] border border-[#242424] hover:border-[#333333] transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#202020] text-[#EF2929] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                        {doc.title || doc.original_filename}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {new Date(doc.created_at).toLocaleDateString()} • {doc.file_type} • {(doc.file_size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      doc.status === 'completed'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                    }`}>
                      {doc.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Reminders Quick View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#EF2929]" />
              <span>Today's Medicines</span>
            </h2>
            <Link
              to="/reminders"
              className="text-xs font-semibold text-[#EF2929] hover:text-red-300 transition flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {reminders.length === 0 ? (
            <div className="p-6 rounded-3xl bg-[#151515] border border-[#242424] text-center space-y-2">
              <Clock className="w-6 h-6 text-neutral-600 mx-auto" />
              <p className="text-xs font-semibold text-neutral-300">No medicine reminders active</p>
              <p className="text-[11px] text-neutral-500">
                Reminders are created from verified prescription instructions.
              </p>
              <Link
                to="/reminders"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#202020] text-xs text-neutral-300 hover:text-white mt-2 transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#EF2929]" />
                <span>Create Reminder</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reminders.slice(0, 4).map((rem) => (
                <div
                  key={rem.id}
                  className="p-3.5 rounded-2xl bg-[#151515] border border-[#242424] flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{rem.medication_name}</h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {rem.frequency} • <span className="text-[#EF2929]">{rem.time_of_day}</span>
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    rem.is_active
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {rem.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Clinical Non-Diagnostic Disclaimer Box */}
          <div className="p-4 rounded-2xl bg-[#151515] border border-[#242424] text-xs text-neutral-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-neutral-300 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#EF2929]" />
              <span>Medical Verification Principle</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-500">
              MedEase clarifies doctor terminology. Always confirm medication dosage and timings with your doctor or pharmacist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
