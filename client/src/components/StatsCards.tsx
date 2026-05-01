import { motion } from "framer-motion";
import { Wallet, Gift, TrendingUp, Sparkles } from "lucide-react";

interface StatsCardsProps {
  balance: number;
  bonus: number;
  totalAvailable: number;
  performance: string;
  username?: string;
}

const CYAN = "#0AEFFF";
const CYAN_SOFT = "#4AFFF5";
const CYAN_DARK = "#0088CC";
const GREEN_ACCENT = "#0ECB81";

const DARK_1 = "#0A0A0A";
const DARK_2 = "#1A1A1A";

const StatsCards = ({
  balance,
  bonus,
  totalAvailable,
  performance,
  username,
}: StatsCardsProps) => {
  const hasBonus = bonus > 0;

  return (
    <div className="space-y-4">
      {/* WELCOME HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-1"
      >
        <h2 className="text-xl font-semibold text-white">
          Welcome back{username ? `, ${username}` : ""} 👋
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Here’s a snapshot of your account
        </p>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MAIN BALANCE */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 shadow border backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${DARK_1}, ${DARK_2})`,
            borderColor: `${CYAN}30`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-gray-500" />
                Main Balance
              </p>
              <p className="text-2xl font-bold mt-1.5" style={{ color: CYAN }}>
                ${balance.toFixed(2)}
              </p>
            </div>
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: `${CYAN}15` }}
            >
              <Wallet className="w-5 h-5" style={{ color: CYAN }} />
            </div>
          </div>
          <p className="text-xs mt-2 text-gray-500">
            Available for withdrawal
          </p>
        </motion.div>

        {/* REFERRAL BONUS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 shadow border backdrop-blur-sm"
          style={{
            background: hasBonus
              ? `linear-gradient(135deg, ${GREEN_ACCENT}15, ${GREEN_ACCENT}08)`
              : `linear-gradient(135deg, ${DARK_1}, ${DARK_2})`,
            borderColor: hasBonus ? `${GREEN_ACCENT}40` : "#333",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-gray-500" />
                Referral Bonus
              </p>
              <p
                className="text-2xl font-bold mt-1.5"
                style={{ color: hasBonus ? GREEN_ACCENT : "#555" }}
              >
                ${bonus.toFixed(2)}
              </p>
            </div>
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: hasBonus ? `${GREEN_ACCENT}20` : "#222" }}
            >
              {hasBonus ? (
                <Sparkles
                  className="w-5.5 h-5.5"
                  style={{ color: GREEN_ACCENT }}
                />
              ) : (
                <Gift className="w-5 h-5 text-gray-600" />
              )}
            </div>
          </div>
          <p className="text-xs mt-2 text-gray-500">
            {hasBonus ? "Ready to invest" : "Invite friends to earn"}
          </p>
        </motion.div>

        {/* TOTAL AVAILABLE */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 shadow border backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${CYAN_DARK}20, ${CYAN}12, ${CYAN_DARK}20)`,
            borderColor: `${CYAN}40`,
          }}
        >
          <p className="text-xs font-medium" style={{ color: CYAN_SOFT }}>
            Total Available
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: CYAN }}>
            ${totalAvailable.toFixed(2)}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <TrendingUp className="w-4 h-4" style={{ color: GREEN_ACCENT }} />
            <span className="text-sm font-bold" style={{ color: GREEN_ACCENT }}>
              {performance}
            </span>
            <span className="text-xs text-gray-500">Performance</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StatsCards;
