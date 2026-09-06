import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Hash, Clock, CreditCard, Banknote, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { PaymentMethod } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestedDate: string;
  requestedTime: string;
  onOpenUPI: () => void;
  onOrderPlacedCash: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  requestedDate,
  requestedTime,
  onOpenUPI,
  onOrderPlacedCash
}) => {
  const { currentUser, cart, placeOrder, canteenConfig } = useCanteen();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirmOrder = () => {
    if (paymentMethod === 'UPI') {
      // Open UPI Payment Modal for live QR scanning
      onOpenUPI();
      onClose();
    } else {
      // Cash payment workflow
      setIsSubmitting(true);
      setTimeout(() => {
        placeOrder('Cash', requestedDate, requestedTime);
        setIsSubmitting(false);
        onOrderPlacedCash();
        onClose();
      }, 600);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 my-auto"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
            <div>
              <span className="bg-amber-400 text-slate-900 font-extrabold text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                Step 2 of 2
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold mt-1">Order Checkout & Payment</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            {/* Student Details Card */}
            <div className="p-3.5 sm:p-4 bg-amber-50/70 dark:bg-slate-800 rounded-2xl border border-amber-200/80 dark:border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2">
                Student Contact Details
              </h4>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Name</span>
                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1 truncate">
                    <User size={13} className="text-amber-600 shrink-0" /> <span className="truncate">{currentUser.name}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Student ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white flex items-center gap-1 truncate">
                    <Hash size={13} className="text-amber-600 shrink-0" /> <span className="truncate">{currentUser.studentId}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mobile</span>
                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1 truncate">
                    <Phone size={13} className="text-amber-600 shrink-0" /> <span className="truncate">{currentUser.mobile}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Requested Ready Time</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                    <Clock size={13} className="shrink-0" /> <span className="truncate">{requestedDate}, {requestedTime}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items Summary */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Items</h4>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {cart.map((item) => (
                  <div key={item.foodId} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${item.vegType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                      <span className="text-slate-400 shrink-0">x{item.quantity}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white shrink-0 ml-2">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PAYMENT METHOD OPTIONS */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Select Payment Option</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: UPI */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition relative flex flex-col justify-between ${
                    paymentMethod === 'UPI'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-slate-900 dark:text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-amber-500 text-slate-900 rounded-xl">
                      <CreditCard size={18} />
                    </div>
                    {paymentMethod === 'UPI' && (
                      <CheckCircle2 size={18} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm">Pay using UPI</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">GPay, PhonePe, Paytm QR</p>
                    <span className="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Instant Receipt
                    </span>
                  </div>
                </button>

                {/* Option 2: Cash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition relative flex flex-col justify-between ${
                    paymentMethod === 'Cash'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-slate-900 dark:text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-slate-800 text-amber-400 rounded-xl">
                      <Banknote size={18} />
                    </div>
                    {paymentMethod === 'Cash' && (
                      <CheckCircle2 size={18} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm">Pay at Canteen</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Cash payment on pickup</p>
                    <span className="inline-block mt-2 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      Payment Pending
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Total Footer Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Amount to Pay</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">₹{totalAmount}</span>
              </div>

              <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/25 hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Creating Order...</span>
                ) : (
                  <>
                    <span>{paymentMethod === 'UPI' ? 'Proceed to Pay UPI' : 'Confirm Cash Order'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
