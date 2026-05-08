// client/src/dashboard/LoanPage.tsx
// Capital Loan Programme — available to users with $5,000+ active stake
import { useEffect, useState, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const fmt = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.00' : n.toFixed(2); };

function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', display:'block', marginBottom:6 }}>{children}</span>;
}

interface Settings {
  interest_rate:  string;
  min_investment: string;
  max_loan_pct:   string;
}

interface Loan {
  id:              number;
  amount:          string;
  interest_rate:   string;
  duration_months: number;
  status:          string;
  purpose:         string;
  admin_notes:     string;
  approved_at:     string | null;
  created_at:      string;
}

export default function LoanPage() {
  const { token } = useAuth();
  const [settings,   setSettings]   = useState<Settings | null>(null);
  const [loans,      setLoans]      = useState<Loan[]>([]);
  const [invested,   setInvested]   = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount,     setAmount]     = useState('');
  const [duration,   setDuration]   = useState(12);
  const [purpose,    setPurpose]    = useState('');
  const [eligible,   setEligible]   = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  async function load() {
    if (!token) return;
    try {
      const [sRes, lRes, ovRes] = await Promise.all([
        fetch('/api/loans/settings', { headers }).then(r=>r.json()),
        fetch('/api/loans',          { headers }).then(r=>r.json()),
        fetch('/api/user/overview',  { headers }).then(r=>r.json()),
      ]);
      if (sRes.success)  setSettings(sRes.settings);
      if (lRes.success)  setLoans(lRes.loans || []);
      if (ovRes.success) {
        const inv = Number(ovRes.totals?.total_invested ?? 0);
        setInvested(inv);
        setEligible(inv >= Number(sRes.settings?.min_investment ?? 5000));
      }
    } catch { toast.error('Failed to load loan data'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [token]);

  async function handleApply() {
    if (!amount || Number(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setSubmitting(true);
    try {
      const r = await fetch('/api/loans/apply', {
        method:'POST',
        headers:{ ...headers, 'Content-Type':'application/json' },
        body: JSON.stringify({ amount: Number(amount), duration_months: duration, purpose }),
      });
      const d = await r.json();
      if (d.success) {
        toast.success('Loan application submitted — admin will review within 48 hours');
        setAmount(''); setPurpose('');
        load();
      } else {
        toast.error(d.error || 'Application failed');
      }
    } catch { toast.error('Network error'); }
    setSubmitting(false);
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
      Loading…
    </div>
  );

  const minInv   = Number(settings?.min_investment ?? 5000);
  const maxPct   = Number(settings?.max_loan_pct   ?? 50);
  const intRate  = Number(settings?.interest_rate  ?? 15);
  const maxLoan  = (invested * maxPct) / 100;
  const enteredAmt = Number(amount) || 0;
  const monthlyInt = enteredAmt * (intRate / 100) / 12;
  const totalRepay = enteredAmt + (monthlyInt * duration);

  const inp: CSSProperties = {
    width:'100%', background:'var(--surface-2)', border:'1px solid rgba(10,239,255,0.12)',
    padding:'10px 14px', color:'var(--text)', fontFamily:'var(--font-sans)',
    fontSize:13, fontWeight:300, outline:'none', borderRadius:0, boxSizing:'border-box',
  };

  const statusColor: Record<string, string> = {
    pending:  'var(--cyan)',
    approved: 'var(--green)',
    rejected: 'var(--red)',
    repaid:   'var(--muted-2)',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>

      {/* Header */}
      <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'24px' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--cyan)', background:'rgba(10,239,255,0.06)', border:'1px solid rgba(10,239,255,0.15)', padding:'3px 10px', display:'inline-block', marginBottom:16 }}>
          Capital Loan Programme
        </span>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(20px,2.5vw,32px)', fontWeight:300, color:'var(--text)', marginBottom:12 }}>
          Member <em>Loan Facility</em>
        </div>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:300, color:'var(--muted)', lineHeight:1.7, maxWidth:560 }}>
          Exclusive to members with an active stake of ${minInv.toLocaleString()} or above.
          Borrow up to {maxPct}% of your staked capital at {intRate}% annual interest.
        </p>
      </div>

      {/* Eligibility + terms */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'rgba(10,239,255,0.08)' }}>
        {[
          { label:'Your Active Stake', value:`$${fmt(invested)}`,  accent: eligible },
          { label:'Min. Stake Required', value:`$${minInv.toLocaleString()}` },
          { label:'Max Loan',           value:`${maxPct}% of stake` },
          { label:'Annual Rate',        value:`${intRate}%` },
        ].map((item, i) => (
          <div key={i} style={{ background:'var(--surface)', padding:'18px 20px' }}>
            <Label>{item.label}</Label>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(16px,1.8vw,22px)', fontWeight:300, lineHeight:1, color: (item as any).accent ? 'var(--cyan)' : 'var(--text)' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Not eligible notice */}
      {!eligible && (
        <div style={{ background:'var(--surface)', border:'1px solid rgba(246,70,93,0.2)', padding:'24px', display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--red)', flexShrink:0, marginTop:6 }}/>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--red)', marginBottom:6 }}>Not Yet Eligible</div>
            <p style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--muted)', lineHeight:1.7 }}>
              You need at least <strong style={{ color:'var(--text)' }}>${minInv.toLocaleString()}</strong> in active stakes to apply for a loan.
              Your current active stake is <strong style={{ color:'var(--text)' }}>${fmt(invested)}</strong>.
              Visit the <strong style={{ color:'var(--cyan)' }}>Staking</strong> page to invest and qualify.
            </p>
          </div>
        </div>
      )}

      {/* Application form + calculator (shown if eligible) */}
      {eligible && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1 }}>

          {/* Form */}
          <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'24px' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)', marginBottom:24 }}>Apply for a Loan</div>

            <div style={{ marginBottom:16 }}>
              <Label>Loan Amount (max ${fmt(maxLoan)})</Label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Up to $${fmt(maxLoan)}`} style={inp} />
            </div>

            <div style={{ marginBottom:16 }}>
              <Label>Duration</Label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={{ ...inp, cursor:'pointer' }}>
                {[3,6,12,18,24].map(m => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>

            <div style={{ marginBottom:20 }}>
              <Label>Purpose (optional)</Label>
              <textarea value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Brief description of loan purpose…"
                style={{ ...inp, resize:'vertical', minHeight:80, lineHeight:1.7 }} />
            </div>

            <button onClick={handleApply} disabled={submitting || !amount || Number(amount) <= 0 || Number(amount) > maxLoan}
              className="btn-primary"
              style={{ width:'100%', justifyContent:'center', cursor:'pointer', opacity: (!submitting && amount && Number(amount) > 0 && Number(amount) <= maxLoan) ? 1 : 0.5 }}>
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>

            <p style={{ marginTop:12, fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted-2)', lineHeight:1.7 }}>
              Applications reviewed within 48 hours. Approved amounts credited to your main balance.
            </p>
          </div>

          {/* Calculator */}
          <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'24px' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)', marginBottom:24 }}>Repayment Calculator</div>

            {enteredAmt > 0 ? (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(10,239,255,0.08)', marginBottom:16 }}>
                  {[
                    { label:'Loan Amount',    value:`$${fmt(enteredAmt)}` },
                    { label:'Duration',       value:`${duration} months` },
                    { label:'Monthly Interest',value:`$${fmt(monthlyInt)}` },
                    { label:'Total Repayable',value:`$${fmt(totalRepay)}`, accent:true },
                  ].map((item, i) => (
                    <div key={i} style={{ background:'var(--surface)', padding:'14px' }}>
                      <Label>{item.label}</Label>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(14px,1.5vw,18px)', fontWeight:300, color:(item as any).accent ? 'var(--cyan)' : 'var(--text)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding:'16px', background:'rgba(10,239,255,0.04)', border:'1px solid rgba(10,239,255,0.10)' }}>
                  <Label>Total Interest Payable</Label>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:300, color:'var(--red)' }}>${fmt(totalRepay - enteredAmt)}</div>
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted-2)', marginTop:8, lineHeight:1.7 }}>
                    {intRate}% annual rate · {duration}-month term · indicative only
                  </p>
                </div>
              </motion.div>
            ) : (
              <div style={{ padding:'48px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
                Enter a loan amount to see repayment projection
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan history */}
      {loans.length > 0 && (
        <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'24px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)', marginBottom:20 }}>My Applications</div>
          <div style={{ display:'flex', flexDirection:'column', gap:1, background:'rgba(10,239,255,0.08)' }}>
            {loans.map(loan => (
              <div key={loan.id} style={{ background:'var(--surface)', padding:'16px 20px', display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'center' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)' }}>${fmt(loan.amount)}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'2px 8px', border:`1px solid ${statusColor[loan.status] || 'var(--muted-2)'}`, color:statusColor[loan.status] || 'var(--muted-2)', background:'transparent' }}>
                      {loan.status}
                    </span>
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', letterSpacing:'0.08em' }}>
                    {loan.duration_months} months · {loan.interest_rate}% annual · Applied {format(new Date(loan.created_at), 'MMM d, yyyy')}
                  </div>
                  {loan.admin_notes && (
                    <div style={{ marginTop:8, fontFamily:'var(--font-sans)', fontSize:11, color:'var(--muted)', lineHeight:1.6, padding:'8px 12px', background:'rgba(10,239,255,0.03)', borderLeft:'2px solid rgba(10,239,255,0.2)' }}>
                      {loan.admin_notes}
                    </div>
                  )}
                </div>
                {loan.approved_at && (
                  <div style={{ textAlign:'right' }}>
                    <Label>Approved</Label>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--green)' }}>{format(new Date(loan.approved_at), 'MMM d, yyyy')}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}