import React from 'react';
import { Heart, Utensils } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { FoodCard } from './FoodCard';

interface FavoritesViewProps {
  setActiveView: (view: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ setActiveView }) => {
  const { foodItems, favorites } = useCanteen();

  const favFoods = foodItems.filter(f => favorites.includes(f.foodId));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-10">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="text-rose-500 fill-rose-500" size={26} /> Saved Favorite Foods
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your saved dishes for instant ordering
        </p>
      </div>

      {favFoods.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <Heart size={48} className="mx-auto mb-3 text-slate-300 stroke-1" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">No favorite food items yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Click the heart icon on any food card to save it here for quick access!
          </p>
          <button
            onClick={() => setActiveView('menu')}
            className="mt-5 px-5 py-2.5 bg-amber-500 text-slate-900 font-bold text-xs rounded-2xl shadow hover:bg-amber-600 transition"
          >
            Explore Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favFoods.map(food => (
            <FoodCard key={food.foodId} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};
