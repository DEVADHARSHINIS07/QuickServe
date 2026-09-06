import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChefHat,
  Bell,
  Check,
  DollarSign,
  AlertTriangle,
  Clock,
  User,
  Phone,
  FileText,
  X
} from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { Order, OrderStatus } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';

export const AdminOrderManagement: React.FC = () => {
  const {
    orders,
    acceptOrder,
    rejectOrder,
    updateOrderStatus
  } = useCanteen();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Rejection Reason Modal State
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReasonOption, setRejectReasonOption] = useState('Food item currently unavailable');
  const [customReason, setCustomReason] = useState('');

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Filter & Priority Sort
  const filteredOrders = orders.filter(order => {
    // Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = order.orderId.toLowerCase().includes(q);
      const matchName = order.studentName.toLowerCase().includes(q);
      const matchStuId = order.studentId.toLowerCase().includes(q);
      const matchFood = order.items.some(i => i.name.toLowerCase().includes(q));
      if (!matchId && !matchName && !matchStuId && !matchFood) return false;
    }

    // Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending' && order.orderStatus !== 'Waiting for Confirmation' && order.orderStatus !== 'Order Placed') return false;
      if (statusFilter === 'Accepted' && order.orderStatus !== 'Order Accepted') return false;
      if (statusFilter === 'Preparing' && order.orderStatus !== 'Preparing') return false;
      if (statusFilter === 'Ready' && order.orderStatus !== 'Ready for Pickup') return false;
      if (statusFilter === 'Completed' && order.orderStatus !== 'Completed') return false;
      if (statusFilter === 'Rejected' && order.orderStatus !== 'Rejected') return false;
    }

    // Priority Filter
    if (priorityFilter !== 'All' && order.priority !== priorityFilter) return false;

    return true;
  });

  const handleConfirmReject = () => {
    if (!rejectingOrder) return;
    const finalReason = rejectReasonOption === 'Other' ? (customReason || 'Food unavailable') : rejectReasonOption;
    rejectOrder(rejectingOrder.orderId, finalReason);
    setRejectingOrder(null);
    setCustomReason('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Title & Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Canteen Order Queue Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Accept, prepare, mark ready, or reject incoming student orders in real time
          </p>
        </div>

        {/* Priority Legend */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-bold overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> High (&lt;15m)
          </span>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full shrink-0">
            Medium (15-30m)
          </span>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
            Normal (&gt;30m)
          </span>
        </div>
      </div>

      {/* SEARCH BAR & FILTER ROW */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Student Name, STU1024, or Food Name..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-3 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Accepted">✅ Accepted</option>
            <option value="Preparing">👨‍🍳 Preparing</option>
            <option value="Ready">🔔 Ready for Pickup</option>
            <option value="Completed">🎉 Completed</option>
            <option value="Rejected">❌ Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-3 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="HIGH">🔴 High Priority</option>
            <option value="MEDIUM">🟠 Medium Priority</option>
            <option value="NORMAL">🟢 Normal Priority</option>
          </select>
        </div>
      </div>

      {/* ORDERS LIST */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <Clock size={48} className="mx-auto mb-3 text-slate-300 stroke-1" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">No orders in queue</h4>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isPending = order.orderStatus === 'Waiting for Confirmation' || order.orderStatus === 'Order Placed';
            const isAccepted = order.orderStatus === 'Order Accepted';
            const isPreparing = order.orderStatus === 'Preparing';
            const isReady = order.orderStatus === 'Ready for Pickup';

            return (
              <motion.div
                key={order.orderId}
                layout
                className={`p-5 rounded-3xl border shadow-sm transition space-y-4 bg-white dark:bg-slate-800 ${
                  order.priority === 'HIGH' && order.orderStatus !== 'Completed' && order.orderStatus !== 'Rejected'
                    ? 'border-rose-300 ring-2 ring-rose-100 dark:ring-rose-950'
                    : 'border-slate-100 dark:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-black text-sm shadow-md">
                      {order.queueNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white text-base">
                          Order #{order.orderId}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-700 font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                          {order.paymentMethod} ({order.paymentStatus})
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Student: <strong className="text-slate-800 dark:text-slate-200">{order.studentName}</strong> ({order.studentId}) • {order.studentMobile}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Clock size={14} className="text-amber-500" /> Target: <strong className="text-slate-900 dark:text-white">{order.requestedReadyTime}</strong>
                    </span>

                    <button
                      onClick={() => setReceiptOrder(order)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500"
                      title="View Receipt"
                    >
                      <FileText size={16} />
                    </button>
                  </div>
                </div>

                {/* Food Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400">Items Ordered</h5>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.vegType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                          <span className="text-slate-400 font-bold">x{item.quantity}</span>
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status & Refund details */}
                  <div className="p-3 bg-amber-50/50 dark:bg-slate-700/40 rounded-2xl flex flex-col justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Status</span>
                      <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{order.orderStatus}</span>
                      {order.rejectionReason && (
                        <p className="text-rose-600 text-[11px] font-semibold mt-1">Reason: {order.rejectionReason}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center font-black text-sm">
                      <span className="text-slate-500 font-normal">Total Amount</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* CANTEEN STAFF WORKFLOW ACTION BUTTONS */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Created at {order.createdAt}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reject Button (Always available for uncompleted orders) */}
                    {order.orderStatus !== 'Completed' && order.orderStatus !== 'Rejected' && (
                      <button
                        onClick={() => setRejectingOrder(order)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    )}

                    {/* Step 1: Accept Order */}
                    {isPending && (
                      <button
                        onClick={() => acceptOrder(order.orderId)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={16} /> Accept Order
                      </button>
                    )}

                    {/* Step 2: Start Preparing */}
                    {isAccepted && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'Preparing')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                      >
                        <ChefHat size={16} /> Start Preparing
                      </button>
                    )}

                    {/* Step 3: Mark as Ready */}
                    {isPreparing && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'Ready for Pickup')}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 animate-bounce"
                      >
                        <Bell size={16} /> Mark as Ready
                      </button>
                    )}

                    {/* Step 4: Mark Completed */}
                    {isReady && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'Completed')}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                      >
                        <Check size={16} /> Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* REJECTION REASON DIALOG MODAL */}
      <AnimatePresence>
        {rejectingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <XCircle size={20} className="text-rose-500" /> Reject Order #{rejectingOrder.orderId}
                </h3>
                <button onClick={() => setRejectingOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Please select the reason for rejection. This message will be sent directly to student <strong className="text-slate-800 dark:text-slate-200">{rejectingOrder.studentName}</strong>.
              </p>

              <div className="space-y-2 text-xs">
                {[
                  'Food item currently unavailable',
                  'Kitchen ingredients exhausted',
                  'Canteen closed unexpectedly',
                  'High queue backlog at peak hours',
                  'Other'
                ].map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <input
                      type="radio"
                      name="reject_reason"
                      checked={rejectReasonOption === reason}
                      onChange={() => setRejectReasonOption(reason)}
                      className="text-rose-500 focus:ring-rose-400"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{reason}</span>
                  </label>
                ))}

                {rejectReasonOption === 'Other' && (
                  <textarea
                    value={customReason}
                    onChange={e => setCustomReason(e.target.value)}
                    placeholder="Enter custom rejection reason..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500"
                    rows={2}
                  />
                )}
              </div>

              {rejectingOrder.paymentMethod === 'UPI' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2 border border-emerald-200">
                  <DollarSign size={16} />
                  <span>
                    💰 Automated Refund of ₹{rejectingOrder.totalAmount} will be triggered for UPI payment!
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setRejectingOrder(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow hover:bg-rose-700 transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Digital Receipt Modal */}
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
    </div>
  );
};
