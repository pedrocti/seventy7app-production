import { Router } from "express";
import { db, users } from "../db/connection.js";  
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

console.log("AUTH ROUTES LOADED");

// ===========================================================
// REGISTER
// ===========================================================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, ref } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Check duplicate username
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    let referred_by: number | null = null;

    if (ref) {
      const lookup = await db
        .select()
        .from(users)
        .where(eq(users.referral_code, ref.toUpperCase()))
        .limit(1);

      if (lookup.length > 0) referred_by = lookup[0].id;
    }

    const [user] = await db
      .insert(users)
      .values({
        username,
        email: email || "",
        password_hash: hash,
        role: "client",
        referral_code: referralCode,
        referred_by,
        balance: "0.00",
        bonus_balance: "0.00",
      })
      .returning();

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        referral_code: user.referral_code,
        balance: Number(user.balance).toFixed(2),
        bonus_balance: Number(user.bonus_balance).toFixed(2),
      },
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===========================================================
// LOGIN
// ===========================================================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    // 🔥 FIX #1 — Clean Drizzle query
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    const user = rows[0];

    // 🔥 FIX #2 — Avoid undefined password_hash issue
    if (!user || !user.password_hash) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 🔥 FIX #3 — bcrypt compare
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔥 FIX #4 — Ensure balances are always numbers
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        referral_code: user.referral_code,
        balance: Number(user.balance ?? 0).toFixed(2),
        bonus_balance: Number(user.bonus_balance ?? 0).toFixed(2),
      },
    });

  } catch (err) {
    console.error("Login error:", err);

    // 🔥 FIX #5 — Prevent frontend JSON error
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
