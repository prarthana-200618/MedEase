import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AuthResponse } from '../types';
import { 
  HeartPulse, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      login(response.data.access_token, response.data.user);
      navigate(returnUrl);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please check your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#EF2929]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-[#151515] border border-[#282828] rounded-3xl p-8 sm:p-10 shadow-card-dark space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EF2929] to-[#991B1B] text-white flex items-center justify-center mx-auto shadow-glow-red">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Sign In to MedEase
          </h1>
          <p className="text-xs text-neutral-400">
            Access your verified health records, AI assistant & reminders
          </p>
        </div>

        {/* Redirect notice if returning from protected card */}
        {returnUrl && returnUrl !== '/dashboard' && (
          <div className="p-3 rounded-2xl bg-[#1E1E1E] border border-[#2D2D2D] text-neutral-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EF2929] flex-shrink-0" />
            <span>Please sign in to access your requested health feature.</span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#EF2929]" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-sm font-bold tracking-wide shadow-glow-red hover:shadow-glow-red-lg transition disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Links */}
        <div className="pt-4 border-t border-[#242424] text-center space-y-2">
          <p className="text-xs text-neutral-400">
            Don’t have an account?{' '}
            <Link
              to={`/register?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="text-[#EF2929] hover:text-red-400 font-bold transition"
            >
              Create Account
            </Link>
          </p>
          <div className="pt-2">
            <Link
              to="/prescription-translation"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#EF2929]" />
              <span>Just want to translate a prescription? Use Free Tool</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
