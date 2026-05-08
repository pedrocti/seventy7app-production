import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar,
  LineChart, Line, AreaChart, Area,
  RadialBarChart, RadialBar, XAxis, Tooltip,
} from "recharts";
import { Link } from "wouter";

/* ═══════════════════════════════════════════════════════════
   DATA
   All colors reference CSS variables via JS strings —
   these match exactly what var(--cyan) resolves to.
═══════════════════════════════════════════════════════════ */
const CYAN     = "#0AEFFF";
const CYAN_DIM = (a: number) => `rgba(10,239,255,${a})`;

const barData    = [{ v:20 },{ v:50 },{ v:70 },{ v:90 }];
const lineData   = [{ v:15 },{ v:40 },{ v:65 },{ v:85 }];
const areaData   = [{ v:10 },{ v:35 },{ v:55 },{ v:75 }];
const radialData = [{ name:"Progress", value:78, fill:CYAN }];

const tooltipStyle = {
  background: "var(--surface)",
  border: `1px solid ${CYAN_DIM(0.15)}`,
  borderRadius: 0,
  color: "var(--text)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
};

const offerings = [
  {
    num:      "01",
    title:    "77 Academy",
    subtitle: "Structured financial education and mentorship programmes built to elevate your understanding of markets and wealth.",
    link:     "/mentorship",
    type:     "radial",
    data:     radialData,
    badge:    "Education",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    num:      "02",
    title:    "Stake to Earn",
    subtitle: "Curated staking programmes with structured, compounding returns designed for consistent, long-term capital growth.",
    link:     "/invest",
    type:     "bar",
    data:     barData,
    badge:    "Staking",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    num:      "03",
    title:    "Portfolio Management",
    subtitle: "Professionally managed portfolios aligned to your risk profile, financial goals, and investment horizon.",
    link:     "/portfolio",
    type:     "line",
    data:     lineData,
    badge:    "Portfolio",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="1"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M6 10l3 3 4-5 3 3"/>
      </svg>
    ),
  },
  {
    num:      "04",
    title:    "Community",
    subtitle: "Real-time market data insights, structured analysis on stocks, equity, opportunities across asset classes all in one community.",
    link:     "/signal",
    type:     "area",
    data:     areaData,
    badge:    "Insights",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
];

/* ── Mini charts — kept small, purely decorative data signal ── */
function MiniChart({ type, data }: { type: string; data: any[] }) {
  switch (type) {
    case "bar":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left:0, right:0, top:2, bottom:0 }}>
            <XAxis dataKey="v" hide />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: CYAN_DIM(0.05) }} />
            <Bar dataKey="v" radius={[2,2,0,0]} fill={CYAN} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      );
    case "line":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left:0, right:0, top:2, bottom:0 }}>
            <XAxis dataKey="v" hide />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="v" stroke={CYAN} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    case "area":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left:0, right:0, top:2, bottom:0 }}>
            <defs>
              <linearGradient id="areaCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CYAN} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CYAN} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <XAxis dataKey="v" hide />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="v" stroke={CYAN} fill="url(#areaCyan)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      );
    case "radial":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="100%"
            barSize={8} data={data} startAngle={180} endAngle={0}>
            <RadialBar background={{ fill: CYAN_DIM(0.06) }} dataKey="value" cornerRadius={2} />
          </RadialBarChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
}

/* ── Card — uses flush-cell + card-pad from our CSS system ── */
function OfferingCard({ item, i }: { item: typeof offerings[0]; i: number }) {
  return (
    <motion.div
      className="flush-cell"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: 0.08 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="card-pad">

        {/* Card number */}
        <span className="card-num">{item.num}</span>

        {/* Icon box */}
        <div className="icon-box">
          {item.icon}
        </div>

        {/* Badge */}
        <span className="eyebrow" style={{ display: 'block', marginBottom: 10 }}>
          {item.badge}
        </span>

        {/* Title */}
        <h3 className="section-heading" style={{ fontSize: 'clamp(18px, 1.6vw, 22px)', marginBottom: 14 }}>
          {item.title}
        </h3>

        {/* Body */}
        <p className="body-text-sm" style={{ marginBottom: 24 }}>
          {item.subtitle}
        </p>

        {/* Mini chart */}
        <div style={{ width: '100%', height: 64, marginBottom: 28, opacity: 0.75 }}>
          <MiniChart type={item.type} data={item.data} />
        </div>

        {/* Link */}
        <Link href={item.link} className="card-link">
          Explore
        </Link>

      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION
═══════════════════════════════════════════════════════════ */
export default function CoreOfferingsSection() {
  return (
    <section id="offerings" className="section-base section-py">
      <div className="container-s7">

        {/* ── Section header ── */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Left — eyebrow + heading */}
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>
              What We Offer
            </span>
            <h2 className="section-heading">
              Core <em>Services</em>
            </h2>
          </div>

          {/* Right — body copy */}
          <p className="body-text" style={{ maxWidth: 340 }}>
            Premium services built to educate, grow, and protect your
            financial future with structured access to every destination.
          </p>
        </motion.div>

        {/* ── 4-column flush grid ── */}
        <div className="flush-grid-4">
          {offerings.map((item, i) => (
            <OfferingCard key={item.num} item={item} i={i} />
          ))}
        </div>

        {/* ── Bottom CTA row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            paddingTop: 48,
            borderTop: `1px solid rgba(10,239,255,0.12)`,
            marginTop: 1,
          }}
        >
          <a href="/register" className="btn-primary">
            Access All Services
          </a>
          <a href="/mentorship" className="btn-ghost">
            Explore Academy
          </a>
        </motion.div>

      </div>
    </section>
  );
}