// server/api/webhooks/stripe.ts
import { Router } from "express";
import Stripe from "stripe";
import { db } from "../../db/connection";
import { settings, transactions, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { processDeposit } from "../../services/depositProcessor";

const router = Router();

// -----------------------------
// GET STRIPE SECRET FROM DB
// -----------------------------
async function getStripeSecret() {
  const [row] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "stripe_webhook_secret"))
    .limit(1);
  return row?.value || "";
}

// -----------------------------
// STRIPE WEBHOOK
// POST /api/webhooks/stripe
// -----------------------------
router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) return res.status(400).send("Missing Stripe signature");

  try {
    const secret = await getStripeSecret();
    if (!secret) throw new Error("Stripe webhook secret not configured");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2022-11-15" });

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(req.body, sig, secret);

    // We only care about successful payments
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;

      // Lookup pending transaction by reference
      const reference = intent.metadata?.deposit_reference;
      if (!reference) throw new Error("Missing deposit reference in metadata");

      const [tx] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.reference, reference))
        .limit(1);

      if (!tx || tx.status === "completed") {
        return res.json({ received: true }); // idempotent
      }

      // Call processDeposit safely
      await processDeposit({
        userId: tx.user_id,
        amount: Number(intent.amount) / 100, // Stripe uses cents
        provider: "stripe",
        providerRef: intent.id,
      });

      return res.json({ received: true });
    }

    // Ignore other events
    return res.json({ ignored: true });
  } catch (err: any) {
    console.error("Stripe webhook error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
