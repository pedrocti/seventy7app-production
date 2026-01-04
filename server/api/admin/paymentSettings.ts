// routes/admin/payment-settings.ts (or wherever you keep it)
import { Router } from "express";
import { db } from "../../db/connection";
import { settings } from "../../db/schema";
import { auth, adminOnly } from "../utils";
import { eq } from "drizzle-orm";
import { inArray } from "drizzle-orm";

const router = Router();

// Apply auth + admin middleware to all routes
router.use(auth, adminOnly);

/* =====================================================
   GET /admin/payment-settings
   → Returns all payment keys (empty string if not set)
===================================================== */
router.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select({
        key: settings.key,
        value: settings.value,
      })
      .from(settings)
      .where(
        inArray(settings.key, [
          "stripe_secret_key",
          "stripe_webhook_secret",
          "nowpayments_api_key",
          "nowpayments_ipn_secret",
        ])
      );

    // Build response object with defaults
    const result: Record<string, string> = {
      stripe_secret_key: "",
      stripe_webhook_secret: "",
      nowpayments_api_key: "",
      nowpayments_ipn_secret: "",
    };

    for (const row of rows) {
      if (row.value !== null) {
        result[row.key] = row.value;
      }
    }

    res.json({ success: true, settings: result });
  } catch (err) {
    console.error("Failed to load payment settings:", err);
    res.status(500).json({ error: "Failed to load settings" });
  }
});

/* =====================================================
   Helper: Upsert a single setting
===================================================== */
async function upsertSetting(key: string, value: string | undefined) {
  if (!value || value.trim() === "") {
    // Optional: allow clearing the value
    // Or skip if you don't want to store empty strings
    return;
  }

  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

/* =====================================================
   PATCH /admin/payment-settings
   → Save payment keys
===================================================== */
router.patch("/", async (req, res) => {
  const {
    stripe_secret_key,
    stripe_webhook_secret,
    nowpayments_api_key,
    nowpayments_ipn_secret,
  } = req.body;

  try {
    await Promise.all([
      upsertSetting("stripe_secret_key", stripe_secret_key?.trim()),
      upsertSetting("stripe_webhook_secret", stripe_webhook_secret?.trim()),
      upsertSetting("nowpayments_api_key", nowpayments_api_key?.trim()),
      upsertSetting("nowpayments_ipn_secret", nowpayments_ipn_secret?.trim()),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to save payment settings:", err);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

export default router;