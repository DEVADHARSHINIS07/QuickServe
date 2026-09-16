import { FoodItem, User, CanteenConfig, Order, NotificationItem } from '../types';

export const INITIAL_STUDENT: User = {
  userId: '',
  studentId: '',
  name: 'Student Guest',
  email: '',
  mobile: '',
  role: 'student',
  avatar: ''
};

export const INITIAL_ADMIN: User = {
  userId: 'USR_ADM001',
  studentId: 'ADM001',
  name: 'QuickServe Canteen Admin',
  email: 'admin@aaacet.ac.in',
  mobile: '+91 91234 56789',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export const INITIAL_CANTEEN_CONFIG: CanteenConfig = {
  isOpen: true,
  canteenName: 'QuickServe',
  collegeName: 'AAA College of Engineering & Technology',
  openingTime: '08:00',
  closingTime: '19:00',
  upiId: 'canteen.aaacet@okaxis',
  merchantName: 'AAA College Canteen',
  noticeMessage: 'Freshly cooked lunch meals available from 12:00 PM to 2:30 PM!',
  workingHours: [
    { day: 'Monday', isOpen: true, sessions: [{ name: 'Breakfast', startTime: '08:00', endTime: '11:00' }, { name: 'Lunch', startTime: '12:00', endTime: '15:00' }, { name: 'Snacks', startTime: '16:00', endTime: '19:00' }] },
    { day: 'Tuesday', isOpen: true, sessions: [{ name: 'Breakfast', startTime: '08:00', endTime: '11:00' }, { name: 'Lunch', startTime: '12:00', endTime: '15:00' }, { name: 'Snacks', startTime: '16:00', endTime: '19:00' }] },
    { day: 'Wednesday', isOpen: true, sessions: [{ name: 'Breakfast', startTime: '08:00', endTime: '11:00' }, { name: 'Lunch', startTime: '12:00', endTime: '15:00' }, { name: 'Snacks', startTime: '16:00', endTime: '19:00' }] },
    { day: 'Thursday', isOpen: true, sessions: [{ name: 'Breakfast', startTime: '08:00', endTime: '11:00' }, { name: 'Lunch', startTime: '12:00', endTime: '15:00' }, { name: 'Snacks', startTime: '16:00', endTime: '19:00' }] },
    { day: 'Friday', isOpen: true, sessions: [{ name: 'Breakfast', startTime: '08:00', endTime: '11:00' }, { name: 'Lunch', startTime: '12:00', endTime: '15:00' }, { name: 'Snacks', startTime: '16:00', endTime: '19:00' }] },
    { day: 'Saturday', isOpen: true, sessions: [{ name: 'Breakfast & Lunch', startTime: '08:30', endTime: '14:00' }] },
    { day: 'Sunday', isOpen: false, sessions: [] }
  ]
};

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  {
    foodId: 'F101',
    name: 'Veg Loaded Burger',
    description: 'Crispy vegetable patty topped with melted cheese, lettuce, tomatoes & special herb sauce in a toasted brioche bun.',
    category: 'Fast Food',
    price: 60,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    vegType: 'veg',
    isAvailable: true,
    stock: 25,
    minimumStockAlert: 5,
    preparationTimeMinutes: 10,
    popularRank: 1,
    rating: 4.8,
    schedule: { availableFrom: '08:00', availableUntil: '19:00', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  },
  {
    foodId: 'F102',
    name: 'Paneer Tikka Pizza (7")',
    description: 'Fresh mozzarella cheese, marinated cottage cheese cubes, bell peppers & spicy red paprika on hand-tossed crust.',
    category: 'Pizza',
    price: 110,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    vegType: 'veg',
    isAvailable: true,
    stock: 15,
    minimumStockAlert: 3,
    preparationTimeMinutes: 15,
    popularRank: 2,
    rating: 4.9,
    schedule: { availableFrom: '11:00', availableUntil: '18:30', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  },
  {
    foodId: 'F103',
    name: 'Special South Indian Thali',
    description: 'Traditional meal with steamed rice, sambar, rasam, kootu, poriyal, papad, curd, and special gulab jamun.',
    category: 'Meals',
    price: 90,
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
    vegType: 'veg',
    isAvailable: true,
    stock: 40,
    minimumStockAlert: 8,
    preparationTimeMinutes: 8,
    popularRank: 3,
    rating: 4.7,
    schedule: { availableFrom: '12:00', availableUntil: '15:00', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  },
  {
    foodId: 'F104',
    name: 'Grilled Chicken Sandwich',
    description: 'Juicy spiced chicken breast strips grilled with mayonnaise, crisp cucumber & toasted whole wheat bread.',
    category: 'Snacks',
    price: 80,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    vegType: 'non-veg',
    isAvailable: true,
    stock: 18,
    minimumStockAlert: 4,
    preparationTimeMinutes: 12,
    popularRank: 4,
    rating: 4.6,
    schedule: { availableFrom: '09:00', availableUntil: '18:30', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  },
  {
    foodId: 'F105',
    name: 'Cold Coffee with Ice Cream',
    description: 'Rich blended espresso cold coffee topped with a creamy scoop of vanilla ice cream and chocolate drizzle.',
    category: 'Beverages',
    price: 50,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    vegType: 'veg',
    isAvailable: true,
    stock: 30,
    minimumStockAlert: 6,
    preparationTimeMinutes: 5,
    popularRank: 5,
    rating: 4.9,
    schedule: { availableFrom: '08:00', availableUntil: '19:00', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  },
  {
    foodId: 'F106',
    name: 'Fresh Orange Mint Juice',
    description: 'Pure cold-pressed sweet oranges with fresh mint leaves and a hint of rock salt. Zero artificial sugar added.',
    category: 'Drinks',
    price: 35,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
    vegType: 'veg',
    isAvailable: true,
    stock: 35,
    minimumStockAlert: 5,
    preparationTimeMinutes: 5,
    popularRank: 6,
    rating: 4.5,
    schedule: { availableFrom: '08:00', availableUntil: '18:00', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  },
  {
    foodId: 'F107',
    name: 'Samosa Chat Platter (2 Pcs)',
    description: 'Crushed crisp samosas topped with spicy chickpea curry, sweet tamarind chutney, mint sauce & crispy sev.',
    category: 'Snacks',
    price: 45,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    vegType: 'veg',
    isAvailable: true,
    stock: 20,
    minimumStockAlert: 5,
    preparationTimeMinutes: 7,
    popularRank: 7,
    rating: 4.8,
    schedule: { availableFrom: '10:00', availableUntil: '18:30', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  },
  {
    foodId: 'F108',
    name: 'Chocolate Lava Cake',
    description: 'Warm fluffy chocolate cake with a molten liquid chocolate core inside. Served warm.',
    category: 'Desserts',
    price: 70,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    vegType: 'veg',
    isAvailable: true,
    stock: 12,
    minimumStockAlert: 3,
    preparationTimeMinutes: 6,
    popularRank: 8,
    rating: 4.9,
    schedule: { availableFrom: '10:00', availableUntil: '19:00', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  },
  {
    foodId: 'F109',
    name: 'Masala French Fries',
    description: 'Crispy golden potato fries tossed in tangy peri-peri and chat masala seasoning. Served with ketchup.',
    category: 'Fast Food',
    price: 50,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80',
    vegType: 'veg',
    isAvailable: true,
    stock: 30,
    minimumStockAlert: 5,
    preparationTimeMinutes: 8,
    popularRank: 9,
    rating: 4.6,
    schedule: { availableFrom: '09:00', availableUntil: '19:00', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  },
  {
    foodId: 'F110',
    name: 'Special Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken pieces, saffron, whole spices and served with raita.',
    category: 'Meals',
    price: 130,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    vegType: 'non-veg',
    isAvailable: false,
    stock: 0,
    minimumStockAlert: 5,
    preparationTimeMinutes: 10,
    popularRank: 10,
    rating: 4.9,
    schedule: { availableFrom: '12:00', availableUntil: '14:30', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  }
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

