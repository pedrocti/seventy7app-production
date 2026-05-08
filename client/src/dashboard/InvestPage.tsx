// client/src/dashboard/InvestPage.tsx
import { useEffect, useMemo, useState, CSSProperties } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';
import { API_BASE } from '@/api/http';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.00' : n.toFixed(2); };
function clamp(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, n)); }

interface Plan {
  id: number; name: string; minAmount: number; maxAmount: number | null;
  description: string; durationDays: number; monthlyRoi: number;
}
interface Investment {
  id: number; planName: string; amount: number; status: string;
  durationDays: number; progress: number; profit_loss: number;
  profit_paid: number; end_at: string;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', display:'block', marginBottom:6 }}>{children}</span>;
}

function ProjectionPanel({ amount, plan }: { amount: number; plan: Plan | null }) {
  if (!plan || amount <= 0 || plan.monthlyRoi <= 0) return (
    <div style={{ padding:'24px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
      Select a plan and enter amount to see projection
    </div>
  );

  const monthlyRate = plan.monthlyRoi / 100;
  const months      = Math.max(1, Math.round(plan.durationDays / 30));
  const monthlyRet  = amount * monthlyRate;
  const totalReturn = monthlyRet * months;
  const totalValue  = amount + totalReturn;
  const roiPct      = (totalReturn / amount) * 100;

  const rows = Array.from({ length: months }, (_, i) => ({
    month: i + 1, monthlyPay: monthlyRet,
    cumulative: monthlyRet * (i + 1), balance: amount + monthlyRet * (i + 1),
  }));

  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(10,239,255,0.08)', marginBottom:16 }}>
        {[
          { label:'Monthly Return', value:`$${fmt(monthlyRet)}`, accent:true  },
          { label:'Total Return',   value:`$${fmt(totalReturn)}`, accent:false },
          { label:'Final Value',    value:`$${fmt(totalValue)}`,  accent:true  },
        ].map((item, i) => (
          <div key={i} style={{ background:'var(--surface)', padding:'14px' }}>
            <Label>{item.label}</Label>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(16px,2vw,22px)', fontWeight:300, color: item.accent ? 'var(--cyan)' : 'var(--text)', lineHeight:1 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
          Total ROI over {months} months at {plan.monthlyRoi}%/mo:
        </span>
        <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--green)' }}>
          +{roiPct.toFixed(1)}%
        </span>
      </div>

      <div style={{ border:'1px solid rgba(10,239,255,0.08)', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', background:'var(--surface-2)', padding:'10px 16px' }}>
          {['Month','Monthly Pay','Cumulative','Balance'].map(h => (
            <span key={h} style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>{h}</span>
          ))}
        </div>
        <div style={{ maxHeight:200, overflowY:'auto' }}>
          {rows.map(row => (
            <div key={row.month} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', padding:'10px 16px', borderTop:'1px solid rgba(10,239,255,0.05)' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)' }}>M{row.month}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--green)' }}>+${fmt(row.monthlyPay)}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text)' }}>${fmt(row.cumulative)}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--cyan)' }}>${fmt(row.balance)}</span>
            </div>
          ))}
        </div>
      </div>
      <p style={{ marginTop:10, fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted-2)', lineHeight:1.7 }}>
        Projection based on {plan.monthlyRoi}% monthly ROI. Actual returns may vary. Not financial advice.
      </p>
    </motion.div>
  );
}

