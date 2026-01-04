import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const CTASection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      id="cta"
      className="py-20 lg:py-24 bg-[#0F172A] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-grotesk font-bold mb-6 leading-tight"
            variants={itemVariants}
          >
            Ready to <span className="gradient-text">Transform</span> Your Trading?
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Join our community today and gain access to premium trading resources, expert mentorship, 
            and a supportive network of successful traders.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-6"
            variants={itemVariants}
          >
            <a
              href="/register"
              className="neon-button px-8 py-4 rounded-full text-white font-medium text-lg inline-flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50"
            >
              Register Now
            </a>

            <div className="flex items-center text-gray-400 text-sm md:text-base">
              <i className="fas fa-shield-alt text-[#0AEFFF] mr-2 text-lg" />
              <span>Secure & Confidential</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;