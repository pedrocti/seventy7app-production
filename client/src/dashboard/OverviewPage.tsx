// client/src/dashboard/OverviewPage.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useAuth } from '@/auth/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { BookOpen, Trophy, Calendar, ArrowRight, CreditCard } from 'lucide-react';
import { Link } from 'wouter';

const fmt = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.00' : n.toFixed(2); };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding:'10px 0', borderBottom:'1px solid rgba(10,239,255,0.08)', marginBottom:14 }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)' }}>
        {children}
      </span>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', ...style }}>
      {children}
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ height:3, background:'rgba(10,239,255,0.08)', overflow:'hidden' }}>
      <motion.div style={{ height:'100%', background:'var(--cyan)' }}
        initial={{ width:0 }} animate={{ width:`${Math.min(100,pct)}%` }}
        transition={{ duration:0.8, ease:[0.22,1,0.36,1] }} />
    </div>
  );
}

/* ── Carousel for programs/events ── */
function Carousel({ items, showMarketing }: { items: any[]; showMarketing: boolean }) {
  const x   = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const doubled = [...items, ...items];

  useEffect(() => {
    if (!ref.current || items.length === 0) return;
    const w = ref.current.scrollWidth / 2;
    let anim: any;
    if (!hovered && w > 0) {
      anim = animate(x, [0, -w], { duration: 40, ease:'linear', repeat:Infinity });
    }
    return () => anim?.stop();
  }, [hovered, items.length]);

  if (items.length === 0) return (
    <div style={{ padding:'32px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
      No programmes available
    </div>
  );

  return (
    <div style={{ overflow:'hidden' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div ref={ref} style={{ display:'flex', gap:12, x }}>
        {doubled.map((item, idx) => (
          <div key={`${item.id}-${idx}`}
            onClick={() => { window.location.href = item.type==='event' ? '/dashboard?tab=mentorship' : showMarketing ? '/learning/programs' : `/learning/program/${item.id}`; }}
            style={{ flexShrink:0, width:200, background:'var(--surface-2)', border:'1px solid rgba(10,239,255,0.08)', padding:'14px', cursor:'pointer', transition:'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='rgba(10,239,255,0.3)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='rgba(10,239,255,0.08)'}
          >
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              {item.type==='event' ? <Calendar size={13} style={{ color:'var(--cyan)' }}/> : <Trophy size={13} style={{ color:'var(--cyan)' }}/>}
              <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
                {item.type==='event' ? 'Event' : showMarketing ? 'Premium' : 'Enrolled'}
              </span>
            </div>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--text)', marginBottom:6, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {item.title}
            </div>
            {item.type!=='event' && !showMarketing && (
              <>
                <ProgressBar pct={item.progress} />
                <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted-2)', marginTop:3 }}>{item.progress}%</div>
              </>
            )}
            {(showMarketing && item.type!=='event') && (
              <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:300, color:'var(--cyan)' }}>${item.price}</div>
            )}
            {item.type==='event' && <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--cyan)', marginTop:3 }}>{item.price}</div>}
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--cyan)' }}>
                {item.type==='event' ? 'Join' : showMarketing ? 'Explore' : 'Continue'}
              </span>
              <ArrowRight size={9} style={{ color:'var(--cyan)' }}/>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function OverviewPage() {
  const { token } = useAuth();
  const [overview,  setOverview]  = useState<any>(null);
  const [programs,  setPrograms]  = useState<any[]>([]);
  const [trades,    setTrades]    = useState<{ active:any|null; history:any[] }>({ active:null, history:[] });
  const [events,    setEvents]    = useState<any[]>([]);
  const [loanSettings, setLoanSettings] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading,   setLoading]   = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [ov, pg, tr, ev, ls, pf] = await Promise.all([
        fetch('/api/user/overview',   { headers }).then(r=>r.json()),
        fetch('/api/learning/programs',{ headers }).then(r=>r.json()),
        fetch('/api/trades',           { headers }).then(r=>r.json()),
        fetch('/api/mentorship/events',{ headers }).then(r=>r.json()),
        fetch('/api/loans/settings',   { headers }).then(r=>r.json()),
        fetch('/api/portfolio',        { headers }).then(r=>r.json()),
      ]);
      if (ov?.success)  setOverview(ov);
      if (pg?.success)  setPrograms(pg.programs || []);
      if (tr?.success)  setTrades({ active: Array.isArray(tr.active) ? tr.active[0] ?? null : tr.active, history: tr.history || [] });
      if (ev?.success)  setEvents((ev.events || []).map((e:any) => ({ ...e, id:`ev-${e.id}`, type:'event', price: e.price==='0.00'?'FREE':`$${e.price}` })));
      if (ls?.success)  setLoanSettings(ls.settings);
      if (pf?.success)  setPortfolio(pf.portfolio);
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  if (loading || !overview) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
      Loading overview…
    </div>
  );

  const totals    = overview.totals || {};
  const recentTx  = overview.recent_transactions || [];
  const recentInv = overview.recent_investments  || [];

  const enrolled = (overview.enrolled_programs || []).map((p:any) => ({ ...p, type:'program', price:fmt(p.price) }));
  const showMarketing = enrolled.length===0 && programs.length>0;
  const carouselItems = showMarketing
    ? [...programs.map((p:any)=>({...p,type:'program',price:fmt(p.price)})), ...events]
    : [...enrolled, ...events];

  // Loan eligibility — stakers OR portfolio management clients
  const totalInvested   = Number(totals.total_invested ?? 0);
  const hasPortfolio    = portfolio && portfolio.amount;
  const minInvestment   = Number(loanSettings?.min_investment ?? 5000);
  const maxLoanPct      = Number(loanSettings?.max_loan_pct ?? 50);
  const intRate         = Number(loanSettings?.interest_rate ?? 15);
  const portfolioAmount = Number(portfolio?.amount ?? 0);
  const loanEligible    = totalInvested >= minInvestment || hasPortfolio;
  const maxLoan         = hasPortfolio
    ? (portfolioAmount * maxLoanPct) / 100
    : (totalInvested * maxLoanPct) / 100;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>

      {/* ── Key metrics ── */}
      <Card>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)' }}>
          {[
            { label:'Active Stakes',  value: String(totals.active_investments ?? 0), accent:true },
            { label:'Total Staked',   value:`$${fmt(totals.total_invested)}` },
            { label:'Total Profit',   value:`$${fmt(totals.total_profit)}`, accent:true },
          ].map((item, i) => (
            <div key={i} style={{ padding:'18px 20px', borderRight:'1px solid rgba(10,239,255,0.07)' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:6 }}>{item.label}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(16px,1.8vw,22px)', fontWeight:300, color: item.accent ? 'var(--cyan)' : 'var(--text)', lineHeight:1 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Active Trade (full width — prominent) ── */}
      {trades.active && (
        <Card>
          <div style={{ padding:'20px', display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.5, repeat:Infinity }}
                  style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', display:'inline-block' }}/>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--green)' }}>
                  Live Signal — Trading Desk Active
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:16, marginBottom:8 }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'clamp(20px,2.5vw,32px)', fontWeight:300, color:'var(--text)' }}>
                  {trades.active.pair || trades.active.symbol || '—'}
                </span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:500,
                  color: (trades.active.direction === 'LONG' || trades.active.side?.toLowerCase() === 'buy') ? 'var(--green)' : 'var(--red)' }}>
                  {(trades.active.direction || trades.active.side || '—').toUpperCase()}
                </span>
              </div>
              <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:3 }}>Entry Price</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text)' }}>${fmt(trades.active.entry_price ?? trades.active.price ?? 0)}</div>
                </div>
                <div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:3 }}>Opened</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text)' }}>
                    {trades.active.created_at ? format(new Date(trades.active.created_at), 'MMM d, HH:mm') : '—'}
                  </div>
                </div>
                {trades.active.entry_notes && (
                  <div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:3 }}>Note</div>
                    <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--muted)', maxWidth:300 }}>{trades.active.entry_notes}</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ textAlign:'center', padding:'16px 24px', background:'rgba(14,203,129,0.06)', border:'1px solid rgba(14,203,129,0.15)', flexShrink:0 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--green)', marginBottom:6 }}>Status</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--green)' }}>Active</div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Recent trade results ── */}
      {trades.history.length > 0 && (
        <Card>
          <div style={{ padding:'20px' }}>
            <SectionLabel>Recent Trade Results</SectionLabel>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:1, background:'rgba(10,239,255,0.08)' }}>
              {trades.history.slice(0, 5).map((t: any) => {
                const pnl    = Number(t.pnl_percent ?? 0);
                const isWin  = pnl > 0;
                return (
                  <div key={t.id} style={{ background:'var(--surface)', padding:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--text)' }}>{t.pair || '—'}</span>
                      <span style={{ width:6, height:6, borderRadius:0, background: isWin ? 'var(--green)' : 'var(--red)', display:'inline-block' }}/>
                    </div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color: isWin ? 'var(--green)' : 'var(--red)' }}>
                      {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}%
                    </div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', marginTop:6, letterSpacing:'0.06em' }}>
                      {(t.side || t.direction || '').toUpperCase()}
                      {t.resolved_at && ` · ${format(new Date(t.resolved_at), 'MMM d')}`}
                    </div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color: isWin ? 'var(--green)' : 'var(--red)', marginTop:4 }}>
                      {isWin ? 'WIN' : 'LOSS'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* ── Three columns: programmes, activity, stakes ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1 }}>

        {/* Programmes carousel */}
        <Card>
          <div style={{ padding:'20px' }}>
            <SectionLabel>{showMarketing ? 'Discover Programmes' : 'My Learning'}</SectionLabel>
            <Carousel items={carouselItems} showMarketing={showMarketing} />
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <div style={{ padding:'20px' }}>
            <SectionLabel>Recent Activity</SectionLabel>
            {recentTx.length === 0 ? (
              <div style={{ padding:'24px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>No transactions yet</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column' }}>
                {recentTx.slice(0,6).map((t: any) => (
                  <div key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(10,239,255,0.05)' }}>
                    <div>
                      <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--text)', textTransform:'capitalize' }}>
                        {t.type==='referral_bonus' ? 'Referral Bonus' : t.type}
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', marginTop:1 }}>
                        {t.created_at ? format(new Date(t.created_at), 'MMM d') : ''}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color: Number(t.amount)>0 ? 'var(--green)' : 'var(--red)' }}>
                        {Number(t.amount)>0?'+':''}{fmt(Math.abs(Number(t.amount)))}
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.08em', textTransform:'uppercase', color: t.status==='completed'?'var(--green)':t.status==='rejected'?'var(--red)':'var(--muted-2)', marginTop:1 }}>
                        {t.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Active stakes */}
        <Card>
          <div style={{ padding:'20px' }}>
            <SectionLabel>Active Stakes</SectionLabel>
            {recentInv.length === 0 ? (
              <div style={{ padding:'24px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>No active stakes</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {recentInv.slice(0,4).map((inv: any) => {
                  const now   = Date.now();
                  const start = inv.start_at ? new Date(inv.start_at).getTime() : new Date(inv.created_at).getTime();
                  const end   = start + Number(inv.duration_days ?? 30) * 86400000;
                  const pct   = Math.min(100, Math.round(Math.max(0,(now-start))/(Math.max(1,end-start))*100));
                  return (
                    <div key={inv.id} style={{ paddingBottom:10, borderBottom:'1px solid rgba(10,239,255,0.06)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <div>
                          <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--text)' }}>{inv.plan_name || 'Plan'}</div>
                          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', marginTop:1 }}>${fmt(inv.amount)}</div>
                        </div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color: Number(inv.profit_loss??0)>=0?'var(--green)':'var(--red)', textAlign:'right' }}>
                          {Number(inv.profit_loss??0)>=0?'+':''}{fmt(inv.profit_loss)}
                        </div>
                      </div>
                      <ProgressBar pct={pct} />
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted-2)', marginTop:3 }}>{pct}% complete</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Loan CTA ── always visible, eligibility-aware ── */}
      <Card>
        <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'auto 1fr auto', gap:20, alignItems:'center' }}>
          <div style={{ width:40, height:40, background:'rgba(10,239,255,0.06)', border:'1px solid rgba(10,239,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <CreditCard size={18} style={{ color:'var(--cyan)' }}/>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:300, color:'var(--text)', marginBottom:4 }}>
              Capital Loan Programme
            </div>
            {loanEligible ? (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.08em', color:'var(--muted-2)', lineHeight:1.6 }}>
                You qualify for up to <span style={{ color:'var(--cyan)' }}>${fmt(maxLoan)}</span> at {intRate}% annual interest — based on your {hasPortfolio ? 'portfolio management account' : 'active stake'}.
              </p>
            ) : (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.08em', color:'var(--muted-2)', lineHeight:1.6 }}>
                Stake ${minInvestment.toLocaleString()}+ or enrol in portfolio management to qualify for a capital loan.
              </p>
            )}
          </div>
          <Link href="/dashboard" onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail:'loan' }))}
            className={loanEligible ? 'btn-primary' : 'btn-ghost'}
            style={{ textDecoration:'none', display:'inline-flex', flexShrink:0, fontSize:11 }}>
            {loanEligible ? 'Apply Now' : 'Learn More'}
          </Link>
        </div>
      </Card>

    </div>
  );
}