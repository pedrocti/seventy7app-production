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
import learningRouter from "./api/learning";


// ---------------------------
// Admin routes
// ---------------------------
import adminRoutes from "./api/adminRouter";

// ---------------------------
// Attach user-facing routes
// ---------------------------

// Auth routes
router.use("/auth", authRoutes);

// User-specific routes (overview first to avoid conflicts)
router.use("/user/overview", userOverview); // mounted before /user
router.use("/user", userRoutes);

// Investments
router.use("/investments", investRoutes); // fetch all investments
router.use("/invest", investRoutes);       // create new investment

// Other user-related routes
router.use("/deposit", depositRoutes);
router.use("/withdrawal", withdrawalRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/plans", plansRoutes);
router.use("/trades", tradesRouter);
router.use("/mentorship", mentorshipRouter);
router.use("/learning", learningRouter);


// Admin routes
router.use("/admin", adminRoutes);

// ---------------------------
// Global error handler
// ---------------------------
router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API Error:", err);
  res.status(500).json({ success: false, error: "Internal Server Error" });
});

export default router;
