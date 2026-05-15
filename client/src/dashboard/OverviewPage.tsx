// client/src/dashboard/OverviewPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/auth/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { format } from 'date-fns';
import { Trophy, Calendar, ArrowRight, CreditCard, BookOpen, TrendingUp, Shield, Zap } from 'lucide-react';

const fmt = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.00' : n.toFixed(2); };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(10,239,255,0.08)', marginBottom: 14 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
        {children}
      </span>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', ...style }}>
      {children}
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 3, background: 'rgba(10,239,255,0.08)', overflow: 'hidden' }}>
      <motion.div style={{ height: '100%', background: 'var(--cyan)' }}
        initial={{ width: 0 }} animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}

/* ── Programme card — cinematic marketing tile ── */
function ProgramCard({ item, showMarketing, onClick }: { item: any; showMarketing: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isEvent = item.type === 'event';

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', cursor: 'pointer', overflow: 'hidden',
        background: hovered ? 'rgba(10,239,255,0.04)' : 'var(--surface-2)',
        border: `1px solid ${hovered ? 'rgba(10,239,255,0.25)' : 'rgba(10,239,255,0.07)'}`,
        transition: 'all 0.25s ease',
        padding: '18px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>

      {/* Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: isEvent ? 'var(--gold)' : 'var(--cyan)', background: isEvent ? 'rgba(242,178,58,0.08)' : 'rgba(10,239,255,0.06)', border: `1px solid ${isEvent ? 'rgba(242,178,58,0.2)' : 'rgba(10,239,255,0.14)'}`, padding: '2px 8px' }}>
          {isEvent ? 'Live Event' : showMarketing ? 'Programme' : 'Enrolled'}
        </span>
        {isEvent ? <Calendar size={13} style={{ color: 'var(--gold)' }} /> : <BookOpen size={13} style={{ color: 'var(--cyan)' }} />}
      </div>

      {/* Title */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 300, color: 'var(--text)', lineHeight: 1.3 }}>
        {item.title}
      </div>

      {/* Description or progress */}
      {!isEvent && showMarketing && item.description && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </p>
      )}

      {!isEvent && !showMarketing && (
        <>
          <ProgressBar pct={item.progress ?? 0} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted-2)' }}>{item.progress ?? 0}% complete</span>
        </>
      )}

      {/* Price / CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        {showMarketing && !isEvent ? (
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cyan)' }}>
            ${item.price}
          </span>
        ) : isEvent ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)' }}>{item.price}</span>
        ) : (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Continue →</span>
        )}
        <motion.div animate={{ x: hovered ? 4 : 0 }} transition={{ duration: 0.2 }}>
          <ArrowRight size={14} style={{ color: 'var(--cyan)' }} />
        </motion.div>
      </div>

      {/* Hover glow line */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--cyan), var(--purple))', transformOrigin: 'left' }}
      />
    </div>
  );
}

