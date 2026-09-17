import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, KeyRound, Lock, CheckCircle2, AlertCircle, Building2, ArrowLeft, Send, Inbox, ShieldCheck } from 'lucide-react';
import { useCanteen, CampusInboxModal } from '../../context/CanteenContext';
import { ThemeToggle } from '../../context/ThemeContext';

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
  const [showInboxModal, setShowInboxModal] = useState(false);

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
    <div className="max-w-md mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="bg-slate-900 dark:bg-slate-800/90 p-6 text-white text-center relative border-b border-slate-800">
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              onClick={() => setShowInboxModal(true)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold px-2 border border-slate-700"
              title="Open Campus Mail Delivery Viewer"
            >
              <Inbox size={14} />
              <span className="hidden sm:inline">Mail</span>
            </button>
            <ThemeToggle size="sm" />
          </div>
          <span className="bg-slate-800 dark:bg-slate-700/80 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 border border-slate-700">
            <Building2 size={12} /> Student Security
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            {step === 'request' ? 'Password Recovery' : 'Enter 6-Digit Code'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {step === 'request'
              ? 'Receive a 6-digit verification code to your college email'
              : `Verification code sent to ${email}`}
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
              <div className="flex-1 leading-relaxed">
                <span>{statusMsg.text}</span>
                {step === 'reset' && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowInboxModal(true)}
                      className="text-xs font-bold underline hover:opacity-80 inline-flex items-center gap-1"
                    >
                      <Inbox size={12} /> View Code in Campus Mail Delivery Viewer
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Original College Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="24urcs029@aaacet.ac.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-slate-500" />
                  We will send a 6-digit security code to this original college email.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sending Code...</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send 6-Digit Code to Email</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    6-Digit Code from Email *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowInboxModal(true)}
                    className="text-[11px] text-slate-900 dark:text-white font-bold underline flex items-center gap-1"
                  >
                    <Inbox size={12} /> Open Mail
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-2.5 text-slate-400" size={17} />
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Code sent to <strong>{email}</strong> (valid for 15 minutes).
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={17} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={17} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Verifying Code & Resetting Password...</span>
                ) : (
                  <>
                    <KeyRound size={18} />
                    <span>Reset Password with Code</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleRequestCode}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline font-semibold"
                >
                  Didn't get code? Send code again
                </button>
              </div>
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
                className="text-slate-900 dark:text-white hover:underline font-bold"
              >
                Already have a code?
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* In-app Mail Delivery Viewer */}
      <CampusInboxModal
        isOpen={showInboxModal}
        onClose={() => setShowInboxModal(false)}
        targetEmail={email.trim() || undefined}
      />
    </div>
  );
};
