'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  ShieldCheck,
  Lock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// ── Animation variants ──
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } },
};

type Step = "intro" | "contact" | "amount";

export default function PortfolioPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);

  const [step, setStep] = useState<Step>("intro");
  const [requestAmount, setRequestAmount] = useState("");
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const [balance, setBalance] = useState<number>(0);


  // Fetch portfolio
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

        if (data.success && data.hasPortfolio && data.portfolio) {
          setPortfolio(data.portfolio);
        }
      } catch (err) {
        console.error("Portfolio fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    async function loadBalance() {
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setBalance(Number(data.user.balance));
        }

      } catch {}
    }

    loadBalance();
  }, [token]);


  // Submit investment request
  async function submitRequest() {
    const amount = Number(requestAmount);
    if (isNaN(amount) || amount < 50000) {
      alert("Minimum amount is $50,000");
      return;
    }

    // ---- FETCH USER BALANCE FIRST ----
    if (balance < amount) {
      alert("Insufficient balance. Please fund your account.");
      return;
    }


    // ---- SEND REQUEST ----
    try {
      const res = await fetch("/api/portfolio/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (data.success) {
        setRequestStatus("submitted");
      } else {
        alert(data.message || "Request failed");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-cyan-400 border-gray-700 rounded-full"
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // NO PORTFOLIO → ONBOARDING FLOW
  // ─────────────────────────────────────────────
  if (!portfolio) {
    return (
      <div className="min-h-screen text-white">
        <div className="container mx-auto px-6 py-16 max-w-6xl">

          {/* HERO */}
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block px-5 py-2 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/30 mb-6"
            >
              Managed Portfolios • Min. $50,000
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl font-extrabold mb-6"
            >
              Private Portfolio Management
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-gray-300 max-w-3xl mx-auto text-lg"
            >
              A bespoke portfolio management service designed exclusively for high-income and high-net-worth
              individuals seeking long-term wealth creation through disciplined, globally diversified investing.
            </motion.p>
          </motion.div>

          {/* STEP 1 */}
          {step === "intro" && (
            <div className="flex justify-center">
              <button
                onClick={() => setStep("contact")}
                className="px-10 py-5 bg-cyan-500 text-black font-bold rounded-xl text-lg hover:shadow-xl hover:shadow-cyan-500/30"
              >
                Request Portfolio Management
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === "contact" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto bg-[#0F172A]/80 border border-[#1E293B]/60 rounded-xl p-10 text-center"
            >
              <h3 className="text-3xl font-semibold mb-4">
                Speak With an Advisor
              </h3>

              <p className="text-gray-400 mb-10">
                We recommend speaking with a financial professional before proceeding.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href="https://wa.me/447887649072"
                  target="_blank"
                  rel="noreferrer"
                  className="py-4 rounded-xl bg-green-500 text-black font-semibold"
                >
                  💬 Chat on WhatsApp
                </a>

                <a
                  href="tel:+447887649072"
                  className="py-4 rounded-xl bg-[#1E293B] border border-[#334155] text-white font-semibold"
                >
                  📞 Request a Call
                </a>
              </div>

              <button
                onClick={() => setStep("amount")}
                className="mt-8 text-sm text-cyan-400 hover:underline"
              >
                Continue without advisor →
              </button>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === "amount" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto mt-12 bg-[#0F172A]/80 border border-[#1E293B]/60 rounded-xl p-10"
            >
              {requestStatus === "submitted" ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-green-300">
                    Request Submitted
                  </h3>
                  <p className="text-gray-400 mt-2">
                    Our team will contact you shortly.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold mb-6 text-center">
                    Enter Investment Amount
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 text-center">
                    Available balance: ${balance.toLocaleString()}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <input
                      type="number"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      placeholder="Minimum $50,000"
                      className="flex-1 bg-[#0F172A] border border-[#334155] rounded-xl px-5 py-4 text-white"
                    />
                    <div className="w-full sm:w-32 flex items-center justify-center bg-[#1E293B] rounded-xl">
                      USDT
                    </div>
                  </div>

                  <button
                    onClick={submitRequest}
                    disabled={Number(requestAmount) < 50000 || balance < Number(requestAmount)}
                    className="w-full py-5 bg-cyan-500 text-black font-bold rounded-xl disabled:opacity-50"
                  >
                    Confirm Portfolio Management
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // HAS PORTFOLIO → DASHBOARD (UNCHANGED)
  // ─────────────────────────────────────────────

  // (Your existing dashboard code continues here unchanged)

  // ── Has portfolio → dashboard ──
  const allocationData = [
    { name: "Crypto", value: portfolio.crypto_percent || 0, color: "#0AEFFF" },
    { name: "Equity", value: portfolio.equity_percent || 0, color: "#10B981" },
    { name: "Real Estate", value: portfolio.real_estate_percent || 0, color: "#8B5CF6" },
    { name: "Commodities", value: portfolio.commodities_percent || 0, color: "#F59E0B" },
    { name: "Bonds", value: portfolio.bonds_percent || 0, color: "#6B7280" },
  ].filter((a) => a.value > 0);

  const growthCurve = Array.from({ length: 7 }).map((_, i) => ({
    month: `M${i}`,
    value: portfolio.amount * (1 + (portfolio.performance_percent || 0) / 100) ** (i / 6),
  }));

  const performanceData = allocationData.map((a) => ({
    name: a.name,
    growth: portfolio.performance_percent || 0,
  }));

  return (
    <div className="min-h-screen text-white">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold text-center text-cyan-400"
      >
        Your Managed Portfolio
      </motion.h1>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
        <StatCard label="Amount Managed" value={`$${Number(portfolio.amount).toLocaleString()}`} color="cyan" />
        <StatCard
          label="Performance"
          value={`${portfolio.performance_percent >= 0 ? "+" : ""}${portfolio.performance_percent || 0}%`}
          color={portfolio.performance_percent >= 0 ? "green" : "red"}
        />
        <StatCard label="Last Updated" value={portfolio.updated_at || "—"} color="gray" wide />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
        <ChartCard title="Growth Projection">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={growthCurve}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0AEFFF" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0AEFFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155" }} />
              <Area type="monotone" dataKey="value" stroke="#0AEFFF" fill="url(#growthGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Current Allocation">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={allocationData.length > 0 ? allocationData : [{ name: "No data", value: 100, color: "#334155" }]}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={75}
                >
                  {(allocationData.length > 0 ? allocationData : [{ color: "#334155" }]).map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {allocationData.length > 0 ? (
              <div className="space-y-2 text-sm">
                {allocationData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between gap-6 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </div>
                    <span className="text-gray-400 font-medium">{entry.value}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Allocation data will appear here</p>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Returns by Asset */}
      <ChartCard title="Performance by Asset Class" className="max-w-5xl mx-auto">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={performanceData}>
            <CartesianGrid stroke="#334155" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
            <YAxis stroke="#64748B" fontSize={12} />
            <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155" }} />
            <Bar dataKey="growth" fill="#0AEFFF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Trust badges */}
      <div className="flex justify-center gap-10 md:gap-16 pt-6 text-center">
        <TrustBadge icon={ShieldCheck} label="Secure" />
        <TrustBadge icon={Lock} label="Protected" />
        <TrustBadge icon={TrendingUp} label="Growing" />
      </div>
    </div>
  );
}

// ── Reusable components ──
function StatCard({ label, value, color = "gray", wide = false }: {
  label: string;
  value: string;
  color?: "cyan" | "green" | "red" | "gray";
  wide?: boolean;
}) {
  const colors = {
    cyan: "text-cyan-400",
    green: "text-green-400",
    red: "text-red-400",
    gray: "text-gray-300",
  };

  return (
    <div className={`bg-[#0F172A]/80 backdrop-blur-sm border border-[#1E293B]/60 p-5 rounded-xl text-center ${wide ? "col-span-2 sm:col-span-3 lg:col-span-4" : ""}`}>
      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children, className = "" }: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-[#0F172A]/80 backdrop-blur-sm border border-[#1E293B]/60 p-6 rounded-xl ${className}`}>
      <h3 className="text-base font-semibold text-cyan-400 mb-5">{title}</h3>
      {children}
    </div>
  );
}

function TrustBadge({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Icon className="w-7 h-7 text-cyan-400" />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
