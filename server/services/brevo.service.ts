// server/services/brevo.service.ts
// Brand: black #0a0a0a, cyan #00AEEF/#00C4F5, Inter font
// Matches the Seventy7 Brief newsletter design exactly.

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

function cfg() {
  return {
    apiKey:  process.env.BREVO_API_KEY      ?? "",
    email:   process.env.BREVO_SENDER_EMAIL ?? "info@seventy7hub.com",
    name:    process.env.BREVO_SENDER_NAME  ?? "Seventy7 Kapital",
    appUrl:  process.env.FRONTEND_URL       ?? "https://seventy7hub.com",
  };
}

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */
export interface Recipient {
  email: string;
  name?: string;
}

/* ══════════════════════════════════════════════════════════
   CORE SENDERS
══════════════════════════════════════════════════════════ */
export async function sendBrevoEmail(opts: {
  to:          Recipient[];
  subject:     string;
  htmlContent: string;
}): Promise<void> {
  const { apiKey, email, name } = cfg();

  if (!apiKey || apiKey === "your_brevo_api_key_here") {
    console.warn("[Brevo] API key not set — email skipped:", opts.subject);
    return;
  }

  const res = await fetch(BREVO_URL, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key":      apiKey,
    },
    body: JSON.stringify({
      sender:      { email, name },
      to:          opts.to,
      subject:     opts.subject,
      htmlContent: opts.htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API ${res.status}: ${err}`);
  }
}

export async function sendBrevoEmailBatch(
  recipients:  Recipient[],
  subject:     string,
  htmlContent: string
): Promise<void> {
  const CHUNK = 99;
  for (let i = 0; i < recipients.length; i += CHUNK) {
    await sendBrevoEmail({ to: recipients.slice(i, i + CHUNK), subject, htmlContent });
  }
}

/* ══════════════════════════════════════════════════════════
   BASE HTML WRAPPER
   Matches newsletter exactly:
   - Pure black #0a0a0a background
   - #000000 card
   - Cyan #00AEEF / #00C4F5 accent
   - Inter font
   - Top gradient band
   - Dark border #1a1a1a
   - Social links + footer
══════════════════════════════════════════════════════════ */
function wrap(body: string, opts?: { tag?: string; tagEmoji?: string }): string {
  const { appUrl } = cfg();
  const year = new Date().getFullYear();
  const tag  = opts?.tag ?? "Seventy7 Kapital";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
  body{margin:0;padding:0;background-color:#0a0a0a;font-family:'Inter',Arial,sans-serif}
  a{color:#00AEEF;text-decoration:none}
  .ew{background-color:#0a0a0a;padding:32px 16px}
  .ec{max-width:620px;margin:0 auto}
  .band{background:linear-gradient(90deg,#00C4F5,#0090D4);height:4px;border-radius:4px 4px 0 0}
  .hdr{background:#000000;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;padding:28px 40px 20px;text-align:center}
  .eyebrow{font-size:10px;font-weight:700;letter-spacing:6px;color:#00AEEF;text-transform:uppercase;margin-bottom:8px}
  .brand{font-size:24px;font-weight:900;color:#ffffff;letter-spacing:3px;margin:0 0 4px}
  .brandsub{font-size:11px;color:#00AEEF;letter-spacing:4px;text-transform:uppercase;opacity:.8}
  .divgrad{height:1px;background:linear-gradient(90deg,transparent,#00AEEF,transparent);margin:18px 0 0;opacity:.4}
  .rule{background:#000000;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;padding:0 40px}
  .rl{height:1px;background:linear-gradient(90deg,transparent,#00AEEF 20%,#00AEEF 80%,transparent);opacity:.2;margin:4px 0}
  .cb{background:#000000;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;padding:28px 40px}
  .stag{display:inline-block;background:linear-gradient(90deg,#00C4F5,#0090D4);color:#000000;font-size:10px;font-weight:700;letter-spacing:4px;padding:5px 14px;border-radius:2px;margin-bottom:16px;text-transform:uppercase}
  .sh{font-size:13px;font-weight:700;letter-spacing:4px;color:#00AEEF;text-transform:uppercase;margin:0 0 16px}
  p.bt{font-size:15px;line-height:1.85;color:#cccccc;margin:0 0 16px}
  p.bt strong{color:#ffffff;font-weight:600}
  p.bt em{color:#00AEEF;font-style:normal;font-weight:600}
  .callout{border-left:3px solid #00AEEF;background:#050e14;padding:18px 20px;border-radius:0 6px 6px 0;margin:20px 0}
  .callout p{font-size:15px;line-height:1.75;color:#cccccc;margin:0}
  .callout strong{color:#ffffff}
  .hbox{background:#050e14;border:1px solid #0d2333;border-top:2px solid #00AEEF;border-radius:0 0 6px 6px;padding:22px 24px;margin:20px 0}
  .hbox .hl{font-size:10px;font-weight:700;letter-spacing:4px;color:#00AEEF;text-transform:uppercase;margin-bottom:12px}
  .abox{background:linear-gradient(135deg,#030d14,#050e14);border:1px solid #0d2333;border-left:3px solid #00AEEF;border-radius:0 6px 6px 0;padding:24px;margin:20px 0}
  .abox .at{font-size:14px;font-weight:700;color:#00AEEF;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}
  .btn{display:inline-block;background:linear-gradient(90deg,#00C4F5,#0090D4);color:#000000;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:13px 36px;border-radius:2px;text-decoration:none;margin:20px 0 8px}
  .note{font-size:12px;color:#555555;margin-top:8px;line-height:1.7}
  .alert-box{background:#0d0505;border:1px solid #2d0a0a;border-top:2px solid #ff4d4d;border-radius:0 0 6px 6px;padding:16px 20px;margin:16px 0}
  .success-box{background:#030f09;border:1px solid #0a2d18;border-top:2px solid #00C4F5;border-radius:0 0 6px 6px;padding:16px 20px;margin:16px 0}
  .row-item{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #0d2333;font-size:13px}
  .row-item:last-child{border:none}
  .row-lbl{color:#888888}
  .row-val{color:#ffffff;font-weight:600;text-align:right}
  .row-val.pos{color:#00C4F5}
  .row-val.neg{color:#ff4d4d}
  .row-val.gold{color:#00AEEF}
  .signoff{background:#000000;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;padding:28px 40px;text-align:center}
  .so-divline{width:40px;height:2px;background:linear-gradient(90deg,#00C4F5,#0090D4);margin:16px auto;border-radius:2px}
  .social{background:#000000;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;padding:24px 40px;text-align:center}
  .social-lbl{font-size:10px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px}
  .sbtn{display:inline-block;background:#111111;border:1px solid #222222;border-radius:4px;padding:8px 16px;margin:0 4px;font-size:12px;font-weight:600;color:#888888;text-decoration:none;letter-spacing:1px}
  .ftr{background:#000000;border:1px solid #1a1a1a;border-top:0;border-radius:0 0 8px 8px;padding:20px 40px;text-align:center}
  .ftr-rule{height:1px;background:linear-gradient(90deg,transparent,#1a1a1a,transparent);margin-bottom:16px}
  .ftr-logo{font-size:12px;font-weight:700;letter-spacing:4px;color:#00AEEF;opacity:.4;margin-bottom:10px;text-transform:uppercase}
  .ftr-text{font-size:11px;color:#333333;line-height:1.7;margin:0}
  .ftr-text a{color:#555555;text-decoration:underline}
  @media only screen and (max-width:600px){
    .hdr,.rule,.cb,.signoff,.social,.ftr{padding-left:24px!important;padding-right:24px!important}
    .brand{font-size:20px!important}
  }
</style>
</head>
<body>
<div class="ew">
<div class="ec">

  <!-- TOP BAND -->
  <div class="band"></div>

  <!-- HEADER -->
  <div class="hdr">
    <div class="eyebrow">Seventy7 Kapital</div>
    <div class="brand">SEVENTY7 KAPITAL</div>
    <div class="brandsub">Education Before Profit</div>
    <div class="divgrad"></div>
  </div>

  <!-- TAG + CONTENT -->
  <div class="rule"><div class="rl"></div></div>
  <div class="cb">
    <div><span class="stag">${tag}</span></div>
    ${body}
  </div>
  <div class="rule"><div class="rl"></div></div>

  <!-- SIGN OFF -->
  <div class="signoff">
    <p style="font-size:14px;color:#888888;line-height:1.8;margin:0 0 20px">
      Questions? Reply to this email — we read and respond to <strong style="color:#ffffff">every message.</strong>
    </p>
    <p style="font-size:14px;color:#888888;margin:0 0 4px">Stay educated. Stay winning. 💰</p>
    <div class="so-divline"></div>
    <div style="font-size:18px;font-weight:900;color:#ffffff;margin-bottom:4px">Seventy7 Kapital</div>
    <div style="font-size:12px;color:#00AEEF;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">Premium Financial Platform</div>
    <div style="font-size:12px;color:#555;letter-spacing:1px">info@seventy7hub.com</div>
  </div>

  <!-- SOCIAL -->
  <div class="social">
    <div class="social-lbl">Follow us</div>
    <a href="https://www.instagram.com/seventy7hub" class="sbtn">Instagram</a>
    <a href="https://www.linkedin.com/company/seventy7-trading-academy/" class="sbtn">LinkedIn</a>
    <a href="https://x.com/seventy7Kapital" class="sbtn">X / Twitter</a>
  </div>

  <!-- FOOTER -->
  <div class="ftr">
    <div class="ftr-rule"></div>
    <div class="ftr-logo">Seventy7 Kapital</div>
    <p class="ftr-text">
      &copy; ${year} Seventy7 Kapital. All rights reserved.<br/>
      <a href="${appUrl}">seventy7hub.com</a>
      &nbsp;|&nbsp;
      <a href="mailto:info@seventy7hub.com">info@seventy7hub.com</a>
    </p>
  </div>

</div>
</div>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   TEMPLATES
══════════════════════════════════════════════════════════ */

/* ── 1. Welcome + verify ── */
export function welcomeEmail(d: { username: string; verifyUrl: string }): string {
  return wrap(`
    <p class="bt">Hey <strong>${d.username}</strong>,</p>
    <p class="bt">Welcome to Seventy7 Kapital. Your account has been created successfully — we are glad to have you.</p>
    <p class="bt">One last step. Please verify your email address to unlock full access to your dashboard, investment plans, portfolio management, stake-to-earn programmes, and educational resources.</p>
    <div style="text-align:center"><a href="${d.verifyUrl}" class="btn">Verify Email Address</a></div>
    <p class="note" style="text-align:center">This link expires in 24 hours. If you did not create this account, you can safely ignore this email.</p>
  `, { tag: "Welcome — Action Required" });
}

/* ── 2. Resend verification ── */
export function verifyEmailTemplate(d: { username: string; verifyUrl: string }): string {
  return wrap(`
    <p class="bt">Hey <strong>${d.username}</strong>,</p>
    <p class="bt">Click the button below to verify your email address and activate your Seventy7 Kapital account.</p>
    <div style="text-align:center"><a href="${d.verifyUrl}" class="btn">Verify Email Address</a></div>
    <p class="note" style="text-align:center">This link expires in 24 hours. If you did not request this, you can safely ignore it.</p>
  `, { tag: "Email Verification" });
}

/* ── 3. Password reset ── */
export function passwordResetEmail(d: { username: string; resetUrl: string }): string {
  return wrap(`
    <p class="bt">Hey <strong>${d.username}</strong>,</p>
    <p class="bt">We received a request to reset your Seventy7 Kapital password. Click the button below to set a new one.</p>
    <div style="text-align:center"><a href="${d.resetUrl}" class="btn">Reset Password</a></div>
    <div class="alert-box">
      <p style="font-size:13px;color:#cccccc;margin:0">
        <strong style="color:#ff4d4d">This link expires in 1 hour.</strong>
        If you did not request a password reset, your account is safe — no action needed.
      </p>
    </div>
    <p class="note" style="text-align:center">For security, this link can only be used once.</p>
  `, { tag: "Password Reset Request" });
}

/* ── 4. Password changed ── */
export function passwordChangedEmail(d: { username: string }): string {
  const { appUrl } = cfg();
  return wrap(`
    <p class="bt">Hey <strong>${d.username}</strong>,</p>
    <div class="success-box">
      <p style="font-size:14px;color:#cccccc;margin:0">
        <strong style="color:#00C4F5">Your password has been changed successfully.</strong>
      </p>
    </div>
    <p class="bt">If you made this change, no further action is needed.</p>
    <p class="bt">If you did <strong>not</strong> change your password, contact us immediately at <strong>info@seventy7hub.com</strong> — your account may be compromised.</p>
    <div style="text-align:center"><a href="${appUrl}/login" class="btn">Go to Login</a></div>
  `, { tag: "Security Alert" });
}

/* ── 5. Trade opened — broadcast ── */
export function tradeOpenedEmail(d: {
  pair: string; direction: string; entry_price: string | null;
  entry_notes: string; plan_name: string; opened_at: string;
}): string {
  const { appUrl } = cfg();
  return wrap(`
    <p class="bt">Our trading team has opened a new position. Your capital is now actively working in the markets.</p>
    <div class="hbox">
      <div class="hl">Trade Details</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Market Pair</td>
            <td style="font-size:14px;color:#00AEEF;font-weight:700;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">${d.pair}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Direction</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">${d.direction.toUpperCase()}</td></tr>
        ${d.entry_price ? `<tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Entry Price</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">$${d.entry_price}</td></tr>` : ""}
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Plan</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">${d.plan_name}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0">Opened At</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0">${d.opened_at}</td></tr>
      </table>
    </div>
    ${d.entry_notes ? `<div class="callout"><p>${d.entry_notes}</p></div>` : ""}
    <p class="bt">We will notify you as soon as this trade is closed with the final outcome.</p>
    <div style="text-align:center"><a href="${appUrl}/signal" class="btn">View Live Trades</a></div>
  `, { tag: "New Trade Position Opened" });
}

/* ── 6. Trade closed — broadcast ── */
export function tradeClosedEmail(d: {
  pair: string; direction: string; pnl_percent: number;
  exit_notes: string; plan_name: string; closed_at: string;
}): string {
  const { appUrl } = cfg();
  const win = d.pnl_percent >= 0;
  const pnlColor = win ? "#00C4F5" : "#ff4d4d";
  const pnlLabel = `${win ? "+" : ""}${d.pnl_percent.toFixed(2)}%`;
  return wrap(`
    <p class="bt">The following position has been closed. The result will be reflected in your monthly ROI at your next payout cycle.</p>
    <div class="hbox">
      <div class="hl">Trade Result</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Market Pair</td>
            <td style="font-size:14px;color:#00AEEF;font-weight:700;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">${d.pair}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Direction</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">${d.direction.toUpperCase()}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Result</td>
            <td style="font-size:16px;color:${pnlColor};font-weight:900;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">${pnlLabel}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Plan</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">${d.plan_name}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0">Closed At</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0">${d.closed_at}</td></tr>
      </table>
    </div>
    ${d.exit_notes ? `<div class="callout"><p>${d.exit_notes}</p></div>` : ""}
    <div class="callout">
      <p>${win
        ? "Your monthly return for this cycle will be credited to your main balance on your next scheduled payout date."
        : "Markets move in cycles. Our team continues to manage your capital with <strong>discipline and structured risk control.</strong>"
      }</p>
    </div>
    <div style="text-align:center"><a href="${appUrl}/dashboard" class="btn">View Dashboard</a></div>
  `, { tag: win ? "Trade Closed — Profit ✅" : "Trade Closed — Loss 📉" });
}

/* ── 7. Monthly ROI payout ── */
export function monthlyPayoutEmail(d: {
  username: string; month_number: number; term_months: number;
  plan_name: string; principal: number; roi_percent: number;
  roi_amount: number; total_earned: number; months_remaining: number;
}): string {
  const { appUrl } = cfg();
  const f = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return wrap(`
    <p class="bt">Hey <strong>${d.username}</strong>,</p>
    <p class="bt">Your <em>Month ${d.month_number} of ${d.term_months}</em> return for the <strong>${d.plan_name}</strong> plan has been credited to your main balance and is available now.</p>
    <div class="hbox">
      <div class="hl">Payout Summary</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Principal Invested</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">$${f(d.principal)}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Monthly ROI Rate</td>
            <td style="font-size:14px;color:#00C4F5;font-weight:700;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">+${d.roi_percent.toFixed(2)}%</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Amount Credited</td>
            <td style="font-size:18px;color:#00AEEF;font-weight:900;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">$${f(d.roi_amount)}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Total Earned So Far</td>
            <td style="font-size:14px;color:#00C4F5;font-weight:700;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">$${f(d.total_earned)}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0">Months Remaining</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0">${d.months_remaining} of ${d.term_months}</td></tr>
      </table>
    </div>
    <div class="callout">
      <p>Your return is now in your main balance. You can <strong>withdraw</strong> it, <strong>reinvest</strong> it into a new plan, or leave it to accumulate until your investment term completes.</p>
    </div>
    <div style="text-align:center"><a href="${appUrl}/dashboard" class="btn">Go to Dashboard</a></div>
  `, { tag: `Month ${d.month_number} Return Credited 💰` });
}

/* ── 8. Investment complete — 12-month summary ── */
export function investmentCompleteEmail(d: {
  username: string; plan_name: string; principal: number;
  total_earned: number; months: Array<{ month: number; roi_percent: number; roi_amount: number }>;
  start_date: string; end_date: string;
}): string {
  const { appUrl } = cfg();
  const f = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalRoiPct = ((d.total_earned / d.principal) * 100).toFixed(2);

  const monthRows = d.months.map(m => `
    <tr>
      <td style="font-size:13px;color:#888888;padding:8px 0;border-bottom:1px solid #0d2333">Month ${m.month}</td>
      <td style="font-size:13px;color:#00C4F5;font-weight:600;text-align:center;padding:8px 0;border-bottom:1px solid #0d2333">+${m.roi_percent.toFixed(2)}%</td>
      <td style="font-size:13px;color:#00C4F5;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #0d2333">$${f(m.roi_amount)}</td>
    </tr>`).join("");

  return wrap(`
    <p class="bt">Hey <strong>${d.username}</strong>,</p>
    <p class="bt">Your 12-month investment with the <em>${d.plan_name}</em> plan has successfully completed. Your original capital and your final month's return have both been credited to your main balance.</p>
    <div class="hbox">
      <div class="hl">Final Summary</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Original Investment</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">$${f(d.principal)}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Total Returns Earned</td>
            <td style="font-size:18px;color:#00AEEF;font-weight:900;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">$${f(d.total_earned)}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Total ROI</td>
            <td style="font-size:16px;color:#00C4F5;font-weight:900;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">+${totalRoiPct}%</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0">Investment Period</td>
            <td style="font-size:13px;color:#ffffff;font-weight:500;text-align:right;padding:9px 0">${d.start_date} → ${d.end_date}</td></tr>
      </table>
    </div>
    <div class="hbox" style="margin-top:20px">
      <div class="hl">Month-by-Month Breakdown</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <thead>
          <tr>
            <th style="font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#555;padding:8px 0;text-align:left;border-bottom:1px solid #0d2333">Period</th>
            <th style="font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#555;padding:8px 0;text-align:center;border-bottom:1px solid #0d2333">ROI</th>
            <th style="font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#555;padding:8px 0;text-align:right;border-bottom:1px solid #0d2333">Credited</th>
          </tr>
        </thead>
        <tbody>${monthRows}</tbody>
      </table>
    </div>
    <div class="callout">
      <p>Thank you for trusting Seventy7 Kapital with your capital. Your full balance is now available. <strong>Consider reinvesting to continue building your wealth.</strong></p>
    </div>
    <div style="text-align:center"><a href="${appUrl}/invest" class="btn">Reinvest Now</a></div>
  `, { tag: "Investment Term Complete 🎉" });
}

/* ── 9. Withdrawal approved ── */
export function withdrawalApprovedEmail(d: {
  username: string; amount: number; network: string; address: string;
}): string {
  const f = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return wrap(`
    <p class="bt">Hey <strong>${d.username}</strong>,</p>
    <div class="success-box">
      <p style="font-size:14px;color:#cccccc;margin:0">
        <strong style="color:#00C4F5">Your withdrawal has been approved and is being processed.</strong>
      </p>
    </div>
    <div class="hbox">
      <div class="hl">Withdrawal Details</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Amount</td>
            <td style="font-size:18px;color:#00AEEF;font-weight:900;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">$${f(d.amount)}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0;border-bottom:1px solid #0d2333">Network</td>
            <td style="font-size:14px;color:#ffffff;font-weight:600;text-align:right;padding:9px 0;border-bottom:1px solid #0d2333">${d.network}</td></tr>
        <tr><td style="font-size:14px;color:#888888;padding:9px 0">Address</td>
            <td style="font-size:11px;color:#ffffff;font-weight:500;text-align:right;padding:9px 0;word-break:break-all;max-width:240px">${d.address}</td></tr>
      </table>
    </div>
    <p class="note" style="text-align:center">Processing times vary by network. Allow up to 24 hours. Contact us at info@seventy7hub.com if funds do not arrive.</p>
  `, { tag: "Withdrawal Approved ✅" });
}

/* ── 10. Withdrawal rejected ── */
export function withdrawalRejectedEmail(d: {
  username: string; amount: number; reason: string;
}): string {
  const { appUrl } = cfg();
  const f = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return wrap(`
    <p class="bt">Hey <strong>${d.username}</strong>,</p>
    <div class="alert-box">
      <p style="font-size:14px;color:#cccccc;margin:0">
        Your withdrawal request of <strong style="color:#ffffff">$${f(d.amount)}</strong> has been declined.
      </p>
    </div>
    <div class="hbox">
      <div class="hl">Reason</div>
      <p style="font-size:14px;color:#cccccc;margin:0">${d.reason || "Please contact support for details."}</p>
    </div>
    <p class="bt">The funds have been returned to your main balance. If you believe this is an error, contact us at <strong>info@seventy7hub.com</strong>.</p>
    <div style="text-align:center"><a href="${appUrl}/dashboard" class="btn">View Balance</a></div>
  `, { tag: "Withdrawal Declined" });
}

/* ── 11. Deposit confirmed ── */
export function depositConfirmedEmail(d: { username: string; amount: number }): string {
  const { appUrl } = cfg();
  const f = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return wrap(`
    <p class="bt">Hey <strong>${d.username}</strong>,</p>
    <div class="success-box">
      <p style="font-size:14px;color:#cccccc;margin:0">
        Your deposit of <strong style="color:#00C4F5">$${f(d.amount)}</strong> has been confirmed and credited to your main balance.
      </p>
    </div>
    <p class="bt">You can now invest, withdraw, or use your balance across the platform.</p>
    <div style="text-align:center"><a href="${appUrl}/invest" class="btn">Start Investing</a></div>
  `, { tag: "Deposit Confirmed ✅" });
}