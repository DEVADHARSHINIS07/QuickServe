import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  CreditCard
} from 'lucide-react';

import { useCanteen } from '../../context/CanteenContext';
import { Order } from '../../types';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestedDate: string;
  requestedTime: string;
  onPaymentSuccess: (order: Order) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  requestedDate,
  requestedTime,
  onPaymentSuccess
}) => {
  const {
    cart,
    placeOrder,
    currentUser
  } = useCanteen();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleRealPayment = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (!window.Razorpay) {
      alert('Razorpay failed to load. Please refresh the page.');
      return;
    }

    try {
      setIsProcessing(true);

      // ==========================================
      // STEP 1: CREATE RAZORPAY ORDER
      // ==========================================

      const createOrderResponse = await fetch(
        `http://localhost:8080/api/payment/create-order?amount=${totalAmount}`,
        {
          method: 'POST'
        }
      );

      if (!createOrderResponse.ok) {
        throw new Error('Unable to create Razorpay order');
      }

      const razorpayOrder = await createOrderResponse.json();

      console.log('Razorpay Order:', razorpayOrder);

      // ==========================================
      // STEP 2: OPEN RAZORPAY CHECKOUT
      // ==========================================

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: 'QuickServe Smart Canteen',

        description: 'Food Order Payment',

        order_id: razorpayOrder.id,

        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          contact: currentUser?.mobile || ''
        },

        notes: {
          studentId: currentUser?.studentId || '',
          requestedDate: requestedDate,
          requestedTime: requestedTime
        },

        theme: {
          color: '#f97316'
        },

        handler: async function (response: any) {

          console.log('Razorpay Payment Response:', response);

          // ==========================================
          // STEP 3: VERIFY PAYMENT IN BACKEND
          // ==========================================

          try {

            const params = new URLSearchParams({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            const verifyResponse = await fetch(
              `http://localhost:8080/api/payment/verify?${params.toString()}`,
              {
                method: 'POST'
              }
            );

            const verifyResult = await verifyResponse.text();

            console.log('Verification Result:', verifyResult);

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            // ==========================================
            // STEP 4: PAYMENT VERIFIED
            // CREATE QUICKSERVE ORDER
            // ==========================================

            const createdOrder = placeOrder(
              'UPI',
              requestedDate,
              requestedTime,
              response.razorpay_payment_id
            );

            alert(
              'Payment successful! Your order has been placed.'
            );

            onPaymentSuccess(createdOrder);

            onClose();

          } catch (error) {

            console.error('Verification Error:', error);

            alert(
              'Payment was received, but verification failed. Please contact the canteen administrator.'
            );
          } finally {
            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: function () {
            console.log('Razorpay checkout closed');

            setIsProcessing(false);
          }
        }
      };

      // ==========================================
      // STEP 5: OPEN RAZORPAY
      // ==========================================

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        'payment.failed',
        function (response: any) {

          console.error(
            'Payment Failed:',
            response.error
          );

          alert(
            `Payment failed: ${
              response.error?.description || 'Unknown error'
            }`
          );

          setIsProcessing(false);
        }
      );

      razorpay.open();

    } catch (error) {

      console.error('Payment Error:', error);

      alert(
        'Unable to start payment. Please try again.'
      );

      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 dark:border-slate-800"
        >

          {/* HEADER */}

          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">

            <span className="font-extrabold text-sm flex items-center gap-2">

              <ShieldCheck size={18} />

              Secure Payment

            </span>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1 hover:bg-black/20 rounded-lg transition"
            >
              <X size={18} />
            </button>

          </div>

          {/* BODY */}

          <div className="p-6 text-center space-y-5">

            {/* AMOUNT */}

            <div>

              <span className="text-xs text-slate-400 font-semibold uppercase block">
                Amount to Pay
              </span>

              <span className="text-4xl font-black text-amber-600 dark:text-amber-400">
                ₹{totalAmount}
              </span>

            </div>

            {/* PAYMENT INFO */}

            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">

              <div className="w-16 h-16 mx-auto mb-3 bg-amber-500 text-slate-900 rounded-2xl flex items-center justify-center">

                <CreditCard size={30} />

              </div>

              <h3 className="font-black text-slate-900 dark:text-white">
                Pay Securely with Razorpay
              </h3>

              <p className="text-xs text-slate-500 mt-2">
                UPI, GPay, PhonePe, Paytm, Cards,
                Net Banking and more.
              </p>

            </div>

            {/* PAYMENT BUTTON */}

            <button
              onClick={handleRealPayment}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >

              {isProcessing ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  <span>
                    Opening Secure Payment...
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />

                  <span>
                    Pay ₹{totalAmount}
                  </span>
                </>
              )}

            </button>

            <p className="text-[10px] text-slate-400">
              🔒 Secured by Razorpay
            </p>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};