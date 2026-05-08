// server/jobs/profitPayout.ts
// ─────────────────────────────────────────────────────────────────────────────
// Annual Investment Monthly Payout Job
//
// Runs every 6 hours (registered in server/index.ts)
// For each active investment it checks whether 30 days have passed
// since the last payout — if so, it:
//
//   Months 1–11:
//     1. Calculate ROI = invested_amount × monthly_roi_rate
//     2. Credit ROI to user's main balance
//     3. Log the payout in investment_monthly_payouts
//     4. Increment current_month, update total_earned, profit_paid
//     5. Send in-app notification + Brevo email to user
//
//   Month 12 (final):
//     1. Same ROI calculation
//     2. ALSO return original capital to main balance
//     3. Mark investment as "completed"
//     4. Send in-app notification + Brevo email (monthly payout)
//     5. Send separate 12-month earnings summary email
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "../db/connection";
import {
  investments,
  investment_monthly_payouts,
  users,
  notifications,
  plans,
} from "../db/connection";
import { eq, sql, and } from "drizzle-orm";
import { createNotification } from "../utils/notifications";
import {
  sendBrevoEmail,
  monthlyPayoutEmail,
  investmentCompleteEmail,
} from "../services/brevo.service";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
export async function payoutProfitsJob(): Promise<void> {
  console.log("[PayoutJob] Running at", new Date().toISOString());

  try {
    // Fetch all active investments with their plan details
    const activeInvestments = await db
      .select({
        // investment fields
        id:                  investments.id,
        user_id:             investments.user_id,
        plan_id:             investments.plan_id,
        amount:              investments.amount,
        status:              investments.status,
        term_months:         investments.term_months,
        current_month:       investments.current_month,
        total_earned:        investments.total_earned,
        profit_paid:         investments.profit_paid,
        next_payout_at:      investments.next_payout_at,
        start_at:            investments.start_at,
        last_profit_payout_at: investments.last_profit_payout_at,
        // plan fields
        plan_name:           plans.name,
        plan_monthly_roi:    plans.monthly_roi_percent,
      })
      .from(investments)
      .leftJoin(plans, eq(plans.id, investments.plan_id))
      .where(eq(investments.status, "active"));

    console.log(`[PayoutJob] Found ${activeInvestments.length} active investments`);

    const now = Date.now();

    for (const inv of activeInvestments) {
      try {
        await processInvestment(inv, now);
      } catch (err) {
        // Never let one failure kill the rest
        console.error(`[PayoutJob] Failed for investment ${inv.id}:`, err);
      }
    }

    console.log("[PayoutJob] Complete");
  } catch (err) {
    console.error("[PayoutJob] Fatal error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
async function processInvestment(inv: any, now: number): Promise<void> {
  const startTime   = new Date(inv.start_at).getTime();
  const lastPayout  = inv.last_profit_payout_at
    ? new Date(inv.last_profit_payout_at).getTime()
    : startTime;

  const elapsed = now - lastPayout;

  // Not yet time for next payout
  if (elapsed < THIRTY_DAYS_MS) {
    return;
  }

  const currentMonth  = Number(inv.current_month ?? 0);
  const termMonths    = Number(inv.term_months ?? 12);
  const nextMonth     = currentMonth + 1;

  // Already completed all 12 months
  if (currentMonth >= termMonths) {
    console.log(`[PayoutJob] Investment ${inv.id} already at month ${currentMonth}/${termMonths} — skipping`);
    return;
  }

  // Guard: check if this month's payout already exists (prevents double-pay)
  const existing = await db
    .select({ id: investment_monthly_payouts.id })
    .from(investment_monthly_payouts)
    .where(
      and(
        eq(investment_monthly_payouts.investment_id, inv.id),
        eq(investment_monthly_payouts.month_number, nextMonth)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    console.log(`[PayoutJob] Month ${nextMonth} already paid for investment ${inv.id} — skipping`);
    return;
  }

  // ── ROI calculation ────────────────────────────────────────────────────────
  // Use the rate stored on the investment (snapshot at time of investment)
  // Falls back to current plan rate if not set
  const roiRate = Number(inv.plan_monthly_roi || 0);
  const principal = Number(inv.amount ?? 0);
  const roiAmount = Number(((principal * roiRate) / 100).toFixed(2));

  const isFinal   = nextMonth === termMonths;
  const totalEarnedNew = Number(inv.total_earned ?? 0) + roiAmount;

  // Fetch user for email
  const [user] = await db
    .select({
      id:         users.id,
      email:      users.email,
      first_name: users.first_name,
      username:   users.username,
    })
    .from(users)
    .where(eq(users.id, inv.user_id));

  if (!user) {
    console.error(`[PayoutJob] User ${inv.user_id} not found — skipping investment ${inv.id}`);
    return;
  }

  // ── Database transaction ───────────────────────────────────────────────────
  await db.transaction(async (tx) => {

    // 1. Credit ROI to user main balance
    let balanceCredit = roiAmount;

    if (isFinal) {
      // On final month, also return original capital
      balanceCredit += principal;
    }

    await tx
      .update(users)
      .set({
        balance: sql`COALESCE(${users.balance}, 0)::numeric + ${balanceCredit}::numeric`,
      })
      .where(eq(users.id, inv.user_id));

    // 2. Log the monthly payout
    await tx.insert(investment_monthly_payouts).values({
      investment_id: inv.id,
      user_id:       inv.user_id,
      month_number:  nextMonth,
      roi_percent:   roiRate.toFixed(4),
      amount_paid:   roiAmount.toFixed(2),
      is_final:      isFinal,
      paid_at:       new Date(),
    });

    // 3. Update investment record
    const updatePayload: any = {
      current_month:        nextMonth,
      total_earned:         totalEarnedNew.toFixed(2),
      profit_paid:          (Number(inv.profit_paid ?? 0) + roiAmount).toFixed(2),
      profit_loss:          (Number(inv.total_earned ?? 0) + roiAmount).toFixed(2),
      progress:             ((nextMonth / termMonths) * 100).toFixed(2),
      last_profit_payout_at: new Date(),
    };

    if (isFinal) {
      updatePayload.status = "completed";
    }

    await tx
      .update(investments)
      .set(updatePayload)
      .where(eq(investments.id, inv.id));

    // 4. In-app notification
    const notifTitle = isFinal
      ? "Investment Term Completed 🎉"
      : `Month ${nextMonth} Earnings Credited`;

    const notifMsg = isFinal
      ? `Your 12-month investment of $${principal.toFixed(2)} is complete. $${balanceCredit.toFixed(2)} (capital + final earnings) has been returned to your balance.`
      : `$${roiAmount.toFixed(2)} (${roiRate.toFixed(2)}% ROI) has been credited to your main balance for Month ${nextMonth}. You can now withdraw, reinvest, or let it grow.`;

    await tx.insert(notifications).values({
      user_id: inv.user_id,
      title:   notifTitle,
      message: notifMsg,
      read:    false,
    });
  });

  console.log(
    `[PayoutJob] Investment ${inv.id} — Month ${nextMonth}/${termMonths} — $${roiAmount.toFixed(2)} ROI` +
    (isFinal ? ` + $${principal.toFixed(2)} capital returned` : "")
  );

  // ── Brevo emails (outside DB transaction — don't rollback on email fail) ──

  const firstName = user.first_name || user.username || "Investor";
  const monthsRemaining = termMonths - nextMonth;

  // Monthly payout email
  if (user.email) {
    try {
      const monthlyHtml = monthlyPayoutEmail({
        firstName,
        month_number:          nextMonth,
        term_months:           termMonths,
        roi_percent:           roiRate,
        amount_paid:           roiAmount,
        invested_amount:       principal,
        plan_name:             inv.plan_name || "Investment Plan",
        total_earned_to_date:  totalEarnedNew,
        months_remaining:      monthsRemaining,
      });

      await sendBrevoEmail({
        to:          { email: user.email, name: firstName },
        subject:     isFinal
          ? `Investment Complete — $${(principal + roiAmount).toFixed(2)} Returned to Your Balance`
          : `Month ${nextMonth} Earnings: $${roiAmount.toFixed(2)} Credited`,
        htmlContent: monthlyHtml,
        userId:      user.id,
      });
    } catch (emailErr) {
      console.error(`[PayoutJob] Monthly email failed for user ${user.id}:`, emailErr);
    }
  }

  // On final month: also send the full 12-month summary email
  if (isFinal && user.email) {
    try {
      // Fetch all monthly payouts for the summary
      const allPayouts = await db
        .select()
        .from(investment_monthly_payouts)
        .where(eq(investment_monthly_payouts.investment_id, inv.id))
        .orderBy(investment_monthly_payouts.month_number);

      const summaryHtml = investmentCompleteEmail({
        firstName,
        plan_name:       inv.plan_name || "Investment Plan",
        invested_amount: principal,
        total_earned:    totalEarnedNew,
        payouts:         allPayouts.map((p) => ({
          month_number: p.month_number,
          roi_percent:  Number(p.roi_percent),
          amount_paid:  Number(p.amount_paid),
          paid_at:      p.paid_at?.toISOString() || new Date().toISOString(),
        })),
      });

      await sendBrevoEmail({
        to:          { email: user.email, name: firstName },
        subject:     `Your 12-Month Investment Summary — Total Earned: $${totalEarnedNew.toFixed(2)}`,
        htmlContent: summaryHtml,
        userId:      user.id,
      });
    } catch (summaryErr) {
      console.error(`[PayoutJob] Summary email failed for user ${user.id}:`, summaryErr);
    }
  }
}