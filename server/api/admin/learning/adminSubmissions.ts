// server/api/admin/learning/adminSubmissions.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import { assignment_submissions, users, assignments, courses } from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

/* ===== LIST ALL SUBMISSIONS ===== */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const submissions = await db.select({
      submission_id: assignment_submissions.id,
      user_id: users.id,
      username: users.username,
      email: users.email,
      assignment_id: assignments.id,
      assignment_title: assignments.title,
      course_id: courses.id,
      course_title: courses.title,
      content: assignment_submissions.content,
      grade: assignment_submissions.grade,
      feedback: assignment_submissions.feedback,
      submitted_at: assignment_submissions.submitted_at,
      graded_at: assignment_submissions.graded_at,
    })
      .from(assignment_submissions)
      .leftJoin(users, eq(users.id, assignment_submissions.user_id))
      .leftJoin(assignments, eq(assignments.id, assignment_submissions.assignment_id))
      .leftJoin(courses, eq(courses.id, assignments.course_id))
      .orderBy(assignment_submissions.id)
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    res.json({ success: true, submissions });
  } catch (err) {
    console.error("GET /admin/submissions error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch submissions" });
  }
});

/* ===== LIST SUBMISSIONS BY COURSE ===== */
router.get("/course/:courseId", async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    if (isNaN(courseId)) return res.status(400).json({ success: false, error: "Invalid course ID" });

    // Verify course exists
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });

    const submissions = await db.select({
      submission_id: assignment_submissions.id,
      user_id: users.id,
      username: users.username,
      email: users.email,
      assignment_id: assignments.id,
      assignment_title: assignments.title,
      content: assignment_submissions.content,
      grade: assignment_submissions.grade,
      feedback: assignment_submissions.feedback,
      submitted_at: assignment_submissions.submitted_at,
      graded_at: assignment_submissions.graded_at,
    })
      .from(assignment_submissions)
      .leftJoin(users, eq(users.id, assignment_submissions.user_id))
      .leftJoin(assignments, eq(assignments.id, assignment_submissions.assignment_id))
      .where(eq(assignments.course_id, courseId))
      .orderBy(assignment_submissions.id);

    res.json({ success: true, submissions });
  } catch (err) {
    console.error("GET /admin/submissions/course/:courseId error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch submissions" });
  }
});

/* ===== GRADE OR UPDATE SUBMISSION ===== */
router.patch("/:id/grade", async (req, res) => {
  try {
    const submissionId = Number(req.params.id);
    if (isNaN(submissionId)) return res.status(400).json({ success: false, error: "Invalid submission ID" });

    const { grade, feedback } = req.body;
    if (grade === undefined && feedback === undefined) {
      return res.status(400).json({ success: false, error: "Nothing to update" });
    }

    const [updated] = await db.update(assignment_submissions)
      .set({
        grade: grade !== undefined ? grade : undefined,
        feedback: feedback !== undefined ? feedback : undefined,
        graded_at: grade !== undefined ? new Date() : undefined,
      })
      .where(eq(assignment_submissions.id, submissionId))
      .returning();

    if (!updated) return res.status(404).json({ success: false, error: "Submission not found" });

    res.json({ success: true, submission: updated });
  } catch (err) {
    console.error("PATCH /admin/submissions/:id/grade error:", err);
    res.status(500).json({ success: false, error: "Failed to grade submission" });
  }
});

/* ===== DELETE SUBMISSION ===== */
router.delete("/:id", async (req, res) => {
  try {
    const submissionId = Number(req.params.id);
    if (isNaN(submissionId)) return res.status(400).json({ success: false, error: "Invalid submission ID" });

    const [deleted] = await db.delete(assignment_submissions).where(eq(assignment_submissions.id, submissionId)).returning();
    if (!deleted) return res.status(404).json({ success: false, error: "Submission not found" });

    res.json({ success: true, submission: deleted });
  } catch (err) {
    console.error("DELETE /admin/submissions/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to delete submission" });
  }
});

export default router;
