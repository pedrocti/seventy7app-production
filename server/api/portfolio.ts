// server/api/portfolio.ts
import { Router } from "express";
import { db } from "../db/connection";
import {
  managed_portfolios,
  portfolio_allocations,
  portfolio_requests,
  users,
} from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "./utils";

// OPTIONAL: if notifications exist
import { createNotification } from "../utils/notifications";

const router = Router();

/* =========================
   POST /portfolio/request
=========================== */
router.post("/request", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { amount } = req.body;
    const numericAmount = Number(amount);

    // Validate amount
    if (!numericAmount || numericAmount < 25000) {
      return res.status(400).json({
        success: false,
        message: "Minimum amount is $25,000",
      });
    }

    // Check for existing pending request
    const [existingRequest] = await db
      .select({ id: portfolio_requests.id })
      .from(portfolio_requests)
      .where(
        and(
          eq(portfolio_requests.user_id, userId),
          eq(portfolio_requests.status, "pending")
        )
      )
      .limit(1);

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending portfolio request",
      });
    }

    // Get user balance
    const [user] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (Number(user.balance) < numericAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Transaction: deduct + create request
    const request = await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          balance: sql`${users.balance} - ${numericAmount}`,
        })
        .where(eq(users.id, userId));

      const [inserted] = await tx
        .insert(portfolio_requests)
        .values({
          user_id: userId,
          amount: numericAmount.toString(), // correct type for numeric
          duration: "30",
          status: "pending",
        })
        .returning();

      return inserted;
    });

    // Optional notification
    try {
      await createNotification(
        userId,
        "Portfolio Request Submitted",
        `Your portfolio management request for $${numericAmount.toLocaleString()} has been submitted and is pending approval.`
      );
    } catch (err) {
      console.warn("Notification failed:", err);
    }

    return res.json({
      success: true,
      request,
    });
  } catch (err) {
    console.error("Portfolio request error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
   GET /portfolio
=========================== */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [portfolio] = await db
      .select()
      .from(managed_portfolios)
      .where(eq(managed_portfolios.user_id, userId))
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