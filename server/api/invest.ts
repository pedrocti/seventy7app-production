// server/api/invest.ts
// ─────────────────────────────────────────────────────────────────────────────
// Investment creation — Annual model (12 months)
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import { db } from "../db/connection";
import { users, plans, investments, settings, transactions, notifications } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "./utils";
import { createNotification } from "../utils/notifications";

const router = Router();
router.use(auth);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/invest — Create a new annual investment
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

  const { plan_id, amount, use_bonus } = req.body;
  const numAmount = Number(amount);

  if (!plan_id || Number.isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: "Invalid investment data" });
  }

  try {
    // ── Validate plan ─────────────────────────────────────────────────────────
    const [plan] = await db.select().from(plans).where(eq(plans.id, plan_id));
    if (!plan) return res.status(400).json({ success: false, error: "Plan not found" });

    if (numAmount < Number(plan.min_amount)) {
      return res.status(400).json({
        success: false,
        error:   `Minimum investment for this plan is $${Number(plan.min_amount).toLocaleString()}`,
      });
    }

    if (plan.max_amount && numAmount > Number(plan.max_amount)) {
      return res.status(400).json({
        success: false,
        error:   `Maximum investment for this plan is $${Number(plan.max_amount).toLocaleString()}`,
      });
    }

    // ── Validate user balance ─────────────────────────────────────────────────
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const mainBalance  = Number(user.balance || 0);
    const bonusBalance = Number(user.bonus_balance || 0);

    let fromBonus = 0;
    let fromMain  = numAmount;

    if (use_bonus && bonusBalance > 0) {
      fromBonus = Math.min(bonusBalance, numAmount);
      fromMain  = Math.max(0, numAmount - fromBonus);
    }

    if (mainBalance < fromMain) {
      return res.status(400).json({
        success: false,
        error:   fromBonus > 0
          ? "Insufficient main balance after applying bonus"
          : "Insufficient main balance",
      });
    }

    // ── Snapshot ROI rate at time of investment ───────────────────────────────
    // Uses mid-point of range if range is set; falls back to monthly_roi_percent.
    // Protects existing investors from future plan rate changes.
    const lo = Number(plan.min_monthly_roi || 0);
    const hi = Number(plan.max_monthly_roi || 0);
    const snapshotRoiRate = (lo > 0 || hi > 0)
      ? Number(((lo + hi) / 2).toFixed(4))
      : Number(plan.monthly_roi_percent || 0);

    // ── Create investment ─────────────────────────────────────────────────────
    const startAt = new Date();

    const [inserted] = await db.transaction(async (tx) => {
      // Deduct from user balance(s)
      await tx
        .update(users)
        .set({
          balance:       sql`COALESCE(${users.balance}, 0)::numeric - ${fromMain}::numeric`,
          bonus_balance: sql`COALESCE(${users.bonus_balance}, 0)::numeric - ${fromBonus}::numeric`,
        })
        .where(eq(users.id, userId));

      // Create the investment record
      const inv = await tx
        .insert(investments)
        .values({
          user_id:          userId,
          plan_id:          plan.id,
          amount:           numAmount.toFixed(2),
          status:           "active",
          progress:         "0.00",
          profit_loss:      "0.00",
          profit_paid:      "0.00",
          term_months:      12,
          current_month:    0,
          total_earned:     "0.00",
          monthly_roi_rate: snapshotRoiRate.toFixed(4),
          start_at:         startAt,
          duration_days:    365,
        })
        .returning();

      return inv;
    });

    // ── Referral bonus (first investment only) ────────────────────────────────
    const allInvestments = await db
      .select({ id: investments.id })
      .from(investments)
      .where(eq(investments.user_id, userId))
      .limit(2);

    if (allInvestments.length === 1 && user.referred_by) {
      const [setting] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, "referral_reward_percent"));

      const percent     = setting ? Number(setting.value) : 10;
      const bonusAmount = Number((numAmount * (percent / 100)).toFixed(2));

      await db
        .update(users)
        .set({ bonus_balance: sql`COALESCE(${users.bonus_balance}, 0)::numeric + ${bonusAmount}::numeric` })
        .where(eq(users.id, user.referred_by));

      await db.insert(transactions).values({
        user_id:   user.referred_by,
        type:      "referral_bonus",
        amount:    bonusAmount.toFixed(2),
        status:    "completed",
        reference: `referral_bonus_${Date.now()}`,
        details:   { source_investment_id: inserted.id },
      });
    }

    // ── In-app notification ───────────────────────────────────────────────────
    await createNotification(
      userId,
      "Investment Activated",
      `Your $${numAmount.toLocaleString()} investment in the ${plan.name} plan has been activated. ` +
      `You will receive monthly returns of approximately ${snapshotRoiRate}% over 12 months.`
    ).catch(() => {});

    // ── Return updated balances ───────────────────────────────────────────────
    const [updated] = await db
      .select({ balance: users.balance, bonus_balance: users.bonus_balance })
      .from(users)
      .where(eq(users.id, userId));

    return res.json({
      success: true,
      message: "Investment activated — your monthly returns will begin within 30 days",
      investment: {
        ...inserted,
        plan_name:        plan.name,
        monthly_roi_rate: snapshotRoiRate,
        min_monthly_roi:  lo,
        max_monthly_roi:  hi,
        min_total_roi:    Number(plan.min_total_roi || 0),
        max_total_roi:    Number(plan.max_total_roi || 0),
        term_months:      12,
        end_date:         new Date(startAt.getTime() + 365 * 86400000).toISOString(),
      },
      balances: {
        balance:       Number(updated?.balance ?? 0),
        bonus_balance: Number(updated?.bonus_balance ?? 0),
      },
    });
  } catch (err) {
    console.error("Invest error:", err);
    return res.status(500).json({ success: false, error: "Failed to create investment" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/invest — List user's investments with progress + ROI range details
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

  try {
    const rows = await db
      .select({
        // ── investment fields ──────────────────────────────────────────────
        id:                    investments.id,
        amount:                investments.amount,
        status:                investments.status,
        progress:              investments.progress,
        profit_loss:           investments.profit_loss,
        profit_paid:           investments.profit_paid,
        term_months:           investments.term_months,
        current_month:         investments.current_month,
        total_earned:          investments.total_earned,
        monthly_roi_rate:      investments.monthly_roi_rate,
        start_at:              investments.start_at,
        duration_days:         investments.duration_days,
        last_profit_payout_at: investments.last_profit_payout_at,
        // ── plan fields ───────────────────────────────────────────────────
        plan_id:               plans.id,
        plan_name:             plans.name,
        min_amount:            plans.min_amount,
        max_amount:            plans.max_amount,
        // ROI range — these were missing, causing 0% display on frontend
        min_monthly_roi:       plans.min_monthly_roi,
        max_monthly_roi:       plans.max_monthly_roi,
        min_total_roi:         plans.min_total_roi,
        max_total_roi:         plans.max_total_roi,
      })
      .from(investments)
      .leftJoin(plans, eq(plans.id, investments.plan_id))
      .where(eq(investments.user_id, userId));

    const enriched = rows.map((inv) => {
      const start      = inv.start_at ? new Date(inv.start_at) : null;
      const endDate    = start ? new Date(start.getTime() + 365 * 86400000) : null;
      const termMonths = Number(inv.term_months ?? 12);
      const curMonth   = Number(inv.current_month ?? 0);

      // Resolve ROI range — prefer plan range, fall back to snapshotted rate
      // so investments created before ranges existed still display correctly
      const snapshotRate = Number(inv.monthly_roi_rate ?? 0);
      const minRoi = Number(inv.min_monthly_roi ?? 0) || snapshotRate;
      const maxRoi = Number(inv.max_monthly_roi ?? 0) || snapshotRate;
      const minTotal = Number(inv.min_total_roi ?? 0) || +(snapshotRate * termMonths).toFixed(2);
      const maxTotal = Number(inv.max_total_roi ?? 0) || +(snapshotRate * termMonths).toFixed(2);

      // Next payout date
      const lastPayout = inv.last_profit_payout_at
        ? new Date(inv.last_profit_payout_at)
        : start;
      const nextPayout = lastPayout
        ? new Date(lastPayout.getTime() + 30 * 24 * 60 * 60 * 1000)
        : null;

      return {
        ...inv,
        // Resolved ROI range fields — always populated
        min_monthly_roi:   minRoi,
        max_monthly_roi:   maxRoi,
        min_total_roi:     minTotal,
        max_total_roi:     maxTotal,
        // Computed fields
        end_at:            endDate?.toISOString() ?? null,
        next_payout_at:    nextPayout?.toISOString() ?? null,
        months_remaining:  Math.max(0, termMonths - curMonth),
        projected_monthly: Number(inv.amount) * (snapshotRate / 100),
        projected_total:   Number(inv.amount) * (snapshotRate / 100) * termMonths,
      };
    });

    res.json({ success: true, investments: enriched });
  } catch (err) {
    console.error("Fetch investments error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch investments" });
  }
});

