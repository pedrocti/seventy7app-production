import { Router } from "express";
import { db } from "../../db/connection";
import { lessons } from "../../db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../utils";

const router = Router();

// GET /api/learning/lessons/:course_id
router.get("/:course_id", auth, async (req, res) => {
  try {
    const { course_id } = req.params;

    const list = await db
      .select()
      .from(lessons)
      .where(eq(lessons.course_id, Number(course_id)))
      .orderBy(lessons.sort_order);

    res.json({ success: true, lessons: list });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch lessons" });
  }
});

export default router;
