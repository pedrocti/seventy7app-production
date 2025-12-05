import { useEffect, useState } from "react";
import axios from "axios";
import PlanForm from "./PlanForm";
import { Plus, Pencil, Trash, TrendingUp, Wallet } from "lucide-react";
import { API_BASE } from "@/api/http";

type Plan = {
  id: number | string;
  name: string;
  minAmount: number;
  maxAmount: number | null;
  description?: string;
  durationDays: number;
  progressPercent?: number;
  profitLoss?: number;
  lastUpdate?: string;
};

function mapServerToPlan(s: any): Plan {
  return {
    id: s.id,
    name: s.name,
    minAmount: Number(s.min_amount ?? 0),
    maxAmount:
      s.max_amount === null || s.max_amount === undefined
        ? null
        : Number(s.max_amount),
    description: s.description ?? "",
    durationDays: Number(s.duration_days ?? 0),
    progressPercent: Number(s.progress_percent ?? 0),
    profitLoss: Number(s.profit_loss ?? 0),
    lastUpdate: s.last_update ? String(s.last_update) : undefined,
  };
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/plans`, { headers: authHeaders });
      const serverPlans: any[] = res.data.plans ?? [];
      const mapped = serverPlans.map(mapServerToPlan);
      setPlans(mapped);
      localStorage.setItem("investment_plans", JSON.stringify(mapped));
    } catch (err) {
      // fallback to local
      const raw = localStorage.getItem("investment_plans");
      if (raw) {
        try {
          setPlans(JSON.parse(raw));
        } catch {
          setPlans([]);
        }
      } else {
        setPlans([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const createPlan = async (formData: any) => {
  setSaving(true);
  try {
    if (token) {
      // Transform frontend snake_case → backend snake_case (already correct)
      // But we receive whatever PlanForm sends — just ensure types
      const payload = {
        name: String(formData.name || "").trim(),
        min_amount: Number(formData.min_amount),
        max_amount:
          formData.max_amount === "null" ||
          formData.max_amount === null ||
          formData.max_amount === undefined ||
          formData.max_amount === ""
            ? null
            : Number(formData.max_amount),
        description: String(formData.description || "").trim(),
        duration_days: Number(formData.duration_days), 
      };

      // Debug: remove this after testing
      console.log("Sending payload:", payload);

      await axios.post(`${API_BASE}/admin/plans`, payload, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      });

      await loadPlans();
      setShowForm(false);
      alert("Plan created successfully!");
    } else {
      // local fallback...
    }
  } catch (err: any) {
    console.error("createPlan error", err);
    console.log("Server response:", err.response?.data);
    alert(err.response?.data?.error || "Failed to create plan");
  } finally {
    setSaving(false);
  }
};

const updatePlan = async (formData: any) => {
  if (!editing) return;
  setSaving(true);
  try {
    if (token) {
      const payload = {
        name: String(formData.name || "").trim(),
        min_amount: Number(formData.min_amount),
        max_amount:
          formData.max_amount === "null" || formData.max_amount == null
            ? null
            : Number(formData.max_amount),
        description: String(formData.description || "").trim(),
        duration_days: Number(formData.duration_days), 
      };

      await axios.put(`${API_BASE}/admin/plans/${editing.id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      });

      await loadPlans();
      setEditing(null);
      alert("Plan updated successfully!");
    }
  } catch (err: any) {
    console.error("updatePlan error", err);
    alert(err.response?.data?.error || "Failed to update plan");
  } finally {
    setSaving(false);
  }
};

  const deletePlan = async (id: number | string) => {
    if (!confirm("Delete this plan? This action cannot be undone.")) return;
    try {
      if (token) {
        await axios.delete(`${API_BASE}/admin/plans/${id}`, { headers: authHeaders });
        await loadPlans();
      } else {
        const next = plans.filter((p) => p.id !== id);
        setPlans(next);
        localStorage.setItem("investment_plans", JSON.stringify(next));
      }
      alert("Plan deleted");
    } catch (err) {
      console.error("deletePlan error", err);
      alert("Failed to delete plan");
    }
  };

  const applyPnL = async (planId: number | string) => {
    const pctStr = prompt("Apply PnL — enter percent (e.g. 2 for 2%)");
    if (!pctStr) return;
    const pct = Number(pctStr);
    if (isNaN(pct)) return alert("Invalid percent");
    if (!confirm(`Apply ${pct}% PnL to this plan? This will update all active investments.`)) return;

    try {
      const res = await axios.post(
        `${API_BASE}/admin/plans/${planId}/apply-pnl`,
        { percent: pct },
        { headers: { "Content-Type": "application/json", ...authHeaders } }
      );

      alert(`Distributed $${res.data.distributed ?? 0} to ${res.data.count ?? 0} investments`);
      await loadPlans();
    } catch (err: any) {
      console.error("applyPnL error", err);
      alert(err?.response?.data?.error || "Failed to apply PnL");
    }
  };

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-wide">Investment Plans</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0AEFFF] text-black font-semibold rounded-lg shadow hover:opacity-90 transition"
          >
            <Plus size={16} /> Add Plan
          </button>

          <button
            onClick={() => loadPlans()}
            className="px-3 py-2 bg-gray-800/60 text-gray-200 rounded-lg border border-[#334155]"
            title="Reload plans"
          >
            Reload
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 bg-[#0f172a]/60 rounded-xl border border-[#1E293B]">
          Loading plans…
        </div>
      ) : (
        <>
          {(showForm || editing) && (
            <div className="bg-[#0f172a]/70 border border-[#1E293B] rounded-xl p-6 shadow-lg mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{editing ? "Edit Plan" : "Create New Plan"}</h2>
                <div className="text-sm text-gray-400">{saving ? "Saving…" : ""}</div>
              </div>

              <PlanForm
                initial={editing ? {
                  name: editing.name,
                  min_amount: editing.minAmount,
                  max_amount: editing.maxAmount,
                  description: editing.description ?? "",
                } : undefined}
                onSave={editing ? updatePlan : createPlan}
                onCancel={() => {
                  setEditing(null);
                  setShowForm(false);
                }}
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.length === 0 && (
              <div className="col-span-full p-8 bg-[#0f172a]/60 rounded-xl text-center text-gray-400">
                No plans created yet.
              </div>
            )}

            {plans.map((p) => (
              <article key={p.id} className="bg-[#0f172a]/60 border border-[#1E293B] rounded-xl p-5 shadow-md hover:shadow-xl transition group">
                <header className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold tracking-wide">{p.name}</h3>
                    <div className="text-xs text-gray-400 mt-1">{p.lastUpdate ? new Date(p.lastUpdate).toLocaleString() : ""}</div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition">
                      <Pencil size={16} />
                    </button>

                    <button onClick={() => deletePlan(p.id)} className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition">
                      <Trash size={16} />
                    </button>
                  </div>
                </header>

                <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                  <Wallet size={16} className="text-[#0AEFFF]" />
                  <span>${p.minAmount} – {p.maxAmount ? `$${p.maxAmount}` : "No limit"}</span>
                </div>

                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{p.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-300 mb-1">
                    <span>Progress</span>
                    <span>{p.progressPercent ?? 0}%</span>
                  </div>

                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0AEFFF] transition-all duration-500" style={{ width: `${p.progressPercent ?? 0}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <TrendingUp size={16} className="text-[#0AEFFF]" />
                    <span className={Number(p.profitLoss ?? 0) >= 0 ? "text-green-400" : "text-red-400"}>
                      {Number(p.profitLoss ?? 0) >= 0 ? "+" : ""}${p.profitLoss ?? 0}
                    </span>
                  </div>

                  <button onClick={() => applyPnL(p.id)} className="px-3 py-1 bg-[#0AEFFF] text-black rounded font-medium">Apply PnL</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
