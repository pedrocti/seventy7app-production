// client/src/pages/InvestPage.tsx
import { motion } from "framer-motion";
import { Shield, Users, TrendingUp, Calendar, Lock, ArrowRight, CheckCircle } from "lucide-react";

const plans = [
  {
    plan:     "Starter Pool",
    min:      "$500",
    max:      "$5,000",
    roiLow:   2,
    roiHigh:  5,
    features: [
      "Low entry participation",
      "Long-term capital cycle",
      "Monthly Returns and performance updates ",
    ],
    highlight: false,
  },
  {
    plan:     "Growth Pool",
    min:      "$5,000",
    max:      "$15,000",
    roiLow:   5,
    roiHigh:  10,
    features: [
      "Long-term capital allocation",
      "Enhanced performance participation",
      "Monthly Returns and performance updates ",
    ],
    highlight: true,
  },
  {
    plan:     "Strategic Pool",
    min:      "$15,000",
    max:      "$25,000",
    roiLow:   10,
    roiHigh:  15,
    features: [
      "Long-term capital allocation",
      "Extended strategic trading cycles",
      "Broader market opportunity exposure",
    ],
    highlight: false,
  },
];

function projections(min: number, max: number, roiLow: number, roiHigh: number) {
  const monthlyLow  = (min  * roiLow  / 100).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const monthlyHigh = (max  * roiHigh / 100).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const annualLow   = (min  * roiLow  / 100 * 12).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const annualHigh  = (max  * roiHigh / 100 * 12).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return { monthlyLow, monthlyHigh, annualLow, annualHigh };
}

const steps = [
  { step: "01", title: "Stake Capital",        desc: "Allocate capital into the pool based on your selected plan." },
  { step: "02", title: "Active Trading",        desc: "Pooled capital is actively traded by experienced professionals using structured strategies." },
  { step: "03", title: "Performance Tracking",  desc: "Monitor activity through dashboards, live trade insights, and market analysis." },
  { step: "04", title: "Profit Distribution",   desc: "Profits are distributed proportionally based on staked amounts and performance." },
];

const benefits = [
  { icon: <TrendingUp size={22} />, title: "Performance-Driven Strategy",  desc: "Client stakes are pooled and actively traded using structured, data-driven systems supported by advanced technology and AI-assisted tools." },
  { icon: <Calendar   size={22} />, title: "Professional Management",       desc: "Capital is managed by experienced professionals within defined trading frameworks, with outcomes determined by market performance." },
  { icon: <Shield     size={22} />, title: "Transparent Monitoring",        desc: "Participants maintain visibility through a performance dashboard, live trade tracking, and ongoing market analysis." },
];

const trust = [
  { icon: <Lock   size={22} />, title: "Structured Risk Framework", desc: "Trading activities operate within defined parameters. Capital is exposed to market risk and returns are not guaranteed." },
  { icon: <Users  size={22} />, title: "Experienced Operators",     desc: "Strategies are executed by professionals using disciplined processes and institutional-grade tools." },
  { icon: <Shield size={22} />, title: "Clear Reporting",           desc: "Participants receive transparent insights into performance metrics, trade activity, and portfolio status." },
];

