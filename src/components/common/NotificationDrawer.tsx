import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Trash2, CheckCheck, Clock, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, onSelectOrder }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    currentRole
  } = useCanteen();

  if (!isOpen) return null;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'order_ready':
        return (
          <div className="p-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl">
            <Bell size={16} />
          </div>
        );
      case 'order_accepted':
      case 'order_placed':
        return (
          <div className="p-2 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-xl">
            <ShoppingBag size={16} />
          </div>
        );
      case 'order_rejected':
        return (
          <div className="p-2 bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-xl">
            <AlertTriangle size={16} />
          </div>
        );
      case 'refund':
        return (
          <div className="p-2 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-xl">
            <DollarSign size={16} />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-xl">
            <Bell size={16} />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {currentRole === 'admin' ? 'Canteen Alerts' : 'Notifications'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{notifications.length} total messages</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={markAllNotificationsRead}
              className="text-slate-700 dark:text-slate-300 font-semibold hover:underline flex items-center gap-1"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
            <button
              onClick={clearNotifications}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline flex items-center gap-1 font-medium"
            >
              <Trash2 size={14} /> Clear all
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom,1rem))]">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell size={44} className="mx-auto mb-3 stroke-1 text-slate-300 dark:text-slate-700" />
                <p className="font-medium text-sm text-slate-600 dark:text-slate-400">No new notifications</p>
                <p className="text-xs text-slate-400 mt-1">You are all caught up!</p>
              </div>
            ) : (
              notifications.map((n, idx) => (
                <motion.div
                  key={`${n.notificationId || 'notif'}_${idx}`}
                  layout
                  onClick={() => {
                    markNotificationRead(n.notificationId);
                    if (n.orderId && onSelectOrder) {
                      onSelectOrder(n.orderId);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex gap-3 ${
                    n.readStatus
                      ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-xs text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {getNotifIcon(n.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                        {n.title}
                      </h4>
                      {!n.readStatus && (
                        <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {n.createdAt}
                      </span>
                      {n.orderId && (
                        <span className="text-slate-900 dark:text-white font-semibold hover:underline">
                          View Order #{n.orderId.slice(-4)} →
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
