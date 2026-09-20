import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Bell,
  Check,
  XCircle,
  DollarSign,
  QrCode,
  FileText,
  ArrowLeft,
  X
} from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { Order, OrderStatus } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';
import { generateQRSVGString, buildOrderVerificationPayload } from '../../utils/qrCode';

interface OrderTrackingViewProps {
  selectedOrderId?: string;
  setActiveView: (view: string) => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'Order Placed', label: 'Placed', icon: Clock },
  { status: 'Waiting for Confirmation', label: 'Waiting', icon: Clock },
  { status: 'Order Accepted', label: 'Accepted', icon: CheckCircle2 },
  { status: 'Preparing', label: 'Preparing', icon: ChefHat },
  { status: 'Ready for Pickup', label: 'Ready', icon: Bell },
  { status: 'Completed', label: 'Completed', icon: Check }
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ selectedOrderId, setActiveView }) => {
  const { orders, currentUser } = useCanteen();
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [showPickupQR, setShowPickupQR] = useState<boolean>(false);

  // Get active student's orders
  const studentOrders = orders.filter(o => o.studentId === currentUser.studentId);

  // Selected or latest order
  const currentOrder = studentOrders.find(o => o.orderId === selectedOrderId) || studentOrders[0] || null;

  const pickupQRSvg = useMemo(() => {
    if (!currentOrder) return '';
    const payload = buildOrderVerificationPayload(currentOrder);
    return generateQRSVGString(payload, 1);
  }, [currentOrder]);

  if (!currentOrder) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Clock size={40} className="mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-1" />
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No Active Orders</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          You haven't placed any orders yet.
        </p>
        <button
          onClick={() => setActiveView('menu')}
          className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs rounded-xl transition"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const isRejected = currentOrder.orderStatus === 'Rejected';
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Order Placed': return 0;
      case 'Waiting for Confirmation': return 1;
      case 'Order Accepted': return 2;
      case 'Preparing': return 3;
      case 'Ready for Pickup': return 4;
      case 'Completed': return 5;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentOrder.orderStatus);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('menu')}
          className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <ArrowLeft size={14} /> Back to Menu
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Order #{currentOrder.orderId}
        </span>
      </div>

      {/* Main Tracking Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Order Header & Queue Number */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl flex flex-col items-center justify-center font-bold shrink-0">
              <span className="text-[9px] uppercase font-medium text-slate-400 dark:text-slate-500">Queue</span>
              <span className="text-base leading-none">{currentOrder.queueNumber}</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  Order #{currentOrder.orderId}
                </span>
                <span className="text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  {currentOrder.orderStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ready by {currentOrder.requestedReadyTime} • {currentOrder.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPickupQR(true)}
              className="px-3 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium text-xs rounded-xl flex items-center gap-1.5"
            >
              <QrCode size={14} />
              <span>Token QR</span>
            </button>
            <button
              onClick={() => setReceiptOrder(currentOrder)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <FileText size={14} />
              <span>Receipt</span>
            </button>
          </div>
        </div>

        {/* Ready Notification Banner */}
        {currentOrder.orderStatus === 'Ready for Pickup' && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs">
            <Bell size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="font-bold block">Ready for pickup</span>
              <span>Show Queue #{currentOrder.queueNumber} at Counter 2.</span>
            </div>
          </div>
        )}

        {/* Rejected Alert Banner */}
        {isRejected && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-medium">
              <XCircle size={16} className="shrink-0" />
              <span>Order rejected: {currentOrder.rejectionReason || 'Food unavailable'}</span>
            </div>

            {currentOrder.refundInfo && (
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-[11px] flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Refunded: ₹{currentOrder.refundInfo.amount}
                </span>
                <span className="font-mono text-slate-400">ID: {currentOrder.refundInfo.refundTransactionId}</span>
              </div>
            )}
          </div>
        )}

        {/* Order Progress Timeline */}
        {!isRejected && (
          <div className="space-y-3">
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="relative pt-3 pb-2 min-w-[320px] sm:min-w-0">
                <div className="absolute top-7 left-6 right-6 h-0.5 bg-slate-100 dark:bg-slate-800 -z-0" />
                <div
                  className="absolute top-7 left-6 h-0.5 bg-slate-900 dark:bg-white transition-all duration-500 -z-0"
                  style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                />

                <div className="flex items-center justify-between relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const Icon = step.icon;

                    return (
                      <div key={step.status} className="flex flex-col items-center flex-1 min-w-[45px]">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-2 ring-slate-400'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        <span className={`text-[10px] mt-1 text-center font-medium ${isCurrent ? 'text-slate-900 dark:text-white font-bold' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Items & History Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Items Summary */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Items
            </h4>
            <div className="space-y-2">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-lg object-cover"
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-medium text-xs text-slate-900 dark:text-white">{item.name}</h5>
                      <span className="text-[11px] text-slate-400">{item.quantity} × ₹{item.price}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Total Paid ({currentOrder.paymentMethod})</span>
              <span className="text-slate-900 dark:text-white font-bold">₹{currentOrder.totalAmount}</span>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              History
            </h4>
            <div className="space-y-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              {currentOrder.historyTimeline.map((log, idx) => (
                <div key={idx} className="pl-3 relative text-xs">
                  <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-900 dark:bg-white" />
                  <span className="font-medium text-slate-900 dark:text-white block">
                    {log.status}
                  </span>
                  {log.note && <p className="text-[11px] text-slate-500">{log.note}</p>}
                  <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />

      {/* Pickup Verification QR Modal */}
      <AnimatePresence>
        {showPickupQR && currentOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-xs w-full p-5 text-center space-y-3 border border-slate-200 dark:border-slate-800 relative"
            >
              <button
                onClick={() => setShowPickupQR(false)}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={16} />
              </button>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Queue #{currentOrder.queueNumber}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Order #{currentOrder.orderId}
                </p>
              </div>

              {/* QR Frame */}
              <div className="w-48 h-48 bg-white p-2.5 rounded-xl mx-auto flex items-center justify-center border border-slate-200">
                {pickupQRSvg ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: pickupQRSvg }}
                  />
                ) : (
                  <QrCode size={40} className="text-slate-400" />
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Show at counter to pick up order.
              </p>

              <button
                onClick={() => setShowPickupQR(false)}
                className="w-full py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-medium text-xs transition"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
