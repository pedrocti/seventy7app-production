// client/src/pages/Dashboard.tsx
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/auth/AuthContext';
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
import LearningPage from '@/pages/Learning';
import { apiRequest } from '@/api/http';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownCircle, ArrowUpRight, TrendingUp, Copy, Check, Users, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import LoanPage from '@/dashboard/LoanPage';

type Tab = 'overview' | 'portfolio' | 'invest' | 'trades' | 'mentorship' | 'learning';

function fmt(v: any): string {
  const n = Number(v ?? 0);
  return isNaN(n) ? '0.00' : n.toFixed(2);
}

/* ── Quick action button ── */
function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:8, padding:'20px 12px',
      background:'var(--surface)',
      border:'1px solid rgba(10,239,255,0.10)',
      cursor:'pointer', transition:'all 0.2s ease',
      color:'var(--muted)',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = 'rgba(10,239,255,0.30)';
      el.style.background  = 'rgba(10,239,255,0.04)';
      el.style.color       = 'var(--cyan)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = 'rgba(10,239,255,0.10)';
      el.style.background  = 'var(--surface)';
      el.style.color       = 'var(--muted)';
    }}>
      <span style={{ display:'flex' }}>{icon}</span>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase' }}>
        {label}
      </span>
    </button>
  );
}

