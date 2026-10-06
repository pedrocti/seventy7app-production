// client/src/components/AdminPlans.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash, TrendingUp, Wallet, DollarSign, ChevronDown, ChevronUp, History } from 'lucide-react';
import { API_BASE } from '@/api/http';
import { toast } from 'sonner';

/* ─── Types ──────────────────────────────────────────── */
type Plan = {
  id: number;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number | null;
  durationDays: number;
  minMonthlyRoi: number;
  maxMonthlyRoi: number;
  minTotalRoi: number;
  maxTotalRoi: number;
  activeCount?: number;
};

type Payout = {
  month_number: number;
  roi_percent: number;
  paid_at: string;
  count: number;
  total: number;
};

type FormData = {
  name: string;
  description: string;
  min_amount: string;
  max_amount: string;
  duration_days: string;
  min_monthly_roi: string;
  max_monthly_roi: string;
  min_total_roi: string;
  max_total_roi: string;
};

const emptyForm: FormData = {
  name: '', description: '', min_amount: '', max_amount: '',
  duration_days: '', min_monthly_roi: '', max_monthly_roi: '',
  min_total_roi: '', max_total_roi: '',
};

/* ─── CSS helpers ──────────────────────────────────── */
const inp = {
  width: '100%', background: 'var(--surface-2)',
  border: '1px solid rgba(10,239,255,0.12)', padding: '10px 14px',
  color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13,
  fontWeight: 300, outline: 'none', borderRadius: 0, boxSizing: 'border-box' as const,
};
const lbl = {
  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
  textTransform: 'uppercase' as const, color: 'var(--muted-2)',
  display: 'block', marginBottom: 6,
};

function mapPlan(s: any): Plan {
  return {
    id: s.id, name: s.name, description: s.description ?? '',
    minAmount: Number(s.min_amount ?? 0),
    maxAmount: s.max_amount != null ? Number(s.max_amount) : null,
    durationDays: Number(s.duration_days ?? 365),
    minMonthlyRoi: Number(s.min_monthly_roi ?? s.monthly_roi_percent ?? 0),
    maxMonthlyRoi: Number(s.max_monthly_roi ?? s.monthly_roi_percent ?? 0),
    minTotalRoi:   Number(s.min_total_roi   ?? 0),
    maxTotalRoi:   Number(s.max_total_roi   ?? 0),
    activeCount:   Number(s.active_count    ?? 0),
  };
}

