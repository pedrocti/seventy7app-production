// client/src/components/QuickActions.tsx
import { motion } from "framer-motion";

const QuickActions = () => {
  const actions = [
    { label: "Deposit", color: "bg-[#0AEFFF] text-[#0F172A]" },
    { label: "Withdraw", color: "bg-[#10B981] text-white" },
    { label: "Request PM", color: "bg-[#6366F1] text-white" },
    { label: "View Trades", color: "bg-[#F59E0B] text-white" },
  ];

  return (
    <div className="rounded-2xl p-4 bg-[#0F172A]/60 border border-[#1E293B]/40">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-300">Quick Actions</div>
        <div className="text-xs text-gray-400">Fast access</div>
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((a, i) => (
          <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`${a.color} px-4 py-2 rounded-full font-semibold transition`}>
            {a.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
