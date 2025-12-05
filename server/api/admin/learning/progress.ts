// server/api/admin/learning/progress.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import { lesson_progress, lessons, courses, enrollments, users } from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq, and } from "drizzle-orm";

const router = Router();
router.use(auth);

/* ================== USER COMPLETES LESSON ================== */
router.post("/complete", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { lesson_id } = req.body;

    if (!lesson_id) return res.status(400).json({ success: false, error: "lesson_id is required" });

    // Check if already marked complete
    const existing = await db.select().from(lesson_progress)
      .where(and(eq(lesson_progress.user_id, userId), eq(lesson_progress.lesson_id, lesson_id)));

    if (existing.length > 0) return res.status(400).json({ success: false, error: "Lesson already completed" });

    // Insert lesson completion
    const [record] = await db.insert(lesson_progress)
      .values({ user_id: userId, lesson_id, completed_at: new Date() })
      .returning();

    // Update course progress
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lesson_id));
    if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });

    const courseId = lesson.course_id;

    const totalLessons = await db.select().from(lessons).where(eq(lessons.course_id, courseId));
    const completedLessons = await db.select().from(lesson_progress)
      .where(and(eq(lesson_progress.user_id, userId), eq(lesson_progress.course_id, courseId)));

    const progressPercent = totalLessons.length > 0 ? (completedLessons.length / totalLessons.length) * 100 : 0;

    // Update enrollments table with course progress
    await db.update(enrollments)
      .set({ progress_percent: progressPercent })
      .where(and(eq(enrollments.user_id, userId), eq(enrollments.course_id, courseId)));

    res.json({ success: true, lesson_progress: record, course_progress_percent: progressPercent });
  } catch (err) {
    console.error("POST /progress/complete error:", err);
    res.status(500).json({ success: false, error: "Failed to mark lesson as completed" });
  }
});

/* ================== USER FETCH OWN COURSE PROGRESS ================== */
router.get("/my/:courseId", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const courseId = Number(req.params.courseId);
    if (isNaN(courseId)) return res.status(400).json({ success: false, error: "Invalid course ID" });

    const totalLessons = await db.select().from(lessons).where(eq(lessons.course_id, courseId));
    const completedLessons = await db.select().from(lesson_progress)
      .where(and(eq(lesson_progress.user_id, userId), eq(lesson_progress.course_id, courseId)));

    const progressPercent = totalLessons.length > 0 ? (completedLessons.length / totalLessons.length) * 100 : 0;

    res.json({ success: true, course_id: courseId, progress_percent: progressPercent, completed_lessons: completedLessons });
  } catch (err) {
    console.error("GET /progress/my/:courseId error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch course progress" });
  }
});

/* ================== ADMIN VIEW USER PROGRESS ================== */
router.get("/admin/user/:userId", adminOnly, async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ success: false, error: "Invalid user ID" });

    const progressRecords = await db.select({
      lesson_id: lesson_progress.lesson_id,
      course_id: lessons.course_id,
      lesson_title: lessons.title,
      completed_at: lesson_progress.completed_at,
    })
      .from(lesson_progress)
      .leftJoin(lessons, eq(lessons.id, lesson_progress.lesson_id))
      .where(eq(lesson_progress.user_id, userId));

    res.json({ success: true, user_id: userId, progress: progressRecords });
  } catch (err) {
    console.error("GET /progress/admin/user/:userId error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch user progress" });
  }
});

export default router;
