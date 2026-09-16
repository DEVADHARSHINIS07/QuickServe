import React from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

export const AdminAnalyticsReports: React.FC = () => {
  const { foodItems, orders } = useCanteen();

  // Sort popular food items
  const popularFoods = [...foodItems]
    .sort((a, b) => (a.popularRank || 99) - (b.popularRank || 99))
    .slice(0, 5);

  const upiOrders = orders.filter(o => o.paymentMethod === 'UPI');
  const cashOrders = orders.filter(o => o.paymentMethod === 'Cash');

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const upiRevenue = upiOrders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const cashRevenue = cashOrders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="text-slate-900 dark:text-white" size={24} /> Sales & Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Canteen sales summary, revenue distribution, and top ranked popular dishes
        </p>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-3xl shadow-xs border border-slate-800 dark:border-slate-200">
          <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 block">Total Collections</span>
          <span className="text-3xl font-black block mt-1">₹{totalRevenue}</span>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2">From {orders.length} total orders today</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400 block">UPI Revenue</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">₹{upiRevenue}</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{upiOrders.length} online UPI payments</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400 block">Cash at Counter</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">₹{cashRevenue}</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{cashOrders.length} counter orders</p>
        </div>
      </div>

      {/* Top 5 Popular Food Ranking */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="text-slate-700 dark:text-slate-300" size={20} /> Top 5 Popular Dishes
        </h3>

        <div className="space-y-2.5 sm:space-y-3">
          {popularFoods.map((food, idx) => (
            <div
              key={food.foodId}
              className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold flex items-center justify-center text-xs sm:text-sm shrink-0">
                  #{idx + 1}
                </span>
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{food.name}</h4>
                  <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block truncate">{food.category} • ₹{food.price}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  ★ {food.rating || 4.8}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Popular Demand</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
