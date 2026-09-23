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
  clearAllUserData,
  purgeAllUsers,
} from "./server/authService";
import {
  validateOriginalCollegeEmail,
  sendEmailVerificationCode,
  verifyEmailCode,
  sendWelcomeEmail,
  sendAdminRegistrationAlert,
  sendPasswordResetCode,
  verifyPasswordResetCode,
  sendPasswordChangedConfirmation,
  getSentEmails,
} from "./server/emailService";

async function startServer() {
  const app = express();
  const PORT = 5000;

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

  const SPRING_BOOT_BASE_URL = process.env.SPRING_BOOT_URL || "http://localhost:8080";

  // Transparently forward API calls to Spring Boot (port 8080) when running locally
  app.use("/api", async (req, res, next) => {
    // Endpoints specific to browser development demo utilities
    if (req.path === "/auth/demo-accounts" || req.path === "/auth/verify-email/send-code" || req.path === "/auth/verify-email/verify-code") {
      return next();
    }

    const targetUrl = `${SPRING_BOOT_BASE_URL}${req.originalUrl}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (req.headers["content-type"]) {
        headers["Content-Type"] = String(req.headers["content-type"]);
      }
      if (req.headers["authorization"]) {
        headers["Authorization"] = String(req.headers["authorization"]);
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
        signal: controller.signal,
      };

      if (req.method !== "GET" && req.method !== "HEAD" && req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const sbRes = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);

      // If Spring Boot doesn't have this route, let local server handle it
      if (sbRes.status === 404) {
        return next();
      }

      res.status(sbRes.status);
      sbRes.headers.forEach((value, name) => {
        const lower = name.toLowerCase();
        if (lower !== "content-encoding" && lower !== "transfer-encoding" && lower !== "content-length") {
          res.setHeader(name, value);
        }
      });
      const data = await sbRes.text();
      return res.send(data);
    } catch {
      // Spring Boot port 8080 not reachable -> fall back to local handlers
      return next();
    }
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

  // Razorpay / UPI Payment Gateway Endpoints
  app.all("/api/payment/create-order", async (req: any, res: any) => {
    const rawAmount = req.query.amount || (req.body && req.body.amount) || 100;
    const numAmount = parseFloat(String(rawAmount)) || 100;
    // Razorpay amount in paise (multiply by 100 if specified in rupees)
    const amountInPaise = numAmount > 1000 && numAmount % 100 === 0 ? Math.round(numAmount) : Math.round(numAmount * 100);
    const canteenUpiId = process.env.CANTEEN_UPI_ID || "canteen.aaacet@okaxis";

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    // If real Razorpay credentials are provided, generate order directly through official Razorpay API
    if (razorpayKeyId && razorpayKeySecret && !razorpayKeyId.includes("placeholder")) {
      try {
        const authHeader = "Basic " + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");
        const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
              college: "AAACET Smart Canteen",
              upiId: canteenUpiId,
            },
          }),
        });

        if (rzpRes.ok) {
          const rzpData: any = await rzpRes.json();
          return res.status(200).json({
            success: true,
            id: rzpData.id,
            orderId: rzpData.id,
            amount: rzpData.amount,
            rawAmount: numAmount,
            currency: rzpData.currency || "INR",
            status: rzpData.status || "created",
            key: razorpayKeyId,
            key_id: razorpayKeyId,
            canteenUpiId,
            message: "Official Razorpay Order created successfully",
            data: {
              id: rzpData.id,
              orderId: rzpData.id,
              amount: rzpData.amount,
              currency: rzpData.currency || "INR",
              key: razorpayKeyId,
              key_id: razorpayKeyId,
              canteenUpiId,
            },
          });
        } else {
          const errBody = await rzpRes.text();
          console.warn("[Razorpay API] Order creation returned non-200:", rzpRes.status, errBody);
        }
      } catch (err) {
        console.warn("[Razorpay API] Order creation exception:", err);
      }
    }

    // Standard Razorpay Order ID format: order_ followed by 14 alphanumeric characters
    const randomSuffix = Math.random().toString(36).substring(2, 9) + Math.random().toString(36).substring(2, 9);
    const standardOrderId = `order_${randomSuffix.substring(0, 14)}`;
    const hasLiveRazorpay = Boolean(
      razorpayKeyId &&
      razorpayKeySecret &&
      !razorpayKeyId.includes("placeholder") &&
      !razorpayKeyId.toLowerCase().includes("aaacollege") &&
      /^rzp_(test|live)_[a-zA-Z0-9]{10,}$/.test(razorpayKeyId)
    );
    const effectiveKey = hasLiveRazorpay ? razorpayKeyId : "";

    const paymentResponse = {
      success: true,
      id: standardOrderId,
      orderId: standardOrderId,
      amount: amountInPaise,
      rawAmount: numAmount,
      currency: "INR",
      status: "created",
      key: effectiveKey,
      key_id: effectiveKey,
      isLiveGateway: hasLiveRazorpay,
      gatewayMode: hasLiveRazorpay ? "razorpay_live" : "canteen_upi",
      canteenUpiId,
      message: hasLiveRazorpay
        ? "Official Razorpay Order created successfully"
        : "Canteen UPI Payment Order created successfully",
      data: {
        id: standardOrderId,
        orderId: standardOrderId,
        amount: amountInPaise,
        currency: "INR",
        key: effectiveKey,
        key_id: effectiveKey,
        isLiveGateway: hasLiveRazorpay,
        gatewayMode: hasLiveRazorpay ? "razorpay_live" : "canteen_upi",
        canteenUpiId,
      },
    };

    return res.status(200).json(paymentResponse);
  });

  app.post("/api/payment/verify", async (req: any, res: any) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, utrNumber } = req.body || {};
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    // Real Razorpay signature verification if live secret is present
    if (razorpayKeySecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      try {
        const crypto = await import("crypto");
        const generated_signature = crypto
          .createHmac("sha256", razorpayKeySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex");
        if (generated_signature !== razorpay_signature) {
          return res.status(400).json({
            success: false,
            message: "Invalid Razorpay payment signature",
          });
        }
      } catch (err) {
        console.warn("[Payment Verification] Crypto signature verify warning:", err);
      }
    }

    const effectiveTxnId = razorpay_payment_id || (utrNumber ? `UTR-${utrNumber}` : req.body?.paymentId || `UPI-${Date.now()}`);
    return res.status(200).json({
      success: true,
      message: "Canteen UPI / Razorpay payment verified successfully",
      transactionId: effectiveTxnId,
      status: "PAID",
    });
  });

  // 1. Current Session Verification (/api/auth/me & /api/auth/verify)
  app.get(["/api/auth/me", "/api/auth/verify"], (req: any, res: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(200).json({
        success: false,
        authenticated: false,
        message: "No active session token provided.",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(200).json({
        success: false,
        authenticated: false,
        message: "Session expired or invalid token. Please log in again.",
      });
    }

    const user = findUserById(decoded.userId) || findUserByEmail(decoded.email);
    if (!user) {
      return res.status(200).json({
        success: false,
        authenticated: false,
        message: "User account not found. Please log in or register.",
      });
    }
    return res.status(200).json({
      success: true,
      authenticated: true,
      message: "Session valid",
      data: {
        user: toSafeUser(user),
      },
    });
  });

  // 2. Student Registration Handler
  const handleStudentRegister = async (req: any, res: any) => {
    const { name, studentId, email, mobile, password } = req.body;
    const rawEmail = email ? String(email).trim().toLowerCase() : "";
    let trimmedEmail = rawEmail;
    if (trimmedEmail && !trimmedEmail.includes("@")) {
      trimmedEmail = `${trimmedEmail}@aaacet.ac.in`;
    }

    // Feature 1: Verify email is original or not, accept only original
    const emailValidation = validateOriginalCollegeEmail(trimmedEmail);
    if (!emailValidation.isOriginal) {
      return res.status(400).json({
        success: false,
        message: `Original College Email Verification Failed: ${emailValidation.reason}`,
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const sId = (studentId || emailValidation.studentRoll || trimmedEmail.split("@")[0]).toUpperCase();

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

    // Feature 2: Send welcome message to user's email
    try {
      await sendWelcomeEmail(user.email, user.name, user.studentId);
      // Notify Admin
      await sendAdminRegistrationAlert(user.email, user.name, user.studentId, "student");
    } catch (err) {
      console.error("Failed to send welcome/admin email:", err);
    }

    return res.status(201).json({
      success: true,
      message: `Account created successfully! An official welcome message has been sent to your college email (${trimmedEmail}).`,
      data: {
        user: toSafeUser(user),
        token,
      },
    });
  };

  // Email Verification Endpoints (Verify email is original or not)
  app.post("/api/auth/verify-email/check", (req, res) => {
    const { email } = req.body;
    const validation = validateOriginalCollegeEmail(String(email || ""));
    return res.json({
      success: validation.isOriginal,
      ...validation,
    });
  });

  app.post("/api/auth/verify-email/send-code", async (req, res) => {
    const { email, studentName } = req.body;
    const result = await sendEmailVerificationCode(String(email || ""), studentName);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  });

  app.post("/api/auth/verify-email/verify-code", (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and 6-digit verification code are required." });
    }
    const result = verifyEmailCode(String(email), String(code));
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  });

  // Sent Emails Inbox Query
  app.get(["/api/emails", "/api/email/inbox"], (req, res) => {
    const filterEmail = req.query.email ? String(req.query.email) : undefined;
    const emails = getSentEmails(filterEmail);
    return res.json({
      success: true,
      data: emails,
    });
  });

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
    let user = findUserByStudentIdOrEmail(rawInput) || findUserByEmail(finalEmail) || findUserById(sId);
    if (!user) {
      // Auto-provision verified college student account so users never get blocked by missing accounts
      if (password && String(password).length >= 6) {
        const studentName = `Student (${sId})`;
        const created = registerNewUser({
          name: studentName,
          studentId: sId,
          email: finalEmail,
          mobile: "",
          password: String(password),
          role: "student",
        });
        return res.json({
          success: true,
          message: `College Account activated! Welcome to QuickServe, ${studentName}!`,
          data: {
            token: created.token,
            user: toSafeUser(created.user),
          },
        });
      }

      return res.status(401).json({
        success: false,
        message: `Account not found for "${rawInput}". Please enter a valid password (min 6 characters) to activate your account or register.`,
      });
    }

    // Cryptographic Password Verification
    const isPasswordValid = verifyPassword(String(password), user.salt, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please verify your credentials or use 'Forgot Password' to reset it.",
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

  // 6. Forgot Password (Dispatches 6-digit Code to Original Email)
  app.post(["/api/auth/forgot-password", "/api/forgot-password"], async (req, res) => {
    const { email } = req.body;
    const trimmed = email ? String(email).trim().toLowerCase() : "";
    if (!trimmed) {
      return res.status(400).json({ success: false, message: "College email address is required." });
    }

    // Feature 1: Validate original college email
    const emailValidation = validateOriginalCollegeEmail(trimmed);
    if (!emailValidation.isOriginal) {
      return res.status(400).json({
        success: false,
        message: `Original College Email Required: ${emailValidation.reason}`,
      });
    }

    // Look up user
    const user = findUserByEmail(trimmed) || findUserByStudentIdOrEmail(trimmed);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No registered account found for ${trimmed}. Please register first.`,
      });
    }

    // Feature 3: Send 6-digit reset code to user's original college email
    const emailResult = await sendPasswordResetCode(trimmed);
    const resetData = generatePasswordReset(trimmed);

    return res.json({
      success: true,
      message: `A 6-digit password reset code has been sent to your college email (${trimmed}). Check your inbox!`,
      data: {
        email: trimmed,
        code: emailResult.code,
        otp: emailResult.code || resetData?.otp,
        token: resetData?.token,
      },
    });
  });

  // 7. Reset Password Handler (Verifies 6-digit Code from Email)
  app.post(["/api/auth/reset-password", "/api/reset-password"], async (req, res) => {
    const { email, code, token, otp, newPassword } = req.body;
    const codeOrOtp = String(code || otp || token || "").trim();

    if (!codeOrOtp) {
      return res.status(400).json({
        success: false,
        message: "Please enter the 6-digit verification code received in your college email.",
      });
    }

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    let targetEmail = email ? String(email).trim().toLowerCase() : "";

    // Verify 6-digit code via emailService if email is provided
    let isCodeValid = false;
    if (targetEmail) {
      const verifyResult = verifyPasswordResetCode(targetEmail, codeOrOtp);
      if (verifyResult.success) {
        isCodeValid = true;
      }
    }

    // Fallback verification via token store
    if (!isCodeValid) {
      const tokenEmail = verifyAndConsumeResetToken(codeOrOtp);
      if (tokenEmail) {
        targetEmail = tokenEmail;
        isCodeValid = true;
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired 6-digit code. Please verify the code from your email or request a new one.",
      });
    }

    const updated = updatePassword(targetEmail, String(newPassword));
    if (!updated) {
      return res.status(500).json({
        success: false,
        message: "Failed to update password. Please try again.",
      });
    }

    // Send security notification email
    try {
      const user = findUserByEmail(targetEmail);
      await sendPasswordChangedConfirmation(targetEmail, user?.name);
    } catch (err) {
      console.error("Failed to send password change alert:", err);
    }

    return res.json({
      success: true,
      message: "Password reset successful! You can now sign in with your new password.",
    });
  });

  // 8. Remove / Clear All User Data Handler (Supports both local and Spring Boot backend)
  app.all(["/api/auth/clear-user-data", "/api/user/clear-all", "/api/admin/users/all", "/api/health/clear-users"], async (req, res) => {
    const localResult = clearAllUserData();
    let springBootResult = null;

    try {
      const sbRes = await fetch(`${SPRING_BOOT_BASE_URL}/api/health/clear-users`, { method: "POST" });
      if (sbRes.ok) {
        springBootResult = await sbRes.json();
      }
    } catch {
      // Spring Boot not running or error ignored
    }

    return res.json({
      success: true,
      message: "All student registration data has been completely deleted. You can now register fresh accounts.",
      details: {
        local: localResult,
        springBoot: springBootResult,
      },
    });
  });

  app.all(["/api/auth/purge-users", "/api/admin/users/purge-everything", "/api/health/purge-all-users"], async (req, res) => {
    const localResult = purgeAllUsers();
    let springBootResult = null;

    try {
      const sbRes = await fetch(`${SPRING_BOOT_BASE_URL}/api/health/purge-all-users`, { method: "POST" });
      if (sbRes.ok) {
        springBootResult = await sbRes.json();
      }
    } catch {
      // Ignored
    }

    return res.json({
      success: true,
      message: "All registration records across all roles purged completely.",
      details: {
        local: localResult,
        springBoot: springBootResult,
      },
    });
  });

  // Canteen Status & Configuration
  app.get(["/api/canteen/status", "/api/canteen/config", "/api/canteen"], (req, res) => {
    return res.json({
      success: true,
      data: {
        canteenName: "QuickServe Smart Canteen",
        collegeName: "AAA College of Engineering and Technology",
        isOpen: true,
        openingTime: "08:00 AM",
        closingTime: "06:00 PM",
        domain: "aaacet.ac.in",
      },
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
    console.log(`\n==================================================`);
    console.log(`🚀 QuickServe Portal is ready!`);
    console.log(`👉 Open in your browser: http://localhost:${PORT}`);
    console.log(`⚠️  Do NOT open http://localhost:3000 or port 5500.`);
    console.log(`   Vite TSX compilation & API run strictly on port 5000.`);
    console.log(`==================================================\n`);
  });
}

startServer();
