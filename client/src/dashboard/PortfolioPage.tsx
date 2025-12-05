// client/src/dashboard/PortfolioPage.tsx
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
import { FaShieldAlt, FaLock, FaChartLine } from "react-icons/fa";
import { useAuth } from "@/auth/AuthContext";

export default function PortfolioPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  /* -------------------------------------------------------
        FETCH PORTFOLIO — NOW SAFE & COMPATIBLE
  ------------------------------------------------------- */
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadPortfolio() {
      try {
        const res = await fetch("/api/portfolio", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        // New backend response shape
        if (data.success && data.hasPortfolio && data.portfolio) {
          setPortfolio(data.portfolio);
        }
        // else → No portfolio = show request form (perfect)
      } catch (err) {
        console.log("Portfolio not active yet");
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, [token]);

  /* -------------------------------------------------------
        SUBMIT PORTFOLIO REQUEST
  ------------------------------------------------------- */
  async function submitRequest() {
    const amount = Number(requestAmount);
    if (!amount || amount < 1000) {
      alert("Minimum amount is $1,000");
      return;
    }

    try {
      const res = await fetch("/api/portfolio/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (data.success) {
        setRequestStatus("submitted");
      }
    } catch (err) {
      alert("Request failed. Try again.");
    }
  }

  /* -------------------------------------------------------
        LOADING
  ------------------------------------------------------- */
  if (loading) {
    return (
      <div className="text-center text-gray-400 py-20">
        Loading portfolio...
      </div>
    );
  }

  /* -------------------------------------------------------
        NO PORTFOLIO → SHOW REQUEST FORM
  ------------------------------------------------------- */
  if (!portfolio) {
    return (
      <div className="min-h-screen bg-[#0B1120] p-5 sm:p-8 text-white">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-2xl font-bold text-[#0AEFFF] mb-6"
        >
          Managed Portfolio
        </motion.h1>

        <div className="max-w-md mx-auto bg-[#0F172A]/70 p-6 rounded-xl border border-[#1E293B] space-y-4">
          <h3 className="text-center text-[#0AEFFF] font-semibold">
            Request Portfolio Management
          </h3>

          {requestStatus === "submitted" ? (
            <p className="text-center text-green-400">
              Your request has been submitted. Waiting for admin approval.
            </p>
          ) : (
            <>
              <input
                type="number"
                placeholder="Amount (Min $1,000 USDT)"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full p-3 rounded bg-[#1E293B] border border-[#334155] text-white focus:outline-none focus:border-[#0AEFFF]"
              />
              <button
                onClick={submitRequest}
                className="w-full py-3 bg-[#0AEFFF] hover:bg-cyan-400 text-black font-bold rounded-lg transition hover:scale-105"
              >
                Submit Request
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
        CHART DATA — FROM REAL BACKEND
  ------------------------------------------------------- */
  const allocationData = [
    { name: "Crypto",       value: portfolio.crypto_percent || 0,       color: "#0AEFFF" },
    { name: "Equity",       value: portfolio.equity_percent || 0,       color: "#10B981" },
    { name: "Real Estate", value: portfolio.real_estate_percent || 0, color: "#8B5CF6" },
    { name: "Commodities", value: portfolio.commodities_percent || 0, color: "#F59E0B" },
    { name: "Bonds",         value: portfolio.bonds_percent || 0,       color: "#6B7280" },
  ].filter(a => a.value > 0);

  const growthCurve = Array.from({ length: 6 }).map((_, i) => ({
    month: `M${i + 1}`,
    value: portfolio.amount * (1 + (portfolio.performance_percent || 0) / 100) ** (i / 6),
  }));

  const performanceData = allocationData.map(a => ({
    name: a.name,
    growth: portfolio.performance_percent || 0,
  }));

  /* -------------------------------------------------------
        PORTFOLIO UI — LIVE DATA
  ------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#0B1120] p-6 text-white space-y-10">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-3xl font-bold text-[#0AEFFF]"
      >
        Your Managed Portfolio
      </motion.h1>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div className="bg-[#1E293B]/40 p-4 rounded-xl text-center border border-[#334155]/40">
          <p className="text-gray-400 text-xs">Amount Managed</p>
          <p className="text-[#0AEFFF] font-bold text-xl">
            ${Number(portfolio.amount).toLocaleString()}
          </p>
        </div>

        <div className="bg-[#1E293B]/40 p-4 rounded-xl text-center border border-[#334155]/40">
          <p className="text-gray-400 text-xs">Performance</p>
          <p className={`font-bold text-xl ${portfolio.performance_percent >= 0 ? "text-green-400" : "text-red-400"}`}>
            {portfolio.performance_percent >= 0 ? "+" : ""}{portfolio.performance_percent}%
          </p>
        </div>

        <div className="bg-[#1E293B]/40 p-4 rounded-xl text-center border border-[#334155]/40 col-span-2 sm:col-span-2">
          <p className="text-gray-400 text-xs">Last Updated</p>
          <p className="text-gray-300 text-sm">
            {portfolio.updated_at}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Growth */}
        <div className="p-5 bg-[#0F172A] rounded-xl border border-[#1E293B]">
          <h3 className="text-sm font-semibold text-[#0AEFFF] mb-3">Growth Projection</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthCurve}>
              <defs>
                <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0AEFFF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0AEFFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B" }} />
              <Area type="monotone" dataKey="value" fill="url(#growth)" stroke="#0AEFFF" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation */}
        <div className="p-5 bg-[#0F172A] rounded-xl border border-[#1E293B]">
          <h3 className="text-sm font-semibold text-[#0AEFFF] mb-3">Allocation</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={allocationData} dataKey="value" innerRadius={35} outerRadius={55}>
                  {allocationData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              {allocationData.map((entry) => (
                <div key={entry.name} className="flex justify-between gap-2 w-40">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </span>
                  <span className="text-gray-400">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="max-w-3xl mx-auto p-5 bg-[#0F172A] rounded-xl border border-[#1E293B]">
        <h3 className="text-sm font-semibold text-[#0AEFFF] mb-3">Returns by Asset</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={performanceData}>
            <XAxis dataKey="name" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B" }} />
            <Bar dataKey="growth" fill="#0AEFFF" radius={[5, 5, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trust Icons */}
      <div className="grid grid-cols-3 max-w-md mx-auto text-center gap-4">
        {[FaShieldAlt, FaLock, FaChartLine].map((Icon, i) => (
          <div key={i} className="space-y-2">
            <Icon className="text-[#0AEFFF] text-xl mx-auto" />
            <p className="text-gray-400 text-xs">
              {i === 0 ? "Secure" : i === 1 ? "Protected" : "Growing"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}