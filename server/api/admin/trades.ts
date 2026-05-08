// server/api/admin/trades.ts
import { Router } from "express";
import { db } from "../../db/connection";
import {
  trades,
  investments,
  investment_trades,
  plans,
  users,
  notifications,
} from "../../db/schema";
import { auth, adminOnly } from "../utils";
import { eq, and, desc, ne } from "drizzle-orm";
import {
  sendBrevoEmailBatch,
  tradeOpenedEmail,
  tradeClosedEmail,
} from "../../services/brevo.service";

const router = Router();
router.use(auth, adminOnly);

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

/** Fetch all non-admin users with a valid email for broadcasts */
async function getAllUsers() {
  const rows = await db
    .select({
      id:       users.id,
      email:    users.email,
      username: users.username,
    })
    .from(users)
    .where(ne(users.role, "admin"));

  return rows.filter(u => u.email && u.email.trim() !== "");
}

/** Create in-app notification for a list of user IDs */
async function broadcastNotification(
  title:   string,
  message: string,
  userIds: number[]
) {
  for (const userId of userIds) {
    try {
      await db.insert(notifications).values({
        user_id: userId,
        title,
        message,
        read: false,
      });
    } catch (err) {
      console.warn(`[Trades] Notification failed for user ${userId}:`, err);
    }
  }
}

/* ─────────────────────────────────────────────────────────
   GET /api/admin/trades
   Returns all trades + plan list for dropdown
───────────────────────────────────────────────────────── */
router.get("/", async (_req, res) => {
  try {
    const [tradeList, planList] = await Promise.all([
      db.select().from(trades).orderBy(desc(trades.created_at)),
      db.select({ id: plans.id, name: plans.name }).from(plans),
    ]);
    res.json({ success: true, trades: tradeList, plans: planList });
  } catch (err: any) {
    console.error("[Admin Trades] Fetch error:", err);
    res.status(500).json({ error: "Failed to load trades/plans" });
  }
});

/* ─────────────────────────────────────────────────────────
   POST /api/admin/trades
   Create a new trade (status = pending)
   No email sent at creation — only when activated
───────────────────────────────────────────────────────── */
router.post("/", async (req, res) => {
  const {
    pair,
    plan_id,
    direction  = "buy",
    entry_price,
    entry_notes = "",
  } = req.body;

  if (!pair) {
    return res.status(400).json({ error: "pair is required" });
  }

  let numericPlanId: number | null = null;
  if (plan_id !== null && plan_id !== undefined && plan_id !== "") {
    numericPlanId = Number(plan_id);
    if (isNaN(numericPlanId)) {
      return res.status(400).json({ error: "Invalid plan_id" });
    }
    const [plan] = await db.select().from(plans).where(eq(plans.id, numericPlanId));
    if (!plan) return res.status(404).json({ error: "Plan not found" });
  }

  const parsedEntryPrice =
    entry_price === null || entry_price === undefined || entry_price === ""
      ? null
      : String(entry_price);

  try {
    const [trade] = await db
      .insert(trades)
      .values({
        pair:        pair.trim(),
        plan_id:     numericPlanId ?? null,
        direction:   direction === "sell" ? "sell" : "buy",
        entry_price: parsedEntryPrice,
        entry_notes: entry_notes?.trim() || "",
        status:      "pending",
      })
      .returning();

    res.json({ success: true, trade });
  } catch (err: any) {
    console.error("[Admin Trades] Create error:", err);
    res.status(500).json({ error: "Failed to create trade", detail: err.message });
  }
});

/* ─────────────────────────────────────────────────────────
   PATCH /api/admin/trades/:id/activate
   Activates a pending trade.
   → Emails ALL users with trade details
   → Creates in-app notification for ALL users
───────────────────────────────────────────────────────── */
router.patch("/:id/activate", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid trade ID" });

  try {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    if (!trade) return res.status(404).json({ error: "Trade not found" });
    if (trade.status !== "pending") {
      return res.status(400).json({ error: "Trade is not pending" });
    }

    // Activate the trade
    await db
      .update(trades)
      .set({ status: "active" })
      .where(eq(trades.id, id));

    // Resolve plan name
    let planName = "All Plans";
    if (trade.plan_id) {
      const [plan] = await db
        .select({ name: plans.name })
        .from(plans)
        .where(eq(plans.id, trade.plan_id));
      if (plan) planName = plan.name;
    }

    const openedAt = new Date().toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Fetch all users
    const allUsers = await getAllUsers();

    // Build email HTML
    const emailHtml = tradeOpenedEmail({
      pair:        trade.pair,
      direction:   trade.direction,
      entry_price: trade.entry_price ? String(trade.entry_price) : null,
      entry_notes: trade.entry_notes ?? "",
      plan_name:   planName,
      opened_at:   openedAt,
    });

    // Send email batch asynchronously — don't block the response
    sendBrevoEmailBatch(
      allUsers.map(u => ({ email: u.email, name: u.username })),
      `🚀 New Trade Live: ${trade.pair} ${trade.direction.toUpperCase()} | 77Kapital`,
      emailHtml
    ).catch(err => console.error("[Admin Trades] Activate email error:", err));

    // In-app notification for all users
    broadcastNotification(
      `New Trade Opened: ${trade.pair}`,
      `A ${trade.direction.toUpperCase()} position has been opened on ${trade.pair} (${planName}). Your capital is now actively working in the markets.`,
      allUsers.map(u => u.id)
    ).catch(err => console.error("[Admin Trades] Activate notification error:", err));

    res.json({
      success: true,
      message: `Trade activated. Broadcast sent to ${allUsers.length} users.`,
    });

  } catch (err: any) {
    console.error("[Admin Trades] Activate error:", err);
    res.status(500).json({ error: "Failed to activate trade" });
  }
});

