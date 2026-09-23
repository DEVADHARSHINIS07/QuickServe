/**
 * QUICKSERVE SMART CANTEEN - SPRING BOOT REST API CLIENT
 * Connects React Frontend with Spring Boot Backend (Port 8080 / Proxy)
 * Enforces AAACET Domain Verification (@aaacet.ac.in) and Token Storage.
 */

/**
 * QUICKSERVE SMART CANTEEN - REST API CLIENT
 * Connects React Frontend with Backend (Spring Boot Port 8080 / Express Port 5000 / Proxy)
 * Enforces AAACET Domain Verification (@aaacet.ac.in) and Token Storage.
 * Auto-detects and bypasses port conflicts (e.g., macOS AirPlay on port 5000 returning 403).
 */

let resolvedApiBaseUrl: string | null = null;

export const getCandidateBaseUrls = (): string[] => {
  const urls: string[] = [];
  
  if (resolvedApiBaseUrl) {
    urls.push(resolvedApiBaseUrl);
  }

  // 1. Custom environment variable if explicitly configured (e.g. VITE_API_BASE_URL)
  const envUrl = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.trim();
  if (envUrl && !urls.includes(envUrl)) {
    const cleanEnv = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    if (!cleanEnv.includes(':5000')) {
      urls.push(cleanEnv);
    }
  }

  // 2. When running locally in the browser, probe Spring Boot backend on port 8080 first
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    urls.push('http://localhost:8080/api');
  }

  // 3. Relative path works with Vite proxy, Express dev server, and Cloud Run production
  urls.push('/api');

  return Array.from(new Set(urls));
};

// Token Storage Helpers
export const getAuthToken = (): string | null => {
  return localStorage.getItem('quickserve_jwt_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('quickserve_jwt_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('quickserve_jwt_token');
};

const getHeaders = (requiresAuth = true): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API Request Wrapper with Graceful Multi-Endpoint Fallback
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  requiresAuth = true
): Promise<{ success: boolean; message: string; data?: T; isBackendAvailable: boolean }> {
  const candidateBases = getCandidateBaseUrls();
  let lastErrorMessage = '';

  for (let i = 0; i < candidateBases.length; i++) {
    const baseUrl = candidateBases[i];
    const fullUrl = `${baseUrl}${endpoint}`;

    try {
      const options: RequestInit = {
        method,
        headers: getHeaders(requiresAuth),
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(fullUrl, options);

      // Handle macOS port 5000 AirPlay or misconfigured proxy returning non-JSON 403 Forbidden
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      let result: any = {};
      if (isJson) {
        try {
          result = await response.json();
        } catch {
          result = {};
        }
      }

      // If a non-backend server (like AirPlay on port 5000) returned raw 403 without our JSON payload,
      // try the next candidate backend URL
      if (response.status === 403 && !isJson && candidateBases.length > 1 && i < candidateBases.length - 1) {
        console.warn(`[API] Endpoint ${fullUrl} returned non-API 403 Forbidden (likely macOS AirPlay conflict on port 5000). Retrying with alternative backend...`);
        continue;
      }

      if (!response.ok) {
        // If this URL is 404 or connection failed and there are more candidates, try next
        if ((response.status === 404 || response.status === 502 || response.status === 503) && i < candidateBases.length - 1) {
          continue;
        }

        return {
          success: false,
          message: result.message || `Server returned status ${response.status}`,
          isBackendAvailable: response.status !== 404,
        };
      }

      // Successful connection: remember this working base URL
      resolvedApiBaseUrl = baseUrl;

      return {
        success: result.success !== false,
        message: result.message || 'Request successful',
        data: result.data,
        isBackendAvailable: true,
      };
    } catch (error) {
      lastErrorMessage = error instanceof Error ? error.message : 'Network error';
      // If there are other candidate URLs (e.g. trying port 8080 or 5000), try next
      if (i < candidateBases.length - 1) {
        continue;
      }
    }
  }

  // Fallback when backend is unreachable on all candidate endpoints
  if (endpoint !== '/auth/me' && endpoint !== '/auth/verify') {
    console.info(`[QuickServe API] Endpoint ${endpoint} unreachable. Using Client State fallback.`);
  }
  return {
    success: false,
    message: lastErrorMessage || 'Backend API unreachable. Ensure backend server is running.',
    isBackendAvailable: false,
  };
}

// 1. AUTHENTICATION REST APIS
export const apiStudentLogin = async (email: string, password: string) => {
  return apiRequest<any>('/auth/student/login', 'POST', { email, password }, false);
};

export const apiStudentRegister = async (data: {
  name: string;
  studentId: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword?: string;
}) => {
  return apiRequest<any>('/auth/student/register', 'POST', data, false);
};

export const apiAdminLogin = async (email: string, password: string) => {
  return apiRequest<any>('/auth/admin/login', 'POST', { email, password }, false);
};

export const apiAdminRegister = async (data: {
  name: string;
  email: string;
  mobile?: string;
  password: string;
  confirmPassword?: string;
}) => {
  return apiRequest<any>('/auth/admin/register', 'POST', data, false);
};

export const apiVerifySession = async () => {
  const token = getAuthToken();
  if (!token) {
    return {
      success: false,
      message: 'No active session token',
      isBackendAvailable: true,
    };
  }

  // Verify expiration timestamp from JWT payload locally first
  let tokenClaims: any = null;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      tokenClaims = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const nowSec = Math.floor(Date.now() / 1000);
      if (tokenClaims.exp && tokenClaims.exp < nowSec) {
        clearAuthToken();
        localStorage.removeItem('quickserve_user');
        return {
          success: false,
          message: 'Token has expired. Please sign in again.',
          isBackendAvailable: true,
        };
      }
    }
  } catch {
    // Non-standard token structure, proceed to server
  }

  const res = await apiRequest<{ user: any }>('/auth/me', 'GET', undefined, true);

  if (!res.success || (res as any).authenticated === false) {
    // If backend reports expired or invalid session, clear token to avoid repeating failed attempts
    clearAuthToken();
    localStorage.removeItem('quickserve_user');
  }

  return res;
};

