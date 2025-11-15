import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const InvestPage = () => {
  const [investment, setInvestment] = useState(500);

  const growthData = [
    { month: "Start", value: investment },
    { month: "3M", value: investment * 1.15 },
    { month: "6M", value: investment * 1.35 },
    { month: "1Y", value: investment * 1.75 },
  ];

  return (
    <div className="bg-[#0F172A] text-white">

      {/* === HERO SECTION === */}
      <section className="relative text-center py-16 px-6 overflow-hidden">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-[#0AEFFF] to-[#3B82F6]"
        >
          Invest & Multiply Your Wealth
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-gray-300 max-w-3xl mx-auto mb-6 text-lg md:text-xl"
        >
          Join over <span className="text-[#0AEFFF] font-semibold">1,000 investors</span> who trust Seventy7 Kapital to grow their wealth securely and strategically.
        </motion.p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-5 mb-10">
          <motion.a
            href="https://t.me/Seventy7_Kapital"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-[#0AEFFF] to-[#3B82F6] shadow-lg shadow-[#0AEFFF]/20"
          >
            Start Investing
          </motion.a>
          <div className="text-gray-400 text-sm md:text-base">
            Projected annual growth: <span className="text-[#0AEFFF] font-semibold">up to 75%</span>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="flex flex-col md:flex-row justify-center gap-8 text-gray-400">
          {[
            { value: "500+", label: "Active Investors" },
            { value: "$12M", label: "Managed Capital" },
            { value: "5+", label: "Expert Advisors" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-[#0AEFFF]">{stat.value}</p>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === INVESTMENT CALCULATOR === */}
      <section className="relative py-14 px-6 text-center bg-[#0B1324] overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Investment Amount</h2>
        <p className="text-gray-400 mb-5">See how your capital can grow over 12 months</p>

        <input
          type="range"
          min={500}
          max={10000}
          step={100}
          value={investment}
          onChange={(e) => setInvestment(Number(e.target.value))}
          className="w-full md:w-1/2 mx-auto mb-5"
        />
        <p className="text-xl mb-8">
          Investing: <span className="text-[#0AEFFF]">${investment}</span>
        </p>

        <div className="w-full max-w-3xl mx-auto h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <XAxis dataKey="month" stroke="#8884d8" />
              <YAxis stroke="#8884d8" />
              <Tooltip contentStyle={{ backgroundColor: "#16203B", borderRadius: "8px", border: "none" }} />
              <Line type="monotone" dataKey="value" stroke="#0AEFFF" strokeWidth={3} dot={{ r: 5, fill: "#3B82F6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-gray-400 mt-6 text-sm">
          Projected growth based on historical average returns and portfolio allocation
        </p>
      </section>

      {/* === PORTFOLIO HIGHLIGHTS === */}
      <section className="relative py-14 px-6 bg-[#0F172A]">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Investment Plans & Growth Potential</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { plan: "Starter", return: "15%", risk: "Low", description: "Ideal for new investors. Diversified low-risk portfolio." },
            { plan: "Growth", return: "35%", risk: "Medium", description: "Balanced portfolio with moderate risk & higher returns." },
            { plan: "Premium", return: "75%", risk: "High", description: "High-yield portfolio for experienced investors seeking maximum growth." },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-[#16203B] border border-[#0AEFFF]/20 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">{item.plan}</h3>
              <p className="text-gray-400 mb-1">{item.description}</p>
              <p className="text-gray-400 mb-1">ROI: <span className="text-[#0AEFFF]">{item.return}</span></p>
              <p className="text-gray-400">Risk: {item.risk}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="relative py-14 px-6 bg-[#0B1324]">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { step: "Choose Amount", icon: "💰", description: "Select your investment between $500 and $10,000." },
            { step: "Pick Portfolio", icon: "📊", description: "Choose a portfolio that fits your goals and risk tolerance." },
            { step: "Grow Investment", icon: "📈", description: "Watch your capital grow with expert strategies." },
            { step: "Withdraw or Reinvest", icon: "🔄", description: "Easily withdraw or reinvest earnings anytime." },
          ].map((item, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.05 }} className="p-5 bg-[#16203B] rounded-xl shadow-md">
              <div className="text-4xl mb-2">{item.icon}</div>
              <h3 className="text-lg font-semibold">{item.step}</h3>
              <p className="text-gray-400 mt-2 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === TRUST & BENEFITS === */}
      <section className="relative py-14 px-6 text-center bg-[#0F172A]">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">
          Why <span className="text-[#0AEFFF]">Seventy7 Kapital?</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: <Shield size={38} className="text-[#0AEFFF]" />, title: "Secure & Transparent", desc: "Every investment is protected with secure protocols and clear reporting." },
            { icon: <TrendingUp size={38} className="text-[#0AEFFF]" />, title: "Proven Performance", desc: "Historically consistent, data-backed portfolio growth." },
            { icon: <Users size={38} className="text-[#0AEFFF]" />, title: "Global Community", desc: "Join investors and advisors sharing global insights." },
          ].map((item, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.05 }} className="p-6 rounded-2xl bg-[#16203B] border border-[#0AEFFF]/20 shadow-md">
              <div className="mb-4 flex justify-center">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === TESTIMONIALS === */}
      <section className="relative py-14 px-6 bg-gradient-to-r from-[#0AEFFF]/10 to-[#3B82F6]/10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">Trusted by Investors Worldwide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { name: "Alice M.", text: "Seventy7 Kapital helped me grow my investments safely and efficiently." },
            { name: "James K.", text: "Professional, transparent, and reliable. Highly recommended!" },
            { name: "Sophie L.", text: "My portfolio has never looked better. Excellent guidance." },
          ].map((item, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.03 }} className="p-6 bg-[#16203B]/80 rounded-xl backdrop-blur-md shadow-lg">
              <p className="text-gray-200 mb-2">"{item.text}"</p>
              <h4 className="text-[#0AEFFF] font-semibold">{item.name}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="bg-gradient-to-r from-[#0AEFFF] to-[#3B82F6] py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-5">Ready to Grow Your Wealth?</h2>
        <a
          href="https://t.me/Seventy7_Kapital"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0F172A] text-[#0AEFFF] px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#16203B] transition-all shadow-lg"
        >
          Get Started Today
        </a>
      </section>
    </div>
  );
};

export default InvestPage;
