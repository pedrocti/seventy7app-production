// client/src/dashboard/LoanPage.tsx
import { useEffect, useState, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const fmt = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.00' : n.toFixed(2); };

function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', display:'block', marginBottom:6 }}>{children}</span>;
}

interface Eligibility {
  eligible:        boolean;
  reason:          string;
  totalInvested:   number;
  portfolioAmount: number;
  maxLoan:         number;
  interestRate:    number;
  minInvestment:   number;
  maxLoanPct:      number;
}

interface Loan {
  id: number; amount: string; interest_rate: string;
  duration_months: number; status: string; purpose: string;
  admin_notes: string; approved_at: string | null; created_at: string;
}

export default function LoanPage() {
  const { token } = useAuth();
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loans,       setLoans]       = useState<Loan[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [amount,      setAmount]      = useState('');
  const [duration,    setDuration]    = useState(12);
  const [purpose,     setPurpose]     = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  async function load() {
    if (!token) return;
    try {
      const [elRes, lRes] = await Promise.all([
        fetch('/api/loans/eligibility', { headers }).then(r=>r.json()),
        fetch('/api/loans',             { headers }).then(r=>r.json()),
      ]);
      if (elRes.success) setEligibility(elRes);
      if (lRes.success)  setLoans(lRes.loans || []);
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

  const el = eligibility;
  const enteredAmt = Number(amount) || 0;
  const monthlyInt = el ? enteredAmt * (el.interestRate / 100) / 12 : 0;
  const totalRepay = enteredAmt + (monthlyInt * duration);

  const inp: CSSProperties = {
    width:'100%', background:'var(--surface-2)', border:'1px solid rgba(10,239,255,0.12)',
    padding:'10px 14px', color:'var(--text)', fontFamily:'var(--font-sans)',
    fontSize:13, fontWeight:300, outline:'none', borderRadius:0, boxSizing:'border-box',
  };

  const statusColor: Record<string, string> = {
    pending:'var(--cyan)', approved:'var(--green)', rejected:'var(--red)', repaid:'var(--muted-2)',
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
        <p style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:300, color:'var(--muted)', lineHeight:1.7, maxWidth:620 }}>
          Exclusive to members with an active stake of ${el?.minInvestment?.toLocaleString() ?? '5,000'}+ or an approved Portfolio Management account of $50,000+.
          Borrow up to {el?.maxLoanPct ?? 50}% of your qualifying capital at {el?.interestRate ?? 15}% annual interest.
        </p>
      </div>

      {/* Qualification paths */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1 }}>
        {[
          {
            title:       'Staking Route',
            desc:        `Maintain $${el?.minInvestment?.toLocaleString() ?? '5,000'}+ in active stakes`,
            value:       `$${fmt(el?.totalInvested)}`,
            label:       'Your Active Stake',
            qualified:   (el?.totalInvested ?? 0) >= (el?.minInvestment ?? 5000),
          },
          {
            title:       'Portfolio Management Route',
            desc:        'Hold an approved Portfolio Management account of $50,000+',
            value:       `$${fmt(el?.portfolioAmount)}`,
            label:       'Your Portfolio',
            qualified:   (el?.portfolioAmount ?? 0) >= 50000,
          },
        ].map((path, i) => (
          <div key={i} style={{ background:'var(--surface)', border:`1px solid ${path.qualified ? 'rgba(14,203,129,0.2)' : 'rgba(10,239,255,0.08)'}`, padding:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background: path.qualified ? 'var(--green)' : 'rgba(240,237,230,0.2)', display:'inline-block' }}/>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color: path.qualified ? 'var(--green)' : 'var(--muted-2)' }}>
                {path.qualified ? 'Qualified' : 'Not Qualified'}
              </span>
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:300, color:'var(--text)', marginBottom:6 }}>{path.title}</div>
            <p style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--muted)', lineHeight:1.6, marginBottom:12 }}>{path.desc}</p>
            <div>
              <Label>{path.label}</Label>
              <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color: path.qualified ? 'var(--cyan)' : 'var(--text)' }}>{path.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Loan terms strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(10,239,255,0.08)' }}>
        {[
          { label:'Max Loan Available',  value: el?.eligible ? `$${fmt(el.maxLoan)}` : 'Not Eligible' },
          { label:'Annual Interest Rate', value:`${el?.interestRate ?? 15}%` },
          { label:'Max Loan Percentage', value:`${el?.maxLoanPct ?? 50}% of capital` },
        ].map((item, i) => (
          <div key={i} style={{ background:'var(--surface)', padding:'18px 20px' }}>
            <Label>{item.label}</Label>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(16px,1.8vw,22px)', fontWeight:300, color: i===0 && el?.eligible ? 'var(--cyan)' : 'var(--text)', lineHeight:1 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Not eligible notice */}
      {!el?.eligible && (
        <div style={{ background:'var(--surface)', border:'1px solid rgba(246,70,93,0.2)', padding:'24px', display:'flex', alignItems:'flex-start', gap:16 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--red)', flexShrink:0, marginTop:6, display:'inline-block' }}/>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--red)', marginBottom:8 }}>Not Yet Eligible</div>
            <p style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--muted)', lineHeight:1.7, marginBottom:8 }}>
              To qualify, you need one of the following:
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                `Active stakes of $${el?.minInvestment?.toLocaleString() ?? '5,000'}+ (currently $${fmt(el?.totalInvested)})`,
                `An approved Portfolio Management account of $50,000+ (currently $${fmt(el?.portfolioAmount)})`,
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                  <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(246,70,93,0.5)', flexShrink:0, marginTop:6, display:'inline-block' }}/>
                  <span style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--muted)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Application form + calculator */}
      {el?.eligible && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1 }}>
          <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'24px' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)', marginBottom:24 }}>Apply for a Loan</div>

            <div style={{ marginBottom:16 }}>
              <Label>Loan Amount (max ${fmt(el.maxLoan)})</Label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder={`Up to $${fmt(el.maxLoan)}`} style={inp} />
            </div>

            <div style={{ marginBottom:16 }}>
              <Label>Duration</Label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))}
                style={{ ...inp, cursor:'pointer' }}>
                {[3,6,12,18,24].map(m => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>

            <div style={{ marginBottom:20 }}>
              <Label>Purpose (optional)</Label>
              <textarea value={purpose} onChange={e => setPurpose(e.target.value)}
                placeholder="Brief description…"
                style={{ ...inp, resize:'vertical', minHeight:80, lineHeight:1.7 }} />
            </div>

            <button onClick={handleApply}
              disabled={submitting || !amount || Number(amount) <= 0 || Number(amount) > el.maxLoan}
              className="btn-primary"
              style={{ width:'100%', justifyContent:'center', cursor:'pointer', opacity:(!submitting && amount && Number(amount) > 0 && Number(amount) <= el.maxLoan) ? 1 : 0.5 }}>
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
                    { label:'Loan Amount',     value:`$${fmt(enteredAmt)}`,   accent:false },
                    { label:'Duration',        value:`${duration} months`,    accent:false },
                    { label:'Monthly Interest',value:`$${fmt(monthlyInt)}`,   accent:false },
                    { label:'Total Repayable', value:`$${fmt(totalRepay)}`,   accent:true  },
                  ].map((item, i) => (
                    <div key={i} style={{ background:'var(--surface)', padding:'14px' }}>
                      <Label>{item.label}</Label>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(14px,1.5vw,18px)', fontWeight:300, color: item.accent ? 'var(--cyan)' : 'var(--text)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:'16px', background:'rgba(246,70,93,0.04)', border:'1px solid rgba(246,70,93,0.12)' }}>
                  <Label>Total Interest Payable</Label>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:300, color:'var(--red)' }}>${fmt(totalRepay - enteredAmt)}</div>
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted-2)', marginTop:8, lineHeight:1.7 }}>
                    {el.interestRate}% annual · {duration}-month term · indicative only
                  </p>
                </div>
              </motion.div>
            ) : (
              <div style={{ padding:'48px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
                Enter a loan amount to see projection
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
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)' }}>${fmt(loan.amount)}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'2px 8px', border:`1px solid ${statusColor[loan.status]||'var(--muted-2)'}`, color:statusColor[loan.status]||'var(--muted-2)' }}>
                      {loan.status}
                    </span>
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', letterSpacing:'0.08em' }}>
                    {loan.duration_months} months · {loan.interest_rate}% annual · Applied {format(new Date(loan.created_at), 'MMM d, yyyy')}
                  </div>
                  {loan.admin_notes && (
                    <div style={{ marginTop:8, fontFamily:'var(--font-sans)', fontSize:11, color:'var(--muted)', padding:'8px 12px', background:'rgba(10,239,255,0.03)', borderLeft:'2px solid rgba(10,239,255,0.2)' }}>
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