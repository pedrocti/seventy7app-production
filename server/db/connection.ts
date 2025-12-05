// server/db/connection.ts
import "dotenv/config";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js"; // ⚠ Keep .js for ESM at runtime

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not set in .env");
  process.exit(1);
}

// Create Neon client
const client = neon(process.env.DATABASE_URL);

// Initialize Drizzle with schema typing
export const db: NeonHttpDatabase<typeof schema> = drizzle(client, { schema });

// Re-export all tables for convenience
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
} = schema;

console.log("✅ Connected to Neon + Drizzle!");