/* ─────────────────────────────────────────────────────────
   PATCH /api/admin/trades/:id/resolve
   Resolves an active trade with a PnL percentage.
   → Applies PnL delta to all active investments on the plan
   → Accumulates plan.monthly_roi_percent
   → Emails ALL users with trade outcome
   → Creates in-app notification for ALL users
───────────────────────────────────────────────────────── */
router.patch("/:id/resolve", async (req, res) => {
  const id         = Number(req.params.id);
  const pnlPercent = Number(req.body?.pnl_percent);
  const exit_notes = req.body?.exit_notes?.trim() || "";

  if (isNaN(id) || isNaN(pnlPercent)) {
    return res.status(400).json({ error: "Invalid trade ID or pnl_percent" });
  }

  try {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    if (!trade) return res.status(404).json({ error: "Trade not found" });
    if (trade.status !== "active") {
      return res.status(400).json({ error: "Trade is not active" });
    }

    const resolvedAt = new Date();

    // Resolve the trade
    await db
      .update(trades)
      .set({
        status:      "resolved",
        pnl_percent: String(pnlPercent.toFixed(4)),
        exit_notes,
        resolved_at: resolvedAt,
      })
      .where(eq(trades.id, id));

    let planName      = "All Plans";
    let affectedCount = 0;

    if (trade.plan_id) {
      // Fetch plan
      const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, trade.plan_id));

      if (plan) {
        planName = plan.name;

        // Accumulate monthly_roi_percent on the plan from this trade's result
        const currentRoi = Number(plan.monthly_roi_percent ?? 0);
        const newRoi     = Number((currentRoi + pnlPercent).toFixed(4));

        await db
          .update(plans)
          .set({
            monthly_roi_percent: String(newRoi),
            profit_loss:         String(pnlPercent.toFixed(2)),
            last_update:         resolvedAt,
          })
          .where(eq(plans.id, trade.plan_id));
      }

      // Apply PnL to each active investment on this plan
      const activeInvestments = await db
        .select()
        .from(investments)
        .where(
          and(
            eq(investments.plan_id, trade.plan_id),
            eq(investments.status, "active")
          )
        );

      affectedCount = activeInvestments.length;

      for (const inv of activeInvestments) {
        const principal  = Number(inv.amount ?? 0);
        const delta      = Number(((principal * pnlPercent) / 100).toFixed(2));
        const newPnl     = Number((Number(inv.profit_loss ?? 0) + delta).toFixed(2));

        await db
          .update(investments)
          .set({ profit_loss: String(newPnl) })
          .where(eq(investments.id, inv.id));

        await db.insert(investment_trades).values({
          investment_id:  inv.id,
          trade_id:       id,
          applied_amount: String(delta.toFixed(2)),
          pnl_percent:    String(pnlPercent.toFixed(4)),
        });
      }
    }

    // Fetch all users for broadcast
    const allUsers = await getAllUsers();
    const isWin    = pnlPercent >= 0;

    const closedAt = resolvedAt.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Build email HTML
    const emailHtml = tradeClosedEmail({
      pair:        trade.pair,
      direction:   trade.direction,
      pnl_percent: pnlPercent,
      exit_notes,
      plan_name:   planName,
      closed_at:   closedAt,
    });

    // Send email batch asynchronously
    sendBrevoEmailBatch(
      allUsers.map(u => ({ email: u.email, name: u.username })),
      `📊 Trade Closed: ${trade.pair} ${isWin ? "+" : ""}${pnlPercent.toFixed(2)}% | 77Kapital`,
      emailHtml
    ).catch(err => console.error("[Admin Trades] Resolve email error:", err));

    // In-app notification
    broadcastNotification(
      `Trade Closed: ${trade.pair} ${isWin ? "✅" : "📉"}`,
      `${trade.pair} ${trade.direction.toUpperCase()} trade closed ${
        isWin ? "in profit" : "at a loss"
      } at ${isWin ? "+" : ""}${pnlPercent.toFixed(2)}%. Your monthly ROI will reflect this at your next 30-day payout cycle.`,
      allUsers.map(u => u.id)
    ).catch(err => console.error("[Admin Trades] Resolve notification error:", err));

    res.json({
      success: true,
      message: `${isWin ? "+" : ""}${pnlPercent}% applied to ${affectedCount} investment(s). Broadcast sent to ${allUsers.length} users.`,
    });

  } catch (err: any) {
    console.error("[Admin Trades] Resolve error:", err);
    res.status(500).json({ error: "Failed to resolve trade", detail: err.message });
  }
});

export default router;