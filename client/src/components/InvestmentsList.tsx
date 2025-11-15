import { motion } from "framer-motion";

interface Investment {
  id: string;
  plan: string;
  amount: number;
  start_at: string;
  status: string;
  progress: number;
}

interface InvestmentsListProps {
  investments: Investment[];
}

export default function InvestmentsList({ investments }: InvestmentsListProps) {
  if (!investments || investments.length === 0) {
    return (
      <div className="text-gray-400 text-center py-6 border border-[#1E293B]/40 rounded-2xl bg-[#0F172A]/60">
        No active investments yet. Start investing to see your portfolio grow.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {investments.map((inv, i) => (
        <motion.article
          key={inv.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-[#0F172A]/60 p-4 rounded-2xl border border-[#1E293B]/40 flex items-center justify-between hover:border-[#0AEFFF]/30 transition"
        >
          <div>
            <div className="text-sm text-gray-300">
              {inv.plan} • {new Date(inv.start_at).toLocaleDateString()}
            </div>
            <div className="font-semibold text-white">
              ${inv.amount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">
              Status:{" "}
              <span
                className={
                  inv.status === "active"
                    ? "text-green-400"
                    : inv.status === "pending"
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                {inv.status}
              </span>{" "}
              • Progress: {inv.progress}%
            </div>
          </div>
          <div className="text-right">
            <div
              className={
                inv.progress >= 0
                  ? "text-green-400 font-bold"
                  : "text-red-400 font-bold"
              }
            >
              {inv.progress >= 0 ? `+${inv.progress}%` : `${inv.progress}%`}
            </div>
            <div className="text-xs text-gray-500">{inv.id}</div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
