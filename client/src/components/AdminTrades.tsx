import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/api/http";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

type Plan = {
  id: number;
  name: string;
};

type Trade = {
  id: number;
  pair: string;
  direction?: "buy" | "sell";
  entry_price?: string | null;
  entry_notes?: string;
  status: "pending" | "active" | "resolved";
  pnl_percent?: string;
  exit_notes?: string;
  created_at: string;
  resolved_at?: string;
  plan_id?: number | null;
};

export default function AdminTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  /* ------------------------------------------------------------
      LOAD TRADES
  ------------------------------------------------------------ */
  const loadTrades = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/trades`, {
        headers: authHeaders,
      });
      setTrades(res.data.trades || []);
      setPlans(res.data.plans || []);
    } catch (err: any) {
      console.error("Failed to load trades:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
    const interval = setInterval(loadTrades, 6000);
    return () => clearInterval(interval);
  }, []);

  /* ------------------------------------------------------------
      CREATE & ACTIVATE TRADE
  ------------------------------------------------------------ */
  const createAndActivate = async () => {
    const pair = prompt("Trade pair (BTC/USD, GOLD, EUR/USD):");
    if (!pair?.trim()) return;

    // Optional plan selection
    let plan_id: number | null = null;
    if (plans.length > 0) {
      const opts = plans.map((p) => `${p.id}: ${p.name}`).join("\n");
      const planInput = prompt(
        `Choose a plan by id (or press Enter for none):\n\n${opts}`
      );

      if (planInput && planInput.trim() !== "") {
        const parsed = Number(planInput);
        if (isNaN(parsed) || !plans.some((p) => p.id === parsed)) {
          return alert("Invalid plan id.");
        }
        plan_id = parsed;
      }
    }

    const directionInput =
      prompt("Direction: buy or sell? (Enter = buy)")?.trim().toLowerCase();
    const direction = directionInput === "sell" ? "sell" : "buy";

    const entryPriceRaw =
      prompt("Entry price (optional numeric, blank to skip)")?.trim() || "";
    const entry_price =
      entryPriceRaw === "" ? null : isNaN(Number(entryPriceRaw))
        ? null
        : entryPriceRaw;

    const entry_notes = prompt("Entry notes (optional)")?.trim() || "";

    try {
      const res = await axios.post(
        `${API_BASE}/admin/trades`,
        {
          pair: pair.trim(),
          plan_id,
          direction,
          entry_price,
          entry_notes,
        },
        { headers: authHeaders }
      );

      const tradeId = res.data.trade?.id;
      if (!tradeId) {
        alert("Trade created, but no ID returned.");
        return loadTrades();
      }

      await axios.patch(
        `${API_BASE}/admin/trades/${tradeId}/activate`,
        {},
        { headers: authHeaders }
      );

      alert(`${pair} ${direction.toUpperCase()} is now LIVE!`);
      loadTrades();
    } catch (err: any) {
      console.error("Failed to create/activate:", err?.response?.data || err);
      alert(err?.response?.data?.error || "Failed to open trade");
    }
  };

  /* ------------------------------------------------------------
      RESOLVE TRADE
  ------------------------------------------------------------ */
  const closeTrade = async (id: number, pnl: number) => {
    if (!confirm(`Close trade with ${pnl}% PnL?`)) return;

    try {
      await axios.patch(
        `${API_BASE}/admin/trades/${id}/resolve`,
        {
          pnl_percent: pnl,
          exit_notes: pnl >= 0 ? "Target hit" : "Stop loss",
        },
        { headers: authHeaders }
      );

      alert("Trade closed.");
      loadTrades();
    } catch (err: any) {
      console.error("Resolve error:", err?.response?.data || err);
      alert(err?.response?.data?.error || "Failed");
    }
  };

  /* ------------------------------------------------------------
      HELPERS
  ------------------------------------------------------------ */
  const getDirection = (t: Trade) => t.direction || "buy";
  const isBuy = (t: Trade) => getDirection(t) === "buy";

  const activeTrades = trades.filter((t) => t.status === "active");

  /* ------------------------------------------------------------
      UI
  ------------------------------------------------------------ */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Trade Control Center</h1>
          <p className="text-gray-400 mt-1">Manage live market positions</p>
        </div>

        <button
          onClick={createAndActivate}
          className="flex items-center gap-3 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-black font-semibold rounded-xl hover:scale-105 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Open New Trade
        </button>
      </div>

      {/* ========================= ACTIVE TRADES ========================= */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeTrades.map((activeTrade) => {
          const buy = isBuy(activeTrade);

          return (
            <motion.div
              key={activeTrade.id}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="
                p-4 rounded-xl 
                bg-[#0d1628]/80 
                border border-white/10 
                shadow-lg 
                hover:shadow-2xl 
                backdrop-blur-xl 
                transition-all duration-300
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white opacity-90 tracking-wide">
                  {activeTrade.pair}
                </h2>

                {/* Blinking LIVE badge */}
                <span
                  className="
                    relative px-2.5 py-0.5 rounded-full text-[10px] font-bold 
                    bg-emerald-600/20 text-emerald-300 border border-emerald-500/20
                    animate-[liveBlink_1.2s_ease-in-out_infinite]
                  "
                >
                  LIVE
                </span>
              </div>

              {/* Direction */}
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${buy ? "bg-green-500/20" : "bg-red-500/20"}
                  `}
                >
                  {buy ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </motion.div>

                <p
                  className={`text-xs font-semibold tracking-wide ${
                    buy ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {activeTrade.direction?.toUpperCase()}
                </p>
              </div>

              {/* Notes */}
              {activeTrade.entry_notes && (
                <p className="text-gray-400 text-[11px] mb-1 leading-relaxed">
                  {activeTrade.entry_notes}
                </p>
              )}

              {activeTrade.entry_price && (
                <p className="text-gray-500 text-[11px] mb-3">
                  Entry: ${activeTrade.entry_price}
                </p>
              )}

              {/* Close Control */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/10 mt-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="PnL %"
                  className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded-md 
                             text-[11px] text-white text-center focus:outline-hidden"
                  id={`pnl-${activeTrade.id}`}
                />
                <button
                  onClick={() => {
                    const v = (
                      document.getElementById(`pnl-${activeTrade.id}`) as HTMLInputElement
                    )?.value;
                    if (!v) return alert("Enter PnL %");
                    closeTrade(activeTrade.id, Number(v));
                  }}
                  className="
                    px-3 py-1 bg-emerald-500 hover:bg-emerald-400 
                    text-black text-[11px] font-bold rounded-md 
                    transition-all shadow-xs
                  "
                >
                  Close
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>


      {/* ========================= NO ACTIVE TRADES ========================= */}
      {trades.filter((t) => t.status === "active").length === 0 && (
        <div className="text-center py-14 bg-brand-secondary/60 rounded-xl border border-dashed border-gray-700 mt-8">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No active trades at the moment</p>
        </div>
      )}

      {/* ========================= HISTORY ========================= */}
      <div className="mt-14">
        <h2 className="text-xl font-bold text-white mb-4">Past Trades</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trades
            .filter((t) => t.status === "resolved")
            .slice()
            .reverse()
            .map((trade) => {
              const isWin = Number(trade.pnl_percent || 0) > 0;
              const isBuy = (trade.direction || "buy") === "buy";

              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-xl border text-sm shadow-md hover:shadow-xl transition ${
                    isWin
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-semibold text-white">
                      {trade.pair}
                    </h3>

                    {isWin ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`font-semibold ${
                        isBuy ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {trade.direction?.toUpperCase()}
                    </span>

                    {trade.entry_price && (
                      <span className="text-gray-400 text-xs">
                        Entry: ${trade.entry_price}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xl font-bold ${
                      isWin ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {trade.pnl_percent}%
                  </p>

                  <p className="text-[11px] text-gray-500 mt-1">
                    {trade.resolved_at &&
                      format(new Date(trade.resolved_at), "MMM d, h:mm a")}
                  </p>
                </motion.div>
              );
            })}
        </div>
      </div>

    </div>
  );
}
