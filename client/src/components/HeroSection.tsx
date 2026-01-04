import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle } from 'react-icons/io5';
import CandlestickBackground from './CandlestickBackground';

const keyPoints = [
  'Lifetime access to expert mentorship',
  'Seventy7 Kapital Academy',
  'Trading materials, resources and expert guidance',
  'Portfolio management and stake trading',
];

const HeroSection = () => {
  const [scrollIndicator, setScrollIndicator] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrollIndicator(window.scrollY <= 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      id="hero"
    >
      {/* Candlestick overlay – kept exactly as before */}
      <CandlestickBackground className="z-1" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
        <motion.div
          className="mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl">
            <span className="block mb-2">Own Your Financial Journey.</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Learn • Trade • Grow
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base font-light text-gray-300 md:text-lg leading-relaxed">
            Join the community of smart traders unlocking financial freedom through knowledge, mentorship, skill-building, and consistent market profits.
          </p>

          {/* Key points – brought back and aligned in two columns on larger screens */}
          <motion.div
            className="mx-auto mb-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {keyPoints.map((point, index) => (
              <motion.div
                key={point}
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <IoCheckmarkCircle className="mt-0.5 flex-shrink-0 text-xl text-green-400" />
                <span className="text-left text-base text-white">{point}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <motion.a
              href="/register"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-purple-500 px-8 py-4 font-bold text-white text-lg shadow-lg transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign up Now
            </motion.a>

            <motion.a
              href="/login"
              className="flex items-center justify-center rounded-full border-2 border-blue-400 px-8 py-4 font-semibold text-blue-400 text-lg transition-all duration-300 hover:bg-blue-400/10 hover:border-blue-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Member Login
            </motion.a>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        {scrollIndicator && (
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <i className="fas fa-chevron-down text-xl text-white" />
            </motion.div>
            <p className="mt-2 text-sm text-gray-400">Scroll to explore</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;