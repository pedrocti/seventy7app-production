// server/api/admin/learning/adminEnrollments.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import { enrollments, users, courses, lessons, lesson_progress } from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

/* ===== LIST ALL ENROLLMENTS ===== */
router.get("/", async (_req, res) => {
  try {
    const list = await db.select({
      enrollment_id: enrollments.id,
      user_id: users.id,
      username: users.username,
      email: users.email,
      course_id: courses.id,
      course_title: courses.title,
      status: enrollments.status,
      progress_percent: enrollments.progress_percent,
      enrolled_at: enrollments.enrolled_at,
      completed_at: enrollments.completed_at,
    })
      .from(enrollments)
      .leftJoin(users, eq(users.id, enrollments.user_id))
      .leftJoin(courses, eq(courses.id, enrollments.course_id))
      .orderBy(enrollments.id);

    res.json({ success: true, enrollments: list });
  } catch (err) {
    console.error("GET /admin/enrollments error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch enrollments" });
  }
});

/* ===== VIEW SINGLE ENROLLMENT DETAILS ===== */
router.get("/:id", async (req, res) => {
  try {
    const enrollmentId = Number(req.params.id);
    if (isNaN(enrollmentId)) return res.status(400).json({ success: false, error: "Invalid enrollment ID" });

    const [enrollment] = await db.select({
      enrollment_id: enrollments.id,
      user_id: users.id,
      username: users.username,
      email: users.email,
      course_id: courses.id,
      course_title: courses.title,
      status: enrollments.status,
      progress_percent: enrollments.progress_percent,
      enrolled_at: enrollments.enrolled_at,
      completed_at: enrollments.completed_at,
    })
      .from(enrollments)
      .leftJoin(users, eq(users.id, enrollments.user_id))
      .leftJoin(courses, eq(courses.id, enrollments.course_id))
      .where(eq(enrollments.id, enrollmentId));

    if (!enrollment) return res.status(404).json({ success: false, error: "Enrollment not found" });

    // Optional: fetch lesson progress
    const lessonsProgress = await db.select()
      .from(lesson_progress)
      .where(eq(lesson_progress.enrollment_id, enrollmentId));

    res.json({ success: true, enrollment, lessonsProgress });
  } catch (err) {
    console.error("GET /admin/enrollments/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch enrollment details" });
  }
});

/* ===== UPDATE ENROLLMENT STATUS & PROGRESS ===== */
router.patch("/:id", async (req, res) => {
  try {
    const enrollmentId = Number(req.params.id);
    if (isNaN(enrollmentId)) return res.status(400).json({ success: false, error: "Invalid enrollment ID" });

    const { status, progress_percent, completed_at } = req.body;
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (progress_percent !== undefined) updateData.progress_percent = Number(progress_percent) || 0;
    if (completed_at !== undefined) updateData.completed_at = completed_at || null;

    const [updated] = await db.update(enrollments).set(updateData).where(eq(enrollments.id, enrollmentId)).returning();
    if (!updated) return res.status(404).json({ success: false, error: "Enrollment not found" });

    res.json({ success: true, enrollment: updated });
  } catch (err) {
    console.error("PATCH /admin/enrollments/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to update enrollment" });
  }
});

/* ===== DELETE ENROLLMENT ===== */
router.delete("/:id", async (req, res) => {
  try {
    const enrollmentId = Number(req.params.id);
    if (isNaN(enrollmentId)) return res.status(400).json({ success: false, error: "Invalid enrollment ID" });

    const [deleted] = await db.delete(enrollments).where(eq(enrollments.id, enrollmentId)).returning();
    if (!deleted) return res.status(404).json({ success: false, error: "Enrollment not found" });

    // Optionally: clean up lesson_progress records
    await db.delete(lesson_progress).where(eq(lesson_progress.enrollment_id, enrollmentId));

    res.json({ success: true, enrollment: deleted });
  } catch (err) {
    console.error("DELETE /admin/enrollments/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to delete enrollment" });
  }
});

export default router;
