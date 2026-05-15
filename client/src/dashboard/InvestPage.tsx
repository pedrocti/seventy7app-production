// client/src/dashboard/InvestPage.tsx
import { useEffect, useMemo, useState, CSSProperties } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { toast } from 'sonner';
import { API_BASE } from '@/api/http';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ArrowDownToLine, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const fmt  = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.00' : n.toFixed(2); };
const fmtP = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.0' : n.toFixed(1); };
function clamp(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, n)); }

interface Plan {
  id: number; name: string; description: string;
  minAmount: number; maxAmount: number | null; durationDays: number;
  minMonthlyRoi: number; maxMonthlyRoi: number;
  minTotalRoi: number; maxTotalRoi: number;
}
interface Payout {
  id: number; month_number: number; roi_percent: number;
  amount: number; status: string; paid_at: string;
}
interface Investment {
  id: number; plan_id: number; plan_name: string;
  amount: number; status: string; earnings_balance: number;
  months_paid: number; last_payout_at: string | null;
  start_at: string; end_at: string; duration_days: number;
  progress: number; total_earned: number; payouts: Payout[] | null;
  min_monthly_roi: number; max_monthly_roi: number;
  min_total_roi: number; max_total_roi: number;
}

function Mono({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return <span style={{ fontFamily: 'var(--font-mono)', ...style }}>{children}</span>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted-2)', display: 'block', marginBottom: 6 }}>{children}</span>;
}
const inp: CSSProperties = {
  width: '100%', background: 'var(--surface-2)',
  border: '1px solid rgba(10,239,255,0.12)', padding: '10px 14px',
  color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13,
  fontWeight: 300, outline: 'none', borderRadius: 0, boxSizing: 'border-box',
};

/* ─── Projection Panel ──────────────────────────────────────────────────── */
function ProjectionPanel({ amount, plan }: { amount: number; plan: Plan | null }) {
  if (!plan || amount <= 0) return (
    <div style={{ padding: '24px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
      Select a plan and enter amount
    </div>
  );
  const months  = Math.max(1, Math.round(plan.durationDays / 30));
  const minRate = plan.minMonthlyRoi / 100;
  const maxRate = plan.maxMonthlyRoi / 100;
  const midRate = (minRate + maxRate) / 2;
  const scenarios = [
    { label: 'Conservative', rate: minRate, color: 'var(--muted)' },
    { label: 'Mid',          rate: midRate, color: 'var(--text)'  },
    { label: 'Optimistic',   rate: maxRate, color: 'var(--cyan)'  },
  ].map(s => ({ ...s, final: amount + amount * s.rate * months, totalPct: (s.rate * months * 100).toFixed(1) }));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(10,239,255,0.08)', marginBottom: 16 }}>
        {scenarios.map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', padding: '14px' }}>
            <Label>{s.label}</Label>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(13px,1.6vw,18px)', fontWeight: 300, color: s.color, lineHeight: 1 }}>${fmt(s.final)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', marginTop: 4 }}>+{s.totalPct}%</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 8 }}>
        Mid scenario ({(midRate * 100).toFixed(1)}%/mo)
      </div>
      <div style={{ border: '1px solid rgba(10,239,255,0.08)', overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: 'var(--surface-2)', padding: '8px 14px' }}>
          {['Mo', 'Pay', 'Total', 'Bal'].map(h => (
            <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>{h}</span>
          ))}
        </div>
        <div style={{ maxHeight: 160, overflowY: 'auto' }}>
          {Array.from({ length: months }, (_, i) => {
            const pay = amount * midRate;
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '7px 14px', borderTop: '1px solid rgba(10,239,255,0.05)' }}>
                <Mono style={{ fontSize: 10, color: 'var(--muted)' }}>M{i + 1}</Mono>
                <Mono style={{ fontSize: 10, color: 'var(--green)' }}>+${fmt(pay)}</Mono>
                <Mono style={{ fontSize: 10, color: 'var(--text)' }}>${fmt(pay * (i + 1))}</Mono>
                <Mono style={{ fontSize: 10, color: 'var(--cyan)' }}>${fmt(amount + pay * (i + 1))}</Mono>
              </div>
            );
          })}
        </div>
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)', lineHeight: 1.7 }}>
        {plan.minMonthlyRoi}–{plan.maxMonthlyRoi}%/mo · {plan.minTotalRoi}–{plan.maxTotalRoi}% total projected. Not financial advice.
      </p>
    </motion.div>
  );
}