export const apiGetDemoAccounts = async () => {
  return apiRequest<any[]>('/auth/demo-accounts', 'GET', undefined, false);
};

export const apiCheckOriginalEmail = async (email: string) => {
  return apiRequest<{
    isOriginal: boolean;
    reason?: string;
    cleanEmail: string;
    studentRoll?: string;
  }>('/auth/verify-email/check', 'POST', { email }, false);
};

export const apiSendEmailVerificationCode = async (email: string, studentName?: string) => {
  return apiRequest<{
    code: string;
    isOriginal: boolean;
  }>('/auth/verify-email/send-code', 'POST', { email, studentName }, false);
};

export const apiVerifyEmailCode = async (email: string, code: string) => {
  return apiRequest<void>('/auth/verify-email/verify-code', 'POST', { email, code }, false);
};

export const apiGetSentEmails = async (email?: string) => {
  const url = email ? `/emails?email=${encodeURIComponent(email)}` : '/emails';
  return apiRequest<any[]>(url, 'GET', undefined, false);
};

export const apiForgotPassword = async (email: string) => {
  return apiRequest<{ otp?: string; token?: string; code?: string; email?: string }>(
    '/auth/forgot-password',
    'POST',
    { email },
    false
  );
};

export const apiResetPassword = async (codeOrToken: string, newPassword: string, email?: string) => {
  return apiRequest<void>(
    '/auth/reset-password',
    'POST',
    { token: codeOrToken, otp: codeOrToken, code: codeOrToken, newPassword, email },
    false
  );
};

// 2. FOOD MENU REST APIS
export const apiFetchFoods = async () => {
  return apiRequest<any[]>('/foods', 'GET', undefined, false);
};

