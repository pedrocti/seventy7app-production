// server/api/admin/learning/adminLessons.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import { lessons, courses } from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq, asc } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

/* GET LESSONS BY COURSE */
router.get("/course/:courseId", async (req, res) => {
  const courseId = Number(req.params.courseId);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ success: false, error: "Invalid course ID" });
  }

  try {
    const list = await db
      .select({
        id: lessons.id,
        course_id: lessons.course_id,
        title: lessons.title,
        content: lessons.content,
        video_url: lessons.video_url,
        pdf_url: lessons.pdf_url,
        external_link: lessons.external_link,
        has_assignment: lessons.has_assignment,
        sort_order: lessons.sort_order,
        created_at: lessons.created_at,
      })
      .from(lessons)
      .where(eq(lessons.course_id, courseId))
      .orderBy(asc(lessons.sort_order), asc(lessons.id));

    res.json({ success: true, lessons: list });
  } catch (err) {
    console.error("GET lessons by course error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch lessons" });
  }
});

/* CREATE LESSON */
router.post("/", async (req, res) => {
  const {
    title,
    content = "",
    video_url,
    pdf_url,
    external_link,
    has_assignment = false,
    course_id,
    sort_order = 0,
  } = req.body;

  if (!title?.trim() || !Number.isInteger(Number(course_id)) || Number(course_id) <= 0) {
    return res.status(400).json({ success: false, error: "Title and valid course_id are required" });
  }

  try {
    // Verify course exists
    const [course] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, Number(course_id)));

    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const [lesson] = await db
      .insert(lessons)
      .values({
        title: title.trim(),
        content: content.trim(),
        video_url: video_url?.trim() || null,
        pdf_url: pdf_url?.trim() || null,
        external_link: external_link?.trim() || null,
        has_assignment: Boolean(has_assignment),
        course_id: Number(course_id),
        sort_order: Number(sort_order),
      })
      .returning({
        id: lessons.id,
        course_id: lessons.course_id,
        title: lessons.title,
        content: lessons.content,
        video_url: lessons.video_url,
        pdf_url: lessons.pdf_url,
        external_link: lessons.external_link,
        has_assignment: lessons.has_assignment,
        sort_order: lessons.sort_order,
        created_at: lessons.created_at,
      });

    res.json({ success: true, lesson });
  } catch (err) {
    console.error("POST lesson error:", err);
    res.status(500).json({ success: false, error: "Failed to create lesson" });
  }
});

/* UPDATE LESSON */
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, error: "Invalid lesson ID" });
  }

  const {
    title,
    content,
    video_url,
    pdf_url,
    external_link,
    has_assignment,
    sort_order,
  } = req.body;

  const updates: Partial<typeof lessons.$inferInsert> = {};

  if (title !== undefined) {
    if (!title?.trim()) return res.status(400).json({ success: false, error: "Title cannot be empty" });
    updates.title = title.trim();
  }
  if (content !== undefined) updates.content = content?.trim() || "";
  if (video_url !== undefined) updates.video_url = video_url?.trim() || null;
  if (pdf_url !== undefined) updates.pdf_url = pdf_url?.trim() || null;
  if (external_link !== undefined) updates.external_link = external_link?.trim() || null;
  if (has_assignment !== undefined) updates.has_assignment = Boolean(has_assignment);
  if (sort_order !== undefined) updates.sort_order = Number(sort_order) || 0;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: "No valid fields provided for update" });
  }

  try {
    const [updated] = await db
      .update(lessons)
      .set(updates)
      .where(eq(lessons.id, id))
      .returning({
        id: lessons.id,
        course_id: lessons.course_id,
        title: lessons.title,
        content: lessons.content,
        video_url: lessons.video_url,
        pdf_url: lessons.pdf_url,
        external_link: lessons.external_link,
        has_assignment: lessons.has_assignment,
        sort_order: lessons.sort_order,
        created_at: lessons.created_at,
      });

    if (!updated) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    res.json({ success: true, lesson: updated });
  } catch (err) {
    console.error("PATCH lesson error:", err);
    res.status(500).json({ success: false, error: "Failed to update lesson" });
  }
});

/* DELETE LESSON */
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, error: "Invalid lesson ID" });
  }

  try {
    const [deleted] = await db
      .delete(lessons)
      .where(eq(lessons.id, id))
      .returning({ id: lessons.id });

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    res.json({ success: true, message: "Lesson deleted successfully" });
  } catch (err) {
    console.error("DELETE lesson error:", err);
    res.status(500).json({ success: false, error: "Failed to delete lesson" });
  }
});

export default router;