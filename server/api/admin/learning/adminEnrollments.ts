// server/api/admin/learning/adminEnrollments.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import {
  enrollments,
  users,
  courses,
  lessons,
  lesson_progress,
  program_enrollments,
  learning_programs,
} from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq, and, ilike, or } from "drizzle-orm";

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
    res.status(500).json({ success: false, error: "Failed to fetch enrollments" });
  }
});

/* =========================
   VIEW SINGLE ENROLLMENT
   ========================= */
router.get("/:id", async (req, res) => {
  try {
    const enrollmentId = Number(req.params.id);
    if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
      return res.status(400).json({ success: false, error: "Invalid enrollment ID" });
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
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    if (!enrollment.user_id || !enrollment.course_id) {
      return res.status(400).json({ success: false, error: "Enrollment missing user_id or course_id" });
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

    res.json({ success: true, enrollment, lessonsProgress });
  } catch (err) {
    console.error("GET /admin/enrollments/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch enrollment details" });
  }
});

/* =========================
   UPDATE ENROLLMENT
   ========================= */
router.patch("/:id", async (req, res) => {
  try {
    const enrollmentId = Number(req.params.id);
    if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
      return res.status(400).json({ success: false, error: "Invalid enrollment ID" });
    }

    const { status, progress_percent, completed_at } = req.body ?? {};
    const updateData: {
      status?: "active" | "completed";
      progress_percent?: string;
      completed_at?: Date | null;
    } = {};

    if (status === "active" || status === "completed") updateData.status = status;
    if (!isNaN(Number(progress_percent))) {
      updateData.progress_percent = Math.min(100, Math.max(0, Number(progress_percent))).toFixed(2);
    }
    if (completed_at !== undefined) {
      updateData.completed_at = completed_at ? new Date(completed_at) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields provided for update" });
    }

    const [updated] = await db
      .update(enrollments)
      .set(updateData)
      .where(eq(enrollments.id, enrollmentId))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    res.json({ success: true, enrollment: updated });
  } catch (err) {
    console.error("PATCH /admin/enrollments/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to update enrollment" });
  }
});

/* =========================
   DELETE ENROLLMENT
   ========================= */
router.delete("/:id", async (req, res) => {
  try {
    const enrollmentId = Number(req.params.id);
    if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
      return res.status(400).json({ success: false, error: "Invalid enrollment ID" });
    }

    const [deleted] = await db
      .delete(enrollments)
      .where(eq(enrollments.id, enrollmentId))
      .returning();

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    res.json({ success: true, enrollment: deleted });
  } catch (err) {
    console.error("DELETE /admin/enrollments/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to delete enrollment" });
  }
});

/* =====================================================
   POST /api/admin/learning/enrollments/grant-program
   → Admin grants a user access to a program (paid or free)
   Body: { user_id, program_id }
===================================================== */
router.post("/grant-program", async (req, res) => {
  try {
    const { user_id, program_id } = req.body ?? {};

    if (!user_id || !Number.isInteger(Number(user_id)) || Number(user_id) <= 0) {
      return res.status(400).json({ success: false, error: "Invalid user_id" });
    }
    if (!program_id || !Number.isInteger(Number(program_id)) || Number(program_id) <= 0) {
      return res.status(400).json({ success: false, error: "Invalid program_id" });
    }

    const userId = Number(user_id);
    const programId = Number(program_id);

    // Verify user exists
    const [user] = await db.select({ id: users.id, username: users.username })
      .from(users)
      .where(eq(users.id, userId));
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    // Verify program exists
    const [program] = await db.select({ id: learning_programs.id, title: learning_programs.title })
      .from(learning_programs)
      .where(eq(learning_programs.id, programId));
    if (!program) return res.status(404).json({ success: false, error: "Program not found" });

    // Check if already enrolled — idempotent
    const [existing] = await db
      .select()
      .from(program_enrollments)
      .where(
        and(
          eq(program_enrollments.user_id, userId),
          eq(program_enrollments.program_id, programId)
        )
      );

    if (existing) {
      return res.json({ success: true, message: "User already has access to this program", alreadyEnrolled: true });
    }

    // Grant program enrollment (admin override — no balance deduction)
    await db.insert(program_enrollments).values({
      user_id: userId,
      program_id: programId,
      status: "active",
      progress_percent: "0",
      amount_paid: "0",
    });

    // Enroll in all courses of the program
    const programCourses = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.program_id, programId));

    let coursesEnrolled = 0;
    for (const course of programCourses) {
      const [exists] = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.user_id, userId),
            eq(enrollments.course_id, course.id)
          )
        );

      if (!exists) {
        await db.insert(enrollments).values({
          user_id: userId,
          course_id: course.id,
          status: "active",
          progress_percent: "0",
        });
        coursesEnrolled++;
      }
    }

    res.json({
      success: true,
      message: `Access granted to "${program.title}" for user "${user.username}". Enrolled in ${coursesEnrolled} course(s).`,
      coursesEnrolled,
    });
  } catch (err) {
    console.error("POST /admin/enrollments/grant-program error:", err);
    res.status(500).json({ success: false, error: "Failed to grant program access" });
  }
});

/* =====================================================
   GET /api/admin/learning/enrollments/program/:id
   → List all users enrolled in a specific program
===================================================== */
router.get("/program/:id", async (req, res) => {
  try {
    const programId = Number(req.params.id);
    if (!Number.isInteger(programId) || programId <= 0) {
      return res.status(400).json({ success: false, error: "Invalid program ID" });
    }

    const enrolled = await db
      .select({
        enrollment_id: program_enrollments.id,
        user_id: users.id,
        username: users.username,
        email: users.email,
        status: program_enrollments.status,
        progress_percent: program_enrollments.progress_percent,
        amount_paid: program_enrollments.amount_paid,
        enrolled_at: program_enrollments.enrolled_at,
      })
      .from(program_enrollments)
      .leftJoin(users, eq(users.id, program_enrollments.user_id))
      .where(eq(program_enrollments.program_id, programId))
      .orderBy(program_enrollments.enrolled_at);

    res.json({ success: true, enrollments: enrolled });
  } catch (err) {
    console.error("GET /admin/enrollments/program/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch program enrollments" });
  }
});

/* =====================================================
   DELETE /api/admin/learning/enrollments/program-access
   → Revoke a user's program access
   Body: { user_id, program_id }
===================================================== */
router.delete("/revoke-program", async (req, res) => {
  try {
    const { user_id, program_id } = req.body ?? {};
    const userId = Number(user_id);
    const programId = Number(program_id);

    if (!userId || !programId) {
      return res.status(400).json({ success: false, error: "user_id and program_id are required" });
    }

    const [deleted] = await db
      .delete(program_enrollments)
      .where(
        and(
          eq(program_enrollments.user_id, userId),
          eq(program_enrollments.program_id, programId)
        )
      )
      .returning();

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    res.json({ success: true, message: "Program access revoked" });
  } catch (err) {
    console.error("DELETE /admin/enrollments/revoke-program error:", err);
    res.status(500).json({ success: false, error: "Failed to revoke access" });
  }
});

export default router;
