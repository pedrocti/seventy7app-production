// server/db/connection.ts
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";
// =========================
// ENV SAFETY
// =========================
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}
// =========================
// POSTGRES CLIENT (NEON SAFE)
// =========================
export const sql = postgres(DATABASE_URL, {
  ssl: "require",
  prepare: false,
  connection: {
    search_path: "public",
  },
});
// =========================
// DRIZZLE INSTANCE
// =========================
export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
// =========================
// TABLE EXPORTS (SINGLE SOURCE OF TRUTH)
// =========================
export const {
  // ── original exports ──
  users,
  plans,
  investments,
  trades,
  transactions,
  settings,
  portfolio_requests,
  managed_portfolios,
  portfolio_allocations,
  learning_programs,
  courses,
  lessons,
  program_enrollments,
  // ── new model fields ──
  investment_monthly_payouts,
  investment_trades,
  pnl_logs,
  notifications,
  email_verification_tokens,
  email_logs,
  email_settings,
  email_templates,
  enrollments,
  lesson_progress,
  assignments,
  assignment_submissions,
  mentorship_applications,
  mentorship_events,
  bonus_codes,
  bonus_code_usages,
  payment_providers,
  payment_intents,
  payment_webhooks,
  // ── blog ──
  blog_posts,
  loan_applications,
  loan_settings,
  // ── loans ──
} = schema;
if (process.env.NODE_ENV !== "test") {
  console.log("✅ Connected to Postgres + Drizzle (public schema)");
}