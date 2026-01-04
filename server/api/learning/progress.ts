// server/api/learning/progress.ts
import { Router } from "express";
import { db } from "../../db/connection"; // FIXED: from api/learning → server/db/connection.ts
import { lesson_progress, lessons, assignments, assignment_submissions } from "../../db/schema"; // FIXED: schema is in server/db/
import { eq, and, count } from "drizzle-orm";
import { auth } from "../utils"; // FIXED: from api/learning → server/api/utils.ts

const router = Router();

/* -------------------------------------------------------
   POST /api/learning/progress/complete
   Marks a lesson as completed (create or update)
-------------------------------------------------------- */
router.post("/complete", auth, async (req: any, res) => {
  try {
    const { lesson_id } = req.body;
    const userId = req.user.id;

    if (!lesson_id) {
      return res.status(400).json({ success: false, error: "lesson_id is required" });
    }

    const existing = await db
      .select()
      .from(lesson_progress)
      .where(
        and(
          eq(lesson_progress.user_id, userId),
          eq(lesson_progress.lesson_id, lesson_id)
        )
      );

    if (existing.length > 0) {
      await db
        .update(lesson_progress)
        .set({ completed: true, completed_at: new Date() })
        .where(eq(lesson_progress.id, existing[0].id));
      return res.json({ success: true, updated: true });
    }

    const [created] = await db
      .insert(lesson_progress)
      .values({
        user_id: userId,
        lesson_id,
        completed: true,
        completed_at: new Date(),
      })
      .returning();

    res.json({ success: true, created });
  } catch (err) {
    console.error("POST /learning/progress/complete error:", err);
    res.status(500).json({ success: false, error: "Failed to update progress" });
  }
});

/* -------------------------------------------------------
   GET /api/learning/progress/:course_id
   Returns user's progress for a course
-------------------------------------------------------- */
router.get("/:course_id", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const courseId = Number(req.params.course_id);

    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, error: "Invalid course ID" });
    }

    const completedLessons = await db
      .select({
        lesson_id: lesson_progress.lesson_id,
        completed_at: lesson_progress.completed_at,
        title: lessons.title,
      })
      .from(lesson_progress)
      .leftJoin(lessons, eq(lessons.id, lesson_progress.lesson_id))
      .where(
        and(
          eq(lesson_progress.user_id, userId),
          eq(lessons.course_id, courseId),
          eq(lesson_progress.completed, true)
        )
      );

    const totalLessonsResult = await db
      .select({ count: count() })
      .from(lessons)
      .where(eq(lessons.course_id, courseId));

    const totalLessonsCount = totalLessonsResult.length > 0
      ? Number(totalLessonsResult[0].count ?? 0)
      : 0;

    const totalAssignmentsResult = await db
      .select({ count: count() })
      .from(assignments)
      .where(eq(assignments.course_id, courseId));

    const totalAssignmentsCount = totalAssignmentsResult.length > 0
      ? Number(totalAssignmentsResult[0].count ?? 0)
      : 0;

    const gradedAssignments = await db
      .select({
        assignment_id: assignments.id,
        title: assignments.title,
        grade: assignment_submissions.grade,
        submitted_at: assignment_submissions.submitted_at,
      })
      .from(assignments)
      .innerJoin(
        assignment_submissions,
        and(
          eq(assignment_submissions.assignment_id, assignments.id),
          eq(assignment_submissions.user_id, userId),
          eq(assignment_submissions.status, "graded")
        )
      )
      .where(eq(assignments.course_id, courseId));

    const totalItems = totalLessonsCount + totalAssignmentsCount;
    const completedItems = completedLessons.length + gradedAssignments.length;
    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    res.json({
      success: true,
      lessons_completed: completedLessons,
      graded_assignments: gradedAssignments,
      progress_percent: progressPercent,
      totals: {
        total_lessons: totalLessonsCount,
        total_assignments: totalAssignmentsCount,
        total_items: totalItems,
        completed_items: completedItems,
      },
    });
  } catch (err: any) {
    console.error("GET /learning/progress/:course_id error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch progress",
      details: err?.message || "Unknown error",
    });
  }
});

export default router;