export default function OverviewPage() {
  const { token } = useAuth();
  const isMobile  = useMobile();
  const [overview,     setOverview]     = useState<any>(null);
  const [programs,     setPrograms]     = useState<any[]>([]);
  const [trades,       setTrades]       = useState<{ active: any | null; history: any[] }>({ active: null, history: [] });
  const [events,       setEvents]       = useState<any[]>([]);
  const [loanSettings, setLendSettings] = useState<any>(null);
  const [portfolio,    setPortfolio]    = useState<any>(null);
  const [loading,      setLoading]      = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  const navigate = (tab: string) => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: tab }));
  };

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [ov, pg, tr, ev, ls, pf] = await Promise.all([
        fetch('/api/user/overview',    { headers }).then(r => r.json()),
        fetch('/api/learning/programs',{ headers }).then(r => r.json()),
        fetch('/api/trades',           { headers }).then(r => r.json()),
        fetch('/api/mentorship/events',{ headers }).then(r => r.json()),
        fetch('/api/loans/settings',   { headers }).then(r => r.json()),
        fetch('/api/portfolio',        { headers }).then(r => r.json()),
      ]);
      if (ov?.success)  setOverview(ov);
      if (pg?.success)  setPrograms(pg.programs || []);
      if (tr?.success)  setTrades({ active: Array.isArray(tr.active) ? tr.active[0] ?? null : tr.active, history: tr.history || [] });
      if (ev?.success)  setEvents((ev.events || []).map((e: any) => ({ ...e, id: `ev-${e.id}`, type: 'event', price: e.price === '0.00' ? 'FREE' : `$${e.price}` })));
      if (ls?.success)  setLendSettings(ls.settings);
      if (pf?.success)  setPortfolio(pf.portfolio);
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  // Listen for navigate-tab events from sub-components
  useEffect(() => {
    const fn = (e: Event) => {
      const tab = (e as CustomEvent).detail;
      window.dispatchEvent(new CustomEvent('dashboard-navigate', { detail: tab }));
    };
    window.addEventListener('navigate-tab', fn);
    return () => window.removeEventListener('navigate-tab', fn);
  }, []);

  if (loading || !overview) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading overview…
    </div>
  );

  const totals    = overview.totals || {};
  const recentTx  = overview.recent_transactions || [];
  const recentInv = overview.recent_investments  || [];

  const enrolled = (overview.enrolled_programs || []).map((p: any) => ({ ...p, type: 'program', price: fmt(p.price) }));
  const showMarketing = enrolled.length === 0 && programs.length > 0;
  const programItems  = showMarketing
    ? programs.map((p: any) => ({ ...p, type: 'program', price: fmt(p.price) }))
    : enrolled;
  const allItems = [...programItems, ...events];

  const totalInvested   = Number(totals.total_invested ?? 0);
  const hasPortfolio    = portfolio && portfolio.amount;
  const minInvestment   = Number(loanSettings?.min_investment ?? 5000);
  const maxLendPct      = Number(loanSettings?.max_loan_pct ?? 50);
  const intRate         = Number(loanSettings?.interest_rate ?? 15);
  const portfolioAmount = Number(portfolio?.amount ?? 0);
  const loanEligible    = totalInvested >= minInvestment || !!hasPortfolio;
  const maxLend         = hasPortfolio
    ? (portfolioAmount * maxLendPct) / 100
    : (totalInvested * maxLendPct) / 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

      {/* ── Key metrics ── */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)' }}>
          {[
            { label: 'Active Stakes', value: String(totals.active_investments ?? 0), accent: true },
            { label: 'Total Staked',  value: `$${fmt(totals.total_invested)}` },
            { label: 'Total Profit',  value: `$${fmt(totals.total_profit)}`, accent: true },
          ].map((item, i) => (
            <div key={i} style={{ padding: isMobile ? '14px 16px' : '18px 20px', borderBottom: isMobile && i < 2 ? '1px solid rgba(10,239,255,0.07)' : 'none', borderRight: !isMobile && i < 2 ? '1px solid rgba(10,239,255,0.07)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px,1.8vw,22px)', fontWeight: 300, color: item.accent ? 'var(--cyan)' : 'var(--text)', lineHeight: 1 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Active Trade ── */}
      {trades.active && (
        <Card>
          <div style={{ padding: isMobile ? '16px' : '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)' }}>
                Live Signal — Trading Desk Active
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,2.5vw,32px)', fontWeight: 300, color: 'var(--text)' }}>
                {trades.active.pair || trades.active.symbol || '—'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: (trades.active.direction === 'LONG' || trades.active.side?.toLowerCase() === 'buy') ? 'var(--green)' : 'var(--red)' }}>
                {(trades.active.direction || trades.active.side || '—').toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', gap: isMobile ? 16 : 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 3 }}>Entry</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)' }}>${fmt(trades.active.entry_price ?? 0)}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 3 }}>Opened</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)' }}>
                  {trades.active.created_at ? format(new Date(trades.active.created_at), 'MMM d, HH:mm') : '—'}
                </div>
              </div>
              <div style={{ padding: '8px 14px', background: 'rgba(14,203,129,0.06)', border: '1px solid rgba(14,203,129,0.15)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 4 }}>Status</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 300, color: 'var(--green)' }}>Active</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Recent trade results ── */}
      {trades.history.length > 0 && (
        <Card>
          <div style={{ padding: isMobile ? '14px 16px' : '20px' }}>
            <SectionLabel>Recent Trade Results</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill,minmax(180px,1fr))', gap: 1, background: 'rgba(10,239,255,0.08)' }}>
              {trades.history.slice(0, isMobile ? 4 : 5).map((t: any) => {
                const pnl   = Number(t.pnl_percent ?? 0);
                const isWin = pnl > 0;
                return (
                  <div key={t.id} style={{ background: 'var(--surface)', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text)' }}>{t.pair || '—'}</span>
                      <span style={{ width: 6, height: 6, background: isWin ? 'var(--green)' : 'var(--red)', display: 'inline-block' }} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: isWin ? 'var(--green)' : 'var(--red)' }}>
                      {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}%
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', marginTop: 6 }}>
                      {(t.side || t.direction || '').toUpperCase()}
                      {t.resolved_at && ` · ${format(new Date(t.resolved_at), 'MMM d')}`}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: isWin ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
                      {isWin ? 'WIN' : 'LOSS'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* ── Programmes — cinematic marketing ── */}
      {allItems.length > 0 && (
        <Card>
          <div style={{ padding: isMobile ? '14px 16px' : '20px' }}>
            {/* Header with CTA */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 4 }}>
                  {showMarketing ? '— Exclusive Programmes' : '— My Learning'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 18 : 22, fontWeight: 300, color: 'var(--text)' }}>
                  {showMarketing ? 'Elevate Your Trading' : 'Continue Learning'}
                </div>
                {showMarketing && (
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginTop: 6, maxWidth: 420 }}>
                    Expert-led programmes in trading strategy, risk management, and market analysis — designed for serious investors.
                  </p>
                )}
              </div>
              <button onClick={() => navigate('learning')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(10,239,255,0.06)', border: '1px solid rgba(10,239,255,0.2)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 14px', cursor: 'pointer', flexShrink: 0 }}>
                View All <ArrowRight size={11} />
              </button>
            </div>

            {/* Programme cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(220px,1fr))', gap: 1, background: 'rgba(10,239,255,0.06)' }}>
              {allItems.slice(0, isMobile ? 3 : 4).map((item, idx) => (
                <ProgramCard key={`${item.id}-${idx}`} item={item} showMarketing={showMarketing}
                  onClick={() => navigate(item.type === 'event' ? 'mentorship' : 'learning')} />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Activity + Stakes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 1 }}>

        <Card>
          <div style={{ padding: isMobile ? '14px 16px' : '20px' }}>
            <SectionLabel>Recent Activity</SectionLabel>
            {recentTx.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>No transactions yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentTx.slice(0, 6).map((t: any) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(10,239,255,0.05)' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text)', textTransform: 'capitalize' }}>
                        {t.type === 'referral_bonus' ? 'Referral Bonus' : t.type}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', marginTop: 1 }}>
                        {t.created_at ? format(new Date(t.created_at), 'MMM d') : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: Number(t.amount) > 0 ? 'var(--green)' : 'var(--red)' }}>
                        {Number(t.amount) > 0 ? '+' : ''}{fmt(Math.abs(Number(t.amount)))}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.status === 'completed' ? 'var(--green)' : t.status === 'rejected' ? 'var(--red)' : 'var(--muted-2)', marginTop: 1 }}>
                        {t.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div style={{ padding: isMobile ? '14px 16px' : '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <SectionLabel>Active Stakes</SectionLabel>
              {recentInv.length > 0 && (
                <button onClick={() => navigate('invest')}
                  style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Manage <ArrowRight size={10} />
                </button>
              )}
            </div>
            {recentInv.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 12 }}>No active stakes</div>
                <button onClick={() => navigate('invest')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(10,239,255,0.06)', border: '1px solid rgba(10,239,255,0.2)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  <TrendingUp size={12} /> Start Staking
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentInv.slice(0, 4).map((inv: any) => {
                  const now   = Date.now();
                  const start = inv.start_at ? new Date(inv.start_at).getTime() : new Date(inv.created_at).getTime();
                  const end   = start + Number(inv.duration_days ?? 30) * 86400000;
                  const pct   = Math.min(100, Math.round(Math.max(0, (now - start)) / (Math.max(1, end - start)) * 100));
                  return (
                    <div key={inv.id} style={{ paddingBottom: 10, borderBottom: '1px solid rgba(10,239,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text)' }}>{inv.plan_name || 'Plan'}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', marginTop: 1 }}>${fmt(inv.amount)}</div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: Number(inv.profit_loss ?? 0) >= 0 ? 'var(--green)' : 'var(--red)', textAlign: 'right' }}>
                          {Number(inv.profit_loss ?? 0) >= 0 ? '+' : ''}{fmt(inv.profit_loss)}
                        </div>
                      </div>
                      <ProgressBar pct={pct} />
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted-2)', marginTop: 3 }}>{pct}% complete</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Capital Lend — high-conversion marketing block ── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.12)' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(10,239,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(126,34,206,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', padding: isMobile ? '20px 16px' : '28px 32px' }}>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cyan)', background: 'rgba(10,239,255,0.06)', border: '1px solid rgba(10,239,255,0.15)', padding: '3px 10px' }}>
              Capital Programme
            </span>
            {loanEligible && (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: isMobile ? 20 : 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 22 : 28, fontWeight: 300, color: 'var(--text)', lineHeight: 1.1, marginBottom: 10 }}>
                {loanEligible
                  ? <>You qualify for up to <em style={{ color: 'var(--cyan)' }}>${fmt(maxLend)}</em></>
                  : <>Unlock <em style={{ color: 'var(--cyan)' }}>Capital Access</em></>
                }
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: isMobile ? 12 : 13, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.7, margin: 0, maxWidth: 480 }}>
                {loanEligible
                  ? `Borrow up to ${maxLendPct}% of your qualifying capital at ${intRate}% annual interest — approved within 48 hours and credited directly to your main balance.`
                  : `Stake $${minInvestment.toLocaleString()}+ or enrol in portfolio management to access our exclusive member loan facility. Borrow capital at ${intRate}% annual interest to amplify your investing.`
                }
              </p>

              {/* Trust signals */}
              <div style={{ display: 'flex', gap: isMobile ? 12 : 24, marginTop: 14, flexWrap: 'wrap' }}>
                {[
                  { icon: <Zap size={11} />, label: '48hr approval' },
                  { icon: <Shield size={11} />, label: 'Members only' },
                  { icon: <CreditCard size={11} />, label: `${intRate}% p.a.` },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: 'var(--cyan)' }}>{item.icon}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: isMobile ? 'stretch' : 'flex-end' }}>
              <button onClick={() => navigate('loan')}
                className="btn-primary"
                style={{ justifyContent: 'center', padding: '14px 28px', fontSize: 11, whiteSpace: 'nowrap' }}>
                {loanEligible ? 'Apply Now' : 'Learn More'}
              </button>
              {loanEligible && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', textAlign: isMobile ? 'left' : 'right' }}>
                  Max loan: ${fmt(maxLend)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}