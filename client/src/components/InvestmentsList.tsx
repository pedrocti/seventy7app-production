// client/src/components/InvestmentsList.tsx
import { motion } from "framer-motion";

interface Investment {
  id: number | string;
  plan?: string | { name: string } | null;
  amount?: string | number | null;
  profit_loss?: string | number | null;
  progress?: string | number | null;
  start_at?: string | null;
  status?: string | null;
  duration_days?: number | null;
}

interface InvestmentsListProps {
  investments: Investment[];
}

export default function InvestmentsList({ investments }: InvestmentsListProps) {
  // Super safe formatters — NEVER crash
  const formatMoney = (val: any): string => {
    if (val === null || val === undefined || val === "") return "0.00";
    const num = Number(val);
    return isNaN(num) ? "0.00" : num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatPercent = (val: any): string => {
    if (val === null || val === undefined || val === "") return "+0.00";
    const num = Number(val);
    if (isNaN(num)) return "+0.00";
    return num >= 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
  };

  const safeUpper = (str: any): string => {
    if (typeof str !== "string") return "UNKNOWN";
    return str.toUpperCase();
  };

  const getPlanName = (plan: any): string => {
    if (!plan) return "Managed Portfolio";
    if (typeof plan === "string") return plan;
    if (plan.name) return plan.name;
    return "Active Investment";
  };

  if (!investments || investments.length === 0) {
    return (
      <div className="text-gray-400 text-center py-10 border border-[#1E293B]/40 rounded-2xl bg-brand-secondary/60">
        <p className="text-lg">No active investments yet</p>
        <p className="text-sm mt-2">Your capital will appear here once invested</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {investments.map((inv, i) => {
        const profitValue = inv.profit_loss ?? inv.progress ?? 0;
        const isPositive = Number(profitValue) >= 0;

        return (
          <motion.article
            key={inv.id ?? i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-brand-secondary/80 backdrop-blur-xs p-5 rounded-2xl border border-[#1E293B]/60 hover:border-[#0AEFFF]/40 transition-all duration-300 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-300 font-medium">
                  {getPlanName(inv.plan)}
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  ${formatMoney(inv.amount)}
                </div>
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-3">
                  <span>
                    Started {inv.start_at ? new Date(inv.start_at).toLocaleDateString() : "Today"}
                  </span>
                  {inv.duration_days && <span>• {inv.duration_days} days</span>}
                </div>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-black ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {formatPercent(profitValue)}
                </div>
                <div className="text-xs text-gray-500 mt-1">ID #{inv.id ?? "—"}</div>
                <div className="mt-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      inv.status === "active"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : inv.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {safeUpper(inv.status ?? "PENDING")}
                  </span>
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}