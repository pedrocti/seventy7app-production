import { Router } from "express";
import { db } from "../../db/connection";
import { email_templates } from "../../db/schema";
import { eq } from "drizzle-orm";
import { adminOnly } from "../../middleware/adminOnly";
import { sendEmail } from "../../services/email.service";

const router = Router();

// =======================================================
// GET ALL TEMPLATES
// =======================================================
router.get("/", adminOnly, async (_req, res) => {
  const templates = await db.select().from(email_templates);
  res.json({ templates });
});

// =======================================================
// CREATE TEMPLATE
// =======================================================
router.post("/", adminOnly, async (req, res) => {
  const { name, subject, body } = req.body;

  if (!name || !subject || !body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  await db.insert(email_templates).values({
    name,
    subject,
    body,
  });

  res.json({ success: true });
});

// =======================================================
// UPDATE TEMPLATE
// =======================================================
// UPDATE TEMPLATE BY KEY
router.patch("/:key", adminOnly, async (req, res) => {
  const { key } = req.params;
  const { subject, body } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  await db
    .update(email_templates)
    .set({ subject, body })
    .where(eq(email_templates.name, key));

  res.json({ success: true });
});


// =======================================================
// DELETE TEMPLATE
// =======================================================
router.delete("/:id", adminOnly, async (req, res) => {
  const id = Number(req.params.id);

  await db
    .delete(email_templates)
    .where(eq(email_templates.id, id));

  res.json({ success: true });
});

// =======================================================
// SEND TEST EMAIL
// =======================================================
router.post("/test/:id", adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const { to } = req.body;

  const [template] = await db
    .select()
    .from(email_templates)
    .where(eq(email_templates.id, id))
    .limit(1);

  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }

  await sendEmail({
    to,
    templateName: template.name,
    variables: {
      username: "Test User",
    },
  });

  res.json({ success: true });
});

export default router;
