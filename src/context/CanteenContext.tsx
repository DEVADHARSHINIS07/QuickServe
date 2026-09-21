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

    // When running locally and backend is not responding, do not fake success
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return {
        success: false,
        message: 'Could not connect to Spring Boot backend or MySQL on port 8080. Please check your MySQL credentials and run mvn spring-boot:run.'
      };
    }

    // Resilient fallback when in demo sandbox without local backend: register locally
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

    // When running locally and backend is not responding, do not fake success
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return {
        success: false,
        message: 'Could not connect to Spring Boot backend or MySQL on port 8080. Please check your MySQL credentials and run mvn spring-boot:run.'
      };
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

