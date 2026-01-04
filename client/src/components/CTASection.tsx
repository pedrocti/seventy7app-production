import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const CTASection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

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
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-20 bg-[#0F172A] relative overflow-hidden">
      {/* Removed bg-grid and the glowing orb (the "dot") */}

      <div className="container mx-auto px-4 z-10 relative" ref={ref}>
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h2
            className="text-3xl md:text-5xl font-grotesk font-bold mb-6"
            variants={itemVariants}
          >
            Ready to <span className="gradient-text">Transform</span> Your Trading?
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Join our community today and gain access to premium trading resources, expert mentorship, and a supportive network of successful traders.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
            variants={itemVariants}
          >
            <a
              href="/register"
              className="neon-button px-8 py-4 rounded-full text-white font-medium text-lg inline-flex items-center"
            >
              Register Now
            </a>
            <div className="text-gray-400 flex items-center">
              <i className="fas fa-shield-alt text-[#0AEFFF] mr-2"></i>
              <span>Secure & Confidential</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;