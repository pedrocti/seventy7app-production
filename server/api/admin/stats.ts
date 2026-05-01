// server/api/admin/stats.ts
import { Router } from "express";
import { db } from "../../db/connection";
import {
  users,
  investments,
  program_enrollments,
  mentorship_applications,
  managed_portfolios,
} from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import { auth, adminOnly } from "../utils";

const router = Router();

// Protect all routes — only authenticated admins
router.use(auth, adminOnly);

interface AdminStats {
  totalUsers: number;
  mainBalance: number;        // users.balance + users.bonus_balance
  investmentBalance: number;  // sum of active investments
  programsBalance: number;    // sum of programs purchased
  mentorshipBalance: number;  // sum of approved mentorship payments
  portfolioBalance: number;   // sum of active portfolio values
  totalBalance: number;       // sum of all above assets
  totalInvested: number;      // sum of active investments only
}

// GET /api/admin/stats
router.get("/", async (_req, res) => {
  try {
    // Prevent caching of dynamic stats
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const start = Date.now();

    // 1. Total users
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalUsers = Number(userCount?.count ?? 0);

    // 2. Main balance = sum of user balances + bonus balances
    const [balanceSum] = await db
      .select({ total: sql<number>`COALESCE(SUM(${users.balance} + ${users.bonus_balance}), 0)` })
      .from(users);
    const mainBalance = Number(balanceSum?.total ?? 0);

    // 3. Total active investments (amount invested by all users)
    const [activeInvestSum] = await db
      .select({ total: sql<number>`COALESCE(SUM(${investments.amount}), 0)` })
      .from(investments)
      .where(eq(investments.status, "active"));
    const totalInvested = Number(activeInvestSum?.total ?? 0);
    const investmentBalance = totalInvested; // same as totalInvested

    // 4. Programs balance
    const [programsSum] = await db
      .select({ total: sql<number>`COALESCE(SUM(${program_enrollments.amount_paid}), 0)` })
      .from(program_enrollments);
    const programsBalance = Number(programsSum?.total ?? 0);

    // 5. Mentorship balance (approved)
    const [mentorshipSum] = await db
      .select({ total: sql<number>`COALESCE(SUM(${mentorship_applications.amount_paid}), 0)` })
      .from(mentorship_applications)
      .where(eq(mentorship_applications.status, "approved"));
    const mentorshipBalance = Number(mentorshipSum?.total ?? 0);

    // 6. Portfolio balance (current value of active managed portfolios)
    const [portfolioSum] = await db
      .select({ total: sql<number>`COALESCE(SUM(${managed_portfolios.current_value}), 0)` })
      .from(managed_portfolios)
      .where(eq(managed_portfolios.status, "active"));
    const portfolioBalance = Number(portfolioSum?.total ?? 0);

    // 7. Total balance = sum of all assets
    const totalBalance =
      mainBalance + investmentBalance + programsBalance + mentorshipBalance + portfolioBalance;

    console.log(`[Admin Stats] Completed in ${Date.now() - start}ms`);

    res.json({
      success: true,
      stats: {
        totalUsers,
        mainBalance,
        investmentBalance,
        programsBalance,
        mentorshipBalance,
        portfolioBalance,
        totalBalance,
        totalInvested,
      } as AdminStats,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch admin stats",
    });
  }
});

export default router;