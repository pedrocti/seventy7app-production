import { db } from "../db/connection";
import { users, transactions, settings } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { addToColumn } from "../api/utils";
import { createNotification } from "../utils/notifications";

type DB = typeof db;

export async function processDeposit({
  trx,
  userId,
  amount,
  provider,
  providerRef,
  existingTxReference,
  transactionId,
}: {
  trx?: DB | any; // <-- allow transaction objects too
  userId: number;
  amount: number;
  provider: "stripe" | "nowpayments";
  providerRef: string;
  existingTxReference?: string;
  transactionId?: number;
}) {
  const client = (trx ?? db) as DB;

  /* =====================================================
     1️⃣ IDEMPOTENCY CHECK (SAFE JSONB QUERY)
  ===================================================== */
  const [existing] = await client
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

  if (existing) return;

  /* =====================================================
     2️⃣ CREDIT USER BALANCE
  ===================================================== */
  await client
    .update(users)
    .set({
      balance: addToColumn(users.balance, amount),
    })
    .where(eq(users.id, userId));

  /* =====================================================
     3️⃣ LOG TRANSACTION (ONLY IF NOT EXISTING)
  ===================================================== */
  if (transactionId) {
    const [existingTx] = await client
      .select({ details: transactions.details })
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    const existingDetails = existingTx?.details ?? {};

    await client
      .update(transactions)
      .set({
        status: "completed",
        details: {
          ...existingDetails,
          provider,
          providerRef,
        },
      })
      .where(eq(transactions.id, transactionId));
  } else if (existingTxReference) {
    await client
      .update(transactions)
      .set({
        status: "completed",
        details: {
          provider,
          providerRef,
        },
      })
      .where(eq(transactions.reference, existingTxReference));
  } else {
    const reference = `dep_${Date.now()}_${userId}`;

    await client.insert(transactions).values({
      user_id: userId,
      type: "deposit",
      amount: String(amount),
      status: "completed",
      reference,
      details: {
        provider,
        providerRef,
      },
    });
  }

  /* =====================================================
     4️⃣ NOTIFY USER ABOUT DEPOSIT SUCCESS
  ===================================================== */
  await createNotification(
    userId,
    "Deposit Successful",
    `Your deposit of $${amount.toFixed(2)} has been completed.`
  );

  /* =====================================================
     5️⃣ REFERRAL BONUS (FIRST DEPOSIT ONLY)
  ===================================================== */
  const [depositCount] = await client
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.user_id, userId),
        eq(transactions.type, "deposit"),
        eq(transactions.status, "completed")
      )
    );

  if (Number(depositCount.count) !== 1) return;

  const [user] = await client
    .select({
      referred_by: users.referred_by,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user?.referred_by) return;

  const [setting] = await client
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "referral_percent"))
    .limit(1);

  const percent = Number(setting?.value ?? 0);
  if (percent <= 0) return;

  const bonus = Number(((amount * percent) / 100).toFixed(2));

  await client
    .update(users)
    .set({
      bonus_balance: addToColumn(users.bonus_balance, bonus),
    })
    .where(eq(users.id, user.referred_by));

  /* =====================================================
     6️⃣ NOTIFY REFERRER ABOUT BONUS
  ===================================================== */
  await createNotification(
    user.referred_by,
    "Referral Bonus Received",
    `You earned a $${bonus.toFixed(2)} referral bonus.`
  );
}