/* ─── Plan Form ──────────────────────────────────────── */
function PlanForm({ initial, onSave, onCancel, saving }: {
  initial?: FormData; onSave: (d: FormData) => void;
  onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial ?? emptyForm);
  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const months = Math.max(1, Math.round(Number(form.duration_days || 0) / 30));
  const midMonthly = ((Number(form.min_monthly_roi||0) + Number(form.max_monthly_roi||0)) / 2);
  const projMin = Number(form.min_amount||0) * (Number(form.min_monthly_roi||0)/100) * months;
  const projMax = Number(form.min_amount||0) * (Number(form.max_monthly_roi||0)/100) * months;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>Plan Name</label>
          <input style={inp} value={form.name} onChange={set('name')} placeholder="e.g. Growth Stake" />
        </div>
        <div>
          <label style={lbl}>Duration (days)</label>
          <input style={inp} type="number" value={form.duration_days} onChange={set('duration_days')} placeholder="365" />
        </div>
      </div>

      <div>
        <label style={lbl}>Description</label>
        <textarea style={{ ...inp, resize: 'vertical', minHeight: 72 }} value={form.description}
          onChange={set('description')} placeholder="Plan description for investors…" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>Min Investment ($)</label>
          <input style={inp} type="number" value={form.min_amount} onChange={set('min_amount')} placeholder="500" />
        </div>
        <div>
          <label style={lbl}>Max Investment ($ — leave blank for no limit)</label>
          <input style={inp} type="number" value={form.max_amount} onChange={set('max_amount')} placeholder="unlimited" />
        </div>
      </div>

      {/* ROI Range section */}
      <div style={{ padding: '16px', background: 'rgba(10,239,255,0.03)', border: '1px solid rgba(10,239,255,0.12)' }}>
        <div style={{ ...lbl, marginBottom: 14, color: 'var(--cyan)', fontSize: 10 }}>Monthly ROI Range (%)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Min Monthly ROI (%)</label>
            <input style={inp} type="number" step="0.1" value={form.min_monthly_roi} onChange={set('min_monthly_roi')} placeholder="10" />
          </div>
          <div>
            <label style={lbl}>Max Monthly ROI (%)</label>
            <input style={inp} type="number" step="0.1" value={form.max_monthly_roi} onChange={set('max_monthly_roi')} placeholder="15" />
          </div>
        </div>

        <div style={{ ...lbl, marginBottom: 14, color: 'var(--cyan)', fontSize: 10, marginTop: 14 }}>Total Return Range (% over full term)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Min Total ROI (%)</label>
            <input style={inp} type="number" step="0.1" value={form.min_total_roi} onChange={set('min_total_roi')}
              placeholder={months > 0 ? (Number(form.min_monthly_roi||0)*months).toFixed(0) : '120'} />
          </div>
          <div>
            <label style={lbl}>Max Total ROI (%)</label>
            <input style={inp} type="number" step="0.1" value={form.max_total_roi} onChange={set('max_total_roi')}
              placeholder={months > 0 ? (Number(form.max_monthly_roi||0)*months).toFixed(0) : '180'} />
          </div>
        </div>

        {/* Live preview */}
        {midMonthly > 0 && Number(form.min_amount) > 0 && (
          <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid rgba(10,239,255,0.08)' }}>
            <div style={{ ...lbl, marginBottom: 8, color: 'var(--s7-muted)' }}>Projection Preview (on min amount over {months}mo)</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <span style={{ ...lbl, marginBottom: 2 }}>Conservative</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--s7-muted)' }}>${projMin.toFixed(0)}</span>
              </div>
              <div>
                <span style={{ ...lbl, marginBottom: 2 }}>Optimistic</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cyan)' }}>${projMax.toFixed(0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        <button onClick={onCancel}
          style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--s7-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={saving}
          className="btn-primary"
          style={{ cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save Plan'}
        </button>
      </div>
    </div>
  );
}

/* ─── Pay Monthly Modal ──────────────────────────────── */
function PayMonthlyModal({ plan, onClose, onPaid }: { plan: Plan; onClose: () => void; onPaid: () => void }) {
  const [pct, setPct] = useState('');
  const [paying, setPaying] = useState(false);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const mid = ((plan.minMonthlyRoi + plan.maxMonthlyRoi) / 2).toFixed(1);

  useEffect(() => {
    axios.get(`${API_BASE}/admin/plans/${plan.id}/payouts`, { headers })
      .then(r => setPayouts(r.data.summary_by_month ?? []))
      .catch(() => {});
  }, [plan.id]);

  async function pay() {
    const val = Number(pct);
    if (!val || val < plan.minMonthlyRoi || val > plan.maxMonthlyRoi)
      return toast.error(`Enter a value between ${plan.minMonthlyRoi}% and ${plan.maxMonthlyRoi}%`);
    if (!confirm(`Apply ${val}% ROI to all active investors in "${plan.name}"?\nThis will credit their earnings balance immediately.`))
      return;
    setPaying(true);
    try {
      const r = await axios.post(`${API_BASE}/admin/plans/${plan.id}/pay-monthly`, { roi_percent: val }, { headers });
      toast.success(`Paid ${r.data.investments_paid} investors — $${r.data.total_distributed} distributed`);
      onPaid();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Payment failed');
    } finally { setPaying(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'var(--bg)', border: '1px solid rgba(10,239,255,0.15)', width: '100%', maxWidth: 480, padding: 32 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--text)', marginBottom: 6 }}>
          Pay Monthly ROI
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
          {plan.name} · Range: {plan.minMonthlyRoi}% – {plan.maxMonthlyRoi}%
        </div>

        {/* Active investors info */}
        <div style={{ padding: '12px 14px', background: 'rgba(10,239,255,0.04)', border: '1px solid rgba(10,239,255,0.10)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Active Investors
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cyan)' }}>
              {plan.activeCount ?? '—'}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Actual ROI % for this month</label>
          <input style={inp} type="number" step="0.1" value={pct} onChange={e => setPct(e.target.value)}
            placeholder={`${plan.minMonthlyRoi} – ${plan.maxMonthlyRoi} (mid: ${mid})`} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[plan.minMonthlyRoi, Number(mid), plan.maxMonthlyRoi].map(v => (
              <button key={v} onClick={() => setPct(String(v))}
                style={{ padding: '4px 12px', background: 'rgba(10,239,255,0.06)', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer' }}>
                {v}%
              </button>
            ))}
          </div>
        </div>

        {/* Payout history toggle */}
        {payouts.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => setShowHistory(h => !h)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--s7-muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>
              <History size={12} /> Payout History ({payouts.length} months)
              {showHistory ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
            </button>
            {showHistory && (
              <div style={{ marginTop: 10, border: '1px solid rgba(10,239,255,0.08)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: 'var(--surface-2)', padding: '8px 12px' }}>
                  {['Month','ROI %','Investors','Distributed'].map(h => (
                    <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>{h}</span>
                  ))}
                </div>
                {payouts.sort((a,b) => b.month_number - a.month_number).map(p => (
                  <div key={p.month_number} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '8px 12px', borderTop: '1px solid rgba(10,239,255,0.05)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--s7-muted)' }}>M{p.month_number}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan)' }}>{p.roi_percent}%</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)' }}>{p.count}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)' }}>${Number(p.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--s7-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={pay} disabled={paying}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', cursor: paying ? 'not-allowed' : 'pointer', opacity: paying ? 0.6 : 1 }}>
            {paying ? 'Processing…' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function AdminPlans() {
  const [plans, setPlans]   = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [payTarget, setPayTarget] = useState<Plan | null>(null);

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  async function load() {
    setLoading(true);
    try {
      const r = await axios.get(`${API_BASE}/admin/plans`, { headers });
      setPlans((r.data.plans ?? []).map(mapPlan));
    } catch { toast.error('Failed to load plans'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function planToForm(p: Plan): FormData {
    return {
      name: p.name, description: p.description,
      min_amount: String(p.minAmount),
      max_amount: p.maxAmount != null ? String(p.maxAmount) : '',
      duration_days: String(p.durationDays),
      min_monthly_roi: String(p.minMonthlyRoi),
      max_monthly_roi: String(p.maxMonthlyRoi),
      min_total_roi: String(p.minTotalRoi),
      max_total_roi: String(p.maxTotalRoi),
    };
  }

  async function save(formData: FormData) {
    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      min_amount: Number(formData.min_amount),
      max_amount: formData.max_amount ? Number(formData.max_amount) : null,
      duration_days: Number(formData.duration_days),
      min_monthly_roi: Number(formData.min_monthly_roi),
      max_monthly_roi: Number(formData.max_monthly_roi),
      min_total_roi: Number(formData.min_total_roi),
      max_total_roi: Number(formData.max_total_roi),
    };
    try {
      if (editing) {
        await axios.put(`${API_BASE}/admin/plans/${editing.id}`, payload, { headers });
        toast.success('Plan updated');
      } else {
        await axios.post(`${API_BASE}/admin/plans`, payload, { headers });
        toast.success('Plan created');
      }
      await load();
      setEditing(null); setShowForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Save failed');
    } finally { setSaving(false); }
  }

  async function deletePlan(id: number) {
    if (!confirm('Delete this plan?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/plans/${id}`, { headers });
      toast.success('Plan deleted');
      await load();
    } catch { toast.error('Delete failed'); }
  }

  if (loading) return (
    <div style={{ padding: 48, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading plans…
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

      {/* Header */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--text)' }}>Investment Plans</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => load()}
            style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--s7-muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Reload
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
            <Plus size={14} /> Add Plan
          </button>
        </div>
      </div>

      {/* Form */}
      {(showForm || editing) && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--text)', marginBottom: 24 }}>
            {editing ? `Edit — ${editing.name}` : 'New Plan'}
          </div>
          <PlanForm
            initial={editing ? planToForm(editing) : undefined}
            onSave={save} saving={saving}
            onCancel={() => { setEditing(null); setShowForm(false); }}
          />
        </div>
      )}

      {/* Plan cards */}
      {plans.length === 0 && !showForm ? (
        <div style={{ background: 'var(--surface)', padding: 64, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          No plans yet — create one above
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 1, background: 'rgba(10,239,255,0.06)' }}>
          {plans.map(plan => {
            const months = Math.max(1, Math.round(plan.durationDays / 30));
            return (
              <div key={plan.id} style={{ background: 'var(--surface)', padding: 24 }}>

                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', letterSpacing: '0.08em' }}>
                      {plan.durationDays}d · {months} months
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditing(plan); setShowForm(true); }}
                      style={{ padding: '6px', background: 'rgba(242,178,58,0.08)', border: '1px solid rgba(242,178,58,0.2)', color: '#F2B23A', cursor: 'pointer' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deletePlan(plan.id)}
                      style={{ padding: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash size={13} />
                    </button>
                  </div>
                </div>

                {/* ROI range */}
                <div style={{ padding: '14px', background: 'rgba(10,239,255,0.04)', border: '1px solid rgba(10,239,255,0.10)', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>Monthly ROI Range</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cyan)' }}>
                      {plan.minMonthlyRoi}% – {plan.maxMonthlyRoi}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>Total Return Range</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>
                      {plan.minTotalRoi}% – {plan.maxTotalRoi}%
                    </span>
                  </div>
                </div>

                {/* Min/Max investment */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Wallet size={13} style={{ color: 'var(--cyan)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--s7-muted)' }}>
                    ${plan.minAmount.toLocaleString()} – {plan.maxAmount ? `$${plan.maxAmount.toLocaleString()}` : 'No limit'}
                  </span>
                </div>

                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--muted-2)', lineHeight: 1.6, marginBottom: 16 }}>
                  {plan.description}
                </p>

                {/* Active investors count */}
                {(plan.activeCount ?? 0) > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <DollarSign size={13} style={{ color: 'var(--green)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--s7-muted)' }}>
                      {plan.activeCount} active investor{plan.activeCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Pay Monthly button */}
                <button onClick={() => setPayTarget(plan)} className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                  <TrendingUp size={14} /> Pay Monthly ROI
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pay Modal */}
      {payTarget && (
        <PayMonthlyModal
          plan={payTarget}
          onClose={() => setPayTarget(null)}
          onPaid={load}
        />
      )}
    </div>
  );
}