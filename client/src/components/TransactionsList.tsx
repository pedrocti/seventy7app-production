// client/src/components/TransactionsList.tsx
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Copy, AlertCircle } from "lucide-react";
import { apiRequest } from "@/api/http";
import { parseJsonb } from "@/utils/parseJsonb";

export default function TransactionsList() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/admin/transactions"); // ✅ plural
      if (res.success && res.transactions) {
        const processed = res.transactions.map((t: any) => ({
          ...t,
          details: parseJsonb(t.details),
        }));
        setTransactions(processed);
      } else {
        setTransactions([]);
        console.warn("Failed to fetch transactions:", res.error ?? "Unknown error");
      }
    } catch (err) {
      console.error("Fetch transactions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (txId: number) => {
    if (!confirm("Approve this transaction?")) return;
    try {
      const res = await apiRequest(`/admin/transactions/${txId}/approve`, { method: "PATCH" }); // ✅ plural
      if (!res.success) throw new Error(res.error || "Failed to approve");
      fetchTransactions();
      window.dispatchEvent(new Event("transactions-updated"));
    } catch (err) {
      console.error("Approve error:", err);
      alert("Failed to approve transaction: " + (err as any).message);
    }
  };

  const handleReject = (tx: any) => {
    setSelectedTx(tx);
    setReason("");
    setShowModal(true);
  };

  const confirmReject = async () => {
    if (!selectedTx) return;
    try {
      const res = await apiRequest(`/admin/transactions/${selectedTx.id}/approve`, { // ✅ plural
        method: "PATCH",
        body: JSON.stringify({ reject: true, reason: reason.trim() || "No reason provided" }),
      });
      if (!res.success) throw new Error(res.error || "Failed to reject");
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      console.error("Reject error:", err);
      alert("Failed to reject transaction: " + (err as any).message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading)
    return <p className="text-center py-16 text-gray-400">Loading transactions...</p>;

  if (transactions.length === 0)
    return <p className="text-center py-20 text-2xl text-gray-500">No transactions found</p>;

  return (
    <>
      <div className="space-y-6">
        {transactions.map((t) => {
          const details = t.details;
          const isWithdrawal = t.type === "withdrawal";
          const address = details?.address?.trim();
          const network = details?.network
            ? details.network.toUpperCase().replace(/\s+/g, "").replace("(USDT)", "")
            : null;

          return (
            <div
              key={t.id}
              className="bg-[#1E293B]/80 rounded-2xl border border-[#334155] hover:border-cyan-500/60 transition-all p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Left Side */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <p className="text-2xl font-bold text-white">
                      {isWithdrawal ? "-" : "+"}${Math.abs(t.amount).toFixed(2)}
                    </p>
                    <span className="text-gray-400">• {t.username || "Unknown User"}</span>
                    {isWithdrawal && network && (
                      <span className="text-sm bg-purple-600/30 text-purple-300 px-4 py-1.5 rounded-full font-bold border border-purple-500/50">
                        {network}
                      </span>
                    )}
                    {isWithdrawal && details?._error && (
                      <span className="text-xs bg-red-600/20 text-red-400 px-3 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle size={14} />
                        Details Error
                      </span>
                    )}
                  </div>

                  {isWithdrawal && address && (
                    <div className="mt-4 p-5 bg-black/50 rounded-xl border border-cyan-600/40">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                            Send To
                          </p>
                          <p className="text-sm font-mono text-cyan-400 break-all mt-1">{address}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(address)}
                          className="p-3 bg-cyan-600/20 hover:bg-cyan-600/40 rounded-xl transition-all"
                          title="Copy address"
                        >
                          <Copy className="w-5 h-5 text-cyan-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-500 mt-3">
                    {format(new Date(t.created_at), "MMM d, yyyy • h:mm a")}
                  </p>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${
                        t.type === "deposit"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                          : "bg-orange-500/20 text-orange-400 border border-orange-500/50"
                      }`}
                    >
                      {t.type}
                    </span>
                    <span
                      className={`px-6 py-2 rounded-full text-sm font-bold uppercase border-2 ${
                        t.status === "completed"
                          ? "bg-green-500/20 text-green-400 border-green-500/60"
                          : t.status === "rejected"
                          ? "bg-red-500/20 text-red-400 border-red-500/60"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/60 animate-pulse"
                      }`}
                    >
                      {t.status === "pending" ? "PENDING" : t.status.toUpperCase()}
                    </span>
                  </div>

                  {t.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(t.id)}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold text-sm transition shadow-lg"
                      >
                        Approve & Send
                      </button>
                      <button
                        onClick={() => handleReject(t)}
                        className="px-6 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject Modal */}
      {showModal && selectedTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] p-8 rounded-3xl border-2 border-red-500/50 max-w-lg w-full shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-6">Reject Transaction</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                User: <strong className="text-white">{selectedTx.username}</strong>
              </p>
              <p>
                Amount: <strong className="text-white">${Math.abs(selectedTx.amount).toFixed(2)}</strong>
              </p>
              <p>
                Type: <strong className="text-white">{selectedTx.type.toUpperCase()}</strong>
              </p>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full mt-6 p-4 bg-[#0F172A] border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-red-500 outline-none resize-none"
              rows={5}
            />

            <div className="flex gap-4 mt-8 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold transition shadow-lg"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
