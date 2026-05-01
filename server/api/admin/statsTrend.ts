// server/api/admin/statsTrend.ts
import { Router } from "express";
import { db } from "../../db/connection";
import { transactions } from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth, adminOnly } from "../utils";

const router = Router();
router.use(auth, adminOnly);

router.get("/", async (_req, res) => {
  try {
    // Get current year and month
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Aggregate completed deposits + profit_credit by month
    const rows = await db
      .select({
        month: sql<string>`TO_CHAR(${transactions.created_at}, 'Mon YYYY')`,
        total: sql<number>`COALESCE(SUM(${transactions.amount}::numeric),0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          eq(transactions.type, "deposit")
        )
      )
      .groupBy(sql`1`)
      .orderBy(sql`MIN(${transactions.created_at})`);

    // Map result to labels and data
    const labels: string[] = [];
    const data: number[] = [];
    rows.forEach(r => {
      labels.push(r.month);
      data.push(Number(r.total));
    });

    res.json({ success: true, labels, data });
  } catch (err) {
    console.error("Trend fetch error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch trend data" });
  }
});

export default router;
