import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/api/http";
import { useAuth } from "@/auth/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, ZapOff, Zap } from "lucide-react";
import { LiveCandleTeaser } from './LiveCandleTeaser';  

// Use Inter or system sans for crisp, modern readability
const fontFamily = "'Inter', system-ui, sans-serif";

type Trade = {
  id: number;
  pair: string;
  entry_notes?: string | null;
  exit_notes?: string | null;
  status: "active" | "pending" | "resolved";
  pnl_percent?: string | null;
  created_at: string;
  resolved_at?: string | null;
  direction?: "LONG" | "SHORT"; // For obvious visual indication
  leverage?: number;
};

export default function TradesPage() {
  const { token } = useAuth();
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]); // Ready for multiple
  const [history, setHistory] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/trades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      // Assume backend sends { active: Trade | null } → convert to array for future-proof
      const actives = Array.isArray(data.active) ? data.active : data.active ? [data.active] : [];
      setActiveTrades(actives);
      setHistory(data.history || []);
    } catch (err) {
      console.error("Trades fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 4000);
    return () => clearInterval(interval);
  }, [token]);

  const getDirectionIcon = (direction?: string) => {
    if (!direction) return <Zap className="w-5 h-5 text-yellow-400" />;
    return direction === "LONG" ? (
      <ArrowUpRight className="w-6 h-6 text-green-400" />
    ) : (
      <ArrowDownRight className="w-6 h-6 text-red-400" />
    );
  };

  return (
    <div 
      className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8 font-[Inter] space-y-8"
      style={{ fontFamily }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold tracking-tight text-center md:text-left bg-gradient-to-r from-cyan-300 to-green-300 bg-clip-text text-transparent"
      >
        Live Signal Center
      </motion.h1>

      {/* Active Trades – Compact cards, grid-ready for multiples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-cyan-300">Current Signals</h2>

        <AnimatePresence>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-40 rounded-xl bg-gray-900/60 animate-pulse border border-gray-800" />
              ))}
            </div>
          ) : activeTrades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTrades.map((trade) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative p-5 rounded-xl bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/40 transition-all duration-300 shadow-md hover:shadow-cyan-900/20 group"
                >
                  {/* Subtle glow ring on hover/active */}
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-600 group-hover:border-cyan-400/50 transition-colors">
                          {getDirectionIcon(trade.direction)}
                        </div>
                        {/* Tiny pulse if active */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-green-400/60"
                          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{trade.pair}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-900/40 text-green-300 border border-green-700/40">
                      LIVE
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {trade.entry_notes || "Signal active — tracking momentum"}
                  </p>

                  {/* Mini status bar or future chart placeholder */}
                  <div 
                    className="relative h-16 bg-black/60 rounded-lg overflow-hidden border border-gray-800/70 isolate"
                    style={{ 
                      contain: 'paint',           // tells browser to clip strictly
                      willChange: 'transform',    // improves rendering performance/clipping
                    }}
                  >
                    <LiveCandleTeaser pair={trade.pair} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center rounded-xl bg-gray-900/50 border border-dashed border-gray-700"
            >
              <Clock className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-300">No Active Signals</p>
              <p className="text-sm text-gray-500 mt-1">Next high-conviction call incoming...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* History – Compact, scannable */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-cyan-300">Signal History</h2>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-gray-900/60 animate-pulse" />
            ))
          ) : history.length === 0 ? (
            <div className="p-6 text-center text-gray-500 bg-gray-900/40 rounded-lg">
              No closed trades yet — wins loading...
            </div>
          ) : (
            history.map((trade) => {
              const pnl = Number(trade.pnl_percent || 0);
              const isWin = pnl > 0;
              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.015 }}
                  className={`p-4 rounded-lg border ${
                    isWin ? "border-green-800/40 bg-green-950/20" : "border-red-800/40 bg-red-950/20"
                  } flex items-center justify-between hover:border-opacity-60 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    {isWin ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="font-medium">{trade.pair}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(trade.resolved_at!), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${isWin ? "text-green-400" : "text-red-400"}`}>
                      {pnl > 0 ? "+" : ""}{pnl.toFixed(2)}%
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}