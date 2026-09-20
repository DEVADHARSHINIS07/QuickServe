import React, { useState } from 'react';
import { Mail, KeyRound, Lock, CheckCircle2, AlertCircle, ArrowLeft, Send, ExternalLink } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

interface StudentForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

const COLLEGE_DOMAIN = 'aaacet.ac.in';

export const StudentForgotPasswordPage: React.FC<StudentForgotPasswordPageProps> = ({ onNavigate }) => {
  const { forgotPassword, resetPassword } = useCanteen();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Request 6-digit code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith(`@${COLLEGE_DOMAIN}`)) {
      setStatusMsg({
        type: 'error',
        text: `Original College Email Required: Please enter your official AAACET email address ending with @${COLLEGE_DOMAIN}`
      });
      return;
    }

    setIsSubmitting(true);
    const res = await forgotPassword(trimmed);
    setIsSubmitting(false);

    if (res.success) {
      if (res.otp) {
        setCode(res.otp);
      }
      setStatusMsg({
        type: 'success',
        text: res.message || `A 6-digit password reset code has been sent to ${trimmed}. Check your email!`
      });
      setStep('reset');
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'Email not found or service unavailable. Please check your address.'
      });
    }
  };

  // Submit 6-digit code and new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setStatusMsg({ type: 'error', text: 'Please enter the 6-digit verification code received in your email.' });
      return;
    }

    if (!newPassword || !confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Please enter and confirm your new password.' });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(trimmedCode, newPassword, email.trim().toLowerCase());
    setIsSubmitting(false);

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: 'Password reset successful! You can now sign in with your new password.'
      });
      setTimeout(() => {
        onNavigate('/student/login');
      }, 1800);
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'Invalid or expired 6-digit code. Please verify the code or request a new one.'
      });
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {step === 'request' ? 'Reset Password' : 'Enter Verification Code'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {step === 'request'
              ? 'Enter your college email to receive a 6-digit code'
              : `Code sent to ${email}`}
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
            <div className="flex-1 leading-relaxed">
              <span>{statusMsg.text}</span>
              {step === 'reset' && (
                <div className="mt-1.5">
                  <a
                    href="https://mail.google.com/mail/u/0/#inbox"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium underline inline-flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> Open Gmail
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                College Email (@aaacet.ac.in)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rollnumber@aaacet.ac.in"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Send size={13} />
              <span>{isSubmitting ? 'Sending...' : 'Send Code'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  6-Digit Code
                </label>
                <a
                  href="https://mail.google.com/mail/u/0/#inbox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={11} /> Open Gmail
                </a>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono tracking-wider text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleRequestCode}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => onNavigate('/student/login')}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Back to Sign In
          </button>
          {step === 'request' && (
            <button
              onClick={() => setStep('reset')}
              className="text-slate-900 dark:text-white hover:underline font-medium"
            >
              Have a code?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
