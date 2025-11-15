import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";

import AdminSidebar from "@/components/AdminSidebar";
import Topbar from "@/components/Topbar";

import StatsCards from "@/components/StatsCards";
import AdminUsers from "@/components/AdminUsers";
import AdminTransactions from "@/components/AdminTransactions";
import AdminPortfolio from "@/components/AdminPortfolio";
import AdminInvestments from "@/components/AdminInvestments";

type AdminTab =
  | "overview"
  | "users"
  | "transactions"
  | "portfolio"
  | "invest"
  | "mentorship";

export default function AdminDashboard() {
  const { token } = useAuth();

  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState<AdminTab>("overview");

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalInvested: 0,
  });

  const handleNavigate = (key: string) => {
    setActive(key as AdminTab);
    setCollapsed(true);
  };

  useEffect(() => {
    if (!token) return;

    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        setStats({
          totalUsers: data.totalUsers ?? 0,
          totalBalance: data.totalBalance ?? 0,
          totalInvested: data.totalInvested ?? 0,
        });
      })
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, [token]);

  const renderContent = () => {
    switch (active) {
      case "overview":
        return (
          <StatsCards
            balance={stats.totalBalance}
            performance={`Users: ${stats.totalUsers} • Invested: ${stats.totalInvested}`}
          />
        );
      case "users":
        return <AdminUsers />;
      case "transactions":
        return <AdminTransactions />;
      case "portfolio":
        return <AdminPortfolio />;
      case "invest":
        return <AdminInvestments />;
      case "mentorship":
        return <div className="text-gray-400">Mentorship Panel Coming Soon…</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#041026] to-[#071029] text-white flex">

      {/* SIDEBAR */}
      <AdminSidebar
        collapsed={collapsed}
        active={active}
        onNavigate={handleNavigate}
      />

      {/* MAIN CONTENT */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        <Topbar active={active} onCollapse={() => setCollapsed((c) => !c)} />

        <main className="p-6 space-y-6">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          {renderContent()}

          <div className="text-center py-6 text-sm text-gray-400">
            © {new Date().getFullYear()} 77KAPITAL • Admin Panel
          </div>
        </main>
      </div>
    </div>
  );
}
