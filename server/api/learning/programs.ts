// server/api/learning/programs.ts
import { Router } from "express";
import { db } from "../../db/connection";
import { programs, courses, enrollments, users } from "../../db/schema";
import { auth } from "../utils";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/learning/programs — public list of programs
router.get("/", async (_req, res) => {
  try {
    const list = await db.select().from(programs).orderBy(programs.id);
    res.json({ success: true, programs: list });
  } catch (err) {
    console.error("GET /learning/programs error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch programs" });
  }
});

/**
 * POST /api/learning/programs/:id/enroll
 * Protected — user must be authenticated (auth middleware)
 * Deducts user.balance by program.price and creates enrollments for all program's courses
 */
router.post("/:id/enroll", auth, async (req: any, res) => {
  try {
    const programId = Number(req.params.id);
    if (isNaN(programId)) return res.status(400).json({ success: false, error: "Invalid program ID" });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    // Fetch program
    const [program] = await db.select().from(programs).where(eq(programs.id, programId));
    if (!program) return res.status(404).json({ success: false, error: "Program not found" });

    // Fetch user
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    if (Number(user.balance) < Number(program.price)) return res.status(400).json({ success: false, error: "Insufficient balance" });

    // Deduct balance atomically-ish: (simple approach: update then create)
    const newBalance = Number(user.balance) - Number(program.price);
    await db.update(users).set({ balance: newBalance }).where(eq(users.id, userId));

    // Fetch program courses
    const coursesInProgram = await db.select().from(courses).where(eq(courses.program_id, programId));

    // Create enrollments for courses (bulk insert possible, but do one-by-one to get returning rows)
    const createdEnrollments: any[] = [];
    for (const course of coursesInProgram) {
      const [enr] = await db.insert(enrollments)
        .values({
          user_id: userId,
          course_id: course.id,
          status: "active",
          progress_percent: 0,
        })
        .returning();
      createdEnrollments.push(enr);
    }

    res.json({
      success: true,
      message: "Enrolled in program and all courses",
      remaining_balance: newBalance,
      enrollments: createdEnrollments,
    });
  } catch (err) {
    console.error("POST /learning/programs/:id/enroll error:", err);
    res.status(500).json({ success: false, error: "Failed to enroll in program" });
  }
});

export default router;
