// client/src/dashboard/PortfolioPage.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/auth/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

const fmt = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.00' : n.toFixed(2); };

function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', display:'block', marginBottom:6 }}>{children}</span>;
}

type Step = 'intro' | 'contact' | 'amount';

export default function PortfolioPage() {
  const { token } = useAuth();
  const [loading,    setLoading]    = useState(true);
  const [portfolio,  setPortfolio]  = useState<any>(null);
  const [balance,    setBalance]    = useState(0);
  const [step,       setStep]       = useState<Step>('intro');
  const [reqAmount,  setReqAmount]  = useState('');
  const [submitted,  setSubmitted]  = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    Promise.all([
      fetch('/api/portfolio', { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
      fetch('/api/user/profile', { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
    ]).then(([pf, pr]) => {
      if (pf.success && pf.hasPortfolio) setPortfolio(pf.portfolio);
      if (pr.success) setBalance(Number(pr.user.balance));
    }).finally(() => setLoading(false));
  }, [token]);

  async function submitRequest() {
    const amount = Number(reqAmount);
    if (isNaN(amount) || amount < 25000) { alert('Minimum amount is $25,000'); return; }
    if (balance < amount) { alert('Insufficient balance. Please fund your account.'); return; }
    const r = await fetch('/api/portfolio/request', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify({ amount }),
    });
    const d = await r.json();
    if (d.success) setSubmitted(true);
    else alert(d.message || 'Request failed');
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Loading…</div>
  );

  /* ── No portfolio — onboarding ── */
  if (!portfolio) return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
      <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'36px' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--cyan)', background:'rgba(10,239,255,0.06)', border:'1px solid rgba(10,239,255,0.15)', padding:'3px 10px', display:'inline-block', marginBottom:20 }}>
          Managed Portfolios · Min. $25,000
        </span>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,3vw,40px)', fontWeight:300, color:'var(--text)', lineHeight:1.1, marginBottom:16 }}>
          Private Portfolio<br/><em>Management</em>
        </div>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:300, color:'var(--muted)', lineHeight:1.8, maxWidth:560, marginBottom:32 }}>
          A bespoke portfolio management service designed exclusively for high-income and high-net-worth individuals seeking long-term wealth creation through disciplined, globally diversified investing.
        </p>

        {step === 'intro' && (
          <button onClick={() => setStep('contact')} className="btn-primary" style={{ cursor:'pointer' }}>
            Request Portfolio Management
          </button>
        )}

        {step === 'contact' && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            style={{ maxWidth:520, background:'var(--surface-2)', border:'1px solid rgba(10,239,255,0.10)', padding:'32px' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:300, color:'var(--text)', marginBottom:16 }}>Speak With an Advisor</div>
            <p style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--muted)', lineHeight:1.7, marginBottom:24 }}>
              We recommend speaking with a financial professional before proceeding with portfolio management.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              <a href="https://wa.me/447887649072" target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', background:'rgba(14,203,129,0.08)', border:'1px solid rgba(14,203,129,0.25)', color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', transition:'all 0.2s' }}>
                WhatsApp
              </a>
              <a href="tel:+447887649072"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', background:'var(--surface)', border:'1px solid rgba(10,239,255,0.12)', color:'var(--text)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none' }}>
                Call Us
              </a>
            </div>
            <button onClick={() => setStep('amount')}
              style={{ background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--cyan)' }}>
              Continue without advisor →
            </button>
          </motion.div>
        )}

        {step === 'amount' && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            style={{ maxWidth:520, background:'var(--surface-2)', border:'1px solid rgba(10,239,255,0.10)', padding:'32px' }}>
            {submitted ? (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <CheckCircle2 size={48} style={{ color:'var(--green)', marginBottom:16 }}/>
                <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:300, color:'var(--green)', marginBottom:8 }}>Request Submitted</div>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--muted)' }}>Our team will contact you shortly to discuss your portfolio.</p>
              </div>
            ) : (
              <>
                <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--text)', marginBottom:8 }}>Enter Investment Amount</div>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:20 }}>Available balance: ${balance.toLocaleString()}</p>
                <input type="number" value={reqAmount} onChange={e => setReqAmount(e.target.value)} placeholder="Minimum $25,000"
                  style={{ width:'100%', background:'var(--surface)', border:'1px solid rgba(10,239,255,0.12)', padding:'12px 16px', color:'var(--text)', fontFamily:'var(--font-sans)', fontSize:14, outline:'none', marginBottom:12, boxSizing:'border-box' as const }}/>
                <button onClick={submitRequest} disabled={Number(reqAmount) < 25000 || balance < Number(reqAmount)}
                  className="btn-primary" style={{ width:'100%', justifyContent:'center', cursor:'pointer', opacity: Number(reqAmount) >= 25000 && balance >= Number(reqAmount) ? 1 : 0.5 }}>
                  Confirm Portfolio Management
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Trust strip */}
      <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'20px', display:'flex', alignItems:'center', gap:20 }}>
        <ShieldCheck size={16} style={{ color:'var(--cyan)', flexShrink:0 }}/>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
          Capital managed with institutional discipline and full transparency
        </span>
      </div>
    </div>
  );

  /* ── Has portfolio — dashboard ── */
  const allocation = [
    { name:'Crypto',      value: portfolio.crypto_percent      || 0, color:'var(--cyan)'   },
    { name:'Equity',      value: portfolio.equity_percent      || 0, color:'var(--green)'  },
    { name:'Real Estate', value: portfolio.real_estate_percent || 0, color:'#8B5CF6'       },
    { name:'Commodities', value: portfolio.commodities_percent || 0, color:'#F59E0B'       },
    { name:'Bonds',       value: portfolio.bonds_percent       || 0, color:'var(--muted)'  },
  ].filter(a => a.value > 0);

  const months = 7;
  const growthCurve = Array.from({ length: months }, (_, i) => ({
    month: `M${i}`,
    value: portfolio.amount * (1 + (portfolio.performance_percent || 0) / 100) ** (i / (months-1)),
  }));

  const perfPos = (portfolio.performance_percent || 0) >= 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(10,239,255,0.08)' }}>
        {[
          { label:'Amount Managed',  value:`$${Number(portfolio.amount).toLocaleString()}`, accent:true  },
          { label:'Performance',     value:`${perfPos?'+':''}${fmt(portfolio.performance_percent)}%`, color: perfPos ? 'var(--green)' : 'var(--red)' },
          { label:'Last Updated',    value: portfolio.updated_at ? new Date(portfolio.updated_at).toLocaleDateString() : '—' },
        ].map((item, i) => (
          <div key={i} style={{ background:'var(--surface)', padding:'20px' }}>
            <Label>{item.label}</Label>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(18px,2vw,26px)', fontWeight:300, lineHeight:1, color:(item as any).color || ((item as any).accent ? 'var(--cyan)' : 'var(--text)') }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1 }}>
        <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'20px' }}>
          <Label>Growth Projection</Label>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthCurve}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0AEFFF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0AEFFF" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(10,239,255,0.06)" strokeDasharray="4 4" />
              <XAxis dataKey="month" stroke="var(--muted-2)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-2)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.14)', fontFamily:'var(--font-mono)', fontSize:10 }} />
              <Area type="monotone" dataKey="value" stroke="#0AEFFF" fill="url(#areaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'20px' }}>
          <Label>Asset Allocation</Label>
          {allocation.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted-2)', textTransform:'uppercase', letterSpacing:'0.1em' }}>No allocation data</div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:24 }}>
              <PieChart width={160} height={160}>
                <Pie data={allocation} dataKey="value" innerRadius={45} outerRadius={70}>
                  {allocation.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {allocation.map(entry => (
                  <div key={entry.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:8, height:8, background:entry.color, flexShrink:0, display:'inline-block' }}/>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', letterSpacing:'0.06em' }}>{entry.name}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text)', marginLeft:'auto' }}>{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}