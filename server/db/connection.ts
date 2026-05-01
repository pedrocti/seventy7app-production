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
// - Neon requires SSL
// - search_path MUST be public (do NOT use pgSchema("public"))
export const sql = postgres(DATABASE_URL, {
  ssl: "require",
  prepare: false, // recommended for Neon
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
} = schema;

if (process.env.NODE_ENV !== "test") {
  console.log("✅ Connected to Postgres + Drizzle (public schema)");
}
