ALTER TABLE "users" ADD COLUMN "admin_investment_balance" numeric(20, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "admin_programs_balance" numeric(20, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "admin_mentorship_balance" numeric(20, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "admin_portfolio_balance" numeric(20, 2) DEFAULT '0.00' NOT NULL;