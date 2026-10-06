import { motion } from "framer-motion";
import { useEffect } from "react";
import { TrendingUp, Wallet2, ArrowDownCircle, ArrowUpCircle, Activity, BarChart3, PieChart, Briefcase, FileText, Users, MessageCircle } from "lucide-react";

const metrics = [
  { label: "Balance",     value: "$68,420.00", icon: <Wallet2       size={14} style={{ color: "var(--cyan)"  }} /> },
  { label: "Deposits",    value: "$50,000.00", icon: <ArrowDownCircle size={14} style={{ color: "var(--green)" }} /> },
  { label: "Withdrawals", value: "$4,320.00",  icon: <ArrowUpCircle   size={14} style={{ color: "var(--red)"   }} /> },
  { label: "Growth",      value: "+12.7%",     icon: <TrendingUp    size={14} style={{ color: "var(--cyan)"  }} /> },
];

const barData = [40, 75, 60, 90, 50, 80];

const allocations = [
  { label: "Equity",      value: "52%" },
  { label: "Crypto",      value: "28%" },
  { label: "Real Estate", value: "12%" },
  { label: "Bonds",       value: "8%"  },
];

const whatYouGet = [
  { icon: <Briefcase size={18} />, text: "Dedicated performance tracking dashboard" },
  { icon: <Users     size={18} />, text: "Dedicated portfolio manager" },
  { icon: <FileText  size={18} />, text: "Access to a globally diversified investment portfolio" },
];

const navLinks: [string, string][] = [
  ["Dashboard", "/dashboard"],
  ["Staking", "/invest"],
  ["Portfolio Management", "/portfolio"],
];

const socialLinks: [string, string][] = [
  ["Telegram",    "https://t.me/seventy7hub"],
  ["Discord",     "https://discord.gg/seventy7hub"],
  ["X (Twitter)", "https://x.com/seventy7hub"],
  ["Instagram",   "https://www.instagram.com/seventy7trading"],
  ["Facebook",    "https://www.facebook.com/share/1AiekpPNc3/"],
  ["LinkedIn",    "https://www.linkedin.com/company/seventy7-trading-academy"],
];

function WhatsAppCTA() {
  return (
    <a
      href="https://wa.me/2348123456789?text=Hi%2C%20I%20want%20to%20request%20Portfolio%20Management%20advisor%20access."
      target="_blank"
      rel="noopener noreferrer"
      style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "rgba(14,203,129,0.06)", border: "1px solid rgba(14,203,129,0.25)", color: "var(--green)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.2s ease" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(14,203,129,0.12)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(14,203,129,0.06)")}
    >
      <MessageCircle size={13} />
      <span>Advisor Access</span>
    </a>
  );
}

