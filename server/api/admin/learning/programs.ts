// server/api/admin/learning/programs.ts
import { Router } from "express";
import { db } from "../../../db/connection";
import { programs } from "../../../db/schema";
import { auth, adminOnly } from "../../utils";
import { eq } from "drizzle-orm";

const router = Router();

// Only admins can access
router.use(auth, adminOnly);

/* ===== GET ALL PROGRAMS ===== */
router.get("/", async (_req, res) => {
  try {
    const list = await db.select().from(programs).orderBy(programs.id);
    res.json({ success: true, programs: list });
  } catch (err) {
    console.error("GET /programs error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch programs" });
  }
});

/* ===== CREATE PROGRAM ===== */
router.post("/", async (req, res) => {
  try {
    const { title, description, price, duration_days } = req.body;
    if (!title || !title.trim())
      return res.status(400).json({ success: false, error: "Program title is required" });

    const [program] = await db.insert(programs)
      .values({
        title: title.trim(),
        description: description?.trim() || "",
        price: price || 0,
        duration_days: duration_days || 30
      })
      .returning();

    res.json({ success: true, program });
  } catch (err) {
    console.error("POST /programs error:", err);
    res.status(500).json({ success: false, error: "Failed to create program" });
  }
});

/* ===== UPDATE PROGRAM ===== */
router.patch("/:id", async (req, res) => {
  try {
    const programId = Number(req.params.id);
    if (isNaN(programId)) return res.status(400).json({ success: false, error: "Invalid program ID" });

    const { title, description, price, duration_days } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (duration_days !== undefined) updateData.duration_days = duration_days;

    const [updated] = await db.update(programs).set(updateData).where(eq(programs.id, programId)).returning();
    if (!updated) return res.status(404).json({ success: false, error: "Program not found" });

    res.json({ success: true, program: updated });
  } catch (err) {
    console.error("PATCH /programs/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to update program" });
  }
});

/* ===== DELETE PROGRAM ===== */
router.delete("/:id", async (req, res) => {
  try {
    const programId = Number(req.params.id);
    if (isNaN(programId)) return res.status(400).json({ success: false, error: "Invalid program ID" });

    const [deleted] = await db.delete(programs).where(eq(programs.id, programId)).returning();
    if (!deleted) return res.status(404).json({ success: false, error: "Program not found" });

    res.json({ success: true, program: deleted });
  } catch (err) {
    console.error("DELETE /programs/:id error:", err);
    res.status(500).json({ success: false, error: "Failed to delete program" });
  }
});

export default router;
