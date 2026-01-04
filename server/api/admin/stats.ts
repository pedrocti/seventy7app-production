// server/api/admin/stats.ts
import { Router } from "express";
import { db } from "../../db/connection";
import {
  users,
  transactions,
  investments,
  program_enrollments,
  mentorship_applications,
  managed_portfolios,
} from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth, adminOnly } from "../utils";

const router = Router();

// Protect all routes in this file — only authenticated admins
router.use(auth, adminOnly);

interface AdminStats {
  totalUsers: number;
  mainBalance: number;
  investmentBalance: number;
  programsBalance: number;
  mentorshipBalance: number;
  portfolioBalance: number;
  totalBalance: number;
  totalInvested: number;
}

// GET /api/admin/stats
router.get("/", async (_req, res) => {
  try {
    // Prevent caching of dynamic stats
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    const start = Date.now(); // optional timing

    // 1. Total number of users
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalUsers = Number(userCount?.count ?? 0);

    // 2. Main Balance = TOTAL SUCCESSFUL DEPOSITS (real money in)
    const [depositsSum] = await db
      .select({
        sum: sql<number>`COALESCE(SUM(${transactions.amount}::numeric), 0)`,
      })
      .from(transactions)
      .where(and(
        eq(transactions.type, "deposit"),
        eq(transactions.status, "completed")
      ));
    const mainBalance = Number(depositsSum?.sum ?? 0);

    // 3. Investment Balance = total amount spent on investments
    const [investmentSum] = await db
      .select({
        sum: sql<number>`COALESCE(SUM(${transactions.amount}::numeric), 0)`,
      })
      .from(transactions)
      .where(and(
        eq(transactions.type, "investment_purchase"),
        eq(transactions.status, "completed")
      ));
    const investmentBalance = Number(investmentSum?.sum ?? 0);

    // 4. Programs Balance = total amount paid for learning programs
    const [programsSum] = await db
      .select({
        sum: sql<number>`COALESCE(SUM(${program_enrollments.amount_paid}::numeric), 0)`,
      })
      .from(program_enrollments);
    const programsBalance = Number(programsSum?.sum ?? 0);

    // 5. Mentorship Balance = total amount paid for approved mentorship applications
    const [mentorshipSum] = await db
      .select({
        sum: sql<number>`COALESCE(SUM(${mentorship_applications.amount_paid}::numeric), 0)`,
      })
      .from(mentorship_applications)
      .where(eq(mentorship_applications.status, "approved"));
    const mentorshipBalance = Number(mentorshipSum?.sum ?? 0);

    // 6. Portfolio Balance = total invested in active managed portfolios
    const [portfolioSum] = await db
      .select({
        sum: sql<number>`COALESCE(SUM(${managed_portfolios.total_invested}::numeric), 0)`,
      })
      .from(managed_portfolios)
      .where(eq(managed_portfolios.status, "active"));
    const portfolioBalance = Number(portfolioSum?.sum ?? 0);

    // 7. Total Balance = total successful deposits + realized investment profits
    // Total balance = mainBalance + sum of completed 'profit_credit' only
    const [profitSum] = await db
      .select({
        sum: sql<number>`COALESCE(SUM(${transactions.amount}::numeric), 0)`,
      })
      .from(transactions)
      .where(and(
        eq(transactions.type, "profit_credit"),
        eq(transactions.status, "completed")
      ));

    const totalBalance = mainBalance + Number(profitSum?.sum ?? 0);


    // 8. Total Invested = sum of active investment amounts
    const [investedSum] = await db
      .select({
        sum: sql<number>`COALESCE(SUM(${investments.amount}::numeric), 0)`,
      })
      .from(investments)
      .where(eq(investments.status, "active"));
    const totalInvested = Number(investedSum?.sum ?? 0);

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