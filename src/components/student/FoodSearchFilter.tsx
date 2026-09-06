import React from 'react';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { Category, VegType } from '../../types';

interface FoodSearchFilterProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (cat: Category | 'All') => void;
  selectedVegFilter: VegType | 'all';
  setSelectedVegFilter: (v: VegType | 'all') => void;
  sortBy: 'popular' | 'price_low' | 'price_high' | 'fastest_prep' | 'rating';
  setSortBy: (s: 'popular' | 'price_low' | 'price_high' | 'fastest_prep' | 'rating') => void;
  showAvailableOnly: boolean;
  setShowAvailableOnly: (b: boolean) => void;
}

const CATEGORIES: { name: Category | 'All'; icon: string }[] = [
  { name: 'All', icon: '🍽️' },
  { name: 'Fast Food', icon: '🍔' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Meals', icon: '🍛' },
  { name: 'Snacks', icon: '🥪' },
  { name: 'Drinks', icon: '🥤' },
  { name: 'Desserts', icon: '🍰' },
  { name: 'Beverages', icon: '☕' }
];

export const FoodSearchFilter: React.FC<FoodSearchFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedVegFilter,
  setSelectedVegFilter,
  sortBy,
  setSortBy,
  showAvailableOnly,
  setShowAvailableOnly
}) => {
  return (
    <div className="space-y-4">
      {/* Search Input & Controls Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search burgers, pizzas, thali, cold coffee..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-100 dark:bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {/* Veg / Non-Veg Toggle */}
          <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-2xl text-xs font-semibold shadow-sm shrink-0">
            <button
              onClick={() => setSelectedVegFilter('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition ${selectedVegFilter === 'all' ? 'bg-orange-400 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedVegFilter('veg')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${selectedVegFilter === 'veg' ? 'bg-emerald-500 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300" /> Veg
            </button>
            <button
              onClick={() => setSelectedVegFilter('non-veg')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${selectedVegFilter === 'non-veg' ? 'bg-rose-500 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-300" /> Non-Veg
            </button>
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm appearance-none pr-8 cursor-pointer"
            >
              <option value="popular">🔥 Popular</option>
              <option value="price_low">₹ Price: Low → High</option>
              <option value="price_high">₹ Price: High → Low</option>
              <option value="fastest_prep">⚡ Fast Prep</option>
              <option value="rating">⭐ Top Rated</option>
            </select>
            <ArrowUpDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Available Only Toggle */}
          <button
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              showAvailableOnly
                ? 'bg-orange-400 border-orange-400 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Check size={14} className={showAvailableOnly ? 'opacity-100' : 'opacity-0'} />
            <span className="whitespace-nowrap">Available</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition shrink-0 flex items-center gap-2 ${
              selectedCategory === cat.name
                ? 'bg-orange-400 text-white shadow-sm font-bold'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-300'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
