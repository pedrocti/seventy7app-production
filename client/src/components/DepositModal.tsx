// client/src/components/DepositModal.tsx
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, X, CircleCheck } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";


interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { token } = useAuth();
  const [addressInfo, setAddressInfo] = useState<{ address: string; network: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // ← NEW: CONFIRMATION STATE

  useEffect(() => {
    if (!isOpen || !token) return;
    fetch("/api/deposit/address", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.address) {
          setAddressInfo(res.address);
        } else {
          toast.error("No active deposit address");
        }
      });
  }, [isOpen, token]);

  const copyAddress = () => {
    if (!addressInfo?.address) return;
       navigator.clipboard.writeText(addressInfo.address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const submitDeposit = async () => {
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: numAmount }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true); // ← SHOW SUCCESS SCREEN
        toast.success("Deposit Submitted Successfully!");

        // Auto-refresh transactions list
        window.dispatchEvent(new Event("depositSubmitted"));

        // Auto-close after 3 seconds
        setTimeout(() => {
          setAmount("");
          setSubmitted(false);
          onClose();
        }, 3000);
      } else {
        toast.error(data.error || "Failed to submit deposit");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // SUCCESS CONFIRMATION SCREEN
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-12 max-w-md w-full border border-[#0AEFFF]/30 shadow-2xl shadow-cyan-500/20">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CircleCheck className="w-24 h-24 text-[#0AEFFF] mx-auto mb-6" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Deposit Request Sent!</h2>
            <p className="text-lg text-gray-300 mb-2">
              Amount: <span className="text-[#0AEFFF] font-bold">${Number(amount).toFixed(2)}</span>
            </p>
            <p className="text-gray-400 mb-8">
              Your deposit is <span className="text-yellow-400 font-bold">Pending Approval</span>
            </p>
            <p className="text-sm text-gray-500">
              Balance will be updated automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F172A] rounded-2xl p-8 max-w-md w-full border border-[#1E293B]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Deposit Funds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {addressInfo ? (
          <>
            <div className="text-center mb-6">
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <QRCodeSVG value={addressInfo.address} size={180} />
              </div>
              <div className="bg-[#1E293B] p-4 rounded-lg font-mono text-sm break-all mb-2">
                {addressInfo.address}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm mb-4">
                <span className="text-gray-400">Network:</span>
                <span className="text-[#0AEFFF] font-semibold">{addressInfo.network}</span>
              </div>
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 mx-auto text-[#0AEFFF] hover:text-cyan-300"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "Copied!" : "Copy Address"}
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="Enter amount (for record)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-[#1E293B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AEFFF] text-white"
              />
              <button
                onClick={submitDeposit}
                disabled={loading}
                className="w-full py-4 bg-[#0AEFFF] text-black font-bold rounded-lg hover:bg-cyan-400 transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Deposit Request"}
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-yellow-400 text-lg py-12">
            No active deposit address. Please try again later.
          </p>
        )}
      </div>
    </div>
  );
}