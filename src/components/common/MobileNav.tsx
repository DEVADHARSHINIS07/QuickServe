import React from 'react';
import { Utensils, Clock, History, Heart, ShoppingBag, LayoutDashboard, ListOrdered, Coffee, Settings, BarChart2 } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

interface MobileNavProps {
  activeView: string;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, onNavigate, onOpenCart }) => {
  const { currentRole, cart, activeOrder } = useCanteen();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] flex items-center justify-around shadow-2xl transition-all"
    >
      {currentRole === 'student' ? (
        <>
          <button
            onClick={() => onNavigate('/student/menu')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition text-[10px] font-bold select-none ${
              activeView === 'menu' || activeView === 'student_menu' ? 'text-orange-500 dark:text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Utensils size={19} />
            <span className="truncate max-w-[48px] mt-0.5">Menu</span>
          </button>

          <button
            onClick={() => onNavigate('/student/order-tracking')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition text-[10px] font-bold relative select-none ${
              activeView === 'tracking' || activeView === 'student_tracking' ? 'text-orange-500 dark:text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock size={19} />
            <span className="truncate max-w-[48px] mt-0.5">Tracking</span>
            {activeOrder && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            )}
          </button>

          {/* Quick Floating Cart Button */}
          <div className="flex-1 flex justify-center -mt-5">
            <button
              onClick={onOpenCart}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/30 active:scale-95 transition flex items-center justify-center relative border-2 border-white dark:border-slate-900"
              aria-label="Open Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => onNavigate('/student/history')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition text-[10px] font-bold select-none ${
              activeView === 'history' || activeView === 'student_history' ? 'text-orange-500 dark:text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History size={19} />
            <span className="truncate max-w-[48px] mt-0.5">Orders</span>
          </button>

          <button
            onClick={() => onNavigate('/student/favorites')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition text-[10px] font-bold select-none ${
              activeView === 'favorites' || activeView === 'student_favorites' ? 'text-orange-500 dark:text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Heart size={19} />
            <span className="truncate max-w-[48px] mt-0.5">Favs</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => onNavigate('/admin/dashboard')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition text-[10px] font-bold select-none ${
              activeView === 'admin_dashboard' ? 'text-orange-500 dark:text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard size={19} />
            <span className="truncate max-w-[48px] mt-0.5">Dash</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/orders')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition text-[10px] font-bold select-none ${
              activeView === 'admin_orders' ? 'text-orange-500 dark:text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ListOrdered size={19} />
            <span className="truncate max-w-[48px] mt-0.5">Queue</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/food')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition text-[10px] font-bold select-none ${
              activeView === 'admin_food' ? 'text-orange-500 dark:text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Coffee size={19} />
            <span className="truncate max-w-[48px] mt-0.5">Food</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/schedule')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition text-[10px] font-bold select-none ${
              activeView === 'admin_schedule' ? 'text-orange-500 dark:text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings size={19} />
            <span className="truncate max-w-[48px] mt-0.5">Hours</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/analytics')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition text-[10px] font-bold select-none ${
              activeView === 'admin_analytics' ? 'text-orange-500 dark:text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart2 size={19} />
            <span className="truncate max-w-[48px] mt-0.5">Reports</span>
          </button>
        </>
      )}
    </nav>
  );
};