/* ─── Reinvest Modal ────────────────────────────────────────────────────── */
function ReinvestModal({ inv, plans, token, onClose, onDone }: {
  inv: Investment; plans: Plan[]; token: string | null;
  onClose: () => void; onDone: () => void;
}) {
  const isMobile = useMobile();
  const earnings = Number(inv.earnings_balance);
  const eligible = plans.filter(p => earnings >= p.minAmount);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(eligible[0]?.id ?? null);
  const [acting, setActing] = useState(false);

  async function confirm() {
    if (!selectedPlanId || !token) return;
    setActing(true);
    try {
      const r = await fetch(`${API_BASE}/investments/${inv.id}/reinvest-earnings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_id: selectedPlanId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error ?? 'Reinvest failed');
      toast.success(`$${earnings.toFixed(2)} reinvested successfully`);
      onDone(); onClose();
    } catch (e: any) { toast.error(e.message); }
    finally { setActing(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,17,32,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 16 : 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.15)', width: '100%', maxWidth: 480 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(10,239,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--text)' }}>Reinvest Earnings</span>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(240,237,230,0.12)', color: 'var(--muted)', width: 30, height: 30, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 16 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ padding: '12px 14px', background: 'rgba(14,203,129,0.04)', border: '1px solid rgba(14,203,129,0.15)', marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>Available to reinvest</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'var(--green)', marginTop: 4 }}>${earnings.toFixed(2)}</div>
          </div>

          {eligible.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>
                Insufficient for any plan
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20 }}>
                Your earnings of ${earnings.toFixed(2)} don't meet the minimum for any available plan.
                The lowest minimum is ${Math.min(...plans.map(p => p.minAmount)).toLocaleString()}.
                Withdraw to your main balance, top up, then reinvest.
              </div>
              <button onClick={onClose}
                style={{ padding: '10px 24px', background: 'transparent', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 10 }}>
                Choose a plan to reinvest into
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 20 }}>
                {plans.map(plan => {
                  const canUse = earnings >= plan.minAmount;
                  const sel    = selectedPlanId === plan.id;
                  return (
                    <div key={plan.id}
                      onClick={() => canUse && setSelectedPlanId(plan.id)}
                      style={{ padding: '12px 14px', background: sel ? 'rgba(10,239,255,0.06)' : 'var(--surface-2)', border: `1px solid ${sel ? 'rgba(10,239,255,0.35)' : 'rgba(10,239,255,0.06)'}`, cursor: canUse ? 'pointer' : 'not-allowed', opacity: canUse ? 1 : 0.4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text)', marginBottom: 3 }}>{plan.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)' }}>
                          Min ${plan.minAmount.toLocaleString()} · {plan.minMonthlyRoi}–{plan.maxMonthlyRoi}%/mo
                        </div>
                        {!canUse && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--red)', marginTop: 2 }}>
                            Need ${(plan.minAmount - earnings).toFixed(2)} more
                          </div>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 300, color: sel ? 'var(--cyan)' : 'var(--muted)' }}>
                        {plan.minMonthlyRoi}–{plan.maxMonthlyRoi}%
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose}
                  style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={confirm} disabled={!selectedPlanId || acting}
                  className="btn-primary"
                  style={{ flex: 2, justifyContent: 'center', cursor: selectedPlanId && !acting ? 'pointer' : 'not-allowed', opacity: selectedPlanId && !acting ? 1 : 0.5 }}>
                  {acting ? 'Processing…' : `Reinvest $${earnings.toFixed(2)}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Investment Card ───────────────────────────────────────────────────── */
function InvestmentCard({ inv, plans, onAction }: { inv: Investment; plans: Plan[]; onAction: () => void }) {
  const { token } = useAuth();
  const isMobile  = useMobile();
  const [withdrawing,   setWithdrawing]   = useState(false);
  const [showReinvest,  setShowReinvest]  = useState(false);
  const [showPayouts,   setShowPayouts]   = useState(false);

  const pct         = clamp(inv.progress);
  const months      = Math.max(1, Math.round(inv.duration_days / 30));
  const earnings    = Number(inv.earnings_balance);
  const totalEarned = Number(inv.total_earned);
  const earnedPct   = inv.amount > 0 ? (totalEarned / inv.amount) * 100 : 0;
  const now         = new Date();
  const nextPayout  = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntil   = Math.ceil((nextPayout.getTime() - now.getTime()) / 86400000);
  const hasEarnings = earnings > 0;

  async function withdraw() {
    setWithdrawing(true);
    try {
      const r = await fetch(`${API_BASE}/investments/${inv.id}/withdraw-earnings`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error ?? 'Withdraw failed');
      toast.success(`$${fmt(d.amount_withdrawn)} moved to your main balance`);
      onAction();
    } catch (e: any) { toast.error(e.message); }
    finally { setWithdrawing(false); }
  }

  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid rgba(10,239,255,0.06)', padding: isMobile ? 14 : 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text)', fontWeight: 400 }}>{inv.plan_name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', marginTop: 3, letterSpacing: '0.08em' }}>
            ${fmt(inv.amount)} · {inv.min_monthly_roi}–{inv.max_monthly_roi}%/mo
          </div>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', flexShrink: 0,
          background: inv.status === 'active' ? 'rgba(10,239,255,0.06)' : 'rgba(14,203,129,0.06)',
          color: inv.status === 'active' ? 'var(--cyan)' : 'var(--green)',
          border: `1px solid ${inv.status === 'active' ? 'rgba(10,239,255,0.2)' : 'rgba(14,203,129,0.2)'}` }}>
          {inv.status}
        </span>
      </div>

      {/* Term progress */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <Label>Term Progress</Label>
          <Mono style={{ fontSize: 10, color: 'var(--cyan)' }}>{fmtP(pct)}%</Mono>
        </div>
        <div style={{ height: 4, background: 'rgba(10,239,255,0.08)' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--cyan)', transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <Mono style={{ fontSize: 8, color: 'var(--muted-2)' }}>
            {inv.start_at ? new Date(inv.start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </Mono>
          <Mono style={{ fontSize: 8, color: 'var(--muted-2)' }}>
            {inv.end_at ? new Date(inv.end_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </Mono>
        </div>
      </div>

      {/* ROI progress */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <Label>Returns ({inv.months_paid}/{months} months paid)</Label>
          <Mono style={{ fontSize: 10, color: 'var(--green)' }}>+{fmtP(earnedPct)}%</Mono>
        </div>
        <div style={{ height: 4, background: 'rgba(14,203,129,0.08)' }}>
          <div style={{ height: '100%', width: `${clamp(earnedPct, 0, inv.max_total_roi || 100)}%`, background: 'var(--green)', transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <Mono style={{ fontSize: 8, color: 'var(--muted-2)' }}>$0</Mono>
          <Mono style={{ fontSize: 8, color: 'var(--muted-2)' }}>Target ${fmt(inv.amount * inv.max_total_roi / 100)}</Mono>
        </div>
      </div>

      {/* Stats — 2 cols mobile, 4 cols desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 1, background: 'rgba(10,239,255,0.06)', marginBottom: 14 }}>
        {[
          { label: 'Earned',      value: `$${fmt(totalEarned)}`,         color: 'var(--green)' },
          { label: 'Months Paid', value: `${inv.months_paid}/${months}`, color: 'var(--text)'  },
          { label: 'Next Payout', value: `${daysUntil}d`,               color: 'var(--cyan)'  },
          { label: 'Available',   value: `$${fmt(earnings)}`,            color: hasEarnings ? 'var(--cyan)' : 'var(--muted-2)' },
        ].map((item, i) => (
          <div key={i} style={{ background: 'var(--surface)', padding: '10px 12px' }}>
            <Label>{item.label}</Label>
            <Mono style={{ fontSize: 12, color: item.color }}>{item.value}</Mono>
          </div>
        ))}
      </div>

      {/* Earnings action panel — always visible for active investments */}
      {inv.status === 'active' && (
        <div style={{ padding: '14px', background: hasEarnings ? 'rgba(14,203,129,0.04)' : 'rgba(10,239,255,0.03)', border: `1px solid ${hasEarnings ? 'rgba(14,203,129,0.15)' : 'rgba(10,239,255,0.08)'}`, marginBottom: 14 }}>
          {hasEarnings ? (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              ${fmt(earnings)} earnings ready — choose an action
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Earnings will appear here after the first monthly payout ({daysUntil}d away)
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexDirection: isMobile ? 'column' : 'row' }}>
            <button onClick={withdraw} disabled={withdrawing || !hasEarnings}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', background: hasEarnings ? 'rgba(14,203,129,0.08)' : 'var(--surface)', border: `1px solid ${hasEarnings ? 'rgba(14,203,129,0.25)' : 'rgba(10,239,255,0.08)'}`, color: hasEarnings ? 'var(--green)' : 'var(--muted-2)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: withdrawing || !hasEarnings ? 'not-allowed' : 'pointer', opacity: withdrawing ? 0.5 : 1 }}>
              {withdrawing ? 'Processing…' : <><ArrowDownToLine size={12} /> Withdraw to Balance</>}
            </button>
            <button onClick={() => setShowReinvest(true)} disabled={!hasEarnings}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', background: hasEarnings ? 'rgba(10,239,255,0.06)' : 'var(--surface)', border: `1px solid ${hasEarnings ? 'rgba(10,239,255,0.2)' : 'rgba(10,239,255,0.08)'}`, color: hasEarnings ? 'var(--cyan)' : 'var(--muted-2)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: !hasEarnings ? 'not-allowed' : 'pointer' }}>
              <RefreshCw size={12} /> Reinvest Earnings
            </button>
          </div>
        </div>
      )}

      {/* Reinvest modal */}
      {showReinvest && (
        <ReinvestModal inv={inv} plans={plans} token={token ?? null} onClose={() => setShowReinvest(false)} onDone={onAction} />
      )}

      {/* Payout history */}
      {(inv.payouts?.length ?? 0) > 0 && (
        <>
          <button onClick={() => setShowPayouts(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', padding: 0, marginBottom: 8 }}>
            {showPayouts ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            Payout History ({inv.payouts!.length})
          </button>
          {showPayouts && (
            <div style={{ border: '1px solid rgba(10,239,255,0.08)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: 'var(--surface-2)', padding: '8px 12px' }}>
                {['Month', 'ROI %', 'Amount', 'Status'].map(h => (
                  <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>{h}</span>
                ))}
              </div>
              {inv.payouts!.map(p => (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '8px 12px', borderTop: '1px solid rgba(10,239,255,0.05)' }}>
                  <Mono style={{ fontSize: 10, color: 'var(--muted)' }}>M{p.month_number}</Mono>
                  <Mono style={{ fontSize: 10, color: 'var(--cyan)' }}>{p.roi_percent}%</Mono>
                  <Mono style={{ fontSize: 10, color: 'var(--green)' }}>+${fmt(p.amount)}</Mono>
                  <Mono style={{ fontSize: 10, color: p.status === 'credited' ? 'var(--cyan)' : p.status === 'withdrawn' ? 'var(--muted)' : 'var(--green)' }}>{p.status}</Mono>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function InvestPage() {
  const { user, token, setUser } = useAuth();
  const isMobile = useMobile();
  const [plans,         setPlans]         = useState<Plan[]>([]);
  const [investments,   setInvestments]   = useState<Investment[]>([]);
  const [amount,        setAmount]        = useState(1000);
  const [selectedId,    setSelectedId]    = useState<number | null>(null);
  const [useBonusFirst, setUseBonusFirst] = useState(true);
  const [agreed,        setAgreed]        = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [totalAvail,    setTotalAvail]    = useState(0);
  const [showProject,   setShowProject]   = useState(false);

  const mainBalance  = Number(user?.balance ?? 0);
  const bonusBalance = Number(user?.bonus_balance ?? 0);

  async function refreshBalances() {
    if (!token || !setUser) return;
    const r = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.success) setUser((u: any) => ({ ...u, balance: Number(d.user.balance ?? 0), bonus_balance: Number(d.user.bonus_balance ?? 0) }));
  }

  async function fetchOverview() {
    if (!token) return;
    const r = await fetch(`${API_BASE}/user/overview`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.success) setTotalAvail(Number(d.totals?.portfolio_value ?? 0));
  }

  async function fetchPlans() {
    if (!token) return;
    const r = await fetch(`${API_BASE}/plans`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.plans) setPlans(d.plans.map((p: any) => {
      const legacy = Number(p.monthly_roi_percent ?? 0);
      const minRoi = Number(p.min_monthly_roi ?? 0) || legacy;
      const maxRoi = Number(p.max_monthly_roi ?? 0) || legacy;
      const mos    = Math.max(1, Math.round(Number(p.duration_days ?? 365) / 30));
      return {
        id: Number(p.id), name: p.name, description: p.description ?? '',
        minAmount: Number(p.min_amount), maxAmount: p.max_amount ? Number(p.max_amount) : null,
        durationDays: Number(p.duration_days ?? 365),
        minMonthlyRoi: minRoi, maxMonthlyRoi: maxRoi,
        minTotalRoi: Number(p.min_total_roi ?? 0) || +(minRoi * mos).toFixed(2),
        maxTotalRoi: Number(p.max_total_roi ?? 0) || +(maxRoi * mos).toFixed(2),
      };
    }));
  }

  async function fetchInvestments() {
    if (!token) return;
    const r = await fetch(`${API_BASE}/investments`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.investments) setInvestments(d.investments.map((i: any) => {
      const legacy = Number(i.monthly_roi_rate ?? 0);
      return {
        id: i.id, plan_id: i.plan_id, plan_name: i.plan_name ?? 'Investment Plan',
        amount:           Number(i.amount ?? 0),
        status:           i.status ?? 'active',
        // earnings_balance = credited by payout job but not yet withdrawn
        earnings_balance: Math.max(0, Number(i.total_earned ?? 0) - Number(i.profit_paid ?? 0)),
        months_paid:      Number(i.current_month ?? 0),
        last_payout_at:   i.last_profit_payout_at ?? null,
        start_at:         i.start_at,
        end_at:           i.end_at ?? null,
        duration_days:    Number(i.duration_days ?? 365),
        progress:         Number(i.progress ?? 0),
        total_earned:     Number(i.total_earned ?? 0),
        payouts:          null,
        min_monthly_roi:  Number(i.min_monthly_roi ?? 0) || legacy,
        max_monthly_roi:  Number(i.max_monthly_roi ?? 0) || legacy,
        min_total_roi:    Number(i.min_total_roi ?? 0),
        max_total_roi:    Number(i.max_total_roi ?? 0),
      };
    }));
  }

  async function refresh() {
    await Promise.all([refreshBalances(), fetchOverview(), fetchInvestments()]);
  }

  useEffect(() => {
    Promise.all([refreshBalances(), fetchOverview(), fetchPlans(), fetchInvestments()]).finally(() => setLoading(false));
    const t = setInterval(fetchInvestments, 30000);
    return () => clearInterval(t);
  }, [token]);

  const selectedPlan = useMemo(() => plans.find(p => p.id === selectedId) ?? null, [plans, selectedId]);
  const canInvest = useMemo(() => {
    if (!selectedPlan || !agreed) return false;
    if (amount < selectedPlan.minAmount) return false;
    if (selectedPlan.maxAmount && amount > selectedPlan.maxAmount) return false;
    return amount <= totalAvail;
  }, [amount, selectedPlan, agreed, totalAvail]);

  async function handleInvest() {
    if (!token || !selectedPlan || !canInvest) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${API_BASE}/invest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, plan_id: selectedPlan.id, use_bonus: useBonusFirst }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error ?? 'Investment failed');
      toast.success('Stake created successfully');
      await refresh();
      setAmount(1000); setSelectedId(null); setAgreed(false); setShowProject(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading…
    </div>
  );

  const activeInvs    = investments.filter(i => i.status === 'active');
  const completedInvs = investments.filter(i => i.status !== 'active');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

      {/* Balance strip */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 1, background: 'rgba(10,239,255,0.08)' }}>
        {[
          { label: 'Main Balance',  value: `$${fmt(mainBalance)}` },
          { label: 'Bonus Balance', value: `$${fmt(bonusBalance)}` },
          { label: 'Available',     value: `$${fmt(totalAvail)}`, accent: true },
        ].map((item, i) => (
          <div key={i} style={{ background: 'var(--surface)', padding: isMobile ? '14px 16px' : '18px 20px' }}>
            <Label>{item.label}</Label>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,2vw,26px)', fontWeight: 300, color: (item as any).accent ? 'var(--cyan)' : 'var(--text)', lineHeight: 1 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Plan picker */}
      {plans.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: isMobile ? 16 : 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--text)', marginBottom: 16 }}>Choose a Plan</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(200px,1fr))', gap: 1, background: 'rgba(10,239,255,0.08)' }}>
            {plans.map(plan => {
              const isActive = selectedId === plan.id;
              return (
                <div key={plan.id} onClick={() => { setSelectedId(plan.id); setShowProject(false); }}
                  style={{ background: isActive ? 'rgba(10,239,255,0.06)' : 'var(--surface)', padding: '16px 18px', cursor: 'pointer', border: `1px solid ${isActive ? 'rgba(10,239,255,0.35)' : 'transparent'}`, transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(10,239,255,0.03)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text)', fontWeight: 400, marginBottom: 8 }}>{plan.name}</div>
                  {plan.minMonthlyRoi > 0 ? (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: isActive ? 'var(--cyan)' : 'var(--text)', lineHeight: 1 }}>
                        {plan.minMonthlyRoi}–{plan.maxMonthlyRoi}%
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 6 }}>per month</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted-2)' }}>
                        {plan.minTotalRoi}–{plan.maxTotalRoi}% total
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)' }}>ROI TBD</div>
                  )}
                  <div style={{ height: 1, background: 'rgba(10,239,255,0.08)', margin: '10px 0' }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', letterSpacing: '0.08em' }}>
                    Min ${plan.minAmount.toLocaleString()} · {plan.durationDays}d
                  </div>
                  {plan.maxAmount && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', marginTop: 2 }}>
                      Max ${plan.maxAmount.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Configure + Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 1 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: isMobile ? 16 : 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--text)', marginBottom: 20 }}>Configure Stake</div>

          <div style={{ marginBottom: 16 }}>
            <Label>Amount (USD)</Label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} style={inp} />
          </div>

          {selectedPlan && (
            <div style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(10,239,255,0.04)', border: '1px solid rgba(10,239,255,0.10)' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 8 }}>{selectedPlan.description}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {selectedPlan.minMonthlyRoi}–{selectedPlan.maxMonthlyRoi}%/mo
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {selectedPlan.durationDays}d
                </span>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: bonusBalance <= 0 ? 'not-allowed' : 'pointer', opacity: bonusBalance <= 0 ? 0.5 : 1 }}>
              <input type="checkbox" checked={useBonusFirst} disabled={bonusBalance <= 0}
                onChange={() => setUseBonusFirst(v => !v)}
                style={{ width: 14, height: 14, accentColor: 'var(--cyan)' }} />
              <Mono style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Use bonus balance first</Mono>
            </label>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: 'var(--cyan)', marginTop: 1, flexShrink: 0 }} />
              <Mono style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--muted-2)', lineHeight: 1.7 }}>
                I agree to the Terms & Conditions and understand investments carry risk.
              </Mono>
            </label>
          </div>

          <button onClick={handleInvest} disabled={!canInvest || submitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', cursor: canInvest && !submitting ? 'pointer' : 'not-allowed', opacity: canInvest && !submitting ? 1 : 0.5 }}>
            {submitting ? 'Processing…' : 'Confirm Stake'}
          </button>

          {selectedPlan && amount > 0 && selectedPlan.minMonthlyRoi > 0 && (
            <button onClick={() => setShowProject(v => !v)}
              style={{ width: '100%', marginTop: 10, padding: 10, background: 'transparent', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {showProject ? '↑ Hide Projection' : '↓ Show Return Projection'}
            </button>
          )}

          <AnimatePresence>
            {showProject && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 12 }}>
                <ProjectionPanel amount={amount} plan={selectedPlan} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: isMobile ? 16 : 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--text)', marginBottom: 16 }}>Portfolio Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(10,239,255,0.08)', marginBottom: 16 }}>
            {[
              { label: 'Active Stakes',  value: String(activeInvs.length) },
              { label: 'Total Invested', value: `$${fmt(activeInvs.reduce((s, i) => s + i.amount, 0))}` },
              { label: 'Total Earned',   value: `$${fmt(activeInvs.reduce((s, i) => s + i.total_earned, 0))}`, accent: true },
              { label: 'Earnings Held',  value: `$${fmt(activeInvs.reduce((s, i) => s + i.earnings_balance, 0))}`, accent: true },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--surface)', padding: '12px 14px' }}>
                <Label>{item.label}</Label>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: (item as any).accent ? 'var(--green)' : 'var(--text)', lineHeight: 1 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          {activeInvs.length === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
              <TrendingUp size={24} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
              No active stakes yet
            </div>
          )}
        </div>
      </div>

      {/* Active stakes */}
      {activeInvs.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: isMobile ? 16 : 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--text)', marginBottom: 16 }}>
            Active Stakes <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-2)' }}>({activeInvs.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {activeInvs.map(inv => <InvestmentCard key={inv.id} inv={inv} plans={plans} onAction={refresh} />)}
          </div>
        </div>
      )}

      {/* Completed stakes */}
      {completedInvs.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: isMobile ? 16 : 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--text)', marginBottom: 16 }}>
            Completed <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-2)' }}>({completedInvs.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {completedInvs.map(inv => <InvestmentCard key={inv.id} inv={inv} plans={plans} onAction={refresh} />)}
          </div>
        </div>
      )}

    </div>
  );
}