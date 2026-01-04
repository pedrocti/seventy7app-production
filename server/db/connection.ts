// server/db/connection.ts
import "dotenv/config";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js"; // ESM-safe import

// =========================
// ENV SAFETY
// =========================
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

// =========================
// NEON CLIENT
// =========================
const client = neon(DATABASE_URL);

// =========================
// DRIZZLE INSTANCE
// =========================
export const db: NeonHttpDatabase<typeof schema> = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development", // ✅ safe query logging
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
  paymentAddresses,

  // learning system
  learning_programs,
  courses,
  lessons,
  program_enrollments,
} = schema;

// =========================
// CONNECTION CONFIRMATION
// =========================
if (process.env.NODE_ENV !== "test") {
  console.log("✅ Connected to Neon + Drizzle");
}
