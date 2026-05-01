import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.18 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

const solutions = [
  {
    number: "01",
    title: "Financial Education Programmes",
    body: "Comprehensive programmes covering trading, investing, and financial literacy — designed to help individuals build strong financial foundations and make informed market decisions.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F2B23A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Stake-to-Earn Solutions",
    body: "A structured opportunity for busy professionals and creatives to put their capital to work — without needing to actively participate in the markets day to day.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F2B23A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Portfolio Management",
    body: "Professional portfolio management services designed for High Net Worth Individuals seeking strategic oversight and long-term investment growth.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F2B23A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M6 10l3 3 4-5 3 3"/>
      </svg>
    ),
  },
];

const AboutSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <section
      id="about"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: '#080C14' }}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(242,178,58,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(10,239,255,0.025) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(242,178,58,0.15), transparent)' }} />

      <div className="container mx-auto px-6 lg:px-12 relative z-10" ref={ref}>

        {/* ── Section intro ── */}
        <motion.div
          className="max-w-4xl mx-auto text-center mb-20"
          initial="hidden"
          animate={controls}
          variants={containerVariants}
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="mb-6">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full"
              style={{
                background: 'rgba(242,178,58,0.07)',
                border: '1px solid rgba(242,178,58,0.18)',
                color: '#F2B23A',
                fontFamily: '"Space Grotesk", sans-serif',
              }}
            >
              Who We Are
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-8"
            style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, color: '#E8EDF5' }}
          >
            About{' '}
            <span style={{
              background: 'linear-gradient(135deg, #F2B23A 0%, #F9CC6E 50%, #E8960A 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Seventy7 Kapital
            </span>
          </motion.h2>

          <motion.div
            variants={itemVariants}
            className="space-y-5 text-base md:text-lg leading-relaxed max-w-3xl mx-auto"
            style={{ color: 'rgba(232,237,245,0.55)', fontFamily: '"Inter", sans-serif' }}
          >
            <p>
              Seventy7 Kapital is a financial education and wealth development platform committed to helping individuals build the knowledge, skills, and discipline required to navigate modern financial markets.
            </p>
            <p>
              We believe financial literacy is a fundamental life skill, yet it remains one of the most overlooked areas of education. Our goal is to bridge that gap — providing practical, structured, and accessible financial education that empowers individuals to take control of their financial future.
            </p>
          </motion.div>
        </motion.div>

        {/* ── Core Solutions ── */}
        <motion.div
          className="mb-24"
          initial="hidden"
          animate={controls}
          variants={containerVariants}
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#E8EDF5' }}
          >
            Our Core Solutions
          </motion.h3>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {solutions.map((sol) => (
              <motion.div
                key={sol.number}
                variants={itemVariants}
                className="group relative p-8 rounded-2xl transition-all duration-350"
                style={{
                  background: '#0D1526',
                  border: '1px solid rgba(232,237,245,0.06)',
                }}
                whileHover={{
                  borderColor: 'rgba(242,178,58,0.25)',
                  boxShadow: '0 12px 40px rgba(242,178,58,0.07)',
                  y: -4,
                }}
              >
                {/* Number */}
                <span
                  className="block text-5xl font-bold leading-none mb-6 select-none"
                  style={{
                    color: 'rgba(242,178,58,0.08)',
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}
                >
                  {sol.number}
                </span>

                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(242,178,58,0.07)', border: '1px solid rgba(242,178,58,0.12)' }}
                  >
                    {sol.icon}
                  </div>
                  <h4
                    className="text-base font-semibold leading-snug"
                    style={{ color: '#E8EDF5', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}
                  >
                    {sol.title}
                  </h4>
                </div>

                <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,237,245,0.45)', fontFamily: '"Inter", sans-serif' }}>
                  {sol.body}
                </p>

                {/* Gold bottom accent line on hover */}
                <div
                  className="absolute bottom-0 left-8 right-8 h-px rounded-full transition-all duration-350 opacity-0 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(242,178,58,0.3), transparent)' }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Mission & Vision ── */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-5xl mx-auto mb-20"
          initial="hidden"
          animate={controls}
          variants={containerVariants}
        >
          {/* Mission */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(242,178,58,0.1)', border: '1px solid rgba(242,178,58,0.2)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2B23A" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <h3
                className="text-2xl font-bold"
                style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#E8EDF5' }}
              >
                Our Mission
              </h3>
            </div>
            <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: 'rgba(232,237,245,0.52)', fontFamily: '"Inter", sans-serif' }}>
              <p>
                Our mission is to develop disciplined, independent market participants through education, structure, and accountability — equipping individuals with the knowledge and mindset required to navigate financial markets responsibly.
              </p>
              <p>
                Financial literacy is a life survival skill yet remains one of the most neglected forms of education today. Instead of selling shortcuts or unrealistic promises, we focus on building real understanding through education, risk awareness, and strategic thinking.
              </p>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(242,178,58,0.1)', border: '1px solid rgba(242,178,58,0.2)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2B23A" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h3
                className="text-2xl font-bold"
                style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#E8EDF5' }}
              >
                Our Vision
              </h3>
            </div>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(232,237,245,0.52)', fontFamily: '"Inter", sans-serif' }}>
              To empower the next generation of individuals to build and sustain wealth through access to high-quality, practical, and affordable financial education. By making financial knowledge more accessible, Seventy7 Kapital aims to equip individuals with the confidence, discipline, and skills needed to navigate modern financial markets and make smarter financial decisions.
            </p>
          </motion.div>
        </motion.div>

        {/* ── Closing statement ── */}
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          animate={controls}
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className="relative px-8 py-10 rounded-2xl"
            style={{
              background: 'rgba(242,178,58,0.03)',
              border: '1px solid rgba(242,178,58,0.1)',
            }}
          >
            {/* Quote mark */}
            <span
              className="absolute -top-5 left-1/2 -translate-x-1/2 text-6xl leading-none select-none"
              style={{ color: 'rgba(242,178,58,0.15)', fontFamily: 'Georgia, serif' }}
            >
              "
            </span>
            <p
              className="text-lg md:text-xl font-semibold"
              style={{ color: 'rgba(232,237,245,0.75)', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}
            >
              We don't sell signals. We build independent, disciplined traders and wealth builders.
            </p>
            <div
              className="mt-6 mx-auto h-px w-16"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(242,178,58,0.4), transparent)' }}
            />
            <p
              className="mt-4 text-xs tracking-widest uppercase"
              style={{ color: 'rgba(242,178,58,0.4)', fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Seventy7 Kapital
            </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;