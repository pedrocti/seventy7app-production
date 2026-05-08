// client/src/components/MarketImpactVisual.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   MARKET IMPACT VISUAL SECTION
   Uses exclusively our CSS design system.
   Gold (#C9A84C) replaced with var(--cyan).
   useInView from react-intersection-observer removed —
   uses Framer Motion whileInView + IntersectionObserver API.
═══════════════════════════════════════════════════════════ */

const insights = [
  {
    n:     '01',
    title: 'Market Structure',
    body:  'We identify higher highs and lower lows to determine trend direction before placing any trade. Structure first, entry second.',
  },
  {
    n:     '02',
    title: 'Smart Money Concepts',
    body:  'Our strategies follow the footprints of institutional traders through order blocks, fair value gaps, and liquidity grabs.',
  },
  {
    n:     '03',
    title: 'Risk Management',
    body:  'Capital preservation is paramount. We only risk 1–2% per trade with predefined stop losses and structured position sizing.',
  },
  {
    n:     '04',
    title: 'Psychological Edge',
    body:  'Trading psychology separates consistent winners from the rest. We teach emotional control, patience, and disciplined consistency.',
  },
];

const statsConfig = [
  { label: 'Markets Analysed',   target: 85,  suffix: '+' },
  { label: 'Strategies Studied', target: 120, suffix: '+' },
  { label: 'Scenarios Reviewed', target: 450, suffix: '+' },
  { label: 'Insights Published', target: 320, suffix: '+' },
];

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const rise = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Animated counter ── */
function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref   = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const step  = Math.ceil(target / 40);
          const timer = setInterval(() => {
            setCount(prev => {
              const next = prev + step;
              if (next >= target) { clearInterval(timer); return target; }
              return next;
            });
          }, 28);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{
      fontFamily: 'var(--font-display)',
      fontSize:   'clamp(36px, 4vw, 56px)',
      fontWeight: 300,
      lineHeight: 1,
      color:      'var(--text)',
      marginBottom: 10,
    }}>
      {count}<span style={{ fontSize: '55%', color: 'var(--cyan)' }}>{suffix}</span>
    </div>
  );
}

export default function MarketImpactVisual() {

  /* Load TradingView ticker script once */
  useEffect(() => {
    const id = 'tv-ticker-script';
    if (!document.getElementById(id)) {
      const s    = document.createElement('script');
      s.id       = id;
      s.src      = 'https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js';
      s.type     = 'module';
      s.async    = true;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <section className="section-base section-py">
      <div className="container-s7">

        {/* ── Section header ── */}
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          <motion.div variants={rise}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>
              Market Intelligence
            </span>
            <h2 className="section-heading">
              Intelligence & <em>Insights</em>
            </h2>
          </motion.div>
          <motion.p variants={rise} className="body-text" style={{ maxWidth: 340 }}>
            Technical analysis, macro awareness, and market psychology — combined to help
            individuals understand financial market dynamics.
          </motion.p>
        </motion.div>

        {/* ── TradingView ticker ── */}
        <div style={{
          background: 'var(--surface)',
          border:     '1px solid rgba(10,239,255,0.08)',
          padding:    '16px 20px',
          marginBottom: 1,
          overflow: 'hidden',
        }}>
          <div dangerouslySetInnerHTML={{ __html: `<tv-ticker-tape symbols="FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD"></tv-ticker-tape>` }} />
        </div>

        {/* ── Stats strip ── */}
        <div className="flush-grid-4" style={{ marginBottom: 1 }}>
          {statsConfig.map((s, i) => (
            <div key={i} className="flush-cell" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Counter target={s.target} suffix={s.suffix} />
              <span className="data-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Knowledge cards ── */}
        <motion.div
          className="flush-grid-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
        >
          {insights.map((item, i) => (
            <motion.div key={i} className="flush-cell" variants={rise}>
              <div className="card-pad">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                  {/* Ghost number */}
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize:   52,
                    fontWeight: 300,
                    color:      'rgba(10,239,255,0.07)',
                    lineHeight: 1,
                    flexShrink: 0,
                    userSelect: 'none',
                    marginTop:  4,
                  }}>
                    {item.n}
                  </span>

                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize:   'clamp(18px, 1.8vw, 22px)',
                      fontWeight: 300,
                      color:      'var(--text)',
                      marginBottom: 12,
                      lineHeight:   1.2,
                    }}>
                      {item.title}
                    </h3>
                    <p className="body-text-sm">{item.body}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}