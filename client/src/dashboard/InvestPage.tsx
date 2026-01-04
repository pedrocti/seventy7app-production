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

  // Calculate locked main balance from active investments
  const activeInvestmentMain = useMemo(() => {
    return investments.reduce((acc, inv) => {
      if (inv.status !== "active") return acc;
      const bonusUsed = useBonusFirst ? Math.min(userBonusBalance, inv.amount) : 0;
      const remainingMain = Math.max(0, inv.amount - bonusUsed);
      return acc + remainingMain;
    }, 0);
  }, [investments, useBonusFirst, userBonusBalance]);

  const mainBalance = userMainBalance - activeInvestmentMain;
  const bonusBalance = userBonusBalance;
  const totalAvailable = mainBalance + bonusBalance;
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  

  // Tick only for UI countdowns (not fetching)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch plans once
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/plans`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject("Failed"))
      .then(data => {
        const mapped = (data.plans ?? []).map((p: any) => ({
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

  // Fetch investments — less frequently
  const fetchInvestments = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/investments`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const formatted = (data.investments ?? []).map((inv: any) => {
        const startAt = inv.start_at ?? inv.startAt ?? null;
        const durationDays = Number(inv.duration_days ?? inv.durationDays ?? 0);
        const startMs = startAt ? new Date(startAt).getTime() : Date.now();
        const endAt = inv.end_at ?? new Date(startMs + durationDays * 86400 * 1000).toISOString();
        return {
          id: Number(inv.id ?? 0),
          planId: Number(inv.plan_id ?? null),
          planName: inv.plan_name ?? "Plan",
          amount: Number(inv.amount ?? 0),
          status: String(inv.status ?? "active"),
          startDate: startAt ? new Date(startAt).toISOString() : null,
          endDate: endAt,
          durationDays,
          progress: Number(inv.progress ?? 0),
          profit_loss: Number(inv.profit_loss ?? 0),
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

  

  useEffect(() => {
    fetchInvestments();
    const interval = setInterval(fetchInvestments, 30000); // every 30 seconds – safe & stable
    return () => clearInterval(interval);
  }, [token]);

  const selectedPlan = useMemo(() => plans.find(p => p.id === selectedPlanId) ?? null, [plans, selectedPlanId]);

  const canInvest = useMemo(() => {
    if (!selectedPlan) return false;
    if (amount < selectedPlan.minAmount) return false;
    if (amount > totalAvailable) return false;
    if (useBonusFirst) {
      const bonusUsed = Math.min(bonusBalance, amount);
      return mainBalance >= (amount - bonusUsed);
    }
    return mainBalance >= amount;
  }, [selectedPlan, amount, totalAvailable, bonusBalance, useBonusFirst, mainBalance]);

  const handleInvest = async () => {
    if (!token) return toast.error("Please log in");
    if (!selectedPlan) return toast.error("Select a plan first");
    if (!canInvest) return toast.error("Check your balance or amount");

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/invest`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, plan_id: selectedPlan.id, use_bonus: useBonusFirst }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Investment failed");

      toast.success(`Invested $${amount.toFixed(2)} successfully!`);

      if (data.balances && setUser) {
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            balance: data.balances.balance ?? prev.balance,
            bonus_balance: data.balances.bonus_balance ?? prev.bonus_balance,
          };
        });
      }

      setAmount(100);
      setSelectedPlanId(null);
      await fetchInvestments(); // refresh list
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0d1326] to-[#0a0e1a] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Balances – Emphasis & Stable */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div
            className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl shadow-cyan-900/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm text-cyan-300/80">Main Balance</p>
            <p className="text-4xl font-black text-white mt-2">${mainBalance.toFixed(2)}</p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-2xl shadow-emerald-900/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-emerald-300/80">Bonus Balance</p>
            <p className="text-4xl font-black text-emerald-400 mt-2">${bonusBalance.toFixed(2)}</p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-[#0AEFFF]/30 rounded-2xl p-6 shadow-2xl shadow-cyan-900/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-[#0AEFFF]/80">Total Available</p>
            <p className="text-4xl font-black text-[#0AEFFF] mt-2">${totalAvailable.toFixed(2)}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Investment Form */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">Deploy Capital</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value) || 0)}
                    min={selectedPlan?.minAmount ?? 100}
                    step={1}
                    className="w-full px-5 py-4 bg-slate-900/70 border border-slate-700 rounded-xl text-white text-xl font-bold focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                  />
                </div>

                {/* Plan */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Plan</label>
                  <select
                    value={selectedPlanId ?? ""}
                    onChange={e => setSelectedPlanId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-5 py-4 bg-slate-900/70 border border-slate-700 rounded-xl text-white focus:border-cyan-500 outline-none transition"
                  >
                    <option value="">Select Plan</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} • {p.durationDays}d • Min ${p.minAmount}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bonus Toggle */}
                <div className="flex flex-col justify-end">
                  <label className="text-sm text-gray-300 mb-2">Use Bonus First</label>
                  <button
                    onClick={() => setUseBonusFirst(v => !v)}
                    className={`relative w-16 h-9 rounded-full transition-all duration-300 ${
                      useBonusFirst ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${
                        useBonusFirst ? 'translate-x-7' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {selectedPlan && (
                <div className="mt-8 p-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">Selected Plan</div>
                      <div className="text-2xl font-bold text-white">{selectedPlan.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{selectedPlan.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Duration</div>
                      <div className="text-2xl font-bold text-cyan-300">{selectedPlan.durationDays} days</div>
                    </div>
                  </div>
                </div>
              
              )}

              <div className="mt-6 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms-agree"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1.5 h-5 w-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  disabled={submitting}
                />
                <label
                  htmlFor="terms-agree"
                  className="text-sm text-gray-300 leading-relaxed"
                >
                  I agree to the{" "}
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline transition-colors duration-200"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and confirm that I understand trading and other investments carry significant risk, including losses.
                </label> 
              </div>
              
              <div className="mt-8 space-y-4">
                <motion.button
                  whileHover={{ scale: canInvest && !submitting ? 1.03 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting || !canInvest || !agreedToTerms}
                  onClick={handleInvest}
                  className={`w-full py-5 rounded-2xl text-xl font-black shadow-2xl transition-all ${
                    canInvest && !submitting
                      ? "bg-gradient-to-r from-[#0AEFFF] to-[#00D4FF] text-black animate-pulse-slow"
                      : "bg-slate-700/50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Processing..." : "Invest Now"}
                </motion.button>

                {!canInvest && selectedPlan && (
                  <p className="text-sm text-rose-400 text-center">
                    {amount < selectedPlan.minAmount
                      ? `Minimum amount is $${selectedPlan.minAmount}`
                      : "Check your available balance"}
                  </p>
                )}

                <button
                  onClick={() => {
                    setAmount(100);
                    setSelectedPlanId(null);
                  }}
                  className="w-full py-4 rounded-xl bg-transparent border border-white/10 text-white hover:bg-white/5 transition"
                >
                  Reset Form
                </button>
              </div>
            </motion.div>
          </div>

          {/* Investments List */}
          <div>
            <motion.div
              className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Your Investments</h3>
                <span className="text-sm text-gray-400">{investments.length} active</span>
              </div>

              {investments.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  No investments yet — start earning today!
                </div>
              ) : (
                <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
                  {investments.map(inv => {
                    const percent = clamp(inv.progress ?? 0, 0, 100);
                    const remainingDays = Math.max(0, Math.ceil((new Date(inv.endDate).getTime() - Date.now()) / 86400000));
                    const isActive = inv.status === "active";

                    return (
                      <motion.div
                        key={inv.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-white">{inv.planName}</h4>
                            <p className="text-sm text-gray-400 mt-1">
                              ${inv.amount.toFixed(2)} • {inv.durationDays}d
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-gray-700 text-gray-300"
                            }`}>
                              {isActive ? "Active" : "Completed"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Progress Circle */}
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90">
                              <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="8" fill="none" />
                              <motion.circle
                                cx="50" cy="50" r="38"
                                stroke="#0AEFFF"
                                strokeWidth="8" fill="none"
                                strokeDasharray={238.76}
                                initial={{ strokeDashoffset: 238.76 }}
                                animate={{ strokeDashoffset: 238.76 * (1 - percent / 100) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                              {percent}%
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="text-sm text-gray-300 mb-1">
                              PnL: <span className={inv.profit_loss >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                {inv.profit_loss >= 0 ? "+" : "-"}${Math.abs(inv.profit_loss).toFixed(2)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              {remainingDays > 0 ? `${remainingDays} days left` : "Completed"}
                            </div>
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