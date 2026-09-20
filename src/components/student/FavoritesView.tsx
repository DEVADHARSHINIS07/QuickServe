import React from 'react';
import { Heart } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { FoodCard } from './FoodCard';

interface FavoritesViewProps {
  setActiveView: (view: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ setActiveView }) => {
  const { foodItems, favorites } = useCanteen();

  const favFoods = foodItems.filter(f => favorites.includes(f.foodId));

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="text-slate-900 dark:text-white fill-slate-900 dark:fill-white" size={20} /> Favorites
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {favFoods.length} saved items
        </p>
      </div>

      {favFoods.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Heart size={40} className="mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-1" />
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No favorites yet</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Click the heart icon on any food item to save it here.
          </p>
          <button
            onClick={() => setActiveView('menu')}
            className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs rounded-xl transition"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {favFoods.map(food => (
            <FoodCard key={food.foodId} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};
