import { Router } from "express";
import { db } from "../db/connection";
import {
  users,
  investments,
  plans,
  transactions,
  managed_portfolios,
  portfolio_allocations,
} from "../db/schema";
import { auth } from "./utils";
import { eq, desc, sql, and } from "drizzle-orm";

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

    const userBalance = Number(u.balance ?? 0) || 0;
    const userBonus = Number(u.bonus_balance ?? 0) || 0;

    // 2) ACTIVE investments (include plan name for grouping)
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

    const activeValue = activeInv.reduce((sum, inv) => {
      const amt = Number(inv.amount ?? 0) || 0;
      const prof = Number(inv.profit_loss ?? 0) || 0;
      return sum + amt + prof;
    }, 0);

    const totalActiveInvested = activeInv.reduce((sum, inv) => {
      return sum + Number(inv.amount ?? 0) || 0;
    }, 0);

    // 3) Total profit from ALL investments
    const [profitAgg] = await db
      .select({
        total_profit: sql<number>`COALESCE(SUM(${investments.profit_loss}), 0)`,
      })
      .from(investments)
      .where(eq(investments.user_id, userId));

    const totalProfit = Number(profitAgg?.total_profit ?? 0) || 0;

    // 4) Active investments count
    const activeCount = activeInv.length;

    // 5) Portfolio value
    const portfolio_value = userBalance + userBonus + activeValue;

    // 6) Build full allocation array (only one declaration, type-safe)
    const allocation: { name: string; value: number; profit_percent: number }[] = [];

    // Cash
    if (userBalance > 0) {
      allocation.push({
        name: "Cash",
        value: userBalance,
        profit_percent: 0,
      });
    }

    // Bonus
    if (userBonus > 0) {
      allocation.push({
        name: "Bonus Balance",
        value: userBonus,
        profit_percent: 0,
      });
    }

    // Investments grouped by plan name
    const invAllocMap = new Map<string, number>();
    activeInv.forEach(inv => {
      const planName = inv.plan_name || "Unknown Investment";
      const currentValue = Number(inv.amount ?? 0) + Number(inv.profit_loss ?? 0);
      invAllocMap.set(planName, (invAllocMap.get(planName) || 0) + currentValue);
    });

    invAllocMap.forEach((value, name) => {
      if (value > 0) {
        allocation.push({
          name,
          value,
          profit_percent: totalActiveInvested > 0 
            ? Number(((value / totalActiveInvested) * 100).toFixed(1)) 
            : 0,
        });
      }
    });

    // Managed portfolio assets (if exists)
    const [portfolio] = await db
      .select()
      .from(managed_portfolios)
      .where(eq(managed_portfolios.user_id, userId))
      .limit(1);

    if (portfolio) {
      const allocRows = await db
        .select({
          asset: portfolio_allocations.asset,
          percentage: portfolio_allocations.percentage,
        })
        .from(portfolio_allocations)
        .where(eq(portfolio_allocations.portfolio_id, portfolio.id));

      const totalPortfolioValue = Number(portfolio.current_value ?? portfolio.total_invested ?? 0);
      allocRows.forEach(row => {
        const pct = Number(row.percentage ?? 0) / 100;
        const assetValue = totalPortfolioValue * pct;
        if (assetValue > 0) {
          allocation.push({
            name: row.asset,
            value: assetValue,
            profit_percent: totalPortfolioValue > 0 
              ? Number(((assetValue / totalPortfolioValue) * 100).toFixed(1)) 
              : 0,
          });
        }
      });
    }

    // Debug log – remove after testing
    console.log("Generated allocation:", allocation);

    // 7) Recent transactions
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
      const amount = Number(t.amount ?? 0) || 0;
      return {
        ...t,
        amount: Number(amount.toFixed(2)),
        details: t.details || null,
      };
    });

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
      const amt = Number(r.amount ?? 0) || 0;
      const pl = Number(r.profit_loss ?? 0) || 0;
      const prog = Number(r.progress ?? 0) || 0;
      const dur = Number(r.duration_days ?? r.plan_duration_days ?? 0) || 0;
      const start = r.start_at ? new Date(r.start_at) : null;
      const endAt = start && dur ? new Date(start.getTime() + dur * 86400000) : null;
      return {
        id: r.id,
        planId: r.plan_id,
        planName: r.plan_name || "Plan",
        amount: amt,
        profit_loss: pl,
        progress: prog,
        status: r.status,
        startAt: start,
        durationDays: dur,
        endAt,
      };
    });

    // 9) Managed portfolio check
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
        balance: Number(userBalance.toFixed(2)),
        bonus_balance: Number(userBonus.toFixed(2)),
        referral_code: u.referral_code || null,
      },
      totals: {
        total_invested: Number(totalActiveInvested.toFixed(2)),
        total_profit: Number(totalProfit.toFixed(2)),
        portfolio_value: Number(portfolio_value.toFixed(2)),
        active_investments: activeCount,
      },
      allocation,  // ← now included in response!
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