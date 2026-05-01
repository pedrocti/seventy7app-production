import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Users, MessageSquare, TrendingUp, BookOpen } from "lucide-react";

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center px-6 text-center">
      <Helmet>
        <title>Seventy7 Kapital | Trading Community</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl"
      >
        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
          <span className="block">Welcome to Our</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Trading Community
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          A professional space for disciplined traders to connect, discuss markets, share institutional-grade insights, 
          and grow through collaborative learning — all grounded in education and independence.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="flex flex-col items-center">
            <MessageSquare className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Active Discussions</h3>
            <p className="text-gray-400 text-sm">Daily conversations on setups, trends, and strategy refinement.</p>
          </div>
          <div className="flex flex-col items-center">
            <TrendingUp className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Shared Insights</h3>
            <p className="text-gray-400 text-sm">Real-time market observations and analysis from experienced members.</p>
          </div>
          <div className="flex flex-col items-center">
            <BookOpen className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Collective Knowledge</h3>
            <p className="text-gray-400 text-sm">Access shared resources, frameworks, and educational content.</p>
          </div>
        </div>

        {/* CTA */}
        <motion.a
          href="https://t.me/group77hub"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
        >
          <Users className="w-6 h-6" />
          Join the Community on Telegram
        </motion.a>

        <p className="mt-8 text-sm text-gray-500">
          No signal chasing. Just serious traders building skill and consistency together.
        </p>
      </motion.div>
    </div>
  );
};

export default CommunityPage;