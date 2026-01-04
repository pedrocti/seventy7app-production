// client/src/pages/Dashboard.tsx
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
import DepositModal from "@/components/DepositModal";
import WithdrawalModal from "@/components/WithdrawalModal";
import LearningPage from "@/pages/Learning";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle, ArrowUpRight, TrendingUp, Copy, Check, Users, Gift } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/api/http";
import { format } from "date-fns";

// FIXED TYPES FOR API RESPONSES
type InvestmentsResponse =
  | { success: true; investments: any[] }
  | { success: false; error: any; status: number };
type OverviewResponse =
  | {
      success: true;
      totals: {
        main_balance: number;
        bonus_balance: number;
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
  // UI state
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState<
    "overview" | "portfolio" | "invest" | "trades" | "mentorship" | "learning"
  >("overview");
  // data state
  const [referralCount, setReferralCount] = useState(0);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // modals
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  // referral UI
  const [showReferral, setShowReferral] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modalTab, setModalTab] = useState<"profile" | "referrals">("profile");
  // overview totals from /api/user/overview
  const [totals, setTotals] = useState({
    main_balance: 0,
    bonus_balance: 0,
    total_invested: 0,
    total_profit: 0,
    portfolio_value: 0,
    active_investments: 0,
  });

  const formatCurrency = (value: any): string => {
    if (value == null || value === "" || String(value).trim() === "" || String(value) === "NaN") {
      return "0.00";
    }
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const balanceRaw = Number(totals.main_balance ?? 0);
  const bonusRaw = Number(totals.bonus_balance ?? 0);
  const totalInvestedRaw = Number(totals.total_invested ?? 0) || 0;
  const totalProfitRaw = Number(totals.total_profit ?? 0) || 0;
  const mainBalanceNum = balanceRaw;
  const bonusBalanceNum = bonusRaw;
  const totalAvailableNum = balanceRaw + bonusRaw + totalInvestedRaw + totalProfitRaw;

  const performance = (() => {
    if (totalInvestedRaw <= 0) return "0%";
    const pct = (totalProfitRaw / totalInvestedRaw) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  })();

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || ""}`;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const loadAll = async () => {
      setLoading(true);
      try {
        const [invRes, overviewRes, refRes] = await Promise.allSettled([
          apiRequest("/investments", {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
          apiRequest("/user/overview", {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
          apiRequest("/user/referrals", {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
        ]);
        if (cancelled) return;

        if (invRes.status === "fulfilled") {
          const data = invRes.value as InvestmentsResponse;
          if (data.success) setInvestments(data.investments || []);
          else setInvestments([]);
        } else {
          console.error("Investments load failed:", invRes.reason);
          setInvestments([]);
        }

        if (overviewRes.status === "fulfilled") {
          const data = overviewRes.value as OverviewResponse;
          if (data.success) {
            setTotals({
              main_balance: Number(data.totals.main_balance ?? user?.balance ?? 0),
              bonus_balance: Number(data.totals.bonus_balance ?? user?.bonus_balance ?? 0),
              total_invested: Number(data.totals.total_invested ?? 0),
              total_profit: Number(data.totals.total_profit ?? 0),
              portfolio_value: Number(data.totals.portfolio_value ?? 0),
              active_investments: Number(data.totals.active_investments ?? 0),
            });
          }
        } else {
          console.error("Overview load failed:", overviewRes.reason);
        }

        if (refRes.status === "fulfilled") {
          const data = refRes.value as ReferralsResponse;
          setReferralCount(data.success ? data.count : 0);
        } else {
          console.error("Referrals load failed:", refRes.reason);
          setReferralCount(0);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Dashboard load error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadAll();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [token]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigate = (key: string) => {
    if (key === "toggle") {
      setCollapsed((c) => !c);
      return;
    }
    if (key === "profile") {
      setShowReferral(true);
      return;
    }
    if (key === "learning") {
      setActive("learning");
      return;
    }
    setActive(key as any);
    setCollapsed(true);
  };

  if (loading) {
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
          onProfileClick={() => {
            setShowReferral(true);
            setModalTab("profile");
          }}
        />

        {/* ── Combined Profile + Referrals Modal ── */}
        {showReferral && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onPointerDown={() => setShowReferral(false)}
          >
            <div
              className="relative w-full max-w-3xl bg-[#181A20] rounded-3xl border border-[#2B3139] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* Header with tabs */}
              <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-[#2B3139]">
                <h2 className="text-3xl font-bold text-[#0AEFFF]">Account & Referrals</h2>
                <button
                  className="text-[#848E9C] hover:text-[#EAECEF] text-3xl"
                  onClick={() => setShowReferral(false)}
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#2B3139]">
                <button
                  className={cn(
                    "flex-1 py-4 text-center font-medium transition-colors",
                    modalTab === "profile"
                      ? "text-[#0AEFFF] border-b-2 border-[#0AEFFF]"
                      : "text-[#848E9C] hover:text-[#EAECEF]"
                  )}
                  onClick={() => setModalTab("profile")}
                >
                  Profile
                </button>
                <button
                  className={cn(
                    "flex-1 py-4 text-center font-medium transition-colors",
                    modalTab === "referrals"
                      ? "text-[#0ECB81] border-b-2 border-[#0ECB81]"
                      : "text-[#848E9C] hover:text-[#EAECEF]"
                  )}
                  onClick={() => setModalTab("referrals")}
                >
                  Referrals
                </button>
              </div>

              {/* Tab content */}
              <div className="p-8 space-y-8">
                {modalTab === "profile" ? (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0AEFFF] to-[#00D4FF] mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-black">
                        {user?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                      <h3 className="text-2xl font-bold">{user?.username || "User"}</h3>
                      <p className="text-[#848E9C]">{user?.email || "No email"}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-[#1E2027] rounded-2xl p-6 border border-[#2B3139]">
                        <p className="text-sm text-[#848E9C] mb-1">Main Balance</p>
                        <p className="text-3xl font-bold">${formatCurrency(totals.main_balance)}</p>
                      </div>
                      <div className="bg-[#1E2027] rounded-2xl p-6 border border-[#2B3139]">
                        <p className="text-sm text-[#848E9C] mb-1">Bonus Balance</p>
                        <p className="text-3xl font-bold text-[#0ECB81]">
                          ${formatCurrency(totals.bonus_balance)}
                        </p>
                      </div>
                      <div className="bg-[#1E2027] rounded-2xl p-6 border border-[#2B3139]">
                        <p className="text-sm text-[#848E9C] mb-1">Portfolio Value</p>
                        <p className="text-3xl font-bold">${formatCurrency(totals.portfolio_value)}</p>
                      </div>
                      <div className="bg-[#1E2027] rounded-2xl p-6 border border-[#2B3139]">
                        <p className="text-sm text-[#848E9C] mb-1">Joined</p>
                        <p className="text-xl font-medium">
                          {user?.created_at 
                            ? format(new Date(user.created_at), "MMM d, yyyy")
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Button
                        variant="outline"
                        className="border-[#0AEFFF] text-[#0AEFFF] hover:bg-[#0AEFFF]/10"
                        onClick={() => {
                          toast.info("Profile editing coming soon!");
                        }}
                      >
                        Edit Profile / Settings
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-[#0ECB81]">Referral Program</h3>
                      <p className="text-[#848E9C] mt-2">
                        Earn 10% bonus on your friends' first deposit!
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#1E2027] rounded-2xl p-6 border border-[#2B3139] text-center">
                        <Users className="h-10 w-10 text-[#0AEFFF] mx-auto mb-3" />
                        <p className="text-4xl font-bold">{referralCount}</p>
                        <p className="text-[#848E9C] mt-1">Referred Users</p>
                      </div>
                      <div className="bg-[#1E2027] rounded-2xl p-6 border border-[#0ECB81]/40 text-center">
                        <Gift className="h-10 w-10 text-[#0ECB81] mx-auto mb-3" />
                        <p className="text-4xl font-bold text-[#0ECB81]">
                          ${formatCurrency(totals.bonus_balance)}
                        </p>
                        <p className="text-[#848E9C] mt-1">Bonus Earned</p>
                      </div>
                      <div className="bg-[#1E2027] rounded-2xl p-6 border border-[#0AEFFF]/30 text-center">
                        <TrendingUp className="h-10 w-10 text-[#0AEFFF] mx-auto mb-3" />
                        <p className="text-4xl font-bold text-[#0AEFFF]">10%</p>
                        <p className="text-[#848E9C] mt-1">Reward Rate</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[#848E9C] mb-4 uppercase tracking-wider">
                        Your Referral Code
                      </p>
                      <div className="text-6xl font-mono font-bold text-[#0AEFFF] tracking-widest mb-6">
                        {user?.referral_code || "------"}
                      </div>
                      <div className="max-w-lg mx-auto">
                        <p className="text-sm text-[#848E9C] mb-3">Share Your Unique Link</p>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={referralLink}
                            readOnly
                            className="flex-1 px-5 py-4 bg-[#181A20] rounded-xl border border-[#2B3139] text-sm font-mono text-[#EAECEF] break-all"
                          />
                          <Button
                            onClick={copyReferralLink}
                            className={cn(
                              "px-8",
                              copied ? "bg-[#0ECB81]" : "bg-[#0AEFFF] hover:bg-[#00D4FF] text-black"
                            )}
                          >
                            {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                            {copied ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="p-6 space-y-8">
          {active === "overview" && (
            <>
              <StatsCards
                balance={mainBalanceNum}
                bonus={bonusBalanceNum}
                totalAvailable={totalAvailableNum}
                performance={performance}
              />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <button
                  onClick={() => setDepositOpen(true)}
                  className={`
                    group relative overflow-hidden
                    px-6 py-5 rounded-2xl
                    bg-white/5 backdrop-blur-xl
                    border border-[#0AEFFF]/40
                    text-[#0AEFFF] font-semibold text-lg
                    transition-all duration-300
                    hover:border-[#0AEFFF] hover:shadow-[0_0_25px_-5px_#0AEFFF]
                    hover:bg-[#0AEFFF]/5 hover:scale-[1.03]
                    focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50
                    flex items-center justify-center gap-3
                  `}
                >
                  <ArrowDownCircle className="h-6 w-6" />
                  Deposit
                </button>

                <button
                  onClick={() => setWithdrawalOpen(true)}
                  className={`
                    group relative overflow-hidden
                    px-6 py-5 rounded-2xl
                    bg-white/5 backdrop-blur-xl
                    border border-[#0AEFFF]/40
                    text-[#0AEFFF] font-semibold text-lg
                    transition-all duration-300
                    hover:border-[#0AEFFF] hover:shadow-[0_0_25px_-5px_#0AEFFF]
                    hover:bg-[#0AEFFF]/5 hover:scale-[1.03]
                    focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50
                    flex items-center justify-center gap-3
                  `}
                >
                  <ArrowUpRight className="h-6 w-6" />
                  Withdraw
                </button>

                <button
                  onClick={() => handleNavigate("trades")}
                  className={`
                    group relative overflow-hidden
                    px-6 py-5 rounded-2xl
                    bg-white/5 backdrop-blur-xl
                    border border-[#0AEFFF]/40
                    text-[#0AEFFF] font-semibold text-lg
                    transition-all duration-300
                    hover:border-[#0AEFFF] hover:shadow-[0_0_25px_-5px_#0AEFFF]
                    hover:bg-[#0AEFFF]/5 hover:scale-[1.03]
                    focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50
                    flex items-center justify-center gap-3
                  `}
                >
                  <TrendingUp className="h-6 w-6" />
                  View Trades
                </button>

                <button
                  onClick={() => handleNavigate("invest")}
                  className={`
                    group relative overflow-hidden
                    px-6 py-5 rounded-2xl
                    bg-white/5 backdrop-blur-xl
                    border border-[#0AEFFF]/40
                    text-[#0AEFFF] font-semibold text-lg
                    transition-all duration-300
                    hover:border-[#0AEFFF] hover:shadow-[0_0_25px_-5px_#0AEFFF]
                    hover:bg-[#0AEFFF]/5 hover:scale-[1.03]
                    focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50
                    flex items-center justify-center gap-3
                  `}
                >
                  Invest Now
                </button>
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