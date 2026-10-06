import { Router } from "express";
import { db } from "../db/connection";
import {
  users,
  investments,
  plans,
  transactions,
  managed_portfolios,
  portfolio_allocations,
  notifications,
} from "../db/schema";
import { auth } from "./utils";
import { eq, desc, sql, and } from "drizzle-orm";

const router = Router();
router.use(auth);

// -------------------------
// GET /api/user/overview
// -------------------------
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    // 1) User
    const [u] = await db
      .select({
        id: users.id,
        username: users.username, // ✅ greeting support
        balance: users.balance,
        bonus_balance: users.bonus_balance,
        referral_code: users.referral_code,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!u) return res.status(404).json({ success: false, error: "User not found" });

    const userBalance = Number(u.balance ?? 0);
    const userBonus = Number(u.bonus_balance ?? 0);

    // 2) Active investments
    const activeInv = await db
      .select({
        amount: investments.amount,
        profit_loss: investments.profit_loss,
        plan_name: plans.name,
      })
      .from(investments)
      .leftJoin(plans, eq(plans.id, investments.plan_id))
    .where(
      and(
        eq(investments.user_id, userId),
        eq(investments.status, "active") 
      )
    );


    // Active stake value = principal only (locked capital)
    // profit_loss on investment record is admin-set display value, not cash
    // Actual paid ROI already credited to users.balance
    const activeValue = activeInv.reduce(
      (sum, i) => sum + Number(i.amount ?? 0),
      0
    );

    const totalActiveInvested = activeInv.reduce(
      (sum, i) => sum + Number(i.amount ?? 0),
      0
    );

    // 3) Profit + performance
    const [investAgg] = await db
      .select({
        total_invested: sql<number>`COALESCE(SUM(${investments.amount}), 0)`,
        total_profit: sql<number>`COALESCE(SUM(${investments.total_earned}), 0)`,
      })
      .from(investments)
      .where(eq(investments.user_id, userId));

    const totalInvested = Number(investAgg?.total_invested ?? 0);
    const totalProfit = Number(investAgg?.total_profit ?? 0);

    const performance = totalInvested === 0
      ? 0
      : (totalProfit / totalInvested) * 100;

    // portfolio value = withdrawable cash + locked active stakes
    const portfolio_value = userBalance + activeValue;


    
    // 4) Allocation
    const allocation: { name: string; value: number; profit_percent: number }[] = [];

    if (userBalance > 0) allocation.push({ name: "Cash", value: userBalance, profit_percent: 0 });
    if (userBonus > 0) allocation.push({ name: "Bonus Balance", value: userBonus, profit_percent: 0 });

    const invAlloc = new Map<string, number>();
    activeInv.forEach(i => {
      const key = i.plan_name || "Investment";
      invAlloc.set(key, (invAlloc.get(key) || 0) + Number(i.amount ?? 0) + Number(i.profit_loss ?? 0));
    });

    invAlloc.forEach((value, name) => {
      allocation.push({
        name,
        value,
        profit_percent: totalActiveInvested
          ? Number(((value / totalActiveInvested) * 100).toFixed(1))
          : 0,
      });
    });

    // 5) Managed portfolio
    const [portfolio] = await db
      .select()
      .from(managed_portfolios)
      .where(eq(managed_portfolios.user_id, userId))
      .limit(1);

    if (portfolio) {
      const rows = await db
        .select()
        .from(portfolio_allocations)
        .where(eq(portfolio_allocations.portfolio_id, portfolio.id));

      const totalVal = Number(portfolio.current_value ?? portfolio.total_invested ?? 0);

      rows.forEach(r => {
        const value = totalVal * (Number(r.percentage ?? 0) / 100);
        if (value > 0) {
          allocation.push({
            name: r.asset,
            value,
            profit_percent: totalVal
              ? Number(((value / totalVal) * 100).toFixed(1))
              : 0,
          });
        }
      });
    }

    // 6) Transactions
    const recentTx = await db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.id))
      .limit(5);

    const notificationsList = await db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId)) 
    .orderBy(desc(notifications.created_at))
    .limit(10);

    // 8) Recent investments
    const invRows = await db
    .select({
      id: investments.id,
      amount: investments.amount,
      profit_loss: investments.profit_loss,
      progress: investments.progress,
      status: investments.status,
      start_at: investments.start_at,
      duration_days: investments.duration_days,
      plan_name: plans.name,
    })
    .from(investments)
    .leftJoin(plans, eq(plans.id, investments.plan_id))
    .where(eq(investments.user_id, userId))
    .orderBy(desc(investments.id))
    .limit(6);

    // Compute timeline fields
    const now = Date.now();

    const computedInv = invRows.map(inv => {
      const start = new Date(inv.start_at).getTime();

      const durationDays = Number(inv.duration_days ?? 30);
      const end = start + durationDays * 86400 * 1000;

      const totalMs = Math.max(1, end - start);
      const elapsedMs = Math.max(0, Math.min(now - start, totalMs));
      const progressPercent = Math.min(100, Math.round((elapsedMs / totalMs) * 100));

      const daysLeft = Math.max(0, Math.ceil((end - now) / (24 * 60 * 60 * 1000)));

      const isCompleted = now >= end;

      return {
        ...inv,
        endAt: new Date(end).toISOString(),
        progressPercent,
        daysLeft,
        isCompleted,
      };
    });

    // 9) Portfolio existence
    const hasPortfolio = Boolean(portfolio);

    res.json({
      success: true,
      user: {
        id: u.id,
        username: u.username || "User",
        balance: userBalance.toFixed(2),
        bonus_balance: userBonus.toFixed(2),
        referral_code: u.referral_code ?? "",
      },
      totals: {
        total_profit: totalProfit.toFixed(2),
        total_invested: totalInvested.toFixed(2),
        portfolio_value: portfolio_value.toFixed(2),
        active_investments: activeInv.length,
        performance: `${performance.toFixed(2)}%`,
      },
      allocation,
      notifications: notificationsList,
      recent_transactions: recentTx,
      recent_investments: computedInv,
      hasPortfolio,
    });

  } catch (err) {
    console.error("Overview error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch overview" });
  }
});

// -------------------------
// PATCH /api/user/notifications/:id/read
// -------------------------
router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const userId = req.user?.id;
    const notifId = Number(req.params.id);
    if (!userId || Number.isNaN(notifId)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notifId),
        eq(notifications.user_id, userId) 
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Notification update error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