export default router;
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/investments/:id/reinvest-earnings
// Creates a new stake from the user's main balance
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/reinvest-earnings", async (req, res) => {
  const userId = req.user?.id;
  const invId  = Number(req.params.id);
  const { plan_id, amount: customAmount } = req.body;

  if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });
  if (!plan_id) return res.status(400).json({ success: false, error: "plan_id required" });

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const [plan] = await db.select().from(plans).where(eq(plans.id, plan_id));
    if (!plan) return res.status(400).json({ success: false, error: "Plan not found" });

    // Use custom amount or plan minimum
    const amount = Number(customAmount ?? plan.min_amount);
    const mainBalance = Number(user.balance ?? 0);

    if (mainBalance < amount) {
      return res.status(400).json({ success: false, error: `Insufficient balance. Available: $${mainBalance.toFixed(2)}` });
    }
    if (amount < Number(plan.min_amount)) {
      return res.status(400).json({ success: false, error: `Minimum for this plan is $${Number(plan.min_amount).toLocaleString()}` });
    }

    const lo = Number(plan.min_monthly_roi || 0);
    const hi = Number(plan.max_monthly_roi || 0);
    const snapshotRoiRate = (lo > 0 || hi > 0)
      ? Number(((lo + hi) / 2).toFixed(4))
      : Number(plan.monthly_roi_percent || 0);

    const startAt = new Date();

    const [newInv] = await db.transaction(async (tx) => {
      await tx.update(users)
        .set({ balance: sql`COALESCE(${users.balance}, 0)::numeric - ${amount}::numeric` })
        .where(eq(users.id, userId));

      return tx.insert(investments).values({
        user_id:          userId,
        plan_id:          plan.id,
        amount:           amount.toFixed(2),
        status:           "active",
        progress:         "0.00",
        profit_loss:      "0.00",
        profit_paid:      "0.00",
        term_months:      12,
        current_month:    0,
        total_earned:     "0.00",
        monthly_roi_rate: snapshotRoiRate.toFixed(4),
        start_at:         startAt,
        duration_days:    365,
      }).returning();
    });

    res.json({ success: true, message: `$${amount.toFixed(2)} reinvested into ${plan.name}`, investment: newInv });
  } catch (err) {
    console.error("Reinvest error:", err);
    res.status(500).json({ success: false, error: "Failed to reinvest" });
  }
});
