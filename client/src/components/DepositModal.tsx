// client/src/components/DepositModal.tsx
import { useState } from "react";
import { X, CreditCard, Coins } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { token } = useAuth();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"card" | "crypto">("card");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const startDeposit = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) {
      toast.error("Minimum deposit is $100");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/deposits/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: numAmount, method }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Deposit failed");
      }

      // CARD → Redirect to Stripe Checkout
      if (method === "card" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }


      // CRYPTO → NOWPayments invoice URL
      if (method === "crypto" && data.paymentUrl) {
        window.open(data.paymentUrl, "_blank", "noopener,noreferrer");
        toast.success("Opening secure payment page...");
        onClose();
        return;
      }

      throw new Error("Invalid response from server");
    } catch (err: any) {
      toast.error(err.message || "Failed to start deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F172A] rounded-2xl p-8 max-w-md w-full border border-[#1E293B] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Deposit Funds</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Payment Method Tabs */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setMethod("card")}
            className={`flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all ${
              method === "card"
                ? "bg-[#0AEFFF] text-black shadow-lg"
                : "bg-[#1E293B] text-gray-300 hover:bg-[#334155]"
            }`}
          >
            <CreditCard size={20} />
            Card
          </button>
          <button
            onClick={() => setMethod("crypto")}
            className={`flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all ${
              method === "crypto"
                ? "bg-[#0AEFFF] text-black shadow-lg"
                : "bg-[#1E293B] text-gray-300 hover:bg-[#334155]"
            }`}
          >
            <Coins size={20} />
            Crypto
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-8">
          <label className="block text-sm text-gray-400 mb-2">Amount (USD)</label>
          <input
            type="number"
            min="10"
            placeholder="Minimum $10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-5 py-4 bg-[#1E293B] rounded-xl text-white text-lg font-medium focus:outline-none focus:ring-4 focus:ring-[#0AEFFF]/50 transition"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={startDeposit}
          disabled={loading || !amount}
          className="w-full py-5 bg-[#0AEFFF] text-black text-lg font-bold rounded-xl hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? "Processing..." : `Pay with ${method === "card" ? "Card" : "Crypto"}`}
        </button>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Secured by {method === "card" ? "Stripe" : "NOWPayments"} • Instant credit on confirmation
        </p>
      </div>
    </div>
  );
}