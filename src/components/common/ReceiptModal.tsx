import React, { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download, CheckCircle2, AlertCircle, Building, Clock, User, QrCode } from 'lucide-react';
import { Order } from '../../types';
import { useCanteen } from '../../context/CanteenContext';
import { generateQRSVGString, buildOrderVerificationPayload } from '../../utils/qrCode';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { canteenConfig } = useCanteen();
  const printRef = useRef<HTMLDivElement>(null);

  const qrSvg = useMemo(() => {
    if (!order) return '';
    const payload = buildOrderVerificationPayload(order);
    return generateQRSVGString(payload, 1);
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `========== ${canteenConfig.canteenName.toUpperCase()} ==========
${canteenConfig.collegeName}
--------------------------------------------------
RECEIPT / DIGITAL INVOICE
Order ID: ${order.orderId}
Queue No: ${order.queueNumber}
Date: ${order.createdAt}
Student Name: ${order.studentName} (${order.studentId})
Mobile: ${order.studentMobile}
--------------------------------------------------
ITEMS:
${order.items.map(i => `${i.name} x ${i.quantity} = ₹${i.price * i.quantity}`).join('\n')}
--------------------------------------------------
SUBTOTAL: ₹${order.subtotal}
TOTAL PAID: ₹${order.totalAmount}
PAYMENT METHOD: ${order.paymentMethod}
PAYMENT STATUS: ${order.paymentStatus}
REQUESTED READY TIME: ${order.requestedReadyTime}
ORDER STATUS: ${order.orderStatus}
--------------------------------------------------
Thank you for dining at Campus Smart Canteen!`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Receipt_${order.orderId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 my-auto"
        >
          {/* Header Action Bar */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-3.5 sm:p-4 flex items-center justify-between no-print shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="bg-white text-slate-900 font-bold px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs">
                Receipt
              </span>
              <span className="text-[11px] sm:text-xs text-slate-300 truncate max-w-[90px] sm:max-w-none">#{order.orderId}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrint}
                className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition text-xs flex items-center gap-1"
                title="Print Receipt"
              >
                <Printer size={15} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 sm:p-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-lg transition text-xs flex items-center gap-1"
                title="Download Receipt"
              >
                <Download size={15} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Receipt Body */}
          <div ref={printRef} className="p-4 sm:p-8 bg-slate-50/50 dark:bg-slate-900/60 print-content overflow-y-auto flex-1">
            {/* Canteen Branding Header */}
            <div className="text-center pb-6 border-b border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center mx-auto mb-2 border border-slate-200 dark:border-slate-700">
                <Building size={22} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{canteenConfig.canteenName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{canteenConfig.collegeName}</p>

              <div className="mt-4 inline-flex items-center gap-4 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700">
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Queue Number</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">{order.queueNumber}</span>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Ready Target</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Clock size={13} className="text-slate-500" /> {order.requestedReadyTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Student & Order Details */}
            <div className="py-4 border-b border-dashed border-slate-300 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><User size={13} /> Student Name:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{order.studentName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Student ID:</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{order.studentId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Date & Time:</span>
                <span>{order.createdAt}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Payment Method:</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  {order.paymentMethod} ({order.paymentStatus})
                </span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Ref / Txn ID:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">{order.transactionId}</span>
                </div>
              )}
            </div>

            {/* Food Items Table */}
            <div className="py-4 border-b border-dashed border-slate-300 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Items</h4>
              <div className="space-y-2.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.vegType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="text-slate-400 font-semibold">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Canteen Service Tax</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">₹0 (Free)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount</span>
                <span className="text-slate-900 dark:text-white font-black">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Status Stamp Badge */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                {order.orderStatus === 'Rejected' ? (
                  <AlertCircle size={20} className="text-rose-500" />
                ) : (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Status: {order.orderStatus}
                  </div>
                  {order.rejectionReason && (
                    <div className="text-[11px] text-rose-500">Reason: {order.rejectionReason}</div>
                  )}
                  {order.refundInfo && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      Refund ({order.refundInfo.status}): ₹{order.refundInfo.amount}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs mx-auto flex items-center justify-center overflow-hidden">
                  {qrSvg ? (
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                      title={`Verification QR for Order #${order.orderId}`}
                    />
                  ) : (
                    <QrCode size={36} className="text-slate-700 dark:text-slate-300 mx-auto" />
                  )}
                </div>
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block mt-1">Scan to Verify</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center no-print">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs transition"
            >
              Close Receipt
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
