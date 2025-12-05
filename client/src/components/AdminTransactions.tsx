import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/api";   

interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Fetch transactions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveTransaction = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `${API_BASE}/admin/transactions/${id}/approve`, // <-- plural 'transactions'
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchTransactions(); // Refresh list
  } catch (err) {
    console.error("Approval error:", err);
  }
};

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="p-4 bg-[#0F172A]/60 rounded-2xl border border-[#1E293B]/40">
      <h2 className="text-lg font-bold mb-4">Pending Transactions</h2>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#1E293B]/40">
            <th className="p-2">ID</th>
            <th className="p-2">User ID</th>
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
              <td className="p-2">{tx.user_id}</td>
              <td className="p-2">{tx.type}</td>
              <td className="p-2">${tx.amount}</td>
              <td className="p-2">{tx.status}</td>
              <td className="p-2">
                {tx.status === "pending" && (
                  <button
                    className="px-2 py-1 bg-[#0AEFFF] text-black rounded"
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
