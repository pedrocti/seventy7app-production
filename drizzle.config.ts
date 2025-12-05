import { defineConfig } from "drizzle-kit";
import "dotenv/config"; // ⬅ IMPORTANT: loads .env for DATABASE_URL

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

