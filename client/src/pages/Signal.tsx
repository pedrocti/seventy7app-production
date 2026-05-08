import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import {
  Users,
  MessageSquare,
  TrendingUp,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Active Discussions",
    body:
      "Daily conversations around market structure, execution models, liquidity, and disciplined trade planning.",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    body:
      "Structured observations and institutional-style analysis shared by experienced traders and members.",
  },
  {
    icon: BookOpen,
    title: "Collaborative Learning",
    body:
      "A focused environment built around education, accountability, and long-term trading development.",
  },
];

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const CommunityPage = () => {
  return (
    <>
      <Helmet>
        <title>Seventy7 Kapital | Trading Community</title>
      </Helmet>

      <section className="section-base section-py min-h-screen flex items-center">
        <div className="container-s7">

          {/* ───────────────── HERO ───────────────── */}
          <motion.div
            className="section-header"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={rise}>
              <span
                className="eyebrow"
                style={{ display: "block", marginBottom: 16 }}
              >
                Trading Community
              </span>

              <h1 className="section-heading" style={{ maxWidth: 900 }}>
                Join a Community Built on{" "}
                <em>Discipline & Growth</em>
              </h1>
            </motion.div>

            <motion.p
              variants={rise}
              className="body-text"
              style={{
                maxWidth: 760,
                marginTop: 24,
              }}
            >
              A professional environment where traders connect, exchange
              market perspectives, refine strategy execution, and grow through
              structured learning — without hype, signal dependency, or
              unrealistic promises.
            </motion.p>
          </motion.div>

          {/* ───────────────── FEATURE GRID ───────────────── */}
          <motion.div
            className="flush-grid-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            style={{ marginTop: 80 }}
          >
            {features.map((item, i) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={i}
                  className="flush-cell"
                  variants={rise}
                >
                  <div className="card-pad">

                    {/* Icon */}
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        border: "1px solid rgba(10,239,255,0.12)",
                        background: "rgba(10,239,255,0.03)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 28,
                      }}
                    >
                      <Icon
                        size={28}
                        color="var(--cyan)"
                        strokeWidth={1.8}
                      />
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(20px, 2vw, 24px)",
                        fontWeight: 300,
                        color: "var(--text)",
                        marginBottom: 14,
                        lineHeight: 1.2,
                      }}
                    >
                      {item.title}
                    </h3>

                    {/* Body */}
                    <p className="body-text-sm">
                      {item.body}
                    </p>

                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ───────────────── CTA PANEL ───────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              marginTop: 100,
              border: "1px solid rgba(10,239,255,0.1)",
              background: "linear-gradient(to bottom, rgba(10,239,255,0.04), rgba(255,255,255,0.01))",
            }}
          >
            <div
              className="card-pad"
              style={{
                textAlign: "center",
                padding: "72px 32px",
              }}
            >
              <span
                className="eyebrow"
                style={{ display: "block", marginBottom: 18 }}
              >
                Serious Traders Only
              </span>

              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(34px, 4vw, 60px)",
                  fontWeight: 300,
                  lineHeight: 1.05,
                  color: "var(--text)",
                  marginBottom: 24,
                  letterSpacing: "-0.03em",
                }}
              >
                Learn. Contribute. <em>Improve.</em>
              </h2>

              <p
                className="body-text"
                style={{
                  maxWidth: 680,
                  margin: "0 auto 40px",
                }}
              >
                Surround yourself with traders focused on consistency,
                structure, psychology, and long-term performance.
              </p>

              {/* CTA Button */}
              <motion.a
                href="https://t.me/group77hub"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "18px 32px",
                  background: "var(--cyan)",
                  color: "#041014",
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.25s ease",
                }}
              >
                <Users size={18} />
                Join the Telegram Community
                <ArrowRight size={16} />
              </motion.a>

              <p
                className="body-text-sm"
                style={{
                  marginTop: 24,
                  opacity: 0.7,
                }}
              >
                No signal selling. No hype culture. Just structured trading
                education and community growth.
              </p>
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
};

export default CommunityPage;