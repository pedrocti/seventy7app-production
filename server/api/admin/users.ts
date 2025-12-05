import { Router } from "express";
import { db } from "../../db/connection";
import { users } from "../../db/schema";
import { desc } from "drizzle-orm";
import { auth, adminOnly } from "../utils";

const router = Router();

// Protect all routes
router.use(auth, adminOnly);

// GET /api/admin/users
router.get("/", async (_req, res) => {
  try {
    const list = await db.select().from(users).orderBy(desc(users.id));
    res.json({ success: true, users: list });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
