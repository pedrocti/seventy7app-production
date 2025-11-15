import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function InvestPage() {
  const [amount, setAmount] = useState(100);
  const [projectedMonthly, setProjectedMonthly] = useState(0);
  const [projectedYearly, setProjectedYearly] = useState(0);

  // Mock historical performance
  const performanceData = [
    { month: "Jan", value: 100 },
    { month: "Feb", value: 108 },
    { month: "Mar", value: 112 },
    { month: "Apr", value: 118 },
    { month: "May", value: 125 },
    { month: "Jun", value: 132 },
    { month: "Jul", value: 138 },
    { month: "Aug", value: 142 },
    { month: "Sep", value: 148 },
    { month: "Oct", value: 155 },
    { month: "Nov", value: 162 },
  ];

  // Live trades (mock real-time)
  const liveTrades = [
    { id: "T-101", pair: "BTC/USD", entry: "$68,420", status: "Active", pnl: "+2.3%", time: "2m ago" },
    { id: "T-100", pair: "ETH/USD", entry: "$3,210", status: "Completed", pnl: "+4.1%", time: "1h ago" },
    { id: "T-099", pair: "SOL/USD", entry: "$142", status: "Completed", pnl: "-1.2%", time: "3h ago" },
  ];

  // Calculate projected earnings (example: 1.8% avg monthly)
  useEffect(() => {
    const monthlyRate = 0.018; // 1.8% avg
    const monthlyEarn = amount * monthlyRate;
    const yearlyEarn = monthlyEarn * 12;

    setProjectedMonthly(monthlyEarn);
    setProjectedYearly(yearlyEarn);
  }, [amount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1A2332] to-[#0F172A] p-6 space-y-10">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#0AEFFF] to-cyan-400 bg-clip-text text-transparent">
          Stake & Earn
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Stake from <strong className="text-[#0AEFFF]">$100</strong> and earn <strong>up to 1.8% monthly </strong> 
          fully automated, transparent, and withdrawable anytime.
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: "Total AUM", value: "$2.4M+" },
            { label: "Active Traders", value: "1,200+" },
            { label: "Avg Monthly Return", value: "1.8%" },
            { label: "Uptime", value: "99.9%" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1E293B]/50 backdrop-blur-sm border border-[#334155]/50 rounded-2xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-[#0AEFFF]">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Investment Calculator */}
      <motion.section
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
      >
        <div className="bg-[#0F172A]/80 backdrop-blur-md p-8 rounded-3xl border border-[#1E293B]/60">
          <h2 className="text-2xl font-bold text-[#0AEFFF] mb-6">Contribute & Earn</h2>
          <div className="space-y-5">
            <div>
              <label className="text-sm text-gray-400">Investment Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(100, Number(e.target.value)))}
                min="100"
                className="mt-1 w-full p-4 rounded-xl bg-[#1E293B]/60 border border-[#334155] text-white text-xl font-medium focus:outline-none focus:border-[#0AEFFF] transition"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: $100</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#0AEFFF]/10 to-cyan-600/10 p-4 rounded-xl border border-[#0AEFFF]/20">
                <div className="text-sm text-gray-400">Est. Monthly</div>
                <div className="text-2xl font-bold text-[#0AEFFF]">${projectedMonthly.toFixed(2)}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 p-4 rounded-xl border border-green-500/20">
                <div className="text-sm text-gray-400">Est. Yearly</div>
                <div className="text-2xl font-bold text-green-400">${projectedYearly.toFixed(2)}</div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-[#0F172A] font-bold py-4 rounded-full hover:scale-105 transition transform duration-200 shadow-lg">
              Contribute Now
            </button>

            <p className="text-xs text-center text-gray-400">
              Withdraw principal + earnings anytime. No lock-in.
            </p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-[#0F172A]/80 backdrop-blur-md p-6 rounded-3xl border border-[#1E293B]/60">
          <h3 className="text-lg font-semibold text-[#0AEFFF] mb-4">Portfolio Growth (2025)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0AEFFF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0AEFFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                labelStyle={{ color: "#0AEFFF" }}
              />
              <Area type="monotone" dataKey="value" stroke="#0AEFFF" fillOpacity={1} fill="url(#growth)" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-3 text-center">Starting from $100 base</p>
        </div>
      </motion.section>

      {/* Live Trade Feed */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-[#0F172A]/80 backdrop-blur-md p-6 rounded-3xl border border-[#1E293B]/60">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-[#0AEFFF]">Live Trade Activity</h2>
            <span className="flex items-center gap-2 text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Real-time
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-[#1E293B]/50">
                  <th className="pb-3">ID</th>
                  <th>Pair</th>
                  <th>Entry</th>
                  <th>Status</th>
                  <th>P/L</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {liveTrades.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border-b border-[#1E293B]/30"
                  >
                    <td className="py-3 font-mono text-[#0AEFFF]">{t.id}</td>
                    <td className="text-white">{t.pair}</td>
                    <td className="text-gray-300">{t.entry}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          t.status === "Active"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className={t.pnl.startsWith("-") ? "text-red-400" : "text-green-400"}>
                      {t.pnl}
                    </td>
                    <td className="text-gray-500 text-xs">{t.time}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      {/* Risk & Transparency */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6"
      >
        {[
          {
            title: "No Lock-in Period",
            desc: "Withdraw your capital and profits anytime with zero penalties.",
            icon: "Unlock",
          },
          {
            title: "Transparent P&L",
            desc: "Every trade is logged on-chain. Verify performance in real-time.",
            icon: "Eye",
          },
          {
            title: "Risk Disclosure",
            desc: "Trading involves risk. Past performance ≠ future results.",
            icon: "AlertTriangle",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-[#0F172A]/70 backdrop-blur-sm p-6 rounded-2xl border border-[#1E293B]/50 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-[#0AEFFF]/20 rounded-full flex items-center justify-center">
              <span className="text-xl text-[#0AEFFF]">{item.icon}</span>
            </div>
            <h3 className="font-semibold text-[#0AEFFF]">{item.title}</h3>
            <p className="text-sm text-gray-400 mt-2">{item.desc}</p>
          </div>
        ))}
      </motion.section>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-4"
      >
        <p className="text-sm text-gray-500">Trusted by traders worldwide</p>
        <div className="flex justify-center gap-8 flex-wrap">
          {["Regulated Broker", "SSL Secured", "Audited Smart Contracts", "24/7 Support"].map((badge) => (
            <span
              key={badge}
              className="px-4 py-2 bg-[#1E293B]/50 border border-[#334155] rounded-full text-xs text-gray-300"
            >
              {badge}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <p className="text-amber-400 font-medium mb-4">
          Website launching fully in the coming weeks — secure your spot now!
        </p>
        <button className="bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-[#0F172A] font-bold px-10 py-4 rounded-full text-lg hover:scale-110 transition transform duration-300 shadow-xl">
          Get Early Access
        </button>
      </motion.div>
    </div>
  );
}