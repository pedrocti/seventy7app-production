//server/api/admin/learning/adminPrograms.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import { learning_programs } from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Protect all routes — Admin only
router.use(auth, adminOnly);

/* =====================================================
   GET /api/admin/learning/programs
   → List all programs (ordered by newest first)
===================================================== */
router.get("/", async (_req, res) => {
  try {
    const programs = await db
      .select({
        id: learning_programs.id,
        title: learning_programs.title,
        description: learning_programs.description,
        price: learning_programs.price,
        duration_days: learning_programs.duration_days,
        is_active: learning_programs.is_active,
        created_at: learning_programs.created_at,
      })
      .from(learning_programs)
      .orderBy(desc(learning_programs.created_at));

    res.json({ success: true, programs });
  } catch (err) {
    console.error("Admin: Failed to load programs:", err);
    res.status(500).json({ error: "Failed to load programs" });
  }
});

/* =====================================================
   GET /api/admin/learning/programs/:id
   → Get single program
===================================================== */
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid program ID" });
  }

  try {
    const [program] = await db
      .select()
      .from(learning_programs)
      .where(eq(learning_programs.id, id))
      .limit(1);

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    res.json({ success: true, program });
  } catch (err) {
    console.error("Admin: Failed to load program:", err);
    res.status(500).json({ error: "Failed to load program" });
  }
});

/* =====================================================
   POST /api/admin/learning/programs
   → Create new program (paid or free)
===================================================== */
router.post("/", async (req, res) => {
  const { title, description, price = "0", duration_days = 30, is_active = true } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: "Program title is required" });
  }

  try {
    const parsedPrice = Number(price);
    const parsedDuration = Number(duration_days);

    const [program] = await db
      .insert(learning_programs)
      .values({
        title: title.trim(),
        description: description?.trim() || null,
        price: isNaN(parsedPrice) ? "0.00" : parsedPrice.toFixed(2),
        duration_days: isNaN(parsedDuration) || parsedDuration <= 0 ? 30 : parsedDuration,
        is_active,
      })
      .returning();

    res.status(201).json({ success: true, program });
  } catch (err) {
    console.error("Admin: Failed to create program:", err);
    res.status(500).json({ error: "Failed to create program" });
  }
});

/* =====================================================
   PATCH /api/admin/learning/programs/:id
   → Update program (partial updates)
===================================================== */
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid program ID" });
  }

  const { title, description, price, duration_days, is_active } = req.body;

  const updates: any = {};

  if (title !== undefined) {
    if (!title?.trim()) return res.status(400).json({ error: "Title cannot be empty" });
    updates.title = title.trim();
  }
  if (description !== undefined) updates.description = description?.trim() || null;
  if (price !== undefined) {
    const p = Number(price);
    updates.price = isNaN(p) ? "0.00" : p.toFixed(2);
  }
  if (duration_days !== undefined) {
    const d = Number(duration_days);
    updates.duration_days = isNaN(d) || d <= 0 ? 30 : d;
  }
  if (is_active !== undefined) updates.is_active = Boolean(is_active);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    const [updated] = await db
      .update(learning_programs)
      .set(updates)
      .where(eq(learning_programs.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Program not found" });
    }

    res.json({ success: true, program: updated });
  } catch (err) {
    console.error("Admin: Failed to update program:", err);
    res.status(500).json({ error: "Failed to update program" });
  }
});

/* =====================================================
   DELETE /api/admin/learning/programs/:id
   → Delete program
===================================================== */
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid program ID" });
  }

  try {
    const [deleted] = await db
      .delete(learning_programs)
      .where(eq(learning_programs.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Program not found" });
    }

    res.json({ success: true, message: "Program deleted successfully" });
  } catch (err) {
    console.error("Admin: Failed to delete program:", err);
    res.status(500).json({ error: "Failed to delete program" });
  }
});

export default router;