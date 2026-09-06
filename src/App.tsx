import React, { useState, useEffect } from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import { Header } from './components/common/Header';
import { MobileNav } from './components/common/MobileNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AuthModal } from './components/auth/AuthModal';

import { StudentLoginPage } from './components/auth/StudentLoginPage';
import { StudentRegisterPage } from './components/auth/StudentRegisterPage';
import { StudentForgotPasswordPage } from './components/auth/StudentForgotPasswordPage';

import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { AdminRegisterPage } from './components/auth/AdminRegisterPage';
import { AdminForgotPasswordPage } from './components/auth/AdminForgotPasswordPage';

import { StudentDashboard } from './components/student/StudentDashboard';
import { CartDrawer } from './components/student/CartDrawer';
import { CheckoutModal } from './components/student/CheckoutModal';
import { UPIPaymentModal } from './components/student/UPIPaymentModal';
import { OrderTrackingView } from './components/student/OrderTrackingView';
import { OrderHistoryView } from './components/student/OrderHistoryView';
import { FavoritesView } from './components/student/FavoritesView';

import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrderManagement } from './components/admin/AdminOrderManagement';
import { AdminFoodManagement } from './components/admin/AdminFoodManagement';
import { AdminScheduleSettings } from './components/admin/AdminScheduleSettings';
import { AdminAnalyticsReports } from './components/admin/AdminAnalyticsReports';
import { Order } from './types';

