import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Check, Trash2, CheckCheck, Clock, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
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
        return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Bell size={18} /></div>;
      case 'order_accepted':
      case 'order_placed':
        return <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><ShoppingBag size={18} /></div>;
      case 'order_rejected':
        return <div className="p-2 bg-rose-100 text-rose-600 rounded-xl"><AlertTriangle size={18} /></div>;
      case 'refund':
        return <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><DollarSign size={18} /></div>;
      default:
        return <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Bell size={18} /></div>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md h-full flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {currentRole === 'admin' ? 'Canteen Alerts' : 'Notifications'}
                </h3>
                <p className="text-xs text-slate-500">{notifications.length} total messages</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={markAllNotificationsRead}
              className="text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
            <button
              onClick={clearNotifications}
              className="text-rose-500 hover:underline flex items-center gap-1 font-medium"
            >
              <Trash2 size={14} /> Clear all
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom,1rem))]">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell size={48} className="mx-auto mb-3 stroke-1 text-slate-300 dark:text-slate-700" />
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
                      ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      : 'bg-amber-50/60 dark:bg-slate-800 border-amber-200/80 dark:border-slate-700 shadow-sm text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {getNotifIcon(n.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                        {n.title}
                      </h4>
                      {!n.readStatus && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
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
                        <span className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
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
