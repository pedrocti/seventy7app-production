CREATE TABLE "investment_trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"investment_id" integer NOT NULL,
	"trade_id" integer NOT NULL,
	"applied_amount" numeric(20, 2) NOT NULL,
	"pnl_percent" numeric(8, 4) NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"amount" numeric(20, 2) NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"progress" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"profit_loss" numeric(20, 2) DEFAULT '0.00' NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"duration_days" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "managed_portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"request_id" integer NOT NULL,
	"total_invested" numeric(20, 2) NOT NULL,
	"current_value" numeric(20, 2) NOT NULL,
	"profit_loss" numeric(20, 2) DEFAULT '0.00',
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration_days" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "payment_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"network" varchar(50) NOT NULL,
	"address" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"min_amount" numeric(20, 2) NOT NULL,
	"max_amount" numeric(20, 2),
	"description" text DEFAULT '',
	"duration_days" integer DEFAULT 30 NOT NULL,
	"progress_percent" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"profit_loss" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"last_update" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pnl_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"percent" numeric(8, 4) NOT NULL,
	"total_profit" numeric(20, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"asset" text NOT NULL,
	"percentage" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(20, 2) NOT NULL,
	"duration" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"pair" text NOT NULL,
	"plan_id" integer,
	"direction" text DEFAULT 'buy' NOT NULL,
	"entry_price" numeric(12, 2),
	"entry_notes" text DEFAULT '',
	"exit_notes" text DEFAULT '',
	"status" text DEFAULT 'pending' NOT NULL,
	"pnl_percent" numeric(8, 4),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(20, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text DEFAULT '',
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'client' NOT NULL,
	"balance" numeric(20, 2) DEFAULT '0.00' NOT NULL,
	"bonus_balance" numeric(20, 2) DEFAULT '0.00' NOT NULL,
	"referral_code" text,
	"referred_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "investment_trades" ADD CONSTRAINT "investment_trades_investment_id_investments_id_fk" FOREIGN KEY ("investment_id") REFERENCES "public"."investments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_trades" ADD CONSTRAINT "investment_trades_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "managed_portfolios" ADD CONSTRAINT "managed_portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "managed_portfolios" ADD CONSTRAINT "managed_portfolios_request_id_portfolio_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."portfolio_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pnl_logs" ADD CONSTRAINT "pnl_logs_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_allocations" ADD CONSTRAINT "portfolio_allocations_portfolio_id_managed_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."managed_portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_requests" ADD CONSTRAINT "portfolio_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;