const MainApp: React.FC = () => {
  const { isAuthenticated, currentRole, switchRole } = useCanteen();

  // Route State Listener
  const getCurrentPathFromLocation = (): string => {
    const pathname = window.location.pathname;
    if (pathname && pathname !== '/') return pathname;
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return '/student/login'; // Default landing page on application open
  };

  const [currentPath, setCurrentPath] = useState<string>(getCurrentPathFromLocation);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [authBannerMsg, setAuthBannerMsg] = useState<string | null>(null);

  // Modals visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUPIOpen, setIsUPIOpen] = useState(false);

  // Selected pickup date/time passed to checkout/UPI
  const [checkoutDate, setCheckoutDate] = useState('Today');
  const [checkoutTime, setCheckoutTime] = useState('13:15');

  // Synchronize path changes with Browser Location & History
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getCurrentPathFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirect Logic for Protected Routes
  useEffect(() => {
    const isStudentProtectedRoute = [
      '/student/menu',
      '/student/cart',
      '/student/checkout',
      '/student/payment',
      '/student/orders',
      '/student/order-tracking',
      '/student/history',
      '/student/favorites'
    ].includes(currentPath);

    const isAdminProtectedRoute = [
      '/admin/dashboard',
      '/admin/orders',
      '/admin/food',
      '/admin/schedule',
      '/admin/analytics'
    ].includes(currentPath);

    if (isStudentProtectedRoute) {
      if (!isAuthenticated) {
        setAuthBannerMsg('Please login to your student account before placing or viewing orders.');
        navigateTo('/student/login');
      } else if (currentRole !== 'student') {
        navigateTo('/admin/dashboard');
      }
    } else if (isAdminProtectedRoute) {
      if (!isAuthenticated) {
        navigateTo('/admin/login');
      } else if (currentRole !== 'admin') {
        navigateTo('/student/menu');
      }
    }
  }, [currentPath, isAuthenticated, currentRole]);

  // View Mapping Helper for Header active tab
  const getActiveView = (): string => {
    if (currentPath.includes('/student/menu')) return 'menu';
    if (currentPath.includes('/student/order-tracking') || currentPath.includes('/student/orders')) return 'tracking';
    if (currentPath.includes('/student/history')) return 'history';
    if (currentPath.includes('/student/favorites')) return 'favorites';

    if (currentPath.includes('/admin/dashboard')) return 'admin_dashboard';
    if (currentPath.includes('/admin/orders')) return 'admin_orders';
    if (currentPath.includes('/admin/food')) return 'admin_food';
    if (currentPath.includes('/admin/schedule')) return 'admin_schedule';
    if (currentPath.includes('/admin/analytics')) return 'admin_analytics';

    return 'menu';
  };

  const handleProceedToCheckout = (date: string, time: string) => {
    if (!isAuthenticated || currentRole !== 'student') {
      setIsCartOpen(false);
      setAuthBannerMsg('Please login to your student account before placing an order.');
      navigateTo('/student/login');
      return;
    }
    setCheckoutDate(date);
    setCheckoutTime(time);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUPIPaymentSuccess = (createdOrder: Order) => {
    setSelectedOrderId(createdOrder.orderId);
    navigateTo('/student/order-tracking');
  };

  const handleCashOrderPlaced = () => {
    navigateTo('/student/order-tracking');
  };

  const handleRequireAuth = () => {
    setIsCartOpen(false);
    setAuthBannerMsg('Please sign in to your student account before placing an order.');
    navigateTo('/student/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-amber-50/30 to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-orange-400 selection:text-white pb-24 md:pb-8">
      {/* Top Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activeView={getActiveView()}
        onNavigate={navigateTo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 sm:pb-12">
        {/* Dedicated Auth Pages */}
        {currentPath === '/student/login' && (
          <StudentLoginPage
            onNavigate={navigateTo}
            messageBanner={authBannerMsg || undefined}
          />
        )}

        {currentPath === '/student/register' && (
          <StudentRegisterPage onNavigate={navigateTo} />
        )}

        {(currentPath === '/student/forgot-password' || currentPath === '/student/reset-password') && (
          <StudentForgotPasswordPage onNavigate={navigateTo} />
        )}

        {currentPath === '/admin/login' && (
          <AdminLoginPage onNavigate={navigateTo} />
        )}

        {currentPath === '/admin/register' && (
          <AdminRegisterPage onNavigate={navigateTo} />
        )}

        {(currentPath === '/admin/forgot-password' || currentPath === '/admin/reset-password') && (
          <AdminForgotPasswordPage onNavigate={navigateTo} />
        )}

        {/* Student View Routes */}
        {currentPath === '/student/menu' && (
          <StudentDashboard
            onOpenCart={() => setIsCartOpen(true)}
            onOpenNotifications={() => setIsNotifOpen(true)}
            onSelectOrder={(id) => setSelectedOrderId(id)}
            setActiveView={(view) => {
              if (view === 'tracking') navigateTo('/student/order-tracking');
              else if (view === 'history') navigateTo('/student/history');
              else if (view === 'favorites') navigateTo('/student/favorites');
              else navigateTo('/student/menu');
            }}
          />
        )}

        {(currentPath === '/student/order-tracking' || currentPath === '/student/orders') && (
          <OrderTrackingView
            selectedOrderId={selectedOrderId}
            setActiveView={(view) => {
              if (view === 'menu') navigateTo('/student/menu');
              else if (view === 'history') navigateTo('/student/history');
            }}
          />
        )}

        {currentPath === '/student/history' && (
          <OrderHistoryView
            onSelectOrder={(id) => setSelectedOrderId(id)}
            setActiveView={(view) => {
              if (view === 'tracking') navigateTo('/student/order-tracking');
              else if (view === 'menu') navigateTo('/student/menu');
            }}
          />
        )}

        {currentPath === '/student/favorites' && (
          <FavoritesView
            setActiveView={(view) => {
              if (view === 'menu') navigateTo('/student/menu');
            }}
          />
        )}

        {/* Admin View Routes */}
        {currentPath === '/admin/dashboard' && (
          <AdminDashboard
            setActiveView={(view) => {
              if (view === 'admin_orders') navigateTo('/admin/orders');
              else if (view === 'admin_food') navigateTo('/admin/food');
              else if (view === 'admin_schedule') navigateTo('/admin/schedule');
              else if (view === 'admin_analytics') navigateTo('/admin/analytics');
            }}
          />
        )}

        {currentPath === '/admin/orders' && (
          <AdminOrderManagement />
        )}

        {currentPath === '/admin/food' && (
          <AdminFoodManagement />
        )}

        {currentPath === '/admin/schedule' && (
          <AdminScheduleSettings />
        )}

        {currentPath === '/admin/analytics' && (
          <AdminAnalyticsReports />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeView={getActiveView()}
        onNavigate={navigateTo}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
        onRequireAuth={handleRequireAuth}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        requestedDate={checkoutDate}
        requestedTime={checkoutTime}
        onOpenUPI={() => setIsUPIOpen(true)}
        onOrderPlacedCash={handleCashOrderPlaced}
      />

      <UPIPaymentModal
        isOpen={isUPIOpen}
        onClose={() => setIsUPIOpen(false)}
        requestedDate={checkoutDate}
        requestedTime={checkoutTime}
        onPaymentSuccess={handleUPIPaymentSuccess}
      />

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onSelectOrder={(id) => {
          setSelectedOrderId(id);
          navigateTo('/student/order-tracking');
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <CanteenProvider>
      <MainApp />
    </CanteenProvider>
  );
}
