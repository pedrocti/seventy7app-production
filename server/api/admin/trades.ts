import { Router } from "express";
import { db } from "../../db/connection";
import { trades, investments, investment_trades, plans } from "../../db/schema";
import { auth, adminOnly } from "../utils";
import { eq, and, desc } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

/* -------------------------------------------------------------
   GET: All trades + plans (id + name for dropdown)
------------------------------------------------------------- */
router.get("/", async (_req, res) => {
  try {
    const [tradeList, planList] = await Promise.all([
      db.select().from(trades).orderBy(desc(trades.created_at)),
      db.select({ id: plans.id, name: plans.name }).from(plans),
    ]);

    res.json({ success: true, trades: tradeList, plans: planList });
  } catch (err: any) {
    console.error("Admin trades fetch error:", err);
    res.status(500).json({ error: "Failed to load trades/plans" });
  }
});

/* -------------------------------------------------------------
   CREATE: New trade
------------------------------------------------------------- */
router.post("/", async (req, res) => {
  const {
    pair,
    plan_id,
    direction = "buy",
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
      : Number(entry_price);

  const cleanDirection = direction === "sell" ? "sell" : "buy";

  try {
    const [trade] = await db
      .insert(trades)
      .values({
        pair: pair.trim(),
        plan_id: numericPlanId,
        direction: cleanDirection,
        entry_price: parsedEntryPrice,
        entry_notes: entry_notes?.trim() || "",
        status: "pending",
      })
      .returning();

    res.json({ success: true, trade });
  } catch (err: any) {
    console.error("Create trade error:", err);
    res.status(500).json({
      error: "Failed to create trade",
      detail: err.message,
    });
  }
});

/* -------------------------------------------------------------
   ACTIVATE TRADE
------------------------------------------------------------- */
router.patch("/:id/activate", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid trade ID" });

  try {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    if (!trade) return res.status(404).json({ error: "Trade not found" });

    if (trade.status !== "pending") {
      return res.status(400).json({ error: "Trade is not pending" });
    }

    await db.update(trades).set({ status: "active" }).where(eq(trades.id, id));

    res.json({ success: true, message: "Trade activated" });
  } catch (err: any) {
    console.error("Activate trade error:", err);
    res.status(500).json({ error: "Failed to activate trade" });
  }
});

/* -------------------------------------------------------------
   RESOLVE TRADE + APPLY PNL
------------------------------------------------------------- */
router.patch("/:id/resolve", async (req, res) => {
  const id = Number(req.params.id);
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

    await db
      .update(trades)
      .set({
        status: "resolved",
        pnl_percent: pnlPercent.toFixed(4),
        exit_notes,
        resolved_at: new Date(),
      })
      .where(eq(trades.id, id));

    if (!trade.plan_id) {
      return res.json({
        success: true,
        message: `Trade resolved with ${pnlPercent}% (no plan_id, so no investments updated)`,
      });
    }

    const activeInvestments = await db
      .select()
      .from(investments)
      .where(and(eq(investments.plan_id, trade.plan_id), eq(investments.status, "active")));

    for (const inv of activeInvestments) {
      const current = Number(inv.amount || 0);
      const delta = Number((current * pnlPercent) / 100);
      const roundedDelta = Number(delta.toFixed(2));

      const newAmount = (current + roundedDelta).toFixed(2);
      const newProfit = (Number(inv.profit_loss || 0) + roundedDelta).toFixed(2);
      const newProgress = (Number(inv.progress || 0) + Number(pnlPercent)).toFixed(2);

      await db
        .update(investments)
        .set({ amount: newAmount, profit_loss: newProfit, progress: newProgress })
        .where(eq(investments.id, inv.id));

      await db.insert(investment_trades).values({
        investment_id: inv.id,
        trade_id: id,
        applied_amount: roundedDelta.toFixed(2),
        pnl_percent: pnlPercent.toFixed(4),
      });
    }

    const count = activeInvestments.length;

    res.json({
      success: true,
      message: `${pnlPercent > 0 ? "+" : ""}${pnlPercent}% applied to ${count} investment${count === 1 ? "" : "s"}`,
    });
  } catch (err: any) {
    console.error("Resolve trade error:", err);
    res.status(500).json({ error: "Failed to resolve trade", detail: err.message });
  }
});

export default router;
