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
            Stake Your Capital<br />
            <span className="text-[#0AEFFF] bg-clip-text text-transparent bg-gradient-to-r from-[#0AEFFF] to-cyan-300">
              With Professional Traders
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            For busy professionals and serious investors: Stake your funds in a managed plan for a fixed duration (monthly, quarterly, or annually). 
            Our expert traders handle the markets while you earn proportional profits — withdraw monthly or at plan maturity.
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
              Register to Stake Capital
              <ArrowRight className="w-6 h-6" />
            </motion.a>
            <p className="text-gray-400 text-base">
              Minimum stake: <span className="text-[#0AEFFF] font-semibold">$500</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-[#0F172A]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-12">
            Why Stake With <span className="text-[#0AEFFF]">Seventy7 Kapital</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: "Hands-Off Growth",
                desc: "Let proven professional traders manage your capital full-time while you focus on life or business."
              },
              {
                icon: <Calendar className="w-12 h-12" />,
                title: "Flexible Durations",
                desc: "Choose monthly, quarterly, or annual plans. Withdraw profits monthly or reinvest at maturity."
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: "Transparent & Secure",
                desc: "Clear reporting, no hidden fees, and capital protection protocols in place."
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
            Available Staking Plans
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Select a duration that fits your goals. Profits are calculated and distributable at the end of each cycle.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              plan: "Monthly Plan",
              duration: "30 Days",
              min: "$500",
              desc: "Perfect for testing the waters. Monthly profit withdrawal available.",
              highlight: false
            },
            {
              plan: "Quarterly Plan",
              duration: "90 Days",
              min: "$2,000",
              desc: "Balanced commitment with potential compounding. Most popular choice.",
              highlight: true
            },
            {
              plan: "Annual Plan",
              duration: "365 Days",
              min: "$5,000",
              desc: "Maximum growth potential through longer-term strategic trading.",
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
              <p className="text-gray-400 mb-6">Minimum Stake: <span className="text-white font-semibold">{plan.min}</span></p>
              <p className="text-gray-300 mb-8">{plan.desc}</p>
              <a
                href="/register"
                className="block w-full text-center py-3 rounded-full bg-[#0AEFFF]/20 text-[#0AEFFF] font-semibold hover:bg-[#0AEFFF]/30 transition-all"
              >
                Register to Stake
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#0F172A]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            How Staking Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Register & Stake", desc: "Create an account and deposit your chosen amount into your selected plan." },
              { step: "2", title: "Expert Trading", desc: "Your capital is traded by our professional team using disciplined, proven strategies." },
              { step: "3", title: "Track Progress", desc: "Receive regular updates and transparent performance reports." },
              { step: "4", title: "Withdraw Profits", desc: "Access earned profits monthly or full capital + profit at plan maturity." },
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

      {/* Trust & Security */}
      <section className="py-20 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-12">
          Built on <span className="text-[#0AEFFF]">Trust & Transparency</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: <Lock className="w-12 h-12" />, title: "Capital Protection", desc: "Your principal is managed with strict risk controls and never used for leverage beyond plan guidelines." },
            { icon: <Users className="w-12 h-12" />, title: "Proven Track Record", desc: "Managed by traders with verifiable performance history and institutional-grade discipline." },
            { icon: <Shield className="w-12 h-12" />, title: "Full Transparency", desc: "Regular statements, live updates, and clear profit distribution — no surprises." },
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

      {/* Final CTA */}
      <section className="py-24 text-center relative overflow-hidden bg-gradient-to-r from-[#0AEFFF]/10 via-[#2563EB]/5 to-[#0AEFFF]/10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-6xl font-extrabold mb-8"
          >
            Ready to Stake Your Capital<br />
            <span className="text-[#0AEFFF]">With Professional Traders?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Join hundreds of professionals who trust Seventy7 Kapital to grow their wealth — hands-off, transparent, and disciplined.
          </motion.p>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(10,239,255,0.5)" }}
            className="inline-flex items-center gap-4 bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] text-[#0B1120] font-bold px-12 py-6 rounded-full text-xl shadow-2xl transition-all"
          >
            Register & Stake Now
            <ArrowRight className="w-8 h-8" />
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#0AEFFF]/20 text-center text-gray-500 text-sm">
        <p>© 2026 Seventy7 Kapital. All rights reserved.</p>
        <p className="mt-2">Trading involves risk. Past performance is not indicative of future results.</p>
      </footer>
    </div>
  );
};

export default InvestPage;