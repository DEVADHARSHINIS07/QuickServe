import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Plus, Clock, Star, AlertCircle, Info, Sparkles } from 'lucide-react';
import { FoodItem } from '../../types';
import { useCanteen } from '../../context/CanteenContext';

interface FoodCardProps {
  food: FoodItem;
  onOpenQuickView?: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onOpenQuickView }) => {
  const { addToCart, favorites, toggleFavorite, checkFoodItemAvailableNow } = useCanteen();
  const [isHovered, setIsHovered] = useState(false);

  const isFav = favorites.includes(food.foodId);
  const availability = checkFoodItemAvailableNow(food);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-amber-200 dark:hover:border-slate-600 transition-all flex flex-col h-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Veg / Non-Veg Indicator */}
            <span className="p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm">
              <span
                className={`block w-3 h-3 rounded-full border-2 ${
                  food.vegType === 'veg'
                    ? 'border-emerald-600 bg-emerald-500'
                    : 'border-rose-600 bg-rose-500'
                }`}
              />
            </span>

            {/* Popular Rank Badge */}
            {food.popularRank && food.popularRank <= 3 && (
              <span className="bg-amber-500 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                <Sparkles size={11} /> Top #{food.popularRank}
              </span>
            )}
          </div>

          {/* Favorite Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(food.foodId);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition shadow ${
              isFav
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-500'
            }`}
            aria-label="Add to favorites"
          >
            <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Bottom Image Stats */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
          <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock size={12} className="text-amber-400" /> {food.preparationTimeMinutes} mins prep
          </span>

          {food.rating && (
            <span className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-amber-400">
              <Star size={12} fill="currentColor" /> {food.rating}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full border border-orange-200/50 dark:border-orange-800/50">
              {food.category}
            </span>

            {/* Stock Level Warning */}
            {food.stock > 0 && food.stock <= food.minimumStockAlert && (
              <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-100/80 dark:bg-orange-900/40 px-2 py-0.5 rounded-full">
                Only {food.stock} left!
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-snug line-clamp-1">
            {food.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Availability Status & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Price</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              ₹{food.price}
            </span>
          </div>

          {!availability.available ? (
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-800">
                <AlertCircle size={13} /> {food.stock === 0 ? 'Out of Stock' : 'Unavailable'}
              </span>
              {availability.reason && (
                <span className="text-[10px] text-slate-400 block mt-0.5">{availability.reason}</span>
              )}
            </div>
          ) : (
            <button
              onClick={() => addToCart(food, 1)}
              className="px-4 py-2 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-bold text-xs rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={15} /> Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
