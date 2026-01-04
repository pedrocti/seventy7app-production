// client/src/admin/AdminSettings.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_BASE } from "@/api/http";

// ----------------------A
// Types
// ----------------------
type EmailUser = {
  id: number;
  username: string;
  email: string;
  email_verified_at: string | null;
  role: string;
};

type SmtpSettings = {
  host: string;
  port: number;
  username: string;
  password: string;
  from_name: string;
  from_email: string;
  encryption: "tls" | "ssl";
};

const EMPTY_SMTP: SmtpSettings = {
  host: "",
  port: 587,
  username: "",
  password: "",
  from_name: "",
  from_email: "",
  encryption: "tls",
};

type EmailTemplate = {
  id: number;
  name: string;
  subject: string;
  body: string;
};

// ----------------------
// Component
// ----------------------
export default function AdminSettings() {
  // Referral
  const [referralPercent, setReferralPercent] = useState<number>(10);
  const [referralLoading, setReferralLoading] = useState(true);
  const [referralSaving, setReferralSaving] = useState(false);

  // Payments
  const [stripeSecret, setStripeSecret] = useState("");
  const [stripeWebhook, setStripeWebhook] = useState("");
  const [nowpaymentsIpn, setNowpaymentsIpn] = useState("");
  const [nowpaymentsApiKey, setNowpaymentsApiKey] = useState("");
  const [paymentSaving, setPaymentSaving] = useState(false);
  

  // Email
  const [emailTab, setEmailTab] = useState<"users" | "templates" | "smtp">("users");
  const [emailUsers, setEmailUsers] = useState<EmailUser[]>([]);
  const [emailLoading, setEmailLoading] = useState(true);

  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>(EMPTY_SMTP);
  const [smtpLoading, setSmtpLoading] = useState(true);
  const [smtpSaving, setSmtpSaving] = useState(false);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateSaving, setTemplateSaving] = useState(false);

  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testSending, setTestSending] = useState(false);

  const SYSTEM_TEMPLATES = ["verify_email", "reset_password"];

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ===============================
  // Loaders
  // ===============================
  const loadReferralSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/referral-settings`, { headers });
      if (res.data?.success) setReferralPercent(Number(res.data.percent ?? 10));
    } catch (err) {
      console.error("Load referral settings error:", err);
    } finally {
      setReferralLoading(false);
    }
  };

  const loadPaymentSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/payment-settings`, { headers });
      const s = res.data?.settings || {};
      setStripeSecret(s.stripe_secret_key ?? "");
      setStripeWebhook(s.stripe_webhook_secret ?? "");
      setNowpaymentsIpn(s.nowpayments_ipn_secret ?? "");
      setNowpaymentsApiKey(s.nowpayments_api_key ?? "");
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.info("Payment settings endpoint not implemented yet (404)");
      } else {
        console.error("Load payment settings error:", err);
      }
    }
  };

  const loadEmailTemplates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/email/templates`, { headers });
      const list = Array.isArray(res.data?.templates) ? res.data.templates : [];
      setTemplates(list);
      if (list.length > 0 && !activeTemplate) setActiveTemplate(list[0]);
    } catch (err) {
      toast.error("Failed to load email templates");
    } finally {
      setTemplateLoading(false);
    }
  };

  const loadEmailUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/email/users`, { headers });
      setEmailUsers(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch (err) {
      toast.error("Failed to load email users");
    } finally {
      setEmailLoading(false);
    }
  };

  const loadSmtpSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/email/smtp`, { headers });
      if (res.data?.success && res.data.settings) {
        setSmtpSettings({
          host: res.data.settings.host ?? "",
          port: Number(res.data.settings.port ?? 587),
          username: res.data.settings.username ?? "",
          password: "",
          from_name: res.data.settings.from_name ?? "",
          from_email: res.data.settings.from_email ?? "",
          encryption: res.data.settings.encryption === "ssl" ? "ssl" : "tls",
        });
      }
    } catch (err) {
      console.error("Load SMTP settings error:", err);
    } finally {
      setSmtpLoading(false);
    }
  };

  const saveSmtpSettings = async () => {
    setSmtpSaving(true);
    try {
      await axios.patch(
        `${API_BASE}/admin/email/smtp`,
        { ...smtpSettings, password: smtpSettings.password || undefined },
        { headers }
      );
      toast.success("SMTP settings saved");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save SMTP settings");
    } finally {
      setSmtpSaving(false);
    }
  };

  useEffect(() => {
    loadReferralSettings();
    loadPaymentSettings();
    loadEmailUsers();
    loadSmtpSettings();
    loadEmailTemplates();
  }, []);

  useEffect(() => {
    if (!activeTemplate && templates.length > 0) {
      setActiveTemplate(templates[0]);
    }
  }, [templates]);

  // ===============================
  // Actions (unchanged from original)
  // ===============================
  const saveReferralPercent = async () => {
    if (referralPercent < 0 || referralPercent > 100) return toast.error("Percentage must be 0-100");
    setReferralSaving(true);
    try {
      await axios.patch(`${API_BASE}/admin/referral-settings`, { percent: referralPercent }, { headers });
      toast.success("Referral percentage updated");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save referral settings");
    } finally {
      setReferralSaving(false);
    }
  };

  const savePaymentSettings = async () => {
    setPaymentSaving(true);
    try {
      await axios.patch(
        `${API_BASE}/admin/payment-settings`,
        {
          stripe_secret_key: stripeSecret,
          stripe_webhook_secret: stripeWebhook,
          nowpayments_api_key: nowpaymentsApiKey,
          nowpayments_ipn_secret: nowpaymentsIpn,
        },
        { headers }
      );
      toast.success("Payment provider keys updated");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save payment settings");
    } finally {
      setPaymentSaving(false);
    }
  };

  const saveEmailTemplate = async () => {
    if (!activeTemplate) return;
    setTemplateSaving(true);
    try {
      await axios.put(
        `${API_BASE}/admin/email/templates/${activeTemplate.id}`,
        { subject: activeTemplate.subject, body: activeTemplate.body },
        { headers }
      );
      toast.success("Email template updated");
      loadEmailTemplates();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save template");
    } finally {
      setTemplateSaving(false);
    }
  };

  const createEmailTemplate = async () => {
    if (!newTemplateName.trim()) return toast.error("Template name required");
    try {
      await axios.post(
        `${API_BASE}/admin/email/templates`,
        { name: newTemplateName.trim(), subject: "New Template", body: "<p>Hello {{username}}</p>" },
        { headers }
      );
      toast.success("Template created");
      setNewTemplateName("");
      setCreatingTemplate(false);
      loadEmailTemplates();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create template");
    }
  };

  const deleteTemplate = async (id: number, name: string) => {
    if (SYSTEM_TEMPLATES.includes(name)) return toast.error("System templates cannot be deleted");
    if (!confirm("Delete this template?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/email/templates/${id}`, { headers });
      toast.success("Template deleted");
      setActiveTemplate(null);
      loadEmailTemplates();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

