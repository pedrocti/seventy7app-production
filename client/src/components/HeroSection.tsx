import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle } from 'react-icons/io5';
import CandlestickBackground from './CandlestickBackground';

const keyPoints = [
  'Lifetime access to expert mentorship',
  'seventy7kapital academy',
  'trading materials, resources and expert guidiance',
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

  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid"
      id="hero"
    >
      {/* Gradient orbs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7E22CE] opacity-20 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-[#0AEFFF] opacity-20 blur-[100px]" />
      </div>

      {/* Candlestick overlay */}
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
              Learn • Trade • Grow •
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-md text-base font-light text-gray-300 md:text-lg">
            Join the community of smart traders unlocking financial freedom through Knowledge, mentorship, skills and consistent market profits.
          </p>

          <motion.div
            className="mx-auto mb-10 flex max-w-lg flex-col items-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, staggerChildren: 0.1 }}
          >
            {keyPoints.map((point, index) => (
              <motion.div
                key={point}
                className="flex w-full items-start space-x-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <IoCheckmarkCircle className="mt-0.5 flex-shrink-0 text-xl text-green-400" />
                <span className="text-left text-sm text-white md:text-base">{point}</span>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row md:gap-6">
            {/* Primary CTA - Telegram bot */}
            <motion.a
              href="https://t.me/Access77bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-purple-500 px-6 py-3 font-bold text-white text-base transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] md:text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Launch 77AccessBot
            </motion.a>

            {/* Secondary CTA - Now links to login */}
            <motion.a
              href="/login"           // ← Changed to your login route
              className="flex items-center justify-center rounded-full border border-blue-400 px-6 py-3 font-medium text-blue-400 text-base transition-all duration-300 hover:bg-blue-400/10 md:text-lg"
              onClick={(e) => {
                // If /login is an internal route → smooth scroll only if it's #about
                // Otherwise remove this onClick if it's a full page navigation
                if (e.currentTarget.href.endsWith('#about')) {
                  e.preventDefault();
                  scrollToAbout(e);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Log In Experience
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