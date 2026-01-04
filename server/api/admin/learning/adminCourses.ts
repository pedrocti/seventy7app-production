// server/api/admin/learning/adminCourses.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import { courses, learning_programs as programs } from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq, asc } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

/* GET ALL COURSES */
router.get("/", async (_req, res) => {
  try {
    const list = await db
      .select({
        id: courses.id,
        program_id: courses.program_id,
        title: courses.title,
        description: courses.description,
        is_active: courses.is_active,
        created_at: courses.created_at,
      })
      .from(courses)
      .orderBy(asc(courses.id));

    res.json({ success: true, courses: list });
  } catch (err) {
    console.error("GET /admin/learning/courses error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

/* GET COURSES BY PROGRAM */
router.get("/program/:programId", async (req, res) => {
  const programId = Number(req.params.programId);
  if (!Number.isInteger(programId) || programId <= 0) {
    return res.status(400).json({ error: "Invalid program ID" });
  }

  try {
    const list = await db
      .select({
        id: courses.id,
        program_id: courses.program_id,
        title: courses.title,
        description: courses.description,
        is_active: courses.is_active,
        created_at: courses.created_at,
      })
      .from(courses)
      .where(eq(courses.program_id, programId))
      .orderBy(asc(courses.id));

    res.json({ success: true, data: list });
  } catch (err) {
    console.error("GET courses by program error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

/* CREATE COURSE — EXPLICIT COLUMNS ONLY (NO PRICE!) */
router.post("/", async (req, res) => {
  const { title, description = "", program_id } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: "Course title is required" });
  }

  const programId = Number(program_id);
  if (!Number.isInteger(programId) || programId <= 0) {
    return res.status(400).json({ error: "Valid program ID is required" });
  }

  try {
    // Verify program exists
    const [program] = await db
      .select({ id: programs.id })
      .from(programs)
      .where(eq(programs.id, programId));

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    // Explicitly list columns — this prevents Drizzle from touching `price`
    const [course] = await db
      .insert(courses)
      .values({
        title: title.trim(),
        description: description.trim(),
        program_id: programId,
        is_active: true, // optional, if you want to set it
      })
      .returning({
        id: courses.id,
        program_id: courses.program_id,
        title: courses.title,
        description: courses.description,
        is_active: courses.is_active,
        created_at: courses.created_at,
      });

    res.json({ success: true, course });
  } catch (err) {
    console.error("POST course error:", err);
    res.status(500).json({ error: "Failed to create course" });
  }
});

/* UPDATE COURSE */
router.patch("/:id", async (req, res) => {
  const courseId = Number(req.params.id);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ error: "Invalid course ID" });
  }

  const { title, description } = req.body;

  const updates: Partial<typeof courses.$inferInsert> = {};

  if (title !== undefined) {
    if (!title?.trim()) return res.status(400).json({ error: "Title cannot be empty" });
    updates.title = title.trim();
  }
  if (description !== undefined) updates.description = description?.trim() || "";

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    const [updated] = await db
      .update(courses)
      .set(updates)
      .where(eq(courses.id, courseId))
      .returning({
        id: courses.id,
        program_id: courses.program_id,
        title: courses.title,
        description: courses.description,
        is_active: courses.is_active,
        created_at: courses.created_at,
      });

    if (!updated) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ success: true, course: updated });
  } catch (err) {
    console.error("PATCH course error:", err);
    res.status(500).json({ error: "Failed to update course" });
  }
});

/* DELETE COURSE */
router.delete("/:id", async (req, res) => {
  const courseId = Number(req.params.id);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ error: "Invalid course ID" });
  }

  try {
    const [deleted] = await db
      .delete(courses)
      .where(eq(courses.id, courseId))
      .returning({ id: courses.id });

    if (!deleted) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    console.error("DELETE course error:", err);
    res.status(500).json({ error: "Failed to delete course" });
  }
});

export default router;