import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   ABOUT SECTION
   Uses exclusively our CSS design system:
   - .section-base .section-py .container-s7
   - .about-grid .about-left .about-right
   - .about-manifesto .about-block-label
   - .section-heading .eyebrow .body-text .body-text-sm
   - .flush-grid-3 .flush-cell .card-pad .card-num .icon-box
   - .ghost-num .gradient-text
═══════════════════════════════════════════════════════════ */

const CYAN = "#0AEFFF";

const solutions = [
  {
    num:   "01",
    title: "Financial Education",
    body:  "Comprehensive programmes covering trading, investing, and financial literacy designed to help individuals build strong financial foundations and make informed market decisions.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    num:   "02",
    title: "Stake to Earn",
    body:  "A structured opportunity for busy professionals to put their capital to work without needing to actively participate in the markets day to day.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    num:   "03",
    title: "Portfolio Management",
    body:  "Professional portfolio management services designed for individuals seeking strategic oversight and long-term investment growth.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="1"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M6 10l3 3 4-5 3 3"/>
      </svg>
    ),
  },
];

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const rise = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function AboutSection() {
  return (
    <section id="about" className="section-base section-py">
      <div className="container-s7">

        {/* ── Section header ── */}
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={rise}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>
              Who We Are
            </span>
            <h2 className="section-heading">
              About <em>Seventy7 Kapital</em>
            </h2>
          </motion.div>

          <motion.p variants={rise} className="body-text" style={{ maxWidth: 380 }}>
            A financial education and wealth development platform committed
            to helping individuals build the knowledge, skills, and discipline
            required to navigate modern financial markets.
          </motion.p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            TWO-COLUMN ABOUT GRID
            Left  — manifesto + body copy + mission
            Right — vision + core solutions list
        ══════════════════════════════════════════════════════ */}
        <div className="about-grid">

          {/* ── Left column ── */}
          <motion.div
            className="about-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            {/* Ghost number */}
            <div style={{ position: 'relative' }}>
              <span className="ghost-num" style={{ position: 'absolute', top: -40, left: -8, zIndex: 0 }}>
                77
              </span>

              {/* Manifesto quote */}
              <motion.p variants={rise} className="about-manifesto" style={{ position: 'relative', zIndex: 1 }}>
                We don't sell signals. We build independent,
                disciplined traders and wealth builders.
              </motion.p>
            </div>

            {/* Body copy */}
            <motion.div variants={rise}>
              <span className="about-block-label">Our Purpose</span>
              <p className="body-text" style={{ marginBottom: 20 }}>
                Seventy7 Kapital is committed to helping individuals build
                the knowledge, skills, and discipline required to navigate
                modern financial markets with confidence.
              </p>
              <p className="body-text">
                We believe financial literacy is a fundamental life skill,
                yet it remains one of the most overlooked areas of education.
                Our goal is to bridge that gap providing practical,
                structured, and accessible programmes that empower individuals
                to take control of their financial future.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div variants={rise}>
              <span className="about-block-label">Our Mission</span>
              <p className="body-text">
                To develop disciplined, independent market participants
                through education, structure, and accountability equipping
                individuals with the knowledge and mindset required to
                navigate financial markets responsibly and build lasting wealth.
              </p>
            </motion.div>
          </motion.div>

          {/* ── Right column ── */}
          <motion.div
            className="about-right"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            {/* Vision */}
            <motion.div variants={rise} style={{ marginBottom: 56 }}>
              <span className="about-block-label">Our Vision</span>
              <p className="body-text">
                To empower the next generation of individuals to build and
                sustain wealth through access to high-quality, practical, and
                affordable financial education making financial knowledge
                accessible to all and equipping individuals with the confidence
                and discipline to make smarter financial decisions.
              </p>
            </motion.div>

            {/* Core solutions — numbered list */}
            <motion.div variants={rise}>
              <span className="about-block-label">Core Solutions</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {solutions.map((sol, i) => (
                  <motion.div
                    key={sol.num}
                    variants={rise}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '36px 1fr',
                      gap: '0 20px',
                      padding: '20px 0',
                      borderBottom: i < solutions.length - 1
                        ? '1px solid rgba(10,239,255,0.08)'
                        : 'none',
                      alignItems: 'start',
                    }}
                  >
                    {/* Icon */}
                    <div className="icon-box" style={{ margin: 0 }}>
                      {sol.icon}
                    </div>

                    {/* Content */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 6,
                      }}>
                        <span className="card-num" style={{ margin: 0 }}>{sol.num}</span>
                        <span style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--text)',
                          letterSpacing: '0.01em',
                        }}>
                          {sol.title}
                        </span>
                      </div>
                      <p className="body-text-sm">{sol.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* ── Bottom stat strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flush-grid-3"
          style={{ marginTop: 1 }}
        >
          {[
            { num: '500+',  label: 'Active Members',       sub: 'and growing' },
            { num: '2024',  label: 'Founded',              sub: 'Est. London' },
            { num: '100%',  label: 'Education First',      sub: 'before profit' },
          ].map((stat, i) => (
            <div key={i} className="flush-cell card-pad-sm" style={{ textAlign: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3vw, 42px)',
                fontWeight: 300,
                color: 'var(--text)',
                display: 'block',
                lineHeight: 1,
                marginBottom: 6,
              }}>
                {stat.num}
              </span>
              <span className="about-block-label" style={{ marginBottom: 2 }}>
                {stat.label}
              </span>
              <span className="body-text-sm" style={{ fontSize: 11 }}>
                {stat.sub}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}