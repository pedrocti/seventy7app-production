import { adminOnly, auth } from "../utils";
import { Router } from "express";
import { db } from "../../db/connection";
import {
  portfolio_requests,
  managed_portfolios,
  portfolio_allocations,
  users,
} from "../../db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.use(auth, adminOnly);

// =========================
//   GET: Pending Requests
// =========================
router.get("/", async (_req, res) => {
  try {
    const list = await db
      .select()
      .from(portfolio_requests)
      .where(eq(portfolio_requests.status, "pending"));

    res.json({ success: true, requests: list });
  } catch (err) {
    console.error("Fetch portfolio requests error:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// =========================
//   GET: Active Portfolios
// =========================
router.get("/portfolios", async (_req, res) => {
  try {
    const list = await db
      .select({
        id: managed_portfolios.id,
        user_id: managed_portfolios.user_id,
        asset: portfolio_allocations.asset,
        percentage: portfolio_allocations.percentage,
        duration: managed_portfolios.status,
      })
      .from(managed_portfolios)
      .innerJoin(
        portfolio_allocations,
        eq(managed_portfolios.id, portfolio_allocations.portfolio_id)
      );

    res.json({ success: true, portfolios: list });
  } catch (err) {
    console.error("Fetch portfolios error:", err);
    res.status(500).json({ error: "Failed to fetch portfolios" });
  }
});

// =========================
//   PATCH: Approve Request
// =========================
router.patch("/:id/approve", async (req, res) => {
  const requestId = Number(req.params.id);

  try {
    const [request] = await db
      .select()
      .from(portfolio_requests)
      .where(eq(portfolio_requests.id, requestId))
      .limit(1);

    if (!request || request.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Invalid or already processed request" });
    }

    const [user] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, request.user_id));

    const requestedAmount = Number(request.amount);
    const userBalance = Number(user.balance || 0);

    if (userBalance < requestedAmount) {
      return res.status(400).json({
        error: `Insufficient balance: $${userBalance} (needs $${requestedAmount})`,
      });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          balance: sql`${users.balance} - ${requestedAmount}`,
        })
        .where(eq(users.id, request.user_id));

      const [portfolio] = await tx
        .insert(managed_portfolios)
        .values({
          user_id: request.user_id,
          request_id: requestId,
          total_invested: requestedAmount,
          current_value: requestedAmount,
          profit_loss: 0,
          status: "active",
        })
        .returning();

      const allocations = [
        { asset: "crypto", percentage: 40 },
        { asset: "equity", percentage: 30 },
        { asset: "real_estate", percentage: 15 },
        { asset: "commodities", percentage: 10 },
        { asset: "bonds", percentage: 5 },
      ];

      for (const a of allocations) {
        await tx.insert(portfolio_allocations).values({
          portfolio_id: portfolio.id,
          asset: a.asset,
          percentage: a.percentage,
        });
      }

      await tx
        .update(portfolio_requests)
        .set({
          status: "approved",
          approved_at: new Date(),
        })
        .where(eq(portfolio_requests.id, requestId));
    });

    res.json({ success: true, message: "Portfolio approved & activated!" });
  } catch (err) {
    console.error("Portfolio approval error:", err);
    res.status(500).json({ error: "Failed to approve portfolio" });
  }
});

// =========================
//   PATCH: Reject Request
// =========================
router.patch("/:id/reject", async (req, res) => {
  const requestId = Number(req.params.id);

  try {
    await db
      .update(portfolio_requests)
      .set({ status: "rejected" })
      .where(eq(portfolio_requests.id, requestId));

    res.json({ success: true, message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
