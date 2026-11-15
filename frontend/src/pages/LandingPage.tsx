import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Bot, 
  Bell, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Layers,
  HeartPulse,
  ChevronRight,
  Eye,
  Activity,
  FileCheck2,
  Stethoscope
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleFeatureClick = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate(`/login?returnUrl=${encodeURIComponent(path)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white overflow-hidden selection:bg-[#EF2929] selection:text-white">
      {/* Hero Atmospheric Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#EF2929]/15 via-[#7F1D1D]/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* ======================================================== */}
      {/* HERO SECTION                                             */}
      {/* ======================================================== */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A1A] border border-[#2D2D2D] text-xs font-semibold tracking-wider text-neutral-300 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#EF2929] shadow-glow-red animate-pulse" />
            <span className="text-[#EF2929] font-bold">MedEase AI</span>
            <span className="text-neutral-500">•</span>
            <span className="uppercase text-[11px] tracking-widest">{t('tagline')}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
            Understand Your Medical Documents.{' '}
            <span className="bg-gradient-to-r from-white via-neutral-200 to-[#EF2929] bg-clip-text text-transparent">
              With Confidence.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
            MedEase translates handwritten prescriptions, complex lab results, and discharge summaries into clear, plain explanations in English and simple Malayalam.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <Link
              to="/prescription-translation"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-sm font-bold tracking-wide shadow-glow-red hover:shadow-glow-red-lg hover:scale-[1.02] active:scale-[0.98] transition duration-200 group"
            >
              <UploadCloud className="w-5 h-5 text-white" />
              <span>Translate Prescription Free</span>
              <span className="ml-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/20 text-white uppercase tracking-wider">
                No Login
              </span>
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-[#161616] hover:bg-[#202020] border border-[#2A2A2A] text-neutral-200 text-sm font-semibold tracking-wide transition group"
              >
                <span>Create Patient Account</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-white transition" />
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-[#161616] hover:bg-[#202020] border border-[#2A2A2A] text-neutral-200 text-sm font-semibold tracking-wide transition group"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-white transition" />
              </Link>
            )}
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-neutral-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#EF2929]" />
              <span>Free instant public translation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#EF2929]" />
              <span>Bilingual English & Malayalam</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#EF2929]" />
              <span>100% Patient data privacy</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card (Inspired by reference mockup) */}
        <div className="mt-16 relative max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-[#151515] border border-[#282828] p-6 sm:p-8 shadow-card-dark overflow-hidden">
            {/* Ambient top light */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#EF2929]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Inner Dashboard Mockup Header */}
            <div className="flex items-center justify-between pb-6 border-b border-[#242424]">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
                  MEDEASE CLINICAL DEMO
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Hello, Alexandra
                </h3>
                <p className="text-xs text-neutral-400">Your health documents, simplified.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-xs font-semibold">
                  Processed
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#202020] border border-[#2E2E2E] flex items-center justify-center text-neutral-300">
                  <Bell className="w-4 h-4 text-[#EF2929]" />
                </div>
              </div>
            </div>

            {/* Mockup Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {/* Card 1: Medical documents */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-[#202020] border border-[#2A2A2A] relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">Medical documents</h4>
                    <p className="text-3xl font-extrabold text-white mt-2">12</p>
                    <p className="text-xs text-neutral-400 mt-1">Documents in your library</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#282828] text-[#EF2929]">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Card 2: Explanations */}
              <div className="p-5 rounded-2xl bg-[#202020] border border-[#2A2A2A] flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-300">Explanations</h4>
                  <p className="text-3xl font-extrabold text-white mt-2">08</p>
                  <p className="text-xs text-neutral-400 mt-1">Malayalam & English</p>
                </div>
                <div className="p-2 rounded-xl bg-[#282828] text-[#EF2929]">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Mockup Recent Row */}
            <div className="mt-4 p-4 rounded-2xl bg-[#202020] border border-[#2A2A2A] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#282828] flex items-center justify-center text-[#EF2929]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Doctor Visit Prescription</h4>
                  <p className="text-xs text-neutral-400">
                    Malayalam explanation available • Paracetamol, Metformin, Pantoprazole
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
            </div>

            {/* CTA bar inside mockup */}
            <div className="mt-6">
              <Link
                to="/prescription-translation"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#EF2929] hover:bg-[#DC2626] text-white text-sm font-bold shadow-glow-red transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Medical Document</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4 FEATURE PILLARS                                       */}
      {/* ======================================================== */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1C1C1C]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181818] border border-[#282828] text-xs font-semibold text-[#EF2929]">
            <Sparkles className="w-3.5 h-3.5" />
            Healthcare Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Designed for Patients, Families & Caregivers
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Everything you need to decipher prescriptions, organize medications, and stay compliant with doctor instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Prescription Translation (PUBLIC) */}
          <div className="p-7 rounded-3xl bg-[#151515] border border-[#262626] hover:border-[#EF2929]/40 hover:shadow-card-dark transition duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#202020] border border-[#2E2E2E] flex items-center justify-center text-[#EF2929] group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-xs font-bold uppercase tracking-wider">
                  Free Public Access
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                  Prescription Translation
                </h3>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                  Upload any prescription (PDF or photo). Our AI pipeline extracts drug names, strengths, dosage frequencies (OD, BD, TDS), and outputs clear, bilingual explanations in English and Malayalam.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#222222] mt-6 flex items-center justify-between">
              <Link
                to="/prescription-translation"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#EF2929] group-hover:text-red-300 transition"
              >
                <span>Translate Now Without Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: AI Medical Assistant (PRIVATE) */}
          <div className="p-7 rounded-3xl bg-[#151515] border border-[#262626] hover:border-[#EF2929]/40 hover:shadow-card-dark transition duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#202020] border border-[#2E2E2E] flex items-center justify-center text-[#EF2929] group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#1F1F1F] text-neutral-300 border border-[#2E2E2E] text-xs font-bold uppercase tracking-wider">
                  Private Account
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                  AI Medical Assistant
                </h3>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                  Have questions about medical abbreviations or doctor notes? Chat with an intelligent assistant grounded in your uploaded records. Supports English, Malayalam, and Manglish.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#222222] mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleFeatureClick('/assistant')}
                className="inline-flex items-center gap-2 text-sm font-bold text-neutral-200 hover:text-[#EF2929] transition"
              >
                <span>Ask Document Questions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Verified Medicine Reminders (PRIVATE) */}
          <div className="p-7 rounded-3xl bg-[#151515] border border-[#262626] hover:border-[#EF2929]/40 hover:shadow-card-dark transition duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#202020] border border-[#2E2E2E] flex items-center justify-center text-[#EF2929] group-hover:scale-105 transition-transform">
                  <Bell className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#1F1F1F] text-neutral-300 border border-[#2E2E2E] text-xs font-bold uppercase tracking-wider">
                  Private Account
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                  Verified Medicine Reminders
                </h3>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                  Never miss medication. Reminders are created strictly from manually verified prescription instructions. Get daily notification times and track adherence seamlessly.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#222222] mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleFeatureClick('/reminders')}
                className="inline-flex items-center gap-2 text-sm font-bold text-neutral-200 hover:text-[#EF2929] transition"
              >
                <span>Manage Reminders</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 4: Caregiver Sharing & Records (PRIVATE) */}
          <div className="p-7 rounded-3xl bg-[#151515] border border-[#262626] hover:border-[#EF2929]/40 hover:shadow-card-dark transition duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#202020] border border-[#2E2E2E] flex items-center justify-center text-[#EF2929] group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#1F1F1F] text-neutral-300 border border-[#2E2E2E] text-xs font-bold uppercase tracking-wider">
                  Private Account
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                  Caregiver Access & Records
                </h3>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                  Grant trusted family members or caregivers secure, read-only access to your medical records and reminders so they can assist with your healthcare regimen.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#222222] mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleFeatureClick('/caregivers')}
                className="inline-flex items-center gap-2 text-sm font-bold text-neutral-200 hover:text-[#EF2929] transition"
              >
                <span>Manage Caregivers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* HOW IT WORKS                                             */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1C1C1C]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181818] border border-[#282828] text-xs font-semibold text-[#EF2929]">
            <Layers className="w-3.5 h-3.5" />
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How MedEase Works</h2>
          <p className="text-sm text-neutral-400">
            From handwritten clinic slip to structured medication adherence in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-[#151515] border border-[#262626] space-y-4">
            <span className="text-3xl font-extrabold text-[#EF2929]/40">01</span>
            <h4 className="text-lg font-bold text-white">Upload Document</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Upload PDF or image files (JPG, PNG) up to 15MB. Walk-in users can use the free public tool immediately.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#151515] border border-[#262626] space-y-4">
            <span className="text-3xl font-extrabold text-[#EF2929]/40">02</span>
            <h4 className="text-lg font-bold text-white">OCR & Extraction</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              OpenCV enhances the scan, while the OCR pipeline detects medications, strengths, dosages, and schedules.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#151515] border border-[#262626] space-y-4">
            <span className="text-3xl font-extrabold text-[#EF2929]/40">03</span>
            <h4 className="text-lg font-bold text-white">Bilingual Explanation</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Get symmetrical English and Malayalam explanations. Audio playback enables elderly patients to listen comfortably.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#151515] border border-[#262626] space-y-4">
            <span className="text-3xl font-extrabold text-[#EF2929]/40">04</span>
            <h4 className="text-lg font-bold text-white">Confirm & Schedule</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Verify detected medicines, edit any uncertain text, and activate daily dosage reminders.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* TRUST, SECURITY & SAFETY                                 */}
      {/* ======================================================== */}
      <section id="trust-security" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1C1C1C]">
        <div className="rounded-3xl bg-[#151515] border border-[#262626] p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#202020] text-xs font-semibold text-[#EF2929]">
              <Lock className="w-3.5 h-3.5" />
              Privacy & Clinical Governance
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Your Health Information Stays Yours
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              MedEase uses 256-bit cryptographic isolation. Public uploads use unguessable random tokens that never appear in public dashboards or search engines. We never sell medical records.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-neutral-300 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> DPDP Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Non-Diagnostic Safety Boundaries
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> End-to-End Encryption
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
