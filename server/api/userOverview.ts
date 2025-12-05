import { Router } from "express";
import { db } from "../db/connection";
import { users, investments, plans, transactions, managed_portfolios } from "../db/schema";
import { auth } from "./utils";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.use(auth);

// GET /api/user/overview
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // 1) User data
    const [u] = await db
      .select({
        id: users.id,
        balance: users.balance,
        bonus_balance: users.bonus_balance,
        referral_code: users.referral_code,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!u) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // 2) Fetch ACTIVE investments separately
    const activeInv = await db
      .select({
        amount: investments.amount,
        profit_loss: investments.profit_loss,
      })
      .from(investments)
      .where(eq(investments.user_id, userId))
      .where(eq(investments.status, "active"));

    const activeValue = activeInv.reduce((sum, inv) => {
      const amt = Number(inv.amount ?? 0);
      const prof = Number(inv.profit_loss ?? 0);
      return sum + (amt + prof);
    }, 0);

    const totalActiveInvested = activeInv.reduce((sum, inv) => {
      return sum + Number(inv.amount ?? 0);
    }, 0);

    // 3) Total profit from ALL investments
    const [profitAgg] = await db
      .select({
        total_profit: sql<number>`COALESCE(SUM(${investments.profit_loss}),0)`,
      })
      .from(investments)
      .where(eq(investments.user_id, userId));

    const totalProfit = Number(profitAgg?.total_profit ?? 0);

    // 4) Active investments count
    const activeCount = activeInv.length;

    // 5) Portfolio value calculation (correct)
    const portfolio_value =
      Number(u.balance ?? 0) +
      Number(u.bonus_balance ?? 0) +
      activeValue;

    // 6) Recent transactions
    const recentTx = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        status: transactions.status,
        created_at: transactions.created_at,
        details: transactions.details,
      })
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.id))
      .limit(5);

    const formattedTx = recentTx.map((t) => {
      const amount = Number(t.amount ?? 0);
      return {
        ...t,
        amount: Number(amount.toFixed(2)),
        details: t.details || null,
      };
    });

    // 7) Recent investments
    const invRows = await db
      .select({
        id: investments.id,
        amount: investments.amount,
        profit_loss: investments.profit_loss,
        progress: investments.progress,
        status: investments.status,
        start_at: investments.start_at,
        duration_days: investments.duration_days,
        plan_id: investments.plan_id,
        plan_name: plans.name,
        plan_duration_days: plans.duration_days,
      })
      .from(investments)
      .leftJoin(plans, eq(plans.id, investments.plan_id))
      .where(eq(investments.user_id, userId))
      .orderBy(desc(investments.id))
      .limit(6);

    const formattedInv = invRows.map((r) => {
      const start = r.start_at ? new Date(r.start_at) : null;
      const dur = Number(r.duration_days ?? r.plan_duration_days ?? 0);
      const endAt =
        start && dur ? new Date(start.getTime() + dur * 86400000) : null;

      return {
        id: r.id,
        planId: r.plan_id,
        planName: r.plan_name || "Plan",
        amount: Number(r.amount ?? 0),
        profit_loss: Number(r.profit_loss ?? 0),
        progress: Number(r.progress ?? 0),
        status: r.status,
        startAt: start,
        durationDays: dur,
        endAt,
      };
    });

    // 8) Managed portfolio
    let hasPortfolio = false;
    try {
      const [portfolio] = await db
        .select()
        .from(managed_portfolios)
        .where(eq(managed_portfolios.user_id, userId))
        .limit(1);

      hasPortfolio = Boolean(portfolio);
    } catch {}

    res.json({
      success: true,
      user: {
        id: u.id,
        balance: Number(u.balance ?? 0),
        bonus_balance: Number(u.bonus_balance ?? 0),
        referral_code: u.referral_code || null,
      },
      totals: {
        total_invested: Number(totalActiveInvested.toFixed(2)),
        total_profit: Number(totalProfit.toFixed(2)),
        portfolio_value: Number(portfolio_value.toFixed(2)),
        active_investments: activeCount,
      },
      recent_transactions: formattedTx,
      recent_investments: formattedInv,
      hasPortfolio,
    });
  } catch (err) {
    console.error("Overview fetch error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch overview" });
  }
});


export default router;
