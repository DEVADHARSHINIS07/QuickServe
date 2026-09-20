import React from 'react';
import { Search, ArrowUpDown, Check } from 'lucide-react';
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

const CATEGORIES: (Category | 'All')[] = [
  'All',
  'Meals',
  'Fast Food',
  'Snacks',
  'Pizza',
  'Drinks',
  'Beverages',
  'Desserts'
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
    <div className="space-y-3">
      {/* Search Input & Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs w-5 h-5 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Veg / Non-Veg Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs shrink-0">
            <button
              onClick={() => setSelectedVegFilter('all')}
              className={`px-3 py-1 rounded-lg transition text-xs font-medium ${
                selectedVegFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedVegFilter('veg')}
              className={`px-3 py-1 rounded-lg transition text-xs font-medium flex items-center gap-1.5 ${
                selectedVegFilter === 'veg'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Veg
            </button>
            <button
              onClick={() => setSelectedVegFilter('non-veg')}
              className={`px-3 py-1 rounded-lg transition text-xs font-medium flex items-center gap-1.5 ${
                selectedVegFilter === 'non-veg'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Non-Veg
            </button>
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 appearance-none pr-7 cursor-pointer"
            >
              <option value="popular">Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="fastest_prep">Fastest</option>
              <option value="rating">Top Rated</option>
            </select>
            <ArrowUpDown size={12} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Available Only Toggle */}
          <button
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium transition flex items-center gap-1 shrink-0 ${
              showAvailableOnly
                ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 font-semibold'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Check size={13} className={showAvailableOnly ? 'opacity-100' : 'opacity-0'} />
            <span>In Stock</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition shrink-0 ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
