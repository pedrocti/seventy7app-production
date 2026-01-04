import { Router } from "express";
import { db } from "../../db/connection";
import { courses, enrollments, users, lessons, assignments } from "../../db/schema"; // ← Import your lessons & assignments tables
import { eq, and } from "drizzle-orm";
import { auth } from "../utils";

const router = Router();

// GET /api/learning/courses — all active courses
router.get("/", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    // Fetch active courses
    const courseList = await db
      .select()
      .from(courses)
      .where(eq(courses.is_active, true))
      .orderBy(courses.id);

    if (courseList.length === 0) {
      return res.json({ success: true, courses: [] });
    }

    // Fetch user enrollments for these courses
    const enrolledRows = await db
      .select({ course_id: enrollments.course_id })
      .from(enrollments)
      .where(and(eq(enrollments.user_id, userId)));

    const enrolledSet = new Set(enrolledRows.map((r) => r.course_id));

    // Attach enrolled flag
    const finalList = courseList.map((c) => ({
      ...c,
      enrolled: enrolledSet.has(c.id),
    }));

    res.json({ success: true, courses: finalList });
  } catch (err) {
    console.error("Failed to fetch courses", err);
    res.status(500).json({ success: false, error: "Failed to fetch courses" });
  }
});

// POST /api/learning/courses/:id/enroll — enroll in single course
router.post("/:id/enroll", auth, async (req: any, res) => {
  try {
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, error: "Invalid course ID" });
    }

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    // Fetch course
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });

    // Check if already enrolled
    const [existingEnrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.user_id, userId), eq(enrollments.course_id, courseId)));

    if (existingEnrollment) {
      return res.status(400).json({ success: false, error: "Already enrolled in this course" });
    }

    // Fetch user
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    // Check balance
    if (Number(user.balance) < Number(course.price)) {
      return res.status(400).json({ success: false, error: "Insufficient balance" });
    }

    // Deduct balance
    const newBalance = Number(user.balance) - Number(course.price);
    await db.update(users).set({ balance: newBalance.toString() }).where(eq(users.id, userId));

    // Create enrollment
    const [enrollment] = await db
      .insert(enrollments)
      .values({
        user_id: userId,
        course_id: courseId,
        status: "active",
        progress_percent: "0",
      })
      .returning();

    res.json({
      success: true,
      message: "Enrolled in course successfully",
      remaining_balance: newBalance,
      enrollment,
    });
  } catch (err) {
    console.error("POST /learning/courses/:id/enroll error:", err);
    res.status(500).json({ success: false, error: "Failed to enroll in course" });
  }
});

// NEW/UPDATED: GET /api/learning/courses/:id — single course details
router.get("/:id", auth, async (req: any, res) => {
  const courseId = Number(req.params.id);
  if (!Number.isInteger(courseId)) {
    return res.status(400).json({ success: false, error: "Invalid course ID" });
  }

  try {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));

    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    // Fetch lessons (replace 'lessons' with your actual table name if different)
    const lessonsData = await db
      .select()
      .from(lessons) // ← Make sure 'lessons' is imported from schema
      .where(eq(lessons.course_id, courseId)); // ← adjust column name if different

    // Fetch assignments (replace 'assignments' with your actual table)
    const assignmentsData = await db
      .select()
      .from(assignments) // ← Make sure 'assignments' is imported
      .where(eq(assignments.course_id, courseId)); // ← adjust column name if different

    res.json({
      success: true,
      course,
      lessons: lessonsData || [],
      assignments: assignmentsData || [],
    });
  } catch (err) {
    console.error("GET /courses/:id error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;