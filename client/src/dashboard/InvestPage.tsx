import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { API_BASE } from "@/api/http";
import { ShieldCheck, BookOpen, Users } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  minAmount: number;
  maxAmount: number | null;
  description: string;
  durationDays: number;
}

interface Investment {
  id: number;
  planName: string;
  amount: number;
  status: string;
  endDate: string;
  durationDays: number;
  progress: number;
  profit_loss: number;
  profit_paid: number;   
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

export default function InvestPage() {
  const { user, token, setUser } = useAuth();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [amount, setAmount] = useState(100);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [useBonusFirst, setUseBonusFirst] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [totalAvailable, setTotalAvailable] = useState<number>(0);

  /* ---------------- Fetch latest user balances ---------------- */
  const refreshUserBalances = async () => {
    if (!token || !setUser) return;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch user balances");

      const data = await res.json();
      if (data.success && data.user) {
        setUser(u => ({
          ...u,
          balance: Number(data.user.balance ?? 0),
          bonus_balance: Number(data.user.bonus_balance ?? 0),
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user balances");
    } finally {
      setLoadingBalances(false);
    }
  };

  /* ---------------- Fetch total available from overview ---------------- */
  const refreshTotalAvailable = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/user/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch overview");

      const data = await res.json();
      if (data.success && data.totals) {
        setTotalAvailable(Number(data.totals.portfolio_value ?? 0));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load totals");
    }
  };

  useEffect(() => {
    refreshUserBalances();
    refreshTotalAvailable();
  }, [token]);

  const mainBalance = Number(user?.balance ?? 0);
  const bonusBalance = Number(user?.bonus_balance ?? 0);
  

  /* ---------------- Fetch plans ---------------- */
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/plans`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => {
        setPlans(
          (d.plans ?? []).map((p: any) => ({
            id: Number(p.id),
            name: p.name,
            minAmount: Number(p.min_amount),
            maxAmount: p.max_amount ? Number(p.max_amount) : null,
            description: p.description ?? "",
            durationDays: Number(p.duration_days),
          }))
        );
      })
      .catch(() => toast.error("Failed to load plans"));
  }, [token]);

  /* ---------------- Fetch investments ---------------- */
  const fetchInvestments = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/investments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const d = await res.json();

      setInvestments(
        (d.investments ?? []).map((i: any) => ({
          id: i.id,
          planName: i.plan_name ?? "Plan",
          amount: Number(i.amount),
          status: i.status,
          endDate: i.end_at,
          durationDays: Number(i.duration_days),
          progress: Number(i.progress ?? 0),
          profit_loss: Number(i.profit_loss ?? 0),
          profit_paid: Number(i.profit_paid ?? 0), 
        }))
      );
    } catch {
      toast.error("Failed to load investments");
    }
  };

  useEffect(() => {
    fetchInvestments();
    const interval = setInterval(fetchInvestments, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const selectedPlan = useMemo(
    () => plans.find(p => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  const canInvest = useMemo(() => {
    if (!selectedPlan) return false;
    if (amount < selectedPlan.minAmount) return false;
    if (selectedPlan.maxAmount && amount > selectedPlan.maxAmount) return false;
    if (amount > totalAvailable) return false;
    return true;
  }, [amount, selectedPlan, totalAvailable]);

  /* ---------------- Handle investment ---------------- */
  const handleInvest = async () => {
    if (!token || !selectedPlan || !canInvest || !agreed) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/invest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          plan_id: selectedPlan.id,
          use_bonus: useBonusFirst,
        }),
      });

      const d = await res.json();
      if (!res.ok) throw new Error(d?.error ?? "Investment failed");

      toast.success("Investment created");

      // Refresh balances after investment
      await refreshUserBalances();
      await refreshTotalAvailable();

      // Refresh investments list
      fetchInvestments();

      setAmount(100);
      setSelectedPlanId(null);
      setAgreed(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (loadingBalances) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-[#0a0e1a]">
        Loading balances…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10 flex-1">
        {/* Title + Balances */}
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Professionally Managed Capital</h1>
          <p className="text-gray-400 leading-relaxed">
            Stake your capital with seasoned market professionals. Withdraw profits while your capital works efficiently.
          </p>

          {/* Balances */}
          <div className="grid grid-cols-3 gap-6 border border-white/10 rounded-xl p-4 bg-slate-900/50">
            <div>
              <p className="text-xs text-gray-400">Main Balance</p>
              <p className="text-xl font-semibold">${mainBalance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Bonus</p>
              <p className="text-xl font-semibold text-emerald-400">${bonusBalance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Available</p>
              <p className="text-xl font-semibold text-cyan-400">${totalAvailable.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Form & Investments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Investment Form */}
          <div className="border border-white/10 rounded-xl p-6 bg-slate-900/60">
            <h2 className="text-xl font-semibold mb-4">New Stakes</h2>
            <div className="space-y-4">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700"
              />
              <select
                value={selectedPlanId ?? ""}
                onChange={e => setSelectedPlanId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700"
              >
                <option value="">Select plan</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} • {p.durationDays}d • Min ${p.minAmount}
                  </option>
                ))}
              </select>
              {selectedPlan && <p className="text-sm text-gray-400">{selectedPlan.description}</p>}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useBonusFirst}
                  disabled={bonusBalance <= 0}
                  onChange={() => setUseBonusFirst(v => !v)}
                />
                Use bonus first
              </label>

              <label className="flex items-start gap-2 text-sm text-gray-400">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                I agree to the Terms & Conditions
              </label>

              <button
                disabled={!canInvest || !agreed || submitting}
                onClick={handleInvest}
                className="w-full py-3 rounded-lg bg-cyan-500 text-black font-semibold disabled:opacity-50"
              >
                {submitting ? "Processing…" : "Invest"}
              </button>
            </div>
          </div>

          {/* Investments List */}
          <div className="border border-white/10 rounded-xl p-6 bg-slate-900/60">
            <h2 className="text-xl font-semibold mb-4">Your Stakings</h2>
            {investments.length === 0 ? (
              <p className="text-gray-400 text-sm">No stake yet.</p>
            ) : (
              <div className="space-y-3">
                {investments.map(inv => {
                  const pct = clamp(inv.progress);
                  return (
                    <div key={inv.id} className="border border-slate-700 rounded-lg p-4">
                      <div className="flex justify-between text-sm">
                        <span>{inv.planName}</span>
                        <span className={inv.status === "active" ? "text-cyan-400" : "text-gray-400"}>
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ${inv.amount.toFixed(2)} • {inv.durationDays} days
                      </div>
                      <div className="mt-2 h-1 bg-slate-800 rounded">
                        <div className="h-1 bg-cyan-500 rounded" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        PnL:{" "}
                        <span className={inv.profit_loss >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          ${inv.profit_loss.toFixed(2)}
                        </span>
                        {" • "}
                        <span className="text-gray-300">
                          Pending Payout: ${Math.max(0, (inv.profit_loss - inv.profit_paid)).toFixed(2)}
                        </span>
                        <div className="mt-1 text-xs text-gray-400">
                          Paid: <span className="text-emerald-400">${inv.profit_paid.toFixed(2)}</span>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#070b14]">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Capital managed with discipline & transparency
          </div>
          <div className="flex gap-6">
            <a href="#" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "overview" }))} className="hover:text-white">
              Dashboard
            </a>
            <a href="#" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "portfolio" }))} className="hover:text-white">
              Portfolio
            </a>
            <a href="#" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "learning" }))} className="hover:text-white flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Learning
            </a>
            <a href="#" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "mentorship" }))} className="hover:text-white flex items-center gap-1">
              <Users className="w-4 h-4" /> Mentorship
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
