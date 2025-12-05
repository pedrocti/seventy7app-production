import { Router } from "express";
import { db } from "../db/connection";
import { users, transactions } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "./utils";

const router = Router();

// Apply auth middleware to all routes
router.use(auth);

// --------------------------------------------------
// GET /api/user/profile
// --------------------------------------------------
router.get("/profile", async (req, res) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        balance: users.balance,
        bonus_balance: users.bonus_balance,
        referral_code: users.referral_code,
        referred_by: users.referred_by,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email || "",
        role: user.role,
        balance: Number(user.balance || 0).toFixed(2),
        bonus_balance: Number(user.bonus_balance || 0).toFixed(2),
        referral_code: user.referral_code,
        referred_by: user.referred_by || null,
      },
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// --------------------------------------------------
// GET /api/user/transactions
// --------------------------------------------------
router.get("/transactions", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, req.user.id))
      .orderBy(desc(transactions.id));

    const formatted = rows.map((tx: any) => {
      const amount = Number(tx.amount || 0) / 100;
      const signed = tx.type === "withdrawal" ? -amount : amount;

      let reject_reason: string | null = null;
      if (tx.details) {
        try {
          const parsed = typeof tx.details === "string" ? JSON.parse(tx.details) : tx.details;
          reject_reason = parsed?.reject_reason ?? null;
        } catch {
          reject_reason = null;
        }
      }

      return {
        id: tx.id,
        type: tx.type,
        amount: Number(signed.toFixed(2)),
        status: tx.status,
        created_at: tx.created_at,
        reject_reason,
      };
    });

    res.json({ success: true, transactions: formatted });
  } catch (err) {
    console.error("User transactions fetch error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// --------------------------------------------------
// GET /api/user/referrals
// --------------------------------------------------
router.get("/referrals", async (req, res) => {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.referred_by, req.user.id));

    const count = result ? Number(result.count) : 0;
    res.json({ success: true, count });
  } catch (err) {
    console.error("Referral count fetch error:", err);
    res.status(500).json({ success: false, count: 0, error: "Failed to fetch referrals" });
  }
});

export default router;
