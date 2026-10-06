// client/src/pages/AcademyMentorshipPage.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";

const academyLevels = [
  { title: "Beginner Level (4 Months)",      desc: "Foundations of financial literacy, market mechanics, and risk discipline." },
  { title: "Intermediate Level (4 Months)",  desc: "Applied analysis, strategy development, and controlled market exposure." },
  { title: "Professional Level (4 Months)",  desc: "Advanced execution, portfolio thinking, and independent decision-making." },
];

const internshipItems = [
  "Capital audit assessment to evaluate risk behaviour",
  "Risk engineering frameworks for downside control",
  "System development aligned with individual trading styles",
  "Dedicated facilitator providing feedback and accountability",
];

const standards = [
  { title: "Financial Education First",        desc: "We prioritize structured financial education covering trading, investing, and financial literacy. Our goal is to build understanding before capital deployment." },
  { title: "Quality Over Shortcuts",           desc: "We do not promote signals, guarantees, or speculative shortcuts. Participants are expected to develop real financial knowledge and decision-making skills." },
  { title: "Real Market Understanding",        desc: "Our programmes focus on real financial market principles, investment thinking, and risk awareness rather than theoretical simulations." },
  { title: "Discipline and Accountability",    desc: "Successful wealth building requires discipline, patience, and responsible financial behaviour. Participants are expected to maintain these standards." },
  { title: "Strategic Capital Participation",  desc: "Through solutions like Stake-to-Earn and structured investment opportunities, individuals can participate in financial markets responsibly." },
  { title: "Long-Term Wealth Building",        desc: "Our focus is not short-term speculation but developing the mindset and frameworks required for sustainable financial growth." },
];

const navLinks:    [string, string][] = [["Dashboard", "/dashboard"], ["Staking", "/invest"], ["Portfolio Management", "/portfolio"]];
const socialLinks: [string, string][] = [
  ["Telegram",    "https://t.me/seventy7hub"],
  ["Discord",     "https://discord.gg/seventy7hub"],
  ["X (Twitter)", "https://x.com/seventy7Kapital"],
  ["Instagram",   "https://www.instagram.com/seventy7trading"],
  ["Facebook",    "https://www.facebook.com/share/1AiekpPNc3/"],
  ["LinkedIn",    "https://www.linkedin.com/company/seventy7-trading-academy"],
];

