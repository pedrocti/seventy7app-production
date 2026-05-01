// client/src/pages/AdminDashboard.tsx
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
import AdminLearning from "@/admin/AdminLearning";
import { ApiResponse, apiRequest } from "@/api/http";

import { motion } from "framer-motion";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from "chart.js";
import "chartjs-chart-financial";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Title, Tooltip, Legend, CandlestickController, CandlestickElement);

// -----------------
// Types
// -----------------
type AdminTab = "overview" | "users" | "transactions" | "portfolio" | "invest" | "mentorship" | "plans" | "trades" | "learning" | "settings";

type AdminStats = {
  totalUsers: number;
  mainBalance: number;        // Users balance + bonus
  investmentBalance: number;  // Active investments
  programsBalance: number;
  mentorshipBalance: number;
  portfolioBalance: number;
  totalBalance: number;
  totalInvested: number;
};

type AdminStatsResponse = {
  success: boolean;
  stats?: AdminStats;
  error?: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};

// -----------------
// Component
// -----------------
export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState<AdminTab>("overview");

  const [stats, setStats] = useState<AdminStats>({
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

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // -----------------
  // Helpers
  // -----------------
  function isError<T>(res: ApiResponse<T>): res is { success: false; error: string } {
    return res.success === false;
  }

  // -----------------
  // Fetch current admin user
  // -----------------
  const fetchUser = async () => {
    setLoadingUser(true);
    try {
      const res = await apiRequest<{ user: User }>("/auth/me");
      if (isError(res)) setUser(null);
      else setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // -----------------
  // Fetch admin stats
  // -----------------
  const fetchStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = (await apiRequest<AdminStatsResponse>("/admin/stats")) as AdminStatsResponse;

      if (res.success && res.stats) {
        setStats({
          totalUsers: res.stats.totalUsers,
          mainBalance: res.stats.mainBalance,
          investmentBalance: res.stats.investmentBalance,
          programsBalance: res.stats.programsBalance,
          mentorshipBalance: res.stats.mentorshipBalance,
          portfolioBalance: res.stats.portfolioBalance,
          totalBalance: res.stats.totalBalance,
          totalInvested: res.stats.totalInvested,
        });
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

  // -----------------
  // Trend Data State
  // -----------------
  type TrendData = {
    labels: string[];
    data: number[];
  };

  const [trend, setTrend] = useState<TrendData>({ labels: [], data: [] });
  const [loadingTrend, setLoadingTrend] = useState(true);

  // -----------------
  // Fetch Trend Data
  // -----------------
  const fetchTrend = async () => {
    setLoadingTrend(true);
    try {
      const res = await apiRequest<{ success: boolean; labels: string[]; data: number[] }>("/admin/stats/trend");
      if (res.success) setTrend({ labels: res.labels, data: res.data });
      else setTrend({ labels: [], data: [] });
    } catch (err) {
      console.error("Trend fetch error:", err);
      setTrend({ labels: [], data: [] });
    } finally {
      setLoadingTrend(false);
    }
  };

  // -----------------
  // Lifecycle
  // -----------------
  useEffect(() => {
    fetchUser();
    fetchStats();
    fetchTrend();
  }, []);

  // -----------------
  // Navigation
  // -----------------
  const handleNavigate = (key: string) => {
    setActive(key as AdminTab);
    setCollapsed(true);
  };

  // -----------------
  // Render Content
  // -----------------
  const renderContent = () => {
    if (active === "overview") {
      if (loadingStats || loadingUser) return <p className="text-gray-400">Loading stats...</p>;
      if (statsError) return <p className="text-red-500">{statsError}</p>;

      // Prepare specialized balance cards
      const balanceCards = [
        { title: "Main Balance", value: stats.mainBalance },
        { title: "Investment Balance", value: stats.investmentBalance },
        { title: "Programs Balance", value: stats.programsBalance },
        { title: "Mentorship Balance", value: stats.mentorshipBalance },
        { title: "Portfolio Balance", value: stats.portfolioBalance },
      ];

      return (
        <motion.div key={`overview-${stats.totalBalance}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-10">
          <StatsCards
            balance={stats.mainBalance}
            bonus={0}
            totalAvailable={stats.totalBalance}
            performance={`Users: ${stats.totalUsers} • Invested: $${stats.totalInvested.toFixed(2)}`}
            username={user?.username || "Admin"}
          />

          <button
            onClick={fetchStats}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
          >
            Refresh Stats
          </button>

          <div className="bg-[#0F172A]/90 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-[#0AEFFF]/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-cyan-400">Balance Performance Trend</h3>
              <span className="text-sm text-gray-400">Last 6 months</span>
            </div>
            <div className="h-64 md:h-80">
              {loadingTrend ? (
                <p className="text-gray-400 text-center py-20">Loading chart...</p>
              ) : (
                <Line
                  data={{
                    labels: trend.labels,
                    datasets: [
                      {
                        label: "Total Balance Growth",
                        data: trend.data,
                        borderColor: "#0AEFFF",
                        backgroundColor: "rgba(10,239,255,0.2)",
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
                  }}
                />
              )}
            </div>


            {/* Specialized balances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {balanceCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="p-6 bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-lg hover:shadow-[#0AEFFF]/30 transition-all duration-300 border border-[#0AEFFF]/20 text-center"
                >
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">{card.title}</h3>
                  <p className="text-3xl md:text-4xl font-bold text-white">${card.value.toFixed(2)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        );
        }

    switch (active) {
      case "users": return <AdminUsers />;
      case "transactions": return <div className="space-y-6"><h3 className="text-2xl font-bold text-white">All Pending Transactions (Admin View)</h3><TransactionsList /></div>;
      case "portfolio": return <AdminPortfolio />;
      case "invest": return <AdminInvestments />;
      case "mentorship": return <AdminMentorship />;
      case "plans": return <AdminPlans />;
      case "trades": return <AdminTrades />;
      case "learning": return <AdminLearning />;
      case "settings": return <AdminSettings />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#041026] to-[#071029] text-white flex">
      <AdminSidebar collapsed={collapsed} active={active} onNavigate={handleNavigate} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-64"}`}>
        <Topbar active={active} onCollapse={() => setCollapsed((c) => !c)} />
        <main className="p-6 space-y-6">
          <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-bold text-cyan-400">
            Admin Dashboard
          </motion.h2>
          {renderContent()}
          <div className="text-center py-6 text-sm text-gray-400">© {new Date().getFullYear()} 77KAPITAL • Admin Panel</div>
        </main>
      </div>
    </div>
  );
}
