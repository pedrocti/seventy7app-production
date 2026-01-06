// server/api/admin/transactions.ts
import { Router } from "express";
import { db } from "../../db/connection.js";
import { transactions, users } from "../../db/schema.js";
import { sql, eq } from "drizzle-orm";
import { auth, adminOnly } from "../utils.js";

const router = Router();

// Protect all admin routes
router.use(auth, adminOnly);

// ------------------------------------------------------
// GET /api/admin/transactions
// Include user wallet address for withdrawals
// ------------------------------------------------------
router.get("/", async (_req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.user_id,
        u.username,
        u.wallet_address,  -- <-- added wallet
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
      user_id: row.user_id,
      username: row.username || "Deleted User",
      wallet: row.wallet_address || null, // <-- include wallet
      type: row.type,
      amount: Number(row.amount ?? 0).toFixed(2),
      status: row.status,
      created_at: row.created_at,
      details: row.details ?? null,
    }));

    res.json({ success: true, transactions: formatted });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ------------------------------------------------------
// PATCH /api/admin/transactions/:txId/approve
// ONLY FOR WITHDRAWALS
// ------------------------------------------------------
router.patch("/:txId/approve", async (req, res) => {
  const txId = Number(req.params.txId);
  if (Number.isNaN(txId)) {
    return res.status(400).json({ error: "Invalid txId" });
  }

  try {
    const [tx] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, txId));

    if (!tx) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (tx.type !== "withdrawal") {
      return res.status(400).json({ error: "Only withdrawals require approval" });
    }

    if (tx.status !== "pending") {
      return res.status(400).json({ error: "Withdrawal is not pending" });
    }

    const amount = Number(tx.amount);
    if (amount <= 0) {
      return res.status(400).json({ error: "Invalid withdrawal amount" });
    }

    // Deduct user balance AT APPROVAL TIME
    await db
      .update(users)
      .set({
        balance: sql`COALESCE(${users.balance}, 0) - ${amount}`,
      })
      .where(eq(users.id, tx.user_id));

    // Mark withdrawal as completed
    await db
      .update(transactions)
      .set({ status: "completed" })
      .where(eq(transactions.id, txId));

    return res.json({ success: true, message: "Withdrawal approved successfully" });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ error: "Failed to approve withdrawal" });
  }
});

export default router;
