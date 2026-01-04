// server/api/trades.ts
import { Router } from "express";
import { db } from "../db/connection";
import { trades } from "../db/schema";
import { auth } from "./utils";
import { eq, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.use(auth);

router.get("/", async (_req, res) => {
  try {
    // Fetch ALL active trades (no limit)
    const activeTrades = await db
      .select({
        id: trades.id,
        pair: trades.pair,
        entry_notes: trades.entry_notes,
        exit_notes: trades.exit_notes,
        status: trades.status,
        pnl_percent: trades.pnl_percent,
        created_at: trades.created_at,
        resolved_at: trades.resolved_at,
        direction: trades.direction,
        entry_price: trades.entry_price,
      })
      .from(trades)
      .where(eq(trades.status, "active"))
      .orderBy(desc(trades.created_at)); // newest first

    // History: last 10 resolved trades
    const history = await db
      .select({
        id: trades.id,
        pair: trades.pair,
        entry_notes: trades.entry_notes,
        exit_notes: trades.exit_notes,
        status: trades.status,
        pnl_percent: sql<number>`COALESCE(${trades.pnl_percent}, 0)`.as("pnl_percent"),
        created_at: trades.created_at,
        resolved_at: trades.resolved_at,
        direction: trades.direction,
        entry_price: trades.entry_price,
      })
      .from(trades)
      .where(eq(trades.status, "resolved"))
      .orderBy(desc(trades.resolved_at))
      .limit(10);

    res.json({
      success: true,
      active: activeTrades,           
      history: history || [],
    });
  } catch (err) {
    console.error("Trades fetch error:", err);
    res.status(500).json({ success: false, error: "Failed to load trades" });
  }
});

export default router;