// client/src/components/MarketImpactVisual.tsx
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   TESTIMONIAL SECTION (Replaces Market Impact Visual)
   Uses existing design system (no new CSS required)
═══════════════════════════════════════════════════════════ */

const testimonials = [
  {
    quote:
      "Before joining, I was guessing entries. Now I understand structure, liquidity, and timing. My trades finally make sense.",
    name: "Daniel K.",
    role: "Forex Trader",
  },
  {
    quote:
      "The clarity around risk management changed everything. I stopped overtrading and started preserving capital like a professional.",
    name: "Amina S.",
    role: "Independent Trader",
  },
  {
    quote:
      "This isn’t hype trading. It’s structured, disciplined, and realistic. The psychology lessons alone are worth it.",
    name: "Tunde A.",
    role: "Crypto & FX Trader",
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const rise = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function MarketImpactVisual() {
  return (
    <section className="section-base section-py">
      <div className="container-s7">

        {/* ── Section header ── */}
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          <motion.div variants={rise}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>
              Testimonials
            </span>
            <h2 className="section-heading">
              What Our <em>Traders Say</em>
            </h2>
          </motion.div>

          <motion.p variants={rise} className="body-text" style={{ maxWidth: 420 }}>
            Real feedback from traders who have transformed their understanding of the markets
            through structured learning, discipline, and proven strategies.
          </motion.p>
        </motion.div>

        {/* ── Testimonials grid ── */}
        <motion.div
          className="flush-grid-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
        >
          {testimonials.map((t, i) => (
            <motion.div key={i} className="flush-cell" variants={rise}>
              <div className="card-pad">

                {/* Quote */}
                <p
                  className="body-text"
                  style={{
                    fontStyle: 'italic',
                    marginBottom: 24,
                    lineHeight: 1.6,
                  }}
                >
                  “{t.quote}”
                </p>

                {/* Divider */}
                <div
                  style={{
                    width: 40,
                    height: 2,
                    background: 'var(--cyan)',
                    marginBottom: 16,
                    opacity: 0.6,
                  }}
                />

                {/* Name */}
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 16,
                    fontWeight: 400,
                    color: 'var(--text)',
                    marginBottom: 4,
                  }}
                >
                  {t.name}
                </div>

                {/* Role */}
                <div className="body-text-sm" style={{ opacity: 0.7 }}>
                  {t.role}
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}