const sendTestEmail = async () => {
  if (!activeTemplate) return toast.error("No template selected");
  if (!testEmailTo.trim()) return toast.error("Please enter a recipient email");

  setTestSending(true);

  try {
    const fullUrl = `${API_BASE}/admin/email/templates/test/${activeTemplate.id}`;
    console.log("Attempting POST to:", fullUrl);  // debug

    await axios.post(
      fullUrl,
      {
        to: testEmailTo.trim(),
        // Optional: send custom variables to override defaults
        // variables: {
        //   verify_link: "https://seventy7hub.com/verify?token=real-test-token",
        //   username: "Test User",
        //   site_name: "77kapital",
        // }
      },
      { headers }
    );

    toast.success("Test email sent successfully");
    setTestEmailTo("");
  } catch (err: any) {
    console.error("Send test failed:", err);
    toast.error(err.response?.data?.error || "Failed to send test email");
  } finally {
    setTestSending(false);
  }
};

  const resendVerification = async (userId: number) => {
    try {
      await axios.post(`${API_BASE}/admin/email/resend-verification/${userId}`, {}, { headers });
      toast.success("Verification email resent");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to resend email");
    }
  };

  const revokeVerification = async (userId: number) => {
    try {
      await axios.post(`${API_BASE}/admin/email/revoke-verification/${userId}`, {}, { headers });
      toast.success("Email verification revoked");
      loadEmailUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to revoke verification");
    }
  };

  // ===============================
  // Render
  // ===============================
  return (
    <div className="p-8 text-white space-y-10">
      <h1 className="text-3xl font-bold">Platform Settings</h1>

      {/* Referral */}
      <section className="bg-[#1E293B] p-6 rounded-xl border border-[#334155] max-w-3xl">
        <h2 className="text-xl font-semibold mb-4 text-[#0AEFFF]">Referral Bonus</h2>
        {referralLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={0}
              max={100}
              value={referralPercent}
              onChange={(e) => setReferralPercent(Number(e.target.value) || 0)}
              className="w-24 bg-[#0F172A] border-[#334155] text-center font-bold text-white"
            />
            <span className="text-xl">%</span>
            <Button
              onClick={saveReferralPercent}
              disabled={referralSaving}
              className="bg-[#7E22CE] hover:bg-purple-600 text-white font-medium"
            >
              {referralSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </section>

      {/* Payments */}
      <section className="bg-[#1E293B] p-6 rounded-xl border border-[#334155] max-w-3xl">
        <h2 className="text-xl font-semibold mb-4 text-[#0AEFFF]">Payment Providers</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input placeholder="Stripe Secret Key" value={stripeSecret} onChange={(e) => setStripeSecret(e.target.value)} className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-400" />
          <Input placeholder="Stripe Webhook Secret" value={stripeWebhook} onChange={(e) => setStripeWebhook(e.target.value)} className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-400" />
          <Input placeholder="NOWPayments API Key (optional)" value={nowpaymentsApiKey} onChange={(e) => setNowpaymentsApiKey(e.target.value)} className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-400" />
          <Input placeholder="NOWPayments IPN Secret" value={nowpaymentsIpn} onChange={(e) => setNowpaymentsIpn(e.target.value)} className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-400" />
        </div>
        <Button onClick={savePaymentSettings} disabled={paymentSaving} className="mt-4 bg-[#7E22CE] hover:bg-purple-600 text-white font-medium">
          {paymentSaving ? "Saving..." : "Save Payment Keys"}
        </Button>
      </section>

      {/* Email Management */}
      <section className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
        <h2 className="text-2xl font-semibold mb-6 text-[#0AEFFF]">Email Management</h2>

        <div className="flex gap-4 mb-8 flex-wrap">
          {(["users", "templates", "smtp"] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setEmailTab(tab)}
              className={
                emailTab === tab
                  ? "bg-[#7E22CE] hover:bg-purple-600 text-white"
                  : "bg-transparent border border-[#334155] text-gray-300 hover:bg-[#0F172A]"
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Users */}
        {emailTab === "users" && (
          <div className="space-y-3">
            {emailLoading ? (
              <p className="text-gray-400">Loading users...</p>
            ) : emailUsers.length === 0 ? (
              <p className="text-gray-400">No users found.</p>
            ) : (
              emailUsers.map((u) => (
                <div key={u.id} className="flex justify-between items-center bg-[#0F172A] p-4 rounded-lg border border-[#334155]">
                  <div>
                    <div className="font-semibold text-white">{u.username}</div>
                    <div className="text-sm text-gray-400">{u.email}</div>
                  </div>
                  <div className="flex gap-2">
                    {!u.email_verified_at ? (
                      <Button size="sm" onClick={() => resendVerification(u.id)} className="bg-[#0AEFFF] text-black hover:bg-cyan-400 font-medium">
                        Resend
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => revokeVerification(u.id)} className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10">
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Templates */}
        {emailTab === "templates" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <Button size="sm" onClick={() => setCreatingTemplate(!creatingTemplate)} className="w-full bg-[#0AEFFF] text-black hover:bg-cyan-400 font-medium">
                + New Template
              </Button>

              {creatingTemplate && (
                <div className="bg-[#0F172A] p-4 rounded-lg border border-[#334155] space-y-3">
                  <Input
                    placeholder="template_name (snake_case)"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="bg-[#0F172A] border-[#334155] text-white"
                  />
                  <Button size="sm" onClick={createEmailTemplate} className="w-full bg-[#7E22CE] hover:bg-purple-600 text-white">
                    Create
                  </Button>
                </div>
              )}

              <div className="space-y-2 mt-4">
                {templateLoading ? (
                  <p className="text-gray-400 text-sm">Loading...</p>
                ) : (
                  templates.map((t) => (
                    <Button
                      key={t.id}
                      onClick={() => setActiveTemplate(t)}
                      className={
                        activeTemplate?.id === t.id
                          ? "w-full justify-start bg-[#7E22CE] hover:bg-purple-600 text-white"
                          : "w-full justify-start bg-[#0F172A] border border-[#334155] text-gray-300 hover:bg-[#1E293B]"
                      }
                    >
                      {(t.name ?? "").replace(/_/g, " ").toUpperCase().trim()}
                    </Button>
                  ))
                )}
              </div>
            </div>

            {activeTemplate && (
              <div className="lg:col-span-3 space-y-6">
                <Input
                  value={activeTemplate.subject}
                  onChange={(e) => setActiveTemplate({ ...activeTemplate, subject: e.target.value })}
                  placeholder="Email Subject"
                  className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-400"
                />

                <textarea
                  rows={12}
                  value={activeTemplate.body}
                  onChange={(e) => setActiveTemplate({ ...activeTemplate, body: e.target.value })}
                  placeholder="Email body (HTML supported)"
                  className="w-full rounded-lg bg-[#0F172A] border border-[#334155] p-4 text-white placeholder:text-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none font-mono text-sm leading-relaxed"
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-xs text-gray-400">
                    Available variables:{" "}
                    <code className="mx-1 bg-[#334155] px-2 py-1 rounded text-cyan-300 font-medium">{"{{username}}"}</code>
                    <code className="mx-1 bg-[#334155] px-2 py-1 rounded text-cyan-300 font-medium">{"{{verify_link}}"}</code>
                    <code className="mx-1 bg-[#334155] px-2 py-1 rounded text-cyan-300 font-medium">{"{{site_name}}"}</code>
                  </p>

                  <div className="flex gap-2">
                    {!SYSTEM_TEMPLATES.includes(activeTemplate.name) && (
                      <Button size="sm" variant="destructive" onClick={() => deleteTemplate(activeTemplate.id, activeTemplate.name)}>
                        Delete
                      </Button>
                    )}
                    <Button
                      onClick={saveEmailTemplate}
                      disabled={templateSaving}
                      className="bg-[#7E22CE] hover:bg-purple-600 text-white font-medium"
                    >
                      {templateSaving ? "Saving..." : "Save Template"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-[#334155] rounded-lg overflow-hidden">
                    <div className="bg-[#020617] px-4 py-2 text-sm text-gray-300 font-medium">Preview</div>
                    <iframe
                      title="Email Preview"
                      srcDoc={activeTemplate.body}
                      sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
                      className="w-full h-96 bg-white rounded-b-lg"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Input
                      placeholder="test@example.com"
                      value={testEmailTo}
                      onChange={(e) => setTestEmailTo(e.target.value)}
                      className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-400"
                    />
                    <Button
                      onClick={sendTestEmail}
                      disabled={testSending || !testEmailTo.trim()}
                      className="bg-[#7E22CE] hover:bg-purple-600 text-white font-medium"
                    >
                      {testSending ? "Sending..." : "Send Test Email"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SMTP */}
        {emailTab === "smtp" && (
          <div className="max-w-md space-y-4">
            {smtpLoading ? (
              <p className="text-gray-400">Loading SMTP settings...</p>
            ) : (
              <>
                <Input value={smtpSettings.host} onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })} placeholder="Host" className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-500" />
                <Input type="number" value={smtpSettings.port} onChange={(e) => setSmtpSettings({ ...smtpSettings, port: Number(e.target.value) || 587 })} placeholder="Port" className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-500" />
                <Input value={smtpSettings.username} onChange={(e) => setSmtpSettings({ ...smtpSettings, username: e.target.value })} placeholder="Username" className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-500" />
                <Input type="password" value={smtpSettings.password} onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })} placeholder="Password (leave blank to keep current)" className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-500" />
                <Input value={smtpSettings.from_name} onChange={(e) => setSmtpSettings({ ...smtpSettings, from_name: e.target.value })} placeholder="From Name" className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-500" />
                <Input value={smtpSettings.from_email} onChange={(e) => setSmtpSettings({ ...smtpSettings, from_email: e.target.value })} placeholder="From Email" className="bg-[#0F172A] border-[#334155] text-white placeholder:text-gray-500" />

                <div className="flex gap-3">
                  <Button
                    variant={smtpSettings.encryption === "tls" ? "default" : "outline"}
                    onClick={() => setSmtpSettings({ ...smtpSettings, encryption: "tls" })}
                    className={smtpSettings.encryption === "tls" ? "bg-[#7E22CE] hover:bg-purple-600 text-white" : "text-gray-300 border-[#334155] hover:bg-[#0F172A]"}
                  >
                    TLS
                  </Button>
                  <Button
                    variant={smtpSettings.encryption === "ssl" ? "default" : "outline"}
                    onClick={() => setSmtpSettings({ ...smtpSettings, encryption: "ssl" })}
                    className={smtpSettings.encryption === "ssl" ? "bg-[#7E22CE] hover:bg-purple-600 text-white" : "text-gray-300 border-[#334155] hover:bg-[#0F172A]"}
                  >
                    SSL
                  </Button>
                </div>

                <Button onClick={saveSmtpSettings} disabled={smtpSaving} className="w-full bg-[#7E22CE] hover:bg-purple-600 text-white font-medium">
                  {smtpSaving ? "Saving..." : "Save SMTP Settings"}
                </Button>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}