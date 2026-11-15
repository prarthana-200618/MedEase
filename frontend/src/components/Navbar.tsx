import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { changeLanguage } from '../i18n/i18n';
import { 
  HeartPulse, 
  FileText, 
  Clock, 
  Bot, 
  Users, 
  LogOut, 
  UploadCloud, 
  User as UserIcon,
  Sparkles,
  ArrowRight,
  Globe,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  Settings
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'ml' : 'en';
    changeLanguage(nextLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/chat' || path === '/assistant') {
      return location.pathname === '/chat' || location.pathname === '/assistant';
    }
    return location.pathname === path;
  };

  const navLinks = [
    { label: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('uploadDocument'), path: '/upload', icon: UploadCloud, highlight: true },
    { label: t('myDocuments'), path: '/documents', icon: FileText },
    { label: t('aiAssistant'), path: '/assistant', icon: Bot },
    { label: t('medicineReminders'), path: '/reminders', icon: Clock },
    { label: t('caregiverAccess'), path: '/caregivers', icon: Users },
    { label: t('profile'), path: '/profile', icon: Settings },
  ];

  // 1. PUBLIC HEADER (When unauthenticated)
  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 bg-[#090909]/90 backdrop-blur-xl border-b border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EF2929] to-[#991B1B] flex items-center justify-center shadow-glow-red group-hover:scale-105 transition-transform duration-300">
                  <HeartPulse className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-[#EF2929]/20 rounded-2xl blur-xs -z-10 group-hover:bg-[#EF2929]/40 transition-colors" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-red-400 transition-colors">
                    MedEase
                  </span>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EF2929]/15 text-[#EF2929] border border-[#EF2929]/30 uppercase">
                    AI Health
                  </span>
                </div>
                <p className="text-[10px] tracking-widest text-neutral-400 uppercase font-semibold">
                  {t('tagline')}
                </p>
              </div>
            </Link>

            {/* Public Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                  isActive('/') ? 'text-white bg-[#1C1C1C]' : 'text-neutral-400 hover:text-white hover:bg-[#151515]'
                }`}
              >
                Home
              </Link>
              <Link
                to="/prescription-translation"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-2 ${
                  isActive('/prescription-translation')
                    ? 'text-white bg-[#1C1C1C]'
                    : 'text-neutral-400 hover:text-white hover:bg-[#151515]'
                }`}
              >
                <span>{t('prescriptionTranslation')}</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/40 uppercase">
                  Free
                </span>
              </Link>
              <a
                href="/#features"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide text-neutral-400 hover:text-white hover:bg-[#151515] transition"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide text-neutral-400 hover:text-white hover:bg-[#151515] transition"
              >
                How It Works
              </a>
              <a
                href="/#trust-security"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide text-neutral-400 hover:text-white hover:bg-[#151515] transition"
              >
                Security
              </a>
            </nav>

            {/* Right CTAs */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151515] hover:bg-[#202020] border border-[#2a2a2a] text-xs font-medium text-neutral-300 transition"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#EF2929]" />
                <span>{currentLang === 'en' ? 'മലയാളം' : 'English'}</span>
              </button>

              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#151515] transition"
              >
                {t('login')}
              </Link>

              <Link
                to="/register"
                className="relative inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold tracking-wide shadow-glow-red hover:shadow-glow-red-lg transition group"
              >
                <span>{t('getStarted')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                className="p-2 rounded-xl bg-[#151515] border border-[#2a2a2a] text-xs font-semibold text-neutral-300"
              >
                {currentLang === 'en' ? 'ML' : 'EN'}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-[#151515] border border-[#2a2a2a] text-neutral-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#222222] bg-[#0E0E0E] px-4 pt-3 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-neutral-200 hover:bg-[#1A1A1A]"
            >
              Home
            </Link>
            <Link
              to="/prescription-translation"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-neutral-200 hover:bg-[#1A1A1A]"
            >
              <span>{t('prescriptionTranslation')}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                Free
              </span>
            </Link>
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-neutral-200 hover:bg-[#1A1A1A]"
            >
              Features
            </a>
            <div className="pt-3 border-t border-[#222222] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#181818] text-sm font-semibold text-white"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#EF2929] text-sm font-bold text-white shadow-glow-red"
              >
                {t('getStarted')}
              </Link>
            </div>
          </div>
        )}
      </header>
    );
  }

  // 2. AUTHENTICATED PATIENT PORTAL NAVIGATION (Desktop Sidebar + Mobile Dock)
  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-[#121212] border-r border-[#222222] z-40">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#222222]">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EF2929] to-[#991B1B] flex items-center justify-center shadow-glow-red group-hover:scale-105 transition-transform duration-300">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  MedEase
                </span>
                <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EF2929]/15 text-[#EF2929] border border-[#EF2929]/30 uppercase">
                  Portal
                </span>
              </div>
              <p className="text-[9px] tracking-widest text-neutral-400 uppercase font-semibold">
                HEALTH SIMPLIFIED
              </p>
            </div>
          </Link>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  active
                    ? 'bg-[#202020] text-white border border-[#2e2e2e] shadow-sm'
                    : item.highlight
                    ? 'bg-[#EF2929]/10 text-[#EF2929] hover:bg-[#EF2929]/20 border border-[#EF2929]/25 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#181818]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      active
                        ? 'text-[#EF2929]'
                        : item.highlight
                        ? 'text-[#EF2929]'
                        : 'text-neutral-400 group-hover:text-neutral-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EF2929] shadow-glow-red" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Language switch & User Footer */}
        <div className="p-4 border-t border-[#222222] space-y-3 bg-[#0E0E0E]">
          <button
            type="button"
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#262626] text-xs font-medium text-neutral-300 transition"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#EF2929]" />
              <span>Language</span>
            </div>
            <span className="font-bold text-white text-[11px] px-2 py-0.5 rounded bg-[#2a2a2a]">
              {currentLang === 'en' ? 'English' : 'മലയാളം'}
            </span>
          </button>

          <div className="flex items-center justify-between pt-2">
            <Link to="/profile" className="flex items-center gap-3 min-w-0 flex-1 group">
              <div className="w-8 h-8 rounded-xl bg-[#262626] border border-[#333333] text-white flex items-center justify-center text-xs font-bold group-hover:border-[#EF2929] transition">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition">
                  {user?.full_name || 'Patient'}
                </p>
                <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-neutral-500 hover:text-red-400 hover:bg-[#202020] rounded-xl transition"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#090909]/95 backdrop-blur-md border-b border-[#222222] px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#EF2929] to-[#991B1B] flex items-center justify-center shadow-glow-red">
            <HeartPulse className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white">
              MedEase
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-lg bg-[#181818] border border-[#2a2a2a] text-[11px] font-bold text-neutral-300"
          >
            {currentLang === 'en' ? 'ML' : 'EN'}
          </button>

          <Link
            to="/profile"
            className="w-8 h-8 rounded-xl bg-[#1C1C1C] border border-[#2a2a2a] text-white flex items-center justify-center text-xs font-bold"
          >
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Floating Dock (matching Screenshot 2 reference) */}
      <nav className="lg:hidden fixed bottom-3 left-4 right-4 z-40 bg-[#151515]/95 backdrop-blur-xl border border-[#2c2c2c] rounded-2xl shadow-card-dark py-2 px-3 flex items-center justify-around">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
            isActive('/dashboard') ? 'text-[#EF2929]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          to="/documents"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
            isActive('/documents') ? 'text-[#EF2929]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-medium">Records</span>
        </Link>

        {/* Elevated Upload Button in Center */}
        <Link
          to="/upload"
          className="relative -top-4 w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EF2929] to-[#DC2626] text-white flex items-center justify-center shadow-glow-red hover:scale-105 transition-transform"
          title="Upload Medical Document"
        >
          <UploadCloud className="w-6 h-6" />
        </Link>

        <Link
          to="/assistant"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
            isActive('/assistant') || isActive('/chat') ? 'text-[#EF2929]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] font-medium">AI Assist</span>
        </Link>

        <Link
          to="/reminders"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
            isActive('/reminders') ? 'text-[#EF2929]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-medium">Reminders</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
