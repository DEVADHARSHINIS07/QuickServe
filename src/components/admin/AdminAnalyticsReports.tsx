import React from 'react';
import { TrendingUp, Flame, DollarSign, Award, PieChart, BarChart3 } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

export const AdminAnalyticsReports: React.FC = () => {
  const { foodItems, orders } = useCanteen();

  // Sort popular food items
  const popularFoods = [...foodItems]
    .sort((a, b) => (a.popularRank || 99) - (b.popularRank || 99))
    .slice(0, 5);

  const completedOrders = orders.filter(o => o.orderStatus === 'Completed');
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
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-amber-500" size={26} /> Sales & Popular Food Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Canteen sales summary, revenue distribution, and top ranked popular dishes
        </p>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-amber-500 to-orange-500 text-slate-900 rounded-3xl shadow-lg">
          <span className="text-xs uppercase font-bold text-slate-900/70 block">Total Collections</span>
          <span className="text-3xl font-black block mt-1">₹{totalRevenue}</span>
          <p className="text-[11px] font-semibold text-slate-900/80 mt-2">From {orders.length} total orders today</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-400 block">UPI Gateway Revenue</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">₹{upiRevenue}</span>
          <p className="text-[11px] text-slate-500 mt-2">{upiOrders.length} online UPI payments</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-400 block">Cash at Counter</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-1">₹{cashRevenue}</span>
          <p className="text-[11px] text-slate-500 mt-2">{cashOrders.length} cash orders</p>
        </div>
      </div>

      {/* Top 5 Popular Food Ranking */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="text-amber-500" size={22} /> 🏆 Top 5 Popular Canteen Foods
        </h3>

        <div className="space-y-2.5 sm:space-y-3">
          {popularFoods.map((food, idx) => (
            <div
              key={food.foodId}
              className="p-3 sm:p-4 bg-amber-50/50 dark:bg-slate-700/50 rounded-2xl border border-amber-200/50 dark:border-slate-600 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500 text-slate-900 font-extrabold flex items-center justify-center text-xs sm:text-sm shadow shrink-0">
                  #{idx + 1}
                </span>
                <img src={food.image} alt={food.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{food.name}</h4>
                  <span className="text-[11px] sm:text-xs text-slate-500 block truncate">{food.category} • ₹{food.price}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  ⭐ {food.rating || 4.8}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">High Demand</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
