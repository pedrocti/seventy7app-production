import { Router } from "express";
import { db } from "../db/connection";
import { courses, lessons, enrollments, assignments, assignment_submissions } from "../db/schema";
import { auth } from "./utils";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/courses — all active courses
router.get("/courses", async (_req, res) => {
  console.log("[API HIT] GET /courses");
  try {
    const list = await db.select().from(courses).where(eq(courses.is_active, true)).orderBy(courses.id);
    console.log("[DB RESULT] courses:", list.length, "rows");
    res.json({ success: true, courses: list });
  } catch (err) {
    console.error("[ERROR] GET /courses:", err);
    res.status(500).json({ success: false, error: "Failed to fetch courses" });
  }
});

// POST /api/enroll — enroll in a course
router.post("/enroll", auth, async (req: any, res) => {
  console.log("[API HIT] POST /enroll", "body:", req.body, "user:", req.user?.id);
  try {
    const userId = req.user.id;
    const { course_id } = req.body;
    const [enr] = await db.insert(enrollments).values({ user_id: userId, course_id }).returning();
    console.log("[DB RESULT] enrollment created:", enr);
    res.json({ success: true, enrollment: enr });
  } catch (err) {
    console.error("[ERROR] POST /enroll:", err);
    res.status(500).json({ success: false, error: "Enrollment failed" });
  }
});

// GET /api/courses/:id/lessons — lessons for a course
router.get("/courses/:id/lessons", auth, async (req: any, res) => {
  const { id } = req.params;
  console.log("[API HIT] GET /courses/:id/lessons", "course_id:", id);
  try {
    const list = await db.select().from(lessons).where(eq(lessons.course_id, Number(id))).orderBy(lessons.sort_order);
    console.log("[DB RESULT] lessons:", list.length, "rows for course", id);
    res.json({ success: true, lessons: list });
  } catch (err) {
    console.error("[ERROR] GET /courses/:id/lessons:", err);
    res.status(500).json({ success: false, error: "Failed to fetch lessons" });
  }
});

// GET /api/courses/:id/assignments — assignments for a course
router.get("/courses/:id/assignments", auth, async (req: any, res) => {
  const { id } = req.params;
  console.log("[API HIT] GET /courses/:id/assignments", "course_id:", id);
  try {
    const list = await db
      .select()
      .from(assignments)
      .where(eq(assignments.course_id, Number(id)))
      .orderBy(assignments.due_date);

    console.log("[DB RESULT] assignments:", list.length, "rows for course", id);
    res.json({ success: true, assignments: list });
  } catch (err) {
    console.error("[ERROR] GET /courses/:id/assignments:", err);
    res.status(500).json({ success: false, error: "Failed to fetch assignments" });
  }
});

/* ------------------------------------------------------------------
   NEW — GET /api/courses/:id/assignments-with-submission
   (Returns assignments + user's submission for each assignment)
------------------------------------------------------------------- */
router.get("/courses/:id/assignments-with-submission", auth, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  console.log("[API HIT] GET /courses/:id/assignments-with-submission", "course_id:", id, "user:", userId);

  try {
    const assigns = await db
      .select()
      .from(assignments)
      .where(eq(assignments.course_id, Number(id)))
      .orderBy(assignments.due_date);

    // fetch this user's submissions for these assignments
    const userSubs = await db
      .select()
      .from(assignment_submissions)
      .where(eq(assignment_submissions.user_id, userId));

    const map: Record<number, any> = {};
    userSubs.forEach((s: any) => {
      map[s.assignment_id] = s;
    });

    const result = assigns.map((a: any) => ({
      ...a,
      my_submission: map[a.id] || null
    }));

    res.json({ success: true, assignments: result });
  } catch (err) {
    console.error("[ERROR] GET /courses/:id/assignments-with-submission:", err);
    res.status(500).json({ success: false, error: "Failed to fetch assignments" });
  }
});

/* ------------------------------------------------------------------
   UPDATED — POST /api/assignments/:id/submit  
   Prevents duplicate submissions (single submission policy)
------------------------------------------------------------------- */
router.post("/assignments/:id/submit", auth, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { content } = req.body;

  console.log("[API HIT] POST /assignments/:id/submit", "assignment_id:", id, "user:", userId);

  try {
    // Check if this user already submitted
    const existing = await db
      .select()
      .from(assignment_submissions)
      .where(eq(assignment_submissions.assignment_id, Number(id)))
      .where(eq(assignment_submissions.user_id, userId));

    if (existing.length > 0) {
      console.log("[BLOCKED] User already submitted assignment", id);
      return res.status(400).json({
        success: false,
        error: "You have already submitted this assignment"
      });
    }

    // Insert new submission
    const [submission] = await db
      .insert(assignment_submissions)
      .values({
        assignment_id: Number(id),
        user_id: userId,
        content
      })
      .returning();

    console.log("[DB RESULT] assignment submission created:", submission);
    res.json({ success: true, submission });
  } catch (err) {
    console.error("[ERROR] POST /assignments/:id/submit:", err);
    res.status(500).json({ success: false, error: "Failed to submit assignment" });
  }
});

export default router;
