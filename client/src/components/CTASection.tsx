// client/src/components/CTASection.tsx
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   CTA SECTION — uses our CSS design system exclusively
   No Space Grotesk, no rounded pills, no blur blobs,
   no useInView from react-intersection-observer
═══════════════════════════════════════════════════════════ */

const trustItems = [
  { label: 'Secure & Confidential' },
  { label: 'Real-time Market Access' },
  { label: 'Expert-led Education' },
];

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const rise = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function CTASection() {
  return (
    <section id="cta" className="section-base section-py">
      <div className="container-s7">
        <motion.div
          style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >

          {/* Eyebrow */}
          <motion.div variants={rise}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 20 }}>
              Begin Today
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={rise}
            className="section-heading"
            style={{ marginBottom: 24 }}
          >
            Build Your <em>Financial Future</em> with Clarity
          </motion.h2>

          {/* Body */}
          <motion.p
            variants={rise}
            className="body-text"
            style={{ maxWidth: 480, margin: '0 auto 48px' }}
          >
            Join a growing community focused on financial literacy, market intelligence,
            and disciplined wealth building and develop the edge others don't have.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={rise}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 48 }}
          >
            <motion.a
              href="/register"
              className="btn-primary"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{ textDecoration: 'none', display: 'inline-flex', minWidth: 200, justifyContent: 'center' }}
            >
              Open Your Account
            </motion.a>

            <motion.a
              href="https://t.me/group77hub"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              whileTap={{ scale: 0.97 }}
              style={{ textDecoration: 'none' }}
            >
              Join the Community
            </motion.a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={rise}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}
          >
            {trustItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-block',
                  width: 4, height: 4,
                  borderRadius: '50%',
                  background: 'var(--cyan)',
                  flexShrink: 0,
                  opacity: 0.5,
                }} />
                <span className="data-label">{item.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Decorative vertical line */}
          <motion.div
            variants={rise}
            style={{
              width: 1,
              height: 48,
              background: 'linear-gradient(to bottom, rgba(10,239,255,0.25), transparent)',
              margin: '48px auto 0',
            }}
          />

        </motion.div>
      </div>
    </section>
  );
}