import { Router } from "express";
import { db } from "../../db/connection";
import { assignment_submissions } from "../../db/schema";
import { auth } from "../utils";
import { and, eq } from "drizzle-orm";

const router = Router();

/* -------------------------------------------------------
   POST /api/learning/submissions/:assignment_id
   (Simple create — already in your structure)
-------------------------------------------------------- */
router.post("/:assignment_id", auth, async (req: any, res) => {
  try {
    const assignment_id = Number(req.params.assignment_id);
    const userId = req.user.id;
    const { content } = req.body;

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
      return res.status(400).json({
        success: false,
        error: "You already submitted this assignment",
      });
    }

    const [submission] = await db
      .insert(assignment_submissions)
      .values({ assignment_id, user_id: userId, content })
      .returning();

    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, error: "Submission failed" });
  }
});

/* -------------------------------------------------------
   Merged from old learning.ts

   POST /api/learning/submissions/:assignment_id/submit
   (Duplicate guard + return)
-------------------------------------------------------- */
router.post("/:assignment_id/submit", auth, async (req: any, res) => {
  try {
    const assignment_id = Number(req.params.assignment_id);
    const userId = req.user?.id;
    const { content } = req.body;

    if (isNaN(assignment_id)) {
      return res.status(400).json({ success: false, error: "Invalid assignment ID" });
    }

    // Check for existing submission
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
      return res.status(400).json({
        success: false,
        error: "You have already submitted this assignment",
      });
    }

    const [submission] = await db
      .insert(assignment_submissions)
      .values({
        assignment_id,
        user_id: userId,
        content,
      })
      .returning();

    res.json({ success: true, submission });
  } catch (err) {
    console.error("Submit assignment error:", err);
    res.status(500).json({ success: false, error: "Failed to submit assignment" });
  }
});

export default router;
