import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Building2, UserCheck } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { ThemeToggle } from '../../context/ThemeContext';

interface StudentLoginPageProps {
  onNavigate: (path: string) => void;
  messageBanner?: string | null;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ onNavigate, messageBanner }) => {
  const { loginStudent, isAuthenticated, currentRole } = useCanteen();

  const [emailOrRoll, setEmailOrRoll] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    messageBanner ? { type: 'error', text: messageBanner } : null
  );

  React.useEffect(() => {
    if (isAuthenticated) {
      if (currentRole === 'admin') {
        onNavigate('/admin/dashboard');
      } else {
        onNavigate('/student/menu');
      }
    }
  }, [isAuthenticated, currentRole, onNavigate]);

  React.useEffect(() => {
    if (messageBanner) {
      setStatusMsg({ type: 'error', text: messageBanner });
    }
  }, [messageBanner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!emailOrRoll.trim() || !password) {
      setStatusMsg({ type: 'error', text: 'Please enter your College Email or Student Roll No and Password.' });
      return;
    }

    setIsSubmitting(true);
    const result = await loginStudent(emailOrRoll, password);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMsg({ type: 'success', text: result.message || 'Login successful! Redirecting to Student Menu...' });
      setTimeout(() => {
        const pendingRedirect = localStorage.getItem('quickserve_pending_redirect');
        if (pendingRedirect) {
          localStorage.removeItem('quickserve_pending_redirect');
          onNavigate(pendingRedirect);
        } else {
          onNavigate('/student/menu');
        }
      }, 800);
    } else {
      setStatusMsg({ type: 'error', text: result.message || 'Invalid college email or password.' });
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        {/* Minimal Header */}
        <div className="bg-slate-900 dark:bg-slate-800/90 p-6 text-white text-center relative border-b border-slate-800">
          <div className="absolute right-4 top-4">
            <ThemeToggle size="sm" />
          </div>
          <span className="bg-slate-800 dark:bg-slate-700/80 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 border border-slate-700">
            <Building2 size={12} /> Student Access Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">Student Sign In</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Exclusive portal for AAACET students (@aaacet.ac.in)
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Domain Security Banner */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <Building2 size={20} className="shrink-0 text-slate-900 dark:text-slate-100" />
            <div>
              <span className="font-bold block text-slate-900 dark:text-white">AAA College Domain Verification</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Sign in with your official <strong>@aaacet.ac.in</strong> email or roll number.
              </span>
            </div>
          </div>

          {statusMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
              )}
              <span className="leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Student College Email / Roll No
                </label>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  @aaacet.ac.in
                </span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  value={emailOrRoll}
                  onChange={e => setEmailOrRoll(e.target.value)}
                  placeholder="e.g. rollnumber@aaacet.ac.in or rollnumber"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your full college email or student roll number.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-slate-900 dark:text-white focus:ring-slate-900 dark:focus:ring-slate-400"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => onNavigate('/student/forgot-password')}
                className="text-slate-900 dark:text-white hover:underline font-bold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <UserCheck size={18} />
                  <span>Sign In to Student Account</span>
                </>
              )}
            </button>
          </form>

          {/* Navigation link to Register */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have a student account yet?{' '}
            <button
              onClick={() => onNavigate('/student/register')}
              className="text-slate-900 dark:text-white hover:underline font-extrabold ml-1"
            >
              Create Student Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
