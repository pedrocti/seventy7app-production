// client/src/components/AdminInvestments.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { API_BASE } from "@/api/http";

type InvStatus = "active" | "completed" | "cancelled" | string;

interface Investment {
  id: number;
  user_id: number;
  username?: string | null;
  amount: number;
  plan_id?: number | null;
  plan_name?: string | null;
  status: InvStatus;
  progress?: number;
  profit_loss?: number | string;
  start_at?: string | null;
  created_at?: string | null;
}

interface TradingPlan {
  id: number;
  name: string;
  min_amount: number;
  max_amount?: number | null;
  // add more fields if you need
}

export default function AdminInvestments() {
  const { user, token } = useAuth();
  const isAdmin = user?.role?.toLowerCase?.() === "admin";

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [plans, setPlans] = useState<TradingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!isAdmin) return;

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!token) throw new Error("No token");

      const [invRes, planRes] = await Promise.all([
        fetch(`${API_BASE}/admin/investments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/admin/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!invRes.ok || !planRes.ok) {
        const msg = `Server error: ${invRes.status}/${planRes.status}`;
        throw new Error(msg);
      }

      const invJson = await invRes.json();
      const planJson = await planRes.json();

      // FIX: correct mapping
      setInvestments(
        (invJson.investments || []).map((inv: any) => ({
          id: inv.investment_id,
          user_id: inv.investment_user_id,
          username: inv.user_username,
          amount: Number(inv.investment_amount),
          plan_id: inv.investment_plan_id,
          plan_name: inv.plan_name,
          status: inv.investment_status,
          progress: Number(inv.investment_progress ?? 0),
          profit_loss: Number(inv.investment_profit_loss ?? 0),
          start_at: inv.investment_start_at,
          created_at: inv.investment_created_at,
        }))
      );


      // FIX: set plans (was missing)
      setPlans(planJson.plans || []);

    } catch (err: any) {
      console.error("Admin investments fetch error:", err);
      setError(err?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [isAdmin, token]);


  if (!isAdmin) {
    return <div className="p-6 text-yellow-300">Not authorized. Admins only.</div>;
  }

  if (loading) return <div className="p-6 text-gray-300">Loading investments...</div>;
  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;

  const active = investments.filter((i) => i.status?.toLowerCase() === "active");
const completed = investments.filter((i) => i.status?.toLowerCase() === "completed");

  return (
    <div className="space-y-6">
      {/* Active Investments */}
      <div className="p-4 bg-[#0F172A]/60 rounded-2xl border border-[#1E293B]/40">
        <h2 className="text-lg font-bold mb-4">Active Investments ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-gray-400">No active investments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1E293B]/40">
                  <th className="p-2">ID</th>
                  <th className="p-2">User</th>
                  <th className="p-2">Plan</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Progress</th>
                  <th className="p-2">Profit</th>
                  <th className="p-2">Started</th>
                </tr>
              </thead>
              <tbody>
                {active.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#1E293B]/20">
                    <td className="p-2">{inv.id}</td>
                    <td className="p-2">{inv.username ?? `#${inv.user_id}`}</td>
                    <td className="p-2">{inv.plan_name ?? `Plan #${inv.plan_id}`}</td>
                    <td className="p-2">${Number(inv.amount).toFixed(2)}</td>
                    <td className="p-2">{(inv.progress ?? 0).toFixed(2)}%</td>
                    <td className="p-2">${Number(inv.profit_loss ?? 0).toFixed(2)}</td>
                    <td className="p-2 text-sm text-gray-400">
                      {inv.start_at ? new Date(String(inv.start_at)).toLocaleString() : inv.created_at ? new Date(String(inv.created_at)).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed Investments */}
      <div className="p-4 bg-[#0F172A]/60 rounded-2xl border border-[#1E293B]/40">
        <h2 className="text-lg font-bold mb-4">Completed Investments ({completed.length})</h2>

        {completed.length === 0 ? (
          <p className="text-gray-400">No completed investments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1E293B]/40">
                  <th className="p-2">ID</th>
                  <th className="p-2">User</th>
                  <th className="p-2">Plan</th>
                  <th className="p-2">Final Amount</th>
                  <th className="p-2">Total Profit</th>
                  <th className="p-2">Started</th>
                  <th className="p-2">Completed</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#1E293B]/20">
                    <td className="p-2">{inv.id}</td>
                    <td className="p-2">{inv.username ?? `#${inv.user_id}`}</td>
                    <td className="p-2">{inv.plan_name ?? `Plan #${inv.plan_id}`}</td>
                    <td className="p-2">${Number(inv.amount).toFixed(2)}</td>
                    <td className="p-2">${Number(inv.profit_loss ?? 0).toFixed(2)}</td>
                    <td className="p-2 text-sm text-gray-400">
                      {inv.start_at ? new Date(String(inv.start_at)).toLocaleString() : "-"}
                    </td>
                    <td className="p-2 text-sm text-gray-400">
                      {inv.created_at ? new Date(String(inv.created_at)).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
