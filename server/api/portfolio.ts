// server/api/portfolio.ts
import { Router } from "express";
import { db } from "../db/connection";
import {
  managed_portfolios,
  portfolio_allocations,
  portfolio_requests,
} from "../db/schema";
import { eq } from "drizzle-orm";
import { auth } from "./utils";

const router = Router();

/* =========================
   POST /portfolio/request
=========================== */
router.post("/portfolio/request", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) < 1000) {
      return res
        .status(400)
        .json({ success: false, message: "Minimum amount is $1000" });
    }

    const result = await db
      .insert(portfolio_requests)
      .values({
        user_id: req.user.id, // ✔ now valid
        amount,
        duration: "30", // default duration
        status: "pending",
      })
      .returning();

    return res.json({ success: true, request: result[0] });
  } catch (err) {
    console.error("Portfolio request error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
});

/* =========================
   GET /portfolio
=========================== */
router.get("/", auth, async (req, res) => {
  try {
    const [portfolio] = await db
      .select()
      .from(managed_portfolios)
      .where(eq(managed_portfolios.user_id, req.user.id))
      .limit(1);

    if (!portfolio) {
      return res.json({ success: true, hasPortfolio: false });
    }

    const allocations = await db
      .select()
      .from(portfolio_allocations)
      .where(eq(portfolio_allocations.portfolio_id, portfolio.id));

    const allocMap = {
      crypto_percent: 0,
      equity_percent: 0,
      real_estate_percent: 0,
      commodities_percent: 0,
      bonds_percent: 0,
    };

    allocations.forEach((a: any) => {
      const key = `${a.asset}_percent` as keyof typeof allocMap;
      if (key in allocMap) allocMap[key] = Number(a.percentage);
    });

    const performance_percent =
      portfolio.current_value && portfolio.total_invested
        ? ((Number(portfolio.current_value) -
            Number(portfolio.total_invested)) /
            Number(portfolio.total_invested)) *
          100
        : 0;

    res.json({
      success: true,
      hasPortfolio: true,
      portfolio: {
        amount: Number(portfolio.total_invested),
        performance_percent: Number(performance_percent.toFixed(2)),
        updated_at: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        ...allocMap,
      },
    });
  } catch (err) {
    console.error("Get portfolio error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