export default function InvestPage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section style={{ position: "relative", padding: "120px 0 80px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(10,239,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24 }}>

            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="eyebrow" style={{ background: "rgba(10,239,255,0.06)", border: "1px solid rgba(10,239,255,0.15)", padding: "3px 12px", display: "inline-block", marginBottom: 20 }}>
                Stake-to-Earn Programme
              </span>
              <h1 className="section-heading" style={{ fontSize: "clamp(38px, 5vw, 72px)", marginBottom: 20 }}>
                Grow wealth<br />
                <em style={{ fontStyle: "italic", background: "linear-gradient(135deg, var(--cyan), var(--purple))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  the professional way.
                </em>
              </h1>
            </motion.div>

            <motion.p className="body-text" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              style={{ maxWidth: 620, fontSize: 15, lineHeight: 1.85 }}>
              A performance-driven growth product designed for busy professionals, business owners,
              entrepreneurs, and creatives seeking capital exposure without the demands of active trading.
              Your capital is professionally managed while you stay focused on what matters most.
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", alignItems: "center" }}>
              <a href="/register" className="btn-primary" style={{ padding: "14px 36px", fontSize: 12 }}>
                Register to Participate <ArrowRight size={14} />
              </a>
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div className="eyebrow" style={{ fontSize: 9 }}>Minimum Stake</div>
                  <div className="section-heading" style={{ fontSize: 22, color: "var(--cyan)" }}>$500</div>
                </div>
                <div style={{ width: 1, background: "rgba(10,239,255,0.15)", alignSelf: "stretch" }} />
                <div style={{ textAlign: "center" }}>
                  <div className="eyebrow" style={{ fontSize: 9 }}>Monthly ROI</div>
                  <div className="section-heading" style={{ fontSize: 22, color: "var(--cyan)" }}>2–15%</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="section-base section-py">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="eyebrow">What it offers</span>
            <h2 className="section-heading" style={{ marginTop: 10 }}>
              What <em>Stake-to-Earn</em> delivers
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: "rgba(10,239,255,0.06)" }}>
            {benefits.map((b, i) => (
              <motion.div key={i} className="flush-cell card-pad"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="icon-box" style={{ color: "var(--cyan)", marginBottom: 20 }}>{b.icon}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: "var(--text)", marginBottom: 12 }}>{b.title}</div>
                <p className="body-text-sm">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="section-py">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="eyebrow">Participation pools</span>
            <h2 className="section-heading" style={{ marginTop: 10 }}>Choose your pool</h2>
            <p className="body-text" style={{ maxWidth: 560, margin: "12px auto 0" }}>
              Performance outcomes are determined by market conditions and trading results within each cycle.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: "rgba(10,239,255,0.06)" }}>
            {plans.map((plan, i) => {
              const { monthlyLow, monthlyHigh, annualLow, annualHigh } = projections(
                parseFloat(plan.min.replace(/[$,]/g, "")),
                parseFloat(plan.max.replace(/[$,]/g, "")),
                plan.roiLow, plan.roiHigh
              );
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  style={{
                    background:  plan.highlight ? "var(--surface-2)" : "var(--surface)",
                    padding:     "36px 32px",
                    position:    "relative",
                    display:     "flex",
                    flexDirection: "column",
                    gap:         20,
                  }}>

                  {plan.highlight && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--cyan), var(--purple))" }} />
                  )}

                  {plan.highlight && (
                    <span className="eyebrow" style={{ color: "var(--cyan)", fontSize: 8, background: "rgba(10,239,255,0.06)", border: "1px solid rgba(10,239,255,0.2)", padding: "2px 8px", alignSelf: "flex-start" }}>
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>{plan.duration}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, color: "var(--text)" }}>{plan.plan}</div>
                  </div>

                  {/* Range */}
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                    <div>
                      <div className="data-label">Capital Range</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, color: "var(--cyan)" }}>
                        {plan.min} – {plan.max}
                      </div>
                    </div>
                    <div>
                      <div className="data-label">Monthly ROI</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--green)" }}>
                        {plan.roiLow}–{plan.roiHigh}%
                      </div>
                    </div>
                  </div>

                  {/* Projections */}
                  <div style={{ background: "var(--bg)", border: "1px solid rgba(10,239,255,0.08)", padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <div className="data-label">Est. Monthly</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)" }}>
                        ${monthlyLow} – ${monthlyHigh}
                      </div>
                    </div>
                    <div>
                      <div className="data-label">Est. Annual</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)" }}>
                        ${annualLow} – ${annualHigh}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {plan.features.map((f, fi) => (
                      <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle size={12} style={{ color: "var(--green)", flexShrink: 0 }} />
                        <span className="body-text-sm" style={{ fontSize: 12 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <a href="/register" className="btn-primary" style={{ justifyContent: "center", fontSize: 10 }}>
                    Register to Participate
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-base section-py">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="eyebrow">Process</span>
            <h2 className="section-heading" style={{ marginTop: 10 }}>How it works</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, background: "rgba(10,239,255,0.06)" }}>
            {steps.map((s, i) => (
              <motion.div key={i} className="flush-cell card-pad"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
                <span className="card-num">{s.step}</span>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: "var(--text)", marginBottom: 10 }}>{s.title}</div>
                <p className="body-text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="section-py">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="eyebrow">Our commitment</span>
            <h2 className="section-heading" style={{ marginTop: 10 }}>
              Built on <em>trust</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, background: "rgba(10,239,255,0.06)" }}>
            {trust.map((t, i) => (
              <motion.div key={i} className="flush-cell card-pad"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="icon-box" style={{ color: "var(--cyan)" }}>{t.icon}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: "var(--text)", marginBottom: 12 }}>{t.title}</div>
                <p className="body-text-sm">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RISK DISCLOSURE ── */}
      <section className="section-base" style={{ padding: "48px 0" }}>
        <div className="max-w-5xl mx-auto px-6" style={{ textAlign: "center" }}>
          <span className="eyebrow" style={{ marginBottom: 12, display: "block" }}>Risk Disclosure</span>
          <p className="body-text" style={{ maxWidth: 680, margin: "0 auto" }}>
            Returns displayed represent target performance ranges based on historical trading models
            and strategic projections. Actual returns may vary depending on market conditions,
            liquidity, volatility, and trading performance. Participation in financial markets involves
            risk, and capital allocation decisions should be made with a clear understanding of these risks.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section-py" style={{ textAlign: "center", borderTop: "1px solid rgba(10,239,255,0.12)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="eyebrow" style={{ marginBottom: 16, display: "block" }}>Get started</span>
            <h2 className="section-heading" style={{ marginBottom: 20 }}>
              Join a global community<br />
              <em>earning through shared performance.</em>
            </h2>
            <p className="body-text" style={{ maxWidth: 560, margin: "0 auto 36px" }}>
              Built for individuals who value professional management, performance visibility,
              and time efficiency while remaining focused on personal and professional priorities.
            </p>
            <a href="/register" className="btn-primary" style={{ padding: "16px 48px", fontSize: 12, display: "inline-flex", gap: 10 }}>
              Register and Participate <ArrowRight size={14} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(10,239,255,0.12)", background: "rgba(0,0,0,0.2)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6" style={{ padding: "48px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: "var(--text)", marginBottom: 8 }}>
              Seventy<span style={{ color: "var(--cyan)" }}>7</span>Hub
            </div>
            <p className="body-text-sm">Smarter staking, learning, and portfolio management all in one platform.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[["Dashboard", "/dashboard"], ["Staking", "/invest"], ["Portfolio Management", "/portfolio"]].map(([label, href]) => (
              <a key={label} href={href} className="footer-link">{label}</a>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Telegram",  "https://t.me/seventy7hub"],
              ["Discord",   "https://discord.gg/seventy7hub"],
              ["X (Twitter)", "https://x.com/seventy7Kapital"],
              ["Instagram", "https://www.instagram.com/seventy7trading"],
              ["Facebook",  "https://www.facebook.com/share/1AiekpPNc3/"],
              ["LinkedIn",  "https://www.linkedin.com/company/seventy7-trading-academy"],
            ].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="footer-social">{label}</a>
            ))}
          </div>
        </div>
        <div className="footer-copy" style={{ textAlign: "center", paddingBottom: 24 }}>
          © {new Date().getFullYear()} Seventy7Hub. All rights reserved.
        </div>
      </footer>

    </main>
  );
}