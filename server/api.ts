//server/api.ts
import { Router, Request, Response, NextFunction } from "express";
const router = Router();
// ---------------------------
// User-facing routes
// ---------------------------
import authRoutes from "./api/auth";
import userRoutes from "./api/user";
import depositRoutes from "./api/deposit";
import investRoutes from "./api/invest";
import withdrawalRoutes from "./api/withdrawal";
import portfolioRoutes from "./api/portfolio";
import plansRoutes from "./api/plans";
import tradesRouter from "./api/trades";
import mentorshipRouter from "./api/mentorship";
import userOverview from "./api/userOverview";
import notificationsRouter from "./api/user/notifications";
// FORCE LOAD THE FOLDER
import learningRouter from "./api/learning";
import loanRoutes from './api/loans';
// ---------------------------
// Admin routes
// ---------------------------
import adminRoutes from "./api/adminRouter";
// ---------------------------
// Blog routes
// ---------------------------
import blogRoutes from "./api/blog";
import adminBlogRoutes from "./api/admin/blog";
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