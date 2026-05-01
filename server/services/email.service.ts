// server/services/email.service.ts
import nodemailer from "nodemailer";
import { db } from "../db/connection";
import { email_settings, email_templates, email_logs } from "../db/schema";
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
    const re = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    output = output.replace(re, String(value ?? ""));
  }
  return output;
}

function wrapHtml(body: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body style="margin:0; padding:0; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; background-color:#f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
          <tr>
            <td align="center">
              ${body}
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, templateName, subject: rawSubject, body: rawBody, variables = {}, userId } = options;

  if (!to?.trim()) throw new Error("Recipient email is required");

  // Load active SMTP config
  const [smtp] = await db
    .select()
    .from(email_settings)
    .where(eq(email_settings.is_active, true))
    .limit(1);
  if (!smtp) throw new Error("No active email settings configured");

  let finalSubject = rawSubject || "";
  let finalBody = rawBody || "";

  // Template render
  if (templateName) {
    const [template] = await db
      .select()
      .from(email_templates)
      .where(eq(email_templates.name, templateName))
      .limit(1);

    if (!template) throw new Error(`Email template '${templateName}' not found`);

    finalSubject = renderTemplate(template.subject, variables);
    finalBody = renderTemplate(template.body, variables);
  } else {
    if (!finalSubject.trim() || !finalBody.trim()) {
      throw new Error("Subject and body required when no templateName is provided");
    }
  }

  // Wrap body in HTML
  finalBody = wrapHtml(finalBody);

  // Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.encryption === "ssl",
    auth: { user: smtp.username, pass: smtp.password },
  });

  try {
    await transporter.sendMail({
      from: `"${smtp.from_name}" <${smtp.from_email}>`,
      to: to.trim(),
      subject: finalSubject.trim(),
      html: finalBody.trim(),
    });

    // Log success
    await db.insert(email_logs).values({
      user_id: userId,
      to_email: to.trim(),
      subject: finalSubject.trim(),
      status: "sent",
    });

    return { success: true };
  } catch (error: any) {
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
