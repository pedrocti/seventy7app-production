// client/src/dashboard/TradesPage.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/api/http";
import { useAuth } from "@/auth/AuthContext";
import { format } from "date-fns";
import { TrendingUp, Clock, CheckCircle, XCircle, Zap } from "lucide-react";

type Trade = {
  id: number;
  pair: string;
  entry_notes?: string | null;
  exit_notes?: string | null;
  status: "active" | "pending" | "resolved";
  pnl_percent?: string | null;
  created_at: string;
  resolved_at?: string | null;
};

export default function TradesPage() {
  const { token } = useAuth();
  const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
  const [history, setHistory] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/trades`, { // ← Now public endpoint
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setActiveTrade(data.active);
      setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to load public trades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 8000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="p-6 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black bg-gradient-to-r from-[#0AEFFF] to-cyan-300 bg-clip-text text-transparent"
      >
        Live Trade Center
      </motion.h1>

      {/* LIVE ACTIVE TRADE */}
      {activeTrade && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600/20 via-teal-600/20 to-cyan-600/20 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
          <div className="relative p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
                <Zap className="absolute inset-0 m-auto w-10 h-10 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-black text-white">{activeTrade.pair}</h2>
                  <span className="px-4 py-2 bg-emerald-500/30 border border-emerald-400 rounded-full text-emerald-300 font-bold text-sm">
                    LIVE
                  </span>
                </div>
                <p className="text-xl text-gray-300 mt-2">
                  {activeTrade.entry_notes || "Trade in progress..."}
                </p>
                <p className="text-sm text-gray-400 mt-4">
                  Started {format(new Date(activeTrade.created_at), "PPP p")}
                </p>
              </div>
            </div>
            <TrendingUp className="w-16 h-16 text-emerald-400 animate-bounce" />
          </div>
        </motion.div>
      )}

      {/* NO ACTIVE TRADE */}
      {!activeTrade && !loading && (
        <div className="text-center py-20 bg-[#0F172A]/60 rounded-3xl border border-dashed border-gray-600">
          <Clock className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <p className="text-2xl text-gray-400">No active trade right now</p>
          <p className="text-gray-500 mt-2">When admin opens a trade, it will appear here live</p>
        </div>
      )}

      {/* TRADE HISTORY */}
      <div>
        <h2 className="text-2xl font-bold text-[#0AEFFF] mb-6">Trade History</h2>
        <div className="space-y-4">
          {history.map((trade) => {
            const isWin = Number(trade.pnl_percent || 0) > 0;
            const pnl = trade.pnl_percent ? Number(trade.pnl_percent) : 0;

            return (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-6 rounded-2xl border ${
                  isWin
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isWin ? (
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-400" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white">{trade.pair}</h3>
                      <p className="text-gray-400">{trade.exit_notes || "Trade closed"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-black ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                      {pnl > 0 ? "+" : ""}{pnl.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {trade.resolved_at && format(new Date(trade.resolved_at), "PPp")}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}