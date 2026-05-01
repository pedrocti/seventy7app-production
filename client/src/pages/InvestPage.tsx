import { motion } from "framer-motion";
import { Shield, Users, TrendingUp, Calendar, Lock, ArrowRight } from "lucide-react";

const InvestPage = () => {
  return (
    <div className="bg-[#0B1120] text-white min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/90 via-[#0B1120]/70 to-[#0B1120] z-10" />
        <img
          src="https://images.stockcake.com/public/3/b/4/3b4309ca-f1d9-46e3-8a1c-eacbaca1fc51_large/market-success-rising-stockcake.jpg"
          alt="Professional trading desk"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight"
          >
            Stake-to-Earn<br />
            <span className="text-[#0AEFFF] bg-clip-text text-transparent bg-gradient-to-r from-[#0AEFFF] to-cyan-300">
              Min. 2-15% Monthly Roi
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            Stake-to-Earn is a performance-driven growth product designed for busy professionals,
            business owners, entrepreneurs, and creatives seeking capital exposure without the
            demands of active trading. Your capital is professionally managed while you stay
            focused on what matters most.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.a
              href="/register"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] text-[#0B1120] font-bold px-10 py-5 rounded-full shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all text-lg"
            >
              Register to Participate
              <ArrowRight className="w-6 h-6" />
            </motion.a>
            <p className="text-gray-400 text-base">
              Minimum stake: <span className="text-[#0AEFFF] font-semibold">$500</span>
            </p>
            <p className="text-gray-400 text-base">
              Minimum Roi: <span className="text-[#0AEFFF] font-semibold">2-15% Monthly</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-[#0F172A]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-12">
            What <span className="text-[#0AEFFF]">Stake-to-Earn</span> Offers
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: "Performance-Driven Strategy",
                desc: "Client stakes are pooled and actively traded using structured, data-driven systems supported by advanced technology and AI-assisted tools."
              },
              {
                icon: <Calendar className="w-12 h-12" />,
                title: "Professional Management",
                desc: "Capital is managed by experienced professionals within defined trading frameworks, with outcomes determined by market performance."
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: "Transparent Monitoring",
                desc: "Participants maintain visibility through a performance dashboard, live trade tracking, and ongoing market analysis."
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="bg-[#111B2E]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20"
              >
                <div className="flex justify-center mb-6 text-[#0AEFFF]">{item.icon}</div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="py-20 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Investment Participation Pools
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Select a duration that fits your objectives. Performance outcomes are determined by
            market conditions and trading results within each cycle.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
              {
                plan: "Starter Pool",
                duration: "30 Days",
                min: "$500",
                desc: "Low entry participation designed for individuals seeking short-term capital cycles with monthly performance updates. Target return range: 2–5% monthly.",
                highlight: false
              },
              {
                plan: "Growth Pool",
                duration: "90 Days",
                min: "$2,000",
                desc: "Medium-term capital allocation providing enhanced participation in structured quarterly trading cycles. Target return range: 5–10% monthly.",
                highlight: true
              },
              {
                plan: "Strategic Pool",
                duration: "365 Days",
                min: "$5,000",
                desc: "Long-term capital allocation offering exposure to extended strategic trading cycles aligned with broader market opportunities. Target return range: 10–15% monthly.",
                highlight: false
              },
            ].map((plan, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10, scale: 1.03 }}
              className={`relative p-8 rounded-3xl border ${
                plan.highlight
                  ? "bg-[#111B2E]/90 border-[#0AEFFF] shadow-2xl shadow-cyan-500/20"
                  : "bg-[#111B2E]/70 border-[#0AEFFF]/30"
              } transition-all duration-300`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0AEFFF] text-[#0B1120] px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.plan}</h3>
              <p className="text-4xl font-extrabold text-[#0AEFFF] mb-4">{plan.duration}</p>
              <p className="text-gray-400 mb-6">
                Minimum Stake: <span className="text-white font-semibold">{plan.min}</span>
              </p>
              <p className="text-gray-300 mb-8">{plan.desc}</p>
              <a
                href="/register"
                className="block w-full text-center py-3 rounded-full bg-[#0AEFFF]/20 text-[#0AEFFF] font-semibold hover:bg-[#0AEFFF]/30 transition-all"
              >
                Register to Participate
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pool Benefits */}
      <section className="py-20 bg-[#0F172A]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            Key Benefits of Each Investment Pool
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            {/* Starter Pool */}
            <div className="bg-[#111B2E]/70 p-8 rounded-3xl border border-[#0AEFFF]/20">
              <h3 className="text-2xl font-bold mb-4 text-[#0AEFFF]">Starter Pool</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Low entry participation</li>
                <li>• Short-term capital cycle</li>
                <li>• Monthly performance updates</li>
              </ul>
            </div>

            {/* Growth Pool */}
            <div className="bg-[#111B2E]/70 p-8 rounded-3xl border border-[#0AEFFF]/20">
              <h3 className="text-2xl font-bold mb-4 text-[#0AEFFF]">Growth Pool</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Medium-term capital allocation</li>
                <li>• Enhanced performance participation</li>
                <li>• Structured quarterly trading cycles</li>
              </ul>
            </div>

            {/* Strategic Pool */}
            <div className="bg-[#111B2E]/70 p-8 rounded-3xl border border-[#0AEFFF]/20">
              <h3 className="text-2xl font-bold mb-4 text-[#0AEFFF]">Strategic Pool</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Long-term capital allocation</li>
                <li>• Access to extended strategic trading cycles</li>
                <li>• Strategic portfolio exposure aligned with broader market opportunities</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#0F172A]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            How Stake-to-Earn Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Stake Capital",
                desc: "Participants allocate capital into the Stake-to-Earn pool based on their selected plan."
              },
              {
                step: "2",
                title: "Active Trading",
                desc: "Pooled capital is actively traded by experienced professionals using structured strategies."
              },
              {
                step: "3",
                title: "Performance Tracking",
                desc: "Participants monitor activity through dashboards, live trade insights, and market analysis."
              },
              {
                step: "4",
                title: "Profit Distribution",
                desc: "Profits, if generated, are distributed proportionally based on staked amounts and performance."
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0AEFFF]/20 text-[#0AEFFF] text-2xl font-bold mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="py-20 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-12">
          Built on <span className="text-[#0AEFFF]">Trust & Transparency</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <Lock className="w-12 h-12" />,
              title: "Structured Risk Framework",
              desc: "Trading activities operate within defined parameters. Capital is exposed to market risk and returns are not guaranteed."
            },
            {
              icon: <Users className="w-12 h-12" />,
              title: "Experienced Operators",
              desc: "Strategies are executed by professionals using disciplined processes and institutional-grade tools."
            },
            {
              icon: <Shield className="w-12 h-12" />,
              title: "Clear Reporting",
              desc: "Participants receive transparent insights into performance metrics, trade activity, and portfolio status."
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#111B2E]/60 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20"
            >
              <div className="flex justify-center mb-6 text-[#0AEFFF]">{item.icon}</div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Risk Disclosure */}
      <section className="py-16 bg-[#0B1120] border-t border-[#0AEFFF]/20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-6 text-[#0AEFFF]">
            Risk Disclosure
          </h3>

          <p className="text-gray-400 leading-relaxed">
            Returns displayed represent target performance ranges based on historical trading models 
            and strategic projections. Actual returns may vary depending on market conditions, 
            liquidity, volatility, and trading performance. Participation in financial markets involves risk, 
            and capital allocation decisions should be made with a clear understanding of these risks.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center relative overflow-hidden bg-gradient-to-r from-[#0AEFFF]/10 via-[#2563EB]/5 to-[#0AEFFF]/10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-6xl font-extrabold mb-8"
          >
            Join a Global Community<br />
            <span className="text-[#0AEFFF]">Earning Through Shared Performance</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Stake-to-Earn is built for individuals who value professional management, performance
            visibility, and time efficiency while remaining focused on personal and professional priorities.
          </motion.p>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(10,239,255,0.5)" }}
            className="inline-flex items-center gap-4 bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] text-[#0B1120] font-bold px-12 py-6 rounded-full text-xl shadow-2xl transition-all"
          >
            Register & Participate
            <ArrowRight className="w-8 h-8" />
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#0AEFFF]/20 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm text-[#848E9C]">

          {/* Brand */}
          <div>
            <h4 className="text-[#0AEFFF] font-semibold text-lg mb-2">
              Seventy7Hub
            </h4>
            <p className="text-xs leading-relaxed">
              Smarter staking, learning, and portfolio management all in one platform.
              <br />
              <span className="text-[#9CA3AF]">
                Earn 5–10% monthly, performance-based on market conditions.
              </span>
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2">
            <a href="/dashboard" className="hover:text-[#0AEFFF]">
              Dashboard
            </a>

            {/* Staking → Investment page */}
            <a href="/dashboard/invest" className="hover:text-[#0AEFFF]">
              Staking
            </a>

            {/* Transactions → Portfolio */}
            <a href="/dashboard/portfolio" className="hover:text-[#0AEFFF]">
              Transactions
            </a>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-2">
            <a
              href="https://t.me/seventy7hub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0AEFFF]"
            >
              Telegram
            </a>

            <a
              href="https://discord.gg/seventy7hub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0AEFFF]"
            >
              Discord
            </a>

            <a
              href="https://x.com/seventy7hub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0AEFFF]"
            >
              X (Twitter)
            </a>

            <a
              href="https://www.instagram.com/seventy7trading?igsh=ZmNmNTBtdWJqa3Ax&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0AEFFF]"
            >
              Instagram
            </a>

            <a
              href="https://www.facebook.com/share/1AiekpPNc3/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0AEFFF]"
            >
              Facebook
            </a>

            <a
              href="https://www.linkedin.com/company/seventy7-trading-academy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0AEFFF]"
            >
              LinkedIn
            </a>
          </div>

        </div>

        <div className="text-center text-xs text-[#6B7280] pb-6">
          © {new Date().getFullYear()} Seventy7Hub. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default InvestPage;
