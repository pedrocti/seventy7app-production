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
              A bespoke portfolio management service designed exclusively for high-income
              and high-net-worth individuals seeking long-term wealth creation through
              disciplined, globally diversified investing.
              <br /><br />
              Portfolios are structured across real estate, equities, and fixed-income
              instruments, with a focus on sustainable growth, capital preservation, and
              risk awareness. Access is provided strictly on an advisor-led basis to ensure
              suitability and strategic alignment.
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
                { label: "Balance", value: "$68,420.00", icon: <Wallet2 className="text-[#0AEFFF] w-4 h-4" /> },
                { label: "Deposits", value: "$50,000.00", icon: <ArrowDownCircle className="text-green-400 w-4 h-4" /> },
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
              <span>Updated 30d ago</span>
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
            Our Portfolio Management service is strictly reserved for high-income and
            high-net-worth individuals who require professional oversight, structured
            execution, and risk-aware capital deployment.
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

      {/* ===== PERFORMANCE / DETAILS ===== */}
      <motion.section
        id="performance"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-10 md:py-12"
      >       
        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          <motion.div className="bg-[#111B2E]/80 backdrop-blur-xl border border-[#0AEFFF22] rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="text-[#0AEFFF]" />
              How It Works
            </h3>
            <p className="text-gray-400 text-sm md:text-base">
              Access begins with a private advisor consultation to assess objectives,
              risk tolerance, and suitability. Following advisor approval, capital is
              allocated and managed in line with the agreed investment strategy.
              <br /><br />
              The minimum portfolio management amount is <strong>$50,000</strong>.
            </p>
          </motion.div>
          <motion.div className="bg-[#111B2E]/80 backdrop-blur-xl border border-[#0AEFFF22] rounded-3xl p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <PieChart className="text-[#0AEFFF]" />
                  Target Performance
                </h3>
                <p className="text-gray-400 text-sm md:text-base">
                  Portfolios are constructed across global asset classes with disciplined
                  allocation and continuous monitoring. The target annual performance range
                  is <strong>12–25% APR</strong>, subject to prevailing market conditions.
                </p>
              </motion.div>
            </div>
          </motion.section>


      {/* ===== WHAT YOU GET ===== */}
      <motion.section
        className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-10 md:py-12 border-t border-[#0AEFFF11]"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            What <span className="text-[#0AEFFF]">You Get</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Briefcase />, text: "Dedicated performance tracking dashboard" },
            { icon: <Users />, text: "Dedicated portfolio manager" },
            { icon: <FileText />, text: "Access to a globally diversified investment portfolio" },
          ].map((item, i) => (
            <div key={i} className="bg-[#111B2E]/80 border border-[#0AEFFF22] rounded-3xl p-6">
              <div className="text-[#0AEFFF] mb-3">{item.icon}</div>
              <p className="text-gray-400">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ===== IMPORTANT INFO ===== */}
      <motion.section className="py-12 bg-gradient-to-b from-[#0B1120] to-[#111B2E] border-t border-[#0AEFFF11]">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Important <span className="text-[#0AEFFF]">Information</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            This service is provided strictly on an advisor-led basis and is subject to
            suitability assessment and applicable regulatory requirements. Past performance is not
            indicative of future results.
          </p>
        </div>
      </motion.section>

      {/* Floating WhatsApp CTA */}
      <a
        href="https://wa.me/2348123456789?text=Hi%2C%20I%20want%20to%20request%20Portfolio%20Management%20advisor%20access."
        target="_blank"
        rel="noopener noreferrer"
        className="
          fixed bottom-4 right-4 z-50
          flex items-center gap-2
          rounded-full px-3 py-2
          bg-white/10 backdrop-blur-lg
          border border-white/10
          text-white font-semibold text-sm
          shadow-[0_0_18px_rgba(10,239,255,0.35)]
          hover:shadow-[0_0_24px_rgba(10,239,255,0.55)]
          transition-all duration-300
          animate-neon

          /* MOBILE OPTIMIZATION */
          sm:bottom-3 sm:right-3 sm:px-2 sm:py-1.5 sm:text-xs
        "
      >
        <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-[#0AEFFF]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20.52 3.48A11.81 11.81 0 0 0 3.5 20.5l-1.9 5.2 5.2-1.9A11.81 11.81 0 0 0 20.52 3.48Zm-1.02 16.23c-.48 1.43-2.46 2.3-4.05 2.5-.73.1-1.7.12-3.2-.38-3.35-.98-6.1-4.1-6.4-4.43-.3-.33-2.2-2.63-2.2-5.12 0-2.5 1.7-4.04 2.2-4.5.6-.6 1.1-.7 1.3-.7.2 0 .5 0 .8 0 .3.02.7.1 1 .2.3.1.6.2.8.4.2.1.4.2.5.3.2.2.4.4.6.5.2.2.3.3.4.5.1.2.2.4.2.6.1.2.1.4.1.6 0 .2 0 .4-.1.6-.1.2-.2.4-.4.5-.2.1-.4.2-.6.3-.2 0-.4.1-.6.2-.2.1-.4.2-.6.3-.2.1-.4.3-.6.4-.2.1-.4.3-.6.4-.2.2-.4.4-.5.6-.1.2-.2.4-.3.6-.1.2-.1.4-.2.6-.1.2-.1.4-.1.6 0 .2 0 .4.1.6.1.2.2.4.3.6.1.2.3.4.5.6.2.2.4.3.6.4.2.1.4.2.6.3.2.1.4.2.6.2.2 0 .4.1.6.1.2 0 .4.1.6.1.2 0 .4 0 .6-.1.2-.1.4-.2.6-.3.2-.1.4-.3.6-.5.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6.2-.2.4-.4.6-.6Z"/>
          </svg>
        </span>
        Advisor Access
      </a>
      {/* Footer */}
      <footer className="mt-16 border-t border-[#0AEFFF]/20 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm text-[#848E9C]">

          {/* Brand */}
          <div>
            <h4 className="text-[#0AEFFF] font-semibold text-lg mb-2">Seventy7Hub</h4>
            <p className="text-xs leading-relaxed">
              Smarter Stakes, learning, and portfolio management all in one platform.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2">
            <a href="/dashboard" className="hover:text-[#0AEFFF]">Dashboard</a>
            <a href="/invest" className="hover:text-[#0AEFFF]">Staking</a>
            <a href="/portfolio" className="hover:text-[#0AEFFF]">Portfolio Management</a>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-2">
            <a href="https://t.me/seventy7hub" target="_blank" rel="noopener noreferrer">Telegram</a>
            <a href="https://discord.gg/seventy7hub" target="_blank" rel="noopener noreferrer">Discord</a>
            <a href="https://x.com/seventy7hub" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
            <a href="https://www.instagram.com/seventy7trading?igsh=ZmNmNTBtdWJqa3Ax&utm_source=qr" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/share/1AiekpPNc3/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.linkedin.com/company/seventy7-trading-academy" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>

        </div>

        <div className="text-center text-xs text-[#6B7280] pb-6">
          © {new Date().getFullYear()} Seventy7Hub. All rights reserved.
        </div>
      </footer>
    </main>
    
  );
};

export default PortfolioPage;
