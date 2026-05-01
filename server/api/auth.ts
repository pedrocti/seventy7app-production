// src/api/auth.ts (backend - Express router)
import { db, users } from "../db/connection.js";
import { eq, and, sql } from "drizzle-orm";
import { transactions, email_verification_tokens } from "../db/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/email.service";
import { generateToken, getExpiry } from "../utils/token";
import { Router, Request, Response, NextFunction } from "express";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ✅ Safe FRONTEND_URL
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL must be defined");
}

console.log("AUTH ROUTES LOADED");

// ==============================
// Middleware to validate JWT
// ==============================
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

// ==============================
// GET /auth/me → return logged-in user info
// ==============================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        first_name: users.first_name,
        last_name: users.last_name,
        balance: users.balance,
        bonus_balance: users.bonus_balance,
        referral_code: users.referral_code,
        referred_by: users.referred_by,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        balance: parseFloat(user.balance),
        bonusBalance: parseFloat(user.bonus_balance),
        referral_code: user.referral_code ?? "",
        referred_by: user.referred_by,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error("GET /auth/me error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==============================
// REGISTER
// ==============================
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, ref } = req.body;

    if (!firstName?.trim()) return res.status(400).json({ error: "First name is required" });
    if (!lastName?.trim()) return res.status(400).json({ error: "Last name is required" });
    if (!username?.trim()) return res.status(400).json({ error: "Username is required" });
    if (!email?.trim()) return res.status(400).json({ error: "Email is required" });
    if (!password?.trim()) return res.status(400).json({ error: "Password is required" });

    if (firstName.trim().length < 2) return res.status(400).json({ error: "First name is too short" });
    if (lastName.trim().length < 2) return res.status(400).json({ error: "Last name is too short" });
    if (username.trim().length < 3) return res.status(400).json({ error: "Username must be at least 3 characters" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return res.status(400).json({ error: "Invalid email format" });

    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.trim()))
      .limit(1);
    if (existingUsername) return res.status(400).json({ error: "Username already exists" });

    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim()))
      .limit(1);
    if (existingEmail) return res.status(400).json({ error: "Email is already registered" });

    const hash = await bcrypt.hash(password, 10);
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    let referred_by: number | null = null;
    let isReferred = false;
    if (ref?.trim()) {
      const [lookup] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referral_code, ref.trim().toUpperCase()))
        .limit(1);
      if (lookup) {
        referred_by = lookup.id;
        isReferred = true;
      }
    }

    const [insertedUser] = await db
      .insert(users)
      .values({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        password_hash: hash,
        role: "client",
        balance: "0.00",
        bonus_balance: "0.00",
        referral_code: referralCode,
        referred_by,
      })
      .returning();

    if (!insertedUser) throw new Error("Failed to create user");

    const verifyToken = generateToken();
    await db.insert(email_verification_tokens).values({
      user_id: insertedUser.id,
      token: verifyToken,
      type: "verify",
      used: false,
      expires_at: getExpiry(24),
    });

    await sendEmail({
      to: insertedUser.email,
      templateName: "verify_email",
      variables: {
        username: insertedUser.username,
        link: `${FRONTEND_URL}/verify-email?token=${verifyToken}`,
      },
      userId: insertedUser.id,
    });

    const token = jwt.sign({ id: insertedUser.id, role: insertedUser.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Registration successful! Please verify your email.",
      token,
      user: {
        id: insertedUser.id,
        username: insertedUser.username,
        email: insertedUser.email,
        firstName: insertedUser.first_name,
        lastName: insertedUser.last_name,
        role: insertedUser.role,
        referral_code: insertedUser.referral_code,
      },
      referred: isReferred,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ==============================
// VERIFY EMAIL
// ==============================
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token required" });

    const [record] = await db
      .select()
      .from(email_verification_tokens)
      .where(
        and(
          eq(email_verification_tokens.token, token),
          eq(email_verification_tokens.type, "verify"),
          eq(email_verification_tokens.used, false)
        )
      )
      .limit(1);

    if (!record || record.expires_at < new Date()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    await db
      .update(users)
      .set({ email_verified_at: new Date() })
      .where(eq(users.id, record.user_id));

    await db
      .update(email_verification_tokens)
      .set({ used: true })
      .where(eq(email_verification_tokens.id, record.id));

    res.json({ success: true, message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==============================
// FORGOT PASSWORD / REQUEST RESET
// ==============================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) return res.status(400).json({ success: false, error: "Email is required" });

    // Find the user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim()))
      .limit(1);

    if (!user) {
      // Don't reveal whether email exists for security
      return res.json({
        success: true,
        message: "If an account exists for this email, a password reset link has been sent",
      });
    }

    // Generate a password reset token
    const resetToken = generateToken();

    // Save token to database
    await db.insert(email_verification_tokens).values({
      user_id: user.id,
      token: resetToken,
      type: "reset",
      used: false,
      expires_at: getExpiry(1), // 1 hour expiry
    });

    // Send password reset email
    await sendEmail({
      to: user.email,
      templateName: "reset_password",
      variables: {
        username: user.username,
        link: `${FRONTEND_URL}/reset-password?token=${resetToken}`,
      },
      userId: user.id,
    });

    res.json({
      success: true,
      message: "If an account exists for this email, a password reset link has been sent",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==============================
// RESET PASSWORD
// ==============================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) return res.status(400).json({ success: false, error: "Token is required" });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });

    // Find the token record
    const [record] = await db
      .select()
      .from(email_verification_tokens)
      .where(
        and(
          eq(email_verification_tokens.token, token),
          eq(email_verification_tokens.type, "reset"),
          eq(email_verification_tokens.used, false)
        )
      )
      .limit(1);

    if (!record || record.expires_at < new Date()) {
      return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }

    // Hash the new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await db.update(users).set({ password_hash: hash }).where(eq(users.id, record.user_id));

    // Mark token as used
    await db.update(email_verification_tokens).set({ used: true }).where(eq(email_verification_tokens.id, record.id));

    res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==============================
// LOGIN (schema-safe, production-ready)
// ==============================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        password_hash: users.password_hash,
        role: users.role,
        email_verified_at: users.email_verified_at,
        first_name: users.first_name,
        last_name: users.last_name,
        referred_by: users.referred_by,
        referral_code: users.referral_code,
        balance: users.balance,
        bonus_balance: users.bonus_balance,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.username, username.trim()))
      .limit(1);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    if (!user.email_verified_at) {
      return res.status(403).json({
        success: false,
        error: "Please verify your email before logging in",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        balance: parseFloat(user.balance),
        bonusBalance: parseFloat(user.bonus_balance),
        referral_code: user.referral_code ?? "",
        referredBy: user.referred_by,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
