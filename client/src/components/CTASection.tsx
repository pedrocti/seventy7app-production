import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const trustItems = [
  { icon: "🔒", label: "Secure & Confidential" },
  { icon: "📈", label: "Real-time Market Access" },
  { icon: "🎓", label: "Expert-led Education" },
];

const CTASection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.15, triggerOnce: true });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  return (
    <section
      id="cta"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "#080C14" }}
    >
      {/* Background decorations */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(242,178,58,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(232,237,245,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top divider line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(242,178,58,0.2), transparent)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="mb-6">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(242,178,58,0.07)",
                border: "1px solid rgba(242,178,58,0.18)",
                color: "#F2B23A",
                fontFamily: '"Space Grotesk", sans-serif',
              }}
            >
              Begin Today
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
            style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, color: "#E8EDF5" }}
          >
            Build Your{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #F2B23A 0%, #F9CC6E 50%, #E8960A 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Financial Future
            </span>{" "}
            with Clarity
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(232,237,245,0.52)", fontFamily: '"Inter", sans-serif' }}
          >
            Join a growing community focused on financial literacy, market intelligence,
            and disciplined wealth building. Develop the edge others don't have.
          </motion.p>

          {/* Primary + secondary CTA — consolidated from 3 to 2 */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            {/* Primary */}
            <motion.a
              href="/register"
              className="relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full font-bold text-sm"
              style={{
                padding: "1.05rem 2.5rem",
                background: "linear-gradient(135deg, #F2B23A, #E8960A)",
                color: "#080C14",
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                minWidth: 200,
              }}
              whileHover={{
                scale: 1.04,
                boxShadow: "0 16px 40px rgba(242,178,58,0.4)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Shimmer */}
              <span
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                }}
              />
              Start Learning Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>

            {/* Secondary — Telegram community */}
            <motion.a
              href="https://t.me/group77hub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full font-medium text-sm"
              style={{
                padding: "1.05rem 2.5rem",
                background: "transparent",
                border: "1px solid rgba(242,178,58,0.2)",
                color: "rgba(232,237,245,0.7)",
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 500,
                minWidth: 200,
              }}
              whileHover={{
                borderColor: "rgba(242,178,58,0.5)",
                color: "#F2B23A",
                backgroundColor: "rgba(242,178,58,0.04)",
                scale: 1.02,
              }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Telegram icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/>
              </svg>
              Join the Community
            </motion.a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10"
          >
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2"
              >
                <span className="text-base">{item.icon}</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: "rgba(232,237,245,0.38)", fontFamily: '"Inter", sans-serif' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Decorative gold line */}
          <motion.div
            variants={itemVariants}
            className="mt-16 mx-auto"
            style={{
              width: 1,
              height: 48,
              background: "linear-gradient(to bottom, rgba(242,178,58,0.3), transparent)",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;