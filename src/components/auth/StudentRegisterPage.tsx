import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Hash, Lock, CheckCircle2, AlertCircle, Building2, UserPlus, ShieldCheck, Send, KeyRound, Sparkles, Inbox } from 'lucide-react';
import { useCanteen, CampusInboxModal } from '../../context/CanteenContext';
import { ThemeToggle } from '../../context/ThemeContext';

interface StudentRegisterPageProps {
  onNavigate: (path: string) => void;
}

const COLLEGE_DOMAIN = 'aaacet.ac.in';

export const StudentRegisterPage: React.FC<StudentRegisterPageProps> = ({ onNavigate }) => {
  const { registerStudent, checkOriginalEmail, sendEmailVerificationCode, verifyEmailCode } = useCanteen();

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<{ isOriginal: boolean; reason?: string } | null>(null);

  // General submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  // Real-time email validation
  const handleEmailChange = async (val: string) => {
    setEmail(val);
    setIsEmailVerified(false);
    setCodeSent(false);
    setVerificationCode('');

    const clean = val.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setEmailCheckResult(null);
      return;
    }

    // Auto-extract roll number if available
    const [local, domain] = clean.split('@');
    if (domain === COLLEGE_DOMAIN && /^[0-9]{2}[a-z]{2,5}[0-9]{2,4}$/i.test(local)) {
      if (!studentId) {
        setStudentId(local.toUpperCase());
      }
    }

    try {
      const check = await checkOriginalEmail(clean);
      setEmailCheckResult({ isOriginal: check.isOriginal, reason: check.reason });
    } catch {
      const isOriginal = clean.endsWith(`@${COLLEGE_DOMAIN}`);
      setEmailCheckResult({
        isOriginal,
        reason: isOriginal ? undefined : `Accepts only original @${COLLEGE_DOMAIN} college emails`
      });
    }
  };

  // Dispatch 6-digit verification code to email
  const handleSendCode = async () => {
    setStatusMsg(null);
    const clean = email.trim().toLowerCase();

    if (!clean) {
      setStatusMsg({ type: 'error', text: 'Please enter your college email address first.' });
      return;
    }

    setIsSendingCode(true);
    const res = await sendEmailVerificationCode(clean, name || undefined);
    setIsSendingCode(false);

    if (res.success) {
      setCodeSent(true);
      setStatusMsg({
        type: 'success',
        text: res.message || `6-digit verification code dispatched to ${clean}. Check your email or open the Campus Mail Delivery Viewer below!`
      });
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'Failed to dispatch verification code. Please make sure the email is an original @aaacet.ac.in address.'
      });
    }
  };

  // Verify the 6-digit code
  const handleVerifyCode = async () => {
    setStatusMsg(null);
    if (!verificationCode.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter the 6-digit code received on your email.' });
      return;
    }

    setIsVerifyingCode(true);
    const res = await verifyEmailCode(email.trim().toLowerCase(), verificationCode.trim());
    setIsVerifyingCode(false);

    if (res.success) {
      setIsEmailVerified(true);
      setStatusMsg({
        type: 'success',
        text: 'Email verified! Your original college email authenticity is confirmed.'
      });
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'Invalid or expired code. Please re-enter or click Send Code again.'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const trimmedEmail = email.trim().toLowerCase();

    // Feature 1: Validate original email
    if (!trimmedEmail.endsWith(`@${COLLEGE_DOMAIN}`)) {
      setStatusMsg({
        type: 'error',
        text: `Access Denied: Only original college email addresses ending with @${COLLEGE_DOMAIN} are accepted.`
      });
      return;
    }

    if (!isEmailVerified) {
      setStatusMsg({
        type: 'error',
        text: 'Please verify your original college email with the 6-digit code before completing registration.'
      });
      return;
    }

    if (!name || !studentId || !mobile || !password || !confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Please fill in all mandatory fields.' });
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
    const result = await registerStudent({
      name,
      studentId: studentId.toUpperCase(),
      email: trimmedEmail,
      mobile,
      password
    });
    setIsSubmitting(false);

    if (result.success) {
      setRegisteredEmail(trimmedEmail);
      setStatusMsg({
        type: 'success',
        text: `Welcome to QuickServe! Account created for ${trimmedEmail}. An official welcome message has been sent to your email.`
      });
      setTimeout(() => {
        onNavigate('/student/login');
      }, 5000);
    } else {
      setStatusMsg({ type: 'error', text: result.message || 'Registration failed. Email or Student ID may already exist.' });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="bg-slate-900 dark:bg-slate-800/90 p-6 text-white text-center relative border-b border-slate-800">
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              onClick={() => setShowInboxModal(true)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold px-2.5 border border-slate-700"
              title="Open Campus Mail Delivery Viewer"
            >
              <Inbox size={14} />
              <span className="hidden sm:inline">Mail Viewer</span>
            </button>
            <ThemeToggle size="sm" />
          </div>
          <span className="bg-slate-800 dark:bg-slate-700/80 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 border border-slate-700">
            <Building2 size={12} /> Student Account Setup
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">New Student Registration</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Original College Email Verification • AAA College of Engineering and Technology
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Original Email Requirement Notice */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="shrink-0 text-slate-900 dark:text-white" />
              <div>
                <span className="font-bold block text-slate-900 dark:text-white">Strict College Email Verification</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Accepts only original <strong>@aaacet.ac.in</strong> email addresses. Non-original domains are automatically rejected.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInboxModal(true)}
              className="shrink-0 text-[11px] font-bold text-slate-900 dark:text-white underline hover:opacity-80 flex items-center gap-1"
            >
              <Inbox size={13} /> View Mail
            </button>
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
              <div className="flex-1 leading-relaxed">
                <span>{statusMsg.text}</span>
                {statusMsg.type === 'success' && registeredEmail && (
                  <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowInboxModal(true)}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Sparkles size={12} /> Read Welcome Email Now
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('/student/login')}
                      className="px-3 py-1 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-bold transition"
                    >
                      Go to Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Original Email & Verification */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Mail size={15} /> 1. Original College Email Address *
                </label>
                {isEmailVerified ? (
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={11} /> Verified Original
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold">Must end with @aaacet.ac.in</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    disabled={isEmailVerified}
                    value={email}
                    onChange={e => handleEmailChange(e.target.value)}
                    placeholder="24urcs029@aaacet.ac.in"
                    className={`w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      isEmailVerified
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/30'
                        : emailCheckResult && !emailCheckResult.isOriginal
                        ? 'border-rose-300 dark:border-rose-700 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-slate-900 dark:focus:ring-slate-400'
                    }`}
                  />
                </div>

                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingCode || !email.trim().endsWith(`@${COLLEGE_DOMAIN}`)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isSendingCode ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>{codeSent ? 'Resend Code' : 'Send Code'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Email validation feedback */}
              {emailCheckResult && !emailCheckResult.isOriginal && (
                <div className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{emailCheckResult.reason || 'Only original @aaacet.ac.in emails are accepted.'}</span>
                </div>
              )}

              {/* Enter 6-digit Code */}
              {codeSent && !isEmailVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-2"
                >
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Enter 6-Digit Code Received on Email:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <KeyRound className="absolute left-3 top-2 text-slate-400" size={15} />
                      <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 849201"
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={isVerifyingCode || verificationCode.length < 6}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                    >
                      {isVerifyingCode ? (
                        <span>Checking...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Verify</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Code is valid for 15 minutes.</span>
                    <button
                      type="button"
                      onClick={() => setShowInboxModal(true)}
                      className="text-slate-900 dark:text-white font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Inbox size={12} /> Open Campus Mail Viewer
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Step 2: Student Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Student Roll / ID *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={e => setStudentId(e.target.value.toUpperCase())}
                    placeholder="e.g. 24URCS029"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isEmailVerified}
              className="w-full py-3.5 mt-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Registering Account & Sending Welcome Email...</span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account & Receive Welcome Email</span>
                </>
              )}
            </button>

            {!isEmailVerified && (
              <p className="text-center text-[11px] text-slate-400 font-medium">
                Verify your original college email above to activate account creation.
              </p>
            )}
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('/student/login')}
              className="text-slate-900 dark:text-white hover:underline font-extrabold ml-1"
            >
              Sign In to Student Account
            </button>
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