/* ── Profile / Referral modal ── */
function ProfileModal({
  onClose, user, totals, referralCount,
}: {
  onClose: () => void;
  user: any;
  totals: any;
  referralCount: number;
}) {
  const [tab,    setTab]    = useState<'profile'|'referrals'>('profile');
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
      style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(11,17,32,0.88)', padding:24 }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.14)', width:'100%', maxWidth:580, maxHeight:'85vh', overflowY:'auto', position:'relative' }}
        initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:20, opacity:0 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
      >
        {/* Modal header */}
        <div style={{ padding:'20px 28px', borderBottom:'1px solid rgba(10,239,255,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--text)' }}>Account</span>
          <button onClick={onClose} style={{ background:'none', border:'1px solid rgba(240,237,230,0.12)', color:'var(--muted)', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:16, transition:'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(10,239,255,0.4)'; (e.currentTarget as HTMLElement).style.color='var(--cyan)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(240,237,230,0.12)'; (e.currentTarget as HTMLElement).style.color='var(--muted)'; }}>
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(10,239,255,0.08)' }}>
          {(['profile','referrals'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'12px 0', background:'none',
              border:'none', borderBottom:`2px solid ${tab===t?'var(--cyan)':'transparent'}`,
              cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:10,
              letterSpacing:'0.12em', textTransform:'uppercase',
              color: tab===t ? 'var(--cyan)' : 'var(--muted-2)',
              transition:'all 0.2s',
            }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding:'28px' }}>
          {tab === 'profile' ? (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {/* Avatar + name */}
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <div style={{ width:56, height:56, background:'linear-gradient(135deg, var(--cyan), var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:300, color:'var(--bg)' }}>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--text)' }}>{user?.username || 'Member'}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--muted-2)', marginTop:4 }}>{user?.email || '—'}</div>
                </div>
              </div>

              {/* Balance grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(10,239,255,0.08)' }}>
                {[
                  { label:'Main Balance',    value:`$${fmt(totals.main_balance)}`    },
                  { label:'Bonus Balance',   value:`$${fmt(totals.bonus_balance)}`   },
                  { label:'Portfolio Value', value:`$${fmt(totals.portfolio_value)}` },
                  { label:'Member Since',    value: user?.created_at ? format(new Date(user.created_at),'MMM yyyy') : '—' },
                ].map((item, i) => (
                  <div key={i} style={{ background:'var(--surface)', padding:'18px 20px' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:6 }}>{item.label}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--text)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
              {/* Referral stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(10,239,255,0.08)' }}>
                {[
                  { label:'Referred Users',  value: referralCount.toString() },
                  { label:'Bonus Earned',    value:`$${fmt(totals.bonus_balance)}` },
                  { label:'Reward Rate',     value:'10%' },
                ].map((item, i) => (
                  <div key={i} style={{ background:'var(--surface)', padding:'18px 16px', textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:6 }}>{item.label}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:300, color:'var(--cyan)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Referral code */}
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:12 }}>Your Referral Code</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:32, letterSpacing:'0.15em', color:'var(--cyan)', marginBottom:20 }}>
                  {user?.referral_code || '——————'}
                </div>
              </div>

              {/* Copy link */}
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:10 }}>Referral Link</div>
                <div style={{ display:'flex', gap:8 }}>
                  <input readOnly value={referralLink}
                    style={{ flex:1, background:'var(--surface-2)', border:'1px solid rgba(10,239,255,0.12)', padding:'10px 14px', color:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:10, outline:'none', minWidth:0 }}/>
                  <button onClick={copyLink}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px', background: copied ? 'rgba(14,203,129,0.10)' : 'rgba(10,239,255,0.08)', border:`1px solid ${copied ? 'rgba(14,203,129,0.3)' : 'rgba(10,239,255,0.25)'}`, color: copied ? 'var(--green)' : 'var(--cyan)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', flexShrink:0, transition:'all 0.2s' }}>
                    {copied ? <Check size={13}/> : <Copy size={13}/>} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <p style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.08em', color:'var(--muted-2)', lineHeight:1.7, textTransform:'uppercase' }}>
                Earn 10% bonus on your friends' first deposit. Share your unique link or code.
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

  const [collapsed,     setCollapsed]     = useState(true);
  const [active,        setActive]        = useState<Tab>('overview');
  const [depositOpen,   setDepositOpen]   = useState(false);
  const [withdrawOpen,  setWithdrawOpen]  = useState(false);
  const [showProfile,   setShowProfile]   = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [referralCount, setReferralCount] = useState(0);

  const [totals, setTotals] = useState({
    main_balance:       Number(user?.balance ?? 0),
    bonus_balance:      Number(user?.bonus_balance ?? 0),
    total_invested:     0,
    total_profit:       0,
    portfolio_value:    0,
    active_investments: 0,
  });

  /* ── Deep security: validate token on mount ── */
  useEffect(() => {
    if (!token) return;
    apiRequest('/auth/me', { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => { if (!r.success) window.location.href = '/login'; })
      .catch(() => window.location.href = '/login');
  }, [token]);

  /* ── Load data ── */
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const ctrl = new AbortController();
    try {
      const [meRes, overviewRes, refRes] = await Promise.all([
        apiRequest('/auth/me',       { headers:{ Authorization:`Bearer ${token}` }, signal:ctrl.signal }),
        apiRequest('/user/overview', { headers:{ Authorization:`Bearer ${token}` }, signal:ctrl.signal }),
        apiRequest('/user/referrals',{ headers:{ Authorization:`Bearer ${token}` }, signal:ctrl.signal }),
      ]);
      if (meRes.success) {
        const u = meRes.user;
        setTotals(p => ({ ...p, main_balance: Number(u.balance ?? 0), bonus_balance: Number(u.bonusBalance ?? 0) }));
      }
      if (overviewRes.success) {
        const t = overviewRes.totals;
        setTotals(p => ({ ...p,
          total_invested:     Number(t.total_invested ?? 0),
          total_profit:       Number(t.total_profit ?? 0),
          portfolio_value:    Number(t.portfolio_value ?? 0),
          active_investments: Number(t.active_investments ?? 0),
        }));
      }
      if (refRes.success) setReferralCount(refRes.count ?? 0);
    } catch {}
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Handle URL tab params ── */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get('tab') as Tab | null;
    if (t) setActive(t);
  }, []);

  function handleNavigate(key: string) {
    if (key === 'toggle') { setCollapsed(c => !c); return; }
    if (key === 'profile') { setShowProfile(true); return; }
    setActive(key as Tab);
    setCollapsed(true);
  }

  const totalAvailable = totals.main_balance + totals.bonus_balance + totals.total_invested + totals.total_profit;
  const performance = totals.total_invested > 0
    ? `${totals.total_profit >= 0 ? '+' : ''}${((totals.total_profit / totals.total_invested) * 100).toFixed(1)}%`
    : '0%';

  const SIDEBARW = collapsed ? 64 : 240;

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>

      <Sidebar collapsed={collapsed} active={active} onNavigate={handleNavigate} />

      {/* Main content — offset by sidebar width */}
      <div style={{ marginLeft:SIDEBARW, flex:1, display:'flex', flexDirection:'column', overflow:'hidden', transition:'margin-left 0.25s ease' }}>

        <Topbar active={active} onCollapse={() => setCollapsed(c => !c)} onProfileClick={() => setShowProfile(true)} />

        {/* Scrollable content */}
        <main style={{ flex:1, overflowY:'auto', background:'var(--bg)' }}>

          {/* Stats — always visible on overview */}
          {active === 'overview' && !loading && (
            <div style={{ padding:'0 0 1px 0' }}>
              <StatsCards
                balance={totals.main_balance}
                bonus={totals.bonus_balance}
                totalAvailable={totalAvailable}
                performance={performance}
                username={user?.username}
              />

              {/* Quick actions */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, marginBottom:1 }}>
                <ActionBtn icon={<ArrowDownCircle size={20}/>} label="Deposit"     onClick={() => setDepositOpen(true)}           />
                <ActionBtn icon={<ArrowUpRight    size={20}/>} label="Withdraw"    onClick={() => setWithdrawOpen(true)}           />
                <ActionBtn icon={<TrendingUp      size={20}/>} label="View Trades" onClick={() => handleNavigate('trades')}         />
                <ActionBtn icon={<TrendingUp      size={20}/>} label="Stake Now"   onClick={() => handleNavigate('invest')}         />
              </div>
            </div>
          )}

          {/* Tab content */}
          <div style={{ padding:'24px' }}>
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
                {active === 'loan' && <LoanPage />}
              </>
            )}
          </div>

        </main>

      </div>

      {/* Modals */}
      <DepositModal  isOpen={depositOpen}  onClose={() => setDepositOpen(false)}  />
      <WithdrawalModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />

      <AnimatePresence>
        {showProfile && (
          <ProfileModal
            onClose={() => setShowProfile(false)}
            user={user}
            totals={totals}
            referralCount={referralCount}
          />
        )}
      </AnimatePresence>

    </div>
  );
}