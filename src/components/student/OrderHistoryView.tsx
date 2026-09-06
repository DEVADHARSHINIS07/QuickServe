import React, { useState } from 'react';
import { motion } from 'motion/react';
import { History, FileText, RefreshCw, CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { Order, OrderStatus } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';

interface OrderHistoryViewProps {
  onSelectOrder: (orderId: string) => void;
  setActiveView: (view: string) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ onSelectOrder, setActiveView }) => {
  const { orders, currentUser, reorderItems } = useCanteen();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const studentOrders = orders.filter(o => o.studentId === currentUser.studentId);

  const filteredOrders = studentOrders.filter(o => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Completed') return o.orderStatus === 'Completed';
    if (filterStatus === 'Accepted') return o.orderStatus === 'Order Accepted' || o.orderStatus === 'Preparing';
    if (filterStatus === 'Rejected') return o.orderStatus === 'Rejected';
    if (filterStatus === 'Refunded') return o.paymentStatus === 'REFUNDED';
    return true;
  });

  const handleReorder = (order: Order) => {
    reorderItems(order);
    alert('Items added to cart! Proceeding to cart...');
    setActiveView('menu');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-10">
      {/* Title & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <History className="text-amber-500" size={26} /> Order History & Receipts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View all previous food orders, receipts, and easily reorder your favorite meals
          </p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold overflow-x-auto">
          {['All', 'Completed', 'Accepted', 'Rejected', 'Refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                filterStatus === status
                  ? 'bg-amber-500 text-slate-900 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <History size={48} className="mx-auto mb-3 text-slate-300 stroke-1" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">No order records found</h4>
          <p className="text-xs text-slate-400 mt-1">There are no orders matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.orderId}
              layout
              className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-amber-200 transition space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-xl">
                    #{order.orderId}
                  </span>
                  <span className="text-slate-400">• {order.createdAt}</span>
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    Queue {order.queueNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-extrabold px-2.5 py-0.5 rounded-full text-[11px] ${
                      order.orderStatus === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>{item.name} <strong className="text-slate-400">x{item.quantity}</strong></span>
                      <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl flex flex-col justify-between text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Payment Method</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{order.paymentMethod} ({order.paymentStatus})</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Ready Time Slot</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{order.requestedReadyTime}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-600">
                    <span>Total Amount</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    onSelectOrder(order.orderId);
                    setActiveView('tracking');
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Track Live Status →
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReceiptOrder(order)}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <FileText size={14} /> Receipt
                  </button>

                  <button
                    onClick={() => handleReorder(order)}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold text-xs rounded-xl shadow hover:opacity-95 transition flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} /> Reorder
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Digital Receipt Modal */}
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
    </div>
  );
};
