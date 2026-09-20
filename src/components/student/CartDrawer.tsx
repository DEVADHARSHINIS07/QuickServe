import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Clock, AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (requestedDate: string, requestedTime: string) => void;
  onRequireAuth?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  onRequireAuth
}) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, orders, isCanteenOpen, isAuthenticated, currentRole } = useCanteen();

  // Selected Pickup Time
  const now = new Date();
  const defaultHour = String((now.getHours() + 1) % 24).padStart(2, '0');
  const [requestedDate, setRequestedDate] = useState<'Today' | 'Tomorrow'>('Today');
  const [requestedTime, setRequestedTime] = useState(`${defaultHour}:15`);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Check for smart time conflict
  const isBusySlot = orders.some(
    o => o.requestedReadyTime === requestedTime && o.orderStatus !== 'Completed' && o.orderStatus !== 'Rejected'
  );

  const handleCheckoutClick = () => {
    if (!isCanteenOpen) {
      alert('The canteen is currently closed.');
      return;
    }
    if (cart.length === 0) return;

    if (!isAuthenticated || currentRole !== 'student') {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        alert('Please login to your student account.');
      }
      return;
    }

    onProceedToCheckout(requestedDate, requestedTime);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-slate-900 w-full max-w-sm h-full flex flex-col border-l border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Cart</h3>
              <p className="text-xs text-slate-400">{cart.length} items</p>
            </div>

            <div className="flex items-center gap-1">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <ShoppingBag size={40} className="mx-auto mb-2 stroke-1 text-slate-300 dark:text-slate-700" />
                <p className="font-medium text-slate-600 dark:text-slate-300 text-xs">Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.foodId}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <span className="text-slate-400 text-[11px] block">
                      ₹{item.price}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded-lg shrink-0">
                    <button
                      onClick={() => updateCartQuantity(item.foodId, item.quantity - 1)}
                      className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-xs w-4 text-center text-slate-800 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.foodId, item.quantity + 1)}
                      className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Controls */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {/* Pickup Time Picker */}
              <div className="space-y-1.5 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                  <Clock size={13} /> Ready time
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg font-medium">
                    <button
                      type="button"
                      onClick={() => setRequestedDate('Today')}
                      className={`flex-1 py-1 rounded text-center transition ${requestedDate === 'Today' ? 'bg-white text-slate-900 font-bold dark:bg-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestedDate('Tomorrow')}
                      className={`flex-1 py-1 rounded text-center transition ${requestedDate === 'Tomorrow' ? 'bg-white text-slate-900 font-bold dark:bg-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
                    >
                      Tomorrow
                    </button>
                  </div>

                  <input
                    type="time"
                    value={requestedTime}
                    onChange={e => setRequestedTime(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 font-bold text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                  />
                </div>

                {isBusySlot && (
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <AlertTriangle size={12} className="shrink-0" />
                    <span>Canteen busy around {requestedTime}</span>
                  </div>
                )}
              </div>

              {/* Total & Checkout Button */}
              <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white pt-1">
                <span className="text-slate-500">Total</span>
                <span className="text-sm font-extrabold">₹{subtotal}</span>
              </div>

              <button
                onClick={handleCheckoutClick}
                disabled={!isCanteenOpen}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <span>Checkout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