export default function PortfolioPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", overflow: "hidden" }}>

      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(10,239,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16" style={{ position: "relative", zIndex: 1, paddingTop: 80, paddingBottom: 64 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="eyebrow" style={{ background: "rgba(10,239,255,0.06)", border: "1px solid rgba(10,239,255,0.15)", padding: "3px 12px", display: "inline-block", marginBottom: 20 }}>
                Portfolio Management
              </span>
              <h1 className="section-heading" style={{ marginBottom: 20 }}>
                Smarter <em>Portfolio Growth</em> with Confidence
              </h1>
              <p className="body-text" style={{ marginBottom: 32, maxWidth: 520 }}>
                A bespoke portfolio management service designed exclusively for high-income
                and high-net-worth individuals seeking long-term wealth creation through
                disciplined, globally diversified investing.
              </p>
              <a href="#performance" className="btn-primary" style={{ display: "inline-flex", gap: 8, padding: "12px 28px", fontSize: 11 }}>
                View Performance
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3 }}
              style={{ background: "var(--surface)", border: "1px solid rgba(10,239,255,0.14)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={16} style={{ color: "var(--cyan)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-2)" }}>Portfolio Dashboard</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="live-dot" />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted-2)" }}>Live</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {metrics.map((m, i) => (
                  <div key={i} style={{ background: "var(--bg)", border: "1px solid rgba(10,239,255,0.08)", padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span className="data-label">{m.label}</span>
                      {m.icon}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 300, color: "var(--text)" }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(10,239,255,0.2), transparent)", margin: "0 0 16px" }} />
              <div style={{ height: 80, background: "var(--bg)", position: "relative", overflow: "hidden" }}>
                <motion.svg viewBox="0 0 200 50" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <motion.path d="M0 40 C40 25, 80 35, 120 15 C160 0, 180 20, 200 5" stroke="var(--cyan)" strokeWidth="1.5" fill="none"
                    animate={{ pathLength: [0, 1], opacity: [0.4, 1] }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }} />
                </motion.svg>
              </div>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
                <span className="data-label">Balanced Growth Strategy</span>
                <span className="data-label">Updated 30d ago</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section id="performance" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="section-base section-py">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="eyebrow">Performance</span>
            <h2 className="section-heading" style={{ marginTop: 10 }}>Performance <em>Overview</em></h2>
            <p className="body-text" style={{ maxWidth: 560, margin: "12px auto 0" }}>
              Reserved for high-income and high-net-worth individuals who require professional oversight, structured execution, and risk-aware capital deployment.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: "rgba(10,239,255,0.06)" }}>
            <div style={{ background: "var(--surface)", padding: "28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BarChart3 size={14} style={{ color: "var(--cyan)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text)" }}>Monthly Returns</span>
                </div>
                <span className="data-label">Last 6 Months</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <div className="data-label">Highest Return</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: "var(--text)" }}>$12,450</div>
                </div>
                <div>
                  <div className="data-label">Lowest Return</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: "var(--text)" }}>$2,350</div>
                </div>
              </div>
              <div style={{ height: 120, background: "var(--bg)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 8px" }}>
                {barData.map((h, i) => (
                  <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} transition={{ delay: i * 0.08, duration: 0.5 }}
                    style={{ width: 12, background: "var(--cyan)", flexShrink: 0 }} />
                ))}
              </div>
            </div>
            <div style={{ background: "var(--surface)", padding: "28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PieChart size={14} style={{ color: "var(--cyan)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text)" }}>Asset Distribution</span>
                </div>
                <span className="data-label">Current Allocation</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {allocations.map((a, i) => (
                  <div key={i}>
                    <div className="data-label">{a.label}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: "var(--text)" }}>{a.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid rgba(10,239,255,0.12)", borderTop: "2px solid var(--cyan)" }} />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="section-py">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: "rgba(10,239,255,0.06)" }}>
            <div style={{ background: "var(--surface)", padding: "32px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <BarChart3 size={14} style={{ color: "var(--cyan)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text)" }}>How It Works</span>
              </div>
              <p className="body-text">
                Access begins with a private advisor consultation to assess objectives, risk tolerance, and suitability. Following advisor approval, capital is allocated and managed in line with the agreed investment strategy.
                The minimum portfolio management amount is{" "}
                <strong style={{ color: "var(--cyan)" }}>$25,000</strong>.
              </p>
            </div>
            <div style={{ background: "var(--surface)", padding: "32px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <PieChart size={14} style={{ color: "var(--cyan)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text)" }}>Target Performance</span>
              </div>
              <p className="body-text">
                Portfolios are constructed across global asset classes with disciplined allocation and continuous monitoring. The target annual performance range is{" "}
                <strong style={{ color: "var(--cyan)" }}>12-25% APR</strong>,
                subject to prevailing market conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-base section-py">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="eyebrow">Included</span>
            <h2 className="section-heading" style={{ marginTop: 10 }}>What <em>You Get</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 1, background: "rgba(10,239,255,0.06)" }}>
            {whatYouGet.map((item, i) => (
              <motion.div key={i} className="flush-cell card-pad"
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="icon-box" style={{ color: "var(--cyan)" }}>{item.icon}</div>
                <p className="body-text-sm">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py" style={{ borderTop: "1px solid rgba(10,239,255,0.08)" }}>
        <div className="max-w-5xl mx-auto px-6" style={{ textAlign: "center" }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 12 }}>Important Information</span>
          <h2 className="section-heading" style={{ marginBottom: 16 }}>Before you <em>invest</em></h2>
          <p className="body-text" style={{ maxWidth: 640, margin: "0 auto" }}>
            This service is provided strictly on an advisor-led basis and is subject to suitability assessment and applicable regulatory requirements. Past performance is not indicative of future results.
          </p>
        </div>
      </section>

      <WhatsAppCTA />

      <footer style={{ borderTop: "1px solid rgba(10,239,255,0.12)", background: "rgba(0,0,0,0.2)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6" style={{ padding: "48px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
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
