// client/src/pages/Dashboard.tsx
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatsCards from '@/components/StatsCards';
import OverviewPage from '@/dashboard/OverviewPage';
import PortfolioPage from '@/dashboard/PortfolioPage';
import InvestPage from '@/dashboard/InvestPage';
import TradesPage from '@/dashboard/TradesPage';
import MentorshipPage from '@/dashboard/MentorshipPage';
import DepositModal from '@/components/DepositModal';
import WithdrawalModal from '@/components/WithdrawalModal';
import LearningPage from '@/pages/Learning/index';
import LoanPage from '@/dashboard/LoanPage';
import { apiRequest } from '@/api/http';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownCircle, ArrowUpRight, TrendingUp, Copy, Check, Users, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Tab = 'overview' | 'portfolio' | 'invest' | 'trades' | 'mentorship' | 'learning' | 'loan';

function fmt(v: any): string {
  const n = Number(v ?? 0);
  return isNaN(n) ? '0.00' : n.toFixed(2);
}

function ActionBtn({ icon, label, onClick, variant = 'default' }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  variant?: 'deposit' | 'withdraw' | 'trades' | 'stake' | 'default';
}) {
  const variants = {
    deposit:  { bg: 'rgba(10,239,255,0.08)',  border: 'rgba(10,239,255,0.35)',  color: 'var(--cyan)',   hoverBg: 'rgba(10,239,255,0.15)' },
    withdraw: { bg: 'rgba(14,203,129,0.08)',  border: 'rgba(14,203,129,0.35)',  color: 'var(--green)',  hoverBg: 'rgba(14,203,129,0.15)' },
    trades:   { bg: 'rgba(246,170,70,0.08)',  border: 'rgba(246,170,70,0.35)',  color: '#F6AA46',       hoverBg: 'rgba(246,170,70,0.15)' },
    stake:    { bg: 'rgba(126,34,206,0.10)',  border: 'rgba(126,34,206,0.40)',  color: 'var(--purple)', hoverBg: 'rgba(126,34,206,0.18)' },
    default:  { bg: 'var(--surface)',         border: 'rgba(10,239,255,0.10)',  color: 'var(--s7-muted)',  hoverBg: 'rgba(10,239,255,0.04)' },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:6, padding:'14px 8px',
      background: v.bg,
      border: `1px solid ${v.border}`,
      cursor:'pointer', transition:'all 0.2s ease', color: v.color, width:'100%',
    }}
    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = v.hoverBg; el.style.transform='translateY(-1px)'; }}
    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = v.bg; el.style.transform='translateY(0)'; }}>
      <span style={{ display:'flex' }}>{icon}</span>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.10em', textTransform:'uppercase' }}>{label}</span>
    </button>
  );
}

