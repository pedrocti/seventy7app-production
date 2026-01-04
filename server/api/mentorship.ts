// server/api/mentorship.ts
import { Router } from "express";
import { db } from "../db/connection";
import { mentorship_events, mentorship_applications, users } from "../db/schema";
import { auth, getAdmin, subFromColumn, addToColumn } from "./utils";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

/* GET /api/mentorship/events */
router.get("/events", async (req, res) => {
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
      })
      .from(mentorship_events)
      .where(eq(mentorship_events.is_active, true))
      .orderBy(desc(mentorship_events.date));

    let purchased: number[] = [];

    if (req.user?.id) {
      const purchases = await db
        .select({ event_id: mentorship_applications.event_id })
        .from(mentorship_applications)
        .where(
          and(
            eq(mentorship_applications.user_id, req.user.id),
            eq(mentorship_applications.is_paid_access, true)
          )
        );

      purchased = purchases
        .map((p) => p.event_id)
        .filter((id): id is number => id !== null);
    }

    res.json({ success: true, events, purchased });
  } catch (err) {
    console.error("Failed to load events:", err);
    res.status(500).json({ error: "Server error" });
  }
});


/* BUY EVENT */
router.post("/buy/:id", auth, async (req, res) => {
  const eventId = Number(req.params.id);
  if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" });
  const userId = req.user.id;

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ success: false, error: "Invalid event ID" });
  }

  try {
    // Fetch event price
    const [event] = await db
      .select({ price: mentorship_events.price })
      .from(mentorship_events)
      .where(eq(mentorship_events.id, eventId));

    if (!event) return res.status(404).json({ success: false, error: "Event not found" });

    const price = Number(event.price);

    // Check if user already has access
    const [existing] = await db
      .select()
      .from(mentorship_applications)
      .where(
        and(
          eq(mentorship_applications.user_id, userId),
          eq(mentorship_applications.event_id, eventId)
        )
      );

    if (existing?.is_paid_access) {
      return res.json({
        success: true,
        message: "Already purchased",
        alreadyPurchased: true,
        eventId,
      });
    }

    // Transaction: deduct user balance, credit admin, grant access
    await db.transaction(async (tx) => {
      const admin = await getAdmin(tx);

      // Deduct user balance
      const [user] = await tx
        .select({ balance: users.balance })
        .from(users)
        .where(eq(users.id, userId));

      if (!user || Number(user.balance) < price) {
        throw new Error("Insufficient balance");
      }

      await tx
        .update(users)
        .set({ balance: subFromColumn(users.balance, price) })
        .where(eq(users.id, userId));

      // Credit admin mentorship balance
      await tx
        .update(users)
        .set({ admin_mentorship_balance: addToColumn(users.admin_mentorship_balance, price) })
        .where(eq(users.id, admin.id));

      // Grant access
      if (existing) {
        await tx
          .update(mentorship_applications)
          .set({ is_paid_access: true, amount_paid: price.toString() })
          .where(eq(mentorship_applications.id, existing.id));
      } else {
        await tx
          .insert(mentorship_applications)
          .values({
            user_id: userId,
            event_id: eventId,
            is_paid_access: true,
            amount_paid: price.toString(),
          });
      }
    });

    res.json({ success: true, message: "Payment successful!" });
  } catch (err) {
    console.error("Buy error:", err);
    res.status(500).json({ success: false, error: (err as Error).message || "Payment failed" });
  }
});

export default router;