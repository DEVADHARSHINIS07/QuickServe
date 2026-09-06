export type Role = 'student' | 'admin';

export type VegType = 'veg' | 'non-veg';

export type Category = 
  | 'Fast Food'
  | 'Pizza'
  | 'Meals'
  | 'Snacks'
  | 'Drinks'
  | 'Desserts'
  | 'Beverages';

export type OrderStatus =
  | 'Order Placed'
  | 'Waiting for Confirmation'
  | 'Order Accepted'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export type PaymentMethod = 'UPI' | 'Cash';

export type PaymentStatus = 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';

export type RefundStatus = 'NONE' | 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type OrderPriority = 'HIGH' | 'MEDIUM' | 'NORMAL';

export interface User {
  userId: string;
  name: string;
  studentId: string;
  email: string;
  mobile: string;
  role: Role;
  avatar?: string;
}

export interface FoodSchedule {
  availableFrom: string; // "11:00"
  availableUntil: string; // "15:00"
  availableDays: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
}

export interface FoodItem {
  foodId: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  image: string;
  vegType: VegType;
  isAvailable: boolean;
  stock: number;
  minimumStockAlert: number;
  preparationTimeMinutes: number;
  popularRank?: number;
  schedule?: FoodSchedule;
  rating?: number;
}

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vegType: VegType;
}

export interface RefundInfo {
  refundId: string;
  amount: number;
  status: RefundStatus;
  initiatedAt: string;
  completedAt?: string;
  refundTransactionId: string;
}

export interface Order {
  orderId: string;
  studentId: string;
  studentName: string;
  studentMobile: string;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  requestedReadyDate: string; // "2026-08-10" or "Today"
  requestedReadyTime: string; // "13:15"
  priority: OrderPriority;
  orderStatus: OrderStatus;
  rejectionReason?: string;
  refundInfo?: RefundInfo;
  queueNumber: string; // "A-24"
  createdAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  completedAt?: string;
  historyTimeline: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface NotificationItem {
  notificationId: string;
  recipientId: string; // Student ID or 'admin'
  orderId?: string;
  type: 'order_placed' | 'order_accepted' | 'order_rejected' | 'order_preparing' | 'order_ready' | 'order_completed' | 'refund' | 'system';
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export interface WorkingSession {
  name: string; // "Lunch Session"
  startTime: string; // "12:00"
  endTime: string; // "15:00"
}

export interface DayWorkingHours {
  day: string; // "Monday"
  isOpen: boolean;
  sessions: WorkingSession[];
}

export interface CanteenConfig {
  isOpen: boolean;
  canteenName: string;
  collegeName: string;
  openingTime: string; // "08:00"
  closingTime: string; // "19:00"
  noticeMessage?: string;
  workingHours: DayWorkingHours[];
  upiId: string;
  merchantName: string;
}
