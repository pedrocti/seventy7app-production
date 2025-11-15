import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { mockBalances, mockAllocation, COLORS } from "@/data/mockData";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Portfolio Overview Section */}
      <section className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {/* Pie Chart - Asset Allocation */}
        <div className="rounded-2xl p-5 bg-[#0F172A]/60 border border-[#1E293B]/40">
          <h3 className="text-sm text-gray-300 mb-3">Portfolio Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mockAllocation}
                dataKey="value"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={3}
                animationBegin={200}
                animationDuration={800}
                isAnimationActive={true}
              >
                {mockAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400 mt-2">
            {mockAllocation.map((a, i) => (
              <div key={a.name} className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                ></span>
                {a.name}
              </div>
            ))}
          </div>
        </div>

        {/* Live Performance Bar */}
        <div className="rounded-2xl p-5 bg-[#0F172A]/60 border border-[#1E293B]/40">
          <h3 className="text-sm text-gray-300 mb-3">Current Performance</h3>
          <div className="text-3xl font-bold text-[#0AEFFF] mb-1">+12.8%</div>
          <p className="text-gray-400 text-xs mb-3">vs last month</p>
          <div className="w-full bg-[#1E293B] h-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#0AEFFF]"
              initial={{ width: "0%" }}
              animate={{ width: "75%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Growth Sparkline */}
        <div className="rounded-2xl p-5 bg-[#0F172A]/60 border border-[#1E293B]/40">
          <h3 className="text-sm text-gray-300 mb-3">Portfolio Growth (6m)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockBalances}>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  border: "1px solid #1E293B",
                  borderRadius: "0.5rem",
                  fontSize: "0.75rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#0AEFFF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Responsive Info Cards */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0F172A]/60 p-4 rounded-2xl border border-[#1E293B]/40"
        >
          <h4 className="text-xs text-gray-400">Total Balance</h4>
          <div className="text-2xl font-semibold text-white mt-1">$12,450</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0F172A]/60 p-4 rounded-2xl border border-[#1E293B]/40"
        >
          <h4 className="text-xs text-gray-400">Investments Active</h4>
          <div className="text-2xl font-semibold text-white mt-1">8</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0F172A]/60 p-4 rounded-2xl border border-[#1E293B]/40"
        >
          <h4 className="text-xs text-gray-400">Last Trade P/L</h4>
          <div className="text-2xl font-semibold text-[#00ff88] mt-1">+3.1%</div>
        </motion.div>
      </div>
    </div>
  );
}
