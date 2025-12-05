import { Router } from "express";
import { db } from "../../db/connection";
import { learning_progress } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "../utils";

const router = Router();

/* -------------------------------------------------------
   POST /api/learning/progress/complete
   Marks a lesson as completed
-------------------------------------------------------- */
router.post("/complete", auth, async (req: any, res) => {
  try {
    const { course_id, lesson_id } = req.body;
    const userId = req.user.id;

    // Check if a record already exists
    const existing = await db
      .select()
      .from(learning_progress)
      .where(
        and(
          eq(learning_progress.user_id, userId),
          eq(learning_progress.lesson_id, lesson_id)
        )
      );

    if (existing.length > 0) {
      // update record (idempotent)
      await db
        .update(learning_progress)
        .set({
          is_completed: true,
          completed_at: new Date(),
        })
        .where(eq(learning_progress.id, existing[0].id));

      return res.json({ success: true, updated: true });
    }

    // Create new
    const [created] = await db
      .insert(learning_progress)
      .values({
        user_id: userId,
        course_id,
        lesson_id,
        is_completed: true,
        completed_at: new Date(),
      })
      .returning();

    res.json({ success: true, created });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to update progress",
    });
  }
});

/* -------------------------------------------------------
   GET /api/learning/progress/:course_id
   Returns user's completed lessons for a course
-------------------------------------------------------- */
router.get("/:course_id", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { course_id } = req.params;

    const list = await db
      .select()
      .from(learning_progress)
      .where(
        and(
          eq(learning_progress.user_id, userId),
          eq(learning_progress.course_id, Number(course_id))
        )
      );

    res.json({ success: true, progress: list });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch progress",
    });
  }
});

export default router;
