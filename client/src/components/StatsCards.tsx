// client/src/components/StatsCards.tsx
import { motion } from 'framer-motion';

interface StatsCardsProps {
  balance:        number;
  bonus:          number;
  totalAvailable: number;
  performance:    string;
  username?:      string;
}

function fmt(v: number): string {
  return isNaN(v) ? '0.00' : v.toFixed(2);
}

function StatCell({ label, value, sub, accent }: { label:string; value:string; sub?:string; accent?:boolean }) {
  return (
    <div style={{
      padding:     '24px 28px',
      borderRight: '1px solid rgba(10,239,255,0.08)',
      display:     'flex',
      flexDirection:'column',
      gap:         6,
    }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)' }}>
        {label}
      </span>
      <span style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px, 2.5vw, 32px)', fontWeight:300, color: accent ? 'var(--cyan)' : 'var(--text)', lineHeight:1, letterSpacing:'-0.02em' }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.08em', color:'var(--muted-2)' }}>{sub}</span>
      )}
    </div>
  );
}

export default function StatsCards({ balance, bonus, totalAvailable, performance, username }: StatsCardsProps) {
  const hasBonus  = bonus > 0;
  const perfPos   = performance.startsWith('+') || (!performance.startsWith('-') && performance !== '0%');

  return (
    <motion.div
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
      style={{
        background:  'var(--surface)',
        border:      '1px solid rgba(10,239,255,0.10)',
        marginBottom: 1,
      }}
    >
      {/* Welcome strip */}
      <div style={{
        padding:     '14px 28px',
        borderBottom:'1px solid rgba(10,239,255,0.08)',
        display:     'flex',
        alignItems:  'center',
        justifyContent:'space-between',
        flexWrap:    'wrap',
        gap:         8,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)' }}>
            Member Portal
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--cyan)', background:'rgba(10,239,255,0.06)', border:'1px solid rgba(10,239,255,0.14)', padding:'2px 7px' }}>
            Verified
          </span>
        </div>
        <span style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:300, color:'var(--muted)' }}>
          Welcome back{username ? `, ${username}` : ''}
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }} className="stats-grid">
        <StatCell
          label="Main Balance"
          value={`$${fmt(balance)}`}
          sub="Available for withdrawal"
          accent
        />
        <StatCell
          label="Referral Bonus"
          value={`$${fmt(bonus)}`}
          sub={hasBonus ? 'Ready to invest' : 'Invite friends to earn'}
        />
        <StatCell
          label="Total Portfolio"
          value={`$${fmt(totalAvailable)}`}
          sub="Balance + Stakes + Profit"
        />
        <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)' }}>
            Performance
          </span>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px,2.5vw,32px)', fontWeight:300, color: perfPos ? 'var(--green)' : 'var(--red)', lineHeight:1, letterSpacing:'-0.02em' }}>
            {performance}
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.08em', color:'var(--muted-2)' }}>
            Return on investment
          </span>
        </div>
      </div>
    </motion.div>
  );
}