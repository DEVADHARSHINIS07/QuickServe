import React, { useState } from 'react';
import { User, Mail, Phone, Hash, Lock, CheckCircle2, AlertCircle, Send, KeyRound, ExternalLink } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

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
        text: `6-digit verification code sent to ${clean}. Please check your official College Gmail inbox.`
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
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Student registration • aaacet.ac.in
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
              {statusMsg.type === 'success' && registeredEmail && (
                <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                  <a
                    href="https://mail.google.com/mail/u/0/#inbox"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> Open Gmail
                  </a>
                  <button
                    type="button"
                    onClick={() => onNavigate('/student/login')}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-medium transition"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Verification Box */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                College Email (@aaacet.ac.in)
              </label>
              {isEmailVerified && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  disabled={isEmailVerified}
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  placeholder="rollnumber@aaacet.ac.in"
                  className={`w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none ${
                    isEmailVerified
                      ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500'
                  }`}
                />
              </div>

              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode || !email.trim().endsWith(`@${COLLEGE_DOMAIN}`)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-medium text-xs rounded-xl transition flex items-center justify-center gap-1 shrink-0"
                >
                  <Send size={12} />
                  <span>{codeSent ? 'Resend' : 'Send Code'}</span>
                </button>
              )}
            </div>

            {/* Email error message */}
            {emailCheckResult && !emailCheckResult.isOriginal && (
              <p className="text-[11px] text-rose-500 font-medium">
                {emailCheckResult.reason || 'Only @aaacet.ac.in emails are permitted.'}
              </p>
            )}

            {/* Enter Code */}
            {codeSent && !isEmailVerified && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block">
                  Verification Code:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-3 top-2 text-slate-400" size={15} />
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit code"
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isVerifyingCode || verificationCode.length < 6}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition"
                  >
                    {isVerifyingCode ? 'Checking...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Student ID / Roll No
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={e => setStudentId(e.target.value.toUpperCase())}
                  placeholder="24URCS029"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="Mobile number"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isEmailVerified}
            className="w-full py-2.5 mt-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/student/login')}
            className="text-slate-900 dark:text-white font-semibold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
