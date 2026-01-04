// server/api/admin/mentorshipEvents.ts
import { Router } from "express";
import { db } from "../../db/connection";
import { mentorship_events } from "../../db/schema";
import { auth, adminOnly } from "../utils";
import { eq, desc } from "drizzle-orm";

const router = Router();

// PROTECT ALL ROUTES — Admin only
router.use(auth, adminOnly);

/* =====================================================
   GET /api/admin/mentorship/events
   → List all events for admin panel
===================================================== */
router.get("/events", async (_req, res) => {
  try {
    const events = await db
      .select({
        id: mentorship_events.id,
        title: mentorship_events.title,
        description: mentorship_events.description,
        date: mentorship_events.date,
        time: mentorship_events.time,
        venue: mentorship_events.venue,
        link: mentorship_events.link,
        price: mentorship_events.price,
        is_active: mentorship_events.is_active,
        created_at: mentorship_events.created_at,
      })
      .from(mentorship_events)
      .orderBy(desc(mentorship_events.created_at));

    res.json({ success: true, events });
  } catch (err) {
    console.error("Admin: Failed to load mentorship events:", err);
    res.status(500).json({ error: "Failed to load events" });
  }
});

/* =====================================================
   POST /api/admin/mentorship/events
   → Create new paid/free mentorship event
===================================================== */
router.post("/events", async (req, res) => {
  const {
    title,
    date,
    time,
    venue,
    link,
    description,
    price = "0",
  } = req.body;

  if (!title?.trim() || !date || !time || !venue?.trim()) {
    return res.status(400).json({ error: "Title, date, time, and venue are required" });
  }

  try {
    const [newEvent] = await db
      .insert(mentorship_events)
      .values({
        title: title.trim(),
        date: new Date(`${date}T${time}`),
        time: time.trim(),
        venue: venue.trim(),
        link: link?.trim() || null,
        description: description?.trim() || null,
        price: String(price),
        is_active: true,
      })
      .returning();

    res.json({ success: true, event: newEvent });
  } catch (err: any) {
    console.error("Admin: Failed to create mentorship event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

/* =====================================================
   DELETE /api/admin/mentorship/events/:id
   → Permanently delete an event
===================================================== */
router.delete("/events/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  try {
    const result = await db
      .delete(mentorship_events)
      .where(eq(mentorship_events.id, id))
      .returning({ id: mentorship_events.id });

    if (result.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    console.error("Admin: Failed to delete event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;