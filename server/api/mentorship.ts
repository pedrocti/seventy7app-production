import { Router } from "express";
import { db } from "../db/connection";
import { mentorship_applications } from "../db/schema";

const router = Router();

// Example: Get all mentorship applications
router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(mentorship_applications);
    res.json({ success: true, applications: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch mentorship applications" });
  }
});

export default router;
