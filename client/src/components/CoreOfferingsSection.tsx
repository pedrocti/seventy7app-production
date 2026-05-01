import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  RadialBarChart, RadialBar,
  XAxis, Tooltip,
} from "recharts";
import { Link } from "wouter";

const CYAN     = "#0AEFFF";
const CYAN_MID = "#4AFFF5";
const CYAN_DIM = (a: number) => `rgba(10,239,255,${a})`;

const barData  = [{ v: 20 },{ v: 50 },{ v: 70 },{ v: 90 }];
const lineData = [{ v: 15 },{ v: 40 },{ v: 65 },{ v: 85 }];
const areaData = [{ v: 10 },{ v: 35 },{ v: 55 },{ v: 75 }];
const radialData = [{ name: "Progress", value: 78, fill: CYAN }];

const tooltipStyle = {
  background: "#0D1526",
  border: `1px solid ${CYAN_DIM(0.15)}`,
  borderRadius: 8,
  color: "#E8EDF5",
  fontSize: 12,
};

const offerings = [
  {
    title: "77 Academy & Internship",
    subtitle: "Personalized mentorship programs to elevate your trading mastery.",
    link: "/mentorship",
    type: "radial",
    data: radialData,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    badge: "Education",
    accent: CYAN,
  },
  {
    title: "Stake to Earn",
    subtitle: "Curated staking paths emphasising steady, compounding growth.",
    link: "/invest",
    type: "bar",
    data: barData,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    badge: "Staking",
    accent: CYAN,
  },
  {
    title: "Portfolio Management",
    subtitle: "Professionally managed portfolios tailored to your financial goals.",
    link: "/portfolio",
    type: "line",
    data: lineData,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M6 10l3 3 4-5 3 3"/>
      </svg>
    ),
    badge: "Portfolio",
    accent: CYAN,
  },
  {
    title: "Community Signals",
    subtitle: "Real-time market insights, discussions, and shared opportunities.",
    link: "/signal",
    type: "area",
    data: areaData,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    badge: "Community",
    accent: CYAN,
  },
];

const renderChart = (type: string, data: any) => {
  const commonProps = { margin: { left: -10, right: 0, top: 4, bottom: 4 } };

  switch (type) {
    case "bar":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} {...commonProps}>
            <XAxis dataKey="v" hide />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: CYAN_DIM(0.05) }} />
            <Bar dataKey="v" radius={[4, 4, 0, 0]} fill={CYAN} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      );
    case "line":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="v" hide />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="v" stroke={CYAN} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    case "area":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="areaCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CYAN} stopOpacity={0.35} />
                <stop offset="95%" stopColor={CYAN} stopOpacity={0}    />
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
          <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="100%" barSize={10} data={data} startAngle={180} endAngle={0}>
            <RadialBar background={{ fill: CYAN_DIM(0.06) }} dataKey="value" cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
};

const OfferingCard = ({ item, i }: { item: typeof offerings[0]; i: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ delay: 0.1 * i, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    className="group relative flex flex-col h-full"
    style={{
      background: "#0D1526",
      border: "1px solid rgba(232,237,245,0.06)",
      borderRadius: 20,
      padding: "1.75rem",
      transition: "border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease",
    }}
    whileHover={{
      y: -6,
      borderColor: CYAN_DIM(0.22),
      boxShadow: `0 16px 48px ${CYAN_DIM(0.07)}`,
    }}
  >
    <div
      className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
      style={{
        background: `radial-gradient(circle, ${CYAN_DIM(0.05)} 0%, transparent 70%)`,
        filter: "blur(20px)",
      }}
    />

    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-start gap-4 mb-5">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: CYAN_DIM(0.06),
            border: `1px solid ${CYAN_DIM(0.14)}`,
          }}
        >
          {item.icon}
        </div>

        <div className="flex-1 min-w-0">
          <span
            className="inline-block text-[10px] font-semibold tracking-widest uppercase mb-1.5 px-2 py-0.5 rounded-full"
            style={{
              background: CYAN_DIM(0.07),
              color: CYAN_DIM(0.75),
              fontFamily: '"Space Grotesk", sans-serif',
            }}
          >
            {item.badge}
          </span>
          <h3
            className="text-base font-semibold leading-tight"
            style={{ color: "#E8EDF5", fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}
          >
            {item.title}
          </h3>
        </div>
      </div>

      <p
        className="text-sm leading-relaxed mb-5 flex-1"
        style={{ color: "rgba(232,237,245,0.5)", fontFamily: '"Inter", sans-serif' }}
      >
        {item.subtitle}
      </p>

      <div className="w-full h-20 mb-5 opacity-80 group-hover:opacity-100 transition-opacity">
        {renderChart(item.type, item.data)}
      </div>

      <Link
        href={item.link}
        className="inline-flex items-center gap-2 text-sm font-semibold group/link"
        style={{ color: CYAN, fontFamily: '"Space Grotesk", sans-serif' }}
      >
        <span className="group-hover/link:underline underline-offset-2">Explore</span>
        <motion.span animate={{ x: 0 }} whileHover={{ x: 3 }} style={{ display: "inline-flex" }}>
          →
        </motion.span>
      </Link>
    </div>
  </motion.article>
);

export default function CoreOfferingsSection() {
  return (
    <section
      id="offerings"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "#080C14" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${CYAN_DIM(0.04)} 0%, transparent 65%)`,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14 lg:mb-18"
        >
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{
              background: CYAN_DIM(0.07),
              border: `1px solid ${CYAN_DIM(0.15)}`,
              color: CYAN,
              fontFamily: '"Space Grotesk", sans-serif',
            }}
          >
            What We Offer
          </span>

          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
            style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, color: "#E8EDF5" }}
          >
            Our Core{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${CYAN} 0%, ${CYAN_MID} 60%, #00C8D4 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Offerings
            </span>
          </h2>

          <p
            className="text-base leading-relaxed"
            style={{ color: "rgba(232,237,245,0.5)", fontFamily: '"Inter", sans-serif' }}
          >
            Premium services built to educate, grow, and protect your financial future —
            with interactive insights and direct access to every destination.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {offerings.map((item, i) => (
            <OfferingCard key={item.title} item={item} i={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm"
            style={{
              background: `linear-gradient(135deg, ${CYAN}, #00C8D4)`,
              color: "#080C14",
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
            }}
          >
            Access All Services →
          </a>
          <a
            href="/mentorship"
            className="text-sm font-medium"
            style={{ color: "rgba(232,237,245,0.45)", fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Explore mentorship first
          </a>
        </motion.div>
      </div>
    </section>
  );
}
