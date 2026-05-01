// server/api/deposits.ts
import { Router } from "express";
import Stripe from "stripe";
import { db } from "../db/connection";
import { transactions, settings } from "../db/schema";
import { auth } from "./utils";
import { eq } from "drizzle-orm";
import { createNotification } from "../utils/notifications";

const router = Router();

/* =====================================================
   CREATE DEPOSIT SESSION
   POST /api/deposits/create
===================================================== */
router.post("/create", auth, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0 || numAmount < 10) {
      return res.status(400).json({ error: "Minimum deposit is $10" });
    }

    if (!["card", "crypto"].includes(method)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const reference = `dep_${Date.now()}_${req.user!.id}`;

    // Create pending transaction (source of truth)
    await db.insert(transactions).values({
      user_id: req.user!.id,
      type: "deposit",
      amount: numAmount.toString(),
      status: "pending",
      reference,
      details: {
        method,
        provider: method === "card" ? "stripe" : "nowpayments",
      },
    });

    await createNotification(
      req.user!.id,
      "Deposit Initiated",
      `Your deposit of $${numAmount.toFixed(2)} is now pending.`
    );



    // =============================================
    // CARD → STRIPE (unchanged — works great)
    // =============================================
    if (method === "card") {
      const [row] = await db
        .select({ value: settings.value })
        .from(settings)
        .where(eq(settings.key, "stripe_secret_key"))
        .limit(1);

      if (!row?.value) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const stripe = new Stripe(row.value);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Account Deposit" },
              unit_amount: Math.round(numAmount * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          deposit_reference: reference,
          user_id: String(req.user!.id),
        },
        success_url: `${process.env.FRONTEND_URL}/deposit/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/deposit/cancel`,
      });

      return res.json({
        success: true,
        method: "card",
        checkoutUrl: session.url,
      });

    }

    // =============================================
    // CRYPTO → NOWPayments (FIXED & MODERN)
    // =============================================
    const [apiKeyRow] = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "nowpayments_api_key"))
      .limit(1);

    if (!apiKeyRow?.value) {
      return res.status(500).json({ error: "NOWPayments API key not configured" });
    }

    const baseUrl = process.env.BASE_URL || "https://" + req.headers.host;
    const frontendUrl = process.env.FRONTEND_URL || baseUrl;

    const nowResponse = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": apiKeyRow.value,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: numAmount,
        price_currency: "usd",
        order_id: reference,
        order_description: "Account Deposit",
        ipn_callback_url: `${baseUrl}/api/deposits/webhook`,     // REQUIRED
        success_url: `${frontendUrl}/deposit/success`,
        cancel_url: `${frontendUrl}/deposit/cancel`,
        // Optional: let user choose coin
        // pay_currency: "btc",
      }),
    });

    if (!nowResponse.ok) {
      const errorText = await nowResponse.text();
      console.error("NOWPayments error:", errorText);
      return res.status(500).json({ error: "Payment provider unavailable" });
    }

    const invoice = await nowResponse.json();

    // This is the correct field NOWPayments returns
    if (!invoice.invoice_url) {
      console.error("NOWPayments invalid response:", invoice);
      return res.status(500).json({ error: "Failed to create payment link" });
    }

    // Success! Return clean redirect URL
    return res.json({
      success: true,
      method: "crypto",
      paymentUrl: invoice.invoice_url,   // ← This is what you need
      invoiceId: invoice.id,
    });

  } catch (err) {
    console.error("Deposit create error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;