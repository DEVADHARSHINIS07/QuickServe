import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle, ShieldCheck, UserPlus, Building2 } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { ThemeToggle } from '../../context/ThemeContext';

interface AdminRegisterPageProps {
  onNavigate: (path: string) => void;
}

const COLLEGE_DOMAIN = 'aaacet.ac.in';

export const AdminRegisterPage: React.FC<AdminRegisterPageProps> = ({ onNavigate }) => {
  const { registerAdmin } = useCanteen();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!name || !email || !mobile || !password || !confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Please fill in all mandatory fields.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith(`@${COLLEGE_DOMAIN}`)) {
      setStatusMsg({
        type: 'error',
        text: `Access Denied: Admin registration requires an official AAACET staff email ending with @${COLLEGE_DOMAIN}.`
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (password.length < 6) {
      setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsSubmitting(true);
    const result = await registerAdmin({
      name,
      email: trimmedEmail,
      mobile,
      password
    });
    setIsSubmitting(false);

    if (result.success) {
      setStatusMsg({
        type: 'success',
        text: `Admin account registered for ${trimmedEmail}! Confirmation email sent. Please sign in now.`
      });
      setTimeout(() => {
        onNavigate('/admin/login');
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: result.message || 'Admin registration failed. Email may already be registered.' });
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="bg-slate-900 dark:bg-slate-800/90 p-6 text-white text-center relative border-b border-slate-800">
          <div className="absolute right-4 top-4">
            <ThemeToggle size="sm" />
          </div>
          <span className="bg-slate-800 dark:bg-slate-700/80 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 border border-slate-700">
            <ShieldCheck size={13} /> Staff Registration
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 text-white tracking-tight">Register Admin Staff Account</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Smart Canteen System Management Portal • AAACET
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <Building2 size={20} className="shrink-0 text-slate-900 dark:text-slate-100" />
            <div>
              <span className="font-bold block text-slate-900 dark:text-white">College Staff Domain Mandatory</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Only authorized <strong>@aaacet.ac.in</strong> staff emails are permitted to register as Admin.
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 text-slate-400" size={17} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Canteen Manager"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Staff Mobile
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Staff Email
                  </label>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    @aaacet.ac.in
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="staff@aaacet.ac.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Registering Admin...</span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Register Staff Account</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Already registered as admin?{' '}
            <button
              onClick={() => onNavigate('/admin/login')}
              className="text-slate-900 dark:text-white hover:underline font-extrabold ml-1"
            >
              Sign In to Admin Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
