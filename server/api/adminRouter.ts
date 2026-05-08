// routes/admin/index.ts
import { Router } from "express";
import { auth, adminOnly } from "./utils";
const router = Router();
// GLOBAL ADMIN PROTECTION (CRITICAL)
router.use(auth, adminOnly);
// Admin sub-routes
import usersRouter from "./admin/users";
import transactionsRouter from "./admin/transactions";
import referralSettingsRouter from "./admin/referralSettings";
import plansRouter from "./admin/plans";
import statsRouter from "./admin/stats";
import tradesRouter from "./admin/trades";
import adminInvestmentsRouter from "./admin/investments";
import portfolioRequestsRouter from "./admin/portfolioRequests";
import learningRouter from "./admin/learning";
import adminProgramsRouter from "./admin/learning/programs";
import adminEmailRouter from "./admin/email";
import mentorshipEventsRouter from "./admin/mentorshipEvents";
import statsTrendRouter from "./admin/statsTrend";
import paymentSettingsRouter from "./admin/paymentSettings";
import blogRouter from "./admin/blog";
import uploadRouter from "./admin/upload";
import loanRouter from './admin/loans';
// ---------------------------
// Learning
// ---------------------------
router.use("/learning", learningRouter);
router.use("/learning/programs", adminProgramsRouter);
// ---------------------------
// Core admin routes
// ---------------------------
router.use("/users", usersRouter);
router.use("/transactions", transactionsRouter);
router.use("/referral-settings", referralSettingsRouter);
router.use("/portfolio-requests", portfolioRequestsRouter);
router.use("/plans", plansRouter);
router.use("/stats", statsRouter);
router.use("/trades", tradesRouter);
router.use("/investments", adminInvestmentsRouter);
router.use("/payment-settings", paymentSettingsRouter);
router.use("/mentorship", mentorshipEventsRouter);
router.use("/stats/trend", statsTrendRouter);
router.use('/loans', loanRouter);
// Email
router.use("/email", adminEmailRouter);
// Blog CMS
router.use("/blog", blogRouter);
// Image upload
router.use("/upload", uploadRouter);
export default router;