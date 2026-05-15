// server/db/schema.ts
import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

/* ========================= USERS ========================= */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().default(""),
  password_hash: text("password_hash").notNull(),
  role: text("role").notNull().default("client"),
  balance: numeric("balance", { precision: 20, scale: 2 }).notNull().default("0.00"),
  bonus_balance: numeric("bonus_balance", { precision: 20, scale: 2 }).notNull().default("0.00"),
  referral_code: text("referral_code").unique(),
  referred_by: integer("referred_by"),
  first_name: text("first_name"),
  last_name: text("last_name"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  email_verified_at: timestamp("email_verified_at"),
  google_id: text("google_id").unique(),
  admin_investment_balance: numeric("admin_investment_balance", { precision: 20, scale: 2 }).notNull().default("0.00"),
  admin_programs_balance: numeric("admin_programs_balance", { precision: 20, scale: 2 }).notNull().default("0.00"),
  admin_mentorship_balance: numeric("admin_mentorship_balance", { precision: 20, scale: 2 }).notNull().default("0.00"),
  admin_portfolio_balance: numeric("admin_portfolio_balance", { precision: 20, scale: 2 }).notNull().default("0.00"),
});

/* ========================= PLANS ========================= */
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  min_amount: numeric("min_amount", { precision: 20, scale: 2 }).notNull(),
  max_amount: numeric("max_amount", { precision: 20, scale: 2 }),
  description: text("description").default(""),
  duration_days: integer("duration_days").notNull().default(365),
  progress_percent: numeric("progress_percent", { precision: 6, scale: 2 }).notNull().default("0.00"),
  profit_loss: numeric("profit_loss", { precision: 10, scale: 2 }).notNull().default("0.00"),
  last_update: timestamp("last_update", { withTimezone: true }).notNull().defaultNow(),

  // Original single-value ROI — kept so payout job fallback still works
  monthly_roi_percent: numeric("monthly_roi_percent", { precision: 8, scale: 4 }).notNull().default("0.0000"),

  // NEW: ROI range — admin sets these, mid-point used for projections
  min_monthly_roi: numeric("min_monthly_roi", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  max_monthly_roi: numeric("max_monthly_roi", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  min_total_roi:   numeric("min_total_roi",   { precision: 8, scale: 4 }).notNull().default("0.0000"),
  max_total_roi:   numeric("max_total_roi",   { precision: 8, scale: 4 }).notNull().default("0.0000"),
});

/* ======================= INVESTMENTS ====================== */
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan_id: integer("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"),
  progress: numeric("progress", { precision: 6, scale: 2 }).notNull().default("0.00"),
  profit_loss: numeric("profit_loss", { precision: 20, scale: 2 }).notNull().default("0.00"),
  profit_paid: numeric("profit_paid", { precision: 20, scale: 2 }).notNull().default("0.00"),
  start_at: timestamp("start_at", { withTimezone: true }).notNull(),
  duration_days: integer("duration_days").default(365),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  last_profit_payout_at: timestamp("last_profit_payout_at", { withTimezone: true }),
  // ── NEW: annual model fields ──
  term_months: integer("term_months").notNull().default(12),
  current_month: integer("current_month").notNull().default(0),
  total_earned: numeric("total_earned", { precision: 20, scale: 2 }).notNull().default("0.00"),
  next_payout_at: timestamp("next_payout_at", { withTimezone: true }),
  monthly_roi_rate: numeric("monthly_roi_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
});

