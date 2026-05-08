// server/api/admin/plans.ts
import { Router } from "express";
import { db } from "../../db/connection";
import { plans } from "../../db/schema";
import { auth, adminOnly } from "../utils";
import { eq } from "drizzle-orm";

const router = Router();
router.use(auth, adminOnly);

function numericId(param: any): number | null {
  const n = Number(param);
  return Number.isFinite(n) ? n : null;
}

/* ─────────────────────────────────────────────────────────
   GET /api/admin/plans
───────────────────────────────────────────────────────── */
router.get("/", async (_req, res) => {
  try {
    const list = await db.select().from(plans);
    res.json({ success: true, plans: list });
  } catch (err) {
    console.error("[Admin Plans] Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

/* ─────────────────────────────────────────────────────────
   POST /api/admin/plans
   Create a new investment plan.
   Fields:
     name                — required
     min_amount          — required
     max_amount          — optional
     description         — optional
     monthly_roi_percent — expected monthly ROI % (e.g. 3 = 3%)
   duration_days is always 365 (annual) — not exposed to admin UI
───────────────────────────────────────────────────────── */
router.post("/", async (req, res) => {
  const {
    name,
    min_amount,
    max_amount,
    description,
    monthly_roi_percent = 0,
  } = req.body ?? {};

  if (!name || String(name).trim() === "") {
    return res.status(400).json({ error: "Plan name is required" });
  }

  const parsedMin = Number(min_amount ?? 0);
  if (isNaN(parsedMin) || parsedMin < 0) {
    return res.status(400).json({ error: "Invalid min_amount" });
  }

  const parsedRoi = Number(monthly_roi_percent ?? 0);
  if (isNaN(parsedRoi) || parsedRoi < 0) {
    return res.status(400).json({ error: "Invalid monthly_roi_percent" });
  }

  try {
    const [inserted] = await db
      .insert(plans)
      .values({
        name:                String(name).trim(),
        min_amount:          parsedMin.toFixed(2),
        max_amount:          max_amount == null || max_amount === ""
                               ? null
                               : String(Number(max_amount).toFixed(2)),
        description:         description ?? "",
        duration_days:       365,          // always annual
        monthly_roi_percent: parsedRoi.toFixed(4),
      })
      .returning();

    res.status(201).json({ success: true, plan: inserted });
  } catch (err) {
    console.error("[Admin Plans] Create error:", err);
    res.status(500).json({ error: "Failed to create plan" });
  }
});

/* ─────────────────────────────────────────────────────────
   PUT /api/admin/plans/:id
   Update an existing plan.
───────────────────────────────────────────────────────── */
router.put("/:id", async (req, res) => {
  const id = numericId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid plan ID" });

  const {
    name,
    min_amount,
    max_amount,
    description,
    monthly_roi_percent,
  } = req.body ?? {};

  if (name !== undefined && String(name).trim() === "") {
    return res.status(400).json({ error: "Plan name cannot be empty" });
  }

  const payload: Record<string, any> = {};

  if (name              !== undefined) payload.name               = String(name).trim();
  if (min_amount        !== undefined) payload.min_amount         = Number(min_amount).toFixed(2);
  if (max_amount        !== undefined) {
    payload.max_amount = max_amount == null || max_amount === ""
      ? null
      : Number(max_amount).toFixed(2);
  }
  if (description       !== undefined) payload.description        = description ?? "";
  if (monthly_roi_percent !== undefined) {
    const roi = Number(monthly_roi_percent);
    if (isNaN(roi) || roi < 0) {
      return res.status(400).json({ error: "Invalid monthly_roi_percent" });
    }
    payload.monthly_roi_percent = roi.toFixed(4);
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    const [updated] = await db
      .update(plans)
      .set(payload)
      .where(eq(plans.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Plan not found" });

    res.json({ success: true, plan: updated });
  } catch (err) {
    console.error("[Admin Plans] Update error:", err);
    res.status(500).json({ error: "Failed to update plan" });
  }
});

/* ─────────────────────────────────────────────────────────
   DELETE /api/admin/plans/:id
───────────────────────────────────────────────────────── */
router.delete("/:id", async (req, res) => {
  const id = numericId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid plan ID" });

  try {
    const [deleted] = await db
      .delete(plans)
      .where(eq(plans.id, id))
      .returning();

    if (!deleted) return res.status(404).json({ error: "Plan not found" });

    res.json({ success: true, deleted });
  } catch (err) {
    console.error("[Admin Plans] Delete error:", err);
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

export default router;