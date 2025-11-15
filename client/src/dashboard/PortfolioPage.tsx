import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  FaShieldAlt,
  FaLock,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";

/* -------------------------------------------------
   Static data – keep it simple and readable
   ------------------------------------------------- */
const allocation = [
  { name: "Crypto",       value: 35, color: "#0AEFFF" },
  { name: "Real Estate", value: 25, color: "#10B981" },
  { name: "Stocks",       value: 20, color: "#8B5CF6" },
  { name: "Tech",         value: 15, color: "#F59E0B" },
  { name: "Cash",         value: 5,  color: "#6B7280" },
];

const portfolioGrowth = [
  { month: "Jun", value: 4000 },
  { month: "Jul", value: 4600 },
  { month: "Aug", value: 5100 },
  { month: "Sep", value: 5300 },
  { month: "Oct", value: 5800 },
  { month: "Nov", value: 6200 },
];

const categoryPerformance = [
  { name: "Crypto",       growth: 15 },
  { name: "Real Estate", growth: 8  },
  { name: "Stocks",       growth: 12 },
  { name: "Tech",         growth: 18 },
  { name: "Cash",         growth: 3  },
];

/* -------------------------------------------------
   Component
   ------------------------------------------------- */
export default function PortfolioPage() {
  const [amount, setAmount] = useState(5000);
  const [duration, setDuration] = useState("6");
  const [projectedValue, setProjectedValue] = useState(0);
  const [totalReturn, setTotalReturn] = useState(0);

  // ---- calculate projected return ---------------------------------
  useEffect(() => {
    const monthlyRate = 0.012;               // 1.2 percent per month
    const months = Number(duration);
    const final = amount * (1 + monthlyRate) ** months;

    setProjectedValue(final);
    setTotalReturn(final - amount);
  }, [amount, duration]);

  return (
    <div className="min-h-screen bg-[#0B1120] p-5 sm:p-8 space-y-10 font-sans">

      {/* ---------- Header ---------- */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0AEFFF] to-cyan-300 bg-clip-text text-transparent">
          Managed Portfolio
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto">
          AI-optimized, diversified, and actively managed. Min. $1,000.
        </p>
      </motion.header>

      {/* ---------- Key metrics ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
        {[
          { label: "AUM",        value: "$18.7M" },
          { label: "Annual Return", value: "14.4%" },
          { label: "Sharpe",     value: "1.82" },
          { label: "Drawdown",   value: "-6.2%" },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#1A2332]/50 backdrop-blur-sm border border-[#334155]/30 rounded-xl p-3 text-center"
          >
            <div className="text-lg font-bold text-[#0AEFFF]">{m.value}</div>
            <div className="text-xs text-gray-500">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ---------- Charts + Calculator ---------- */}
      <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">

        {/* Growth chart */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0F172A]/60 backdrop-blur-sm border border-[#1E293B]/40 rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-[#0AEFFF] mb-3 flex items-center gap-1.5">
            <FaChartLine className="w-3.5 h-3.5" />
            Growth (6M)
          </h3>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={portfolioGrowth} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0AEFFF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0AEFFF" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
              <Tooltip
                contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#0AEFFF" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0AEFFF"
                strokeWidth={2}
                fill="url(#grad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Return forecast calculator */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0F172A]/60 backdrop-blur-sm border border-[#1E293B]/40 rounded-xl p-5 space-y-3"
        >
          <h3 className="text-sm font-semibold text-[#0AEFFF]">Return Forecast</h3>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(1000, Number(e.target.value)))}
            className="w-full px-3 py-2 text-sm bg-[#1E293B]/50 border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#0AEFFF] transition"
            placeholder="Amount"
          />

          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#1E293B]/50 border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#0AEFFF]"
          >
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">1 Year</option>
          </select>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0AEFFF]/10 p-2 rounded-lg border border-[#0AEFFF]/20">
              <div className="text-gray-400">Final</div>
              <div className="font-bold text-[#0AEFFF]">${projectedValue.toFixed(0)}</div>
            </div>
            <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/20">
              <div className="text-gray-400">Profit</div>
              <div className="font-bold text-green-400">+${totalReturn.toFixed(0)}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ---------- Allocation + Performance ---------- */}
      <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">

        {/* Pie allocation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0F172A]/60 backdrop-blur-sm border border-[#1E293B]/40 rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-[#0AEFFF] mb-3">Allocation</h3>

          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={allocation}
                  innerRadius={35}
                  outerRadius={50}
                  dataKey="value"
                  stroke="none"
                >
                  {allocation.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-1.5 text-xs">
              {allocation.map((a) => (
                <div key={a.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: a.color }}
                    />
                    <span className="text-gray-300">{a.name}</span>
                  </span>
                  <span className="font-medium">{a.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bar returns */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0F172A]/60 backdrop-blur-sm border border-[#1E293B]/40 rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-[#0AEFFF] mb-3">Returns by Asset</h3>

          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={categoryPerformance} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 10 }} stroke="#64748B" />
              <Tooltip
                contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="growth" fill="#0AEFFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ---------- Request form ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-gradient-to-r from-[#0AEFFF]/5 to-cyan-600/5 p-0.5 rounded-xl">
          <div className="bg-[#0F172A]/80 backdrop-blur-sm rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#0AEFFF] text-center">
              Request Management
            </h3>

            <input
              type="number"
              placeholder="Amount (USDT)"
              className="w-full px-3 py-2 text-sm bg-[#1E293B]/50 border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#0AEFFF]"
            />

            <select className="w-full px-3 py-2 text-sm bg-[#1E293B]/50 border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#0AEFFF]">
              <option>6 Months</option>
              <option>1 Year</option>
              <option>Custom</option>
            </select>

            <button className="w-full py-2.5 text-sm font-medium bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-[#0F172A] rounded-lg hover:scale-[1.02] transition">
              Submit
            </button>
          </div>
        </div>
      </motion.div>

      {/* ---------- Trust icons ---------- */}
      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
        {[
          { Icon: FaShieldAlt, label: "Insured" },
          { Icon: FaLock,      label: "Cold Storage" },
          { Icon: FaChartLine, label: "AI Rebalanced" },
        ].map(({ Icon, label }, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="space-y-2"
          >
            <Icon className="w-5 h-5 mx-auto text-[#0AEFFF]" />
            <p className="text-xs text-gray-400">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ---------- Final CTA ---------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <button className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-[#0F172A] rounded-full hover:scale-105 transition shadow-lg">
          Get Started
        </button>
      </motion.div>
    </div>
  );
}