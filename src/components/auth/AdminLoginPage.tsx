import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { ThemeToggle } from '../../context/ThemeContext';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
  messageBanner?: string | null;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate, messageBanner }) => {
  const { loginAdmin, isAuthenticated, currentRole } = useCanteen();

  const [email, setEmail] = useState('admin@aaacet.ac.in');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    messageBanner ? { type: 'error', text: messageBanner } : null
  );

  React.useEffect(() => {
    if (isAuthenticated && currentRole === 'admin') {
      onNavigate('/admin/dashboard');
    }
  }, [isAuthenticated, currentRole, onNavigate]);

  const fillValidAdminCredentials = () => {
    setEmail('admin@aaacet.ac.in');
    setPassword('Admin@123');
    setStatusMsg(null);
  };

  const fillInvalidAdminPassword = () => {
    setEmail('admin@aaacet.ac.in');
    setPassword('WrongAdminPassword!999');
    setStatusMsg({ type: 'error', text: 'Loaded wrong password. Click "Sign In" below to verify admin password rejection.' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!email.trim() || !password) {
      setStatusMsg({ type: 'error', text: 'Please enter Staff Admin Email and Password.' });
      return;
    }

    setIsSubmitting(true);
    const result = await loginAdmin(email, password);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMsg({ type: 'success', text: result.message || 'Admin authenticated! Redirecting to Canteen Admin Dashboard...' });
      setTimeout(() => {
        onNavigate('/admin/dashboard');
      }, 800);
    } else {
      setStatusMsg({ type: 'error', text: result.message || 'Invalid admin credentials or access denied.' });
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
            <ShieldCheck size={13} /> Staff & Admin Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 text-white tracking-tight">Canteen Admin Sign In</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Authorized Canteen Managers & Staff Only
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <ShieldAlert size={20} className="shrink-0 text-slate-900 dark:text-slate-100" />
            <div>
              <span className="font-bold block text-slate-900 dark:text-white">Staff Security Clearance Required</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Requires authorized <strong>@aaacet.ac.in</strong> staff credentials.
              </span>
            </div>
          </div>

          {/* Quick Real Test Credentials Pill */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Verified Admin Credentials</span>
              </span>
              <span className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                Admin Clearance
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mb-2.5">
              <span>Email: </span><strong className="text-slate-900 dark:text-white">admin@aaacet.ac.in</strong>
              <span className="mx-2">•</span>
              <span>Pass: </span><strong className="text-slate-900 dark:text-white">Admin@123</strong>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fillValidAdminCredentials}
                className="flex-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-bold rounded-xl transition text-center shadow-xs"
              >
                Fill Admin Credentials
              </button>
              <button
                type="button"
                onClick={fillInvalidAdminPassword}
                className="py-1.5 px-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium rounded-xl transition"
              >
                Test Wrong Password
              </button>
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
                  Staff Admin College Email
                </label>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  @aaacet.ac.in
                </span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@aaacet.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Admin Password
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
              <button
                type="button"
                onClick={() => onNavigate('/admin/forgot-password')}
                className="text-slate-900 dark:text-white hover:underline font-bold ml-auto"
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
                <span>Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Access Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Need to register a new admin account?{' '}
            <button
              onClick={() => onNavigate('/admin/register')}
              className="text-slate-900 dark:text-white hover:underline font-extrabold ml-1"
            >
              Register Admin Staff
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