export default function InvestPage() {
  const { user, token, setUser } = useAuth();
  const [plans,        setPlans]        = useState<Plan[]>([]);
  const [investments,  setInvestments]  = useState<Investment[]>([]);
  const [amount,       setAmount]       = useState(1000);
  const [selectedId,   setSelectedId]   = useState<number | null>(null);
  const [useBonusFirst,setUseBonusFirst]= useState(true);
  const [agreed,       setAgreed]       = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [totalAvail,   setTotalAvail]   = useState(0);
  const [showProject,  setShowProject]  = useState(false);

  const mainBalance  = Number(user?.balance ?? 0);
  const bonusBalance = Number(user?.bonus_balance ?? 0);

  async function refreshBalances() {
    if (!token || !setUser) return;
    const r = await fetch(`${API_BASE}/auth/me`, { headers:{ Authorization:`Bearer ${token}` } });
    const d = await r.json();
    if (d.success) setUser((u: any) => ({ ...u, balance: Number(d.user.balance ?? 0), bonus_balance: Number(d.user.bonus_balance ?? 0) }));
  }

  async function fetchOverview() {
    if (!token) return;
    const r = await fetch(`${API_BASE}/user/overview`, { headers:{ Authorization:`Bearer ${token}` } });
    const d = await r.json();
    if (d.success) setTotalAvail(Number(d.totals?.portfolio_value ?? 0));
  }

  async function fetchPlans() {
    if (!token) return;
    const r = await fetch(`${API_BASE}/plans`, { headers:{ Authorization:`Bearer ${token}` } });
    const d = await r.json();
    if (d.plans) setPlans(d.plans.map((p: any) => ({
      id: Number(p.id), name: p.name,
      minAmount: Number(p.min_amount),
      maxAmount: p.max_amount ? Number(p.max_amount) : null,
      description: p.description ?? '',
      durationDays: Number(p.duration_days),
      monthlyRoi: Number(p.monthly_roi_percent ?? p.monthly_roi ?? 0),
    })));
  }

  async function fetchInvestments() {
    if (!token) return;
    const r = await fetch(`${API_BASE}/investments`, { headers:{ Authorization:`Bearer ${token}` } });
    const d = await r.json();
    if (d.investments) setInvestments(d.investments.map((i: any) => ({
      id: i.id, planName: i.plan_name ?? 'Plan', amount: Number(i.amount),
      status: i.status, durationDays: Number(i.duration_days),
      progress: Number(i.progress ?? 0), profit_loss: Number(i.profit_loss ?? 0),
      profit_paid: Number(i.profit_paid ?? 0), end_at: i.end_at,
    })));
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
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ amount, plan_id: selectedPlan.id, use_bonus: useBonusFirst }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error ?? 'Investment failed');
      toast.success('Stake created successfully');
      await Promise.all([refreshBalances(), fetchOverview(), fetchInvestments()]);
      setAmount(1000); setSelectedId(null); setAgreed(false); setShowProject(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Loading…</div>
  );

  const inp: CSSProperties = { width:'100%', background:'var(--surface-2)', border:'1px solid rgba(10,239,255,0.12)', padding:'10px 14px', color:'var(--text)', fontFamily:'var(--font-sans)', fontSize:13, fontWeight:300, outline:'none', borderRadius:0, boxSizing:'border-box' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>

      {/* Balance strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(10,239,255,0.08)' }}>
        {[
          { label:'Main Balance',  value:`$${fmt(mainBalance)}` },
          { label:'Bonus Balance', value:`$${fmt(bonusBalance)}` },
          { label:'Available',     value:`$${fmt(totalAvail)}`, accent:true },
        ].map((item, i) => (
          <div key={i} style={{ background:'var(--surface)', padding:'18px 20px' }}>
            <Label>{item.label}</Label>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(18px,2vw,26px)', fontWeight:300, color:(item as any).accent?'var(--cyan)':'var(--text)', lineHeight:1 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Plan cards — pick a plan visually */}
      {plans.length > 0 && (
        <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'24px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)', marginBottom:20 }}>Choose a Plan</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:1, background:'rgba(10,239,255,0.08)' }}>
            {plans.map(plan => {
              const active = selectedId === plan.id;
              return (
                <div key={plan.id} onClick={() => { setSelectedId(plan.id); setShowProject(false); }}
                  style={{ background: active ? 'rgba(10,239,255,0.06)' : 'var(--surface)', padding:'18px 20px', cursor:'pointer', border:`1px solid ${active?'rgba(10,239,255,0.35)':'transparent'}`, transition:'all 0.2s' }}
                  onMouseEnter={e => { if(!active)(e.currentTarget as HTMLElement).style.background='rgba(10,239,255,0.03)'; }}
                  onMouseLeave={e => { if(!active)(e.currentTarget as HTMLElement).style.background='var(--surface)'; }}>
                  <div style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--text)', fontWeight:400, marginBottom:8 }}>{plan.name}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:300, color: active ? 'var(--cyan)' : 'var(--text)', lineHeight:1, marginBottom:4 }}>
                    {plan.monthlyRoi > 0 ? `${plan.monthlyRoi}%` : '—'}
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:10 }}>per month</div>
                  <div style={{ height:1, background:'rgba(10,239,255,0.08)', marginBottom:10 }} />
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', letterSpacing:'0.08em' }}>
                    Min ${plan.minAmount.toLocaleString()} · {plan.durationDays}d
                  </div>
                  {plan.maxAmount && (
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', letterSpacing:'0.08em', marginTop:2 }}>
                      Max ${plan.maxAmount.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form + stakes */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1 }}>

        {/* Form */}
        <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'24px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)', marginBottom:24 }}>Configure Stake</div>

          <div style={{ marginBottom:16 }}>
            <Label>Amount (USD)</Label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value)||0)} style={inp} />
          </div>

          {/* Selected plan summary */}
          {selectedPlan && (
            <div style={{ marginBottom:16, padding:'12px 14px', background:'rgba(10,239,255,0.04)', border:'1px solid rgba(10,239,255,0.10)' }}>
              <div style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--muted)', lineHeight:1.6, marginBottom:8 }}>{selectedPlan.description}</div>
              <div style={{ display:'flex', gap:16 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--cyan)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  {selectedPlan.monthlyRoi}% / month
                </span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  {selectedPlan.durationDays} days
                </span>
              </div>
            </div>
          )}

          <div style={{ marginBottom:16 }}>
            <label style={{ display:'flex', alignItems:'center', gap:10, cursor: bonusBalance <= 0 ? 'not-allowed' : 'pointer', opacity: bonusBalance <= 0 ? 0.5 : 1 }}>
              <input type="checkbox" checked={useBonusFirst} disabled={bonusBalance <= 0}
                onChange={() => setUseBonusFirst(v => !v)}
                style={{ width:14, height:14, accentColor:'var(--cyan)' }}/>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)' }}>Use bonus balance first</span>
            </label>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ width:14, height:14, accentColor:'var(--cyan)', marginTop:1, flexShrink:0 }}/>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.08em', color:'var(--muted-2)', lineHeight:1.7 }}>
                I agree to the Terms & Conditions and understand investments carry risk.
              </span>
            </label>
          </div>

          <button onClick={handleInvest} disabled={!canInvest || submitting}
            className="btn-primary"
            style={{ width:'100%', justifyContent:'center', cursor: canInvest&&!submitting ? 'pointer' : 'not-allowed', opacity: canInvest&&!submitting ? 1 : 0.5 }}>
            {submitting ? 'Processing…' : 'Confirm Stake'}
          </button>

          {/* Projection toggle */}
          {selectedPlan && amount > 0 && selectedPlan.monthlyRoi > 0 && (
            <button onClick={() => setShowProject(v => !v)}
              style={{ width:'100%', marginTop:10, padding:'10px', background:'transparent', border:'1px solid rgba(10,239,255,0.15)', color:'var(--cyan)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s' }}>
              {showProject ? '↑ Hide Projection' : '↓ Show Return Projection'}
            </button>
          )}

          <AnimatePresence>
            {showProject && (
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                style={{ overflow:'hidden', marginTop:12 }}>
                <ProjectionPanel amount={amount} plan={selectedPlan} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stakes list */}
        <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'24px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)', marginBottom:24 }}>Your Stakes</div>

          {investments.length === 0 ? (
            <div style={{ padding:'48px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
              No active stakes yet
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
              {investments.map(inv => {
                const pct     = clamp(inv.progress);
                const pending = Math.max(0, inv.profit_loss - inv.profit_paid);
                return (
                  <div key={inv.id} style={{ background:'var(--surface-2)', border:'1px solid rgba(10,239,255,0.06)', padding:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <div>
                        <div style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--text)' }}>{inv.planName}</div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted-2)', marginTop:2 }}>
                          ${fmt(inv.amount)} · {inv.durationDays}d
                        </div>
                      </div>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 8px',
                        background: inv.status==='active' ? 'rgba(10,239,255,0.06)' : 'rgba(14,203,129,0.06)',
                        color: inv.status==='active' ? 'var(--cyan)' : 'var(--green)',
                        border:`1px solid ${inv.status==='active'?'rgba(10,239,255,0.2)':'rgba(14,203,129,0.2)'}` }}>
                        {inv.status}
                      </span>
                    </div>

                    <div style={{ height:3, background:'rgba(10,239,255,0.08)', marginBottom:6 }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:'var(--cyan)', transition:'width 0.6s ease' }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', marginBottom:10 }}>
                      <span>{pct}% complete</span>
                      <span>{inv.end_at ? new Date(inv.end_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'}</span>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:'rgba(10,239,255,0.06)' }}>
                      {[
                        { label:'PnL',     value:`$${fmt(inv.profit_loss)}`, color: inv.profit_loss>=0?'var(--green)':'var(--red)' },
                        { label:'Paid',    value:`$${fmt(inv.profit_paid)}`, color:'var(--text)' },
                        { label:'Pending', value:`$${fmt(pending)}`,          color:'var(--cyan)' },
                      ].map((item, i) => (
                        <div key={i} style={{ background:'var(--surface)', padding:'8px 10px' }}>
                          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:3 }}>{item.label}</div>
                          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:item.color }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
