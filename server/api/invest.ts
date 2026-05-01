import { Router } from "express";
import { db } from "../db/connection";
import {
  users,
  plans,
  investments,
  settings,
  transactions,
} from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "./utils";

// OPTIONAL: if notifications exist
import { createNotification } from "../utils/notifications";

const router = Router();

// Apply auth middleware
router.use(auth);

// Helper: numeric subtraction
const subFromColumn = (col: any, amt: number) =>
  sql`COALESCE(${col},0)::numeric - ${amt}::numeric`;

// --------------------------------------------------
// POST /api/invest
// --------------------------------------------------
router.post("/", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const { plan_id, amount, use_bonus } = req.body;
  const numAmount = Number(amount);

  if (!plan_id || Number.isNaN(numAmount) || numAmount <= 0) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid investment data" });
  }

  try {
    // Fetch plan
    const [plan] = await db.select().from(plans).where(eq(plans.id, plan_id));
    if (!plan) {
      return res.status(400).json({ success: false, error: "Plan not found" });
    }

    // Validate min/max
    if (
      numAmount < Number(plan.min_amount) ||
      (plan.max_amount && numAmount > Number(plan.max_amount))
    ) {
      return res.status(400).json({
        success: false,
        error: `Amount must be between ${plan.min_amount} and ${plan.max_amount}`,
      });
    }

    // Fetch user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const mainBalance = Number(user.balance || 0);
    const bonusBalance = Number(user.bonus_balance || 0);

    let fromBonus = 0;
    let fromMain = numAmount;

    if (use_bonus) {
      fromBonus = Math.min(bonusBalance, numAmount);
      fromMain = Math.max(0, numAmount - fromBonus);

      if (mainBalance < fromMain) {
        return res.status(400).json({
          success: false,
          error:
            "Insufficient main balance to cover remaining amount after bonus",
        });
      }
    } else {
      if (mainBalance < numAmount) {
        return res
          .status(400)
          .json({ success: false, error: "Insufficient main balance" });
      }
    }

    const startAt = new Date();

    // Deduct balances + create investment in transaction
    const [inserted] = await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          balance: subFromColumn(users.balance, fromMain),
          bonus_balance: subFromColumn(users.bonus_balance, fromBonus),
        })
        .where(eq(users.id, userId));

      const inv = await tx
        .insert(investments)
        .values({
          user_id: userId,
          plan_id,
          amount: numAmount.toString(),
          status: "active",
          progress: "0.00",
          profit_loss: "0.00",
          start_at: startAt,
          duration_days: plan.duration_days ?? 0,
        })
        .returning();

      return inv;
    });

    // --------------------------------------------------
    // REFERRAL BONUS (FIRST INVESTMENT ONLY)
    // --------------------------------------------------
    const existingInvestments = await db
      .select({ id: investments.id })
      .from(investments)
      .where(eq(investments.user_id, userId))
      .limit(2);

    const isFirstInvestment = existingInvestments.length === 1;

    if (isFirstInvestment && user.referred_by) {
      const [setting] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, "referral_reward_percent"));

      const percent = setting ? Number(setting.value) : 10;
      const bonusAmount = numAmount * (percent / 100);

      // Credit referrer bonus balance
      await db
        .update(users)
        .set({
          bonus_balance: sql`COALESCE(${users.bonus_balance},0) + ${bonusAmount}`,
        })
        .where(eq(users.id, user.referred_by));

      // Log referral transaction
      await db.insert(transactions).values({
        user_id: user.referred_by,
        type: "referral_bonus",
        amount: String(Math.round(bonusAmount * 100)),
        status: "completed",
        reference: `referral_bonus_${Date.now()}`,
        details: { source_investment_id: inserted.id },
      });
    }

    // ---------------------------
    // NOTIFY USER: INVESTMENT CREATED
    // ---------------------------
    try {
      await createNotification(
        userId,
        "Investment Activated",
        `Your investment of $${numAmount.toLocaleString()} has been activated.`
      );
    } catch (err) {
      console.warn("Notification failed:", err);
    }

    // Fetch updated balances
    const [updatedUser] = await db
      .select({
        balance: users.balance,
        bonus_balance: users.bonus_balance,
      })
      .from(users)
      .where(eq(users.id, userId));

    return res.json({
      success: true,
      message: "Investment activated",
      investment: inserted || null,
      balances: {
        balance: Number(updatedUser?.balance ?? 0),
        bonus_balance: Number(updatedUser?.bonus_balance ?? 0),
      },
    });

  } catch (err) {
    console.error("Invest error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to create investment" });
  }
});

// --------------------------------------------------
// GET /api/investments
// --------------------------------------------------
router.get("/", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const rows = await db
      .select({
        id: investments.id,
        amount: investments.amount,
        status: investments.status,
        progress: investments.progress,
        profit_loss: investments.profit_loss,
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
      .where(eq(investments.user_id, userId));

    const investmentsWithEndDate = rows.map((inv) => {
      const start = inv.start_at ? new Date(inv.start_at) : null;
      const end =
        start && inv.duration_days
          ? new Date(start.getTime() + inv.duration_days * 86400000)
          : null;

      return { ...inv, end_at: end };
    });

    res.json({ success: true, investments: investmentsWithEndDate });
  } catch (err) {
    console.error("Fetch investments error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch investments" });
  }
});

export default router;
