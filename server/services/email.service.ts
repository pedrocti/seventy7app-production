// server/services/email.service.ts
import nodemailer from "nodemailer";
import { db } from "../db/connection";
import {
  email_settings,
  email_templates,
  email_logs,
} from "../db/schema";
import { eq } from "drizzle-orm";

interface SendEmailOptions {
  to: string;
  templateName?: string;              
  subject?: string;                   
  body?: string;                      
  variables?: Record<string, string | number | any>;
  userId?: number;
}

function renderTemplate(
  template: string,
  variables: Record<string, string | number | any> = {}
): string {
  let output = template;
  for (const [key, value] of Object.entries(variables)) {
    output = output.replace(
      new RegExp(`{{\\s*${key}\\s*}}`, "g"),
      String(value ?? "")
    );
  }
  return output;
}

export async function sendEmail(options: SendEmailOptions) {
  const {
    to,
    templateName,
    subject: rawSubject,
    body: rawBody,
    variables = {},
    userId,
  } = options;

  if (!to?.trim()) {
    throw new Error("Recipient email is required");
  }

  // 1️ Load active SMTP config
  const [smtp] = await db
    .select()
    .from(email_settings)
    .where(eq(email_settings.is_active, true))
    .limit(1);

  if (!smtp) {
    throw new Error("No active email settings configured");
  }

  let finalSubject = rawSubject || "";
  let finalBody = rawBody || "";

  // 2️ If templateName provided → load & render template
  if (templateName) {
    const [template] = await db
      .select()
      .from(email_templates)
      .where(eq(email_templates.name, templateName))
      .limit(1);

    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    finalSubject = renderTemplate(template.subject, variables);
    finalBody = renderTemplate(template.body, variables);
  } else {
    // 4 Raw send – ensure subject & body provided
    if (!finalSubject.trim() || !finalBody.trim()) {
      throw new Error("Subject and body required when no templateName is provided");
    }
  }

  // 3️ Create transporter
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.encryption === "ssl",
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  });

  // 4️ Send email
  try {
    await transporter.sendMail({
      from: `"${smtp.from_name}" <${smtp.from_email}>`,
      to: to.trim(),
      subject: finalSubject.trim(),
      html: finalBody.trim(),
    });

    // 5️ Log success
    await db.insert(email_logs).values({
      user_id: userId,
      to_email: to.trim(),
      subject: finalSubject.trim(),
      status: "sent",
    });

    return { success: true };
  } catch (error: any) {
    // 6️ Log failure
    await db.insert(email_logs).values({
      user_id: userId,
      to_email: to.trim(),
      subject: finalSubject.trim(),
      status: "failed",
      error: error.message || "Unknown email send error",
    });

    throw error;
  }
}