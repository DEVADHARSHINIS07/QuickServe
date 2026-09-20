import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

interface StudentLoginPageProps {
  onNavigate: (path: string) => void;
  messageBanner?: string | null;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ onNavigate, messageBanner }) => {
  const { loginStudent, isAuthenticated, currentRole } = useCanteen();

  const [emailOrRoll, setEmailOrRoll] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Student portal • aaacet.ac.in
          </p>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            )}
            <span className="leading-relaxed">{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Email or Roll Number
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                required
                value={emailOrRoll}
                onChange={e => setEmailOrRoll(e.target.value)}
                placeholder="rollnumber@aaacet.ac.in"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('/student/forgot-password')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Need an account?{' '}
          <button
            onClick={() => onNavigate('/student/register')}
            className="text-slate-900 dark:text-white font-semibold hover:underline"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};
