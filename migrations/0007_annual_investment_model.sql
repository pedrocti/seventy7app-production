ALTER TABLE "investments"
  ADD COLUMN IF NOT EXISTS "term_months"      integer NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS "current_month"    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "total_earned"     numeric(20,2) NOT NULL DEFAULT '0.00',
  ADD COLUMN IF NOT EXISTS "next_payout_at"   timestamp with time zone;

ALTER TABLE "plans"
  ADD COLUMN IF NOT EXISTS "monthly_roi_percent" numeric(8,4) NOT NULL DEFAULT '0.0000';

CREATE TABLE IF NOT EXISTS "investment_monthly_payouts" (
  "id"            serial PRIMARY KEY,
  "investment_id" integer NOT NULL REFERENCES "investments"("id") ON DELETE CASCADE,
  "user_id"       integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "month_number"  integer NOT NULL,
  "roi_percent"   numeric(8,4) NOT NULL,
  "amount_paid"   numeric(20,2) NOT NULL,
  "is_final"      boolean NOT NULL DEFAULT false,
  "paid_at"       timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_imp_investment_id"
  ON "investment_monthly_payouts"("investment_id");

CREATE UNIQUE INDEX IF NOT EXISTS "idx_imp_unique_month"
  ON "investment_monthly_payouts"("investment_id", "month_number");
