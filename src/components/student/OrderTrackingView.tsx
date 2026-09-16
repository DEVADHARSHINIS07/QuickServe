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
  AlertCircle,
  Building,
  RefreshCw,
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
  { status: 'Order Placed', label: 'Order Placed', icon: Clock },
  { status: 'Waiting for Confirmation', label: 'Waiting Canteen', icon: Clock },
  { status: 'Order Accepted', label: 'Accepted', icon: CheckCircle2 },
  { status: 'Preparing', label: 'Preparing', icon: ChefHat },
  { status: 'Ready for Pickup', label: 'Ready for Pickup', icon: Bell },
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
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
        <Clock size={56} className="mx-auto mb-3 text-slate-300 stroke-1" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">No Active Orders</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          You have not placed any orders yet. Head over to the menu to order delicious meals.
        </p>
        <button
          onClick={() => setActiveView('menu')}
          className="mt-5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-xs transition"
        >
          Browse Food Menu
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-10">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('menu')}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft size={16} /> Back to Menu
        </button>

        <span className="text-xs font-bold text-slate-400">
          Showing Order #{currentOrder.orderId}
        </span>
      </div>

      {/* Main Tracking Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-xs space-y-6 sm:space-y-8">
        {/* Order Header & Queue Number */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center font-black shadow-xs shrink-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Queue</span>
              <span className="text-lg sm:text-xl leading-none">{currentOrder.queueNumber}</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                  Order #{currentOrder.orderId}
                </span>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                  {currentOrder.orderStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ready Time: <span className="font-bold text-slate-900 dark:text-white">{currentOrder.requestedReadyTime}</span> • {currentOrder.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowPickupQR(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <QrCode size={15} />
              <span>Pickup QR</span>
            </button>
            <button
              onClick={() => setReceiptOrder(currentOrder)}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText size={15} />
              <span>Receipt</span>
            </button>
          </div>
        </div>

        {/* FOOD READY PICKUP NOTIFICATION BANNER */}
        {currentOrder.orderStatus === 'Ready for Pickup' && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="p-4 sm:p-5 bg-slate-900 text-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-md border border-slate-800 dark:border-slate-700 flex items-center justify-between gap-3 sm:gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs">
                <Bell size={22} className="animate-bounce" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg leading-tight">Food ready for pickup</h3>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">
                  Please show Queue Number <strong className="text-slate-900 bg-white px-1.5 py-0.5 rounded font-mono">{currentOrder.queueNumber}</strong> at Canteen Counter 2.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* REJECTED / REFUND ALERT BANNER */}
        {isRejected && (
          <div className="p-4 sm:p-5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl sm:rounded-3xl space-y-3">
            <div className="flex items-center gap-3 text-rose-700 dark:text-rose-300">
              <XCircle size={24} className="shrink-0" />
              <div>
                <h4 className="font-bold text-sm sm:text-base">Order Rejected by Canteen Staff</h4>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                  Reason: <strong>{currentOrder.rejectionReason || 'Food unavailable'}</strong>
                </p>
              </div>
            </div>

            {/* Refund Info */}
            {currentOrder.refundInfo && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <DollarSign size={18} />
                  <span>
                    Refund ({currentOrder.refundInfo.status}): ₹{currentOrder.refundInfo.amount}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">
                  Ref ID: {currentOrder.refundInfo.refundTransactionId}
                </span>
              </div>
            )}
          </div>
        )}

        {/* VISUAL ORDER PROGRESS TIMELINE */}
        {!isRejected && (
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Real-time Order Progress
            </h4>

            {/* Progress Bar Container with Horizontal Scroll support on small screens */}
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="relative pt-4 pb-2 min-w-[340px] sm:min-w-0">
                {/* Connector Line */}
                <div className="absolute top-8 left-6 right-6 h-1 bg-slate-100 dark:bg-slate-700 -z-0" />
                <div
                  className="absolute top-8 left-6 h-1 bg-slate-900 dark:bg-white transition-all duration-700 -z-0"
                  style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                />

                {/* Steps Icons Row */}
                <div className="flex items-center justify-between relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const Icon = step.icon;

                    return (
                      <div key={step.status} className="flex flex-col items-center flex-1 min-w-[50px]">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-110 shadow-xs ring-2 ring-slate-400'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-bold mt-1.5 sm:mt-2 text-center max-w-[56px] leading-tight ${isCurrent ? 'text-slate-900 dark:text-white' : isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
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

        {/* ORDER ITEMS & HISTORY TIMELINE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          {/* Items Summary */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Ordered Items
            </h4>
            <div className="space-y-2.5">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-cover"
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</h5>
                      <span className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{item.price}</span>
                    </div>
                  </div>
                  <span className="font-black text-xs text-slate-900 dark:text-white">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              <span>Total Paid ({currentOrder.paymentMethod})</span>
              <span className="text-slate-900 dark:text-white font-black text-sm">₹{currentOrder.totalAmount}</span>
            </div>
          </div>

          {/* Activity Log Audit */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Status History Timeline
            </h4>
            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
              {currentOrder.historyTimeline.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 relative pl-6">
                  <span className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-800" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {log.status}
                    </span>
                    {log.note && <p className="text-[11px] text-slate-500 mt-0.5">{log.note}</p>}
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />

      {/* Counter Pickup Verification QR Modal */}
      <AnimatePresence>
        {showPickupQR && currentOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 relative"
            >
              <button
                onClick={() => setShowPickupQR(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Canteen Counter Pickup Token
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Queue #{currentOrder.queueNumber}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Order #{currentOrder.orderId}
                </p>
              </div>

              {/* Scannable Original QR Frame */}
              <div className="w-56 h-56 bg-white p-3.5 rounded-2xl shadow-sm mx-auto flex items-center justify-center border-2 border-slate-900/10">
                {pickupQRSvg ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: pickupQRSvg }}
                  />
                ) : (
                  <QrCode size={48} className="text-slate-400" />
                )}
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-800 dark:text-white">
                  {currentOrder.studentName} ({currentOrder.studentId})
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Show this original QR code to canteen counter staff to claim your food items.
                </p>
              </div>

              <button
                onClick={() => setShowPickupQR(false)}
                className="w-full py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold text-xs hover:opacity-90 transition cursor-pointer"
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
