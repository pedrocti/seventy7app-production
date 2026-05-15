import { Router } from "express";
import { db } from "../../db/connection";
import { assignments, assignment_submissions } from "../../db/schema";
import { auth } from "../utils";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/learning/assignments/with-submission/:course_id
// MUST be before /:course_id — specific routes before wildcards
router.get("/with-submission/:course_id", auth, async (req: any, res) => {
  try {
    const userId   = req.user.id;
    const courseId = Number(req.params.course_id);
    if (isNaN(courseId)) return res.status(400).json({ success: false, error: "Invalid course ID" });

    const assigns = await db.select().from(assignments).where(eq(assignments.course_id, courseId));
    const subs    = await db.select().from(assignment_submissions).where(eq(assignment_submissions.user_id, userId));

    const subMap: Record<number, any> = {};
    subs.forEach(s => { subMap[s.assignment_id] = s; });

    res.json({ success: true, assignments: assigns.map(a => ({ ...a, my_submission: subMap[a.id] || null })) });
  } catch (err) {
    console.error("Fetch assignments with submission error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch assignments" });
  }
});

// POST /api/learning/assignments/:assignment_id/submit
router.post("/:assignment_id/submit", auth, async (req: any, res) => {
  try {
    const assignmentId = Number(req.params.assignment_id);
    const userId       = req.user.id;
    const { content }  = req.body;

    if (isNaN(assignmentId)) return res.status(400).json({ success: false, error: "Invalid assignment ID" });
    if (!content?.trim())    return res.status(400).json({ success: false, error: "Content cannot be empty" });

    const existing = await db.select().from(assignment_submissions)
      .where(and(eq(assignment_submissions.assignment_id, assignmentId), eq(assignment_submissions.user_id, userId)));

    if (existing.length > 0) {
      const sub = existing[0];
      if (sub.status === "rejected") {
        const [updated] = await db.update(assignment_submissions)
          .set({ content, status: "pending", submitted_at: new Date() })
          .where(eq(assignment_submissions.id, sub.id))
          .returning();
        return res.json({ success: true, resubmitted: true, submission: updated });
      }
      return res.json({ success: true, alreadySubmitted: true, submission: sub });
    }

    const [submission] = await db.insert(assignment_submissions)
      .values({ assignment_id: assignmentId, user_id: userId, content, status: "pending", submitted_at: new Date() })
      .returning();

    return res.status(201).json({ success: true, message: "Submitted successfully!", submission });
  } catch (err) {
    console.error("Submit assignment error:", err);
    res.status(500).json({ success: false, error: "Failed to submit assignment" });
  }
});

// GET /api/learning/assignments/:course_id — wildcard LAST
router.get("/:course_id", auth, async (req, res) => {
  try {
    const courseId = Number(req.params.course_id);
    if (isNaN(courseId)) return res.status(400).json({ success: false, error: "Invalid course ID" });
    const list = await db.select().from(assignments).where(eq(assignments.course_id, courseId)).orderBy(assignments.due_date);
    res.json({ success: true, assignments: list });
  } catch (err) {
    console.error("Fetch assignments error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch assignments" });
  }
});

export default router;
