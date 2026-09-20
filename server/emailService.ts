import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  type: "verification" | "welcome" | "password_reset" | "security_alert";
  code?: string;
  sentAt: string;
}

const DB_DIR = path.join(process.cwd(), "database");
const EMAILS_FILE = path.join(DB_DIR, "emails.json");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// In-memory cache & persistent storage
let emailsCache: SentEmail[] = [];

function loadEmails(): SentEmail[] {
  try {
    if (fs.existsSync(EMAILS_FILE)) {
      const data = fs.readFileSync(EMAILS_FILE, "utf-8");
      emailsCache = JSON.parse(data);
      return emailsCache;
    }
  } catch (err) {
    console.error("Error reading emails.json:", err);
  }
  emailsCache = [];
  return [];
}

function saveEmails(emails: SentEmail[]) {
  try {
    fs.writeFileSync(EMAILS_FILE, JSON.stringify(emails, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving emails.json:", err);
  }
}

// Load initial emails
loadEmails();

// In-memory store for OTPs
interface CodeRecord {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}
const emailVerificationCodes = new Map<string, CodeRecord>();
const passwordResetCodes = new Map<string, CodeRecord>();
const verifiedEmails = new Set<string>();

// Gmail / SMTP Transporter
let cachedTransporter: any = null;
let transporterInitialized = false;

async function getSmtpTransporter(): Promise<any> {
  if (transporterInitialized) {
    return cachedTransporter;
  }

  try {
    const nodemailerModule = await import("nodemailer").catch(() => null);
    if (nodemailerModule) {
      const nm = (nodemailerModule as any).default || nodemailerModule;

      // 1. Direct Gmail Configuration (Google Workspace or personal Gmail)
      const gmailUser = process.env.GMAIL_USER;
      const gmailPass = process.env.GMAIL_APP_PASSWORD;

      if (gmailUser && gmailPass) {
        cachedTransporter = nm.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });
        console.log(`[QuickServe Email Engine] Gmail Transporter successfully initialized for ${gmailUser}`);
      } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // 2. Custom SMTP host
        cachedTransporter = nm.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        console.log(`[QuickServe Email Engine] SMTP Transporter initialized with host ${process.env.SMTP_HOST}`);
      } else {
        console.log("[QuickServe Email Engine] No SMTP/Gmail credentials configured in .env. Email dispatch simulated and logged to console.");
      }
    }
  } catch (err: any) {
    console.warn("[QuickServe Email Engine] Failed to initialize email transporter:", err?.message || err);
  }

  transporterInitialized = true;
  return cachedTransporter;
}

/**
 * Validates whether an email is strictly an original, authentic college email
 * from AAA College of Engineering and Technology (aaacet.ac.in).
 */
export function validateOriginalCollegeEmail(email: string): {
  isOriginal: boolean;
  reason?: string;
  cleanEmail: string;
  studentRoll?: string;
} {
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanEmail) {
    return { isOriginal: false, reason: "Email address is required.", cleanEmail };
  }

  // Check email standard format RFC 5322 basic pattern
  const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!basicEmailRegex.test(cleanEmail)) {
    return { isOriginal: false, reason: "Invalid email syntax format.", cleanEmail };
  }

  const [localPart, domainPart] = cleanEmail.split("@");

  // Reject public, commercial, or temporary/disposable domains
  const blockedDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "protonmail.com",
    "tempmail.com",
    "mailinator.com",
    "guerrillamail.com",
    "10minutemail.com",
    "trashmail.com",
    "sharklasers.com",
    "yopmail.com",
  ];

  if (blockedDomains.includes(domainPart)) {
    return {
      isOriginal: false,
      reason: `Original college email required. "${domainPart}" is not permitted; please use your official @aaacet.ac.in address.`,
      cleanEmail,
    };
  }

  // Must strictly be from the official college domain
  if (domainPart !== "aaacet.ac.in") {
    return {
      isOriginal: false,
      reason: `Email domain must be @aaacet.ac.in (AAA College of Engineering and Technology). Provided: @${domainPart}`,
      cleanEmail,
    };
  }

  // Validate local-part (student roll number format or official staff handle)
  // Student roll numbers at AAACET: e.g. 24urcs029, 23uece012, 22ueee005, 24uad015, etc.
  const isStudentRoll = /^[0-9]{2}[a-z]{2,5}[0-9]{2,4}$/i.test(localPart);
  const isStaffHandle = /^[a-z]{3,20}(\.[a-z]{1,20})?$/i.test(localPart);

  if (!isStudentRoll && !isStaffHandle && localPart !== "admin") {
    return {
      isOriginal: false,
      reason: `Email local format "${localPart}" does not match the official AAACET student roll number (e.g. 24urcs029@aaacet.ac.in) or faculty username.`,
      cleanEmail,
    };
  }

  return {
    isOriginal: true,
    cleanEmail,
    studentRoll: isStudentRoll ? localPart.toUpperCase() : undefined,
  };
}

