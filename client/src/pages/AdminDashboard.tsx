import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import Topbar from "@/components/Topbar";
import StatsCards from "@/components/StatsCards";
import AdminUsers from "@/components/AdminUsers";
import TransactionsList from "@/components/TransactionsList";
import AdminPortfolio from "@/components/AdminPortfolio";
import AdminInvestments from "@/components/AdminInvestments";
import AdminMentorship from "@/components/AdminMentorship";
import AdminPlans from "@/components/AdminPlans";
import AdminTrades from "@/components/AdminTrades";
import AdminSettings from "@/admin/AdminSettings";
import { apiRequest } from "@/api/http";
import AdminLearning from "@/admin/AdminLearning";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-chart-financial"; // registers candlestick support
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";

// Register Chart.js components once (top-level)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

/* =========================
   TYPES
   ========================= */
type AdminTab =
  | "overview"
  | "users"
  | "transactions"
  | "portfolio"
  | "invest"
  | "mentorship"
  | "plans"
  | "trades"
  | "learning"
  | "settings";

type AdminStatsResponse = {
  success: boolean;
  stats?: {
    totalUsers: number;
    mainBalance: number;
    investmentBalance: number;
    programsBalance: number;
    mentorshipBalance: number;
    portfolioBalance: number;
    totalBalance: number;
    totalInvested: number;
  };
  error?: string;
};

/* =========================
   COMPONENT
   ========================= */
export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState<AdminTab>("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    mainBalance: 0,
    investmentBalance: 0,
    programsBalance: 0,
    mentorshipBalance: 0,
    portfolioBalance: 0,
    totalBalance: 0,
    totalInvested: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const handleNavigate = (key: string) => {
    setActive(key as AdminTab);
    setCollapsed(true);
  };

  /* =========================
     FETCH STATS
     ========================= */
  const fetchStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = (await apiRequest("/admin/stats")) as AdminStatsResponse;
      console.log("API response from /admin/stats:", res); // Debug: raw backend response
      if (res.success && res.stats) {
        const newStats = {
          totalUsers: Number(res.stats.totalUsers ?? 0),
          mainBalance: Number(res.stats.mainBalance ?? 0),
          investmentBalance: Number(res.stats.investmentBalance ?? 0),
          programsBalance: Number(res.stats.programsBalance ?? 0),
          mentorshipBalance: Number(res.stats.mentorshipBalance ?? 0),
          portfolioBalance: Number(res.stats.portfolioBalance ?? 0),
          totalBalance: Number(res.stats.totalBalance ?? 0),
          totalInvested: Number(res.stats.totalInvested ?? 0),
        };
        console.log("Setting fresh stats:", newStats); // Debug: what is being set
        setStats(newStats);
      } else {
        setStatsError(res.error || "Failed to fetch stats");
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
      setStatsError("Network error fetching stats");
    } finally {
      setLoadingStats(false);
    }
  };

  // Force reset on mount + run fetch
  useEffect(() => {
    console.log("AdminDashboard mounted - resetting stats to zero and fetching fresh");
    setStats({
      totalUsers: 0,
      mainBalance: 0,
      investmentBalance: 0,
      programsBalance: 0,
      mentorshipBalance: 0,
      portfolioBalance: 0,
      totalBalance: 0,
      totalInvested: 0,
    });
    fetchStats();
  }, []); // empty deps = run once on mount

  // Run once on mount
  useEffect(() => {
    fetchStats();
  }, []);

  /* =========================
     RENDER CONTENT
     ========================= */
  const renderContent = () => {
    switch (active) {
      case "overview":
        if (loadingStats) return <p className="text-gray-400">Loading stats...</p>;
        if (statsError) return <p className="text-red-500">{statsError}</p>;

        // Debug: log state at render time
        console.log("Overview rendering with current stats:", stats);

        return (
          <motion.div
            key={`overview-stats-${stats.mainBalance}-${stats.totalBalance}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {/* Hero Stats Cards */}
            <StatsCards
              balance={stats.mainBalance}
              bonus={0}
              totalAvailable={stats.totalBalance}
              performance={`Users: ${stats.totalUsers} • Invested: $${stats.totalInvested.toFixed(2)}`}
            />

            {/* Refresh button */}
            <button
              onClick={() => {
                console.log("Refresh button clicked - forcing fetch");
                fetchStats();
              }}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Refresh Stats
            </button>

            {/* Performance Trend Chart */}
            <div className="bg-[#0F172A]/90 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-[#0AEFFF]/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-cyan-400">Balance Performance Trend</h3>
                <span className="text-sm text-gray-400">Last 6 months</span>
              </div>
              <div className="h-64 md:h-80">
                <Line
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    datasets: [
                      {
                        label: "Total Balance Growth",
                        data: [1000, 1300, 1700, 2200, 2800, 3500],
                        borderColor: "#0AEFFF",
                        backgroundColor: "rgba(10, 239, 255, 0.2)",
                        tension: 0.4,
                        pointBackgroundColor: "#0AEFFF",
                        pointBorderColor: "#fff",
                        pointHoverRadius: 8,
                        pointRadius: 5,
                        borderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top", labels: { color: "#e5e7eb" } },
                      title: { display: true, text: "Rising Trend", color: "#e5e7eb" },
                    },
                    scales: {
                      x: { grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#9ca3af" } },
                      y: { grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#9ca3af" } },
                    },
                    elements: {
                      line: {
                        tension: 0.4,
                        borderWidth: 3,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Specialized Balances - clean grid below chart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
              {[
                { title: "Main Balance", value: stats.mainBalance },
                { title: "Investment Balance", value: stats.investmentBalance },
                { title: "Programs Balance", value: stats.programsBalance },
                { title: "Mentorship Balance", value: stats.mentorshipBalance },
                { title: "Portfolio Balance", value: stats.portfolioBalance },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="p-6 bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-lg hover:shadow-[#0AEFFF]/30 transition-all duration-300 border border-[#0AEFFF]/20 text-center"
                >
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">{item.title}</h3>
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    ${item.value.toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case "users":
        return <AdminUsers />;

      case "transactions":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">
              All Pending Transactions (Admin View)
            </h3>
            <TransactionsList />
          </div>
        );

      case "portfolio":
        return <AdminPortfolio />;

      case "invest":
        return <AdminInvestments />;

      case "mentorship":
        return <AdminMentorship />;

      case "plans":
        return <AdminPlans />;

      case "trades":
        return <AdminTrades />;

      case "learning":
        return <AdminLearning />;

      case "settings":
        return <AdminSettings />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#041026] to-[#071029] text-white flex">
      <AdminSidebar
        collapsed={collapsed}
        active={active}
        onNavigate={handleNavigate}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        <Topbar
          active={active}
          onCollapse={() => setCollapsed((c) => !c)}
        />
        <main className="p-6 space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-cyan-400"
          >
            Admin Dashboard
          </motion.h2>
          {renderContent()}
          <div className="text-center py-6 text-sm text-gray-400">
            © {new Date().getFullYear()} 77KAPITAL • Admin Panel
          </div>
        </main>
      </div>
    </div>
  );
}