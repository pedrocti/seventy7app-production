// ... imports unchanged
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { API_BASE } from "@/api/http";

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
  planId: number | null;
  planName: string;
  amount: number;
  status: string; 
  startDate: string | null;
  endDate: string;
  durationDays: number;
  progress: number;
  profit_loss: number;
}


function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

export default function InvestPage() {
  const { user, token, setUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [amount, setAmount] = useState<number>(100);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [useBonusFirst, setUseBonusFirst] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tick, setTick] = useState(0);

  const userMainBalance = Number(user?.balance ?? 0);
  const userBonusBalance = Number(user?.bonus_balance ?? 0);

  // active investments locked amount (main balance only)
  const activeInvestmentMain = useMemo(() => {
    return investments.reduce((acc, inv) => {
      if (inv.status === "active") {
        const bonusUsed = useBonusFirst ? Math.min(userBonusBalance, inv.amount) : 0;
        const remaining = Math.max(0, inv.amount - bonusUsed);
        return acc + remaining;
      }
      return acc;
    }, 0);
  }, [investments, useBonusFirst, userBonusBalance]);

  const mainBalance = userMainBalance - activeInvestmentMain;
  const bonusBalance = userBonusBalance;
  const totalAvailable = mainBalance + bonusBalance;

  // ticker for countdowns
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // fetch plans
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/plans`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : Promise.reject("Failed to fetch plans"))
      .then((data) => {
        const mapped: Plan[] = (data.plans ?? []).map((p: any) => ({
          id: Number(p.id),
          name: String(p.name ?? ""),
          minAmount: Number(p.min_amount ?? 0),
          maxAmount: p.max_amount == null ? null : Number(p.max_amount),
          description: p.description ?? "",
          durationDays: Number(p.duration_days ?? 0),
        }));
        setPlans(mapped);
      })
      .catch(() => toast.error("Failed to load plans"));
  }, [token]);

  // fetch investments
  const fetchInvestments = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/investments`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch investments");
      const data = await res.json();
      const formatted: Investment[] = (data.investments ?? []).map((inv: any) => {
        const startAt = inv.start_at ?? inv.startAt ?? null;
        const durationDays = Number(inv.duration_days ?? inv.durationDays ?? 0);
        const amount = Number(inv.amount ?? 0);
        const progress = Number(inv.progress ?? 0);
        const profitLoss = Number(inv.profit_loss ?? 0);
        const status = String(inv.status ?? "active");
        const startMs = startAt ? new Date(startAt).getTime() : Date.now();
        const endAt = inv.end_at ?? new Date(startMs + durationDays * 86400 * 1000).toISOString();
        return {
          id: Number(inv.id ?? 0),
          planId: Number(inv.plan_id ?? null),
          planName: inv.plan_name ?? "Plan",
          amount,
          status,
          startDate: startAt ? new Date(startAt).toISOString() : null,
          endDate: endAt,
          durationDays,
          progress,
          profit_loss: profitLoss,
        };
      });

      formatted.sort((a, b) => {
        if (a.status === b.status) return new Date(a.endDate || 0).getTime() - new Date(b.endDate || 0).getTime();
        return a.status === "active" ? -1 : 1;
      });

      setInvestments(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load investments");
      setInvestments([]);
    }
  };

  useEffect(() => { fetchInvestments(); }, [token, tick]);

  const selectedPlan = useMemo(() => plans.find((p) => p.id === selectedPlanId) ?? null, [plans, selectedPlanId]);

  // canInvest now respects mainBalance adjusted for active investments
  const canInvest = useMemo(() => {
    if (!selectedPlan) return false;
    if (amount < selectedPlan.minAmount) return false;
    if (amount > totalAvailable) return false;
    if (useBonusFirst) {
      const bonusUsed = Math.min(bonusBalance, amount);
      if (mainBalance < (amount - bonusUsed)) return false;
    } else {
      if (mainBalance < amount) return false;
    }
    return true;
  }, [selectedPlan, amount, totalAvailable, bonusBalance, useBonusFirst, mainBalance]);

  const handleInvest = async () => {
    if (!token) return toast.error("Please log in");
    if (!selectedPlan) return toast.error("Please select a plan.");
    if (!canInvest) return toast.error("Insufficient balance.");

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/invest`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, plan_id: selectedPlan.id, use_bonus: useBonusFirst }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Investment failed");
        return;
      }

      toast.success(`Invested $${amount.toFixed(2)}`);
      if (data.balances && setUser) setUser((prev: any) => ({ ...prev, ...data.balances }));

      setAmount(100);
      setSelectedPlanId(null);
      await fetchInvestments();
    } catch (err: any) {
      toast.error(err?.message ?? "Investment failed");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI remains mostly unchanged ---
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#071022] via-[#081225] to-[#071522]">
      <div className="max-w-7xl mx-auto">
        {/* Header & balances */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#0AEFFF] to-[#7EE7C3]">Stake & Earn</h1>
            <p className="mt-2 text-sm text-gray-300">Choose a plan, see duration & countdown, and track active investments.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <div className="text-xs text-gray-400">Main Balance</div>
              <div className="text-xl font-bold text-white">${mainBalance.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Bonus</div>
              <div className="text-xl font-bold text-emerald-400">${bonusBalance.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Total</div>
              <div className="text-xl font-bold text-[#0AEFFF]">${totalAvailable.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: form */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white/5 border border-white/6 rounded-2xl p-6 shadow-xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-4">Deploy Capital</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* Amount Input */}
                <div className="md:col-span-1">
                  <label className="text-sm text-gray-300">
                    Amount (min ${selectedPlan?.minAmount ?? 100})
                  </label>
                  <input
                    type="number"
                    min={selectedPlan?.minAmount ?? 100}
                    step={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white text-lg font-bold focus:outline-none"
                  />
                </div>

                {/* Plan Selector */}
                <div className="md:col-span-1">
                  <label className="text-sm text-gray-300">Plan</label>
                  <select
                    value={selectedPlanId ?? ""}
                    onChange={(e) => setSelectedPlanId(e.target.value ? Number(e.target.value) : null)}
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white"
                  >
                    <option value="">Select Plan</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} • {p.durationDays}d • ${p.minAmount}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bonus Toggle */}
                <div className="md:col-span-1 flex items-center gap-3">
                  <label className="text-sm text-gray-300">Use Bonus First</label>
                  <button
                    onClick={() => setUseBonusFirst((v) => !v)}
                    className={`ml-auto relative w-14 h-8 rounded-full transition-all ${
                      useBonusFirst ? "bg-[#0AEFFF]" : "bg-gray-600"
                    }`}
                    aria-pressed={useBonusFirst}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-7 h-7 bg-black rounded-full transition-transform ${
                        useBonusFirst ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Selected Plan Info */}
              {selectedPlan && (
                <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/6 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-300">Selected</div>
                    <div className="text-lg font-bold text-white">{selectedPlan.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{selectedPlan.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-300">Duration</div>
                    <div className="text-lg font-bold text-white">{selectedPlan.durationDays} days</div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <button
                  onClick={handleInvest}
                  disabled={submitting || !canInvest}
                  className={`px-6 py-3 rounded-xl text-black font-bold transition shadow ${
                    submitting || !canInvest
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#0AEFFF] to-[#7EE7C3] hover:scale-[1.02]"
                  }`}
                >
                  {submitting ? "Processing…" : "Invest Now"}
                </button>

                {!canInvest && selectedPlan && (
                  <div className="text-xs text-rose-400 mt-1">
                    {amount < (selectedPlan?.minAmount ?? 100)
                      ? `Amount must be at least $${selectedPlan.minAmount}`
                      : amount > totalAvailable
                      ? "Insufficient total balance"
                      : useBonusFirst
                      ? (() => {
                          const bonusUsed = Math.min(bonusBalance, amount);
                          const remaining = Math.max(0, amount - bonusUsed);
                          return mainBalance < remaining ? "Main balance insufficient to cover remaining after bonus" : "";
                        })()
                      : "Main balance insufficient"}
                  </div>
                )}

                <button
                  onClick={() => {
                    setAmount(100);
                    setSelectedPlanId(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-transparent border border-white/8 text-white hover:bg-white/3 transition"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right column: Investments */}
          <div>
            <motion.div
              className="bg-white/5 border border-white/6 rounded-2xl p-4 shadow-lg"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Your Investments</h3>
                <div className="text-sm text-gray-400">{investments.length} total</div>
              </div>

              {investments.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  No investments yet — choose a plan to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {investments.map((inv, index) => {
                    const amount = Number(inv.amount) || 0;
                    const duration = Number(inv.durationDays) || 0;
                    const progressFromBackend = Number(inv.progress ?? 0);
                    const profitLoss = Number(inv.profit_loss ?? 0);

                    const startISO = inv.startDate ?? null;
                    const endISO = inv.endDate ?? null;

                    const start = startISO ? new Date(startISO) : new Date();
                    const end = endISO ? new Date(endISO) : new Date(start.getTime() + duration * 86400 * 1000);

                    const now = Date.now();
                    const totalMs = Math.max(1, end.getTime() - start.getTime());
                    const elapsedMs = Math.min(Math.max(0, now - start.getTime()), totalMs);
                    const timePercent = Math.round((elapsedMs / totalMs) * 100);

                    const percent =
                      !isNaN(progressFromBackend) && progressFromBackend > 0 && progressFromBackend <= 100
                        ? Math.round(progressFromBackend)
                        : timePercent;

                    const remainingMs = Math.max(0, end.getTime() - now);
                    const daysLeft = Math.ceil(remainingMs / 86400000);

                    const key = inv.id != null && !isNaN(Number(inv.id)) ? String(inv.id) : `inv-${index}`;

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/3 rounded-xl p-3 border border-white/6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-white">{inv.planName}</div>
                              <div className="text-xs text-gray-300">{duration}d</div>
                            </div>

                            <div className="mt-1 text-xs text-gray-300">
                              Amount: <span className="font-medium text-white">${amount.toFixed(2)}</span>
                            </div>

                            <div className="mt-1 text-xs">
                              <span className={`font-medium ${profitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {profitLoss >= 0 ? "+" : "-"}${Math.abs(profitLoss).toFixed(2)}
                              </span>
                              <span className="ml-2 text-gray-400">PnL</span>
                            </div>

                            <div className="mt-3">
                              <div className="w-full bg-white/6 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#0AEFFF] to-[#7EE7C3]"
                                  style={{ width: `${clamp(percent)}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-400 mt-1 flex justify-between">
                                <span>{clamp(percent)}%</span>
                                <span>{remainingMs > 0 ? `${daysLeft}d left` : "0d left"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="w-28 text-right">
                            <div className="text-xs text-gray-300">Ends</div>
                            <div className="text-sm font-semibold text-white">{end.toLocaleDateString()}</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
