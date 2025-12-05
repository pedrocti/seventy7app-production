// server/db/schema.ts
import {
  pgTable,
  serial,
  text,
  varchar,
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
  email: text("email").default(""),
  password_hash: text("password_hash").notNull(),
  role: text("role").notNull().default("client"),
  balance: numeric("balance", { precision: 20, scale: 2 }).notNull().default("0.00"),
  bonus_balance: numeric("bonus_balance", { precision: 20, scale: 2 }).notNull().default("0.00"),
  referral_code: text("referral_code").unique(),
  referred_by: integer("referred_by").references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ========================= PLANS ========================= */
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  min_amount: numeric("min_amount", { precision: 20, scale: 2 }).notNull(),
  max_amount: numeric("max_amount", { precision: 20, scale: 2 }),
  description: text("description").default(""),
  duration_days: integer("duration_days").notNull().default(30),
  progress_percent: numeric("progress_percent", { precision: 6, scale: 2 })
    .notNull()
    .default("0.00"),
  profit_loss: numeric("profit_loss", { precision: 10, scale: 2 }).notNull().default("0.00"),
  last_update: timestamp("last_update", { withTimezone: true }).notNull().defaultNow(),
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
  start_at: timestamp("start_at", { withTimezone: true }).notNull(),
  duration_days: integer("duration_days").default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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

/* ====================== PAYMENT ADDRESSES ===================== */
export const paymentAddresses = pgTable("payment_addresses", {
  id: serial("id").primaryKey(),
  network: varchar("network", { length: 50 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ====================== REFERRAL SETTINGS ===================== */
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

/* ================== COURSES ================== */
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
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
  material_link: text("material_link"),
  pdf_url: text("pdf_url"),
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

/* ================== LEARNING PROGRAMS =================== */
export const learning_programs = pgTable("learning_programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default(""),
  price: numeric("price", { precision: 20, scale: 2 }).notNull(),
  duration_days: integer("duration_days").notNull().default(30),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ================== LESSON PROGRESS =================== */
export const lesson_progress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lesson_id: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").default(false),
  completed_at: timestamp("completed_at", { withTimezone: true }),
});


/* ================== ENROLLMENT ================== */
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
  grade: integer("grade"), // 0 - 100
  feedback: text("feedback").default(""),
  submitted_at: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
  graded_at: timestamp("graded_at", { withTimezone: true }),
});


/* ================== MENTORSHIP ================== */
export const mentorship_applications = pgTable("mentorship_applications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status").$type<"pending" | "approved" | "rejected">().default("pending"),
  is_paid_access: boolean("is_paid_access").default(false),
  amount_paid: numeric("amount_paid", { precision: 20, scale: 2 }).default("0.00"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});


export type PaymentAddress = typeof paymentAddresses.$inferSelect;