/**
 * Dispatches an email, saves to storage, and attempts SMTP delivery if configured
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
  type: SentEmail["type"],
  code?: string
): Promise<SentEmail> {
  const emailRecord: SentEmail = {
    id: `EML_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    to: to.toLowerCase().trim(),
    subject,
    html,
    text,
    type,
    code,
    sentAt: new Date().toISOString(),
  };

  // Prepend to storage
  emailsCache.unshift(emailRecord);
  if (emailsCache.length > 200) emailsCache.pop();
  saveEmails(emailsCache);

  console.log(`[QuickServe Email Engine] Dispatching "${subject}" to ${to}`);
  if (code) {
    console.log(`[QuickServe Email Engine] >>> SECURITY CODE: [ ${code} ] <<<`);
  }

  // Send real email if SMTP is configured
  const activeTransporter = await getSmtpTransporter();
  if (activeTransporter) {
    try {
      await activeTransporter.sendMail({
        from: `"QuickServe Smart Canteen" <${process.env.GMAIL_USER || process.env.SMTP_FROM || process.env.SMTP_USER || "canteen@aaacet.ac.in"}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`[QuickServe Email Engine] SMTP Email successfully delivered to ${to}`);
    } catch (err) {
      console.warn(`[QuickServe Email Engine] SMTP send failed; falling back to digital inbox:`, err);
    }
  }

  return emailRecord;
}

/**
 * Feature 1: Email Verification Code (OTP) to prove email is original
 */
