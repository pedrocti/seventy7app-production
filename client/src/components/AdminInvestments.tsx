import { useEffect, useState } from "react";
import axios from "axios";

interface InvestmentRequest {
  id: number;
  user_id: number;
  amount: number;
  status: "pending" | "approved" | "rejected";
}

interface Investment {
  id: number;
  user_id: number;
  amount: number;
  plan: string;
  status: string;
  progress: number;
  start_at: string;
}

export default function AdminInvestments() {
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      // fetch pending investment requests
      const reqRes = await axios.get("http://localhost:5050/api/admin/investment-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(reqRes.data.requests || []);

      // fetch active investments
      const invRes = await axios.get("http://localhost:5050/api/admin/investments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvestments(invRes.data.investments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id: number) => {
    try {
      await axios.patch(`http://localhost:5050/api/admin/investment-request/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(); // refresh data
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading investments...</div>;

  return (
    <div className="space-y-6">
      {/* Pending Investment Requests */}
      <div className="p-4 bg-[#0F172A]/60 rounded-2xl border border-[#1E293B]/40">
        <h2 className="text-lg font-bold mb-4">Pending Trading Investment Requests</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#1E293B]/40">
              <th className="p-2">ID</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} className="border-b border-[#1E293B]/20">
                <td className="p-2">{r.id}</td>
                <td className="p-2">{r.user_id}</td>
                <td className="p-2">${r.amount}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">
                  {r.status === "pending" && (
                    <button
                      className="px-2 py-1 bg-[#0AEFFF] text-black rounded"
                      onClick={() => approveRequest(r.id)}
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

      {/* Active Investments */}
      <div className="p-4 bg-[#0F172A]/60 rounded-2xl border border-[#1E293B]/40">
        <h2 className="text-lg font-bold mb-4">Active Trading Investments</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#1E293B]/40">
              <th className="p-2">ID</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Plan</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Progress</th>
            </tr>
          </thead>
          <tbody>
            {investments.map(inv => (
              <tr key={inv.id} className="border-b border-[#1E293B]/20">
                <td className="p-2">{inv.id}</td>
                <td className="p-2">{inv.user_id}</td>
                <td className="p-2">{inv.plan}</td>
                <td className="p-2">${inv.amount}</td>
                <td className="p-2">{inv.status}</td>
                <td className="p-2">{inv.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
