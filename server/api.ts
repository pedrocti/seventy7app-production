//server/api.ts
import { Router, Request, Response, NextFunction } from "express";
const router = Router();
// ---------------------------
// User-facing routes
// ---------------------------
import authRoutes from "./api/auth.js";
import userRoutes from "./api/user.js";
import depositRoutes from "./api/deposit.js";
import investRoutes from "./api/invest.js";
import withdrawalRoutes from "./api/withdrawal.js";
import portfolioRoutes from "./api/portfolio.js";
import plansRoutes from "./api/plans.js";
import tradesRouter from "./api/trades.js";
import mentorshipRouter from "./api/mentorship.js";
import userOverview from "./api/userOverview.js";
import notificationsRouter from "./api/user/notifications.js";
// FORCE LOAD THE FOLDER
import learningRouter from "./api/learning/index.js";
import loanRoutes from './api/loans';
// ---------------------------
// Admin routes
// ---------------------------
import adminRoutes from "./api/adminRouter.js";
// ---------------------------
// Blog routes
// ---------------------------
import blogRoutes from "./api/blog.js";
import adminBlogRoutes from "./api/admin/blog.js";
// ---------------------------
// Attach user-facing routes
// ---------------------------
router.use("/auth", authRoutes);
router.use("/user/overview", userOverview);
router.use("/user", userRoutes);
router.use("/investments", investRoutes);
router.use("/invest", investRoutes);
router.use("/deposits", depositRoutes);
router.use("/withdrawal", withdrawalRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/plans", plansRoutes);
router.use("/trades", tradesRouter);
router.use("/mentorship", mentorshipRouter);
router.use("/user/notifications", notificationsRouter);
// courses, lessons, programs
router.use("/learning", learningRouter);
router.use('/loans', loanRoutes);
// Admin
router.use("/admin", adminRoutes);
// Blog — public
router.use("/blog", blogRoutes);
// Blog — admin (protected by adminRouter middleware)
router.use("/admin/blog", adminBlogRoutes);
// ---------------------------
// Global error handler
// ---------------------------
router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API Error:", err);
  res.status(500).json({ success: false, error: "Internal Server Error" });
});
export default router;