export async function sendEmailVerificationCode(
  email: string,
  studentName?: string
): Promise<{ success: boolean; message: string; code: string; isOriginal: boolean }> {
  const validation = validateOriginalCollegeEmail(email);
  if (!validation.isOriginal) {
    return {
      success: false,
      message: validation.reason || "Invalid college email.",
      code: "",
      isOriginal: false,
    };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  emailVerificationCodes.set(validation.cleanEmail, {
    code,
    email: validation.cleanEmail,
    expiresAt,
    attempts: 0,
  });

  const displayName = studentName || (validation.studentRoll ? `Student ${validation.studentRoll}` : "Student");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
      <div style="background: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">QuickServe Smart Canteen</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">AAA College of Engineering and Technology</p>
      </div>
      <div style="padding: 28px;">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0;">Original Email Verification</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Hello <strong>${displayName}</strong>,<br/><br/>
          To confirm your official AAA College email address (<strong>${validation.cleanEmail}</strong>), please enter the 6-digit verification code below:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #f8fafc; border: 2px dashed #0f172a; border-radius: 12px; padding: 16px 36px;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: monospace;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for 15 minutes. Do not share this code with anyone.</p>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          This code verifies that you are the legitimate owner of this original college mail domain account. If you did not request this verification, please disregard this email.
        </p>
      </div>
      <div style="background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        QuickServe Campus Portal • AAA College Canteen, Kamarajar Educational Road, Amathur
      </div>
    </div>
  `;

  const text = `QuickServe Smart Canteen - AAA College\n\nYour 6-digit email verification code is: ${code}\nValid for 15 minutes.\nUse this code to verify your original college email (${validation.cleanEmail}).`;

  await sendEmail(
    validation.cleanEmail,
    `[QuickServe] Verification Code: ${code} - Verify your College Email`,
    html,
    text,
    "verification",
    code
  );

  return {
    success: true,
    message: `Verification code dispatched to ${validation.cleanEmail}. Please check your college inbox.`,
    code,
    isOriginal: true,
  };
}

export function verifyEmailCode(email: string, code: string): { success: boolean; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const record = emailVerificationCodes.get(cleanEmail);

  if (!record) {
    return { success: false, message: "No verification code requested for this email. Please click 'Send Code'." };
  }

  if (Date.now() > record.expiresAt) {
    emailVerificationCodes.delete(cleanEmail);
    return { success: false, message: "Verification code has expired. Please request a new code." };
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      emailVerificationCodes.delete(cleanEmail);
      return { success: false, message: "Too many failed attempts. Please request a new verification code." };
    }
    return { success: false, message: "Incorrect verification code. Please check your email and try again." };
  }

  // Validated!
  emailVerificationCodes.delete(cleanEmail);
  verifiedEmails.add(cleanEmail);

  return {
    success: true,
    message: "Email verified successfully! You have confirmed your original college email.",
  };
}

export function isEmailAlreadyVerified(email: string): boolean {
  return verifiedEmails.has(email.trim().toLowerCase());
}

/**
 * Feature 2: Send Welcome Email to User's Email
 */
export async function sendWelcomeEmail(
  toEmail: string,
  studentName: string,
  studentId: string
): Promise<SentEmail> {
  const cleanEmail = toEmail.trim().toLowerCase();
  const subject = `🎉 Welcome to QuickServe Smart Canteen, ${studentName}! (AAA College)`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
        <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 9999px; padding: 6px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.2);">
          Official Campus Canteen
        </div>
        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">Welcome to QuickServe!</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #cbd5e1;">AAA College of Engineering and Technology</p>
      </div>

      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0;">
          Hi ${studentName},
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Congratulations! Your student account has been successfully registered and verified with your official college email.
        </p>

        <!-- Student ID Card info block -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="color: #64748b; padding: 4px 0; font-weight: 600;">Student Name:</td>
              <td style="color: #0f172a; padding: 4px 0; font-weight: 700;">${studentName}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 4px 0; font-weight: 600;">Roll Number:</td>
              <td style="color: #0f172a; padding: 4px 0; font-weight: 700; font-family: monospace;">${studentId}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 4px 0; font-weight: 600;">Verified Email:</td>
              <td style="color: #0f172a; padding: 4px 0; font-weight: 700;">${cleanEmail}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 4px 0; font-weight: 600;">Account Status:</td>
              <td style="color: #16a34a; padding: 4px 0; font-weight: 700;">Active & Verified ✓</td>
            </tr>
          </table>
        </div>

        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 24px 0 12px 0;">What you can do with QuickServe:</h3>
        <ul style="font-size: 13px; color: #475569; line-height: 1.8; padding-left: 20px; margin: 0;">
          <li><strong>Skip Break-Time Queues:</strong> Order morning breakfast or afternoon lunch in advance.</li>
          <li><strong>Smart Pickup Slots:</strong> Choose exactly when you'll arrive to collect your hot meal.</li>
          <li><strong>Live Order Tracking:</strong> Track order preparation from "Placed" to "Ready for Pickup".</li>
          <li><strong>QR Code Counter Verification:</strong> Show your instant digital token at the canteen desk.</li>
        </ul>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #166534; font-weight: 700;">🕒 Campus Canteen Timings</h4>
          <p style="margin: 0; font-size: 12px; color: #15803d; line-height: 1.6;">
            • Breakfast: 08:00 AM – 09:30 AM<br/>
            • Lunch: 12:30 PM – 01:45 PM<br/>
            • Evening Snacks & Tea: 04:00 PM – 05:30 PM
          </p>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-bottom: 0;">
          Need assistance or menu recommendations? Visit the QuickServe counter or write back to us at canteen@aaacet.ac.in.
        </p>
      </div>

      <div style="background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        © 2026 QuickServe • AAA College of Engineering and Technology, Kamarajar Educational Road, Amathur
      </div>
    </div>
  `;

  const text = `Welcome to QuickServe Smart Canteen, ${studentName}!\n\nYour account has been successfully registered with ${cleanEmail}.\nRoll No: ${studentId}\n\nYou can now browse the menu, schedule meal orders, and skip the counter lines!\n\nCanteen Hours:\nBreakfast: 8:00 AM - 9:30 AM\nLunch: 12:30 PM - 1:45 PM\nSnacks: 4:00 PM - 5:30 PM\n\nAAA College Canteen`;

  return await sendEmail(cleanEmail, subject, html, text, "welcome");
}

/**
 * Feature 3: Forgot Password Work by Have Code from Email
 */
export async function sendPasswordResetCode(
  email: string
): Promise<{ success: boolean; message: string; code: string }> {
  const validation = validateOriginalCollegeEmail(email);
  if (!validation.isOriginal) {
    return {
      success: false,
      message: validation.reason || "Please enter a valid original @aaacet.ac.in college email.",
      code: "",
    };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  passwordResetCodes.set(validation.cleanEmail, {
    code,
    email: validation.cleanEmail,
    expiresAt,
    attempts: 0,
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
      <div style="background: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">QuickServe Smart Canteen</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">AAA College of Engineering and Technology</p>
      </div>
      <div style="padding: 28px;">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #0f172a;">Password Reset Code</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          We received a request to reset the password for your QuickServe account (<strong>${validation.cleanEmail}</strong>).<br/><br/>
          Enter the 6-digit password reset code below to choose a new password:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #f8fafc; border: 2px dashed #0f172a; border-radius: 12px; padding: 16px 36px;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: monospace;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for 15 minutes. Never disclose this code to anyone.</p>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      <div style="background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        QuickServe Security Desk • AAA College of Engineering and Technology
      </div>
    </div>
  `;

  const text = `QuickServe Password Reset\n\nYour 6-digit password reset code is: ${code}\nValid for 15 minutes.\nAccount: ${validation.cleanEmail}`;

  await sendEmail(
    validation.cleanEmail,
    `[QuickServe] Password Reset Code: ${code}`,
    html,
    text,
    "password_reset",
    code
  );

  return {
    success: true,
    message: `Password reset code sent to ${validation.cleanEmail}. Please check your college email inbox.`,
    code,
  };
}

export function verifyPasswordResetCode(
  email: string,
  code: string
): { success: boolean; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const record = passwordResetCodes.get(cleanEmail);

  if (!record) {
    return { success: false, message: "No reset code requested for this email. Please request a code first." };
  }

  if (Date.now() > record.expiresAt) {
    passwordResetCodes.delete(cleanEmail);
    return { success: false, message: "Reset code has expired. Please request a new code." };
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      passwordResetCodes.delete(cleanEmail);
      return { success: false, message: "Too many failed attempts. Please request a new reset code." };
    }
    return { success: false, message: "Invalid 6-digit reset code. Please check your email and try again." };
  }

  // Consume code
  passwordResetCodes.delete(cleanEmail);
  return { success: true, message: "Code verified successfully." };
}

/**
 * Sends a confirmation email after password reset
 */
export async function sendPasswordChangedConfirmation(
  toEmail: string,
  studentName?: string
): Promise<SentEmail> {
  const cleanEmail = toEmail.trim().toLowerCase();
  const subject = `🔒 QuickServe Security Alert: Your Password Was Changed`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
      <div style="background: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">QuickServe Security Alert</h1>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Hello ${studentName || "Student"},<br/><br/>
          Your password for QuickServe Smart Canteen account (<strong>${cleanEmail}</strong>) was successfully changed on ${new Date().toLocaleString()}.
        </p>
        <p style="font-size: 13px; color: #64748b;">
          If you made this change, no further action is needed. If you did not make this change, please contact canteen administration immediately.
        </p>
      </div>
    </div>
  `;
  const text = `Your QuickServe password for ${cleanEmail} was successfully changed on ${new Date().toLocaleString()}.`;
  return await sendEmail(cleanEmail, subject, html, text, "security_alert");
}

/**
 * Returns sent emails (useful for in-app inspection of sent verification codes, welcome emails, etc.)
 */
export function getSentEmails(filterEmail?: string): SentEmail[] {
  if (!filterEmail) {
    return emailsCache;
  }
  const clean = filterEmail.trim().toLowerCase();
  return emailsCache.filter((e) => e.to === clean);
}
