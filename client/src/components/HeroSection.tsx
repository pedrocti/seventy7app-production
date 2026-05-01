import { useState, useRef, useMemo, useCallback, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CandlestickBackground from './CandlestickBackground';

/* ═══════════════════════════════════════════════════════════
   CAPITAL PROJECTION SIMULATOR
   Institutional-grade, not hype. Pure simulation.
═══════════════════════════════════════════════════════════ */

interface StrategyConfig {
  low:        number;
  mid:        number;
  high:       number;
  label:      string;
  sublabel:   string;
  color:      string;
  rgb:        string;
}

const STRATEGIES: Record<'conservative' | 'balanced' | 'aggressive', StrategyConfig> = {
  conservative: {
    low: 0.055, mid: 0.115, high: 0.19,
    label: 'Conservative', sublabel: 'Capital Preservation Focus',
    color: '#7aa4e8', rgb: '122,164,232',
  },
  balanced: {
    low: 0.10, mid: 0.22, high: 0.38,
    label: 'Balanced', sublabel: 'Growth & Stability Mix',
    color: '#0AEFFF', rgb: '10,239,255',
  },
  aggressive: {
    low: 0.18, mid: 0.42, high: 0.78,
    label: 'Aggressive', sublabel: 'High-Conviction Growth',
    color: '#3dd68c', rgb: '61,214,140',
  },
};

const HORIZONS = [1, 2, 3, 5] as const;

function fmtCap(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 100_000)   return `$${Math.round(v / 1000)}K`;
  if (v >= 1_000)     return `$${Math.round(v).toLocaleString('en-US')}`;
  return `$${v.toFixed(0)}`;
}

