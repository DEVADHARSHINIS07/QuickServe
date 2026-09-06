import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, KeyRound, Lock, CheckCircle2, AlertCircle, Building2, ArrowLeft, Send } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

interface StudentForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

const COLLEGE_DOMAIN = 'aaacet.ac.in';

export const StudentForgotPasswordPage: React.FC<StudentForgotPasswordPageProps> = ({ onNavigate }) => {
  const { forgotPassword, resetPassword } = useCanteen();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith(`@${COLLEGE_DOMAIN}`)) {
      setStatusMsg({
        type: 'error',
        text: `Please enter a valid AAACET email address ending with @${COLLEGE_DOMAIN}`
      });
      return;
    }

    setIsSubmitting(true);
    const res = await forgotPassword(trimmed);
    setIsSubmitting(false);

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: res.message || `Password reset instructions sent to ${trimmed}. Please check your inbox.`
      });
      setStep('reset');
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Email not found.' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!token || !newPassword || !confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(token, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: 'Password reset successful! You can now sign in with your new password.'
      });
      setTimeout(() => {
        onNavigate('/student/login');
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Invalid or expired reset token.' });
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 p-6 text-white text-center">
          <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
            <Building2 size={12} /> Student Recovery
          </span>
          <h2 className="text-2xl font-black mt-2">
            {step === 'request' ? 'Student Password Reset' : 'Enter Reset Token'}
          </h2>
          <p className="text-xs text-orange-100 mt-1 font-medium">
            Reset your @aaacet.ac.in student account password
          </p>
        </div>

        <div className="p-6 space-y-5">
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

          {step === 'request' ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Registered College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="24urcs029@aaacet.ac.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  We will send password reset instructions to your official college inbox.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-amber-500 hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sending Email...</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reset Token / Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-2.5 text-slate-400" size={17} />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Enter token from email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-mono font-medium focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={17} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={17} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-amber-500 hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <KeyRound size={18} />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('/student/login')}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Student Login
            </button>
            {step === 'request' && (
              <button
                onClick={() => setStep('reset')}
                className="text-orange-600 hover:underline font-bold"
              >
                Have a code?
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
