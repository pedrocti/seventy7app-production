// client/src/components/QuickActions.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import DepositModal from "./DepositModal";

const QuickActions = () => {
  const [depositOpen, setDepositOpen] = useState(false);

  const actions = [
    { label: "Deposit", color: "bg-[#0AEFFF] text-brand-secondary", onClick: () => setDepositOpen(true) },
    { label: "Withdraw", color: "bg-[#10B981] text-white", onClick: () => {} }, // Add your handler later
    { label: "Request PM", color: "bg-[#6366F1] text-white", onClick: () => {} }, // Add handler
    { label: "View Trades", color: "bg-[#F59E0B] text-white", onClick: () => {} }, // Add handler
  ];

  return (
    <>
      <div className="rounded-2xl p-4 bg-brand-secondary/60 border border-[#1E293B]/40">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-300">Quick Actions</div>
          <div className="text-xs text-gray-400">Fast access</div>
        </div>
        <div className="flex flex-wrap gap-3">
          {actions.map((a, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={a.onClick}
              className={`${a.color} px-6 py-3 rounded-full font-bold transition shadow-lg`}
            >
              {a.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
    </>
  );
};

export default QuickActions;