export const apiSearchFoods = async (query: string) => {
  return apiRequest<any[]>(`/foods/search?q=${encodeURIComponent(query)}`, 'GET', undefined, false);
};

// 3. ORDERS REST APIS
export const apiPlaceOrder = async (orderData: {
  items: { foodId: string; quantity: number }[];
  paymentMethod: string;
  requestedReadyDate: string;
  requestedReadyTime: string;
  priority: string;
}) => {
  return apiRequest<any>('/orders', 'POST', orderData, true);
};

export const apiFetchMyOrders = async () => {
  return apiRequest<any[]>('/orders/my-orders', 'GET', undefined, true);
};

export const apiCancelOrder = async (orderId: string) => {
  return apiRequest<any>(`/orders/${orderId}/cancel`, 'POST', undefined, true);
};

// 4. CANTEEN ADMIN REST APIS
export const apiFetchAdminDashboard = async () => {
  return apiRequest<any>('/admin/dashboard', 'GET', undefined, true);
};

export const apiFetchAdminOrders = async () => {
  return apiRequest<any[]>('/admin/orders', 'GET', undefined, true);
};

export const apiUpdateOrderStatus = async (orderId: string, status: 'accept' | 'preparing' | 'ready' | 'complete' | 'reject', reason?: string) => {
  const body = status === 'reject' ? { reason } : undefined;
  return apiRequest<any>(`/admin/orders/${orderId}/${status}`, 'PUT', body, true);
};

export const apiAddFood = async (foodData: any) => {
  return apiRequest<any>('/admin/foods', 'POST', foodData, true);
};

export const apiUpdateFood = async (foodId: string, foodData: any) => {
  return apiRequest<any>(`/admin/foods/${foodId}`, 'PUT', foodData, true);
};

export const apiDeleteFood = async (foodId: string) => {
  return apiRequest<void>(`/admin/foods/${foodId}`, 'DELETE', undefined, true);
};

// 5. NOTIFICATIONS REST APIS
export const apiFetchNotifications = async () => {
  return apiRequest<any[]>('/notifications', 'GET', undefined, true);
};

export const apiMarkNotificationRead = async (notificationId: string) => {
  return apiRequest<void>(`/notifications/${notificationId}/read`, 'PUT', undefined, true);
};

export const apiMarkAllNotificationsRead = async () => {
  return apiRequest<void>('/notifications/read-all', 'PUT', undefined, true);
};

// 6. PAYMENT REST APIS (Razorpay & UPI)
export const apiCreatePaymentOrder = async (amount: number) => {
  const queryParam = `?amount=${encodeURIComponent(amount)}`;
  const res = await apiRequest<any>(`/payment/create-order${queryParam}`, 'POST', { amount }, false);
  if (res.success && (res.data || (res as any).id)) {
    return res;
  }
  // Graceful client fallback for sandbox & offline mode
  const randomSuffix = (Math.random().toString(36).substring(2, 9) + Math.random().toString(36).substring(2, 9)).substring(0, 14);
  const fallbackOrderId = `order_${randomSuffix}`;
  return {
    success: true,
    message: 'Payment order initialized',
    data: {
      id: fallbackOrderId,
      orderId: fallbackOrderId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      key: '',
      isLiveGateway: false,
      gatewayMode: 'canteen_upi',
      canteenUpiId: 'canteen.aaacet@okaxis',
    },
    isBackendAvailable: res.isBackendAvailable,
  };
};

export const apiVerifyPayment = async (data: {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  utrNumber?: string;
}) => {
  return apiRequest<any>('/payment/verify', 'POST', data, false);
};

// 7. CLEAR / PURGE REGISTRATION DATA
export const apiClearAllRegistrationData = async () => {
  return apiRequest<{ removedCount?: number }>('/auth/clear-user-data', 'POST', {}, false);
};


