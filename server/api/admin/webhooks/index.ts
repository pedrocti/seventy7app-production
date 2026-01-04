import { Router } from "express";
import stripeWebhook from "./stripe";
import nowpaymentsWebhook from "./nowpayments";

const router = Router();

/**
 * Public webhook endpoints
 * No auth middleware here
 */
router.use("/stripe", stripeWebhook);
router.use("/nowpayments", nowpaymentsWebhook);

export default router;

