// client/src/dashboard/OverviewPage.tsx — Active trade + recent history replacement
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useAuth } from "@/auth/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";



const COLORS = ["#F0B90B", "#0ECB81", "#4D7CFE", "#F6465D", "#F8D46B"];

export default function OverviewPage() {
  const { user, token } = useAuth();

  const [overview, setOverview] = useState<any | null>(null);
  const [tradesData, setTradesData] = useState<{ active: any | null; history: any[] }>({
    active: null,
    history: [],
  });
  const [loading, setLoading] = useState(false);
  const [pollMs] = useState(10000);

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/user/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) setOverview(data);
    } catch (err) {
      console.error("Overview fetch error:", err);
    }
  }, [token]);

  const fetchTrades = useCallback(async () => {
    if (!token) return; // trades endpoint also requires auth middleware per your server file
    try {
      const res = await fetch("/api/trades", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        setTradesData({
          active: data.active || null,
          history: Array.isArray(data.history) ? data.history : [],
        });
      }
    } catch (err) {
      console.error("Trades fetch error:", err);
    }
  }, [token]);

  useEffect(() => {
    // run both on mount and then poll
    const run = async () => {
      setLoading(true);
      await Promise.all([fetchOverview(), fetchTrades()]);
      setLoading(false);
    };
    run();

    const interval = setInterval(() => {
      fetchOverview();
      fetchTrades();
    }, pollMs);

    const handler = () => {
      fetchOverview();
      fetchTrades();
    };
    window.addEventListener("data-updated", handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("data-updated", handler);
    };
  }, [fetchOverview, fetchTrades, pollMs]);

  if (!overview) {
    return <p className="text-[#848E9C] text-center py-12">Loading insights...</p>;
  }

  const userData = overview.user || {};
  const totals = overview.totals || {};
  const recentTx = Array.isArray(overview.recent_transactions) ? overview.recent_transactions : [];
  const recentInv = Array.isArray(overview.recent_investments) ? overview.recent_investments : [];

  const allocation = [
    { name: "Cash", value: Math.max(0, Number(userData.balance || 0)) },
    { name: "Bonus", value: Math.max(0, Number(userData.bonus_balance || 0)) },
    { name: "Invested", value: Math.max(0, Number(totals.total_invested || 0)) },
  ];
  const totalAllocSum = allocation.reduce((s, o) => s + o.value, 0) || 1;
  const allocationPct = allocation.map((a) => ({
    ...a,
    value: Math.round((a.value / totalAllocSum) * 100),
  }));

  const growthData =
    recentInv.length > 0
      ? recentInv
          .slice()
          .reverse()
          .map((inv: any, i: number) => ({
            month: inv.startAt ? format(new Date(inv.startAt), "MMM d") : `P${i}`,
            balance: Number(inv.amount || 0) + Number(inv.profit_loss || 0),
          }))
      : [{ month: "Now", balance: Number(userData.balance || 0) }];

  const balance = Number(userData.balance || 0);
  const bonus = Number(userData.bonus_balance || 0);

  // trades UI helpers
  const { active: activeTrade, history } = tradesData;
  const recentHistory = history.slice(0, 3); // show top 3

  return (
    <div className="space-y-8 text-[#EAECEF]">
      {/* TOP CHARTS */}
      <section className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {/* Allocation */}
        <div className="rounded-2xl p-5 bg-[#181A20] border border-[#2B3139]">
          <h3 className="text-sm text-[#848E9C] mb-3">Portfolio Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={allocationPct} dataKey="value" outerRadius={80} innerRadius={50} paddingAngle={3}>
                {allocationPct.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap justify-center gap-3 text-xs text-[#848E9C] mt-4">
            {allocationPct.map((a, i) => (
              <div key={a.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {a.name} ({a.value}%)
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-2xl p-5 bg-[#181A20] border border-[#2B3139]">
          <h3 className="text-sm text-[#848E9C] mb-3">Performance</h3>
          <div className="text-3xl font-bold text-[#0ECB81]">
            {totals.total_profit >= 0 ? `+$${Number(totals.total_profit).toFixed(2)}` : `-$${Math.abs(Number(totals.total_profit)).toFixed(2)}`}
          </div>

          <p className="text-[#848E9C] text-xs mb-3">Total PnL</p>

          <div className="w-full bg-[#2B3139] h-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#F0B90B] to-[#F8D46B]"
              initial={{ width: "0%" }}
              animate={{
                width: `${Math.min(100, Math.abs(Number(totals.total_profit || 0)) / (Number(totals.portfolio_value || 1) / 2) * 100)}%`,
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* ACTIVE TRADE + RECENT HISTORY */}
        <div className="rounded-2xl p-5 bg-[#181A20] border border-[#2B3139]">
          <h3 className="text-sm text-[#848E9C] mb-3">Live Trade & Recent History</h3>

          {/* Active trade */}
          {activeTrade ? (
            <div
              className="
                relative bg-[#1E2027] p-3 rounded-lg border 
                border-[#2B3139]
                overflow-hidden
                animated-trade-border
              "
            >

              {/* Background animated line wave */}
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                <div className="trade-wave"></div>
              </div>

              {/* LIVE indicator */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="relative flex h-3 w-3">
                  <span className="pulse-dot"></span>
                </span>

                <span className="text-xs font-bold text-[#0ECB81] live-tag">
                  LIVE
                </span>
              </div>

              {/* Content */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="text-sm font-semibold text-[#EAECEF]">
                    {activeTrade.pair || activeTrade.symbol || " "}
                  </div>
                  
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      activeTrade.side === "buy" ? "text-[#0ECB81]" : "text-[#F6465D]"
                    }`}
                  >
                    {activeTrade.side?.toUpperCase()}
                  </div>
                  
                </div>
              </div>

              {/* Trade details */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#848E9C] relative z-10">
                <div>
                  <div className="text-[13px] text-[#EAECEF]">Entry</div>
                  <div>${Number(activeTrade.entry_price ?? activeTrade.price ?? 0).toFixed(4)}</div>
                </div>
                
                <div>
                  <div className="text-[13px] text-[#EAECEF]">Opened</div>
                  <div className="text-xs text-[#848E9C]">
                    {activeTrade.created_at
                      ? format(new Date(activeTrade.created_at), "MMM d, yyyy • h:mm a")
                      : "—"}
                  </div>
                </div>
                <div>
                  
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-[#848E9C] py-6">No active trade</div>
          )}



          {/* Recent history (3) */}
          <div>
            <div className="text-xs text-[#848E9C] mb-2">Recent trades</div>
            {recentHistory.length === 0 ? (
              <div className="text-center text-[#6B7280] py-4">No recent trades</div>
            ) : (
              <div className="space-y-2">
                {recentHistory.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-2 bg-[#121519] rounded border border-[#2B3139]">
                    <div>
                      <div className="text-sm font-medium text-[#EAECEF]">{t.pair || t.symbol || "—"}</div>
                      <div className="text-xs text-[#848E9C]">{t.side?.toUpperCase() || ""} • {t.strategy || ""}</div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-bold ${t.pnl >= 0 ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
                        ${Number(t.pnl ?? t.profit ?? 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-[#848E9C]">
                        {t.resolved_at ? format(new Date(t.resolved_at), "MMM d, yyyy") : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* REAL STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.03 }} className="bg-[#181A20] p-6 rounded-2xl border border-[#2B3139]">
          <h4 className="text-sm text-[#848E9C]">Total Balance</h4>
          <p className="text-3xl font-bold text-[#EAECEF] mt-2">
            ${Number(balance + bonus).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-[#848E9C] mt-1">Main: ${balance.toFixed(2)} • Bonus: ${bonus.toFixed(2)}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} className="bg-[#181A20] p-6 rounded-2xl border border-[#2B3139]">
          <h4 className="text-sm text-[#848E9C]">Active Investments</h4>
          <p className="text-3xl font-bold text-[#EAECEF] mt-2">{totals.active_investments ?? 0}</p>
          <p className="text-xs text-[#848E9C] mt-1">Total invested: ${Number(totals.total_invested || 0).toFixed(2)}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} className="bg-[#181A20] p-6 rounded-2xl border border-[#2B3139]">
          <h4 className="text-sm text-[#848E9C]">Portfolio Value</h4>
          <p className="text-3xl font-bold text-[#EAECEF] mt-2">${Number(totals.portfolio_value || 0).toFixed(2)}</p>
          <p className="text-xs text-[#848E9C] mt-1">Total profit: ${Number(totals.total_profit || 0).toFixed(2)}</p>
        </motion.div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-[#181A20] rounded-2xl p-6 border border-[#2B3139]">
        <h3 className="text-xl font-bold mb-6 text-[#F0B90B]">Recent Activity</h3>

        {recentTx.length === 0 ? (
          <p className="text-center text-[#6B7280] py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {recentTx.map((t: any) => (
              <div key={t.id} className="flex justify-between items-center py-3 border-b border-[#2B3139] last:border-0">
                <div>
                  <p className="font-medium text-[#EAECEF] capitalize">{t.type === "referral_bonus" ? "Referral Bonus" : t.type}</p>
                  <p className="text-xs text-[#848E9C]">{t.created_at ? format(new Date(t.created_at), "MMM d, yyyy • h:mm a") : ""}</p>
                  {t.status === "rejected" && t.details?.reject_reason && <p className="text-xs text-[#F6465D] mt-1">Reason: {t.details.reject_reason}</p>}
                </div>

                <div className="text-right">
                  <p className={`font-bold ${t.amount > 0 ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>{t.amount > 0 ? "+" : "-"}${Math.abs(Number(t.amount)).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${t.status === "completed" ? "bg-[#0ECB81]/20 text-[#0ECB81]" : t.status === "rejected" ? "bg-[#F6465D]/20 text-[#F6465D]" : "bg-[#F0B90B]/20 text-[#F0B90B]"}`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENT INVESTMENTS */}
      <div className="bg-[#181A20] rounded-2xl p-6 border border-[#2B3139]">
        <h3 className="text-xl font-bold mb-6 text-[#F0B90B]">Recent Investments</h3>

        {recentInv.length === 0 ? (
          <p className="text-center text-[#6B7280] py-8">No investments yet</p>
        ) : (
          <div className="space-y-3">
            {recentInv.map((inv: any) => {
              const now = Date.now();
              const start = inv.startAt ? new Date(inv.startAt).getTime() : now;
              const end = inv.endAt ? new Date(inv.endAt).getTime() : start + (inv.durationDays || 0) * 86400 * 1000;
              const totalMs = Math.max(1, end - start);
              const elapsedMs = Math.max(0, Math.min(now - start, totalMs));
              const percent = Math.round((elapsedMs / totalMs) * 100);

              return (
                <div key={inv.id} className="bg-[#1E2027] rounded-xl p-3 border border-[#2B3139]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#EAECEF]">{inv.planName || "Plan"}</div>
                      <div className="text-xs text-[#848E9C]">Amount: ${Number(inv.amount || 0).toFixed(2)}</div>
                      <div className="text-xs text-[#848E9C] mt-1">PnL: ${Number(inv.profit_loss || 0).toFixed(2)}</div>
                    </div>

                    <div className="w-32 text-right">
                      <div className="text-xs text-[#848E9C]">Ends</div>
                      <div className="text-sm font-semibold text-[#EAECEF]">{inv.endAt ? new Date(inv.endAt).toLocaleDateString() : "—"}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-[#2B3139] rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#F0B90B] to-[#F8D46B]" style={{ width: `${Math.min(100, percent)}%` }} />
                    </div>

                    <div className="mt-1 text-xs text-[#848E9C] flex items-center justify-between">
                      <span>{percent}%</span>
                      <span>{inv.status === "active" ? end ? `${Math.max(0, Math.ceil((end - now) / (24 * 60 * 60 * 1000)))}d left` : "—" : "Completed"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
