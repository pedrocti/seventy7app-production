// client/src/components/WithdrawalModal.tsx
import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";


const networks = ["TRC20 (USDT)", "ERC20 (USDT)", "BTC", "ETH", "BNB"];

export default function WithdrawalModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { token, user } = useAuth();
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState(networks[0]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const userBalance = Number(user?.balance || 0);
  const amountValue = Number(amount);
  const hasInsufficientBalance = amountValue > userBalance;
  const isValid = amountValue > 0 && amountValue <= userBalance && address.trim().length >= 10;

  const submitWithdrawal = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address: address.trim(), network, amount: amountValue }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success("Withdrawal request sent successfully!");

        // 🔹 Dispatch global event for real-time UI updates
        window.dispatchEvent(new Event("data-updated"));

        setTimeout(() => {
          setAmount("");
          setAddress("");
          setNetwork(networks[0]);
          setSubmitted(false);
          onClose();
        }, 3000);
      } else {
        toast.error(data.error || "Request failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-linear-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-12 max-w-md w-full border border-green-500/30 shadow-2xl shadow-green-500/20"
        >
          <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-center text-white mb-4">Withdrawal Sent!</h2>
          <p className="text-center text-green-400 text-2xl font-bold">${amountValue.toFixed(2)}</p>
          <p className="text-center text-gray-300 mt-4 text-lg">.</p> Confirmation processing
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-secondary rounded-2xl p-8 max-w-md w-full border border-[#1E293B]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Withdraw Funds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">Amount</label>
              <span className="text-sm text-[#0AEFFF] font-medium">
                Available: <span className="font-bold">${userBalance.toFixed(2)}</span>
              </span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="1"
              className="w-full px-4 py-4 bg-[#1E293B] rounded-lg focus:ring-2 focus:ring-green-400 outline-hidden text-white text-lg font-medium"
            />
            {hasInsufficientBalance && (
              <p className="text-red-400 text-sm mt-2 animate-pulse font-medium">
                Insufficient balance! You only have ${userBalance.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400">Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full mt-2 px-4 py-4 bg-[#1E293B] rounded-lg focus:ring-2 focus:ring-green-400 outline-hidden text-white"
            >
              {networks.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Wallet Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="T... or 0x..."
              className="w-full mt-2 px-4 py-4 bg-[#1E293B] rounded-lg focus:ring-2 focus:ring-green-400 outline-hidden font-mono text-sm"
            />
          </div>

          <button
            onClick={submitWithdrawal}
            disabled={loading || !isValid}
            className={`w-full py-5 font-bold text-lg rounded-lg transition-all ${
              loading || !isValid
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : hasInsufficientBalance
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-green-500 text-black hover:bg-green-400"
            }`}
          >
            {loading
              ? "Submitting..."
              : hasInsufficientBalance
              ? "Insufficient Balance"
              : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}
