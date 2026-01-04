import { Router } from "express";
import { db } from "../../db/connection";
import { assignments, assignment_submissions } from "../../db/schema";
import { auth } from "../utils";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/learning/assignments/:course_id
router.get("/:course_id", auth, async (req, res) => {
  try {
    const courseId = Number(req.params.course_id);
    const list = await db
      .select()
      .from(assignments)
      .where(eq(assignments.course_id, courseId))
      .orderBy(assignments.due_date);

    res.json({ success: true, assignments: list });
  } catch (err) {
    console.error("Fetch assignments error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch assignments" });
  }
});

// GET /api/learning/assignments-with-submission/:course_id
router.get("/with-submission/:course_id", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const courseId = Number(req.params.course_id);

    const assigns = await db
      .select()
      .from(assignments)
      .where(eq(assignments.course_id, courseId));

    const subs = await db
      .select()
      .from(assignment_submissions)
      .where(eq(assignment_submissions.user_id, userId));

    // Map submissions to assignment IDs
    const map: Record<number, any> = {};
    subs.forEach((s) => (map[s.assignment_id] = s));

    const result = assigns.map((a) => ({
      ...a,
      my_submission: map[a.id] || null,
    }));

    res.json({ success: true, assignments: result });
  } catch (err) {
    console.error("Fetch assignments with submission error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch assignments" });
  }
});

// POST /api/learning/assignments/:assignment_id/submit
router.post("/:assignment_id/submit", auth, async (req: any, res) => {
  try {
    const assignment_id = Number(req.params.assignment_id);
    const userId = req.user.id;
    const { content } = req.body;

    if (isNaN(assignment_id)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid assignment ID" 
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Submission content cannot be empty" 
      });
    }

    // Check if already submitted
    const existing = await db
      .select()
      .from(assignment_submissions)
      .where(
        and(
          eq(assignment_submissions.assignment_id, assignment_id),
          eq(assignment_submissions.user_id, userId)
        )
      );

    if (existing.length > 0) {
      // Friendly response — NOT an error!
      return res.status(200).json({
        success: true,
        alreadySubmitted: true,
        message: "You have already submitted this assignment.",
        submission: existing[0], // optional: return their previous submission
      });
    }

    // Create new submission
    const [submission] = await db
      .insert(assignment_submissions)
      .values({
        assignment_id,
        user_id: userId,
        content,
        status: "pending",
        submitted_at: new Date(),
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Assignment submitted successfully!",
      submission,
    });
  } catch (err) {
    console.error("Submit assignment error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit assignment. Please try again." 
    });
  }
});

export default router;
