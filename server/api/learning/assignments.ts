import { Router } from "express";
import { db } from "../../db/connection";
import { assignments, assignment_submissions } from "../../db/schema";
import { auth } from "../utils";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/learning/assignments/:course_id
router.get("/:course_id", auth, async (req, res) => {
  try {
    const list = await db
      .select()
      .from(assignments)
      .where(eq(assignments.course_id, Number(req.params.course_id)))
      .orderBy(assignments.due_date);

    res.json({ success: true, assignments: list });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch assignments" });
  }
});

// GET /api/learning/assignments-with-submission/:course_id
router.get("/with-submission/:course_id", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const assigns = await db
      .select()
      .from(assignments)
      .where(eq(assignments.course_id, Number(req.params.course_id)));

    const subs = await db
      .select()
      .from(assignment_submissions)
      .where(eq(assignment_submissions.user_id, userId));

    const map: any = {};
    subs.forEach((s) => (map[s.assignment_id] = s));

    const result = assigns.map((a) => ({
      ...a,
      my_submission: map[a.id] || null,
    }));

    res.json({ success: true, assignments: result });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch assignments",
    });
  }
});

export default router;
