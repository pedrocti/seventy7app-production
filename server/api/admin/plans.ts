// server/api/admin/plans.ts
import { Router } from "express";
import { db } from "../../db/connection";
import { plans, investments, users, investment_monthly_payouts, notifications } from "../../db/schema";
import { auth, adminOnly } from "../utils";
import { eq, and, sql } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

function numericId(param: any): number | null {
  const n = Number(param);
  return Number.isFinite(n) ? n : null;
}

/* ─────────────────────────────────────────────────────────
   GET /api/admin/plans
   Returns all plans including new ROI range fields +
   count of active investors per plan
───────────────────────────────────────────────────────── */
router.get("/", async (_req, res) => {
  try {
    const list = await db.select().from(plans);

    // Get active investor counts per plan
    const activeCounts = await db
      .select({
        plan_id:      investments.plan_id,
        active_count: sql<number>`COUNT(*)::int`,
      })
      .from(investments)
      .where(eq(investments.status, "active"))
      .groupBy(investments.plan_id);

    const countMap = Object.fromEntries(
      activeCounts.map((r) => [r.plan_id, r.active_count])
    );

    const enriched = list.map((p) => ({
      ...p,
      active_count: countMap[p.id] ?? 0,
    }));

    res.json({ success: true, plans: enriched });
  } catch (err) {
    console.error("[Admin Plans] Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

/* ─────────────────────────────────────────────────────────
   POST /api/admin/plans — Create plan
───────────────────────────────────────────────────────── */
router.post("/", async (req, res) => {
  const {
    name,
    min_amount,
    max_amount,
    description,
    min_monthly_roi = 0,
    max_monthly_roi = 0,
    min_total_roi   = 0,
    max_total_roi   = 0,
  } = req.body ?? {};

  if (!name || String(name).trim() === "")
    return res.status(400).json({ error: "Plan name is required" });

  const parsedMin    = Number(min_amount ?? 0);
  const parsedMinRoi = Number(min_monthly_roi);
  const parsedMaxRoi = Number(max_monthly_roi);

  if (isNaN(parsedMin) || parsedMin < 0)
    return res.status(400).json({ error: "Invalid min_amount" });
  if (isNaN(parsedMinRoi) || parsedMinRoi < 0)
    return res.status(400).json({ error: "Invalid min_monthly_roi" });
  if (isNaN(parsedMaxRoi) || parsedMaxRoi < parsedMinRoi)
    return res.status(400).json({ error: "max_monthly_roi must be >= min_monthly_roi" });

  // mid-point stored as the legacy monthly_roi_percent so payout job works
  const midRoi = ((parsedMinRoi + parsedMaxRoi) / 2);

  try {
    const [inserted] = await db
      .insert(plans)
      .values({
        name:                String(name).trim(),
        min_amount:          parsedMin.toFixed(2),
        max_amount:          max_amount == null || max_amount === ""
                               ? null
                               : Number(max_amount).toFixed(2),
        description:         description ?? "",
        duration_days:       365,
        monthly_roi_percent: midRoi.toFixed(4),         // legacy field = mid-point
        min_monthly_roi:     parsedMinRoi.toFixed(4),
        max_monthly_roi:     parsedMaxRoi.toFixed(4),
        min_total_roi:       Number(min_total_roi).toFixed(4),
        max_total_roi:       Number(max_total_roi).toFixed(4),
      })
      .returning();

    res.status(201).json({ success: true, plan: inserted });
  } catch (err) {
    console.error("[Admin Plans] Create error:", err);
    res.status(500).json({ error: "Failed to create plan" });
  }
});

/* ─────────────────────────────────────────────────────────
   PUT /api/admin/plans/:id — Update plan
───────────────────────────────────────────────────────── */
router.put("/:id", async (req, res) => {
  const id = numericId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid plan ID" });

  const {
    name, min_amount, max_amount, description,
    min_monthly_roi, max_monthly_roi, min_total_roi, max_total_roi,
    duration_days, term_months,
  } = req.body ?? {};

  if (name !== undefined && String(name).trim() === "")
    return res.status(400).json({ error: "Plan name cannot be empty" });

  const payload: Record<string, any> = {};

  if (name        !== undefined) payload.name        = String(name).trim();
  if (min_amount  !== undefined) payload.min_amount  = Number(min_amount).toFixed(2);
  if (description !== undefined) payload.description = description ?? "";
  if (max_amount  !== undefined) {
    payload.max_amount = max_amount == null || max_amount === ""
      ? null
      : Number(max_amount).toFixed(2);
  }

  if (duration_days !== undefined) {
    const v = Number(duration_days);
    if (!isNaN(v) && v > 0) payload.duration_days = v;
  }
  if (term_months !== undefined) {
    const v = Number(term_months);
    if (!isNaN(v) && v > 0) payload.term_months = v;
  }
  if (min_monthly_roi !== undefined) {
    const v = Number(min_monthly_roi);
    if (isNaN(v) || v < 0) return res.status(400).json({ error: "Invalid min_monthly_roi" });
    payload.min_monthly_roi = v.toFixed(4);
  }
  if (max_monthly_roi !== undefined) {
    const v = Number(max_monthly_roi);
    if (isNaN(v) || v < 0) return res.status(400).json({ error: "Invalid max_monthly_roi" });
    payload.max_monthly_roi = v.toFixed(4);
  }
  if (min_total_roi !== undefined) payload.min_total_roi = Number(min_total_roi).toFixed(4);
  if (max_total_roi !== undefined) payload.max_total_roi = Number(max_total_roi).toFixed(4);

  // Keep legacy monthly_roi_percent in sync = mid-point of range
  if (min_monthly_roi !== undefined || max_monthly_roi !== undefined) {
    // Fetch current values to compute mid-point correctly
    const [current] = await db.select().from(plans).where(eq(plans.id, id));
    if (current) {
      const lo  = Number(payload.min_monthly_roi ?? current.min_monthly_roi ?? 0);
      const hi  = Number(payload.max_monthly_roi ?? current.max_monthly_roi ?? 0);
      payload.monthly_roi_percent = ((lo + hi) / 2).toFixed(4);
    }
  }

  if (Object.keys(payload).length === 0)
    return res.status(400).json({ error: "No fields to update" });

  try {
    const [updated] = await db
      .update(plans)
      .set(payload)
      .where(eq(plans.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Plan not found" });
    res.json({ success: true, plan: updated });
  } catch (err) {
    console.error("[Admin Plans] Update error:", err);
    res.status(500).json({ error: "Failed to update plan" });
  }
});

/* ─────────────────────────────────────────────────────────
   DELETE /api/admin/plans/:id
───────────────────────────────────────────────────────── */
router.delete("/:id", async (req, res) => {
  const id = numericId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid plan ID" });

  try {
    const [deleted] = await db.delete(plans).where(eq(plans.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "Plan not found" });
    res.json({ success: true, deleted });
  } catch (err) {
    console.error("[Admin Plans] Delete error:", err);
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

/* ─────────────────────────────────────────────────────────
   POST /api/admin/plans/:id/pay-monthly
   Admin manually triggers a monthly payout for ALL active
   investors on this plan at a specific ROI %.

   Body: { roi_percent: number }

   This mirrors exactly what the cron job does per investment,
   so there's no double-pay risk — it uses the same
   investment_monthly_payouts guard the cron uses.
───────────────────────────────────────────────────────── */
router.post("/:id/pay-monthly", async (req, res) => {
  const planId = numericId(req.params.id);
  if (planId === null) return res.status(400).json({ error: "Invalid plan ID" });

  const roiPercent = Number(req.body?.roi_percent);
  if (isNaN(roiPercent) || roiPercent <= 0 || roiPercent > 100)
    return res.status(400).json({ error: "roi_percent must be between 0.01 and 100" });

  try {
    // Validate plan exists + check range
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    const lo = Number(plan.min_monthly_roi ?? 0);
    const hi = Number(plan.max_monthly_roi ?? 100);
    if (roiPercent < lo || roiPercent > hi) {
      return res.status(400).json({
        error: `${roiPercent}% is outside this plan's range (${lo}%–${hi}%)`,
      });
    }

    // Get all active investments on this plan
    const activeInvs = await db
      .select({
        id:            investments.id,
        user_id:       investments.user_id,
        amount:        investments.amount,
        current_month: investments.current_month,
        term_months:   investments.term_months,
        total_earned:  investments.total_earned,
        profit_paid:   investments.profit_paid,
        profit_loss:   investments.profit_loss,
      })
      .from(investments)
      .where(
        and(
          eq(investments.plan_id, planId),
          eq(investments.status, "active")
        )
      );

    if (activeInvs.length === 0)
      return res.json({ success: true, message: "No active investors on this plan", count: 0, total_distributed: 0 });

    let totalDistributed = 0;
    let paid = 0;
    let skipped = 0;

    for (const inv of activeInvs) {
      const currentMonth = Number(inv.current_month ?? 0);
      const termMonths   = Number(inv.term_months ?? 12);
      const nextMonth    = currentMonth + 1;

      if (currentMonth >= termMonths) { skipped++; continue; }

      // Double-pay guard — same check the cron uses
      const existing = await db
        .select({ id: investment_monthly_payouts.id })
        .from(investment_monthly_payouts)
        .where(
          and(
            eq(investment_monthly_payouts.investment_id, inv.id),
            eq(investment_monthly_payouts.month_number, nextMonth)
          )
        )
        .limit(1);

      if (existing.length > 0) { skipped++; continue; }

      const principal  = Number(inv.amount ?? 0);
      const roiAmount  = Number(((principal * roiPercent) / 100).toFixed(2));
      const isFinal    = nextMonth === termMonths;
      const newEarned  = Number(inv.total_earned ?? 0) + roiAmount;
      const balanceAdd = isFinal ? roiAmount + principal : roiAmount;

      await db.transaction(async (tx) => {
        // Credit user balance
        await tx
          .update(users)
          .set({
            balance: sql`COALESCE(${users.balance}, 0)::numeric + ${balanceAdd}::numeric`,
          })
          .where(eq(users.id, inv.user_id));

        // Log payout — matches exact schema columns in investment_monthly_payouts
        await tx.insert(investment_monthly_payouts).values({
          investment_id: inv.id,
          user_id:       inv.user_id,
          month_number:  nextMonth,
          roi_percent:   roiPercent.toFixed(4),
          roi_amount:    roiAmount.toFixed(2),
          principal:     principal.toFixed(2),
          paid_at:       new Date(),
        });

        // Update investment
        const invUpdate: any = {
          current_month:        nextMonth,
          total_earned:         newEarned.toFixed(2),
          profit_paid:          (Number(inv.profit_paid ?? 0) + roiAmount).toFixed(2),
          profit_loss:          newEarned.toFixed(2),
          progress:             ((nextMonth / termMonths) * 100).toFixed(2),
          last_profit_payout_at: new Date(),
        };
        if (isFinal) invUpdate.status = "completed";

        await tx.update(investments).set(invUpdate).where(eq(investments.id, inv.id));

        // In-app notification
        await tx.insert(notifications).values({
          user_id: inv.user_id,
          title:   isFinal ? "Investment Term Completed 🎉" : `Month ${nextMonth} Earnings Credited`,
          message: isFinal
            ? `Your investment is complete. $${balanceAdd.toFixed(2)} (capital + final earnings) returned to your balance.`
            : `$${roiAmount.toFixed(2)} (${roiPercent}% ROI) credited to your main balance for Month ${nextMonth}.`,
          read: false,
        });
      });

      totalDistributed += balanceAdd;
      paid++;
    }

    res.json({
      success:           true,
      plan_name:         plan.name,
      roi_percent:       roiPercent,
      investments_paid:  paid,
      skipped,
      total_distributed: Number(totalDistributed.toFixed(2)),
    });
  } catch (err) {
    console.error("[Admin Plans] pay-monthly error:", err);
    res.status(500).json({ error: "Failed to process monthly payout" });
  }
});

/* ─────────────────────────────────────────────────────────
   GET /api/admin/plans/:id/payouts
   Payout history for a plan, grouped by month
───────────────────────────────────────────────────────── */
router.get("/:id/payouts", async (req, res) => {
  const planId = numericId(req.params.id);
  if (planId === null) return res.status(400).json({ error: "Invalid plan ID" });

  try {
    // Get all investments for this plan to find their payout logs
    const planInvs = await db
      .select({ id: investments.id })
      .from(investments)
      .where(eq(investments.plan_id, planId));

    if (planInvs.length === 0)
      return res.json({ success: true, summary_by_month: [], payouts: [] });

    const invIds = planInvs.map((i) => i.id);

    // Drizzle doesn't support WHERE IN easily with arrays, use raw sql
    const payouts = await db
      .select({
        month_number: investment_monthly_payouts.month_number,
        roi_percent:  investment_monthly_payouts.roi_percent,
        roi_amount:   investment_monthly_payouts.roi_amount,
        paid_at:      investment_monthly_payouts.paid_at,
        user_id:      investment_monthly_payouts.user_id,
      })
      .from(investment_monthly_payouts)
      .where(
        sql`${investment_monthly_payouts.investment_id} = ANY(${invIds})`
      )
      .orderBy(investment_monthly_payouts.paid_at);

    // Group by month for summary
    const byMonth: Record<number, { month_number: number; roi_percent: number; count: number; total: number; paid_at: string }> = {};
    for (const p of payouts) {
      const m = p.month_number;
      if (!byMonth[m]) {
        byMonth[m] = { month_number: m, roi_percent: Number(p.roi_percent), count: 0, total: 0, paid_at: p.paid_at?.toISOString() ?? "" };
      }
      byMonth[m].count++;
      byMonth[m].total += Number(p.roi_amount);
    }

    res.json({
      success: true,
      summary_by_month: Object.values(byMonth).sort((a, b) => b.month_number - a.month_number),
      payouts,
    });
  } catch (err) {
    console.error("[Admin Plans] payouts error:", err);
    res.status(500).json({ error: "Failed to fetch payout history" });
  }
});

export default router;