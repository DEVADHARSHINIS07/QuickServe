import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { FoodItem } from '../../types';
import { useCanteen } from '../../context/CanteenContext';

interface FoodCardProps {
  food: FoodItem;
  onOpenQuickView?: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const { addToCart, favorites, toggleFavorite, checkFoodItemAvailableNow } = useCanteen();

  const isFav = favorites.includes(food.foodId);
  const availability = checkFoodItemAvailableNow(food);

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-2.5 left-2.5">
          <span className="p-1 bg-white/90 dark:bg-slate-900/90 rounded-md shadow-xs flex items-center justify-center">
            <span
              className={`block w-2.5 h-2.5 rounded-full ${
                food.vegType === 'veg'
                  ? 'bg-emerald-500'
                  : 'bg-rose-500'
              }`}
            />
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(food.foodId);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition shadow-xs ${
            isFav
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-rose-500'
          }`}
          aria-label="Favorite"
        >
          <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-1">
              {food.name}
            </h3>
            <span className="text-xs text-slate-400 shrink-0">
              {food.preparationTimeMinutes}m
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {food.description}
          </p>
        </div>

        {/* Footer: Price & Add */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            ₹{food.price}
          </span>

          {!availability.available ? (
            <span className="text-[11px] text-rose-500 font-medium">
              {food.stock === 0 ? 'Out of stock' : 'Unavailable'}
            </span>
          ) : (
            <button
              onClick={() => addToCart(food, 1)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl transition flex items-center gap-1 active:scale-95"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
