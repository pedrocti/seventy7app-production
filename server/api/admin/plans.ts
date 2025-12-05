import { Router } from "express";
import { db, plans } from "../../db/connection";
import { auth, adminOnly } from "../utils";
import { eq } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

// Ensure plan ID is always a number
function getNumericId(idParam: any) {
  const num = Number(idParam);
  return Number.isFinite(num) ? num : null;
}

// -------------------- GET ALL PLANS --------------------
router.get("/", async (req, res) => {
  try {
    const list = await db.select().from(plans);
    res.json({ success: true, plans: list });
  } catch (err) {
    console.error("Error fetching plans:", err);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// -------------------- CREATE PLAN --------------------
router.post("/", async (req, res) => {
  try {
    const { name, min_amount, max_amount, description, duration_days } = req.body ?? {};

    if (!name || String(name).trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }

    const row = {
      name: String(name).trim(),
      min_amount: (min_amount ?? 0).toString(),
      max_amount: max_amount == null || max_amount === "" ? null : String(max_amount),
      description: description ?? "",
      duration_days: (duration_days ?? 0),
    };

    const inserted = await db.insert(plans).values(row).returning();

    res.status(201).json({ success: true, plan: inserted[0] ?? null });
  } catch (err) {
    console.error("Create plan error:", err);
    res.status(500).json({ error: "Failed to create plan" });
  }
});

// -------------------- DELETE PLAN --------------------
router.delete("/:id", async (req, res) => {
  try {
    const id = getNumericId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "Invalid numeric plan ID" });
    }

    const deleted = await db
      .delete(plans)
      .where(eq(plans.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json({ success: true, deleted: deleted[0] });
  } catch (err) {
    console.error("Delete plan error:", err);
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

// -------------------- UPDATE PLAN --------------------
router.put("/:id", async (req, res) => {
  try {
    const id = getNumericId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "Invalid numeric plan ID" });
    }

    const { name, min_amount, max_amount, description, duration_days } = req.body ?? {};

    if (name !== undefined && String(name).trim() === "") {
      return res.status(400).json({ error: "Name cannot be empty" });
    }

    const updatePayload: any = {};

    if (name !== undefined) updatePayload.name = String(name).trim();
    if (min_amount !== undefined) updatePayload.min_amount = String(min_amount);
    if (max_amount !== undefined)
      updatePayload.max_amount = max_amount == null || max_amount === "" ? null : String(max_amount);
    if (description !== undefined) updatePayload.description = description ?? "";
    if (duration_days !== undefined) updatePayload.duration_days = Number(duration_days);

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }

    const updated = await db
      .update(plans)
      .set(updatePayload)
      .where(eq(plans.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json({ success: true, plan: updated[0] });
  } catch (err) {
    console.error("Update plan error:", err);
    res.status(500).json({ error: "Failed to update plan" });
  }
});

export default router;