function fmtPct(v: number): string {
  return v >= 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`;
}

/* ── Projection Band Chart ── */
interface ProjPoint { t: number; low: number; mid: number; high: number; }

function ProjectionChart({
  points, color, rgb, hoverIdx, onHover, onLeave,
}: {
  points:   ProjPoint[];
  color:    string;
  rgb:      string;
  hoverIdx: number | null;
  onHover:  (idx: number) => void;
  onLeave:  () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const N      = points.length - 1;

  const W = 460, H = 160;
  const PAD = { top: 8, right: 14, bottom: 26, left: 56 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;

  const allVals = points.flatMap(p => [p.low, p.mid, p.high]);
  const base    = points[0].low;
  const maxVal  = Math.max(...allVals);
  const minVal  = base - (maxVal - base) * 0.08;
  const range   = maxVal - minVal || 1;

  const toX = (i: number) => PAD.left + (i / N) * cW;
  const toY = (v: number) => PAD.top  + cH - ((v - minVal) / range) * cH;

  function linePts(key: 'low' | 'mid' | 'high') {
    return points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p[key]).toFixed(1)}`
    ).join(' ');
  }

  function bandFill() {
    const fwd = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.high).toFixed(1)}`).join(' ');
    const rev = [...points].reverse().map((p, i) =>
      `L${toX(N - i).toFixed(1)},${toY(p.low).toFixed(1)}`
    ).join(' ');
    return `${fwd}${rev}Z`;
  }

  function innerBandFill() {
    const fwd = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.mid).toFixed(1)}`).join(' ');
    const rev = [...points].reverse().map((p, i) =>
      `L${toX(N - i).toFixed(1)},${toY(points[N - i].low).toFixed(1)}`
    ).join(' ');
    return `${fwd}${rev}Z`;
  }

  /* Y-axis ticks */
  const yTicks = [
    minVal + range * 0.05,
    minVal + range * 0.35,
    minVal + range * 0.65,
    minVal + range * 0.93,
  ];

  /* X-axis ticks: every year */
  const maxYrs = N / 12;
  const xTicks = Array.from({ length: Math.floor(maxYrs) + 1 }, (_, i) => i);

  /* Mouse interaction */
  const handleMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x   = (e.clientX - rect.left) / rect.width * W;
    const raw = Math.round(((x - PAD.left) / cW) * N);
    onHover(Math.max(0, Math.min(N, raw)));
  }, [N, cW, onHover]);

  const hp = hoverIdx !== null ? points[Math.max(0, Math.min(hoverIdx, N))] : null;
  const hx = hoverIdx !== null ? toX(Math.max(0, Math.min(hoverIdx, N))) : null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className="cps-svg"
      onMouseMove={handleMove}
      onMouseLeave={onLeave}
    >
      <defs>
        <linearGradient id="cps-band-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="cps-inner-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.10" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="cps-mid-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="70%"  stopColor={color} stopOpacity="0.9"  />
          <stop offset="100%" stopColor={color} stopOpacity="1"    />
        </linearGradient>
        <filter id="cps-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grid */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={toY(tick)}
            x2={PAD.left + cW} y2={toY(tick)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
          <text
            x={PAD.left - 5} y={toY(tick) + 3.5}
            fill="rgba(255,255,255,0.22)" fontSize="8"
            textAnchor="end" fontFamily="var(--font-mono)"
          >
            {fmtCap(tick)}
          </text>
        </g>
      ))}

      {/* X labels */}
      {xTicks.map(yr => (
        <text
          key={yr}
          x={toX(yr * 12)} y={H - 7}
          fill="rgba(255,255,255,0.22)" fontSize="8"
          textAnchor="middle" fontFamily="var(--font-mono)"
        >
          {yr === 0 ? 'NOW' : `Y${yr}`}
        </text>
      ))}

      {/* Axis baseline */}
      <line
        x1={PAD.left} y1={PAD.top + cH}
        x2={PAD.left + cW} y2={PAD.top + cH}
        stroke="rgba(255,255,255,0.06)" strokeWidth="1"
      />

      {/* Outer band fill */}
      <path d={bandFill()} fill="url(#cps-band-grad)" />

      {/* Inner band fill (low → mid) */}
      <path d={innerBandFill()} fill="url(#cps-inner-grad)" />

      {/* Upper bound — dashed */}
      <path d={linePts('high')} fill="none"
        stroke={color} strokeWidth="1" strokeOpacity="0.30"
        strokeDasharray="3 4"
      />

      {/* Lower bound — dashed */}
      <path d={linePts('low')} fill="none"
        stroke={color} strokeWidth="1" strokeOpacity="0.30"
        strokeDasharray="3 4"
      />

      {/* Mid line — primary, glowing */}
      <path d={linePts('mid')} fill="none"
        stroke={color} strokeWidth="1.5" strokeOpacity="0.3"
        filter="url(#cps-glow)"
      />
      <path d={linePts('mid')} fill="none"
        stroke="url(#cps-mid-grad)" strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Terminal endpoints */}
      <circle cx={toX(N)} cy={toY(points[N].high)} r="2.5"
        fill={color} fillOpacity="0.5" />
      <circle cx={toX(N)} cy={toY(points[N].low)} r="2.5"
        fill={color} fillOpacity="0.5" />
      <circle cx={toX(N)} cy={toY(points[N].mid)} r="4"
        fill={color} />
      <circle cx={toX(N)} cy={toY(points[N].mid)} r="6.5"
        fill={color} fillOpacity="0.15" />

      {/* Hover crosshair */}
      {hp && hx !== null && (
        <g>
          <line
            x1={hx} y1={PAD.top}
            x2={hx} y2={PAD.top + cH}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1" strokeDasharray="2 3"
          />
          <circle cx={hx} cy={toY(hp.high)} r="2.5" fill={color} fillOpacity="0.55" />
          <circle cx={hx} cy={toY(hp.mid)}  r="3.5" fill={color} />
          <circle cx={hx} cy={toY(hp.low)}  r="2.5" fill={color} fillOpacity="0.55" />

          {/* Time label above crosshair */}
          <rect
            x={hx - 18} y={PAD.top - 1}
            width="36" height="13"
            rx="2"
            fill="rgba(10,15,35,0.85)"
            stroke={`rgba(${rgb},0.25)`}
            strokeWidth="1"
          />
          <text
            x={hx} y={PAD.top + 9}
            fill={color} fontSize="7.5"
            textAnchor="middle" fontFamily="var(--font-mono)"
          >
            {hp.t < 0.1 ? 'NOW' : `Y${hp.t.toFixed(1)}`}
          </text>
        </g>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   CAPITAL PROJECTION SIMULATOR — main component
═══════════════════════════════════════════════════════════ */
function CapitalProjectionSimulator() {
  const [rawCapital, setRawCapital] = useState(25000);
  const [displayVal, setDisplayVal] = useState('25,000');
  const [strategy,   setStrategy]   = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [horizon,    setHorizon]     = useState<typeof HORIZONS[number]>(3);
  const [hoverIdx,   setHoverIdx]    = useState<number | null>(null);

  const s = STRATEGIES[strategy];
  const N = horizon * 12;

  const points = useMemo<ProjPoint[]>(() =>
    Array.from({ length: N + 1 }, (_, i) => {
      const t = i / 12;
      return {
        t,
        low:  rawCapital * Math.pow(1 + s.low,  t),
        mid:  rawCapital * Math.pow(1 + s.mid,  t),
        high: rawCapital * Math.pow(1 + s.high, t),
      };
    }),
    [rawCapital, s, N]
  );

  const clampedIdx = hoverIdx !== null ? Math.max(0, Math.min(hoverIdx, N)) : null;
  const activePt   = clampedIdx !== null ? points[clampedIdx] : points[N];

  const pctLow  = (activePt.low  / rawCapital - 1) * 100;
  const pctMid  = (activePt.mid  / rawCapital - 1) * 100;
  const pctHigh = (activePt.high / rawCapital - 1) * 100;

  /* Capital input handlers */
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setDisplayVal(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > 0) setRawCapital(num);
  }

  function handleFocus() {
    setDisplayVal(rawCapital.toString());
  }

  function handleBlur() {
    const num = parseInt(displayVal.replace(/[^0-9]/g, ''), 10);
    const clamped = isNaN(num) || num < 100 ? 1000 : Math.min(num, 99_000_000);
    setRawCapital(clamped);
    setDisplayVal(clamped.toLocaleString('en-US'));
  }

  const presets = [5_000, 25_000, 100_000, 500_000];

  return (
    <motion.div
      className="cps-wrap"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
    >
      {/* ── Header ── */}
      <div className="cps-header">
        <div className="cps-header-left">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="cps-header-icon-svg">
            <path d="M6 1L7.5 4.5H11L8.5 7L9.5 11L6 9L2.5 11L3.5 7L1 4.5H4.5L6 1Z"
              fill="currentColor" fillOpacity="0.7" />
          </svg>
          <span className="cps-header-title">Capital Projection Tool</span>
        </div>
        <span className="cps-disclaimer-badge">Simulation · Not Advice</span>
      </div>

      {/* ── Controls ── */}
      <div className="cps-controls">
        {/* Capital input */}
        <div className="cps-input-group">
          <label className="cps-label">Deployment Capital</label>
          <div className="cps-input-row">
            <div className="cps-input-wrap">
              <span className="cps-currency-sign">$</span>
              <input
                className="cps-input"
                type="text"
                inputMode="numeric"
                value={displayVal}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="25,000"
              />
            </div>
            <div className="cps-presets">
              {presets.map(p => (
                <button
                  key={p}
                  className={`cps-preset-btn ${rawCapital === p ? 'cps-preset-btn--active' : ''}`}
                  onClick={() => {
                    setRawCapital(p);
                    setDisplayVal(p.toLocaleString('en-US'));
                  }}
                >
                  {p >= 1000 ? `${p / 1000}K` : p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy + Horizon */}
        <div className="cps-selector-grid">
          <div className="cps-selector-col">
            <label className="cps-label">Risk Profile</label>
            <div className="cps-pills">
              {(['conservative', 'balanced', 'aggressive'] as const).map(k => (
                <button
                  key={k}
                  className={`cps-pill cps-pill--${k} ${strategy === k ? 'cps-pill--active' : ''}`}
                  onClick={() => setStrategy(k)}
                >
                  {k === 'conservative' ? 'Cons.' : k === 'balanced' ? 'Balanced' : 'Aggr.'}
                </button>
              ))}
            </div>
          </div>
          <div className="cps-selector-col">
            <label className="cps-label">Horizon</label>
            <div className="cps-pills">
              {HORIZONS.map(h => (
                <button
                  key={h}
                  className={`cps-pill cps-pill--horizon ${horizon === h ? 'cps-pill--active cps-pill--horizon-active' : ''}`}
                  onClick={() => setHorizon(h)}
                >
                  {h}Y
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Band Chart ── */}
      <div className="cps-chart-area">
        <ProjectionChart
          points={points}
          color={s.color}
          rgb={s.rgb}
          hoverIdx={hoverIdx}
          onHover={setHoverIdx}
          onLeave={() => setHoverIdx(null)}
        />
      </div>

      {/* ── Output bands ── */}
      <div className="cps-outputs">
        <div className="cps-out-card cps-out-card--floor">
          <span className="cps-out-tag">Floor</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={fmtCap(activePt.low)}
              className="cps-out-val"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {fmtCap(activePt.low)}
            </motion.span>
          </AnimatePresence>
          <span className="cps-out-delta">{fmtPct(pctLow)}</span>
        </div>

        <div className="cps-out-card cps-out-card--mid" style={{ '--s-color': s.color, '--s-rgb': s.rgb } as CSSProperties}>
          <span className="cps-out-tag cps-out-tag--primary">Expected</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={fmtCap(activePt.mid)}
              className="cps-out-val cps-out-val--primary"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {fmtCap(activePt.mid)}
            </motion.span>
          </AnimatePresence>
          <span className="cps-out-delta cps-out-delta--primary">{fmtPct(pctMid)}</span>
        </div>

        <div className="cps-out-card cps-out-card--ceil">
          <span className="cps-out-tag">Ceiling</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={fmtCap(activePt.high)}
              className="cps-out-val"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {fmtCap(activePt.high)}
            </motion.span>
          </AnimatePresence>
          <span className="cps-out-delta">{fmtPct(pctHigh)}</span>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="cps-footer">
        <span className="cps-footer-text">
          {s.label} · {horizon}Y Horizon · {s.low * 100}–{s.high * 100}% annualised band
        </span>
        <span className="cps-footer-text cps-footer-right">
          {hoverIdx !== null && clampedIdx !== null
            ? `T+${points[clampedIdx].t.toFixed(1)}yr`
            : `T+${horizon}yr`
          }
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════════════ */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const rise = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div className="h-stat">
      <span className="h-stat-num">{num}</span>
      <span className="h-stat-label">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════════════════ */
export default function HeroSection() {
  return (
    <section className="h-section">
      <div className="h-bg-canvas" aria-hidden>
        <CandlestickBackground />
      </div>
      <div className="h-ambient" aria-hidden />

      <div className="h-container">
        <div className="h-grid">

          {/* LEFT */}
          <motion.div className="h-left" variants={stagger} initial="hidden" animate="visible">

            <motion.div variants={rise} className="h-overline">
              <span className="h-overline-bar" />
              <span className="eyebrow">Premium Financial Platform · Est. 2024</span>
            </motion.div>

            <motion.h1 variants={rise} className="h-headline">
              Build wealth<br />
              <em className="h-headline-gold">with discipline.</em>
              <span className="h-headline-sub">Not luck.</span>
            </motion.h1>

            <motion.div variants={rise} className="h-body">
              <span className="h-body-bar" />
              <p className="h-body-text">
                Structured financial education, institutional-grade investment
                opportunities, and professional portfolio management — engineered
                for individuals serious about long-term wealth.
              </p>
            </motion.div>

            <motion.div variants={rise} className="h-ctas">
              <motion.a href="/register" className="btn-primary" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                Start Your Journey
              </motion.a>
              <motion.a href="/login" className="btn-ghost">
                Member Login
              </motion.a>
            </motion.div>

            <motion.div variants={rise} className="h-stats">
              <Stat num="500+"  label="Active Members" />
              <span className="h-stats-sep" />
              <Stat num="4.9★"  label="Member Rating" />
              <span className="h-stats-sep" />
              <Stat num="24/7"  label="Market Signals" />
            </motion.div>

          </motion.div>

          {/* RIGHT — capital projection simulator */}
          <CapitalProjectionSimulator />

        </div>
      </div>
    </section>
  );
}
