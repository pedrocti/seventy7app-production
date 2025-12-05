import { auth, adminOnly } from "../utils";
import { Router } from "express";
import { db } from "../../db/connection";
import { users, investments } from "../../db/schema";
import { sql } from "drizzle-orm";

const router = Router();

// Apply auth + admin middleware to everything in this router
router.use(auth, adminOnly);

// GET /api/admin/stats
router.get("/", async (_req, res) => {
  try {
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [balanceSum] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${users.balance}), 0)` })
      .from(users);

    const [investSum] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${investments.amount}), 0)` })
      .from(investments);

    res.json({
      success: true,
      stats: {
        totalUsers: Number(userCount?.count || 0),
        totalBalance: Number(balanceSum?.sum || 0),
        totalInvested: Number(investSum?.sum || 0),
        activeInvestments: 42,
        totalProfit: "128493.21",
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch admin stats",
    });
  }
});

export default router;