/* ================== INVESTMENT MONTHLY PAYOUTS ================== */
// Logs each monthly payout for the 12-month summary email
export const investment_monthly_payouts = pgTable("investment_monthly_payouts", {
  id: serial("id").primaryKey(),
  investment_id: integer("investment_id")
    .notNull()
    .references(() => investments.id, { onDelete: "cascade" }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  month_number: integer("month_number").notNull(),        // 1..12
  roi_percent: numeric("roi_percent", { precision: 8, scale: 4 }).notNull(),
  roi_amount: numeric("roi_amount", { precision: 20, scale: 2 }).notNull(),
  principal: numeric("principal", { precision: 20, scale: 2 }).notNull(),
  paid_at: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ========================= PNL LOGS ======================== */
export const pnl_logs = pgTable("pnl_logs", {
  id: serial("id").primaryKey(),
  plan_id: integer("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  percent: numeric("percent", { precision: 8, scale: 4 }).notNull(),
  total_profit: numeric("total_profit", { precision: 20, scale: 2 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ======================= TRANSACTIONS ======================= */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  details: jsonb("details").notNull().default({}),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ================== PORTFOLIO REQUESTS =================== */
export const portfolio_requests = pgTable("portfolio_requests", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
  duration: text("duration").notNull(),
  status: text("status").notNull().default("pending"),
  requested_at: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  approved_at: timestamp("approved_at", { withTimezone: true }),
});

/* ================== MANAGED PORTFOLIOS =================== */
export const managed_portfolios = pgTable("managed_portfolios", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  request_id: integer("request_id")
    .notNull()
    .references(() => portfolio_requests.id),
  total_invested: numeric("total_invested", { precision: 20, scale: 2 }).notNull(),
  current_value: numeric("current_value", { precision: 20, scale: 2 }).notNull(),
  profit_loss: numeric("profit_loss", { precision: 20, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("active"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  duration_days: integer("duration_days").default(0),
});

/* ================== PORTFOLIO ALLOCATIONS =================== */
export const portfolio_allocations = pgTable("portfolio_allocations", {
  id: serial("id").primaryKey(),
  portfolio_id: integer("portfolio_id")
    .notNull()
    .references(() => managed_portfolios.id, { onDelete: "cascade" }),
  asset: text("asset").notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
});

/* ====================== SETTINGS ===================== */
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ====================== TRADES ====================== */
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  pair: text("pair").notNull(),
  plan_id: integer("plan_id").references(() => plans.id, { onDelete: "set null" }),
  direction: text("direction").$type<"buy" | "sell">().notNull().default("buy"),
  entry_price: numeric("entry_price", { precision: 12, scale: 2 }),
  entry_notes: text("entry_notes").default(""),
  exit_notes: text("exit_notes").default(""),
  status: text("status").$type<"pending" | "active" | "resolved">().notNull().default("pending"),
  pnl_percent: numeric("pnl_percent", { precision: 8, scale: 4 }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolved_at: timestamp("resolved_at", { withTimezone: true }),
});

/* ================== INVESTMENT_TRADES ================== */
export const investment_trades = pgTable("investment_trades", {
  id: serial("id").primaryKey(),
  investment_id: integer("investment_id")
    .notNull()
    .references(() => investments.id, { onDelete: "cascade" }),
  trade_id: integer("trade_id")
    .notNull()
    .references(() => trades.id, { onDelete: "cascade" }),
  applied_amount: numeric("applied_amount", { precision: 20, scale: 2 }).notNull(),
  pnl_percent: numeric("pnl_percent", { precision: 8, scale: 4 }).notNull(),
  applied_at: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ================== LEARNING PROGRAMS =================== */
export const learning_programs = pgTable("learning_programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default(""),
  price: numeric("price", { precision: 20, scale: 2 }).notNull(),
  duration_days: integer("duration_days").notNull().default(30),
  is_active: boolean("is_active").default(true),
  thumbnail_url: text("thumbnail_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== COURSES ================== */
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  program_id: integer("program_id")
    .references(() => learning_programs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").default(""),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== LESSONS ================== */
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  course_id: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").default(""),
  video_url: text("video_url"),
  external_link: text("external_link"),
  pdf_url: text("pdf_url"),
  has_assignment: boolean("has_assignment").default(false),
  sort_order: integer("sort_order").default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== PROGRAM ENROLLMENTS ================== */
export const program_enrollments = pgTable("program_enrollments", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  program_id: integer("program_id").notNull().references(() => learning_programs.id, { onDelete: "cascade" }),
  status: text("status").$type<"active" | "completed">().default("active"),
  progress_percent: numeric("progress_percent", { precision: 5, scale: 2 }).default("0"),
  enrolled_at: timestamp("enrolled_at", { withTimezone: true }).defaultNow(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  amount_paid: numeric("amount_paid", { precision: 20, scale: 2 }).notNull().default("0.00"),
});

/* ================== LESSON PROGRESS =================== */
export const lesson_progress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lesson_id: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").default(false),
  completed_at: timestamp("completed_at", { withTimezone: true }),
});

/* ================== ENROLLMENTS ================== */
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  course_id: integer("course_id")
    .notNull()
    .references(() => courses.id),
  status: text("status").$type<"active" | "completed">().default("active"),
  progress_percent: numeric("progress_percent", { precision: 5, scale: 2 }).default("0"),
  enrolled_at: timestamp("enrolled_at", { withTimezone: true }).defaultNow(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
});

/* ================== ASSIGNMENTS ================== */
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  course_id: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").default(""),
  due_date: timestamp("due_date", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== ASSIGNMENT SUBMISSIONS ================== */
export const assignment_submissions = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  assignment_id: integer("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  grade: integer("grade"),
  feedback: text("feedback").default(""),
  submitted_at: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
  graded_at: timestamp("graded_at", { withTimezone: true }),
  status: text("status").notNull().default("pending").$type<"pending" | "graded" | "rejected">(),
});

/* ================== MENTORSHIP ================== */
export const mentorship_applications = pgTable("mentorship_applications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  event_id: integer("event_id").references(() => mentorship_events.id),
  status: text("status").$type<"pending" | "approved" | "rejected">().default("pending"),
  is_paid_access: boolean("is_paid_access").default(false),
  amount_paid: numeric("amount_paid", { precision: 20, scale: 2 }).default("0.00"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const mentorship_events = pgTable("mentorship_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  time: text("time").notNull(),
  venue: text("venue").notNull(),
  link: text("link"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== EMAIL SETTINGS ================== */
export const email_settings = pgTable("email_settings", {
  id: serial("id").primaryKey(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  from_email: text("from_email").notNull(),
  from_name: text("from_name").notNull(),
  encryption: text("encryption").default("tls"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== EMAIL TEMPLATES ================== */
export const email_templates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== EMAIL LOGS ================== */
export const email_logs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  to_email: text("to_email").notNull(),
  subject: text("subject").notNull(),
  status: text("status").default("sent"),
  error: text("error"),
  sent_at: timestamp("sent_at", { withTimezone: true }).defaultNow(),
});

/* ================== EMAIL VERIFICATION TOKENS ================== */
export const email_verification_tokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  type: text("type").$type<"verify" | "reset">().notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== BONUS CODES ================== */
export const bonus_codes = pgTable("bonus_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").$type<"percentage" | "fixed">().notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  max_uses: integer("max_uses"),
  used_count: integer("used_count").default(0),
  expires_at: timestamp("expires_at", { withTimezone: true }),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== BONUS CODE USAGES ================== */
export const bonus_code_usages = pgTable("bonus_code_usages", {
  id: serial("id").primaryKey(),
  bonus_code_id: integer("bonus_code_id")
    .notNull()
    .references(() => bonus_codes.id, { onDelete: "cascade" }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  program_id: integer("program_id")
    .references(() => learning_programs.id),
  used_at: timestamp("used_at", { withTimezone: true }).defaultNow(),
});

/* ================== PAYMENT PROVIDERS ================== */
export const payment_providers = pgTable("payment_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  config: jsonb("config").notNull(),
  is_enabled: boolean("is_enabled").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== PAYMENT INTENTS ================== */
export const payment_intents = pgTable("payment_intents", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  provider: text("provider").notNull(),
  provider_ref: text("provider_ref").notNull(),
  amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  metadata: jsonb("metadata").default({}),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== PAYMENT WEBHOOKS ================== */
export const payment_webhooks = pgTable("payment_webhooks", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(),
  payload: jsonb("payload").notNull(),
  received_at: timestamp("received_at", { withTimezone: true }).defaultNow(),
});

/* ================== NOTIFICATIONS ================== */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

/* ================== BLOG POSTS ================== */
export const blog_posts = pgTable("blog_posts", {
  id:           serial("id").primaryKey(),
  title:        text("title").notNull(),
  slug:         text("slug").notNull().unique(),
  tag:          text("tag").notNull().default("Insights"),
  excerpt:      text("excerpt").notNull(),
  content:      text("content").notNull(),
  image_url:    text("image_url"),
  author:       text("author").notNull().default("Seventy7 Kapital"),
  published:    boolean("published").notNull().default(false),
  published_at: timestamp("published_at", { withTimezone: true }),
  created_at:   timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at:   timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

/* ================== LOAN APPLICATIONS ================== */
export const loan_applications = pgTable("loan_applications", {
  id:              serial("id").primaryKey(),
  user_id:         integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount:          numeric("amount", { precision: 20, scale: 2 }).notNull(),
  interest_rate:   numeric("interest_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  duration_months: integer("duration_months").notNull().default(12),
  status:          text("status").notNull().default("pending"),
  purpose:         text("purpose"),
  admin_notes:     text("admin_notes"),
  approved_at:     timestamp("approved_at", { withTimezone: true }),
  due_at:          timestamp("due_at", { withTimezone: true }),
  created_at:      timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at:      timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

/* ================== LOAN SETTINGS ================== */
export const loan_settings = pgTable("loan_settings", {
  id:             serial("id").primaryKey(),
  interest_rate:  numeric("interest_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  min_investment: numeric("min_investment", { precision: 20, scale: 2 }).notNull().default("5000.00"),
  max_loan_pct:   numeric("max_loan_pct", { precision: 5, scale: 2 }).notNull().default("50.00"),
  updated_at:     timestamp("updated_at", { withTimezone: true }).defaultNow(),
});