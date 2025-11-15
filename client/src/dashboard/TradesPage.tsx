import { motion } from "framer-motion";

export default function TradesPage() {
  return (
    <div className="p-6 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-[#0AEFFF]"
      >
        Trade History
      </motion.h1>

      <div className="bg-[#0F172A]/60 p-6 rounded-2xl border border-[#1E293B]/40">
        <p className="text-gray-400">
          View all trading activities, active and completed sessions. Filters and analytics will be added here.
        </p>
      </div>
    </div>
  );
}
