// server/services/depositProcessor.ts
import { db } from "../db/connection";
import { users, transactions, settings } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { addToColumn } from "../api/utils";

export async function processDeposit({
  userId,
  amount,
  provider,
  providerRef,
}: {
  userId: number;
  amount: number;
  provider: "stripe" | "nowpayments";
  providerRef: string;
}) {
  /* =====================================================
     1️⃣ IDEMPOTENCY CHECK (SAFE JSONB QUERY)
  ===================================================== */
  const [existing] = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, "deposit"),
        eq(transactions.status, "completed"),
        sql`${transactions.details}->>'provider' = ${provider}`,
        sql`${transactions.details}->>'providerRef' = ${providerRef}`
      )
    )
    .limit(1);

  if (existing) return; // ✅ webhook retry protection

  /* =====================================================
     2️⃣ CREDIT USER BALANCE
  ===================================================== */
  await db
    .update(users)
    .set({
      balance: addToColumn(users.balance, amount),
    })
    .where(eq(users.id, userId));

  /* =====================================================
     3️⃣ LOG TRANSACTION
  ===================================================== */
  await db.insert(transactions).values({
    user_id: userId,
    type: "deposit",
    amount, // ✅ REAL currency amount (NOT cents)
    status: "completed",
    details: {
      provider,
      providerRef,
    },
  });

  /* =====================================================
     4️⃣ REFERRAL BONUS (ONCE, AUTOMATIC)
  ===================================================== */
  const [user] = await db
    .select({
      referred_by: users.referred_by,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user?.referred_by) return;

  const [setting] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "referral_percent"))
    .limit(1);

  const percent = Number(setting?.value ?? 0);
  if (percent <= 0) return;

  const bonus = Number(((amount * percent) / 100).toFixed(2));

  await db
    .update(users)
    .set({
      bonus_balance: addToColumn(users.bonus_balance, bonus),
    })
    .where(eq(users.id, user.referred_by));
}
