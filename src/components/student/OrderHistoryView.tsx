import React, { useState } from 'react';
import { History, FileText, RefreshCw } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { Order } from '../../types';
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
    setActiveView('menu');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Title & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Order History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {studentOrders.length} previous orders
          </p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs overflow-x-auto">
          {['All', 'Completed', 'Accepted', 'Rejected', 'Refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg font-medium transition shrink-0 ${
                filterStatus === status
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <History size={40} className="mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-1" />
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No orders found</h4>
          <p className="text-xs text-slate-400 mt-0.5">No orders match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-slate-900 dark:text-white">
                    #{order.orderId}
                  </span>
                  <span className="text-slate-400">• {order.createdAt}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Queue {order.queueNumber}
                  </span>
                </div>

                <span
                  className={`font-medium px-2 py-0.5 rounded-full text-[11px] self-start sm:self-auto ${
                    order.orderStatus === 'Completed'
                      ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      : order.orderStatus === 'Rejected'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>{item.name} <span className="text-slate-400">×{item.quantity}</span></span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl flex flex-col justify-between text-xs space-y-1">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                    <span>Payment</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                    <span>Ready by</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{order.requestedReadyTime}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Total</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-50 dark:border-slate-800/60">
                <button
                  onClick={() => {
                    onSelectOrder(order.orderId);
                    setActiveView('tracking');
                  }}
                  className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Track Status →
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setReceiptOrder(order)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl transition flex items-center gap-1"
                  >
                    <FileText size={13} /> Receipt
                  </button>

                  <button
                    onClick={() => handleReorder(order)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs rounded-xl transition flex items-center gap-1"
                  >
                    <RefreshCw size={13} /> Reorder
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
};
