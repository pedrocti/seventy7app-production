import { Router } from "express";
import { db } from "../../db/connection.js";
import { transactions, users, settings } from "../../db/schema.js";
import { sql, eq } from "drizzle-orm";
import { auth, adminOnly, addToColumn } from "../utils.js";

const router = Router();

// Protect all admin routes
router.use(auth, adminOnly);

// ------------------------------------------------------
// GET /api/admin/transactions
// ------------------------------------------------------
router.get("/", async (_req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.user_id,
        u.username,
        t.type,
        t.amount,
        t.status,
        t.created_at,
        t.details
      FROM transactions t
      LEFT JOIN users u ON u.id = t.user_id
      ORDER BY t.id DESC
    `);

    const rows = result?.rows ?? [];
    const formatted = rows.map((row: any) => ({
      id: row.id,
      username: row.username || "Deleted User",
      type: row.type,
      amount: ((Number(row.amount ?? 0)) / 100).toFixed(2),
      status: row.status,
      created_at: row.created_at,
      details: row.details ?? null,
    }));

    res.json({ success: true, transactions: formatted });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    res.status(500).json({ success: false, transactions: [], error: "Server error" });
  }
});

// ------------------------------------------------------
// PATCH /api/admin/transactions/:txId/approve
// ------------------------------------------------------
router.patch("/:txId/approve", async (req, res) => {
  const txId = Number(req.params.txId);
  if (Number.isNaN(txId)) return res.status(400).json({ error: "Invalid txId" });

  try {
    // 1. Load transaction
    const [txRow] = await db.select().from(transactions).where(eq(transactions.id, txId));

    if (!txRow || txRow.status !== "pending") {
      return res.status(400).json({ error: "Invalid or non-pending transaction" });
    }

    const depositAmount = Number(txRow.amount ?? 0) / 100;

    // ------------------------------------
    // DEPOSIT APPROVAL LOGIC
    // ------------------------------------
    if (txRow.type === "deposit") {
      // Count completed deposits
      const countRes = await db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM transactions
        WHERE user_id = ${txRow.user_id}
          AND type = 'deposit'
          AND status = 'completed'
      `);
      const completedDeposits = Number(countRes.rows[0].count);
      const isFirstDeposit = completedDeposits === 0;

      // Update user balance
      await db
        .update(users)
        .set({ balance: addToColumn(users.balance, depositAmount) })
        .where(eq(users.id, txRow.user_id));

      // Mark transaction as completed
      await db
        .update(transactions)
        .set({ status: "completed" })
        .where(eq(transactions.id, txId));

      // Handle referral reward
      if (isFirstDeposit) {
        const [user] = await db
          .select({ referred_by: users.referred_by })
          .from(users)
          .where(eq(users.id, txRow.user_id));

        const referrerId = user?.referred_by ?? null;

        if (referrerId) {
          // Check if referral bonus already exists
          const existingBonusRes = await db.execute(sql`
            SELECT COUNT(*)::int AS count
            FROM transactions
            WHERE type = 'referral_bonus'
              AND details->>'source_deposit_id' = ${txId}::text
          `);

          if (Number(existingBonusRes.rows[0].count) === 0) {
            const [setting] = await db
              .select()
              .from(settings)
              .where(eq(settings.key, "referral_reward_percent"));

            const percent = setting ? Number(setting.value) : 10;
            const bonusAmount = depositAmount * (percent / 100);

            // Update referrer bonus balance
            await db
              .update(users)
              .set({ bonus_balance: addToColumn(users.bonus_balance, bonusAmount) })
              .where(eq(users.id, referrerId));

            // Insert bonus transaction
            await db.insert(transactions).values({
              user_id: referrerId,
              type: "referral_bonus",
              amount: String(Math.round(bonusAmount * 100)),
              status: "completed",
              details: { source_deposit_id: txId },
            });
          }
        }
      }
    }

    // ------------------------------------
    // NON-DEPOSIT TRANSACTIONS
    // ------------------------------------
    if (txRow.type !== "deposit") {
      await db
        .update(transactions)
        .set({ status: "completed" })
        .where(eq(transactions.id, txId));
    }

    return res.json({ success: true, message: "Approved!" });
  } catch (err) {
    console.error("Approval error:", err);
    return res.status(500).json({ error: "Failed to approve transaction" });
  }
});


export default router;
