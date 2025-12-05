// server/api/plans.ts
import { Router } from "express";
import { db } from "../db/connection";
import { plans } from "../db/schema";

const router = Router();

// GET /api/plans
router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(plans);
    res.json({ success: true, plans: rows });
  } catch (err) {
    console.error("Fetch plans error:", err);
    res.status(500).json({ success: true, plans: [] });
  }
});

export default router;
