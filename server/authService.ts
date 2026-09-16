import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface UserRecord {
  id: string;
  userId: string;
  studentId: string;
  name: string;
  email: string;
  mobile: string;
  role: "student" | "admin";
  salt: string;
  passwordHash: string;
  accountStatus: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface SafeUser {
  id: string;
  userId: string;
  studentId: string;
  name: string;
  email: string;
  mobile: string;
  role: "student" | "admin";
  accountStatus: "active" | "inactive";
}

const JWT_SECRET = process.env.JWT_SECRET || "quickserve_smart_canteen_jwt_secret_key_2026";
const DB_DIR = path.join(process.cwd(), "database");
const USERS_FILE = path.join(DB_DIR, "users.json");

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Password Hashing via Scrypt & Random Salt
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    if (crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"))) {
      return true;
    }
    // Also accept case-insensitive variants for demo ease
    const lowerHash = crypto.scryptSync(password.toLowerCase(), salt, 64).toString("hex");
    if (crypto.timingSafeEqual(Buffer.from(lowerHash, "hex"), Buffer.from(expectedHash, "hex"))) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// JWT Token Generator and Verifier
export function generateToken(payload: { userId: string; studentId: string; email: string; role: string; name: string }): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days validity
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const b64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${b64Header}.${b64Payload}`).digest("base64url");

  return `${b64Header}.${b64Payload}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [b64Header, b64Payload, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${b64Header}.${b64Payload}`).digest("base64url");
    if (expectedSig !== signature) return null;

    const payload = JSON.parse(Buffer.from(b64Payload, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Load and persist users
let usersCache: UserRecord[] = [];

function loadUsers(): UserRecord[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      const trimmed = data ? data.trim() : "";
      if (trimmed.length > 0) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            usersCache = parsed;
            return usersCache;
          }
        } catch {
          console.warn("Notice: users.json was invalid JSON. Initializing clean default state.");
        }
      }
    }
  } catch (err) {
    // Silently handle
  }

  // Seed only the administrative staff account; no student personal data
  const defaultAdminCred = hashPassword("Admin@123");

  const seeded: UserRecord[] = [
    {
      id: "USR_ADM001",
      userId: "ADM001",
      studentId: "ADM001",
      name: "QuickServe Canteen Admin",
      email: "admin@aaacet.ac.in",
      mobile: "+91 91234 56789",
      role: "admin",
      salt: defaultAdminCred.salt,
      passwordHash: defaultAdminCred.hash,
      accountStatus: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  usersCache = seeded;
  saveUsers(seeded);
  return usersCache;
}

function saveUsers(users: UserRecord[]): void {
  try {
    usersCache = users;
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const content = JSON.stringify(users, null, 2);
    // Write via temporary file for atomic write safety
    const tempFile = `${USERS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, content, "utf-8");
    fs.renameSync(tempFile, USERS_FILE);
  } catch {
    // Direct write fallback
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving users.json:", err);
    }
  }
}

// Initialize on load
loadUsers();

export function toSafeUser(user: UserRecord): SafeUser {
  return {
    id: user.id,
    userId: user.userId,
    studentId: user.studentId,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    accountStatus: user.accountStatus,
  };
}

export function findUserByEmail(email: string): UserRecord | null {
  const normEmail = email.trim().toLowerCase();
  return usersCache.find((u) => u.email.toLowerCase() === normEmail) || null;
}

export function findUserByStudentIdOrEmail(input: string): UserRecord | null {
  const norm = input.trim().toLowerCase();
  return (
    usersCache.find(
      (u) =>
        u.email.toLowerCase() === norm ||
        u.studentId.toLowerCase() === norm ||
        u.userId.toLowerCase() === norm
    ) || null
  );
}

export function findUserById(id: string): UserRecord | null {
  return usersCache.find((u) => u.id === id || u.userId === id || u.studentId === id) || null;
}

export function registerNewUser(data: {
  name: string;
  studentId: string;
  email: string;
  mobile: string;
  password: string;
  role?: "student" | "admin";
}): { user: UserRecord; token: string } {
  const normEmail = data.email.trim().toLowerCase();
  const sId = (data.studentId || normEmail.split("@")[0]).toUpperCase();

  const { salt, hash } = hashPassword(data.password);
  const newUser: UserRecord = {
    id: `USR_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: sId,
    studentId: sId,
    name: data.name.trim(),
    email: normEmail,
    mobile: data.mobile.trim(),
    role: data.role || "student",
    salt,
    passwordHash: hash,
    accountStatus: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  usersCache.push(newUser);
  saveUsers(usersCache);

  const token = generateToken({
    userId: newUser.userId,
    studentId: newUser.studentId,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  });

  return { user: newUser, token };
}

export function updatePassword(email: string, newPass: string): boolean {
  const normEmail = email.trim().toLowerCase();
  const index = usersCache.findIndex((u) => u.email.toLowerCase() === normEmail);
  if (index === -1) return false;

  const { salt, hash } = hashPassword(newPass);
  usersCache[index].salt = salt;
  usersCache[index].passwordHash = hash;
  usersCache[index].updatedAt = new Date().toISOString();
  saveUsers(usersCache);
  return true;
}

// Password Reset OTP Store
interface ResetEntry {
  email: string;
  otp: string;
  token: string;
  expiresAt: number;
}
const resetStore: Map<string, ResetEntry> = new Map();

export function generatePasswordReset(email: string): { otp: string; token: string } | null {
  const user = findUserByEmail(email);
  if (!user) return null;

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const token = `RST_${crypto.randomBytes(24).toString("hex")}`;
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  resetStore.set(token, { email: user.email, otp, token, expiresAt });
  resetStore.set(otp, { email: user.email, otp, token, expiresAt });

  return { otp, token };
}

export function verifyAndConsumeResetToken(tokenOrOtp: string): string | null {
  const entry = resetStore.get(tokenOrOtp.trim());
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    resetStore.delete(entry.token);
    resetStore.delete(entry.otp);
    return null;
  }

  // Valid
  const email = entry.email;
  resetStore.delete(entry.token);
  resetStore.delete(entry.otp);
  return email;
}

export function clearAllUserData(): { removedCount: number } {
  const initialCount = usersCache.length;
  // Retain only canteen administration accounts; remove all student/personal accounts
  usersCache = usersCache.filter((u) => u.role === "admin");
  saveUsers(usersCache);
  return { removedCount: initialCount - usersCache.length };
}

export function purgeAllUsers(): { removedCount: number } {
  const count = usersCache.length;
  usersCache = [];
  saveUsers([]);
  return { removedCount: count };
}

export function getDemoAccounts() {
  return [
    {
      role: "admin",
      email: "admin@aaacet.ac.in",
      password: "Admin@123",
      studentId: "ADM001",
      name: "QuickServe Canteen Admin",
      note: "Authorized Canteen Manager Account",
    },
  ];
}
