import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

const SignalPage = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center px-6 text-center">
      <Helmet>
        <title>Seventy7 Kapital | Signal Community</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-6xl font-grotesk font-bold mb-6 gradient-text">
          Signal Community
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mb-10">
          Join our elite trading community where experts share high-quality, real-time trade signals, analysis, and mentorship opportunities.
        </p>

        <motion.a
          href="https://t.me/Seventy7_Kapital"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-cyan-400/40 transition-all"
        >
          Join Telegram Group
        </motion.a>
      </motion.div>
    </div>
  );
};

export default SignalPage;