function ProfileModal({ onClose, user, totals, referralCount }: { onClose:()=>void; user:any; totals:any; referralCount:number }) {
  const isMobile = useMobile();
  const [tab, setTab] = useState<'profile'|'referrals'>('profile');
  const [copied, setCopied] = useState(false);
  const referralLink = user?.referral_code
    ? `${window.location.origin}/register?ref=${user.referral_code}`
    : `${window.location.origin}/register`;

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(11,17,32,0.88)', padding: isMobile ? 12 : 24 }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.14)', width:'100%', maxWidth:580, maxHeight:'90vh', overflowY:'auto', position:'relative' }}
        initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:20, opacity:0 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
      >
        <div style={{ padding: isMobile ? '16px 18px' : '20px 28px', borderBottom:'1px solid rgba(10,239,255,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--text)' }}>Account</span>
          <button onClick={onClose} style={{ background:'none', border:'1px solid rgba(240,237,230,0.12)', color:'var(--s7-muted)', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:16, transition:'all 0.2s' }}>×</button>
        </div>

        <div style={{ display:'flex', borderBottom:'1px solid rgba(10,239,255,0.08)' }}>
          {(['profile','referrals'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'12px 0', background:'none', border:'none',
              borderBottom:`2px solid ${tab===t?'var(--cyan)':'transparent'}`,
              cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:10,
              letterSpacing:'0.12em', textTransform:'uppercase',
              color: tab===t ? 'var(--cyan)' : 'var(--muted-2)', transition:'all 0.2s',
            }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: isMobile ? '20px 18px' : '28px' }}>
          {tab === 'profile' ? (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ width:48, height:48, background:'linear-gradient(135deg, var(--cyan), var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--bg)' }}>{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                </div>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)' }}>{user?.username || 'Member'}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--muted-2)', marginTop:4 }}>{user?.email || '—'}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(10,239,255,0.08)' }}>
                {[
                  { label:'Main Balance',    value:`$${fmt(totals.main_balance)}`    },
                  { label:'Bonus Balance',   value:`$${fmt(totals.bonus_balance)}`   },
                  { label:'Portfolio Value', value:`$${fmt(totals.portfolio_value)}` },
                  { label:'Member Since',    value: user?.created_at ? format(new Date(user.created_at),'MMM yyyy') : '—' },
                ].map((item, i) => (
                  <div key={i} style={{ background:'var(--surface)', padding:'14px 16px' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(10,239,255,0.08)' }}>
                {[
                  { label:'Referred', value: referralCount.toString() },
                  { label:'Bonus',    value:`$${fmt(totals.bonus_balance)}` },
                  { label:'Rate',     value:'10%' },
                ].map((item, i) => (
                  <div key={i} style={{ background:'var(--surface)', padding:'14px 12px', textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.10em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:6 }}>{item.label}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--cyan)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:8 }}>Your Code</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:28, letterSpacing:'0.15em', color:'var(--cyan)', marginBottom:16 }}>{user?.referral_code || '——'}</div>
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:8 }}>Referral Link</div>
                <div style={{ display:'flex', gap:8 }}>
                  <input readOnly value={referralLink} style={{ flex:1, background:'var(--surface-2)', border:'1px solid rgba(10,239,255,0.12)', padding:'10px 12px', color:'var(--s7-muted)', fontFamily:'var(--font-mono)', fontSize:9, outline:'none', minWidth:0 }}/>
                  <button onClick={copyLink} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 14px', background: copied ? 'rgba(14,203,129,0.10)' : 'rgba(10,239,255,0.08)', border:`1px solid ${copied ? 'rgba(14,203,129,0.3)' : 'rgba(10,239,255,0.25)'}`, color: copied ? 'var(--green)' : 'var(--cyan)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', flexShrink:0, transition:'all 0.2s' }}>
                    {copied ? <Check size={13}/> : <Copy size={13}/>}
                  </button>
                </div>
              </div>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.08em', color:'var(--muted-2)', lineHeight:1.7, textTransform:'uppercase' }}>
                Earn 10% bonus on friends' first deposit.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user, token } = useAuth();
  const isMobile = useMobile();

  const [collapsed,    setCollapsed]    = useState(true);
  const [active,       setActive]       = useState<Tab>('overview');
  const [depositOpen,  setDepositOpen]  = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [referralCount,setReferralCount]= useState(0);

  const [totals, setTotals] = useState({
    main_balance: Number(user?.balance ?? 0), bonus_balance: Number(user?.bonus_balance ?? 0),
    total_invested:0, total_profit:0, portfolio_value:0, active_investments:0,
  });


  useEffect(() => {
    const fn = (e: Event) => {
      const tab = (e as CustomEvent).detail as Tab;
      if (tab) { setActive(tab); setCollapsed(true); }
    };
    window.addEventListener('navigate-tab', fn);
    return () => window.removeEventListener('navigate-tab', fn);
  }, []);
  
  useEffect(() => {
    if (!token) return;
    apiRequest('/auth/me', { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => { if (!r.success) window.location.href = '/login'; })
      .catch(() => window.location.href = '/login');
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const ctrl = new AbortController();
    try {
      const [meRes, overviewRes, refRes] = await Promise.all([
        apiRequest('/auth/me',        { headers:{ Authorization:`Bearer ${token}` }, signal:ctrl.signal }),
        apiRequest('/user/overview',  { headers:{ Authorization:`Bearer ${token}` }, signal:ctrl.signal }),
        apiRequest('/user/referrals', { headers:{ Authorization:`Bearer ${token}` }, signal:ctrl.signal }),
      ]);
      if (meRes.success) {
        const u = meRes.user;
        setTotals(p => ({ ...p, main_balance: Number(u.balance ?? 0), bonus_balance: Number(u.bonusBalance ?? 0) }));
      }
      if (overviewRes.success) {
        const t = overviewRes.totals;
        setTotals(p => ({ ...p,
          total_invested:  Number(t.total_invested ?? 0),
          total_profit:    Number(t.total_profit ?? 0),
          portfolio_value: Number(t.portfolio_value ?? 0),
          active_investments: Number(t.active_investments ?? 0),
        }));
      }
      if (refRes.success) setReferralCount(refRes.count ?? 0);
    } catch {}
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get('tab') as Tab | null;
    if (t) setActive(t);
  }, []);

  // On mobile, sidebar is always collapsed unless toggled — close on nav
  function handleNavigate(key: string) {
    if (key === 'toggle') { setCollapsed(c => !c); return; }
    if (key === 'profile') { setShowProfile(true); return; }
    setActive(key as Tab);
    setCollapsed(true); // always close sidebar on mobile after nav
  }

  const totalAvailable = totals.main_balance + totals.bonus_balance + totals.total_invested + totals.total_profit;
  const performance = totals.total_invested > 0
    ? `${totals.total_profit >= 0 ? '+' : ''}${((totals.total_profit / totals.total_invested) * 100).toFixed(1)}%`
    : '0%';

  // On mobile: sidebar is always 0 width (slides over content as overlay)
  // On desktop: sidebar pushes content
  const SIDEBARW = isMobile ? 0 : (collapsed ? 64 : 240);

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>

      <Sidebar collapsed={collapsed} active={active} onNavigate={handleNavigate} isMobile={isMobile} />

      {/* Main content */}
      <div style={{
        marginLeft: SIDEBARW,
        flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
        transition:'margin-left 0.25s ease',
        minWidth:0, // prevent flex blowout
      }}>

        <Topbar active={active} onCollapse={() => setCollapsed(c => !c)} onProfileClick={() => setShowProfile(true)} />

        <main style={{ flex:1, overflowY:'auto', background:'var(--bg)' }}>

          {active === 'overview' && !loading && (
            <div style={{ padding:'0 0 1px 0' }}>
              <StatsCards
                balance={totals.main_balance}
                bonus={totals.bonus_balance}
                totalAvailable={totalAvailable}
                performance={performance}
                username={user?.username}
              />
              {/* Quick actions — 2 cols on mobile, 4 on desktop */}
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:1, marginBottom:1 }}>
                <ActionBtn icon={<ArrowDownCircle size={18}/>} label="Deposit"     onClick={() => setDepositOpen(true)}         variant="deposit"  />
                <ActionBtn icon={<ArrowUpRight    size={18}/>} label="Withdraw"    onClick={() => setWithdrawOpen(true)}         variant="withdraw" />
                <ActionBtn icon={<TrendingUp      size={18}/>} label="View Trades" onClick={() => handleNavigate('trades')}      variant="trades"   />
                <ActionBtn icon={<TrendingUp      size={18}/>} label="Stake Now"   onClick={() => handleNavigate('invest')}      variant="stake"    />
              </div>
            </div>
          )}

          {/* Tab content — tighter padding on mobile */}
          <div style={{ padding: isMobile ? '16px 12px' : '24px' }}>
            {loading && active === 'overview' ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:200, fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
                Loading…
              </div>
            ) : (
              <>
                {active === 'overview'   && <OverviewPage />}
                {active === 'portfolio'  && <PortfolioPage />}
                {active === 'invest'     && <InvestPage />}
                {active === 'trades'     && <TradesPage />}
                {active === 'mentorship' && <MentorshipPage />}
                {active === 'learning'   && <LearningPage />}
                {active === 'loan'       && <LoanPage />}
              </>
            )}
          </div>
        </main>
      </div>

      <DepositModal    isOpen={depositOpen}  onClose={() => setDepositOpen(false)}  />
      <WithdrawalModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />

      <AnimatePresence>
        {showProfile && (
          <ProfileModal onClose={() => setShowProfile(false)} user={user} totals={totals} referralCount={referralCount} />
        )}
      </AnimatePresence>
    </div>
  );
}
