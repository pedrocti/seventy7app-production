// server/api/admin/learning/adminCourses.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import { courses, programs } from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

/* ===== GET ALL COURSES ===== */
router.get("/", async (_req, res) => {
  try {
    const list = await db.select().from(courses).orderBy(courses.id);
    res.json({ success: true, courses: list });
  } catch (err) {
    console.error("GET /courses error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch courses" });
  }
});

/* ===== GET COURSES BY PROGRAM ===== */
router.get("/program/:programId", async (req, res) => {
  try {
    const programId = Number(req.params.programId);
    if (isNaN(programId)) return res.status(400).json({ success: false, error: "Invalid program ID" });

    const list = await db.select().from(courses).where(eq(courses.program_id, programId)).orderBy(courses.id);
    res.json({ success: true, courses: list });
  } catch (err) {
    console.error("GET /program/:programId courses error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch courses for program" });
  }
});

/* ===== CREATE COURSE ===== */
router.post("/", async (req, res) => {
  try {
    const { title, description, program_id } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: "Course title is required" });
    if (!program_id) return res.status(400).json({ success: false, error: "Program ID is required" });

    // Verify program exists
    const [program] = await db.select().from(programs).where(eq(programs.id, program_id));
    if (!program) return res.status(404).json({ success: false, error: "Program not found" });

    const [course] = await db.insert(courses)
      .values({ title: title.trim(), description: description?.trim() || "", program_id })
      .returning();

    res.json({ success: true, course });
  } catch (err) {
    console.error("POST /courses error:", err);
    res.status(500).json({ success: false, error: "Failed to create course" });
  }
});

/* ===== UPDATE COURSE ===== */
router.patch("/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) return res.status(400).json({ success: false, error: "Invalid course ID" });

    const { title, description } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;

    const [updated] = await db.update(courses).set(updateData).where(eq(courses.id, courseId)).returning();
    if (!updated) return res.status(404).json({ success: false, error: "Course not found" });

    res.json({ success: true, course: updated });
  } catch (err) {
    console.error("PATCH /courses/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to update course" });
  }
});

/* ===== DELETE COURSE ===== */
router.delete("/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) return res.status(400).json({ success: false, error: "Invalid course ID" });

    const [deleted] = await db.delete(courses).where(eq(courses.id, courseId)).returning();
    if (!deleted) return res.status(404).json({ success: false, error: "Course not found" });

    res.json({ success: true, course: deleted });
  } catch (err) {
    console.error("DELETE /courses/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to delete course" });
  }
});

export default router;
