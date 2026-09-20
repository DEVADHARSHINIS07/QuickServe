import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Utensils, ArrowRight, AlertCircle } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { FoodCard } from './FoodCard';
import { FoodSearchFilter } from './FoodSearchFilter';
import { Category, VegType } from '../../types';

interface StudentDashboardProps {
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onSelectOrder: (orderId: string) => void;
  setActiveView: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectOrder,
  setActiveView
}) => {
  const {
    foodItems,
    activeOrder,
    isCanteenOpen,
    canteenConfig
  } = useCanteen();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedVegFilter, setSelectedVegFilter] = useState<VegType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'fastest_prep' | 'rating'>('popular');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

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
      {/* Canteen Closed Notice if applicable */}
      {!isCanteenOpen && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <span>Canteen is currently closed ({canteenConfig.openingTime} – {canteenConfig.closingTime})</span>
          </div>
        </div>
      )}

      {/* Active Order Status (Minimal) */}
      {activeOrder && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-slate-900 text-white dark:bg-slate-800 rounded-2xl border border-slate-800 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-base shrink-0">
              #{activeOrder.queueNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Order #{activeOrder.orderId}</span>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeOrder.orderStatus}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Ready at {activeOrder.requestedReadyTime} • ₹{activeOrder.totalAmount}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onSelectOrder(activeOrder.orderId);
              setActiveView('tracking');
            }}
            className="px-3.5 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition shrink-0 flex items-center gap-1.5"
          >
            <span>Track</span>
            <ArrowRight size={13} />
          </button>
        </motion.div>
      )}

      {/* Menu Header & Search / Filters */}
      <div id="food-menu-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Menu
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredFood.length} {filteredFood.length === 1 ? 'item' : 'items'}
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
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <Utensils size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-1" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No items found</h4>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedVegFilter('all');
              setShowAvailableOnly(false);
            }}
            className="mt-3 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFood.map(item => (
            <FoodCard key={item.foodId} food={item} />
          ))}
        </div>
      )}
    </div>
  );
};
