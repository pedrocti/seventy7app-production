// client/src/components/AdminTransactions.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/api";   

interface Transaction {
  id: number;
  user_id: number;
  username: string;
  wallet?: string | null;
  type: string;       // 'deposit' | 'withdrawal'
  amount: string;     // formatted as string with 2 decimals
  status: string;     // 'pending' | 'completed' | etc.
  created_at: string;
  details?: string | null;
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const res = await axios.get(`${API_BASE}/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(res.data.transactions || []);
    } catch (err: any) {
      console.error("Fetch transactions error:", err);
      setError(err?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const approveTransaction = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      await axios.patch(
        `${API_BASE}/admin/transactions/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchTransactions(); // Refresh list
    } catch (err: any) {
      console.error("Approval error:", err);
      setError(err?.message || "Failed to approve transaction");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="p-4 bg-[#0F172A]/60 rounded-2xl border border-[#1E293B]/40">
      <h2 className="text-lg font-bold mb-4">User Transactions</h2>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#1E293B]/40">
            <th className="p-2">ID</th>
            <th className="p-2">User</th>
            <th className="p-2">Wallet</th>
            <th className="p-2">Type</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-[#1E293B]/20">
              <td className="p-2">{tx.id}</td>
              <td className="p-2">{tx.username}</td>
              <td className="p-2 flex items-center space-x-2">
                <span className="truncate max-w-xs">{tx.wallet || "-"}</span>
                {tx.wallet && (
                  <button
                    className="px-2 py-1 bg-[#0AEFFF] text-black rounded text-xs"
                    onClick={() => navigator.clipboard.writeText(tx.wallet!)}
                  >
                    Copy
                  </button>
                )}
              </td>
              <td className="p-2 capitalize">{tx.type}</td>
              <td className="p-2">${tx.amount}</td>
              <td className={`p-2 font-semibold ${
                tx.status === "pending" ? "text-yellow-400" :
                tx.status === "completed" ? "text-green-400" :
                "text-gray-400"
              }`}>
                {tx.status}
              </td>
              <td className="p-2">
                {tx.type === "withdrawal" && tx.status === "pending" && (
                  <button
                    className="px-3 py-1 bg-[#0AEFFF] text-black rounded hover:brightness-110 transition text-sm"
                    onClick={() => approveTransaction(tx.id)}
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
