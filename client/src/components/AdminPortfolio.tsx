import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/api/http";

interface Portfolio {
  id: number;
  user_id: number;
  asset: string;
  percentage: number;
  duration: string;
}

interface PortfolioRequest {
  id: number;
  user_id: number;
  amount: number;
  duration: string;
  status: "pending" | "approved" | "rejected";
}

export default function AdminPortfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [requests, setRequests] = useState<PortfolioRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Active portfolios
        const pRes = await axios.get(`${API_BASE}/admin/portfolio-requests/portfolios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPortfolios(pRes.data.portfolios || []);

      // Pending requests
      const rRes = await axios.get(`${API_BASE}/admin/portfolio-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(rRes.data.requests || []);
    } catch (err) {
      console.error("Admin portfolio fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id: number) => {
    try {
      await axios.patch(
        `${API_BASE}/admin/portfolio-requests/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchData();
    } catch (err) {
      console.error("Approve request error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading portfolios...</div>;

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <div className="p-4 bg-brand-secondary/60 rounded-2xl border border-[#1E293B]/40">
        <h2 className="text-lg font-bold mb-4">Pending Portfolio Requests</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#1E293B]/40">
              <th className="p-2">ID</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Duration</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} className="border-b border-[#1E293B]/20">
                <td className="p-2">{r.id}</td>
                <td className="p-2">{r.user_id}</td>
                <td className="p-2">${r.amount}</td>
                <td className="p-2">{r.duration}</td>
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

      {/* Active Portfolios */}
      <div className="p-4 bg-brand-secondary/60 rounded-2xl border border-[#1E293B]/40">
        <h2 className="text-lg font-bold mb-4">Active Portfolios</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#1E293B]/40">
              <th className="p-2">ID</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Asset</th>
              <th className="p-2">Percentage</th>
              <th className="p-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {portfolios.map(p => (
              <tr key={p.id} className="border-b border-[#1E293B]/20">
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.user_id}</td>
                <td className="p-2">{p.asset}</td>
                <td className="p-2">{p.percentage}%</td>
                <td className="p-2">{p.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
