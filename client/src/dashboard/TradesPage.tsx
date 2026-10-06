// client/src/dashboard/TradesPage.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '@/api/http';
import { useAuth } from '@/auth/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { LiveCandleTeaser } from './LiveCandleTeaser';

const fmt = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.00' : n.toFixed(2); };

function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', display:'block', marginBottom:6 }}>{children}</span>;
}

export default function TradesPage() {
  const { token } = useAuth();
  const [active,  setActive]  = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTrades() {
    if (!token) return;
    const r = await fetch(`${API_BASE}/trades`, { headers:{ Authorization:`Bearer ${token}` } });
    const d = await r.json();
    if (d?.success) {
      setActive(Array.isArray(d.active) ? d.active : d.active ? [d.active] : []);
      setHistory(d.history || []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchTrades(); const t = setInterval(fetchTrades, 8000); return () => clearInterval(t); }, [token]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Loading signals…</div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>

      {/* Header strip */}
      <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)' }}>Signal Centre</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)', marginTop:4 }}>
            Live market signals from the 77Kapital trading desk
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background: active.length > 0 ? 'var(--green)' : 'var(--muted-2)', display:'inline-block' }}/>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color: active.length > 0 ? 'var(--green)' : 'var(--muted-2)' }}>
            {active.length > 0 ? `${active.length} Live` : 'No Active Signal'}
          </span>
        </div>
      </div>

      {/* Active signals */}
      <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'20px' }}>
        <Label>Current Signals</Label>
        <AnimatePresence>
          {active.length === 0 ? (
            <div style={{ padding:'48px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
              No active signal — next high-conviction call incoming
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:1, background:'rgba(10,239,255,0.08)' }}>
              {active.map(trade => {
                const isLong = trade.direction === 'LONG' || trade.side?.toLowerCase() === 'buy';
                return (
                  <motion.div key={trade.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                    style={{ background:'var(--surface)', padding:'20px', position:'relative' }}>
                    {/* Live badge */}
                    <div style={{ position:'absolute', top:16, right:16, display:'flex', alignItems:'center', gap:6 }}>
                      <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.5, repeat:Infinity }}
                        style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block' }}/>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--green)' }}>Live</span>
                    </div>

                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:300, color:'var(--text)', marginBottom:4 }}>
                        {trade.pair || trade.symbol || '—'}
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.06em',
                        color: isLong ? 'var(--green)' : 'var(--red)' }}>
                        {(trade.direction || trade.side || '—').toUpperCase()}
                      </div>
                    </div>

                    {/* Chart */}
                    <div style={{ height:80, marginBottom:14, background:'rgba(10,239,255,0.03)', border:'1px solid rgba(10,239,255,0.08)', overflow:'hidden', position:'relative', contain:'paint' }}>
                      <LiveCandleTeaser pair={trade.pair} />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(10,239,255,0.08)' }}>
                      {[
                        { label:'Entry Price', value:`$${fmt(trade.entry_price??trade.price??0)}` },
                        { label:'Opened',      value: trade.created_at ? formatDistanceToNow(new Date(trade.created_at),{addSuffix:true}) : '—' },
                      ].map((item,i) => (
                        <div key={i} style={{ background:'var(--surface)', padding:'10px 12px' }}>
                          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:3 }}>{item.label}</div>
                          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text)' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {trade.entry_notes && (
                      <p style={{ marginTop:12, fontFamily:'var(--font-sans)', fontSize:11, color:'var(--s7-muted)', lineHeight:1.6 }}>{trade.entry_notes}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* History */}
      <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'20px' }}>
        <Label>Signal History</Label>
        {history.length === 0 ? (
          <div style={{ padding:'48px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
            No closed signals yet
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column' }}>
            {history.map((t, i) => {
              const pnl    = Number(t.pnl_percent ?? 0);
              const isWin  = pnl > 0;
              return (
                <div key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom: i < history.length-1 ? '1px solid rgba(10,239,255,0.06)' : 'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ width:8, height:8, borderRadius:0, background: isWin ? 'var(--green)' : 'var(--red)', flexShrink:0, display:'inline-block' }}/>
                    <div>
                      <div style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--text)' }}>{t.pair || '—'}</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', marginTop:2 }}>
                        {t.resolved_at ? format(new Date(t.resolved_at),'MMM d, yyyy') : '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:14, fontWeight:500, color: isWin ? 'var(--green)' : 'var(--red)' }}>
                      {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}%
                    </div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color: isWin ? 'var(--green)' : 'var(--red)', marginTop:2 }}>
                      {isWin ? 'Win' : 'Loss'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}