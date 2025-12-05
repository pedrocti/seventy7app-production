import { Router } from "express";
import { db } from "../../db/connection";
import { investments, users, plans } from "../../db/schema";
import { auth, adminOnly } from "../utils";
import { eq } from "drizzle-orm";

const router = Router();

// protect all routes
router.use(auth, adminOnly);

// GET /api/admin/investments
router.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select({
        investment_id: investments.id,
        investment_user_id: investments.user_id,
        investment_plan_id: investments.plan_id,
        investment_amount: investments.amount,
        investment_status: investments.status,
        investment_progress: investments.progress,
        investment_profit_loss: investments.profit_loss,
        investment_start_at: investments.start_at,
        investment_created_at: investments.created_at,

        user_username: users.username,
        user_id: users.id,

        plan_name: plans.name,
        plan_id: plans.id,
      })
      .from(investments)
      .leftJoin(users, eq(users.id, investments.user_id))
      .leftJoin(plans, eq(plans.id, investments.plan_id))
      .orderBy(investments.id);

    res.json({ success: true, investments: rows });
  } catch (err) {
    console.error("Admin fetch investments error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch investments" });
  }
});

export default router;
