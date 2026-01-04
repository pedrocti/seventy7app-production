import { Router } from "express";
import { db } from "../../db/connection";
import { users } from "../../db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { auth, adminOnly } from "../utils";
import { email_logs } from "../../db/schema";
import { assignment_submissions, enrollments, program_enrollments, mentorship_applications, transactions } from "../../db/schema";


const router = Router();

// Protect all routes
router.use(auth, adminOnly);

/* ----------------------------------
   GET /api/admin/users
   (existing - unchanged)
---------------------------------- */
router.get("/", async (_req, res) => {
  try {
    const list = await db.select().from(users).orderBy(desc(users.id));
    res.json({ success: true, users: list });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* ----------------------------------
   GET /api/admin/users/:id
   View single user details
---------------------------------- */
router.get("/:id", async (req, res) => {
  console.log("GET /users/:id called with", req.params.id);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, error: "Invalid user id" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  res.json({ success: true, user });
});

/* ----------------------------------
   PATCH /api/admin/users/:id
   Edit user details
---------------------------------- */
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { username, email, role } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, error: "Invalid user id" });
  }

  await db
    .update(users)
    .set({
      ...(username !== undefined && { username }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
    })
    .where(eq(users.id, id));

  res.json({ success: true });
});

/* ----------------------------------
   PATCH /api/admin/users/:id/balance
   Add or deduct balance
---------------------------------- */
router.patch("/:id/balance", async (req, res) => {
  const id = Number(req.params.id);
  const { amount } = req.body;

  if (!Number.isFinite(amount)) {
    return res.status(400).json({ success: false, error: "Invalid amount" });
  }

  await db
    .update(users)
    .set({
      balance: sql`${users.balance} + ${amount}`,
    })
    .where(eq(users.id, id));

  res.json({ success: true });
});

/* ----------------------------------
   DELETE /api/admin/users/:id
   Delete user (admin protected)
   Safely handles foreign keys
---------------------------------- */
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  if (user.role === "admin") {
    return res
      .status(400)
      .json({ success: false, error: "Admin account cannot be deleted" });
  }

  try {
    // 1️⃣ Nullify referred_by in other users
    await db.update(users).set({ referred_by: null }).where(eq(users.referred_by, id));

    // 2️⃣ Delete dependent tables
    await db.delete(email_logs).where(eq(email_logs.user_id, id));
    await db.delete(assignment_submissions).where(eq(assignment_submissions.user_id, id));
    await db.delete(enrollments).where(eq(enrollments.user_id, id));
    await db.delete(program_enrollments).where(eq(program_enrollments.user_id, id));
    await db.delete(mentorship_applications).where(eq(mentorship_applications.user_id, id));
    await db.delete(transactions).where(eq(transactions.user_id, id));
    // add other dependent tables here as needed

    // 3️⃣ Finally, delete the user
    await db.delete(users).where(eq(users.id, id));

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete user:", err);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});


export default router;
