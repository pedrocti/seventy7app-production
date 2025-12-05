// server/api/trades.ts
import { Router } from "express";
import { db } from "../db/connection";
import { trades } from "../db/schema";
import { auth } from "./utils";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Only logged-in users can access (no admin required)
router.use(auth);

// Public endpoint for users to see live + recent trades
router.get("/", async (_req, res) => {
  try {
    // Get the current active trade (if any)
    const activeTrade = await db
      .select()
      .from(trades)
      .where(eq(trades.status, "active"))
      .limit(1);

    // Get last 10 closed trades
    const history = await db
      .select()
      .from(trades)
      .where(eq(trades.status, "resolved"))
      .orderBy(desc(trades.resolved_at))
      .limit(10);

    res.json({
      success: true,
      active: activeTrade[0] || null,
      history,
    });
  } catch (err) {
    console.error("Public trades fetch error:", err);
    res.status(500).json({ error: "Failed to load trades" });
  }
});

export default router;
