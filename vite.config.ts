import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-dev-fallback',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';

            // 1. Session verification fallback
            if (url.startsWith('/api/auth/me') || url.startsWith('/api/auth/verify')) {
              const authHeader = req.headers['authorization'];
              const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
              if (!token) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: false, message: 'Missing token' }));
              }
              try {
                const parts = token.split('.');
                let userPayload: any = {};
                if (parts.length === 3) {
                  userPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  success: true,
                  message: 'Session verified',
                  data: {
                    user: {
                      id: userPayload.userId || 'usr_student',
                      userId: userPayload.userId || 'usr_student',
                      studentId: userPayload.studentId || '24URCS029',
                      name: userPayload.name || 'AAA College Student',
                      email: userPayload.email || 'student@aaacet.ac.in',
                      mobile: userPayload.mobile || '+91 98765 43210',
                      role: userPayload.role || 'student',
                      accountStatus: 'active',
                    },
                  },
                }));
              } catch {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  success: true,
                  message: 'Session valid',
                  data: {
                    user: {
                      id: 'usr_student',
                      userId: 'usr_student',
                      studentId: '24URCS029',
                      name: 'AAA College Student',
                      email: 'student@aaacet.ac.in',
                      mobile: '+91 98765 43210',
                      role: 'student',
                      accountStatus: 'active',
                    },
                  },
                }));
              }
            }

            // 2. Payment create-order fallback
            if (url.startsWith('/api/payment/create-order')) {
              const urlObj = new URL(url, 'http://localhost');
              const amount = parseFloat(urlObj.searchParams.get('amount') || '100');
              const orderId = `order_${Math.random().toString(36).substring(2, 12)}`;
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                success: true,
                id: orderId,
                orderId: orderId,
                amount: Math.round(amount * 100),
                currency: 'INR',
                status: 'created',
                key: '',
                isLiveGateway: false,
                gatewayMode: 'canteen_upi',
                data: {
                  id: orderId,
                  orderId: orderId,
                  amount: Math.round(amount * 100),
                  currency: 'INR',
                  key: '',
                  isLiveGateway: false,
                  gatewayMode: 'canteen_upi',
                  canteenUpiId: 'canteen.aaacet@okaxis',
                },
              }));
            }

            // 3. Payment verification fallback
            if (url.startsWith('/api/payment/verify')) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                message: 'Canteen UPI / Razorpay payment verified successfully',
                transactionId: `UTR-${Date.now().toString().slice(-12)}`,
                status: 'PAID',
              }));
              return;
            }

            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      modulePreload: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
    server: {
      port: 5000,
      allowedHosts: true as const,
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
