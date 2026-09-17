import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Inbox, CheckCircle2, KeyRound, Copy, Check, Clock, Sparkles, ShieldCheck, X, RefreshCw } from 'lucide-react';
import {
  User,
  Role,
  FoodItem,
  Order,
  OrderItem,
  NotificationItem,
  CanteenConfig,
  OrderStatus,
  PaymentMethod
} from '../types';
import {
  INITIAL_STUDENT,
  INITIAL_ADMIN,
  INITIAL_CANTEEN_CONFIG,
  INITIAL_FOOD_ITEMS,
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import {
  apiStudentLogin,
  apiStudentRegister,
  apiAdminLogin,
  apiAdminRegister,
  apiForgotPassword,
  apiResetPassword,
  apiVerifySession,
  apiPlaceOrder,
  apiCheckOriginalEmail,
  apiSendEmailVerificationCode,
  apiVerifyEmailCode,
  apiGetSentEmails,
  getAuthToken,
  setAuthToken,
  clearAuthToken
} from '../services/api';

const COLLEGE_DOMAIN = 'aaacet.ac.in';

interface CanteenContextType {
  isAuthenticated: boolean;
  currentRole: Role;
  currentUser: User;
  authToken: string | null;
  canteenConfig: CanteenConfig;
  foodItems: FoodItem[];
  orders: Order[];
  notifications: NotificationItem[];
  cart: OrderItem[];
  favorites: string[];
  isCanteenOpen: boolean;
  activeOrder: Order | null;
  unreadNotificationCount: number;

  // Authentication Actions
  loginStudent: (emailOrRoll: string, password: string) => Promise<{ success: boolean; message: string }>;
  registerStudent: (data: {
    name: string;
    studentId: string;
    email: string;
    mobile: string;
    password: string;
  }) => Promise<{ success: boolean; message: string }>;

  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  registerAdmin: (data: {
    name: string;
    email: string;
    mobile?: string;
    password: string;
  }) => Promise<{ success: boolean; message: string }>;

  logoutUser: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  resetPassword: (codeOrToken: string, newPassword: string, email?: string) => Promise<{ success: boolean; message: string }>;
  checkOriginalEmail: (email: string) => Promise<{ isOriginal: boolean; reason?: string; studentRoll?: string }>;
  sendEmailVerificationCode: (email: string, studentName?: string) => Promise<{ success: boolean; message: string; code?: string }>;
  verifyEmailCode: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  getSentEmails: (email?: string) => Promise<any[]>;

  // Cart & Food Actions
  switchRole: (role: Role) => void;
  loginUser: (user: User) => void;
  addToCart: (food: FoodItem, quantity?: number) => void;
  removeFromCart: (foodId: string) => void;
  updateCartQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (foodId: string) => void;
  
  placeOrder: (
    paymentMethod: PaymentMethod,
    requestedDate: string,
    requestedTime: string,
    transactionId?: string
  ) => Order;

  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;

  addFoodItem: (item: Omit<FoodItem, 'foodId'>) => void;
  updateFoodItem: (item: FoodItem) => void;
  deleteFoodItem: (foodId: string) => void;
  toggleFoodAvailability: (foodId: string) => void;

  updateCanteenConfig: (config: Partial<CanteenConfig>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  reorderItems: (order: Order) => void;
  checkFoodItemAvailableNow: (item: FoodItem) => { available: boolean; reason?: string };
  clearAllUserData: () => Promise<void>;
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Role>('student');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_STUDENT);
  const [authToken, setAuthTokenState] = useState<string | null>(getAuthToken());

  const [canteenConfig, setCanteenConfig] = useState<CanteenConfig>(INITIAL_CANTEEN_CONFIG);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['F101', 'F102', 'F105']);

  // Load session & localStorage state on mount
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('quickserve_user');
      const savedToken = getAuthToken();

      if (savedUserStr && savedToken) {
        const savedUser: User = JSON.parse(savedUserStr);
        setCurrentUser(savedUser);
        setCurrentRole(savedUser.role);
        setIsAuthenticated(true);
        setAuthTokenState(savedToken);

        // Verify active token validity with server
        apiVerifySession().then((res) => {
          if (!res.success || (res as any).authenticated === false) {
            // Token expired or invalidated by active server
            logoutUser();
          } else if (res.success && res.data?.user) {
            setCurrentUser(res.data.user);
            setCurrentRole(res.data.user.role);
            localStorage.setItem('quickserve_user', JSON.stringify(res.data.user));
          }
        });
      }

      const savedCart = localStorage.getItem('smart_canteen_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedFavs = localStorage.getItem('smart_canteen_favs');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    } catch {
      // fallback
    }
  }, []);

  // Save cart & favorites
  useEffect(() => {
    localStorage.setItem('smart_canteen_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('smart_canteen_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Email Domain Validator
  const validateCollegeEmail = (emailStr: string): boolean => {
    const trimmed = emailStr.trim().toLowerCase();
    return trimmed.endsWith(`@${COLLEGE_DOMAIN}`) && trimmed.split('@')[0].length > 0;
  };

  // Student Login
  const loginStudent = async (emailOrRoll: string, password: string): Promise<{ success: boolean; message: string }> => {
    const rawInput = emailOrRoll.trim().toLowerCase();
    let finalEmail = rawInput;
    let studentId = rawInput;

    if (rawInput.includes('@')) {
      if (!validateCollegeEmail(rawInput)) {
        return {
          success: false,
          message: `Access Denied: Only AAA College email IDs ending with @${COLLEGE_DOMAIN} are allowed (e.g. rollnumber@${COLLEGE_DOMAIN}).`
        };
      }
      studentId = rawInput.split('@')[0].toUpperCase();
    } else {
      finalEmail = `${rawInput}@${COLLEGE_DOMAIN}`;
      studentId = rawInput.toUpperCase();
    }

    // Call Real Backend Authentication API
    const apiRes = await apiStudentLogin(finalEmail, password);
    if (apiRes.isBackendAvailable) {
      if (apiRes.success && apiRes.data?.token) {
        setAuthToken(apiRes.data.token);
        setAuthTokenState(apiRes.data.token);

        const userObj: User = {
          userId: apiRes.data.user?.userId || studentId,
          studentId: apiRes.data.user?.studentId || studentId,
          name: apiRes.data.user?.name || `Student (${studentId})`,
          email: apiRes.data.user?.email || finalEmail,
          mobile: apiRes.data.user?.mobile || '',
          role: 'student'
        };

        setCurrentUser(userObj);
        setCurrentRole('student');
        setIsAuthenticated(true);
        localStorage.setItem('quickserve_user', JSON.stringify(userObj));
        return { success: true, message: apiRes.message || `Welcome back, ${userObj.name}!` };
      } else {
        return {
          success: false,
          message: apiRes.message || 'Incorrect password or account not found.'
        };
      }
    }

    // Resilient offline / client fallback if backend is unreachable
    if (password && password.length >= 6) {
      const studentName = `Student (${studentId})`;
      const demoToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
        userId: studentId,
        studentId,
        name: studentName,
        email: finalEmail,
        role: 'student',
        exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      }))}.demo_signature`;

      setAuthToken(demoToken);
      setAuthTokenState(demoToken);

      const userObj: User = {
        userId: studentId,
        studentId,
        name: studentName,
        email: finalEmail,
        mobile: '',
        role: 'student',
      };

      setCurrentUser(userObj);
      setCurrentRole('student');
      setIsAuthenticated(true);
      localStorage.setItem('quickserve_user', JSON.stringify(userObj));
      return { success: true, message: `Welcome back, ${userObj.name}!` };
    }

    return {
      success: false,
      message: 'Authentication service is unavailable. Please check your network connection.'
    };
  };

  // Student Registration
  const registerStudent = async (data: {
    name: string;
    studentId: string;
    email: string;
    mobile: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!validateCollegeEmail(data.email)) {
      return {
        success: false,
        message: `Access Denied: Registration requires an official @${COLLEGE_DOMAIN} email address.`
      };
    }

    const apiRes = await apiStudentRegister({
      name: data.name,
      studentId: data.studentId.toUpperCase(),
      email: data.email.trim().toLowerCase(),
      mobile: data.mobile,
      password: data.password,
      confirmPassword: data.password
    });

    if (apiRes.isBackendAvailable) {
      if (apiRes.success) {
        return {
          success: true,
          message: apiRes.message || `Account created for ${data.email}! You can now sign in.`
        };
      } else {
        return {
          success: false,
          message: apiRes.message || 'Registration failed. Please try again.'
        };
      }
    }

    // Resilient fallback when backend is unreachable: register locally
    const sId = data.studentId.toUpperCase();
    const fallbackUser: User = {
      userId: sId,
      studentId: sId,
      name: data.name,
      email: data.email.trim().toLowerCase(),
      mobile: data.mobile,
      role: 'student',
    };
    localStorage.setItem('quickserve_user', JSON.stringify(fallbackUser));
    return {
      success: true,
      message: `Account created successfully for ${data.email}! Welcome to QuickServe.`
    };
  };

  // Admin Login
  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed.includes('@') && !validateCollegeEmail(trimmed)) {
      return {
        success: false,
        message: `Admin login requires an authorized @${COLLEGE_DOMAIN} staff email address.`
      };
    }

    const apiRes = await apiAdminLogin(trimmed, password);
    if (apiRes.isBackendAvailable) {
      if (apiRes.success && apiRes.data?.token) {
        setAuthToken(apiRes.data.token);
        setAuthTokenState(apiRes.data.token);

        const adminObj: User = {
          userId: apiRes.data.user?.userId || 'ADM001',
          studentId: apiRes.data.user?.studentId || 'ADM001',
          name: apiRes.data.user?.name || 'QuickServe Canteen Admin',
          email: apiRes.data.user?.email || trimmed,
          mobile: apiRes.data.user?.mobile || '+91 91234 56789',
          role: 'admin'
        };

        setCurrentUser(adminObj);
        setCurrentRole('admin');
        setIsAuthenticated(true);
        localStorage.setItem('quickserve_user', JSON.stringify(adminObj));
        return { success: true, message: apiRes.message || 'Admin authenticated successfully!' };
      } else {
        return {
          success: false,
          message: apiRes.message || 'Invalid admin credentials or access denied.'
        };
      }
    }

    return {
      success: false,
      message: 'Authentication service is unavailable.'
    };
  };

  // Admin Registration
  const registerAdmin = async (data: {
    name: string;
    email: string;
    mobile?: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!validateCollegeEmail(data.email)) {
      return {
        success: false,
        message: `Admin registration requires an authorized @${COLLEGE_DOMAIN} staff email address.`
      };
    }

    const apiRes = await apiAdminRegister({
      name: data.name,
      email: data.email.trim().toLowerCase(),
      mobile: data.mobile,
      password: data.password,
      confirmPassword: data.password
    });

    if (apiRes.isBackendAvailable) {
      if (apiRes.success) {
        return {
          success: true,
          message: apiRes.message || `Admin account created for ${data.email}! You can now sign in.`
        };
      } else {
        return {
          success: false,
          message: apiRes.message || 'Admin registration failed.'
        };
      }
    }

    const adminId = `ADM_${Date.now().toString().slice(-4)}`;
    const fallbackAdmin: User = {
      userId: adminId,
      studentId: adminId,
      name: data.name,
      email: data.email.trim().toLowerCase(),
      mobile: data.mobile || '+91 91234 56789',
      role: 'admin',
    };
    localStorage.setItem('quickserve_user', JSON.stringify(fallbackAdmin));
    return {
      success: true,
      message: `Admin account created for ${data.email}! Welcome to QuickServe.`
    };
  };

  // Logout User
  const logoutUser = () => {
    clearAuthToken();
    localStorage.removeItem('quickserve_user');
    setIsAuthenticated(false);
    setAuthTokenState(null);
    setCurrentUser(INITIAL_STUDENT);
    setCurrentRole('student');
  };

  // Forgot Password (Dispatches 6-digit Code to Email)
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
    const apiRes = await apiForgotPassword(email);
    if (apiRes.isBackendAvailable) {
      if (apiRes.success) {
        const otp = (apiRes.data as any)?.otp || (apiRes.data as any)?.code;
        return {
          success: true,
          message: apiRes.message || 'A 6-digit password reset code has been sent to your college email.',
          otp
        };
      } else {
        return {
          success: false,
          message: apiRes.message || 'Account not found for this email address.'
        };
      }
    }
    return {
      success: false,
      message: 'Authentication service is unavailable.'
    };
  };

  // Reset Password (Verifies 6-digit Code from Email)
  const resetPassword = async (codeOrToken: string, newPassword: string, email?: string): Promise<{ success: boolean; message: string }> => {
    const apiRes = await apiResetPassword(codeOrToken, newPassword, email);
    if (apiRes.isBackendAvailable) {
      if (apiRes.success) {
        return { success: true, message: apiRes.message || 'Password reset successfully!' };
      } else {
        return { success: false, message: apiRes.message || 'Invalid or expired 6-digit code.' };
      }
    }
    return {
      success: false,
      message: 'Authentication service is unavailable.'
    };
  };

  // Email Authenticity & Verification Methods
  const checkOriginalEmail = async (email: string): Promise<{ isOriginal: boolean; reason?: string; studentRoll?: string }> => {
    const apiRes = await apiCheckOriginalEmail(email);
    if (apiRes.isBackendAvailable && apiRes.data) {
      return apiRes.data;
    }
    // Client-side fallback check
    const clean = email.trim().toLowerCase();
    const isOriginal = clean.endsWith('@aaacet.ac.in');
    return {
      isOriginal,
      reason: isOriginal ? undefined : 'Email domain must be @aaacet.ac.in (AAA College)',
      studentRoll: isOriginal ? clean.split('@')[0].toUpperCase() : undefined
    };
  };

  const sendEmailVerificationCode = async (email: string, studentName?: string): Promise<{ success: boolean; message: string; code?: string }> => {
    const apiRes = await apiSendEmailVerificationCode(email, studentName);
    if (apiRes.isBackendAvailable) {
      return {
        success: apiRes.success,
        message: apiRes.message || (apiRes.success ? 'Verification code sent to your email.' : 'Failed to send verification code.'),
        code: apiRes.data?.code
      };
    }
    return {
      success: false,
      message: 'Email verification service is currently offline.'
    };
  };

  const verifyEmailCode = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
    const apiRes = await apiVerifyEmailCode(email, code);
    if (apiRes.isBackendAvailable) {
      return {
        success: apiRes.success,
        message: apiRes.message || (apiRes.success ? 'Email verified successfully!' : 'Invalid verification code.')
      };
    }
    return {
      success: false,
      message: 'Email verification service is currently offline.'
    };
  };

  const getSentEmails = async (email?: string): Promise<any[]> => {
    const apiRes = await apiGetSentEmails(email);
    if (apiRes.isBackendAvailable && apiRes.data) {
      return apiRes.data;
    }
    return [];
  };

  // Check if canteen is open based on hours
  const checkCanteenOpenStatus = (): boolean => {
    if (!canteenConfig.isOpen) return false;
    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    const currentTimeMinutes = hours * 60 + mins;

    const [openH, openM] = canteenConfig.openingTime.split(':').map(Number);
    const [closeH, closeM] = canteenConfig.closingTime.split(':').map(Number);

    const openTimeMinutes = openH * 60 + openM;
    const closeTimeMinutes = closeH * 60 + closeM;

    return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes <= closeTimeMinutes;
  };

  const isCanteenOpen = checkCanteenOpenStatus();

  // Check if food item is available now
  const checkFoodItemAvailableNow = (item: FoodItem): { available: boolean; reason?: string } => {
    if (!canteenConfig.isOpen) {
      return { available: false, reason: 'Canteen is currently closed.' };
    }
    if (!item.isAvailable) {
      return { available: false, reason: 'Item is marked unavailable by staff.' };
    }
    if (item.stock <= 0) {
      return { available: false, reason: 'Item is Out of Stock!' };
    }

    if (item.schedule) {
      const now = new Date();
      const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentHM < item.schedule.availableFrom || currentHM > item.schedule.availableUntil) {
        return {
          available: false,
          reason: `Available between ${item.schedule.availableFrom} - ${item.schedule.availableUntil}`
        };
      }
    }

    return { available: true };
  };

  // Switch Role View Helper
  const switchRole = (role: Role) => {
    setCurrentRole(role);
    if (role === 'student') {
      setCurrentUser(INITIAL_STUDENT);
    } else {
      setCurrentUser(INITIAL_ADMIN);
    }
  };

  const loginUser = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsAuthenticated(true);
    localStorage.setItem('quickserve_user', JSON.stringify(user));
  };

  // Cart Management
  const addToCart = (food: FoodItem, quantity: number = 1) => {
    const isAvail = checkFoodItemAvailableNow(food);
    if (!isAvail.available) {
      alert(`Cannot add to cart: ${isAvail.reason}`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.foodId === food.foodId);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > food.stock) {
          alert(`Only ${food.stock} items remaining in stock.`);
          return prev;
        }
        return prev.map(i => i.foodId === food.foodId ? { ...i, quantity: newQty } : i);
      }
      return [...prev, {
        foodId: food.foodId,
        name: food.name,
        price: food.price,
        quantity,
        image: food.image,
        vegType: food.vegType
      }];
    });
  };

  const removeFromCart = (foodId: string) => {
    setCart(prev => prev.filter(i => i.foodId !== foodId));
  };

  const updateCartQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    const food = foodItems.find(f => f.foodId === foodId);
    if (food && quantity > food.stock) {
      alert(`Only ${food.stock} items available in stock.`);
      return;
    }
    setCart(prev => prev.map(i => i.foodId === foodId ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);

  // Favorites Toggle
  const toggleFavorite = (foodId: string) => {
    setFavorites(prev =>
      prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId]
    );
  };

  // Unique Notification ID Generator (prevents React key collisions)
  let notifCounter = 0;

  // Notification Helper
  const addNotification = (
    recipientId: string,
    title: string,
    message: string,
    type: NotificationItem['type'],
    orderId?: string
  ) => {
    notifCounter += 1;
    const uniqueId = `N${Date.now()}_${notifCounter}_${Math.random().toString(36).substring(2, 7)}`;
    const newNotif: NotificationItem = {
      notificationId: uniqueId,
      recipientId,
      orderId,
      type,
      title,
      message,
      readStatus: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev.filter(n => n.notificationId !== uniqueId)]);
  };

  // Place Order Workflow (Protected!)
  const placeOrder = (
    paymentMethod: PaymentMethod,
    requestedDate: string,
    requestedTime: string,
    transactionId?: string
  ): Order => {
    // SECURITY CHECK 1: Must be authenticated student
    if (!isAuthenticated || currentRole !== 'student') {
      throw new Error('Access denied. Student authentication is required before placing an order.');
    }

    if (cart.length === 0) throw new Error('Cart is empty');

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = subtotal;

    // Deduct stock from food items
    setFoodItems(prev =>
      prev.map(item => {
        const cartMatch = cart.find(c => c.foodId === item.foodId);
        if (cartMatch) {
          const newStock = Math.max(0, item.stock - cartMatch.quantity);
          return {
            ...item,
            stock: newStock,
            isAvailable: newStock > 0
          };
        }
        return item;
      })
    );

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderCount = orders.length + 1;
    const orderId = `SC${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(orderCount).padStart(3, '0')}`;
    const queueNum = `A-${20 + (orderCount % 80)}`;

    const newOrder: Order = {
      orderId,
      studentId: currentUser.studentId,
      studentName: currentUser.name,
      studentMobile: currentUser.mobile,
      items: [...cart],
      subtotal,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'UPI' ? 'PAID' : 'PENDING',
      transactionId: transactionId || (paymentMethod === 'UPI' ? `UPI-${Math.floor(100000000 + Math.random() * 900000000)}` : undefined),
      requestedReadyDate: requestedDate,
      requestedReadyTime: requestedTime,
      priority: 'NORMAL',
      orderStatus: 'Waiting for Confirmation',
      queueNumber: queueNum,
      createdAt: formattedTime,
      historyTimeline: [
        { status: 'Order Placed', timestamp: formattedTime, note: `Placed via ${paymentMethod}` },
        { status: 'Waiting for Confirmation', timestamp: formattedTime }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Async call to Spring Boot API
    apiPlaceOrder({
      items: cart.map(i => ({ foodId: i.foodId, quantity: i.quantity })),
      paymentMethod,
      requestedReadyDate: requestedDate,
      requestedReadyTime: requestedTime,
      priority: 'NORMAL'
    });

    // User-Specific Notifications
    addNotification(
      currentUser.studentId,
      '🎉 Order Placed Successfully!',
      `Your order #${orderId} has been placed. Queue: ${queueNum}. Ready time: ${requestedTime}`,
      'order_placed',
      orderId
    );

    addNotification(
      'admin',
      '🔔 New Order Received',
      `New order #${orderId} from ${currentUser.name} (Total: ₹${totalAmount}). Requested ready at ${requestedTime}`,
      'order_placed',
      orderId
    );

    return newOrder;
  };

  // Admin Actions
  const acceptOrder = (orderId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders(prev =>
      prev.map(ord => {
        if (ord.orderId === orderId) {
          const updated: Order = {
            ...ord,
            orderStatus: 'Order Accepted',
            acceptedAt: now,
            historyTimeline: [
              ...ord.historyTimeline,
              { status: 'Order Accepted', timestamp: now, note: 'Accepted by canteen staff' }
            ]
          };
          addNotification(
            ord.studentId,
            '✅ Order Accepted',
            `Your order #${ord.orderId} has been accepted by the canteen. Ready time: ${ord.requestedReadyTime}`,
            'order_accepted',
            ord.orderId
          );
          return updated;
        }
        return ord;
      })
    );
  };

  const rejectOrder = (orderId: string, reason: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders(prev =>
      prev.map(ord => {
        if (ord.orderId === orderId) {
          const isUpi = ord.paymentMethod === 'UPI';
          const updated: Order = {
            ...ord,
            orderStatus: 'Rejected',
            paymentStatus: isUpi ? 'REFUNDED' : 'FAILED',
            rejectionReason: reason,
            refundInfo: isUpi ? {
              refundId: `RF-${Math.floor(100000 + Math.random() * 900000)}`,
              amount: ord.totalAmount,
              status: 'COMPLETED',
              initiatedAt: now,
              completedAt: now,
              refundTransactionId: `REF-${Math.floor(1000000000 + Math.random() * 9000000000)}`
            } : undefined,
            historyTimeline: [
              ...ord.historyTimeline,
              { status: 'Rejected', timestamp: now, note: `Reason: ${reason}` }
            ]
          };

          addNotification(
            ord.studentId,
            '❌ Order Rejected',
            `Your order #${ord.orderId} was rejected by canteen. Reason: ${reason}. ${isUpi ? `₹${ord.totalAmount} refund completed!` : ''}`,
            'order_rejected',
            ord.orderId
          );

          return updated;
        }
        return ord;
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders(prev =>
      prev.map(ord => {
        if (ord.orderId === orderId) {
          const updated = { ...ord, orderStatus: status };
          if (status === 'Preparing') {
            updated.preparingAt = now;
            addNotification(
              ord.studentId,
              '👨‍🍳 Preparing Your Food',
              `Chef has started preparing order #${ord.orderId}. Get ready for pickup soon!`,
              'order_preparing',
              ord.orderId
            );
          } else if (status === 'Ready for Pickup') {
            updated.readyAt = now;
            addNotification(
              ord.studentId,
              '🔔 Your Food is Ready!',
              `Order #${ord.orderId} is hot and ready at the counter! Queue: ${ord.queueNumber}`,
              'order_ready',
              ord.orderId
            );
          } else if (status === 'Completed') {
            updated.completedAt = now;
            if (ord.paymentMethod === 'Cash') {
              updated.paymentStatus = 'PAID';
            }
            addNotification(
              ord.studentId,
              '🎉 Order Completed',
              `Order #${ord.orderId} collected. Thank you! Enjoy your meal!`,
              'order_completed',
              ord.orderId
            );
          }

          updated.historyTimeline = [
            ...ord.historyTimeline,
            { status, timestamp: now }
          ];

          return updated;
        }
        return ord;
      })
    );
  };

  const cancelOrder = (orderId: string) => {
    rejectOrder(orderId, 'Cancelled by student');
  };

  // Food Management
  const addFoodItem = (newItem: Omit<FoodItem, 'foodId'>) => {
    const foodId = 'F' + (100 + foodItems.length + 1);
    setFoodItems(prev => [...prev, { ...newItem, foodId }]);
  };

  const updateFoodItem = (updated: FoodItem) => {
    setFoodItems(prev => prev.map(item => item.foodId === updated.foodId ? updated : item));
  };

  const deleteFoodItem = (foodId: string) => {
    setFoodItems(prev => prev.filter(item => item.foodId !== foodId));
  };

  const toggleFoodAvailability = (foodId: string) => {
    setFoodItems(prev =>
      prev.map(item => item.foodId === foodId ? { ...item, isAvailable: !item.isAvailable } : item)
    );
  };

  // Config Update
  const updateCanteenConfig = (partialConfig: Partial<CanteenConfig>) => {
    setCanteenConfig(prev => ({ ...prev, ...partialConfig }));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.notificationId === id ? { ...n, readStatus: true } : n)
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, readStatus: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Purge all user data from client storage, state, and server
  const clearAllUserData = async (): Promise<void> => {
    try {
      await fetch('/api/auth/clear-user-data', { method: 'POST' }).catch(() => {});
    } catch {
      // offline safe
    }
    try {
      localStorage.removeItem('quickserve_user');
      localStorage.removeItem('smart_canteen_cart');
      localStorage.removeItem('smart_canteen_favs');
      localStorage.removeItem('smart_canteen_orders');
      sessionStorage.clear();
    } catch {
      // safe
    }
    clearAuthToken();
    setIsAuthenticated(false);
    setCurrentUser(INITIAL_STUDENT);
    setAuthTokenState(null);
    setOrders([]);
    setCart([]);
    setFavorites([]);
    setNotifications([]);
  };

  // Reorder
  const reorderItems = (order: Order) => {
    order.items.forEach(item => {
      const foodMatch = foodItems.find(f => f.foodId === item.foodId);
      if (foodMatch && foodMatch.isAvailable && foodMatch.stock > 0) {
        addToCart(foodMatch, item.quantity);
      }
    });
  };

  // Derived Values
  const activeOrder = orders.find(
    o => o.studentId === currentUser.studentId &&
    ['Order Placed', 'Waiting for Confirmation', 'Order Accepted', 'Preparing', 'Ready for Pickup'].includes(o.orderStatus)
  ) || null;

  const userNotifications = notifications.filter(
    n => currentRole === 'admin' ? n.recipientId === 'admin' : n.recipientId === currentUser.studentId
  );

  const unreadNotificationCount = userNotifications.filter(n => !n.readStatus).length;

  return (
    <CanteenContext.Provider
      value={{
        isAuthenticated,
        currentRole,
        currentUser,
        authToken,
        canteenConfig,
        foodItems,
        orders,
        notifications: userNotifications,
        cart,
        favorites,
        isCanteenOpen,
        activeOrder,
        unreadNotificationCount,

        loginStudent,
        registerStudent,
        loginAdmin,
        registerAdmin,
        logoutUser,
        forgotPassword,
        resetPassword,
        checkOriginalEmail,
        sendEmailVerificationCode,
        verifyEmailCode,
        getSentEmails,

        switchRole,
        loginUser,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleFavorite,
        placeOrder,
        acceptOrder,
        rejectOrder,
        updateOrderStatus,
        cancelOrder,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        toggleFoodAvailability,
        updateCanteenConfig,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        reorderItems,
        checkFoodItemAvailableNow,
        clearAllUserData
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error('useCanteen must be used within CanteenProvider');
  }
  return context;
};

export interface CampusInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail?: string;
}

export const CampusInboxModal: React.FC<CampusInboxModalProps> = ({ isOpen, onClose, targetEmail }) => {
  const { getSentEmails, currentUser } = useCanteen();
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeEmailFilter = targetEmail || (currentUser?.email !== 'guest@aaacet.ac.in' ? currentUser?.email : undefined);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const data = await getSentEmails(activeEmailFilter);
      setEmails(data || []);
      if (data && data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch {
      // offline safe
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen, activeEmailFilter]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh] max-h-[700px]"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100">
                <Inbox size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold">Campus Mail Delivery Viewer</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {activeEmailFilter ? `Inbox for ${activeEmailFilter}` : 'Official AAACET Canteen Communications'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchEmails}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Refresh Emails"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body with Sidebar and Email View */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* List */}
            <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-2 space-y-1.5">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Mail size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">No emails yet</p>
                  <p className="mt-1">Messages sent to your college email (Welcome emails, OTP codes) will appear here instantly.</p>
                </div>
              ) : (
                emails.map(em => {
                  const isSelected = selectedEmail?.id === em.id;
                  const isWelcome = em.type === 'welcome';
                  const isReset = em.type === 'password_reset';

                  return (
                    <button
                      key={em.id}
                      onClick={() => setSelectedEmail(em)}
                      className={`w-full text-left p-3 rounded-2xl transition border ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-xs'
                          : 'bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
                            isWelcome
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : isReset
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                          }`}
                        >
                          {isWelcome && <Sparkles size={10} />}
                          {isReset && <KeyRound size={10} />}
                          {!isWelcome && !isReset && <ShieldCheck size={10} />}
                          {em.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(em.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {em.subject}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        To: {em.to}
                      </p>

                      {em.code && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-[11px] font-mono font-bold rounded-md">
                          <span>Code: {em.code}</span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Email Viewer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-900">
              {selectedEmail ? (
                <div className="space-y-4">
                  <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {selectedEmail.subject}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span><strong>From:</strong> QuickServe Campus Mail (canteen@aaacet.ac.in)</span>
                          <span>•</span>
                          <span><strong>To:</strong> {selectedEmail.to}</span>
                          <span>•</span>
                          <span>{new Date(selectedEmail.sentAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {selectedEmail.code && (
                        <button
                          onClick={() => handleCopy(selectedEmail.code)}
                          className="shrink-0 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          {copiedCode === selectedEmail.code ? (
                            <>
                              <Check size={14} className="text-emerald-400 dark:text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* HTML preview card */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 p-2 sm:p-4">
                    <div
                      className="text-sm bg-white dark:bg-slate-900 rounded-xl p-4 overflow-x-auto text-slate-800 dark:text-slate-200"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8 text-slate-400">
                  <p className="text-xs">Select an email on the left to read its contents.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

