// routes/admin/index.ts (or wherever your main admin router is)

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


import paymentSettingsRouter from "./admin/paymentSettings";

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

// Email
router.use("/email", adminEmailRouter);

export default router;