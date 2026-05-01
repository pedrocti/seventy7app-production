import { Router } from "express";
import crypto from "crypto";
import bodyParser from "body-parser";
import { db } from "../../../db/connection";
import { transactions, settings } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { processDeposit } from "../../../services/depositProcessor";

const router = Router();

/* =====================================================
   RAW BODY REQUIRED FOR SIGNATURE VERIFICATION
===================================================== */
router.use(
  bodyParser.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);

/* =====================================================
   HELPERS
==================================================== */
async function getIpnSecret(): Promise<string> {
  const [row] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "nowpayments_ipn_secret"))
    .limit(1);

  return row?.value || "";
}

function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const parsed = JSON.parse(rawBody);

  const sorted = JSON.stringify(parsed, Object.keys(parsed).sort());

  const hash = crypto
    .createHmac("sha512", secret)
    .update(sorted)
    .digest("hex");

  return hash === signature;
}

/* =====================================================
   NOWPAYMENTS IPN
   POST /api/webhooks/nowpayments
==================================================== */
router.post("/", async (req: any, res) => {
  try {
    const signature = req.headers["x-nowpayments-sig"] as string;
    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    const secret = await getIpnSecret();
    if (!secret) {
      throw new Error("NOWPayments IPN secret not configured");
    }

    if (!verifySignature(req.rawBody, signature, secret)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const {
      payment_status,
      payment_id,
      order_id, // ← your internal reference (dep_xxx)
    } = req.body;

    // Ignore non-final states
    if (!["finished", "confirmed"].includes(payment_status)) {
      return res.json({ ignored: true });
    }

    if (!order_id || !payment_id) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    /* =====================================================
       LOAD TRANSACTION (SOURCE OF TRUTH)
    ===================================================== */
    const [tx] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.reference, order_id))
      .limit(1);

    if (!tx) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // 🔒 Idempotency guard
    if (tx.status === "completed") {
      return res.json({ already_processed: true });
    }

    /* =====================================================
       COMPLETE TRANSACTION (ATOMIC)
    ===================================================== */
    await db.transaction(async (trx) => {
      await processDeposit({
        trx,
        userId: tx.user_id,
        amount: Number(tx.amount),
        provider: "nowpayments",
        providerRef: payment_id,
        transactionId: tx.id,
      });
    });

    return res.json({ received: true });
  } catch (err) {
    console.error("NOWPayments IPN error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
