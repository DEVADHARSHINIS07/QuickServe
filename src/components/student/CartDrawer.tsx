import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Clock, Calendar, AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react';
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

  // Check for smart time conflict (if > 3 orders scheduled near requested time)
  const isBusySlot = orders.some(
    o => o.requestedReadyTime === requestedTime && o.orderStatus !== 'Completed' && o.orderStatus !== 'Rejected'
  );

  const handleCheckoutClick = () => {
    if (!isCanteenOpen) {
      alert('The canteen is currently closed for new orders.');
      return;
    }
    if (cart.length === 0) return;

    if (!isAuthenticated || currentRole !== 'student') {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        alert('Please login to your student account before placing an order.');
      }
      return;
    }

    onProceedToCheckout(requestedDate, requestedTime);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md h-full flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50/60 dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-amber-500 text-slate-900 rounded-2xl font-black">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Your Food Cart</h3>
                <p className="text-xs text-slate-500">{cart.length} unique items</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:underline font-semibold flex items-center gap-1 p-1.5"
                >
                  <Trash2 size={14} /> Clear
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <ShoppingBag size={56} className="mx-auto mb-3 stroke-1 text-amber-300 dark:text-slate-700" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-base">Your cart is empty!</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Explore our appetizing menu and add delicious meals to enjoy.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.foodId}
                  layout
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.vegType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5 block">
                      ₹{item.price} each
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-1 rounded-xl shrink-0">
                    <button
                      onClick={() => updateCartQuantity(item.foodId, item.quantity - 1)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-200"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-xs w-4 text-center text-slate-800 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.foodId, item.quantity + 1)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-200"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer Checkout Controls */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3 sm:space-y-4 shadow-xl pb-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))]">
              {/* FOOD READY TIME PICKER */}
              <div className="p-3 sm:p-3.5 bg-amber-50/80 dark:bg-slate-800 rounded-2xl border border-amber-200/80 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock size={15} className="text-amber-600" /> When should food be ready?
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                    Schedule Order
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Date Selector */}
                  <div className="flex bg-white dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setRequestedDate('Today')}
                      className={`flex-1 py-1.5 rounded-lg text-center transition ${requestedDate === 'Today' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestedDate('Tomorrow')}
                      className={`flex-1 py-1.5 rounded-lg text-center transition ${requestedDate === 'Tomorrow' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      Tomorrow
                    </button>
                  </div>

                  {/* Time Picker */}
                  <input
                    type="time"
                    value={requestedTime}
                    onChange={e => setRequestedTime(e.target.value)}
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Smart Conflict Alert */}
                {isBusySlot && (
                  <div className="p-2 bg-amber-100 dark:bg-amber-950/80 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5 border border-amber-300">
                    <AlertTriangle size={14} className="shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      ⚠️ Canteen is busy around {requestedTime}. Consider picking a slot 15 mins later!
                    </span>
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Canteen Express Charge</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-amber-600 dark:text-amber-400">₹{subtotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                disabled={!isCanteenOpen}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-slate-900 font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
