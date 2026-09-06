import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  findUserByEmail,
  findUserByStudentIdOrEmail,
  findUserById,
  registerNewUser,
  verifyPassword,
  generateToken,
  verifyToken,
  toSafeUser,
  updatePassword,
  generatePasswordReset,
  verifyAndConsumeResetToken,
  getDemoAccounts,
} from "./server/authService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware to authenticate requests via real JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied: Missing authentication token. Please sign in.",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid token. Please log in again.",
      });
    }

    req.user = decoded;
    next();
  };

  // Favicon handlers to prevent 404 or 500 errors
  app.get(["/favicon.ico", "/favicon.svg"], (req, res) => {
    const faviconPath = path.join(process.cwd(), "public", req.path === "/favicon.svg" ? "favicon.svg" : "favicon.ico");
    res.sendFile(faviconPath, (err) => {
      if (err) {
        res.status(204).end();
      }
    });
  });

  // API Health Check
  app.get(["/api/health", "/health"], (req, res) => {
    res.json({
      status: "ok",
      service: "QuickServe Smart Canteen Authentication API",
      auth: "Cryptographic Scrypt Hash + HMAC-SHA256 JWT Enabled",
    });
  });

  // Demo Accounts endpoint for testing
  app.get("/api/auth/demo-accounts", (req, res) => {
    res.json({
      success: true,
      data: getDemoAccounts(),
    });
  });

  // 1. Current Session Verification (/api/auth/me)
  app.get(["/api/auth/me", "/api/auth/verify"], authenticateToken, (req: any, res: any) => {
    const user = findUserById(req.user.userId) || findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile no longer exists.",
      });
    }
    return res.json({
      success: true,
      message: "Session valid",
      data: {
        user: toSafeUser(user),
      },
    });
  });

  // 2. Student Registration Handler
  const handleStudentRegister = (req: any, res: any) => {
    const { name, studentId, email, mobile, password } = req.body;
    const rawEmail = email ? String(email).trim().toLowerCase() : "";
    let trimmedEmail = rawEmail;
    if (trimmedEmail && !trimmedEmail.includes("@")) {
      trimmedEmail = `${trimmedEmail}@aaacet.ac.in`;
    }

    if (!trimmedEmail || !trimmedEmail.endsWith("@aaacet.ac.in")) {
      return res.status(400).json({
        success: false,
        message: "Access Denied: Registration requires an official @aaacet.ac.in college email address.",
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const sId = (studentId || trimmedEmail.split("@")[0]).toUpperCase();

    // Check if user already exists
    const existing = findUserByEmail(trimmedEmail) || findUserByStudentIdOrEmail(sId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `An account already exists for ${trimmedEmail} (Roll No: ${sId}). Please sign in instead.`,
      });
    }

    const { user, token } = registerNewUser({
      name: name || `Student (${sId})`,
      studentId: sId,
      email: trimmedEmail,
      mobile: mobile || "+91 98765 43210",
      password: String(password),
      role: "student",
    });

    return res.status(201).json({
      success: true,
      message: `Account created successfully for ${trimmedEmail}! Welcome to QuickServe.`,
      data: {
        user: toSafeUser(user),
        token,
      },
    });
  };

  // 3. Admin Registration Handler
  const handleAdminRegister = (req: any, res: any) => {
    const { name, email, mobile, password } = req.body;
    const trimmedEmail = email ? String(email).trim().toLowerCase() : "";
    if (!trimmedEmail || !trimmedEmail.endsWith("@aaacet.ac.in")) {
      return res.status(400).json({
        success: false,
        message: "Access Denied: Staff registration requires an authorized @aaacet.ac.in email.",
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Admin password must be at least 6 characters long.",
      });
    }

    const existing = findUserByEmail(trimmedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Staff account already registered for ${trimmedEmail}. Please log in.`,
      });
    }

    const adminId = `ADM_${Date.now().toString().slice(-4)}`;
    const { user, token } = registerNewUser({
      name: name || "QuickServe Canteen Admin",
      studentId: adminId,
      email: trimmedEmail,
      mobile: mobile || "+91 91234 56789",
      password: String(password),
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: `Canteen staff account registered for ${trimmedEmail}!`,
      data: {
        user: toSafeUser(user),
        token,
      },
    });
  };

  // Registration route aliases
  app.post("/api/auth/student/register", handleStudentRegister);
  app.post("/api/auth/register", handleStudentRegister);
  app.post("/api/register", handleStudentRegister);
  app.post("/api/student/register", handleStudentRegister);
  app.post("/api/auth/student/signup", handleStudentRegister);
  app.post("/api/auth/signup", handleStudentRegister);

  app.post("/api/auth/admin/register", handleAdminRegister);
  app.post("/api/admin/register", handleAdminRegister);

  // 4. Student Login Handler with Real Password Verification
  const handleStudentLogin = (req: any, res: any) => {
    const { email, password } = req.body;
    const rawInput = email ? String(email).trim().toLowerCase() : "";
    if (!rawInput) {
      return res.status(400).json({
        success: false,
        message: "Please enter your college email or student roll number.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your account password.",
      });
    }

    let finalEmail = rawInput;
    let sId = rawInput;

    if (rawInput.includes("@")) {
      if (!rawInput.endsWith("@aaacet.ac.in")) {
        return res.status(400).json({
          success: false,
          message: "Access Denied: Only AAA College email IDs ending with @aaacet.ac.in are permitted.",
        });
      }
      sId = rawInput.split("@")[0].toUpperCase();
    } else {
      finalEmail = `${rawInput}@aaacet.ac.in`;
      sId = rawInput.toUpperCase();
    }

    // Look up user in database
    const user = findUserByStudentIdOrEmail(rawInput) || findUserByEmail(finalEmail) || findUserById(sId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `Account not found for "${rawInput}". Please check your email/roll number or register a new student account.`,
      });
    }

    // Cryptographic Password Verification
    const isPasswordValid = verifyPassword(String(password), user.salt, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please verify your credentials and try again.",
      });
    }

    // Issue signed JWT
    const token = generateToken({
      userId: user.userId,
      studentId: user.studentId,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.json({
      success: true,
      message: `College Mail Verified! Welcome back, ${user.name}!`,
      data: {
        token,
        user: toSafeUser(user),
      },
    });
  };

  // 5. Admin Login Handler with Real Password Verification
  const handleAdminLogin = (req: any, res: any) => {
    const { email, password } = req.body;
    const trimmed = email ? String(email).trim().toLowerCase() : "";
    if (!trimmed) {
      return res.status(400).json({
        success: false,
        message: "Please enter staff admin email address.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your admin password.",
      });
    }

    const finalEmail = trimmed.includes("@") ? trimmed : `${trimmed}@aaacet.ac.in`;
    if (!finalEmail.endsWith("@aaacet.ac.in")) {
      return res.status(400).json({
        success: false,
        message: "Access Denied: Staff admin email must end with @aaacet.ac.in.",
      });
    }

    const user = findUserByEmail(finalEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `Admin account not found for "${finalEmail}".`,
      });
    }

    const isPasswordValid = verifyPassword(String(password), user.salt, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials: Incorrect password.",
      });
    }

    const token = generateToken({
      userId: user.userId,
      studentId: user.studentId,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.json({
      success: true,
      message: "Staff admin authenticated successfully!",
      data: {
        token,
        user: toSafeUser(user),
      },
    });
  };

  app.post("/api/auth/student/login", handleStudentLogin);
  app.post("/api/auth/login", handleStudentLogin);
  app.post("/api/login", handleStudentLogin);

  app.post("/api/auth/admin/login", handleAdminLogin);
  app.post("/api/admin/login", handleAdminLogin);

  // 6. Forgot Password (generates real OTP & Reset Token)
  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const trimmed = email ? String(email).trim().toLowerCase() : "";
    if (!trimmed) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const resetData = generatePasswordReset(trimmed);
    if (!resetData) {
      return res.status(404).json({
        success: false,
        message: `No registered account found for ${trimmed}.`,
      });
    }

    return res.json({
      success: true,
      message: `Password reset instructions and verification code sent to ${trimmed}.`,
      data: {
        token: resetData.token,
        otp: resetData.otp,
      },
    });
  });

  // 7. Reset Password Handler
  app.post("/api/auth/reset-password", (req, res) => {
    const { token, otp, newPassword } = req.body;
    const tokenOrOtp = token || otp;

    if (!tokenOrOtp) {
      return res.status(400).json({ success: false, message: "Reset token or OTP code is required." });
    }

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
    }

    const email = verifyAndConsumeResetToken(String(tokenOrOtp));
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token / OTP code. Please request a new code.",
      });
    }

    const updated = updatePassword(email, String(newPassword));
    if (!updated) {
      return res.status(500).json({ success: false, message: "Failed to update password." });
    }

    return res.json({
      success: true,
      message: "Password updated successfully! You can now sign in with your new credentials.",
    });
  });

  // Food Endpoints
  app.get(["/api/foods", "/api/food"], (req, res) => {
    return res.json({
      success: true,
      data: [],
    });
  });

  app.get("/api/foods/search", (req, res) => {
    return res.json({
      success: true,
      data: [],
    });
  });

  // Orders Endpoints
  app.post(["/api/orders", "/api/order"], (req, res) => {
    const orderData = req.body;
    const orderId = `SC${Date.now()}`;
    return res.json({
      success: true,
      message: "Order created successfully",
      data: { orderId, ...orderData },
    });
  });

  app.get("/api/orders/my-orders", (req, res) => {
    return res.json({
      success: true,
      data: [],
    });
  });

  app.post("/api/orders/:orderId/cancel", (req, res) => {
    return res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  });

  // Admin Endpoints
  app.get("/api/admin/dashboard", (req, res) => {
    return res.json({
      success: true,
      data: { totalOrders: 15, pendingOrders: 2, totalRevenue: 1850 },
    });
  });

  app.get("/api/admin/orders", (req, res) => {
    return res.json({
      success: true,
      data: [],
    });
  });

  app.put("/api/admin/orders/:orderId/:status", (req, res) => {
    return res.json({
      success: true,
      message: `Order status updated to ${req.params.status}`,
    });
  });

  app.post("/api/admin/foods", (req, res) => {
    return res.json({
      success: true,
      message: "Food item added successfully",
    });
  });

  app.put("/api/admin/foods/:foodId", (req, res) => {
    return res.json({
      success: true,
      message: "Food item updated successfully",
    });
  });

  app.delete("/api/admin/foods/:foodId", (req, res) => {
    return res.json({
      success: true,
      message: "Food item deleted successfully",
    });
  });

  // Notifications
  app.get("/api/notifications", (req, res) => {
    return res.json({
      success: true,
      data: [],
    });
  });

  app.put("/api/notifications/:id/read", (req, res) => {
    return res.json({ success: true });
  });

  app.put("/api/notifications/read-all", (req, res) => {
    return res.json({ success: true });
  });

  // Catch-all for API route 404s
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.path} not found.`,
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
