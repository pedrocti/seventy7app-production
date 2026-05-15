// client/src/components/MarketImpactVisual.tsx
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import trustpilotLogo from '@/assets/trustpilot-logo.svg';

/* ═══════════════════════════════════════════════════════════
   PREMIUM TESTIMONIALS SECTION
   Trustpilot-inspired premium social proof section
   Uses existing design system only
═══════════════════════════════════════════════════════════ */

const testimonials = [
  {
    rating: 5,
    quote:
      "I run a busy dental practice, and most of our surplus cash was sitting idle. Seventy7 Kapital helped us structure that capital more intelligently while allowing me to stay fully focused on my clinic operations.",
    name: 'Dr. Daniel K.',
    role: 'Dental Practice Owner',
    date: 'Verified Client',
  },
  {
    rating: 4,
    quote:
      "As a plumbing company owner, consistency and transparency mattered most to me. The communication, reporting, and disciplined investment structure gave me much more confidence than traditional alternatives.",
    name: 'Amina S.',
    role: 'Founder, Plumbing Services Company',
    date: 'Verified Client',
  },
  {
    rating: 4.5,
    quote:
      "What impressed me most was the professionalism and long-term approach. As a lawyer, I appreciate systems built around clarity, discipline, and proper risk structure and that’s exactly what I experienced.",
    name: 'Tunde A.',
    role: 'Corporate Attorney',
    date: 'Verified Client',
  },
];

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const halfFilled = rating === star - 0.5;

        return (
          <div
            key={star}
            style={{
              position: 'relative',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Background star */}
            <Star
              size={18}
              color="rgba(255,255,255,0.18)"
              fill="rgba(255,255,255,0.06)"
              strokeWidth={1.8}
              style={{
                position: 'absolute',
              }}
            />

            {/* Filled / Half filled star */}
            <div
              style={{
                position: 'absolute',
                overflow: 'hidden',
                width: filled ? '100%' : halfFilled ? '50%' : '0%',
                height: '100%',
                left: 0,
                top: 0,
              }}
            >
              <Star
                size={18}
                color="#00B67A"
                fill="#00B67A"
                strokeWidth={1.8}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MarketImpactVisual() {
  return (
    <section className="section-base section-py">
      <div className="container-s7">

        {/* ───────────────── Header ───────────────── */}
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          <motion.div variants={rise}>
            <span
              className="eyebrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 18,
              }}
            >
              Trusted By Professionals
            </span>

            <h2 className="section-heading">
              Trusted By <em>Business Owners & Professionals</em>
            </h2>
          </motion.div>

          <motion.p
            variants={rise}
            className="body-text"
            style={{
              maxWidth: 560,
            }}
          >
            Real feedback from professionals and entrepreneurs who trust
            Seventy7 Kapital for disciplined capital management,
            structured growth strategies, and long-term financial thinking.
          </motion.p>
        </motion.div>

        {/* ───────────────── Trustpilot Bar ───────────────── */}
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            marginBottom: 50,
            padding: '22px 26px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          {/* Left */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            {/* Trustpilot Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <img
                src={trustpilotLogo}
                alt="Trustpilot"
                style={{
                  height: 24,
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Rating */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 6,
                  flexWrap: 'wrap',
                }}
              >
                <RatingStars rating={4.5} />

                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    color: 'var(--text)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  4.6 Average Client Rating
                </span>
              </div>

              <div
                className="body-text-sm"
                style={{
                  opacity: 0.7,
                }}
              >
                Based on verified private client feedback and direct reviews.
              </div>
            </div>
          </div>

          {/* Right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                padding: '8px 14px',
                background: 'rgba(0,182,122,0.10)',
                border: '1px solid rgba(0,182,122,0.22)',
                color: '#00B67A',
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
              }}
            >
              VERIFIED CLIENT FEEDBACK
            </div>
          </div>
        </motion.div>

        {/* ───────────────── Testimonials Grid ───────────────── */}
        <motion.div
          className="flush-grid-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="flush-cell"
              variants={rise}
            >
              <div
                className="card-pad"
                style={{
                  height: '100%',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.018)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                }}
              >

                {/* Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 22,
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <RatingStars rating={t.rating} />

                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.55,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t.date}
                  </div>
                </div>

                {/* Quote */}
                <p
                  className="body-text"
                  style={{
                    fontStyle: 'italic',
                    lineHeight: 1.78,
                    marginBottom: 34,
                    minHeight: 190,
                    color: 'rgba(255,255,255,0.88)',
                  }}
                >
                  “{t.quote}”
                </p>

                {/* Divider */}
                <div
                  style={{
                    width: 52,
                    height: 2,
                    background: '#00B67A',
                    opacity: 0.75,
                    marginBottom: 18,
                  }}
                />

                {/* Name */}
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 17,
                    fontWeight: 500,
                    color: 'var(--text)',
                    marginBottom: 5,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {t.name}
                </div>

                {/* Role */}
                <div
                  className="body-text-sm"
                  style={{
                    opacity: 0.68,
                    letterSpacing: '0.03em',
                  }}
                >
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