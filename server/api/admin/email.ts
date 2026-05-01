// server/api/admin/email.ts
import { Router } from "express";
import { db } from "../../db/connection";
import {
  users,
  email_templates,
  email_verification_tokens,
  email_settings,
  settings,
} from "../../db/schema";
import { eq, isNull, isNotNull, and, or } from "drizzle-orm";
import { sendEmail } from "../../services/email.service";
import { generateToken, getExpiry } from "../../utils/token";
import { adminOnly } from "../../middleware/adminOnly";

const router = Router();

// 🔐 Protect all routes
router.use(adminOnly);

// ===========================================================
// GET USERS
// ===========================================================
router.get("/users", async (req, res) => {
  try {
    const status = req.query.status as "verified" | "unverified" | undefined;
    const conditions = [];
    if (status === "verified") conditions.push(isNotNull(users.email_verified_at));
    if (status === "unverified") conditions.push(isNull(users.email_verified_at));

    const results =
      conditions.length > 0
        ? await db.select().from(users).where(and(...conditions))
        : await db.select().from(users);

    res.json({
      users: results.map((u) => ({
        id: u.id,
        username: u.username,
        first_name: u.first_name,
        email: u.email,
        email_verified_at: u.email_verified_at,
        role: u.role,
      })),
    });
  } catch (err) {
    console.error("ADMIN EMAIL USERS ERROR:", err);
    res.status(500).json({ error: "Failed to load email users" });
  }
});

// ===========================================================
// RESEND VERIFICATION EMAIL
// ===========================================================
router.post("/resend-verification/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || !user.email) return res.status(404).json({ error: "User not found" });
    if (user.email_verified_at) return res.status(400).json({ error: "User already verified" });

    const token = generateToken();
    await db.insert(email_verification_tokens).values({
      user_id: user.id,
      token,
      type: "verify",
      expires_at: getExpiry(24),
    });

    // ✅ Pass all necessary variables with fallbacks
    const variables = {
      first_name: user.first_name || user.username,
      username: user.username,
      verification_link: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
      reset_link: "", // for password reset template
      site_name: "77KAPITAL",
      logo_url: "https://seventy7hub.com/logo.png",
    };

    await sendEmail({
      to: user.email,
      templateName: "verify_email",
      variables,
      userId: user.id,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("RESEND VERIFICATION ERROR:", err);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

// ===========================================================
// REVOKE VERIFICATION
// ===========================================================
router.post("/revoke-verification/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    await db.update(users).set({ email_verified_at: null }).where(eq(users.id, userId));
    res.json({ success: true });
  } catch (err) {
    console.error("REVOKE VERIFICATION ERROR:", err);
    res.status(500).json({ error: "Failed to revoke verification" });
  }
});

// ===========================================================
// EMAIL TEMPLATES
// ===========================================================
router.get("/templates", async (_req, res) => {
  try {
    const templates = await db.select().from(email_templates);
    res.json({ templates });
  } catch (err) {
    console.error("LOAD TEMPLATES ERROR:", err);
    res.status(500).json({ error: "Failed to load email templates" });
  }
});

router.post("/templates", async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    if (!name || !subject || !body) return res.status(400).json({ error: "Missing fields" });

    await db.insert(email_templates).values({ name, subject, body });
    res.json({ success: true });
  } catch (err) {
    console.error("CREATE TEMPLATE ERROR:", err);
    res.status(500).json({ error: "Failed to create template" });
  }
});

router.put("/templates/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { subject, body } = req.body;
    await db.update(email_templates).set({ subject, body }).where(eq(email_templates.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE TEMPLATE ERROR:", err);
    res.status(500).json({ error: "Failed to update template" });
  }
});

router.delete("/templates/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(email_templates).where(eq(email_templates.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE TEMPLATE ERROR:", err);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

// ===========================================================
// SEND EMAIL (TEST & REAL)
// ===========================================================
router.post("/templates/send/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { to, variables = {} } = req.body;

    const [template] = await db.select().from(email_templates).where(eq(email_templates.id, id)).limit(1);
    if (!template) return res.status(404).json({ error: "Template not found" });

    // ✅ Merge default variables with provided ones
    const emailVariables = {
      first_name: "Test",
      username: "Test User",
      verification_link: "https://your-domain.com/verify?token=test-token",
      reset_link: "https://your-domain.com/reset?token=test-token",
      site_name: "77KAPITAL",
      logo_url: "https://seventy7hub.com/logo.png",
      ...variables,
    };

    await sendEmail({
      to,
      templateName: template.name,
      variables: emailVariables,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("SEND EMAIL ERROR:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ===========================================================
// SMTP SETTINGS
// ===========================================================
router.get("/smtp", async (_req, res) => {
  try {
    const [smtp] = await db.select().from(email_settings).where(eq(email_settings.is_active, true)).limit(1);
    res.json({ success: true, settings: smtp ?? {} });
  } catch (err) {
    console.error("LOAD SMTP SETTINGS ERROR:", err);
    res.status(500).json({ error: "Failed to load SMTP settings" });
  }
});

router.patch("/smtp", async (req, res) => {
  try {
    const { host, port, username, password, from_name, from_email, encryption } = req.body;
    await db.update(email_settings).set({ is_active: false }).where(eq(email_settings.is_active, true));
    await db.insert(email_settings).values({ host, port, username, password, from_name, from_email, encryption, is_active: true });
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE SMTP SETTINGS ERROR:", err);
    res.status(500).json({ error: "Failed to update SMTP settings" });
  }
});

// ===========================================================
// PAYMENT SETTINGS
// ===========================================================
router.get("/payment-settings", async (_req, res) => {
  try {
    const keys = ["stripe_secret_key", "stripe_webhook_secret", "nowpayments_ipn_secret"];
    const conditions = keys.map((k) => eq(settings.key, k));
    const results = await db.select().from(settings).where(or(...conditions));
    const map: Record<string, string> = {};
    results.forEach((s) => { map[s.key] = s.value; });
    res.json({ success: true, settings: map });
  } catch (err) {
    console.error("LOAD PAYMENT SETTINGS ERROR:", err);
    res.status(500).json({ error: "Failed to load payment settings" });
  }
});

router.patch("/payment-settings", async (req, res) => {
  try {
    const { stripe_secret_key, stripe_webhook_secret, nowpayments_ipn_secret } = req.body;
    const updates: Record<string, string> = { stripe_secret_key, stripe_webhook_secret, nowpayments_ipn_secret };

    for (const [key, value] of Object.entries(updates)) {
      const [existing] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (existing) await db.update(settings).set({ value }).where(eq(settings.key, key));
      else await db.insert(settings).values({ key, value });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE PAYMENT SETTINGS ERROR:", err);
    res.status(500).json({ error: "Failed to update payment settings" });
  }
});

export default router;
