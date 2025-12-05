// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatsCards from "@/components/StatsCards";
import OverviewPage from "@/dashboard/OverviewPage";
import PortfolioPage from "@/dashboard/PortfolioPage";
import InvestPage from "@/dashboard/InvestPage";
import TradesPage from "@/dashboard/TradesPage";
import MentorshipPage from "@/dashboard/MentorshipPage";
import LearningPage from "@/pages/Learning";
import DepositModal from "@/components/DepositModal";
import WithdrawalModal from "@/components/WithdrawalModal";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle, ArrowUpRight, TrendingUp, Copy, Check, Users, Gift } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/api/http";

// -----------------------------
// FIXED TYPES FOR API RESPONSES
// -----------------------------

type InvestmentsResponse =
  | { success: true; investments: any[] }
  | { success: false; error: any; status: number };

type OverviewResponse =
  | {
      success: true;
      totals: {
        total_invested: number;
        total_profit: number;
        portfolio_value: number;
        active_investments: number;
      };
    }
  | { success: false; error: any; status: number };

type ReferralsResponse =
  | { success: true; count: number }
  | { success: false; error: any; status: number };

export default function Dashboard() {
  const { user, token } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState<"overview" | "portfolio" | "invest" | "trades" | "mentorship" | "learning">("overview");

  const [showReferral, setShowReferral] = useState(false);
  const [copied, setCopied] = useState(false);

  const [referralCount, setReferralCount] = useState(0);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);

  // overview totals
  const [totals, setTotals] = useState({
    total_invested: 0,
    total_profit: 0,
    portfolio_value: 0,
    active_investments: 0,
  });

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || ""}`;

  // Balances
  const mainBalanceNum = Number(user?.balance ?? 0);
  const bonusBalanceNum = Number(user?.bonus_balance ?? 0);

  const totalAvailableNum =
    mainBalanceNum +
    bonusBalanceNum +
    Number(totals.total_invested) +
    Number(totals.total_profit);

  const mainBalance = mainBalanceNum.toFixed(2);
  const bonusBalance = bonusBalanceNum.toFixed(2);
  const totalAvailable = totalAvailableNum.toFixed(2);

  const performance = (() => {
    const pv = totals.portfolio_value;
    const tp = totals.total_profit;
    if (pv <= 0 || pv - tp <= 0) return "0%";
    const pct = (tp / Math.max(1, pv - tp)) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  })();

  // ----------------------------------
  // FETCH INVESTMENTS (FULLY FIXED)
  // ----------------------------------
  useEffect(() => {
    if (!token) {
      setLoadingInvestments(false);
      return;
    }

    const fetchInvestments = async () => {
      try {
        const data = (await apiRequest("/investments", {
          headers: { Authorization: `Bearer ${token}` },
        })) as InvestmentsResponse;

        if (data.success) {
          setInvestments(data.investments || []);
        } else {
          setInvestments([]);
        }
      } catch (err) {
        setInvestments([]);
        console.error("Investments load failed:", err);
      } finally {
        setLoadingInvestments(false);
      }
    };

    fetchInvestments();
  }, [token]);

  // ----------------------------------
  // FETCH OVERVIEW & REFERRALS (FIXED)
  // ----------------------------------
  useEffect(() => {
    if (!token) return;

    const loadOverview = async () => {
      try {
        const data = (await apiRequest("/user/overview", {
          headers: { Authorization: `Bearer ${token}` },
        })) as OverviewResponse;

        if (data.success) {
          setTotals({
            total_invested: Number(data.totals.total_invested),
            total_profit: Number(data.totals.total_profit),
            portfolio_value: Number(data.totals.portfolio_value),
            active_investments: Number(data.totals.active_investments),
          });
        }
      } catch (err) {
        console.error("Overview load failed:", err);
      }
    };

    const loadReferrals = async () => {
      try {
        const data = (await apiRequest("/user/referrals", {
          headers: { Authorization: `Bearer ${token}` },
        })) as ReferralsResponse;

        setReferralCount(data.success ? data.count : 0);
      } catch (err) {
        setReferralCount(0);
      }
    };

    loadOverview();
    loadReferrals();
  }, [token]);

  // ----------------------------------
  // COPY REFERRAL LINK
  // ----------------------------------
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigate = (key: string) => {
    if (key === "toggle") return setCollapsed((c) => !c);
    if (key === "profile") return setShowReferral(true);
    setActive(key as any);
    setCollapsed(true);
  };

  if (loadingInvestments) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#EAECEF] bg-[#0B0E11]">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-[#0B0E11] to-[#181A20] text-[#EAECEF]">
      <Sidebar collapsed={collapsed} active={active} onNavigate={handleNavigate} />

      <div className="flex-1 flex flex-col">
        <Topbar
          active={active}
          onCollapse={() => setCollapsed((c) => !c)}
          onProfileClick={() => setShowReferral(true)}
        />

        {/* Referral Modal */}
        {showReferral && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowReferral(false)}
          >
            <div
              className="relative w-full max-w-2xl bg-[#181A20] rounded-3xl border border-[#2B3139] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-[#848E9C] hover:text-[#EAECEF] text-4xl z-10"
                onClick={() => setShowReferral(false)}
              >
                ×
              </button>

              <div className="p-10 text-center space-y-8">
                <h2 className="text-4xl font-bold text-[#F0B90B]">Referral Center</h2>
                <p className="text-[#848E9C] mt-2">
                  Earn 10% bonus when friends make their first deposit!
                </p>

                <div>
                  <p className="text-sm text-[#848E9C] uppercase tracking-wider">Your Code</p>
                  <p className="text-6xl font-bold text-[#F0B90B] tracking-widest">
                    {user?.referral_code || "------"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-[#1E2027] rounded-2xl p-6 border border-[#2B3139]">
                    <Users className="h-10 w-10 text-[#F0B90B] mx-auto mb-2" />
                    <p className="text-3xl font-bold">{referralCount}</p>
                    <p className="text-[#848E9C] text-sm">Referred</p>
                  </div>

                  <div className="bg-[#1E2027] rounded-2xl p-6 border border-[#0ECB81]/40">
                    <Gift className="h-10 w-10 text-[#0ECB81] mx-auto mb-2" />
                    <p className="text-3xl font-bold">${bonusBalance}</p>
                    <p className="text-[#848E9C] text-sm">Bonus Earned</p>
                  </div>

                  <div className="bg-[#1E2027] rounded-2xl p-6 border border-[#F0B90B]/30">
                    <p className="text-3xl font-bold text-[#F0B90B]">10%</p>
                    <p className="text-[#848E9C] text-sm">Reward Rate</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[#848E9C] mb-3">Share Your Link</p>
                  <div className="flex gap-3 max-w-lg mx-auto">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 px-5 py-4 bg-[#181A20] rounded-xl border border-[#2B3139] text-sm font-mono text-[#EAECEF] break-all"
                    />

                    <Button
                      onClick={copyReferralLink}
                      size="lg"
                      className={cn(
                        "px-8 font-bold",
                        copied
                          ? "bg-[#0ECB81]"
                          : "bg-[#F0B90B] hover:bg-[#d9a40a] text-black"
                      )}
                    >
                      {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="p-6 space-y-8">
          {active === "overview" && (
            <>
              <StatsCards
                balance={mainBalance}
                bonus={bonusBalance}
                totalAvailable={totalAvailable}
                performance={performance}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
                <Button
                  onClick={() => setDepositOpen(true)}
                  size="lg"
                  className="bg-[#F0B90B] hover:bg-[#d9a40a] text-black font-bold justify-start"
                >
                  <ArrowDownCircle className="mr-3 h-6 w-6" /> Deposit
                </Button>

                <Button
                  onClick={() => setWithdrawalOpen(true)}
                  size="lg"
                  variant="outline"
                  className="border-[#0ECB81] text-[#0ECB81] hover:bg-[#0ECB81]/20 font-bold justify-start"
                >
                  <ArrowUpRight className="mr-3 h-6 w-6" /> Withdraw
                </Button>

                <Button
                  onClick={() => handleNavigate("trades")}
                  size="lg"
                  variant="outline"
                  className="border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B]/20 font-bold justify-start"
                >
                  <TrendingUp className="mr-3 h-6 w-6" /> View Trades
                </Button>

                <Button
                  onClick={() => handleNavigate("invest")}
                  size="lg"
                  variant="outline"
                  className="border-[#0ECB81] text-[#0ECB81] hover:bg-[#0ECB81]/20 font-bold justify-start"
                >
                  Invest Now
                </Button>
              </div>

              <OverviewPage />
            </>
          )}

          {active === "portfolio" && <PortfolioPage />}
          {active === "invest" && <InvestPage />}
          {active === "trades" && <TradesPage />}
          {active === "mentorship" && <MentorshipPage />}
          {active === "learning" && <LearningPage />}
        </main>

        <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
        <WithdrawalModal isOpen={withdrawalOpen} onClose={() => setWithdrawalOpen(false)} />
      </div>
    </div>
  );
}
