// server/api/learning/programs.ts
import { Router } from "express";
import { db } from "../../db/connection";
import {
  learning_programs,
  courses,
  enrollments,
  users,
  program_enrollments,
} from "../../db/schema";
import { auth } from "../utils";
import { eq, desc, and } from "drizzle-orm";

const router = Router();
console.log("🔥 LOADED programs.ts @", new Date().toISOString());

/* =====================================================
   GET /api/learning/programs
   → Public list of active programs + user purchases
===================================================== */
router.get("/", auth, async (req: any, res) => {
  const userId = req.user?.id;
  try {
    // All active programs
    const programs = await db
      .select({
        id: learning_programs.id,
        title: learning_programs.title,
        description: learning_programs.description,
        price: learning_programs.price,
        duration_days: learning_programs.duration_days,
        created_at: learning_programs.created_at,
      })
      .from(learning_programs)
      .where(eq(learning_programs.is_active, true))
      .orderBy(desc(learning_programs.created_at));

    // Programs the user already purchased
    let purchased: number[] = [];
    if (userId) {
      const userPrograms = await db
        .select({ program_id: program_enrollments.program_id })
        .from(program_enrollments)
        .where(eq(program_enrollments.user_id, userId));

      purchased = userPrograms.map((p) => p.program_id);
    }

    res.json({ success: true, programs, purchased });
  } catch (err) {
    console.error("Failed to load programs:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   GET /api/learning/programs/:id
   → Program details + courses + enrollment status
===================================================== */
router.get("/:id", auth, async (req: any, res) => {
  const programId = Number(req.params.id);
  const userId = req.user?.id;

  if (!Number.isInteger(programId)) {
    return res.status(400).json({ error: "Invalid program ID" });
  }

  try {
    const [program] = await db
      .select()
      .from(learning_programs)
      .where(eq(learning_programs.id, programId));

    if (!program) return res.status(404).json({ error: "Program not found" });

    const programCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.program_id, programId))
      .orderBy(courses.id);

    let enrolledCourseIds: number[] = [];
    if (userId) {
      const userEnrollments = await db
        .select({ course_id: enrollments.course_id })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.user_id, userId),
            eq(enrollments.status, "active")
          )
        );
      enrolledCourseIds = userEnrollments.map((e) => e.course_id);
    }

    const coursesWithStatus = programCourses.map((course) => ({
      ...course,
      enrolled: enrolledCourseIds.includes(course.id),
    }));

    res.json({
      success: true,
      program,
      courses: coursesWithStatus,
      enrolled: enrolledCourseIds.length > 0,
    });
  } catch (err) {
    console.error("Failed to load program details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   POST /api/learning/programs/buy/:id
   → BUY + ENROLL (lifetime access)
===================================================== */
router.post("/buy/:id", auth, async (req: any, res) => {
  const programId = Number(req.params.id);
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ success: false, error: "Please log in" });
  if (!Number.isInteger(programId) || programId <= 0)
    return res.status(400).json({ success: false, error: "Invalid program ID" });

  try {
    // Get program
    const [program] = await db
      .select({ id: learning_programs.id, price: learning_programs.price })
      .from(learning_programs)
      .where(
        and(
          eq(learning_programs.id, programId),
          eq(learning_programs.is_active, true)
        )
      );

    if (!program) return res.status(404).json({ success: false, error: "Program not found" });

    const price = Number(program.price);

    // Check if user already enrolled in program
    const [existingProgram] = await db
      .select()
      .from(program_enrollments)
      .where(
        and(
          eq(program_enrollments.user_id, userId),
          eq(program_enrollments.program_id, programId)
        )
      );

    if (existingProgram) {
      return res.status(400).json({ success: false, error: "Already enrolled in this program" });
    }

    // Check user balance
    const [account] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId));

    if (!account) return res.status(404).json({ success: false, error: "User not found" });

    const currentBalance = Number(account.balance);
    if (price > 0 && currentBalance < price)
      return res.status(400).json({ success: false, error: "Insufficient balance" });

    // Deduct balance
    let newBalance = currentBalance;
    if (price > 0) {
      newBalance -= price;
      await db
        .update(users)
        .set({ balance: newBalance.toString() })
        .where(eq(users.id, userId));
    }

    // Insert program enrollment
    await db.insert(program_enrollments).values({
      user_id: userId,
      program_id: programId,
      status: "active",
      progress_percent: "0",
      amount_paid: price.toString(),
    });

    // Enroll user in all courses of the program (new or existing)
    const programCourses = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.program_id, programId));

    for (const course of programCourses) {
      const [exists] = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.user_id, userId),
            eq(enrollments.course_id, course.id)
          )
        );

      if (!exists) {
        await db.insert(enrollments).values({
          user_id: userId,
          course_id: course.id,
          status: "active",
          progress_percent: "0",
        });
      }
    }

    console.log("BUY SUCCESS:", { userId, programId });

    res.json({
      success: true,
      message: "Enrollment successful",
      newBalance: newBalance.toString(),
    });
  } catch (err) {
    console.error("POST buy program error:", err);
    res.status(500).json({ success: false, error: "Failed to complete purchase" });
  }
});

export default router;
