import { Router, Request, Response } from "express";
import { db } from "../../db/connection.js";
import { transactions, users } from "../../db/schema.js";
import { sql, eq } from "drizzle-orm";
import { auth, adminOnly } from "../utils.js";
import { createNotification } from "../../utils/notifications.js"; 

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

    const rows = result ?? [];

    const formatted = rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      username: row.username || "Deleted User",
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
// APPROVE WITHDRAWAL (SAFE)
// ------------------------------------------------------
router.patch("/:txId/approve", async (req: Request, res: Response) => {
  const txId = Number(req.params.txId);
  if (Number.isNaN(txId)) {
    return res.status(400).json({ success: false, error: "Invalid txId" });
  }

  try {
    const [tx] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, txId));

    if (!tx) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    if (tx.type !== "withdrawal") {
      return res.status(400).json({ success: false, error: "Only withdrawals require approval" });
    }

    if (tx.status !== "pending") {
      return res.status(400).json({ success: false, error: "Withdrawal is not pending" });
    }

    const amount = Number(tx.amount);
    if (amount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid withdrawal amount" });
    }

    // ✅ DB mutation
    await db.transaction(async (dbtx) => {
      await dbtx
        .update(users)
        .set({
          balance: sql`GREATEST(COALESCE(${users.balance}, 0) - ${amount}, 0)`,
        })
        .where(eq(users.id, tx.user_id));

      await dbtx
        .update(transactions)
        .set({ status: "completed" })
        .where(eq(transactions.id, txId));
    });

    // ✅ NOTIFICATION — tx & amount are IN SCOPE here
    await createNotification(
      tx.user_id,
      "Withdrawal Approved",
      `Your withdrawal request of $${amount.toFixed(2)} has been approved.`
    );

    return res.json({ success: true, message: "Withdrawal approved successfully" });
  } catch (err) {
    console.error("Withdrawal approval error:", err);
    res.status(500).json({ success: false, error: "Failed to approve withdrawal" });
  }
});

// ------------------------------------------------------
// REJECT WITHDRAWAL
// PATCH /api/admin/transactions/:txId/reject
// ------------------------------------------------------
router.patch("/:txId/reject", async (req: Request, res: Response) => {
  const txId = Number(req.params.txId);
  if (Number.isNaN(txId)) {
    return res.status(400).json({ success: false, error: "Invalid txId" });
  }

  try {
    const [tx] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, txId));

    if (!tx) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    if (tx.type !== "withdrawal") {
      return res.status(400).json({ success: false, error: "Only withdrawals can be rejected" });
    }

    if (tx.status !== "pending") {
      return res.status(400).json({ success: false, error: "Withdrawal is not pending" });
    }

    // ❗ No balance change on reject
    await db
      .update(transactions)
      .set({ status: "rejected" })
      .where(eq(transactions.id, txId));

    // ✅ NOTIFY USER (number, not string)
    await createNotification(
      tx.user_id,
      "Withdrawal Rejected",
      `Your withdrawal request of $${Number(tx.amount).toFixed(2)} has been rejected. Please contact support.`
    );

    return res.json({ success: true, message: "Withdrawal rejected successfully" });
  } catch (err) {
    console.error("Withdrawal rejection error:", err);
    res.status(500).json({ success: false, error: "Failed to reject withdrawal" });
  }
});

export default router;
