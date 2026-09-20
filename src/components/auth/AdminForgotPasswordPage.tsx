import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, User, Phone } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

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
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Sign In</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Canteen staff portal • aaacet.ac.in
          </p>
        </div>

        {/* Quick Credentials helper */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between gap-2 text-xs">
          <div className="text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-mono font-medium text-slate-900 dark:text-white">admin@aaacet.ac.in</span>
            <span className="mx-1.5">•</span>
            <span className="font-mono text-slate-500">Admin@123</span>
          </div>
          <button
            type="button"
            onClick={fillValidAdminCredentials}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-medium rounded-lg transition shrink-0"
          >
            Auto-fill
          </button>
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
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@aaacet.ac.in"
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
                onClick={() => onNavigate('/admin/forgot-password')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
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
            <ShieldCheck size={15} />
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Admin'}</span>
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Need a new staff account?{' '}
          <button
            onClick={() => onNavigate('/admin/register')}
            className="text-slate-900 dark:text-white font-semibold hover:underline"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminRegisterPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
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
    if (!trimmedEmail.endsWith('@aaacet.ac.in')) {
      setStatusMsg({
        type: 'error',
        text: 'Admin registration requires an official AAACET staff email ending with @aaacet.ac.in.'
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
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
        text: `Admin account registered for ${trimmedEmail}! You can now sign in.`
      });
      setTimeout(() => {
        onNavigate('/admin/login');
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: result.message || 'Registration failed.' });
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Admin Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Staff registration • aaacet.ac.in
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
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Staff Mobile
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="Mobile"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="staff@aaacet.ac.in"
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
            disabled={isSubmitting}
            className="w-full py-2.5 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? 'Registering...' : 'Register Admin Account'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an admin account?{' '}
          <button
            onClick={() => onNavigate('/admin/login')}
            className="text-slate-900 dark:text-white font-semibold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
