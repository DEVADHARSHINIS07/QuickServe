import React from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Flame,
  Users,
  ShieldCheck,
  Settings,
  ArrowRight,
  ListOrdered
} from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

interface AdminDashboardProps {
  setActiveView: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveView }) => {
  const { orders, foodItems, canteenConfig, updateCanteenConfig, isCanteenOpen } = useCanteen();

  // Calculate Metrics
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
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Top Banner & Canteen Toggle */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-900 font-extrabold text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full uppercase">
              Canteen Admin Control Center
            </span>
            <span className="text-xs text-slate-400">• Queue Monitor</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black mt-1">Canteen Overview & Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Operating Hours: {canteenConfig.openingTime} - {canteenConfig.closingTime} • {canteenConfig.collegeName}
          </p>
        </div>

        {/* Canteen Open/Close Master Switch */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 bg-slate-800 p-2.5 rounded-2xl border border-slate-700">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Canteen Status</span>
            <span className={`text-xs font-black ${isCanteenOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCanteenOpen ? '🟢 OPEN FOR ORDERS' : '🔴 CLOSED TO STUDENTS'}
            </span>
          </div>

          <button
            onClick={() => updateCanteenConfig({ isOpen: !canteenConfig.isOpen })}
            className={`px-3.5 sm:px-4 py-2 font-bold text-xs rounded-xl shadow transition shrink-0 ${
              canteenConfig.isOpen
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-emerald-500 text-slate-900 hover:bg-emerald-600'
            }`}
          >
            {canteenConfig.isOpen ? 'Close Canteen' : 'Open Canteen'}
          </button>
        </div>
      </div>

      {/* Urgent Priority Alert Banner */}
      {highPriorityOrders.length > 0 && (
        <div className="p-3.5 sm:p-4 bg-amber-500 text-slate-900 rounded-2xl shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
            <AlertTriangle size={18} className="animate-bounce shrink-0" />
            <span>⚠️ Priority Alert: {highPriorityOrders.length} urgent order(s) requested within 15 mins!</span>
          </div>
          <button
            onClick={() => setActiveView('admin_orders')}
            className="px-3.5 py-1.5 bg-slate-900 text-amber-400 font-bold text-xs rounded-xl hover:bg-slate-800 transition text-center"
          >
            View Queue →
          </button>
        </div>
      )}

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
          <span className="text-2xl font-black text-slate-900 dark:text-white block">{todayOrders.length}</span>
          <span className="text-[11px] text-slate-400 font-bold">Total Orders</span>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-center shadow-sm">
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">{pendingOrders.length}</span>
          <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold">Pending</span>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-center shadow-sm">
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{acceptedOrders.length}</span>
          <span className="text-[11px] text-blue-800 dark:text-blue-300 font-bold">Accepted</span>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 text-center shadow-sm">
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block">{preparingOrders.length}</span>
          <span className="text-[11px] text-purple-800 dark:text-purple-300 font-bold">Preparing</span>
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center shadow-sm">
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{readyOrders.length}</span>
          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">Ready</span>
        </div>

        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-center shadow-sm">
          <span className="text-2xl font-black text-teal-600 dark:text-teal-400 block">{completedOrders.length}</span>
          <span className="text-[11px] text-teal-800 dark:text-teal-300 font-bold">Completed</span>
        </div>

        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 text-center shadow-sm">
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block">{rejectedOrders.length}</span>
          <span className="text-[11px] text-rose-800 dark:text-rose-300 font-bold">Rejected</span>
        </div>

        <div className="p-4 bg-slate-900 text-amber-400 rounded-2xl border border-slate-800 text-center shadow-sm">
          <span className="text-xl font-black block">₹{todayRevenue}</span>
          <span className="text-[10px] text-slate-300 font-bold">Today Revenue</span>
        </div>
      </div>

      {/* QUICK ACTIONS & LOW STOCK WARNINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Order Queue Panel */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <ListOrdered className="text-amber-500" size={20} /> Active Order Queue
            </h3>
            <button
              onClick={() => setActiveView('admin_orders')}
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              Full Queue Manager →
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 4).map(ord => (
              <div key={ord.orderId} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">#{ord.orderId}</span>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      Queue {ord.queueNumber}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {ord.studentName} ({ord.studentId}) • Ready at {ord.requestedReadyTime}
                  </p>
                </div>

                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  ₹{ord.totalAmount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts & Inventory Teaser */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} /> Inventory & Stock Alerts
            </h3>
            <button
              onClick={() => setActiveView('admin_food')}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              Food Manager →
            </button>
          </div>

          {lowStockFoods.length === 0 ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
              ✅ All food items have healthy stock levels!
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockFoods.map(food => (
                <div key={food.foodId} className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-8 h-8 rounded-lg object-cover"
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{food.name}</span>
                      <span className="text-[10px] text-rose-600 font-bold">Only {food.stock} remaining in kitchen</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView('admin_food')}
                    className="px-2.5 py-1 bg-slate-900 text-white font-bold text-[10px] rounded-lg hover:bg-slate-800"
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
