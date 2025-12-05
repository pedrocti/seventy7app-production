// COMPACT BINANCE-STYLE STAT CARDS (Optimized)
import { motion } from "framer-motion";
import { Wallet, Gift, TrendingUp, Sparkles } from "lucide-react";

interface StatsCardsProps {
  balance: string;
  bonus: string;
  totalAvailable: string;
  performance: string;
}

const GOLD = "#F0B90B";
const GOLD_SOFT = "#F8D84A";
const GOLD_DEEP = "#C48F00";
const DARK_1 = "#0A0A0A";
const DARK_2 = "#1A1A1A";

const StatsCards = ({ balance, bonus, totalAvailable, performance }: StatsCardsProps) => {
  const hasBonus = Number(bonus) > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* MAIN BALANCE */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 shadow border"
        style={{
          background: `linear-gradient(135deg, ${DARK_1}, ${DARK_2})`,
          borderColor: GOLD + "30",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#b3b3b3] flex items-center gap-1">
              <Wallet className="w-3 h-3 text-[#777]" />
              Main Balance
            </p>

            <p className="text-2xl font-bold mt-1" style={{ color: GOLD }}>
              ${balance}
            </p>
          </div>

          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: GOLD + "22" }}
          >
            <Wallet className="w-5 h-5" style={{ color: GOLD }} />
          </div>
        </div>

        <p className="text-[11px] mt-2 text-[#777]">Available for withdrawal</p>
      </motion.div>

      {/* REFERRAL BONUS */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-4 shadow border"
        style={{
          background: hasBonus
            ? `linear-gradient(135deg, ${GOLD_DEEP}22, ${GOLD}22)`
            : `linear-gradient(135deg, ${DARK_1}, ${DARK_2})`,
          borderColor: hasBonus ? GOLD + "55" : "#333",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#b3b3b3] flex items-center gap-1">
              <Gift className="w-3 h-3 text-[#777]" />
              Referral Bonus
            </p>

            <p
              className="text-2xl font-bold mt-1"
              style={{ color: hasBonus ? GOLD_SOFT : "#555" }}
            >
              ${bonus}
            </p>
          </div>

          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: hasBonus ? GOLD + "30" : "#222" }}
          >
            {hasBonus ? (
              <Sparkles className="w-5 h-5" style={{ color: GOLD_SOFT }} />
            ) : (
              <Gift className="w-4 h-4 text-[#555]" />
            )}
          </div>
        </div>

        <p className="text-[11px] mt-2" style={{ color: "#888" }}>
          {hasBonus ? "Ready to invest" : "Invite friends to earn"}
        </p>
      </motion.div>

      {/* TOTAL AVAILABLE */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-4 shadow border"
        style={{
          background: `linear-gradient(90deg, ${GOLD}22, ${GOLD_SOFT}15, ${GOLD}22)`,
          borderColor: GOLD + "55",
        }}
      >
        <p className="text-xs font-medium" style={{ color: GOLD_SOFT }}>
          Total Available
        </p>

        <p className="text-3xl font-bold mt-1" style={{ color: GOLD }}>
          ${totalAvailable}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <TrendingUp className="w-4 h-4" style={{ color: "#4eff8a" }} />
          <span className="text-sm font-bold" style={{ color: "#4eff8a" }}>
            {performance}
          </span>
          <span className="text-[10px] text-[#888]">Performance</span>
        </div>

        {/* Gold chip */}
        <div className="flex justify-end mt-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
            }}
          >
            <span className="text-lg font-black text-black">77</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsCards;
