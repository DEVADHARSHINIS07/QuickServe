import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Utensils, Clock, ShoppingBag, ArrowRight, Heart, AlertCircle, CheckCircle, Flame } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { FoodCard } from './FoodCard';
import { FoodSearchFilter } from './FoodSearchFilter';
import { Category, VegType, FoodItem } from '../../types';

interface StudentDashboardProps {
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onSelectOrder: (orderId: string) => void;
  setActiveView: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenCart,
  onOpenNotifications,
  onSelectOrder,
  setActiveView
}) => {
  const {
    currentUser,
    foodItems,
    orders,
    activeOrder,
    favorites,
    isCanteenOpen,
    canteenConfig
  } = useCanteen();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedVegFilter, setSelectedVegFilter] = useState<VegType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'fastest_prep' | 'rating'>('popular');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const availableCount = foodItems.filter(f => f.isAvailable && f.stock > 0).length;

  // Filter food items
  const filteredFood = foodItems
    .filter(item => {
      // Search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        if (!matchName && !matchCat && !matchDesc) return false;
      }
      // Category
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      // Veg
      if (selectedVegFilter !== 'all' && item.vegType !== selectedVegFilter) return false;
      // Available
      if (showAvailableOnly && (!item.isAvailable || item.stock <= 0)) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'fastest_prep') return a.preparationTimeMinutes - b.preparationTimeMinutes;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      // popular
      return (a.popularRank || 99) - (b.popularRank || 99);
    });

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Welcome Banner & Metrics Cards */}
      <div className="space-y-3 sm:space-y-4">
        {/* Top Minimal Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-100 dark:border-blue-900/50 shadow-xs">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">Active Menu</span>
            <span className="text-xl sm:text-2xl font-extrabold text-blue-900 dark:text-blue-200">{availableCount} Items</span>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-xs">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">Order Status</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 truncate block">{activeOrder ? activeOrder.orderStatus : 'No Queue'}</span>
          </div>

          <div className="bg-orange-50/80 dark:bg-orange-950/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-orange-100 dark:border-orange-900/50 shadow-xs">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-0.5">Favorites</span>
            <span className="text-xl sm:text-2xl font-extrabold text-orange-900 dark:text-orange-200">{favorites.length} Dishes</span>
          </div>

          <div className="bg-purple-50/80 dark:bg-purple-950/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-purple-100 dark:border-purple-900/50 shadow-xs">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-0.5">Canteen Hours</span>
            <span className="text-xl sm:text-2xl font-extrabold text-purple-900 dark:text-purple-200">{canteenConfig.openingTime}</span>
          </div>
        </div>

        {/* Minimal Banner with Attractive Light Palette */}
        <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-8 bg-gradient-to-r from-orange-100/80 via-amber-50/70 to-orange-50 dark:from-slate-800 dark:to-slate-800 border border-orange-200/80 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/90 dark:bg-orange-950/50 border border-orange-200/80 dark:border-orange-900/50 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-orange-600 dark:text-orange-400 mb-2 sm:mb-3 shadow-xs">
              <Sparkles size={13} className="text-orange-500" /> QuickServe Canteen Portal
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Welcome back, {currentUser.name} 👋
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 sm:mt-1.5 font-medium leading-relaxed">
              Skip campus lunch lines. Order ahead, schedule your slot, and pick up hot food seamlessly.
            </p>

            {/* Canteen Closed Notice */}
            {!isCanteenOpen && (
              <div className="mt-2.5 sm:mt-3 p-2.5 sm:p-3 bg-rose-50 border border-rose-100 rounded-xl sm:rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>Canteen is closed right now ({canteenConfig.openingTime} - {canteenConfig.closingTime})</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              const menuElem = document.getElementById('food-menu-section');
              menuElem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-orange-400 text-white hover:bg-orange-500 font-bold text-xs rounded-full shadow-xs transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Utensils size={15} /> Explore Full Menu
          </button>
        </div>
      </div>

      {/* ACTIVE ORDER STATUS WIDGET */}
      {activeOrder && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white rounded-3xl shadow-lg shadow-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-extrabold text-xl shrink-0">
              {activeOrder.queueNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Active Order #{activeOrder.orderId}
                </span>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {activeOrder.orderStatus}
                </span>
              </div>
              <h4 className="text-base font-extrabold mt-1">
                {activeOrder.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
              </h4>
              <p className="text-xs text-emerald-100 mt-0.5">
                Ready target: {activeOrder.requestedReadyTime} • Total: ₹{activeOrder.totalAmount}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onSelectOrder(activeOrder.orderId);
              setActiveView('tracking');
            }}
            className="px-4 py-2 bg-white text-emerald-900 font-bold text-xs rounded-2xl shadow hover:bg-emerald-50 transition shrink-0 flex items-center gap-1.5"
          >
            <span>Track Order Status</span>
            <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      {/* SEARCH, FILTER & CATEGORIES */}
      <div id="food-menu-section" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="text-amber-500" size={22} /> Canteen Food Menu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filter by category, dietary preferences, or search items
            </p>
          </div>

          <span className="text-xs text-slate-400 font-semibold">
            Showing {filteredFood.length} items
          </span>
        </div>

        <FoodSearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedVegFilter={selectedVegFilter}
          setSelectedVegFilter={setSelectedVegFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showAvailableOnly={showAvailableOnly}
          setShowAvailableOnly={setShowAvailableOnly}
        />
      </div>

      {/* FOOD MENU GRID */}
      {filteredFood.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <Utensils size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600 stroke-1" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">No food items found</h4>
          <p className="text-xs text-slate-400 mt-1">Try resetting your search query or filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedVegFilter('all');
              setShowAvailableOnly(false);
            }}
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-900 font-bold text-xs rounded-xl hover:bg-amber-600 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFood.map(item => (
            <FoodCard key={item.foodId} food={item} />
          ))}
        </div>
      )}
    </div>
  );
};
