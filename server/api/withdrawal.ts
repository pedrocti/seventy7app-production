// filename: server/api/withdrawal.ts
import { Router } from "express";
import { db } from "../db/connection";
import { users, transactions } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { auth, addToColumn } from "./utils"; // adminOnly not needed here

const router = Router();

// Safe numeric subtraction helper
const subFromColumn = (col: any, amt: number) => sql`COALESCE(${col}, 0)::numeric - ${amt}::numeric`;

// ---------------------------------------------
// POST /withdrawal
// ---------------------------------------------
router.post("/withdrawal", auth, async (req, res) => {
  const { address, network, amount } = req.body;

  // Basic validation
  if (!address || !network || !amount) {
    return res.status(400).json({ error: "Missing withdrawal data" });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!user) return res.status(404).json({ error: "User not found" });

    if (Number(user.balance || 0) < numAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Subtract from user balance
    await db
      .update(users)
      .set({ balance: subFromColumn(users.balance, numAmount) })
      .where(eq(users.id, req.user.id));

    // Insert transaction
    await db.insert(transactions).values({
      user_id: req.user.id,
      type: "withdrawal",
      amount: -Math.round(numAmount * 100), // store as cents
      status: "pending",
      details: { address: address.trim(), network: network.trim() }, // JSON object
    });

    res.json({
      success: true,
      message: "Withdrawal request created! Waiting for admin approval.",
    });
  } catch (err: any) {
    console.error("Withdrawal creation error:", err);
    res.status(500).json({ error: "Failed to create withdrawal request" });
  }
});

export default router;
