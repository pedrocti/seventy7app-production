import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatsCards from "@/components/StatsCards";
import QuickActions from "@/components/QuickActions";
import InvestmentsList from "@/components/InvestmentsList";
import PortfolioRequestCard from "@/components/PortfolioRequestCard";
import ChartArea from "@/components/ChartArea";
import { mockBalances, mockAllocation, COLORS } from "@/data/mockData";

// Dashboard pages
import OverviewPage from "@/dashboard/OverviewPage";
import PortfolioPage from "@/dashboard/PortfolioPage";
import InvestPage from "@/dashboard/InvestPage";
import TradesPage from "@/dashboard/TradesPage";
import MentorshipPage from "@/dashboard/MentorshipPage";

export default function Dashboard() {
  const { user } = useAuth();

  // Sidebar collapsed state
  const [collapsed, setCollapsed] = useState(true);

  // Active dashboard page
  const [active, setActive] = useState<
    "overview" | "portfolio" | "invest" | "trades" | "mentorship"
  >("overview");

  // Sample investments
  const [investments, setInvestments] = useState([
    { id: "INV-1001", plan: "Growth", amount: 500, start_at: new Date().toISOString(), status: "active", progress: 8 },
    { id: "INV-1002", plan: "Stable", amount: 1200, start_at: new Date().toISOString(), status: "active", progress: 2 },
    { id: "INV-1003", plan: "Aggressive", amount: 250, start_at: new Date().toISOString(), status: -4, progress: -4 },
  ]);

  // Wrapped navigation handler for Sidebar
  const handleNavigate = (key: string) => {
    if (key === "toggle") {
      setCollapsed((prev) => !prev);
      return;
    }

    setActive(key as any);

    // Auto-close sidebar on mobile
    setCollapsed(true);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-[#041026] to-[#071029] text-white relative">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} active={active} onNavigate={handleNavigate} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Topbar active={active} onCollapse={() => setCollapsed((c) => !c)} />

        <main className="p-6 space-y-6">
          {active === "overview" && (
            <>
              <StatsCards balance={user?.balance ?? 0} performance="+12.8%" />

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left side */}
                <div className="space-y-4">
                  <div className="rounded-2xl p-4 bg-[#0F172A]/60 border border-[#1E293B]/40">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-300">Portfolio Value</span>
                      <span className="text-xs text-gray-400">Last 6 months</span>
                    </div>
                    <ChartArea data={mockBalances} />
                  </div>

                  <QuickActions />
                </div>

                {/* Right side */}
                <div className="space-y-4">
                  <div className="rounded-2xl p-4 bg-[#0F172A]/60 border border-[#1E293B]/40">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-300">Active Investments</span>
                      <span className="text-xs text-gray-400">Summary</span>
                    </div>
                    <InvestmentsList investments={investments} />
                  </div>

                  <PortfolioRequestCard allocation={mockAllocation} colors={COLORS} />
                </div>
              </div>

              {/* Overview Subpage */}
              <OverviewPage />
            </>
          )}

          {active === "portfolio" && <PortfolioPage />}
          {active === "invest" && <InvestPage />}
          {active === "trades" && <TradesPage />}
          {active === "mentorship" && <MentorshipPage />}

          <div className="text-center py-6 text-sm text-gray-400">
            © {new Date().getFullYear()} 77KAPITAL • Premium Trading Experience
          </div>
        </main>
      </div>
    </div>
  );
}
