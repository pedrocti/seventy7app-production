// server/api/deposit.ts
import { Router } from "express";
import { db } from "../db/connection";
import { paymentAddresses, transactions } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "./utils";

const router = Router();

/* =====================================================
   GET ACTIVE DEPOSIT ADDRESS FOR USERS
===================================================== */
router.get("/address", auth, async (_req, res) => {
  try {
    const [active] = await db
      .select()
      .from(paymentAddresses)
      .where(eq(paymentAddresses.is_active, true)) // ✅ use eq for safety
      .orderBy(desc(paymentAddresses.id))
      .limit(1);

    res.json({ success: true, address: active || null });
  } catch (err) {
    console.error("Failed to fetch deposit address:", err);
    res.status(500).json({ success: false, address: null });
  }
});

/* =====================================================
   SUBMIT DEPOSIT REQUEST
===================================================== */
router.post("/", auth, async (req, res) => {
  const { amount } = req.body;

  // Validate amount
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    // Insert pending deposit transaction
    await db.insert(transactions).values({
      user_id: req.user.id,
      type: "deposit",
      amount: (Number(amount) * 100).toFixed(2), // store in cents
      status: "pending",
      details: {}, // JSONB column
    });

    res.json({
      success: true,
      message: "Deposit request created! Waiting for admin approval.",
    });
  } catch (err) {
    console.error("Failed to create deposit request:", err);
    res.status(500).json({ error: "Failed to create deposit request" });
  }
});

export default router;
