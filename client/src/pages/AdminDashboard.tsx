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
import AdminTrades from "@/components/AdminTrades";   // ← IMPORTED
import AdminSettings from "@/admin/AdminSettings";
import { apiRequest } from "@/api/http";
import AdminLearning from "@/admin/AdminLearning";

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

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState<AdminTab>("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalInvested: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const handleNavigate = (key: string) => {
    setActive(key as AdminTab);
    setCollapsed(true);
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError(null);
      const res = await apiRequest("/admin/stats");
      if (res.success && res.stats) {
        setStats({
          totalUsers: Number(res.stats.totalUsers ?? 0),
          totalBalance: Number(res.stats.totalBalance ?? 0),
          totalInvested: Number(res.stats.totalInvested ?? 0),
        });
      } else {
        setStatsError(res.error || "Failed to fetch stats");
      }
      setLoadingStats(false);
    };
    fetchStats();
  }, []);

  const renderContent = () => {
    switch (active) {
      case "overview":
        if (loadingStats) return <p className="text-gray-400">Loading stats...</p>;
        if (statsError) return <p className="text-red-500">{statsError}</p>;
        return (
          <StatsCards
            balance={stats.totalBalance}
            performance={`Users: ${stats.totalUsers} • Invested: $${stats.totalInvested.toFixed(2)}`}
          />
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
      <AdminSidebar collapsed={collapsed} active={active} onNavigate={handleNavigate} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        <Topbar active={active} onCollapse={() => setCollapsed((c) => !c)} />
        <main className="p-6 space-y-6">
          <h2 className="text-3xl font-bold text-cyan-400">Admin Dashboard</h2>
          {renderContent()}
          <div className="text-center py-6 text-sm text-gray-400">
            © {new Date().getFullYear()} 77KAPITAL • Admin Panel
          </div>
        </main>
      </div>
    </div>
  );
}