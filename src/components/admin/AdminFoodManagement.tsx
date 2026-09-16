import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Search, Clock, X, Image as ImageIcon } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { FoodItem, Category, VegType } from '../../types';
import { getMatchingFoodImage, PRESET_FOOD_IMAGES } from '../../utils/foodImageMapper';

export const AdminFoodManagement: React.FC = () => {
  const { foodItems, addFoodItem, updateFoodItem, deleteFoodItem, toggleFoodAvailability } = useCanteen();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Fast Food');
  const [price, setPrice] = useState<number>(60);
  const [image, setImage] = useState('');
  const [matchedLabel, setMatchedLabel] = useState('Thali & Rice Meals');
  const [isCustomImage, setIsCustomImage] = useState(false);
  const [vegType, setVegType] = useState<VegType>('veg');
  const [stock, setStock] = useState<number>(20);
  const [minimumStockAlert, setMinimumStockAlert] = useState<number>(5);
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState<number>(10);
  const [availableFrom, setAvailableFrom] = useState('08:00');
  const [availableUntil, setAvailableUntil] = useState('19:00');

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setCategory('Fast Food');
    setPrice(60);
    const initialMatched = getMatchingFoodImage('', 'Fast Food');
    setImage(initialMatched.imageUrl);
    setMatchedLabel(initialMatched.label);
    setIsCustomImage(false);
    setVegType('veg');
    setStock(20);
    setMinimumStockAlert(5);
    setPreparationTimeMinutes(10);
    setAvailableFrom('08:00');
    setAvailableUntil('19:00');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setCategory(item.category);
    setPrice(item.price);
    setImage(item.image);
    const matched = getMatchingFoodImage(item.name, item.category);
    setMatchedLabel(matched.label);
    setIsCustomImage(true);
    setVegType(item.vegType);
    setStock(item.stock);
    setMinimumStockAlert(item.minimumStockAlert);
    setPreparationTimeMinutes(item.preparationTimeMinutes);
    setAvailableFrom(item.schedule?.availableFrom || '08:00');
    setAvailableUntil(item.schedule?.availableUntil || '19:00');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isCustomImage || !image) {
      const matched = getMatchingFoodImage(val, category);
      setImage(matched.imageUrl);
      setMatchedLabel(matched.label);
    }
  };

  const handleCategoryChange = (catVal: Category) => {
    setCategory(catVal);
    if (!isCustomImage || !image) {
      const matched = getMatchingFoodImage(name, catVal);
      setImage(matched.imageUrl);
      setMatchedLabel(matched.label);
    }
  };

  const handleSelectPreset = (presetImg: string, label: string) => {
    setImage(presetImg);
    setMatchedLabel(label);
    setIsCustomImage(true);
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    let finalImage = image.trim();
    if (!finalImage) {
      finalImage = getMatchingFoodImage(name, category).imageUrl;
    }

    const payload = {
      name,
      description,
      category,
      price,
      image: finalImage,
      vegType,
      isAvailable: stock > 0,
      stock,
      minimumStockAlert,
      preparationTimeMinutes,
      schedule: {
        availableFrom,
        availableUntil,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      }
    };

    if (editingItem) {
      updateFoodItem({ ...payload, foodId: editingItem.foodId });
    } else {
      addFoodItem(payload);
    }

    setIsModalOpen(false);
  };

  const filteredItems = foodItems.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Menu & Stock Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add new items, update prices, manage daily stock, and set availability schedules
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} /> Add Food Item
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dish by name..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 shadow-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 shadow-xs cursor-pointer"
        >
          <option value="All">All Categories</option>
          <option value="Fast Food">Fast Food</option>
          <option value="Pizza">Pizza</option>
          <option value="Meals">Meals</option>
          <option value="Snacks">Snacks</option>
          <option value="Drinks">Drinks</option>
          <option value="Desserts">Desserts</option>
          <option value="Beverages">Beverages</option>
        </select>
      </div>

      {/* FOOD ITEMS TABLE / CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(food => (
          <div
            key={food.foodId}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="flex gap-4">
              <img
                src={food.image}
                alt={food.name}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {food.category}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${food.vegType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate mt-1">
                  {food.name}
                </h3>

                <span className="text-base font-black text-slate-900 dark:text-white block mt-0.5">
                  ₹{food.price}
                </span>

                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Prep: {food.preparationTimeMinutes} mins
                </span>
              </div>
            </div>

            {/* Stock & Availability Details */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between text-xs border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Kitchen Stock</span>
                <span className={`font-bold text-xs ${food.stock <= food.minimumStockAlert ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {food.stock} items remaining
                </span>
              </div>

              {/* Quick Toggle Button */}
              <button
                onClick={() => toggleFoodAvailability(food.foodId)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                  food.isAvailable && food.stock > 0
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {food.isAvailable && food.stock > 0 ? 'Active' : 'Disabled'}
              </button>
            </div>

            {/* Actions Row */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {food.schedule?.availableFrom || '08:00'} - {food.schedule?.availableUntil || '19:00'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(food)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition text-xs flex items-center gap-1 font-bold"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => deleteFoodItem(food.foodId)}
                  className="p-2 bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 rounded-xl transition text-xs font-bold"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT FOOD ITEM MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 my-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  {editingItem ? 'Edit Food Item Details' : 'Add New Dish to Menu'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveFood} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Masala Tea, Ginger Chai, Veg Burger..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-900 dark:text-white font-medium text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Ingredients & taste notes..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-900 dark:text-white text-xs"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={e => handleCategoryChange(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Beverages">Beverages</option>
                      <option value="Fast Food">Fast Food</option>
                      <option value="Pizza">Pizza</option>
                      <option value="Meals">Meals</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dietary Type</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setVegType('veg')}
                        className={`flex-1 py-1.5 rounded-lg font-bold text-center text-xs transition ${vegType === 'veg' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => setVegType('non-veg')}
                        className={`flex-1 py-1.5 rounded-lg font-bold text-center text-xs transition ${vegType === 'non-veg' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        Non-Veg
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-extrabold text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Stock Qty</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={e => setStock(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Prep (Mins)</label>
                    <input
                      type="number"
                      value={preparationTimeMinutes}
                      onChange={e => setPreparationTimeMinutes(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* EXACT FOOD IMAGE SELECTOR & PREVIEW */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-slate-500" /> Dish Photo Matching
                    </label>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      Auto-matched: {matchedLabel}
                    </span>
                  </div>

                  {/* Image Live Preview Box */}
                  <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <img
                      src={image || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80'}
                      alt="Dish Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {name || 'New Dish'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate font-mono">
                        {image}
                      </span>
                    </div>
                  </div>

                  {/* Preset Quick Image Selector Chips */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Quick Pick Preset Photo:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {PRESET_FOOD_IMAGES.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset.imageUrl, preset.label)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                            image === preset.imageUrl
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Or Custom Image URL:</span>
                    <input
                      type="url"
                      value={image}
                      onChange={e => {
                        setImage(e.target.value);
                        setIsCustomImage(true);
                      }}
                      placeholder="https://..."
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Schedule Window */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Item Availability Hours</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Available From</span>
                      <input
                        type="time"
                        value={availableFrom}
                        onChange={e => setAvailableFrom(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-center text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Available Until</span>
                      <input
                        type="time"
                        value={availableUntil}
                        onChange={e => setAvailableUntil(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-center text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-xs transition"
                  >
                    Save Dish to Menu
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
