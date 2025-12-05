import { Router } from "express";
const router = Router();

// Admin sub-routes
import usersRouter from "./admin/users";
import transactionsRouter from "./admin/transactions";
import paymentAddressesRouter from "./admin/paymentAddresses";
import referralSettingsRouter from "./admin/referralSettings";
import plansRouter from "./admin/plans";
import statsRouter from "./admin/stats";
import tradesRouter from "./admin/trades";
import adminInvestmentsRouter from "./admin/investments";
//import adminMentorshipRouter from "./admin/mentorship";
import portfolioRequestsRouter from "./admin/portfolioRequests";
import adminLearningRouter from "./learning";

// Mount sub-routers at their correct namespace
router.use("/users", usersRouter);                     // /api/admin/users
router.use("/transactions", transactionsRouter);       // /api/admin/transactions
router.use("/payment-address", paymentAddressesRouter); // /api/admin/payment-addresses
router.use("/referral-settings", referralSettingsRouter); // /api/admin/referral-settings
router.use("/portfolio-requests", portfolioRequestsRouter); // /api/admin/portfolio-requests
router.use("/plans", plansRouter);                     // /api/admin/plans
router.use("/stats", statsRouter);                     // /api/admin/stats
router.use("/trades", tradesRouter);
//router.use("/mentorship", adminMentorshipRouter);// /api/admin/trades
router.use("/investments", adminInvestmentsRouter);    // /api/admin/investments
router.use("/learning", adminLearningRouter);

export default router;
