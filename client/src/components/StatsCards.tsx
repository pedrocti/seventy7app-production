// client/src/components/StatsCards.tsx
import { motion } from 'framer-motion';
import { useMobile } from '@/hooks/useMobile';

interface StatsCardsProps {
  balance:        number;
  bonus:          number;
  totalAvailable: number;
  performance:    string;
  username?:      string;
}

function fmt(v: number): string {
  return isNaN(v) ? '0.00' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StatsCards({ balance, bonus, totalAvailable, performance, username }: StatsCardsProps) {
  const isMobile = useMobile();
  const perfPos  = performance.startsWith('+') || (!performance.startsWith('-') && performance !== '0%');
  const hasBonus = bonus > 0;

  const cells = [
    {
      label:   'Main Balance',
      value:   `$${fmt(balance)}`,
      sub:     'Withdrawable',
      accent:  'var(--cyan)',
      primary: true,
    },
    {
      label:   'Referral Bonus',
      value:   `$${fmt(bonus)}`,
      sub:     hasBonus ? 'Ready to invest' : 'Invite to earn',
      accent:  hasBonus ? 'var(--text)' : 'var(--muted-2)',
      primary: false,
    },
    {
      label:   'Total Portfolio',
      value:   `$${fmt(totalAvailable)}`,
      sub:     'Balance + Stakes',
      accent:  'var(--text)',
      primary: false,
    },
    {
      label:   'Performance',
      value:   performance,
      sub:     'Return on investment',
      accent:  perfPos ? 'var(--green)' : 'var(--red)',
      primary: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.10)', marginBottom: 1 }}
    >
      {/* Welcome strip */}
      <div style={{
        padding: isMobile ? '10px 14px' : '14px 28px',
        borderBottom: '1px solid rgba(10,239,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Member Portal
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cyan)', background: 'rgba(10,239,255,0.06)', border: '1px solid rgba(10,239,255,0.14)', padding: '2px 6px' }}>
            Verified
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: isMobile ? 12 : 13, fontWeight: 300, color: 'var(--s7-muted)' }}>
          Welcome back{username ? `, ${username}` : ''}
        </span>
      </div>

      {/* Stat grid — 2×2 on mobile, 4×1 on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)',
        // 1px cyan gap between cells
        gap: 1,
        background: 'rgba(10,239,255,0.08)',
      }}>
        {cells.map((cell, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            padding: isMobile ? '16px 14px' : '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? 4 : 6,
            // On mobile: bottom border between top row and bottom row
            position: 'relative',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted-2)',
            }}>
              {cell.label}
            </span>

            {/* Bold value — larger on mobile for the primary balance */}
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile
                ? (cell.primary ? 'clamp(22px,7vw,28px)' : 'clamp(18px,5vw,22px)')
                : 'clamp(20px,2.2vw,28px)',
              fontWeight: 300,
              color: cell.accent,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              wordBreak: 'break-all',
            }}>
              {cell.value}
            </span>

            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.08em',
              color: 'var(--muted-2)',
            }}>
              {cell.sub}
            </span>

            {/* Cyan accent bar on primary cell */}
            {cell.primary && (
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: 2,
                background: 'linear-gradient(90deg, var(--cyan), transparent)',
              }} />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}