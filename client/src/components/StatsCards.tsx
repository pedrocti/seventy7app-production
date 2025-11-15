// client/src/components/StatsCards.tsx
import { motion } from "framer-motion";
import { Wallet, TrendingUp, PieChart } from "lucide-react";

interface StatsCardsProps {
  balance: number;
  performance: string;
}

const StatsCards = ({ balance, performance }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="p-4 rounded-2xl bg-[#0F172A]/60 border border-[#1E293B]/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-300">Account Balance</div>
            <div className="text-2xl font-bold text-[#0AEFFF]">${balance.toLocaleString()}</div>
          </div>
          <Wallet size={28} className="text-[#0AEFFF]" />
        </div>
        <div className="mt-3 text-xs text-gray-400">Available: ${balance.toLocaleString()}</div>
      </motion.div>

      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.08}} className="p-4 rounded-2xl bg-[#0F172A]/60 border border-[#1E293B]/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-300">Performance</div>
            <div className="text-2xl font-bold text-green-400">{performance}</div>
          </div>
          <TrendingUp size={28} className="text-green-400" />
        </div>
        <div className="mt-3 text-xs text-gray-400">Last 30 days</div>
      </motion.div>

      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.16}} className="p-4 rounded-2xl bg-[#0F172A]/60 border border-[#1E293B]/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-300">Allocation</div>
            <div className="text-2xl font-bold text-[#F59E0B]">Diversified</div>
          </div>
          <PieChart size={28} className="text-[#F59E0B]" />
        </div>
        <div className="mt-3 text-xs text-gray-400">Auto rebalanced</div>
      </motion.div>
    </div>
  );
};

export default StatsCards;
