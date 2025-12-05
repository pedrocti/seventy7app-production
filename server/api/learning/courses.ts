import { Router } from "express";
import { db } from "../../db/connection";
import { courses } from "../../db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../utils";

const router = Router();

// GET /api/learning/courses
router.get("/", async (_req, res) => {
  try {
    const list = await db
      .select()
      .from(courses)
      .where(eq(courses.is_active, true))
      .orderBy(courses.id);

    res.json({ success: true, courses: list });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch courses" });
  }
});

export default router;
