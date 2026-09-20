import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Hash, Clock, CreditCard, Banknote, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  const { currentUser, cart, placeOrder } = useCanteen();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirmOrder = () => {
    if (paymentMethod === 'UPI') {
      onOpenUPI();
      onClose();
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        placeOrder('Cash', requestedDate, requestedTime);
        setIsSubmitting(false);
        onOrderPlacedCash();
        onClose();
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Checkout</h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {/* Student Details */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Name</span>
                <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1 truncate">
                  <User size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.name}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Roll No</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white flex items-center gap-1 truncate">
                  <Hash size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.studentId}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Mobile</span>
                <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1 truncate">
                  <Phone size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.mobile}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ready by</span>
                <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1 truncate">
                  <Clock size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{requestedDate}, {requestedTime}</span>
                </span>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Items</span>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {cart.map((item) => (
                  <div key={item.foodId} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.name} <span className="text-slate-400">×{item.quantity}</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-2">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Options */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Payment Method</span>
              <div className="grid grid-cols-2 gap-2">
                {/* UPI */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                    paymentMethod === 'UPI'
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <CreditCard size={16} />
                    {paymentMethod === 'UPI' && <CheckCircle2 size={16} className="text-slate-900 dark:text-white" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">UPI QR</h5>
                    <p className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</p>
                  </div>
                </button>

                {/* Cash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                    paymentMethod === 'Cash'
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Banknote size={16} />
                    {paymentMethod === 'Cash' && <CheckCircle2 size={16} className="text-slate-900 dark:text-white" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">Cash</h5>
                    <p className="text-[10px] text-slate-400">Pay at counter</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Total Footer Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block">Total</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">₹{totalAmount}</span>
              </div>

              <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs rounded-xl transition flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Placing...</span>
                ) : (
                  <>
                    <span>{paymentMethod === 'UPI' ? 'Pay with UPI' : 'Confirm Order'}</span>
                    <ArrowRight size={14} />
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
