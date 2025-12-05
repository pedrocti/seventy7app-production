import { Router } from "express";
import { db } from "../../db/connection";
import { settings } from "../../db/schema";
import { eq } from "drizzle-orm";
import { auth, adminOnly } from "../utils";

const router = Router();

// Apply admin middleware to all routes
router.use(auth, adminOnly);

// ==================
// GET referral %
router.get("/", async (req, res) => {
  try {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "referral_reward_percent"))
      .limit(1);

    res.json({
      success: true,
      percent: setting ? Number(setting.value) : 10, // default 10%
    });
  } catch (err) {
    console.error("Get referral settings error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch referral settings" });
  }
});

// ==================
// PATCH referral %
router.patch("/", async (req, res) => {
  try {
    const { percent } = req.body;

    if (percent == null || percent < 0 || percent > 100) {
      return res.status(400).json({ error: "Percentage must be between 0–100" });
    }

    await db
      .insert(settings)
      .values({
        key: "referral_reward_percent",
        value: percent.toString(),
      })
      .onConflictDoUpdate({
        target: [settings.key],
        set: { value: percent.toString(), updated_at: new Date() },
      });

    res.json({ success: true, percent });
  } catch (err) {
    console.error("Update referral settings error:", err);
    res.status(500).json({ success: false, error: "Failed to update referral settings" });
  }
});

export default router;
