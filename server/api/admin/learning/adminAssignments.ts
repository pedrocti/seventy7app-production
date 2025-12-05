// server/api/admin/learning/adminAssignments.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import { assignments, courses, assignment_submissions, users } from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

/* ===== LIST ALL ASSIGNMENTS ===== */
router.get("/", async (_req, res) => {
  try {
    const list = await db.select({
      assignment_id: assignments.id,
      course_id: courses.id,
      course_title: courses.title,
      title: assignments.title,
      description: assignments.description,
      due_date: assignments.due_date,
      created_at: assignments.created_at,
    })
      .from(assignments)
      .leftJoin(courses, eq(courses.id, assignments.course_id))
      .orderBy(assignments.id);

    res.json({ success: true, assignments: list });
  } catch (err) {
    console.error("GET /admin/assignments error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch assignments" });
  }
});

/* ===== CREATE NEW ASSIGNMENT ===== */
router.post("/", async (req, res) => {
  try {
    const { course_id, title, description, due_date } = req.body;
    if (!course_id || isNaN(Number(course_id))) return res.status(400).json({ success: false, error: "Invalid course ID" });
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: "Assignment title is required" });

    const [assignment] = await db.insert(assignments)
      .values({
        course_id: Number(course_id),
        title: title.trim(),
        description: description?.trim() || "",
        due_date: due_date || null,
      })
      .returning();

    res.json({ success: true, assignment });
  } catch (err) {
    console.error("POST /admin/assignments error:", err);
    res.status(500).json({ success: false, error: "Failed to create assignment" });
  }
});

/* ===== UPDATE ASSIGNMENT ===== */
router.patch("/:id", async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    if (isNaN(assignmentId)) return res.status(400).json({ success: false, error: "Invalid assignment ID" });

    const { title, description, due_date } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title?.trim() || "";
    if (description !== undefined) updateData.description = description || "";
    if (due_date !== undefined) updateData.due_date = due_date || null;

    const [updated] = await db.update(assignments).set(updateData).where(eq(assignments.id, assignmentId)).returning();
    if (!updated) return res.status(404).json({ success: false, error: "Assignment not found" });

    res.json({ success: true, assignment: updated });
  } catch (err) {
    console.error("PATCH /admin/assignments/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to update assignment" });
  }
});

/* ===== DELETE ASSIGNMENT ===== */
router.delete("/:id", async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    if (isNaN(assignmentId)) return res.status(400).json({ success: false, error: "Invalid assignment ID" });

    const [deleted] = await db.delete(assignments).where(eq(assignments.id, assignmentId)).returning();
    if (!deleted) return res.status(404).json({ success: false, error: "Assignment not found" });

    // Optional: delete related submissions
    await db.delete(assignment_submissions).where(eq(assignment_submissions.assignment_id, assignmentId));

    res.json({ success: true, assignment: deleted });
  } catch (err) {
    console.error("DELETE /admin/assignments/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to delete assignment" });
  }
});

/* ===== LIST SUBMISSIONS FOR AN ASSIGNMENT ===== */
router.get("/:id/submissions", async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    if (isNaN(assignmentId)) return res.status(400).json({ success: false, error: "Invalid assignment ID" });

    const submissions = await db.select({
      submission_id: assignment_submissions.id,
      user_id: users.id,
      username: users.username,
      email: users.email,
      content: assignment_submissions.content,
      grade: assignment_submissions.grade,
      feedback: assignment_submissions.feedback,
      submitted_at: assignment_submissions.submitted_at,
      graded_at: assignment_submissions.graded_at,
    })
      .from(assignment_submissions)
      .leftJoin(users, eq(users.id, assignment_submissions.user_id))
      .where(eq(assignment_submissions.assignment_id, assignmentId))
      .orderBy(assignment_submissions.id);

    res.json({ success: true, submissions });
  } catch (err) {
    console.error("GET /admin/assignments/:id/submissions error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch submissions" });
  }
});

/* ===== GRADE SUBMISSION ===== */
router.post("/submissions/:id/grade", async (req, res) => {
  try {
    const submissionId = Number(req.params.id);
    if (isNaN(submissionId)) return res.status(400).json({ success: false, error: "Invalid submission ID" });

    const { grade, feedback } = req.body;
    const [updated] = await db.update(assignment_submissions)
      .set({ grade, feedback, graded_at: new Date() })
      .where(eq(assignment_submissions.id, submissionId))
      .returning();

    if (!updated) return res.status(404).json({ success: false, error: "Submission not found" });

    res.json({ success: true, submission: updated });
  } catch (err) {
    console.error("POST /admin/assignments/submissions/:id/grade error:", err);
    res.status(500).json({ success: false, error: "Failed to grade submission" });
  }
});

export default router;
