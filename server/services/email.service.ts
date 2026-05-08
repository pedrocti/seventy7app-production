// server/services/email.service.ts
//
// ⚠️  THIS SERVICE IS DISABLED.
//
// All transactional emails now go through Brevo.
// See: server/services/brevo.service.ts
//
// This file is kept to avoid import errors in any files
// that still reference sendEmail. Those files should be
// updated to import from brevo.service.ts instead.
//
// DO NOT add new email logic here.

export async function sendEmail(_options: any): Promise<void> {
  console.warn(
    "[email.service] sendEmail() called but this service is disabled. " +
    "Use sendBrevoEmail() from brevo.service.ts instead."
  );
}