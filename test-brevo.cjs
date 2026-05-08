// test-brevo.js
// Run: node test-brevo.js
// Tests Brevo connection by sending a test email to yourself.
// Delete this file after confirming it works.

require("dotenv").config();

const BREVO_URL   = "https://api.brevo.com/v3/smtp/email";
const API_KEY     = process.env.BREVO_API_KEY;
const FROM_EMAIL  = process.env.BREVO_SENDER_EMAIL || "info@seventy7hub.com";
const FROM_NAME   = process.env.BREVO_SENDER_NAME  || "Seventy7 Kapital";

// ── Change this to your own email to receive the test ──
const TEST_RECIPIENT_EMAIL = "inboxisong@gmail.com";
const TEST_RECIPIENT_NAME  = "Test User";

async function testBrevo() {
  if (!API_KEY || API_KEY === "your_brevo_api_key_here") {
    console.error("❌ BREVO_API_KEY is not set in .env");
    process.exit(1);
  }

  console.log("📤 Sending test email via Brevo...");
  console.log("   From:", `${FROM_NAME} <${FROM_EMAIL}>`);
  console.log("   To:  ", TEST_RECIPIENT_EMAIL);

  const payload = {
    sender:      { email: FROM_EMAIL, name: FROM_NAME },
    to:          [{ email: TEST_RECIPIENT_EMAIL, name: TEST_RECIPIENT_NAME }],
    subject:     "✅ Brevo Test — Seventy7 Kapital",
    htmlContent: `
      <div style="background:#0B1120;padding:40px;font-family:Arial,sans-serif">
        <div style="max-width:500px;margin:0 auto;background:#0F172A;border:1px solid rgba(242,178,58,0.2);padding:32px">
          <h2 style="color:#F2B23A;font-size:20px;margin-bottom:16px">Brevo is connected ✅</h2>
          <p style="color:rgba(232,237,245,0.7);font-size:14px;line-height:1.8">
            This test email confirms that Brevo is correctly configured for
            <strong style="color:#F0EDE6">Seventy7 Kapital</strong>.
          </p>
          <p style="color:rgba(232,237,245,0.7);font-size:14px;line-height:1.8;margin-top:12px">
            Sender: <strong style="color:#F2B23A">${FROM_EMAIL}</strong><br/>
            API Key: ${API_KEY.substring(0, 8)}...
          </p>
          <p style="color:rgba(232,237,245,0.4);font-size:12px;margin-top:24px">
            You can delete test-brevo.js after confirming this works.
          </p>
        </div>
      </div>`,
  };

  try {
    const res = await fetch(BREVO_URL, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key":      API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("✅ Email sent successfully!");
      console.log("   Message ID:", data.messageId);
      console.log("\n🎉 Brevo is working. Check", TEST_RECIPIENT_EMAIL, "for the test email.");
    } else {
      const err = await res.text();
      console.error("❌ Brevo API error:", res.status, err);
      console.log("\n💡 Common fixes:");
      console.log("   - Check BREVO_API_KEY in .env");
      console.log("   - Verify sender email", FROM_EMAIL, "in Brevo dashboard");
      console.log("   - Go to: https://app.brevo.com/senders");
    }
  } catch (err) {
    console.error("❌ Network error:", err.message);
  }
}

testBrevo();