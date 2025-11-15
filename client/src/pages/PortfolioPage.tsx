import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  TrendingUp,
  Wallet2,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  BarChart3,
  PieChart,
  Briefcase,
  FileText,
  Users,
} from "lucide-react";

const PortfolioPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-[#0B1120] text-white overflow-hidden">

      {/* ===== HERO SECTION ===== */}
      <section className="relative text-white overflow-hidden">
        {/* Animated gradient backdrop */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-[#0AEFFF11] via-[#0B1120] to-[#0B1120]"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%", zIndex: 0 }}
        />

        {/* Hero content grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Text Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4 md:mb-5">
              Smarter <span className="text-[#0AEFFF]">Portfolio Growth</span> with Confidence
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6 md:mb-8">
              Unlock the future of investing with real-time market intelligence, strategic asset allocation, and absolute performance transparency  all engineered to help your capital work smarter, faster, and stronger.

              Every second, our system analyzes live data, optimizes your portfolio, and adapts to market shifts ensuring your capital isn’t just invested, but intelligently orchestrated for growth.

              Experience the evolution of capital management  where insight meets automation, and strategy meets opportunity.
            </p>
            <motion.a
              href="#performance"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] text-[#0B1120] font-semibold px-6 md:px-8 py-2.5 md:py-3.5 rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              View Performance
            </motion.a>
          </motion.div>

          {/* Right: Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative bg-[#111B2E]/80 backdrop-blur-2xl border border-[#0AEFFF22] rounded-3xl p-5 md:p-8 shadow-xl hover:shadow-cyan-500/20 transition-all w-full md:w-[480px]"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Activity className="text-[#0AEFFF] w-5 h-5" />
                <h3 className="text-lg font-semibold">Portfolio Dashboard</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-gray-400 text-xs">Live</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Balance", value: "$58,420.00", icon: <Wallet2 className="text-[#0AEFFF] w-4 h-4" /> },
                { label: "Deposits", value: "$25,000.00", icon: <ArrowDownCircle className="text-green-400 w-4 h-4" /> },
                { label: "Withdrawals", value: "$4,320.00", icon: <ArrowUpCircle className="text-red-400 w-4 h-4" /> },
                { label: "Growth", value: "+12.7%", icon: <TrendingUp className="text-[#0AEFFF] w-4 h-4" /> },
              ].map((item, i) => (
                <div key={i} className="bg-[#0B1120]/70 p-3 rounded-2xl border border-[#0AEFFF15] hover:border-[#0AEFFF33] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{item.label}</span>
                    {item.icon}
                  </div>
                  <p className="text-white font-semibold text-base md:text-lg">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#0AEFFF33] to-transparent my-3" />

            {/* Chart */}
            <div className="relative h-28 bg-gradient-to-t from-[#0B1120] to-[#1E2A3F] rounded-xl overflow-hidden">
              <motion.svg
                viewBox="0 0 200 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full"
              >
                <motion.path
                  d="M0 40 C40 25, 80 35, 120 15 C160 0, 180 20, 200 5"
                  stroke="#0AEFFF"
                  strokeWidth="2"
                  fill="none"
                  animate={{ pathLength: [0, 1], opacity: [0.4, 1] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror' }}
                />
              </motion.svg>
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-between items-center text-gray-400 text-xs">
              <span>Balanced Growth Strategy</span>
              <span>Updated 3s ago</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PERFORMANCE SECTION ===== */}
      <motion.section
        id="performance"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 -mt-6 md:-mt-10 py-10 md:py-12"
      >
        {/* Section Intro */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Performance <span className="text-[#0AEFFF]">Overview</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Monitor your portfolio growth, returns, and asset distribution with live precision. Gain deep, actionable insights that empower you to make smarter, faster, and more confident investment decisions  every single day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          {/* Monthly Returns Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#111B2E]/80 backdrop-blur-xl border border-[#0AEFFF22] rounded-3xl p-5 md:p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0AEFFF]" />
                Monthly Returns
              </h3>
              <span className="text-gray-500 text-xs">Last 6 Months</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-xs">Highest Return</p>
                <p className="text-white font-semibold">$12,450</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Lowest Return</p>
                <p className="text-white font-semibold">$2,350</p>
              </div>
            </div>

            <div className="h-40 bg-[#0B1120] rounded-xl flex items-end justify-between px-2">
              {[40, 75, 60, 90, 50, 80].map((h, i) => (
                <div key={i} className="w-2 bg-[#0AEFFF] rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          </motion.div>

          {/* Asset Distribution Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#111B2E]/80 backdrop-blur-xl border border-[#0AEFFF22] rounded-3xl p-5 md:p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#0AEFFF]" />
                Asset Distribution
              </h3>
              <span className="text-gray-500 text-xs">Current Allocation</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-xs">Equity</p>
                <p className="text-white font-semibold">52%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">crypto</p>
                <p className="text-white font-semibold">28%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Real Estate</p>
                <p className="text-white font-semibold">12%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Bonds</p>
                <p className="text-white font-semibold">8%</p>
              </div>
            </div>

            <div className="h-40 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-4 border-[#0AEFFF33] border-t-[#0AEFFF] animate-spin" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== CASE STUDIES ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-10 md:py-12 border-t border-[#0AEFFF11]"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Proven <span className="text-[#0AEFFF]">Case Studies</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Harness the power of advanced modeling, real-time analytics, and algorithmic precision to achieve tangible, measurable results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { icon: <Briefcase className="text-[#0AEFFF]" />, title: "Diversified Wealth Plan", desc: "Achieve stability, consistency, and growth through a strategically diversified portfolio spanning multiple sectors and asset classes. Our cross-sector allocation strategy delivers an impressive +28.8% gurranteed annualized growth, balancing risk and reward to ensure your wealth thrives even in volatile markets." },
            { icon: <FileText className="text-[#0AEFFF]" />, title: "Institutional Fund Optimization", desc: "Experience next-generation fund management powered by algorithmic precision. Our proprietary strategies have enhanced liquidity efficiency by 14 - 42%, ensuring institutional portfolios operate with greater flexibility, reduced friction, and superior capital utilization even under dynamic market conditions." },
            { icon: <Users className="text-[#0AEFFF]" />, title: "Private Client Portfolio", desc: "Designed for discerning investors, this portfolio delivers a risk-adjusted growth trajectory that emphasizes stability, consistency, and long-term performance. Each strategy is tailored to your goals, balancing measured risk with sustained returns ensuring your capital grows confidently through every market cycle." },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }}
              className="bg-[#111B2E]/80 backdrop-blur-xl border border-[#0AEFFF22] rounded-3xl p-5 md:p-6 shadow-lg"
            >
              <div className="mb-3">{item.icon}</div>
              <h4 className="font-semibold text-lg mb-1 md:mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm md:text-base">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ===== GOVERNANCE CTA ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative py-12 md:py-16 bg-gradient-to-b from-[#0B1120] to-[#111B2E] border-t border-[#0AEFFF11]"
      >
        <div className="max-w-5xl mx-auto text-center px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            Governance & <span className="text-[#0AEFFF]">Accountability</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6 md:mb-8 text-sm md:text-base">
            At the heart of our operations lies a commitment to transparency, ethical management, and responsible stewardship. We uphold rigorous governance standards to protect investor interests and maintain absolute accountability across all portfolios.
          </p>

          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            className="inline-block bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] text-[#0B1120] font-semibold px-6 md:px-8 py-2.5 md:py-3.5 rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all"
          >
            Review Our Policy Framework
          </motion.a>
        </div>
      </motion.section>

    </main>
  );
};

export default PortfolioPage;
