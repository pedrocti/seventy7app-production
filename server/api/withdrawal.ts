import { Router } from "express";
import { db } from "../db/connection";
import { users, transactions } from "../db/schema";
import { eq } from "drizzle-orm";
import { auth } from "./utils";
import { createNotification } from "../utils/notifications";

const router = Router();

// ---------------------------------------------
// POST /withdrawal
// ---------------------------------------------
  router.post("/", auth, async (req, res) => {
  const { address, network, amount } = req.body;

  // Basic validation
  if (!address || !network || amount === undefined) {
    return res.status(400).json({ error: "Missing withdrawal data" });
  }

  const numAmount = Number(amount);
  if (Number.isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // ✅ AUTH GUARD (fixes req.user error)
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const amountStr = numAmount.toFixed(2);

  try {
    const [user] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (Number(user.balance) < numAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Create PENDING withdrawal (NO balance change yet)
    const reference = `WD-${Date.now()}-${req.user.id}`;

    await db.insert(transactions).values({
      reference,
      user_id: req.user.id,
      type: "withdrawal",
      amount: amountStr,
      status: "pending",
      details: {
        address: address.trim(),
        network: network.trim(),
      },
    });

    await createNotification(
      req.user.id,
      "Withdrawal Request Submitted",
      `Your withdrawal request of $${amountStr} is pending approval.`
    );


    res.json({
      success: true,
      message: "Withdrawal request submitted and awaiting approval",
    });
  } catch (err) {
    console.error("Withdrawal creation error:", err);
    res.status(500).json({ error: "Failed to create withdrawal request" });
  }
});

export default router;
