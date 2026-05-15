// server/jobs/profitPayout.ts
// FIXES:
//   1. amount_paid  → roi_amount  (matches schema column name)
//   2. is_final     removed       (not in schema)
//   3. monthlyPayoutEmail params  aligned to brevo.service.ts signature
//   4. investmentCompleteEmail params aligned to brevo.service.ts signature
//   5. sendBrevoEmail `to` field  is Recipient[] not {email,name}

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

export async function payoutProfitsJob(): Promise<void> {
  console.log("[PayoutJob] Running at", new Date().toISOString());

  try {
    const activeInvestments = await db
      .select({
        id:                    investments.id,
        user_id:               investments.user_id,
        plan_id:               investments.plan_id,
        amount:                investments.amount,
        status:                investments.status,
        term_months:           investments.term_months,
        current_month:         investments.current_month,
        total_earned:          investments.total_earned,
        profit_paid:           investments.profit_paid,
        next_payout_at:        investments.next_payout_at,
        start_at:              investments.start_at,
        last_profit_payout_at: investments.last_profit_payout_at,
        plan_name:             plans.name,
        plan_monthly_roi:      plans.monthly_roi_percent,
      })
      .from(investments)
      .leftJoin(plans, eq(plans.id, investments.plan_id))
      .where(eq(investments.status, "active"));

    console.log(`[PayoutJob] Found ${activeInvestments.length} active investments`);

    const now = Date.now();
    for (const inv of activeInvestments) {
      try { await processInvestment(inv, now); }
      catch (err) { console.error(`[PayoutJob] Failed for investment ${inv.id}:`, err); }
    }

    console.log("[PayoutJob] Complete");
  } catch (err) {
    console.error("[PayoutJob] Fatal error:", err);
  }
}

async function processInvestment(inv: any, now: number): Promise<void> {
  const startTime  = new Date(inv.start_at).getTime();
  const lastPayout = inv.last_profit_payout_at
    ? new Date(inv.last_profit_payout_at).getTime()
    : startTime;

  if (now - lastPayout < THIRTY_DAYS_MS) return;

  const currentMonth = Number(inv.current_month ?? 0);
  const termMonths   = Number(inv.term_months ?? 12);
  const nextMonth    = currentMonth + 1;

  if (currentMonth >= termMonths) return;

  // Guard: prevent double-pay
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

  if (existing.length > 0) return;

  const roiRate       = Number(inv.plan_monthly_roi || 0);
  const principal     = Number(inv.amount ?? 0);
  const roiAmount     = Number(((principal * roiRate) / 100).toFixed(2));
  const isFinal       = nextMonth === termMonths;
  const totalEarnedNew = Number(inv.total_earned ?? 0) + roiAmount;

  const [user] = await db
    .select({ id: users.id, email: users.email, first_name: users.first_name, username: users.username })
    .from(users)
    .where(eq(users.id, inv.user_id));

  if (!user) {
    console.error(`[PayoutJob] User ${inv.user_id} not found — skipping investment ${inv.id}`);
    return;
  }

  await db.transaction(async (tx) => {
    const balanceCredit = isFinal ? roiAmount + principal : roiAmount;

    await tx.update(users)
      .set({ balance: sql`COALESCE(${users.balance}, 0)::numeric + ${balanceCredit}::numeric` })
      .where(eq(users.id, inv.user_id));

    // FIX: use roi_amount (schema column), remove is_final (not in schema)
    await tx.insert(investment_monthly_payouts).values({
      investment_id: inv.id,
      user_id:       inv.user_id,
      month_number:  nextMonth,
      roi_percent:   roiRate.toFixed(4),
      roi_amount:    roiAmount.toFixed(2),   // ← was amount_paid
      principal:     principal.toFixed(2),
      paid_at:       new Date(),
    });

    const invUpdate: any = {
      current_month:         nextMonth,
      total_earned:          totalEarnedNew.toFixed(2),
      profit_paid:           (Number(inv.profit_paid ?? 0) + roiAmount).toFixed(2),
      profit_loss:           totalEarnedNew.toFixed(2),
      progress:              ((nextMonth / termMonths) * 100).toFixed(2),
      last_profit_payout_at: new Date(),
    };
    if (isFinal) invUpdate.status = "completed";

    await tx.update(investments).set(invUpdate).where(eq(investments.id, inv.id));

    await tx.insert(notifications).values({
      user_id: inv.user_id,
      title:   isFinal ? "Investment Term Completed 🎉" : `Month ${nextMonth} Earnings Credited`,
      message: isFinal
        ? `Your 12-month investment of $${principal.toFixed(2)} is complete. $${(roiAmount + principal).toFixed(2)} returned to your balance.`
        : `$${roiAmount.toFixed(2)} (${roiRate.toFixed(2)}% ROI) credited for Month ${nextMonth}.`,
      read: false,
    });
  });

  console.log(`[PayoutJob] Investment ${inv.id} — Month ${nextMonth}/${termMonths} — $${roiAmount.toFixed(2)} ROI`
    + (isFinal ? ` + $${principal.toFixed(2)} capital returned` : ""));

  // ── Brevo emails ───────────────────────────────────────────────────────────
  const displayName    = user.first_name || user.username || "Investor";
  const monthsRemaining = termMonths - nextMonth;

  if (user.email) {
    try {
      // FIX: monthlyPayoutEmail expects `username` not `firstName`
      // FIX: sendBrevoEmail `to` is Recipient[] → [{email, name}]
      await sendBrevoEmail({
        to:          [{ email: user.email, name: displayName }],
        subject:     isFinal
          ? `Investment Complete — $${(principal + roiAmount).toFixed(2)} Returned`
          : `Month ${nextMonth} Earnings: $${roiAmount.toFixed(2)} Credited`,
        htmlContent: monthlyPayoutEmail({
          username:             displayName,
          month_number:         nextMonth,
          term_months:          termMonths,
          roi_percent:          roiRate,
          roi_amount:           roiAmount,
          principal,
          plan_name:            inv.plan_name || "Investment Plan",
          total_earned:         totalEarnedNew,
          months_remaining:     monthsRemaining,
        }),
      });
    } catch (emailErr) {
      console.error(`[PayoutJob] Monthly email failed for user ${user.id}:`, emailErr);
    }
  }

  if (isFinal && user.email) {
    try {
      const allPayouts = await db
        .select()
        .from(investment_monthly_payouts)
        .where(eq(investment_monthly_payouts.investment_id, inv.id))
        .orderBy(investment_monthly_payouts.month_number);

      await sendBrevoEmail({
        to:          [{ email: user.email, name: displayName }],
        subject:     `Your 12-Month Investment Summary — Total Earned: $${totalEarnedNew.toFixed(2)}`,
        htmlContent: investmentCompleteEmail({
          username:        displayName,
          plan_name:       inv.plan_name || "Investment Plan",
          principal,
          total_earned:    totalEarnedNew,
          start_date:      inv.start_at?.toISOString() ?? new Date().toISOString(),
          end_date:        new Date().toISOString(),
          months:          allPayouts.map(p => ({
            month:       p.month_number,
            roi_percent: Number(p.roi_percent),
            roi_amount:  Number(p.roi_amount),   // ← was amount_paid
          })),
        }),
      });
    } catch (summaryErr) {
      console.error(`[PayoutJob] Summary email failed for user ${user.id}:`, summaryErr);
    }
  }
}