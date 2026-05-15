// client/src/admin/AdminSettings.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE } from "@/api/http";
import { Search, ChevronRight, CheckCircle2, XCircle, Mail, RefreshCw } from "lucide-react";

type EmailUser = {
  id: number; username: string; email: string;
  email_verified_at: string | null; role: string;
};
type SmtpSettings = {
  host: string; port: number; username: string; password: string;
  from_name: string; from_email: string; encryption: "tls" | "ssl";
};
type EmailTemplate = { id: number; name: string; subject: string; body: string; };

const EMPTY_SMTP: SmtpSettings = { host:"", port:587, username:"", password:"", from_name:"", from_email:"", encryption:"tls" };
const SYSTEM_TEMPLATES = ["verify_email", "reset_password"];

const inp = { width:"100%", background:"var(--bg)", border:"1px solid rgba(10,239,255,0.12)", padding:"10px 14px", color:"var(--text)", fontFamily:"var(--font-sans)", fontSize:13, fontWeight:300, outline:"none", borderRadius:0, boxSizing:"border-box" as const };
const lbl = { fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase" as const, color:"var(--muted-2)", display:"block", marginBottom:6 };

type Tab = "referral" | "payments" | "users" | "templates" | "smtp";

export default function AdminSettings() {
  const [tab, setTab] = useState<Tab>("referral");

  // Referral
  const [referralPercent, setReferralPercent] = useState(10);
  const [referralLoading, setReferralLoading] = useState(true);
  const [referralSaving,  setReferralSaving]  = useState(false);

  // Payments
  const [stripeSecret,      setStripeSecret]      = useState("");
  const [stripeWebhook,     setStripeWebhook]     = useState("");
  const [nowpaymentsApiKey, setNowpaymentsApiKey] = useState("");
  const [nowpaymentsIpn,    setNowpaymentsIpn]    = useState("");
  const [paymentSaving,     setPaymentSaving]     = useState(false);

  // Users
  const [emailUsers,   setEmailUsers]   = useState<EmailUser[]>([]);
  const [emailLoading, setEmailLoading] = useState(true);
  const [search,       setSearch]       = useState("");
  const [selectedUser, setSelectedUser] = useState<EmailUser | null>(null);

  // Templates
  const [templates,        setTemplates]        = useState<EmailTemplate[]>([]);
  const [activeTemplate,   setActiveTemplate]   = useState<EmailTemplate | null>(null);
  const [templateLoading,  setTemplateLoading]  = useState(true);
  const [templateSaving,   setTemplateSaving]   = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [newTemplateName,  setNewTemplateName]  = useState("");
  const [testEmailTo,      setTestEmailTo]      = useState("");
  const [testSending,      setTestSending]      = useState(false);

  // SMTP
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>(EMPTY_SMTP);
  const [smtpLoading,  setSmtpLoading]  = useState(true);
  const [smtpSaving,   setSmtpSaving]   = useState(false);

  const token   = localStorage.getItem("token");
  const headers = { Authorization:`Bearer ${token}`, "Content-Type":"application/json" };

  useEffect(() => {
    loadReferralSettings();
    loadPaymentSettings();
    loadEmailUsers();
    loadSmtpSettings();
    loadEmailTemplates();
  }, []);

  async function loadReferralSettings() {
    try {
      const r = await axios.get(`${API_BASE}/admin/referral-settings`, { headers });
      if (r.data?.success) setReferralPercent(Number(r.data.percent ?? 10));
    } catch {} finally { setReferralLoading(false); }
  }
  async function loadPaymentSettings() {
    try {
      const r = await axios.get(`${API_BASE}/admin/payment-settings`, { headers });
      const s = r.data?.settings || {};
      setStripeSecret(s.stripe_secret_key ?? "");
      setStripeWebhook(s.stripe_webhook_secret ?? "");
      setNowpaymentsIpn(s.nowpayments_ipn_secret ?? "");
      setNowpaymentsApiKey(s.nowpayments_api_key ?? "");
    } catch {}
  }
  async function loadEmailUsers() {
    try {
      const r = await axios.get(`${API_BASE}/admin/email/users`, { headers });
      setEmailUsers(Array.isArray(r.data?.users) ? r.data.users : []);
    } catch { toast.error("Failed to load users"); } finally { setEmailLoading(false); }
  }
  async function loadEmailTemplates() {
    try {
      const r = await axios.get(`${API_BASE}/admin/email/templates`, { headers });
      const list = Array.isArray(r.data?.templates) ? r.data.templates : [];
      setTemplates(list);
      if (list.length > 0) setActiveTemplate(list[0]);
    } catch { toast.error("Failed to load templates"); } finally { setTemplateLoading(false); }
  }
  async function loadSmtpSettings() {
    try {
      const r = await axios.get(`${API_BASE}/admin/email/smtp`, { headers });
      if (r.data?.success && r.data.settings) {
        const s = r.data.settings;
        setSmtpSettings({ host:s.host??"", port:Number(s.port??587), username:s.username??"", password:"", from_name:s.from_name??"", from_email:s.from_email??"", encryption:s.encryption==="ssl"?"ssl":"tls" });
      }
    } catch {} finally { setSmtpLoading(false); }
  }

  async function saveReferralPercent() {
    if (referralPercent < 0 || referralPercent > 100) return toast.error("Percentage must be 0-100");
    setReferralSaving(true);
    try { await axios.patch(`${API_BASE}/admin/referral-settings`, { percent:referralPercent }, { headers }); toast.success("Referral percentage updated"); }
    catch (e:any) { toast.error(e.response?.data?.error || "Failed"); } finally { setReferralSaving(false); }
  }
  async function savePaymentSettings() {
    setPaymentSaving(true);
    try { await axios.patch(`${API_BASE}/admin/payment-settings`, { stripe_secret_key:stripeSecret, stripe_webhook_secret:stripeWebhook, nowpayments_api_key:nowpaymentsApiKey, nowpayments_ipn_secret:nowpaymentsIpn }, { headers }); toast.success("Payment keys updated"); }
    catch (e:any) { toast.error(e.response?.data?.error || "Failed"); } finally { setPaymentSaving(false); }
  }
  async function saveEmailTemplate() {
    if (!activeTemplate) return;
    setTemplateSaving(true);
    try { await axios.put(`${API_BASE}/admin/email/templates/${activeTemplate.id}`, { subject:activeTemplate.subject, body:activeTemplate.body }, { headers }); toast.success("Template saved"); loadEmailTemplates(); }
    catch (e:any) { toast.error(e.response?.data?.error || "Failed"); } finally { setTemplateSaving(false); }
  }
  async function createEmailTemplate() {
    if (!newTemplateName.trim()) return toast.error("Name required");
    try { await axios.post(`${API_BASE}/admin/email/templates`, { name:newTemplateName.trim(), subject:"New Template", body:"<p>Hello {{username}}</p>" }, { headers }); toast.success("Template created"); setNewTemplateName(""); setCreatingTemplate(false); loadEmailTemplates(); }
    catch (e:any) { toast.error(e.response?.data?.error || "Failed"); }
  }
  async function deleteTemplate(id:number, name:string) {
    if (SYSTEM_TEMPLATES.includes(name)) return toast.error("System templates cannot be deleted");
    if (!confirm("Delete this template?")) return;
    try { await axios.delete(`${API_BASE}/admin/email/templates/${id}`, { headers }); toast.success("Deleted"); setActiveTemplate(null); loadEmailTemplates(); }
    catch (e:any) { toast.error(e.response?.data?.error || "Failed"); }
  }
  async function sendTestEmail() {
    if (!activeTemplate) return toast.error("No template selected");
    if (!testEmailTo.trim()) return toast.error("Enter recipient email");
    setTestSending(true);
    try { await axios.post(`${API_BASE}/admin/email/templates/test/${activeTemplate.id}`, { to:testEmailTo.trim() }, { headers }); toast.success("Test email sent"); setTestEmailTo(""); }
    catch (e:any) { toast.error(e.response?.data?.error || "Failed"); } finally { setTestSending(false); }
  }
  async function resendVerification(userId:number) {
    try { await axios.post(`${API_BASE}/admin/email/resend-verification/${userId}`, {}, { headers }); toast.success("Verification email resent"); }
    catch (e:any) { toast.error(e.response?.data?.error || "Failed"); }
  }
  async function revokeVerification(userId:number) {
    try { await axios.post(`${API_BASE}/admin/email/revoke-verification/${userId}`, {}, { headers }); toast.success("Verification revoked"); loadEmailUsers(); }
    catch (e:any) { toast.error(e.response?.data?.error || "Failed"); }
  }
  async function saveSmtpSettings() {
    setSmtpSaving(true);
    try { await axios.patch(`${API_BASE}/admin/email/smtp`, { ...smtpSettings, password:smtpSettings.password||undefined }, { headers }); toast.success("SMTP settings saved"); }
    catch (e:any) { toast.error(e.response?.data?.error || "Failed"); } finally { setSmtpSaving(false); }
  }

  const TABS: { key:Tab; label:string }[] = [
    { key:"referral",  label:"Referral"  },
    { key:"payments",  label:"Payments"  },
    { key:"users",     label:"Users"     },
    { key:"templates", label:"Templates" },
    { key:"smtp",      label:"SMTP"      },
  ];

  const filteredUsers = emailUsers.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:1 }}>

      {/* Header */}
      <div style={{ background:"var(--surface)", border:"1px solid rgba(10,239,255,0.08)", padding:"20px 24px" }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:300, color:"var(--text)" }}>Platform Settings</div>
      </div>

      {/* Tab strip */}
      <div style={{ display:"flex", gap:1, background:"rgba(10,239,255,0.06)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex:1, padding:"12px 8px", background: tab===t.key ? "var(--surface)" : "transparent", border:"none", borderBottom: tab===t.key ? "2px solid var(--cyan)" : "2px solid transparent", color: tab===t.key ? "var(--cyan)" : "var(--muted-2)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Referral ── */}
      {tab === "referral" && (
        <div style={{ background:"var(--surface)", border:"1px solid rgba(10,239,255,0.08)", padding:"28px 24px", maxWidth:480 }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:300, color:"var(--text)", marginBottom:24 }}>Referral Bonus</div>
          {referralLoading ? (
            <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted-2)" }}>Loading...</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={lbl}>Referral Percentage (%)</label>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <input type="number" min={0} max={100} value={referralPercent}
                    onChange={e => setReferralPercent(Number(e.target.value) || 0)}
                    style={{ ...inp, maxWidth:120, textAlign:"center", fontSize:18, fontFamily:"var(--font-display)", fontWeight:300 }} />
                  <span style={{ fontFamily:"var(--font-display)", fontSize:22, color:"var(--muted)" }}>%</span>
                </div>
              </div>
              <div style={{ padding:"14px 16px", background:"rgba(10,239,255,0.04)", border:"1px solid rgba(10,239,255,0.1)" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-2)", lineHeight:1.7 }}>
                  {`Every referred user generates ${referralPercent}% commission for the referrer on their first deposit.`}
                </div>
              </div>
              <button onClick={saveReferralPercent} disabled={referralSaving} className="btn-primary"
                style={{ alignSelf:"flex-start", cursor: referralSaving ? "not-allowed" : "pointer", opacity: referralSaving ? 0.6 : 1 }}>
                {referralSaving ? "Saving..." : "Save Referral Setting"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Payments ── */}
      {tab === "payments" && (
        <div style={{ background:"var(--surface)", border:"1px solid rgba(10,239,255,0.08)", padding:"28px 24px", maxWidth:600 }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:300, color:"var(--text)", marginBottom:24 }}>Payment Providers</div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ padding:"1px", background:"rgba(10,239,255,0.06)", marginBottom:8 }}>
              <div style={{ padding:"12px 16px", background:"var(--surface)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--cyan)" }}>Stripe</div>
            </div>
            <div>
              <label style={lbl}>Secret Key</label>
              <input type="password" style={inp} value={stripeSecret} onChange={e => setStripeSecret(e.target.value)} placeholder="sk_live_..." />
            </div>
            <div>
              <label style={lbl}>Webhook Secret</label>
              <input type="password" style={inp} value={stripeWebhook} onChange={e => setStripeWebhook(e.target.value)} placeholder="whsec_..." />
            </div>
            <div style={{ padding:"1px", background:"rgba(10,239,255,0.06)", margin:"8px 0" }}>
              <div style={{ padding:"12px 16px", background:"var(--surface)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--cyan)" }}>NOWPayments (optional)</div>
            </div>
            <div>
              <label style={lbl}>API Key</label>
              <input type="password" style={inp} value={nowpaymentsApiKey} onChange={e => setNowpaymentsApiKey(e.target.value)} placeholder="API key..." />
            </div>
            <div>
              <label style={lbl}>IPN Secret</label>
              <input type="password" style={inp} value={nowpaymentsIpn} onChange={e => setNowpaymentsIpn(e.target.value)} placeholder="IPN secret..." />
            </div>
            <button onClick={savePaymentSettings} disabled={paymentSaving} className="btn-primary"
              style={{ alignSelf:"flex-start", cursor: paymentSaving ? "not-allowed" : "pointer", opacity: paymentSaving ? 0.6 : 1 }}>
              {paymentSaving ? "Saving..." : "Save Payment Keys"}
            </button>
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {tab === "users" && (
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          {/* Search + count */}
          <div style={{ background:"var(--surface)", border:"1px solid rgba(10,239,255,0.08)", padding:"16px 24px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <div style={{ position:"relative", flex:1, minWidth:200 }}>
              <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--muted-2)" }} />
              <input style={{ ...inp, paddingLeft:36 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username or email..." />
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-2)", flexShrink:0 }}>
              {filteredUsers.length} / {emailUsers.length} users
            </div>
            <button onClick={loadEmailUsers} style={{ background:"none", border:"1px solid rgba(10,239,255,0.15)", color:"var(--cyan)", padding:"8px 14px", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {/* List + detail split */}
          <div style={{ display:"grid", gridTemplateColumns: selectedUser ? "1fr 1fr" : "1fr", gap:1, background:"rgba(10,239,255,0.06)", minHeight:400 }}>

            {/* User list */}
            <div style={{ background:"var(--surface)", overflow:"auto", maxHeight:600 }}>
              {emailLoading ? (
                <div style={{ padding:40, fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted-2)", textTransform:"uppercase" }}>Loading...</div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ padding:40, textAlign:"center", fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted-2)", textTransform:"uppercase" }}>No users found</div>
              ) : filteredUsers.map(u => (
                <div key={u.id} onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", borderBottom:"1px solid rgba(10,239,255,0.05)", cursor:"pointer", background: selectedUser?.id === u.id ? "rgba(10,239,255,0.04)" : "transparent", borderLeft: selectedUser?.id === u.id ? "2px solid var(--cyan)" : "2px solid transparent", transition:"all 0.15s" }}>
                  <div style={{ width:32, height:32, background:"rgba(10,239,255,0.08)", border:"1px solid rgba(10,239,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"var(--font-display)", fontSize:14, fontWeight:300, color:"var(--cyan)" }}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--text)", fontWeight:400, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.username}</div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted-2)", letterSpacing:"0.06em" }}>{u.email}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                    {u.email_verified_at
                      ? <CheckCircle2 size={13} style={{ color:"var(--green)" }} />
                      : <XCircle size={13} style={{ color:"var(--red)" }} />
                    }
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:"0.1em", textTransform:"uppercase", color: u.role === "admin" ? "var(--gold)" : "var(--muted-2)" }}>{u.role}</span>
                    <ChevronRight size={12} style={{ color:"var(--muted-2)" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* User detail panel */}
            {selectedUser && (
              <div style={{ background:"var(--surface)", padding:"28px 24px", display:"flex", flexDirection:"column", gap:20 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:300, color:"var(--text)" }}>{selectedUser.username}</div>
                  <button onClick={() => setSelectedUser(null)} style={{ background:"none", border:"none", color:"var(--muted-2)", cursor:"pointer", fontFamily:"var(--font-mono)", fontSize:16 }}>×</button>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ padding:"14px 16px", background:"var(--bg)", border:"1px solid rgba(10,239,255,0.08)" }}>
                    <label style={lbl}>Email</label>
                    <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--text)" }}>{selectedUser.email}</div>
                  </div>
                  <div style={{ padding:"14px 16px", background:"var(--bg)", border:"1px solid rgba(10,239,255,0.08)" }}>
                    <label style={lbl}>Role</label>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color: selectedUser.role === "admin" ? "var(--gold)" : "var(--text)", textTransform:"uppercase" }}>{selectedUser.role}</div>
                  </div>
                  <div style={{ padding:"14px 16px", background: selectedUser.email_verified_at ? "rgba(14,203,129,0.06)" : "rgba(246,70,93,0.06)", border:`1px solid ${selectedUser.email_verified_at ? "rgba(14,203,129,0.2)" : "rgba(246,70,93,0.2)"}` }}>
                    <label style={lbl}>Email Verification</label>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {selectedUser.email_verified_at
                        ? <><CheckCircle2 size={14} style={{ color:"var(--green)" }} /><span style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--green)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Verified</span></>
                        : <><XCircle size={14} style={{ color:"var(--red)" }} /><span style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--red)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Not Verified</span></>
                      }
                    </div>
                    {selectedUser.email_verified_at && (
                      <div style={{ fontFamily:"var(--font-mono)", fontSize:8, color:"var(--muted-2)", marginTop:6 }}>
                        {new Date(selectedUser.email_verified_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {!selectedUser.email_verified_at ? (
                    <button onClick={() => resendVerification(selectedUser.id)}
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 18px", background:"rgba(10,239,255,0.06)", border:"1px solid rgba(10,239,255,0.2)", color:"var(--cyan)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
                      <Mail size={12} /> Resend Verification Email
                    </button>
                  ) : (
                    <button onClick={() => revokeVerification(selectedUser.id)}
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 18px", background:"rgba(246,70,93,0.06)", border:"1px solid rgba(246,70,93,0.2)", color:"var(--red)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
                      <XCircle size={12} /> Revoke Verification
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Templates ── */}
      {tab === "templates" && (
        <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:1, background:"rgba(10,239,255,0.06)", minHeight:500 }}>
          {/* Sidebar */}
          <div style={{ background:"var(--surface)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(10,239,255,0.07)" }}>
              <button onClick={() => setCreatingTemplate(!creatingTemplate)} className="btn-primary" style={{ width:"100%", justifyContent:"center", fontSize:9, padding:"8px" }}>
                + New Template
              </button>
              {creatingTemplate && (
                <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                  <input style={{ ...inp, fontSize:11, padding:"8px 10px" }} value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="template_name" />
                  <button onClick={createEmailTemplate} className="btn-primary" style={{ justifyContent:"center", fontSize:9, padding:"8px" }}>Create</button>
                </div>
              )}
            </div>
            <div style={{ flex:1, overflow:"auto" }}>
              {templateLoading ? (
                <div style={{ padding:20, fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted-2)" }}>Loading...</div>
              ) : templates.map(t => (
                <button key={t.id} onClick={() => setActiveTemplate(t)}
                  style={{ width:"100%", textAlign:"left", padding:"12px 16px", background: activeTemplate?.id===t.id ? "rgba(10,239,255,0.06)" : "transparent", borderLeft: activeTemplate?.id===t.id ? "2px solid var(--cyan)" : "2px solid transparent", border:"none", borderBottom:"1px solid rgba(10,239,255,0.05)", color: activeTemplate?.id===t.id ? "var(--cyan)" : "var(--muted)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
                  {(t.name ?? "").replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          {activeTemplate ? (
            <div style={{ background:"var(--surface)", padding:"24px", display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:300, color:"var(--text)" }}>
                {(activeTemplate.name ?? "").replace(/_/g, " ")}
              </div>
              <div>
                <label style={lbl}>Subject</label>
                <input style={inp} value={activeTemplate.subject} onChange={e => setActiveTemplate({...activeTemplate, subject:e.target.value})} placeholder="Email subject..." />
              </div>
              <div>
                <label style={lbl}>Body (HTML)</label>
                <textarea rows={10} value={activeTemplate.body} onChange={e => setActiveTemplate({...activeTemplate, body:e.target.value})}
                  style={{ ...inp, resize:"vertical", minHeight:200, lineHeight:1.6, fontFamily:"var(--font-mono)", fontSize:12 }} />
              </div>
              <div style={{ padding:"12px 16px", background:"rgba(10,239,255,0.04)", border:"1px solid rgba(10,239,255,0.1)" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.08em", color:"var(--muted-2)", lineHeight:1.8 }}>
                  Variables: <code style={{ color:"var(--cyan)" }}>{"{{username}}"}</code>  <code style={{ color:"var(--cyan)" }}>{"{{verify_link}}"}</code>  <code style={{ color:"var(--cyan)" }}>{"{{site_name}}"}</code>
                </div>
              </div>
              <div style={{ borderTop:"1px solid rgba(10,239,255,0.07)", paddingTop:16 }}>
                <label style={lbl}>Preview</label>
                <iframe title="Email Preview" srcDoc={activeTemplate.body} sandbox="allow-scripts allow-same-origin"
                  style={{ width:"100%", height:300, background:"white", border:"1px solid rgba(10,239,255,0.1)" }} loading="lazy" />
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <input style={{ ...inp, maxWidth:240, fontSize:11 }} value={testEmailTo} onChange={e => setTestEmailTo(e.target.value)} placeholder="test@example.com" />
                <button onClick={sendTestEmail} disabled={testSending || !testEmailTo.trim()}
                  style={{ padding:"10px 18px", background:"rgba(10,239,255,0.06)", border:"1px solid rgba(10,239,255,0.2)", color:"var(--cyan)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor: testSending || !testEmailTo.trim() ? "not-allowed" : "pointer", opacity: testSending || !testEmailTo.trim() ? 0.6 : 1 }}>
                  {testSending ? "Sending..." : "Send Test"}
                </button>
                {!SYSTEM_TEMPLATES.includes(activeTemplate.name) && (
                  <button onClick={() => deleteTemplate(activeTemplate.id, activeTemplate.name)}
                    style={{ padding:"10px 18px", background:"rgba(246,70,93,0.06)", border:"1px solid rgba(246,70,93,0.2)", color:"var(--red)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
                    Delete
                  </button>
                )}
                <button onClick={saveEmailTemplate} disabled={templateSaving} className="btn-primary"
                  style={{ marginLeft:"auto", cursor: templateSaving ? "not-allowed" : "pointer", opacity: templateSaving ? 0.6 : 1 }}>
                  {templateSaving ? "Saving..." : "Save Template"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted-2)", textTransform:"uppercase" }}>
              Select a template to edit
            </div>
          )}
        </div>
      )}

      {/* ── SMTP ── */}
      {tab === "smtp" && (
        <div style={{ background:"var(--surface)", border:"1px solid rgba(10,239,255,0.08)", padding:"28px 24px", maxWidth:520 }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:300, color:"var(--text)", marginBottom:24 }}>SMTP Configuration</div>
          {smtpLoading ? (
            <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted-2)" }}>Loading...</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 120px", gap:12 }}>
                <div>
                  <label style={lbl}>Host</label>
                  <input style={inp} value={smtpSettings.host} onChange={e => setSmtpSettings({...smtpSettings, host:e.target.value})} placeholder="smtp.example.com" />
                </div>
                <div>
                  <label style={lbl}>Port</label>
                  <input type="number" style={inp} value={smtpSettings.port} onChange={e => setSmtpSettings({...smtpSettings, port:Number(e.target.value)||587})} placeholder="587" />
                </div>
              </div>
              <div>
                <label style={lbl}>Username</label>
                <input style={inp} value={smtpSettings.username} onChange={e => setSmtpSettings({...smtpSettings, username:e.target.value})} placeholder="smtp username" />
              </div>
              <div>
                <label style={lbl}>Password (leave blank to keep current)</label>
                <input type="password" style={inp} value={smtpSettings.password} onChange={e => setSmtpSettings({...smtpSettings, password:e.target.value})} placeholder="••••••••" />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={lbl}>From Name</label>
                  <input style={inp} value={smtpSettings.from_name} onChange={e => setSmtpSettings({...smtpSettings, from_name:e.target.value})} placeholder="Seventy7Hub" />
                </div>
                <div>
                  <label style={lbl}>From Email</label>
                  <input style={inp} value={smtpSettings.from_email} onChange={e => setSmtpSettings({...smtpSettings, from_email:e.target.value})} placeholder="no-reply@..." />
                </div>
              </div>
              <div>
                <label style={lbl}>Encryption</label>
                <div style={{ display:"flex", gap:1, background:"rgba(10,239,255,0.06)" }}>
                  {(["tls","ssl"] as const).map(enc => (
                    <button key={enc} onClick={() => setSmtpSettings({...smtpSettings, encryption:enc})}
                      style={{ flex:1, padding:"10px", background: smtpSettings.encryption===enc ? "rgba(10,239,255,0.1)" : "var(--surface)", border:"none", borderBottom: smtpSettings.encryption===enc ? "2px solid var(--cyan)" : "2px solid transparent", color: smtpSettings.encryption===enc ? "var(--cyan)" : "var(--muted-2)", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer" }}>
                      {enc.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={saveSmtpSettings} disabled={smtpSaving} className="btn-primary"
                style={{ alignSelf:"flex-start", cursor: smtpSaving ? "not-allowed" : "pointer", opacity: smtpSaving ? 0.6 : 1 }}>
                {smtpSaving ? "Saving..." : "Save SMTP Settings"}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
