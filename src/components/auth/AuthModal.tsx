import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, EyeOff, User, Lock, Mail, Phone, Hash, ShieldCheck, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { User as UserType } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'admin';
}

const COLLEGE_DOMAIN = 'aaacet.ac.in';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { loginUser } = useCanteen();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register state
  const [regName, setRegName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');

  // Admin state
  const [adminUser, setAdminUser] = useState('admin@aaacet.ac.in');
  const [adminPass, setAdminPass] = useState('admin123');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Domain Validator
  const validateCollegeEmail = (emailStr: string): boolean => {
    const trimmed = emailStr.trim().toLowerCase();
    return trimmed.endsWith(`@${COLLEGE_DOMAIN}`) && trimmed.split('@')[0].length > 0;
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !loginPass) {
      setMessage({ type: 'error', text: 'Please enter Student College Email or ID and Password.' });
      return;
    }

    const rawInput = loginId.trim().toLowerCase();
    let finalEmail = rawInput;
    let studentId = rawInput;

    if (rawInput.includes('@')) {
      if (!validateCollegeEmail(rawInput)) {
        setMessage({
          type: 'error',
          text: `Access Denied: Only AAA College email IDs ending with @${COLLEGE_DOMAIN} are allowed (e.g. rollnumber@${COLLEGE_DOMAIN}).`
        });
        return;
      }
      studentId = rawInput.split('@')[0].toUpperCase();
    } else {
      finalEmail = `${rawInput}@${COLLEGE_DOMAIN}`;
      studentId = rawInput.toUpperCase();
    }

    const studentUser: UserType = {
      userId: studentId,
      studentId: studentId,
      name: `Student (${studentId})`,
      email: finalEmail,
      mobile: '',
      role: 'student'
    };

    loginUser(studentUser);
    setMessage({ type: 'success', text: `College Mail Verified! Welcome back, ${studentUser.name}! 👋` });
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1000);
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regStudentId || !regEmail || !regMobile || !regPass) {
      setMessage({ type: 'error', text: 'Please fill in all mandatory fields.' });
      return;
    }

    if (!validateCollegeEmail(regEmail)) {
      setMessage({
        type: 'error',
        text: `Access Denied: Sign up requires an official AAA College email ID ending with @${COLLEGE_DOMAIN} (e.g. xxurxxyy@aaacet.ac.in).`
      });
      return;
    }

    if (regPass !== regConfirmPass) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    const newUser: UserType = {
      userId: regStudentId.toUpperCase(),
      studentId: regStudentId.toUpperCase(),
      name: regName,
      email: regEmail.trim().toLowerCase(),
      mobile: regMobile,
      role: 'student'
    };

    loginUser(newUser);
    setMessage({ type: 'success', text: `Account created for ${regEmail}! Welcome to QuickServe, ${regName}` });
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1200);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser || !adminPass) {
      setMessage({ type: 'error', text: 'Please enter Admin credentials.' });
      return;
    }

    if (adminUser.includes('@') && !validateCollegeEmail(adminUser)) {
      setMessage({
        type: 'error',
        text: `Admin login requires an authorized @${COLLEGE_DOMAIN} email address.`
      });
      return;
    }

    const admin: UserType = {
      userId: 'ADM001',
      studentId: 'ADM001',
      name: 'QuickServe Admin',
      email: adminUser.includes('@') ? adminUser : `${adminUser}@${COLLEGE_DOMAIN}`,
      mobile: '+91 91234 56789',
      role: 'admin'
    };

    loginUser(admin);
    setMessage({ type: 'success', text: 'Admin authenticated successfully!' });
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1000);
  };

  const handleForgotPassword = () => {
    alert(`Password reset link will be sent to your registered @${COLLEGE_DOMAIN} email.`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 my-auto"
        >
          {/* Top Header */}
          <div className="bg-slate-900 dark:bg-slate-950 p-4 sm:p-6 text-white relative shrink-0 border-b border-slate-800">
            <button
              onClick={onClose}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition"
            >
              <X size={18} />
            </button>
            <div className="text-center">
              <span className="bg-slate-800 text-slate-300 text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border border-slate-700">
                <Building2 size={12} /> QuickServe • AAACET
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                {activeTab === 'login' && 'Student Sign In'}
                {activeTab === 'register' && 'Student Registration'}
                {activeTab === 'admin' && 'Staff Admin Access'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">
                {activeTab === 'admin' ? 'Staff & Canteen Management Portal' : 'Exclusive portal for @aaacet.ac.in users'}
              </p>
            </div>

            {/* Selector Tabs */}
            <div className="flex bg-slate-800/80 p-1 rounded-2xl mt-4 sm:mt-5 text-xs font-medium border border-slate-700">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setMessage(null); }}
                className={`flex-1 py-2 rounded-xl transition ${activeTab === 'login' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setMessage(null); }}
                className={`flex-1 py-2 rounded-xl transition ${activeTab === 'register' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setMessage(null); }}
                className={`flex-1 py-2 rounded-xl transition ${activeTab === 'admin' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {/* Domain Security Notice Banner */}
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <Building2 size={18} className="shrink-0 text-slate-500" />
              <div>
                <span className="font-bold block">College Domain Mandatory</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Only <strong>@aaacet.ac.in</strong> email IDs are accepted.</span>
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-2xl text-xs font-medium mb-4 flex items-start gap-2 border ${
                  message.type === 'success'
                    ? 'bg-slate-50 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-700'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                )}
                <span className="leading-snug">{message.text}</span>
              </div>
            )}

            {/* STUDENT LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      College Email ID / Roll No
                    </label>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      @aaacet.ac.in
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={loginId}
                      onChange={e => setLoginId(e.target.value)}
                      placeholder="e.g. rollnumber@aaacet.ac.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPass}
                      onChange={e => setLoginPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
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
                    Remember Me
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-slate-700 dark:text-slate-300 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm rounded-2xl shadow-xs transition"
                >
                  Sign In to QuickServe
                </button>
              </form>
            )}

            {/* STUDENT REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleStudentRegister} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Student Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="e.g. Student Name"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Student ID / Roll</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-2.5 text-slate-400" size={15} />
                      <input
                        type="text"
                        required
                        value={regStudentId}
                        onChange={e => {
                          const val = e.target.value;
                          setRegStudentId(val);
                          if (!regEmail || regEmail.endsWith('@aaacet.ac.in')) {
                            setRegEmail(`${val.toLowerCase()}@aaacet.ac.in`);
                          }
                        }}
                        placeholder="e.g. 24URCS001"
                        className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Mobile No</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 text-slate-400" size={15} />
                      <input
                        type="tel"
                        required
                        value={regMobile}
                        onChange={e => setRegMobile(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">College Email ID</label>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">@aaacet.ac.in</span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="xxurxxyy@aaacet.ac.in"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={regPass}
                      onChange={e => setRegPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Confirm</label>
                    <input
                      type="password"
                      required
                      value={regConfirmPass}
                      onChange={e => setRegConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Create QuickServe Account
                </button>
              </form>
            )}

            {/* ADMIN LOGIN FORM */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <ShieldCheck size={20} className="shrink-0 text-slate-500" />
                  <span>Authorized canteen staff only. Access requiring @aaacet.ac.in credentials.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Staff College Email ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={adminUser}
                      onChange={e => setAdminUser(e.target.value)}
                      placeholder="admin@aaacet.ac.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
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
                      value={adminPass}
                      onChange={e => setAdminPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
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

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm rounded-2xl transition shadow-xs"
                >
                  Access Staff Portal
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
