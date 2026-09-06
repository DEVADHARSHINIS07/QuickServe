import React, { useState } from 'react';
import { ShoppingBag, Bell, User, Utensils, Shield, LogOut, CheckCircle, Clock, AlertCircle, LogIn, ChevronDown } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  activeView: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenNotifications,
  onOpenAuth,
  activeView,
  onNavigate
}) => {
  const {
    isAuthenticated,
    currentRole,
    currentUser,
    logoutUser,
    canteenConfig,
    cart,
    unreadNotificationCount,
    isCanteenOpen
  } = useCanteen();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logoutUser();
    setShowProfileMenu(false);
    if (currentRole === 'admin') {
      onNavigate('/admin/login');
    } else {
      onNavigate('/student/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Top Announcement Notice */}
      {canteenConfig.noticeMessage && (
        <div className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-semibold flex items-center justify-center gap-2 overflow-hidden shadow-inner">
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold">Campus Notice</span>
          <span className="truncate">{canteenConfig.noticeMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Canteen Status */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0"
          onClick={() => onNavigate(currentRole === 'admin' ? '/admin/dashboard' : '/student/menu')}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-400 text-white flex items-center justify-center shadow-md sm:shadow-lg shadow-orange-200/80 dark:shadow-none shrink-0 font-black">
            <Utensils size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-base md:text-lg leading-tight tracking-tight truncate max-w-[120px] xs:max-w-[150px] sm:max-w-xs md:max-w-none">
                {canteenConfig.canteenName}
              </h1>
              {/* Canteen Status Badge */}
              <span
                className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full shrink-0 ${
                  isCanteenOpen
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCanteenOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="hidden xs:inline">{isCanteenOpen ? 'OPEN' : 'CLOSED'}</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-medium hidden sm:block mt-0.5 truncate">
              {canteenConfig.collegeName} • {canteenConfig.openingTime} - {canteenConfig.closingTime}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-full text-xs font-medium">
          {currentRole === 'student' ? (
            <>
              <button
                onClick={() => onNavigate('/student/menu')}
                className={`px-4 py-1.5 rounded-full transition-all ${activeView === 'menu' || activeView === 'student_menu' ? 'bg-orange-400 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
              >
                Food Menu
              </button>
              <button
                onClick={() => onNavigate('/student/order-tracking')}
                className={`px-4 py-1.5 rounded-full transition-all ${activeView === 'tracking' || activeView === 'student_tracking' ? 'bg-orange-400 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
              >
                Live Tracking
              </button>
              <button
                onClick={() => onNavigate('/student/history')}
                className={`px-4 py-1.5 rounded-full transition-all ${activeView === 'history' || activeView === 'student_history' ? 'bg-orange-400 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
              >
                Order History
              </button>
              <button
                onClick={() => onNavigate('/student/favorites')}
                className={`px-4 py-1.5 rounded-full transition-all ${activeView === 'favorites' || activeView === 'student_favorites' ? 'bg-orange-400 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
              >
                Favorites
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('/admin/dashboard')}
                className={`px-4 py-1.5 rounded-full transition-all ${activeView === 'admin_dashboard' ? 'bg-slate-900 text-orange-400 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('/admin/orders')}
                className={`px-4 py-1.5 rounded-full transition-all ${activeView === 'admin_orders' ? 'bg-slate-900 text-orange-400 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
              >
                Order Queue
              </button>
              <button
                onClick={() => onNavigate('/admin/food')}
                className={`px-4 py-1.5 rounded-full transition-all ${activeView === 'admin_food' ? 'bg-slate-900 text-orange-400 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
              >
                Food Manager
              </button>
              <button
                onClick={() => onNavigate('/admin/schedule')}
                className={`px-4 py-1.5 rounded-full transition-all ${activeView === 'admin_schedule' ? 'bg-slate-900 text-orange-400 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
              >
                Schedule
              </button>
              <button
                onClick={() => onNavigate('/admin/analytics')}
                className={`px-4 py-1.5 rounded-full transition-all ${activeView === 'admin_analytics' ? 'bg-slate-900 text-orange-400 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
              >
                Analytics
              </button>
            </>
          )}
        </nav>

        {/* Right Actions & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="p-2 sm:p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-orange-500 transition relative shadow-xs"
            aria-label="Notifications"
          >
            <Bell size={16} className="sm:w-[18px] sm:h-[18px]" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-bold text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow ring-2 ring-white">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Cart Trigger (Student) */}
          {currentRole === 'student' && (
            <button
              onClick={onOpenCart}
              className="p-2 sm:p-2.5 rounded-full bg-orange-400 text-white hover:bg-orange-500 transition font-bold text-xs flex items-center gap-1.5 sm:gap-2 shadow-md shadow-orange-100 dark:shadow-none relative"
            >
              <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline font-bold">Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-slate-900 text-white font-extrabold text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* Auth State / Profile Dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1 sm:gap-2 p-1 sm:px-3 sm:py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-700 transition text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-100 dark:bg-slate-700 text-orange-600 dark:text-orange-300 flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-left leading-tight">
                  <span className="block font-bold truncate max-w-[90px]">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium truncate max-w-[90px]">{currentUser.studentId}</span>
                </span>
                <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-extrabold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                    <span className="inline-block mt-1 bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Role: {currentRole}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => onNavigate('/student/login')}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-orange-400 hover:bg-orange-500 text-white font-extrabold text-[11px] sm:text-xs rounded-full shadow transition flex items-center gap-1 sm:gap-1.5"
              >
                <LogIn size={13} className="sm:w-[15px] sm:h-[15px]" />
                <span>Login</span>
              </button>

              <button
                onClick={() => onNavigate('/admin/login')}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] sm:text-xs rounded-full shadow transition flex items-center gap-1 sm:gap-1.5"
              >
                <Shield size={13} className="text-amber-400 sm:w-[14px] sm:h-[14px]" />
                <span className="hidden xs:inline">Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
