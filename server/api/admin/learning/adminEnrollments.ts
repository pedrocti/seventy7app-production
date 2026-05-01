    // server/api/admin/learning/adminEnrollments.ts
    import { Router } from "express";
    import { db } from "../../../db/connection";
    import {
      enrollments,
      users,
      courses,
      lessons,
      lesson_progress,
    } from "../../../db/schema";
    import { auth, adminOnly } from "../../utils";
    import { eq, and } from "drizzle-orm";

    const router = Router();
    router.use(auth, adminOnly);

    /* =========================
       LIST ALL ENROLLMENTS
       ========================= */
    router.get("/", async (_req, res) => {
      try {
        const list = await db
          .select({
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
        res.status(500).json({
          success: false,
          error: "Failed to fetch enrollments",
        });
      }
    });

    /* =========================
       VIEW SINGLE ENROLLMENT
       ========================= */
    router.get("/:id", async (req, res) => {
      try {
        const enrollmentId = Number(req.params.id);

        if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
          return res.status(400).json({
            success: false,
            error: "Invalid enrollment ID",
          });
        }

        const [enrollment] = await db
          .select({
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

        if (!enrollment) {
          return res.status(404).json({
            success: false,
            error: "Enrollment not found",
          });
        }

        // 🛡️ Guard against null IDs (fixes TypeScript eq() errors)
        if (!enrollment.user_id || !enrollment.course_id) {
          return res.status(400).json({
            success: false,
            error: "Enrollment missing user_id or course_id",
          });
        }

        const lessonsProgress = await db
          .select({
            lesson_id: lessons.id,
            lesson_title: lessons.title,
            completed: lesson_progress.completed,
            completed_at: lesson_progress.completed_at,
          })
          .from(lessons)
          .leftJoin(
            lesson_progress,
            and(
              eq(lesson_progress.lesson_id, lessons.id),
              eq(lesson_progress.user_id, enrollment.user_id)
            )
          )
          .where(eq(lessons.course_id, enrollment.course_id))
          .orderBy(lessons.id);

        res.json({
          success: true,
          enrollment,
          lessonsProgress,
        });
        } catch (err) {
        console.error("GET /admin/enrollments/:id error:", err);
        res.status(500).json({
          success: false,
          error: "Failed to fetch enrollment details",
        });
        }
        });

    /* =========================
       UPDATE ENROLLMENT
       ========================= */
    router.patch("/:id", async (req, res) => {
      try {
        const enrollmentId = Number(req.params.id);

        if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
          return res.status(400).json({
            success: false,
            error: "Invalid enrollment ID",
          });
        }

        const { status, progress_percent, completed_at } = req.body ?? {};

        const updateData: {
          status?: "active" | "completed";
          progress_percent?: string;
          completed_at?: Date | null;
        } = {};

        if (status === "active" || status === "completed") {
          updateData.status = status;
        }

        if (!isNaN(Number(progress_percent))) {
          updateData.progress_percent = Math.min(
            100,
            Math.max(0, Number(progress_percent))
          ).toFixed(2);
        }

        if (completed_at !== undefined) {
          updateData.completed_at = completed_at ? new Date(completed_at) : null;
        }

        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({
            success: false,
            error: "No valid fields provided for update",
          });
        }

        const [updated] = await db
          .update(enrollments)
          .set(updateData)
          .where(eq(enrollments.id, enrollmentId))
          .returning();

        if (!updated) {
          return res.status(404).json({
            success: false,
            error: "Enrollment not found",
          });
        }

        res.json({
          success: true,
          enrollment: updated,
        });
      } catch (err) {
        console.error("PATCH /admin/enrollments/:id error:", err);
        res.status(500).json({
          success: false,
          error: "Failed to update enrollment",
        });
      }
    });

    /* =========================
       DELETE ENROLLMENT
       ========================= */
    router.delete("/:id", async (req, res) => {
      try {
        const enrollmentId = Number(req.params.id);

        if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
          return res.status(400).json({
            success: false,
            error: "Invalid enrollment ID",
          });
        }

        const [deleted] = await db
          .delete(enrollments)
          .where(eq(enrollments.id, enrollmentId))
          .returning();

        if (!deleted) {
          return res.status(404).json({
            success: false,
            error: "Enrollment not found",
          });
        }

        res.json({ success: true, enrollment: deleted });
      } catch (err) {
        console.error("DELETE /admin/enrollments/:id error:", err);
        res.status(500).json({
          success: false,
          error: "Failed to delete enrollment",
        });
      }
    });

    export default router;
