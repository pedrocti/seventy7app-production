// client/src/dashboard/OverviewPage.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useAuth } from '@/auth/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { BookOpen, Trophy, Calendar, ArrowRight } from 'lucide-react';

const fmt = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.00' : n.toFixed(2); };

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding:'12px 0', borderBottom:'1px solid rgba(10,239,255,0.08)', marginBottom:16 }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)' }}>
        {children}
      </span>
    </div>
  );
}

/* ── Data cell ── */
function DataCell({ label, value, accent }: { label:string; value:string; accent?:boolean }) {
  return (
    <div style={{ padding:'18px 20px', borderRight:'1px solid rgba(10,239,255,0.07)' }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(16px,1.8vw,22px)', fontWeight:300, color: accent ? 'var(--cyan)' : 'var(--text)', lineHeight:1 }}>{value}</div>
    </div>
  );
}

/* ── Progress bar ── */
function ProgressBar({ pct, color = 'var(--cyan)' }: { pct:number; color?:string }) {
  return (
    <div style={{ height:3, background:'rgba(10,239,255,0.08)', position:'relative', overflow:'hidden' }}>
      <motion.div style={{ position:'absolute', left:0, top:0, height:'100%', background:color }}
        initial={{ width:0 }} animate={{ width:`${Math.min(100,pct)}%` }}
        transition={{ duration:0.8, ease:[0.22,1,0.36,1] }} />
    </div>
  );
}

/* ── Card wrapper ── */
function Card({ children, style }: { children:React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', ...style }}>
      {children}
    </div>
  );
}

/* ── Carousel for programs/events ── */
function Carousel({ items, showMarketing }: { items:any[]; showMarketing:boolean }) {
  const x = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const doubled = [...items, ...items];

  useEffect(() => {
    if (!ref.current) return;
    const w = ref.current.scrollWidth / 2;
    let anim: any;
    if (!hovered && w > 0) {
      anim = animate(x, [0, -w], { duration: 40, ease:'linear', repeat:Infinity });
    }
    return () => anim?.stop();
  }, [hovered, items.length]);

  if (items.length === 0) return (
    <div style={{ padding:'40px 0', textAlign:'center', color:'var(--muted-2)', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase' }}>
      No programmes available
    </div>
  );

  return (
    <div style={{ overflow:'hidden' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div ref={ref} style={{ display:'flex', gap:12, x }}>
        {doubled.map((item, idx) => (
          <div key={`${item.id}-${idx}`}
            onClick={() => { window.location.href = item.type==='event' ? '/dashboard?tab=mentorship' : showMarketing ? '/learning/programs' : `/learning/program/${item.id}`; }}
            style={{
              flexShrink:0, width:220,
              background:'var(--surface-2)',
              border:'1px solid rgba(10,239,255,0.08)',
              padding:'16px', cursor:'pointer',
              transition:'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='rgba(10,239,255,0.3)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='rgba(10,239,255,0.08)'}
          >
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              {item.type==='event'
                ? <Calendar size={14} style={{ color:'var(--cyan)' }}/>
                : <Trophy size={14} style={{ color:'var(--cyan)' }}/>
              }
              <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
                {item.type==='event' ? 'Event' : showMarketing ? 'Premium' : 'Enrolled'}
              </span>
            </div>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:12, fontWeight:400, color:'var(--text)', marginBottom:8, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {item.title}
            </div>
            {item.type!=='event' && !showMarketing && (
              <div>
                <ProgressBar pct={item.progress} />
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', marginTop:4 }}>{item.progress}% complete</div>
              </div>
            )}
            {showMarketing && item.type!=='event' && (
              <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:300, color:'var(--cyan)' }}>${item.price}</div>
            )}
            {item.type==='event' && (
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--cyan)', marginTop:4 }}>{item.price}</div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:10 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--cyan)' }}>
                {item.type==='event' ? 'Join' : showMarketing ? 'Explore' : 'Continue'}
              </span>
              <ArrowRight size={10} style={{ color:'var(--cyan)' }}/>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function OverviewPage() {
  const { token } = useAuth();
  const [overview,   setOverview]   = useState<any>(null);
  const [programs,   setPrograms]   = useState<any[]>([]);
  const [trades,     setTrades]     = useState<{ active:any|null; history:any[] }>({ active:null, history:[] });
  const [events,     setEvents]     = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [ov, pg, tr, ev] = await Promise.all([
        fetch('/api/user/overview', { headers }).then(r=>r.json()),
        fetch('/api/learning/programs', { headers }).then(r=>r.json()),
        fetch('/api/trades', { headers }).then(r=>r.json()),
        fetch('/api/mentorship/events', { headers }).then(r=>r.json()),
      ]);
      if (ov?.success)  setOverview(ov);
      if (pg?.success)  setPrograms(pg.programs || []);
      if (tr?.success)  setTrades({ active: Array.isArray(tr.active) ? tr.active[0] ?? null : tr.active, history: tr.history || [] });
      if (ev?.success)  setEvents((ev.events || []).map((e:any) => ({ ...e, id:`ev-${e.id}`, type:'event', price: e.price==='0.00'?'FREE':`$${e.price}` })));
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  if (loading || !overview) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
      Loading overview…
    </div>
  );

  const totals = overview.totals || {};
  const recentTx  = overview.recent_transactions || [];
  const recentInv = overview.recent_investments  || [];

  const enrolled = (overview.enrolled_programs || []).map((p:any) => ({ ...p, type:'program', price:fmt(p.price) }));
  const showMarketing = enrolled.length===0 && programs.length>0;
  const carouselItems = showMarketing
    ? [...programs.map((p:any)=>({...p,type:'program',price:fmt(p.price)})), ...events]
    : [...enrolled, ...events];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>

      {/* ── Key metrics strip ── */}
      <Card>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)' }}>
          <DataCell label="Active Stakes"    value={String(totals.active_investments ?? 0)} accent />
          <DataCell label="Total Staked"     value={`$${fmt(totals.total_invested)}`} />
          <DataCell label="Total Profit"     value={`$${fmt(totals.total_profit)}`} accent />
        </div>
      </Card>

      {/* ── Three column section ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1 }}>

        {/* Programmes carousel */}
        <Card>
          <div style={{ padding:'20px' }}>
            <SectionLabel>{showMarketing ? 'Discover Programmes' : 'My Learning'}</SectionLabel>
            <Carousel items={carouselItems} showMarketing={showMarketing} />
          </div>
        </Card>

        {/* Live trade */}
        <Card>
          <div style={{ padding:'20px' }}>
            <SectionLabel>Live Signal</SectionLabel>
            {trades.active ? (
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--text)' }}>
                    {trades.active.pair || trades.active.symbol || '—'}
                  </span>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block' }}/>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--green)' }}>Live</span>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(10,239,255,0.08)' }}>
                  {[
                    { label:'Direction', value:(trades.active.direction||trades.active.side||'—').toUpperCase() },
                    { label:'Entry',     value:`$${fmt(trades.active.entry_price??trades.active.price??0)}` },
                  ].map((item,i) => (
                    <div key={i} style={{ background:'var(--surface)', padding:'12px 14px' }}>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:4 }}>{item.label}</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:13, color: item.label==='Direction' && item.value==='LONG' ? 'var(--green)' : item.label==='Direction' ? 'var(--red)' : 'var(--text)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {trades.active.created_at && (
                  <div style={{ marginTop:10, fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', letterSpacing:'0.08em' }}>
                    Opened {format(new Date(trades.active.created_at), 'MMM d, yyyy · HH:mm')}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding:'32px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
                No active signal
              </div>
            )}

            {/* Recent history */}
            {trades.history.length > 0 && (
              <div style={{ marginTop:20 }}>
                <SectionLabel>Recent Trades</SectionLabel>
                <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                  {trades.history.slice(0,3).map((t:any) => {
                    const pnl = Number(t.pnl_percent ?? 0);
                    return (
                      <div key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(10,239,255,0.06)' }}>
                        <div>
                          <div style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--text)' }}>{t.pair||'—'}</div>
                          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)' }}>{(t.side||t.direction||'').toUpperCase()}</div>
                        </div>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:500, color: pnl>0 ? 'var(--green)' : pnl<0 ? 'var(--red)' : 'var(--muted)' }}>
                          {pnl>0?'+':''}{pnl.toFixed(2)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <div style={{ padding:'20px' }}>
            <SectionLabel>Recent Activity</SectionLabel>
            {recentTx.length === 0 ? (
              <div style={{ padding:'32px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>No transactions yet</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column' }}>
                {recentTx.map((t:any) => (
                  <div key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(10,239,255,0.05)' }}>
                    <div>
                      <div style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--text)', textTransform:'capitalize' }}>
                        {t.type==='referral_bonus' ? 'Referral Bonus' : t.type}
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', marginTop:2 }}>
                        {t.created_at ? format(new Date(t.created_at),'MMM d, yyyy') : ''}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color: Number(t.amount)>0 ? 'var(--green)' : 'var(--red)' }}>
                        {Number(t.amount)>0?'+':''}{fmt(Math.abs(Number(t.amount)))}
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color: t.status==='completed' ? 'var(--green)' : t.status==='rejected' ? 'var(--red)' : 'var(--muted-2)', marginTop:2 }}>
                        {t.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Recent stakes ── */}
      <Card>
        <div style={{ padding:'20px' }}>
          <SectionLabel>Active Stakes</SectionLabel>
          {recentInv.length === 0 ? (
            <div style={{ padding:'32px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>No active stakes</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:1, background:'rgba(10,239,255,0.08)' }}>
              {recentInv.map((inv:any) => {
                const now   = Date.now();
                const start = inv.start_at ? new Date(inv.start_at).getTime() : new Date(inv.created_at).getTime();
                const end   = start + Number(inv.duration_days ?? 30) * 86400000;
                const pct   = Math.min(100, Math.round(Math.max(0,(now-start))/(Math.max(1,end-start))*100));
                const daysLeft = Math.max(0, Math.ceil((end-now)/86400000));
                return (
                  <div key={inv.id} style={{ background:'var(--surface)', padding:'18px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <div>
                        <div style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--text)' }}>{inv.plan_name || 'Plan'}</div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted-2)', marginTop:2 }}>${fmt(inv.amount)}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color: Number(inv.profit_loss??0)>=0 ? 'var(--green)' : 'var(--red)' }}>
                          {Number(inv.profit_loss??0)>=0?'+':''}{fmt(inv.profit_loss)}
                        </div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', marginTop:2 }}>
                          {inv.status==='active' ? `${daysLeft}d left` : 'Completed'}
                        </div>
                      </div>
                    </div>
                    <ProgressBar pct={pct} />
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', marginTop:4 }}>{pct}% complete</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}