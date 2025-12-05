// server/api/admin/learning/adminLessons.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import { lessons, courses } from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

/* ================== GET LESSONS BY COURSE ================== */
router.get("/course/:courseId", async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    if (isNaN(courseId)) return res.status(400).json({ success: false, error: "Invalid course ID" });

    const list = await db.select().from(lessons).where(eq(lessons.course_id, courseId)).orderBy(lessons.sort_order);
    res.json({ success: true, lessons: list });
  } catch (err) {
    console.error("GET /adminLessons/course/:courseId error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch lessons" });
  }
});

/* ================== CREATE LESSON ================== */
router.post("/", async (req, res) => {
  try {
    const { course_id, title, content, material_link, pdf_url, sort_order } = req.body;
    if (!course_id || isNaN(Number(course_id))) return res.status(400).json({ success: false, error: "Valid course_id is required" });
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: "Lesson title is required" });

    const [lesson] = await db.insert(lessons)
      .values({
        course_id,
        title: title.trim(),
        content: content || "",
        material_link: material_link || null,
        pdf_url: pdf_url || null,
        sort_order: sort_order || 0
      })
      .returning();

    res.json({ success: true, lesson });
  } catch (err) {
    console.error("POST /adminLessons error:", err);
    res.status(500).json({ success: false, error: "Failed to create lesson" });
  }
});

/* ================== UPDATE LESSON ================== */
router.patch("/:lessonId", async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);
    if (isNaN(lessonId)) return res.status(400).json({ success: false, error: "Invalid lesson ID" });

    const { title, content, material_link, pdf_url, sort_order } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title?.trim() || "";
    if (content !== undefined) updateData.content = content || "";
    if (material_link !== undefined) updateData.material_link = material_link || null;
    if (pdf_url !== undefined) updateData.pdf_url = pdf_url || null;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order) || 0;

    const [updated] = await db.update(lessons).set(updateData).where(eq(lessons.id, lessonId)).returning();
    if (!updated) return res.status(404).json({ success: false, error: "Lesson not found" });

    res.json({ success: true, lesson: updated });
  } catch (err) {
    console.error("PATCH /adminLessons/:lessonId error:", err);
    res.status(500).json({ success: false, error: "Failed to update lesson" });
  }
});

/* ================== DELETE LESSON ================== */
router.delete("/:lessonId", async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);
    if (isNaN(lessonId)) return res.status(400).json({ success: false, error: "Invalid lesson ID" });

    const [deleted] = await db.delete(lessons).where(eq(lessons.id, lessonId)).returning();
    if (!deleted) return res.status(404).json({ success: false, error: "Lesson not found" });

    res.json({ success: true, lesson: deleted });
  } catch (err) {
    console.error("DELETE /adminLessons/:lessonId error:", err);
    res.status(500).json({ success: false, error: "Failed to delete lesson" });
  }
});

export default router;
