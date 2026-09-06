export interface PresetFoodImage {
  id: string;
  label: string;
  keywords: string[];
  imageUrl: string;
  icon: string;
}

export const PRESET_FOOD_IMAGES: PresetFoodImage[] = [
  {
    id: 'tea',
    label: 'Hot Tea / Chai',
    keywords: ['tea', 'chai', 'chay', 'masala tea', 'ginger tea', 'green tea', 'black tea', 'milk tea', 'sukku tea'],
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    icon: '☕'
  },
  {
    id: 'coffee',
    label: 'Coffee / Espresso',
    keywords: ['coffee', 'espresso', 'cappuccino', 'latte', 'cold coffee', 'filter coffee', 'kaapi'],
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    icon: '☕'
  },
  {
    id: 'samosa',
    label: 'Samosa & Snacks',
    keywords: ['samosa', 'kachori', 'chaat', 'chat', 'pakora', 'pakoda', 'bajji', 'vada', 'medu vada', 'cutlet', 'bhel', 'snack'],
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    icon: '🥟'
  },
  {
    id: 'dosa',
    label: 'Dosa & South Indian',
    keywords: ['dosa', 'dosai', 'dhosa', 'idli', 'uttapam', 'utappam', 'pongal', 'poori', 'puri', 'appam'],
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    icon: '🫓'
  },
  {
    id: 'burger',
    label: 'Burger & Bun',
    keywords: ['burger', 'hamburger', 'cheeseburger', 'bun'],
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    icon: '🍔'
  },
  {
    id: 'pizza',
    label: 'Pizza',
    keywords: ['pizza', 'calzone'],
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    icon: '🍕'
  },
  {
    id: 'sandwich',
    label: 'Sandwich & Toast',
    keywords: ['sandwich', 'toast', 'bread', 'panini', 'club sandwich'],
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    icon: '🥪'
  },
  {
    id: 'meals',
    label: 'Thali & Rice Meals',
    keywords: ['thali', 'meal', 'meals', 'rice', 'biryani', 'pulao', 'curry', 'chapati', 'roti', 'naan', 'parotta', 'paratha', 'paneer', 'gravy'],
    imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
    icon: '🍛'
  },
  {
    id: 'noodles',
    label: 'Noodles & Pasta',
    keywords: ['noodle', 'noodles', 'pasta', 'maggi', 'chowmein', 'ramen', 'spaghetti', 'macaroni', 'fried rice'],
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
    icon: '🍜'
  },
  {
    id: 'fries',
    label: 'French Fries',
    keywords: ['fries', 'french fries', 'potato fries', 'wedges', 'finger chips'],
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80',
    icon: '🍟'
  },
  {
    id: 'juice',
    label: 'Juice & Drinks',
    keywords: ['juice', 'drink', 'beverage', 'shake', 'milkshake', 'lassi', 'mojito', 'soda', 'lemonade', 'coke', 'pepsi', 'sprite', 'water'],
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
    icon: '🥤'
  },
  {
    id: 'puff',
    label: 'Puffs & Rolls',
    keywords: ['puff', 'roll', 'wrap', 'frankie', 'egg puff', 'veg puff', 'chicken puff', 'samosa puff'],
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    icon: '🌯'
  },
  {
    id: 'dessert',
    label: 'Desserts & Sweets',
    keywords: ['cake', 'brownie', 'ice cream', 'icecream', 'pastry', 'jamun', 'halwa', 'sweet', 'donut', 'muffin', 'dessert', 'pudding'],
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    icon: '🍰'
  }
];

export function getMatchingFoodImage(name: string, category: string = ''): { imageUrl: string; label: string } {
  const cleanName = (name || '').toLowerCase().trim();
  const cleanCategory = (category || '').toLowerCase().trim();

  // 1. Try exact keyword match in name
  for (const preset of PRESET_FOOD_IMAGES) {
    if (preset.keywords.some(kw => cleanName.includes(kw))) {
      return { imageUrl: preset.imageUrl, label: preset.label };
    }
  }

  // 2. Try match in category
  if (cleanCategory.includes('drink') || cleanCategory.includes('beverage')) {
    if (cleanName.includes('tea') || cleanName.includes('chai')) {
      const teaPreset = PRESET_FOOD_IMAGES.find(p => p.id === 'tea')!;
      return { imageUrl: teaPreset.imageUrl, label: teaPreset.label };
    }
    const juicePreset = PRESET_FOOD_IMAGES.find(p => p.id === 'juice')!;
    return { imageUrl: juicePreset.imageUrl, label: juicePreset.label };
  }

  if (cleanCategory.includes('pizza')) {
    const pizzaPreset = PRESET_FOOD_IMAGES.find(p => p.id === 'pizza')!;
    return { imageUrl: pizzaPreset.imageUrl, label: pizzaPreset.label };
  }

  if (cleanCategory.includes('snack')) {
    const snackPreset = PRESET_FOOD_IMAGES.find(p => p.id === 'samosa')!;
    return { imageUrl: snackPreset.imageUrl, label: snackPreset.label };
  }

  if (cleanCategory.includes('meal')) {
    const mealPreset = PRESET_FOOD_IMAGES.find(p => p.id === 'meals')!;
    return { imageUrl: mealPreset.imageUrl, label: mealPreset.label };
  }

  if (cleanCategory.includes('dessert')) {
    const dessertPreset = PRESET_FOOD_IMAGES.find(p => p.id === 'dessert')!;
    return { imageUrl: dessertPreset.imageUrl, label: dessertPreset.label };
  }

  // Fallback default: Meal or Fast Food
  const defaultPreset = PRESET_FOOD_IMAGES.find(p => p.id === 'meals') || PRESET_FOOD_IMAGES[0];
  return { imageUrl: defaultPreset.imageUrl, label: defaultPreset.label };
}
