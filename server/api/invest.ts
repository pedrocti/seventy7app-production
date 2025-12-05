import { Router } from "express";
import { db } from "../db/connection";
import { users, plans, investments } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "./utils";

const router = Router();

// Apply auth middleware
router.use(auth);

// Helper: numeric subtraction (keeps existing pattern)
const subFromColumn = (col: any, amt: number) =>
  sql`COALESCE(${col},0)::numeric - ${amt}::numeric`;

// --------------------------------------------------
// POST /api/invest
// --------------------------------------------------
router.post("/", async (req, res) => {
  const { plan_id, amount, use_bonus } = req.body;
  const numAmount = Number(amount);

  if (!plan_id || Number.isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: "Invalid investment data" });
  }

  try {
    // Fetch plan
    const [plan] = await db.select().from(plans).where(eq(plans.id, plan_id));
    if (!plan) return res.status(400).json({ success: false, error: "Plan not found" });

    // Validate min/max
    if (numAmount < Number(plan.min_amount) || (plan.max_amount && numAmount > Number(plan.max_amount))) {
      return res.status(400).json({ success: false, error: `Amount must be between ${plan.min_amount} and ${plan.max_amount}` });
    }

    // Fetch user (fresh)
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const mainBalance = Number(user.balance || 0);
    const bonusBalance = Number(user.bonus_balance || 0);

    // ENFORCE BALANCE RULES:
    // - If use_bonus is false => require mainBalance >= amount
    // - If use_bonus is true  => use as much bonus as possible, require mainBalance >= remaining
    let fromBonus = 0;
    let fromMain = numAmount;

    if (use_bonus) {
      fromBonus = Math.min(bonusBalance, numAmount);
      fromMain = Math.max(0, numAmount - fromBonus);
      if (mainBalance < fromMain) {
        return res.status(400).json({ success: false, error: "Insufficient main balance to cover remaining amount after bonus" });
      }
    } else {
      // not using bonus at all — require main balance to cover full amount
      if (mainBalance < numAmount) {
        return res.status(400).json({ success: false, error: "Insufficient main balance" });
      }
      fromBonus = 0;
      fromMain = numAmount;
    }

    const startAt = new Date();

    // Deduct funds in a transaction-like sequence (single DB operations; drizzle may not support full transaction for your driver)
    // Update balances
    await db
      .update(users)
      .set({
        balance: subFromColumn(users.balance, fromMain),
        bonus_balance: subFromColumn(users.bonus_balance, fromBonus),
      })
      .where(eq(users.id, req.user.id));

    // Create ACTIVE investment
    const inserted = await db.insert(investments).values({
      user_id: req.user.id,
      plan_id,
      amount: numAmount.toString(),
      status: "active",
      progress: "0.00",
      profit_loss: "0.00",
      start_at: startAt,
      duration_days: plan.duration_days ?? 0,
    }).returning();

    // Fetch updated user balances to return to client
    const [updatedUser] = await db.select({ balance: users.balance, bonus_balance: users.bonus_balance }).from(users).where(eq(users.id, req.user.id));

    res.json({
      success: true,
      message: "Investment activated",
      investment: inserted[0] || null,
      balances: {
        balance: Number(updatedUser?.balance ?? 0),
        bonus_balance: Number(updatedUser?.bonus_balance ?? 0),
      },
    });
  } catch (err) {
    console.error("Invest error:", err);
    res.status(500).json({ success: false, error: "Failed to create investment" });
  }
});

// --------------------------------------------------
// GET /api/investments
// --------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: investments.id,
        amount: investments.amount,
        status: investments.status,
        progress: investments.progress,
        profit_loss: investments.profit_loss,   // <-- FIXED
        start_at: investments.start_at,
        duration_days: investments.duration_days,
        plan_id: plans.id,
        plan_name: plans.name,
        min_amount: plans.min_amount,
        max_amount: plans.max_amount,
        plan_duration_days: plans.duration_days,
      })
      .from(investments)
      .leftJoin(plans, eq(plans.id, investments.plan_id))
      .where(eq(investments.user_id, req.user.id));

    const investmentsWithEndDate = rows.map((inv) => {
      const start = inv.start_at ? new Date(inv.start_at) : null;
      const end =
        start && inv.duration_days
          ? new Date(start.getTime() + inv.duration_days * 86400000)
          : null;

      return { ...inv, end_at: end };  // <-- FIXED
    });

    res.json({ success: true, investments: investmentsWithEndDate });
  } catch (err) {
    console.error("Fetch investments error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch investments" });
  }
});


export default router;
