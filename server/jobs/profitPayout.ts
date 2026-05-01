import { db } from "../db/connection";
import { investments, users, notifications } from "../db/schema";
import { eq, sql } from "drizzle-orm";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function payoutProfitsJob() {
  try {
    const activeInv = await db
      .select()
      .from(investments)
      .where(eq(investments.status, "active"));

    const now = Date.now();

    for (const inv of activeInv) {

      const startTime = new Date(inv.start_at).getTime();
      const durationMs = (inv.duration_days ?? 0) * 86400000;
      const endTime = startTime + durationMs;

      const isEnded = now >= endTime;

      const totalProfit = Number(inv.profit_loss ?? 0); // can be negative
      const alreadyPaid = Number(inv.profit_paid ?? 0);

      // -----------------------------
      // ✅ HANDLE COMPLETED INVESTMENT
      // -----------------------------
      if (isEnded) {
        const remainingProfit = totalProfit - alreadyPaid;

        const originalCapital = Number(inv.amount ?? 0);

        // final capital after profit/loss
        let finalCapital = originalCapital + remainingProfit;

        // prevent negative payout
        if (finalCapital < 0) finalCapital = 0;

        await db.transaction(async (tx) => {

          // credit final amount
          await tx.update(users).set({
            balance: sql`${users.balance} + ${finalCapital}`
          }).where(eq(users.id, inv.user_id));

          // mark investment completed
          await tx.update(investments).set({
            profit_paid: totalProfit,
            last_profit_payout_at: new Date(),
            status: "completed"
          }).where(eq(investments.id, inv.id));

          // notification
          await tx.insert(notifications).values({
            user_id: inv.user_id,
            title: "Investment Completed",
            message: `Your investment has ended. Final return: $${finalCapital.toFixed(2)} (${totalProfit >= 0 ? "profit" : "loss"}).`,
            read: false,
          });
        });

        console.log(`Final payout $${finalCapital.toFixed(2)} to user ${inv.user_id}`);
        continue;
      }

      // -----------------------------
      // ✅ MONTHLY PROFIT PAYOUT (ONLY IF POSITIVE)
      // -----------------------------
      const lastPayoutAt = inv.last_profit_payout_at
        ? new Date(inv.last_profit_payout_at).getTime()
        : startTime;

      const elapsed = now - lastPayoutAt;

      if (elapsed < THIRTY_DAYS_MS) continue;

      if (totalProfit <= 0) continue; // no interim payout on losses

      const totalPeriods = Math.ceil((inv.duration_days ?? 0) / 30) || 1;
      const profitPerPeriod = totalProfit / totalPeriods;

      const periods = Math.floor(elapsed / THIRTY_DAYS_MS);

      let profitToPay = profitPerPeriod * periods;
      const remainingProfit = totalProfit - alreadyPaid;

      if (profitToPay > remainingProfit) {
        profitToPay = remainingProfit;
      }

      if (profitToPay <= 0) continue;

      await db.transaction(async (tx) => {

        await tx.update(users).set({
          balance: sql`${users.balance} + ${profitToPay}`
        }).where(eq(users.id, inv.user_id));

        await tx.update(investments).set({
          profit_paid: sql`COALESCE(${investments.profit_paid}, 0) + ${profitToPay}`,
          last_profit_payout_at: new Date(),
        }).where(eq(investments.id, inv.id));

        await tx.insert(notifications).values({
          user_id: inv.user_id,
          title: "Profit Payout",
          message: `You received $${profitToPay.toFixed(2)} profit.`,
          read: false,
        });
      });

      console.log(`Paid $${profitToPay.toFixed(2)} profit to user ${inv.user_id}`);
    }
  } catch (err) {
    console.error("Profit payout job error:", err);
  }
}