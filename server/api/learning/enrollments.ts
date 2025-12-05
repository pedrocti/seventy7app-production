import { Router } from "express";
import { db } from "../../db/connection";
import { enrollments } from "../../db/schema";
import { auth } from "../utils";

const router = Router();

// POST /api/learning/enroll
router.post("/", auth, async (req: any, res) => {
  try {
    const { course_id } = req.body;
    const userId = req.user.id;

    const [enrollment] = await db
      .insert(enrollments)
      .values({ user_id: userId, course_id })
      .returning();

    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, error: "Enrollment failed" });
  }
});

export default router;
