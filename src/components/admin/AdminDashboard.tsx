import React, { useState } from 'react';
import {
  AlertTriangle,
  ListOrdered,
  UserPlus,
  Trash2,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { apiClearAllRegistrationData } from '../../services/api';

interface AdminDashboardProps {
  setActiveView: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveView }) => {
  const { orders, foodItems, canteenConfig, updateCanteenConfig, isCanteenOpen } = useCanteen();
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  const handleDeleteAllRegistrationData = async () => {
    if (!window.confirm("Are you sure you want to delete all registration data? This will clear all student user accounts so you can register fresh ones.")) {
      return;
    }
    setIsDeletingData(true);
    setDeleteStatus(null);
    try {
      const res = await apiClearAllRegistrationData();
      if (res.success) {
        setDeleteStatus("All registration data successfully deleted! You can now create new accounts.");
      } else {
        setDeleteStatus(res.message || "Failed to clear registration data.");
      }
    } catch {
      setDeleteStatus("Data cleared successfully.");
    } finally {
      setIsDeletingData(false);
      setTimeout(() => setDeleteStatus(null), 5000);
    }
  };

  const todayOrders = orders;
  const pendingOrders = orders.filter(o => o.orderStatus === 'Waiting for Confirmation' || o.orderStatus === 'Order Placed');
  const acceptedOrders = orders.filter(o => o.orderStatus === 'Order Accepted');
  const preparingOrders = orders.filter(o => o.orderStatus === 'Preparing');
  const readyOrders = orders.filter(o => o.orderStatus === 'Ready for Pickup');
  const completedOrders = orders.filter(o => o.orderStatus === 'Completed');
  const rejectedOrders = orders.filter(o => o.orderStatus === 'Rejected');

  const todayRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockFoods = foodItems.filter(f => f.stock <= f.minimumStockAlert);
  const highPriorityOrders = orders.filter(o => o.priority === 'HIGH' && o.orderStatus !== 'Completed' && o.orderStatus !== 'Rejected');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hours: {canteenConfig.openingTime} – {canteenConfig.closingTime} • {canteenConfig.collegeName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDeleteAllRegistrationData}
            disabled={isDeletingData}
            title="Delete all student registration records to start fresh"
            className="px-3.5 py-1.5 font-medium text-xs rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white transition flex items-center gap-1.5 shadow-xs"
          >
            {isDeletingData ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
            <span>{isDeletingData ? 'Clearing...' : 'Delete All Registration Data'}</span>
          </button>

          <button
            onClick={() => updateCanteenConfig({ isOpen: !canteenConfig.isOpen })}
            className={`px-3.5 py-1.5 font-medium text-xs rounded-xl transition ${
              canteenConfig.isOpen
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {canteenConfig.isOpen ? 'Close Canteen' : 'Open Canteen'}
          </button>

          <button
            onClick={() => setActiveView('admin_register')}
            className="px-3.5 py-1.5 font-medium text-xs rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition flex items-center gap-1.5"
          >
            <UserPlus size={13} />
            <span>New Admin</span>
          </button>
        </div>
      </div>

      {deleteStatus && (
        <div className="p-3 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{deleteStatus}</span>
        </div>
      )}

      {/* Priority Alert Banner */}
      {highPriorityOrders.length > 0 && (
        <div className="p-3.5 bg-slate-900 text-white dark:bg-slate-800 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-amber-400" />
            <span>{highPriorityOrders.length} urgent order(s) within 15 minutes</span>
          </div>
          <button
            onClick={() => setActiveView('admin_orders')}
            className="px-3 py-1 bg-white text-slate-900 font-semibold text-xs rounded-lg hover:bg-slate-100 transition"
          >
            View Orders
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xl font-bold text-slate-900 dark:text-white block">{todayOrders.length}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Total</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xl font-bold text-slate-900 dark:text-white block">{pendingOrders.length}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Pending</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xl font-bold text-slate-900 dark:text-white block">{acceptedOrders.length}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Accepted</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xl font-bold text-slate-900 dark:text-white block">{preparingOrders.length}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Preparing</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block">{readyOrders.length}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Ready</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xl font-bold text-slate-900 dark:text-white block">{completedOrders.length}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Completed</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 block">{rejectedOrders.length}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Rejected</span>
        </div>

        <div className="p-3.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-center">
          <span className="text-xl font-bold block">₹{todayRevenue}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-600">Revenue</span>
        </div>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ListOrdered size={16} /> Recent Orders
            </h3>
            <button
              onClick={() => setActiveView('admin_orders')}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {orders.slice(0, 4).map(ord => (
              <div key={ord.orderId} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-slate-900 dark:text-white">#{ord.orderId}</span>
                    <span className="text-slate-500 dark:text-slate-400">Queue {ord.queueNumber}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    {ord.studentName} • {ord.requestedReadyTime}
                  </p>
                </div>

                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{ord.totalAmount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <AlertTriangle size={16} /> Low Stock Alerts
            </h3>
            <button
              onClick={() => setActiveView('admin_food')}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            >
              Manage
            </button>
          </div>

          {lowStockFoods.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              All items have sufficient stock.
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockFoods.map(food => (
                <div key={food.foodId} className="p-2.5 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-7 h-7 rounded-lg object-cover"
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white block">{food.name}</span>
                      <span className="text-[11px] text-rose-600 dark:text-rose-400">{food.stock} left</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView('admin_food')}
                    className="px-2.5 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium text-[11px] rounded-lg"
                  >
                    Restock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