export default function AcademyMentorshipPage() {
  const [activeTab, setActiveTab] = useState<"academy" | "internship">("academy");

  return (
    <main style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section style={{ position: "relative", padding: "120px 0 80px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(10,239,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="max-w-7xl mx-auto px-6" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="eyebrow" style={{ background: "rgba(10,239,255,0.06)", border: "1px solid rgba(10,239,255,0.15)", padding: "3px 12px", display: "inline-block", marginBottom: 20 }}>
              Education Before Profit
            </span>
            <h1 className="section-heading" style={{ fontSize: "clamp(36px, 5vw, 72px)", marginBottom: 20 }}>
              Seventy7 <em>Academy</em>
            </h1>
            <p className="body-text" style={{ maxWidth: 620, margin: "0 auto" }}>
              A structured financial literacy accelerator designed to develop independent traders and money managers,
              with a supervised internship pathway for real-world application.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── TABS ── */}
      <section className="max-w-7xl mx-auto px-6" style={{ position: "relative", zIndex: 20, marginBottom: 0 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 }}>
          {(["academy", "internship"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding:        "10px 28px",
                background:     activeTab === tab ? "linear-gradient(135deg, var(--cyan), var(--purple))" : "var(--surface)",
                border:         activeTab === tab ? "none" : "1px solid rgba(10,239,255,0.15)",
                color:          activeTab === tab ? "white" : "var(--s7-muted)",
                fontFamily:     "var(--font-mono)",
                fontSize:       10,
                letterSpacing:  "0.12em",
                textTransform:  "uppercase",
                cursor:         "pointer",
                transition:     "all 0.2s ease",
                borderRadius:   0,
              }}>
              {tab === "academy" ? "Seventy7 Academy" : "Internship Programme"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "academy" && (
            <motion.div key="academy"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ background: "var(--surface)", border: "1px solid rgba(10,239,255,0.14)", padding: "40px 36px", marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div className="icon-box" style={{ color: "var(--cyan)", marginBottom: 0 }}>
                  <GraduationCap size={18} />
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, color: "var(--text)", margin: 0 }}>
                  Seventy7 Academy (12 Months)
                </h2>
              </div>
              <p className="body-text" style={{ marginBottom: 24 }}>
                Seventy7 Academy is a structured one-year diploma programme designed to address a critical gap in modern
                education — practical financial literacy. Built on institutional frameworks and curated by professionals
                from industry and academia, the programme prioritizes education before profit and freedom through knowledge.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {academyLevels.map((level, i) => (
                  <div key={i} style={{ background: "var(--bg)", border: "1px solid rgba(10,239,255,0.08)", padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span className="eyebrow" style={{ flexShrink: 0, marginTop: 2, fontSize: 8 }}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400, color: "var(--text)", marginBottom: 4 }}>{level.title}</div>
                      <p className="body-text-sm" style={{ margin: 0 }}>{level.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="body-text-sm" style={{ marginBottom: 24 }}>
                Graduates of the Academy may progress into a supervised Internship Programme to apply what they have
                learned under professional guidance.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <a href="/register" className="btn-primary" style={{ display: "inline-flex", gap: 8, padding: "12px 28px", fontSize: 11 }}>
                  Apply for Academy <ArrowRight size={13} />
                </a>
                <span className="data-label">Enrollment subject to approval.</span>
              </div>
            </motion.div>
          )}

          {activeTab === "internship" && (
            <motion.div key="internship"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ background: "var(--surface)", border: "1px solid rgba(10,239,255,0.14)", padding: "40px 36px", marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div className="icon-box" style={{ color: "var(--cyan)", marginBottom: 0 }}>
                  <Briefcase size={18} />
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, color: "var(--text)", margin: 0 }}>
                  Internship Programme
                </h2>
              </div>
              <p className="body-text" style={{ marginBottom: 24 }}>
                The Internship Programme is a selective, experience-driven pathway designed for traders who want to
                refine execution through structured training and supervised market exposure.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {internshipItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg)", border: "1px solid rgba(10,239,255,0.08)" }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--cyan)", flexShrink: 0 }} />
                    <span className="body-text-sm" style={{ margin: 0 }}>{item}</span>
                  </div>
                ))}
              </div>
              <p className="body-text-sm" style={{ marginBottom: 24 }}>
                This programme is educational in nature and does not constitute employment, investment advice, or a
                guarantee of outcomes.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <a href="/register" className="btn-primary" style={{ display: "inline-flex", gap: 8, padding: "12px 28px", fontSize: 11 }}>
                  Apply for Internship <ArrowRight size={13} />
                </a>
                <span className="data-label">Admission subject to review and approval.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── STANDARDS ── */}
      <section className="section-base section-py">
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="eyebrow">Our principles</span>
            <h2 className="section-heading" style={{ marginTop: 10 }}>
              Programme <em>Standards</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, background: "rgba(10,239,255,0.06)" }}>
            {standards.map((s, i) => (
              <motion.div key={i} className="flush-cell card-pad"
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} viewport={{ once: true }}>
                <span className="card-num">{String(i + 1).padStart(2, "0")}</span>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 300, color: "var(--cyan)", marginBottom: 12 }}>{s.title}</div>
                <p className="body-text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(10,239,255,0.12)", background: "rgba(0,0,0,0.2)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6"
          style={{ padding: "48px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: "var(--text)", marginBottom: 8 }}>
              Seventy<span style={{ color: "var(--cyan)" }}>7</span>Hub
            </div>
            <p className="body-text-sm">Smarter staking, learning, and portfolio management all in one platform.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} className="footer-link">{label}</a>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {socialLinks.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="footer-social">{label}</a>
            ))}
          </div>
        </div>
        <div className="footer-copy" style={{ textAlign: "center", paddingBottom: 24 }}>
          {`© ${new Date().getFullYear()} Seventy7Hub. All rights reserved.`}
        </div>
      </footer>

    </main>
  );
}