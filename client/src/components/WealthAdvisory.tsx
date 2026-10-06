// client/src/components/WealthAdvisory.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CapitalRange = '500-2500' | '2500-10000' | '10000-25000' | '25000-50000' | '50000+';
type IncomeType   = 'business' | 'professional' | 'investor';
type Goal         = 'preservation' | 'growth' | 'aggressive';

interface AdvisoryOutput {
  score:       number;
  statement:   string;
  allocation:  { label: string; pct: number; color: string }[];
  riskPosture: string;
  missing:     string[];
  doNothing:   string;
}

function generateAdvisory(capital: CapitalRange, income: IncomeType, goal: Goal): AdvisoryOutput {
  const isSmall = capital === '500-2500';
  const isMid   = capital === '2500-10000' || capital === '10000-25000';

  const incomeLabel: Record<IncomeType, string> = {
    business: 'Business Owner', professional: 'Working Professional', investor: 'Active Investor',
  };
  const goalLabel: Record<Goal, string> = {
    preservation: 'capital preservation', growth: 'steady long-term growth', aggressive: 'high-conviction growth',
  };

  const score = Math.min(100, (isSmall ? 38 : isMid ? 62 : 81) + (goal === 'aggressive' ? 8 : goal === 'growth' ? 5 : 0));

  const statement = `As a ${incomeLabel[income]} focused on ${goalLabel[goal]}, your capital of $${
    capital === '50000+' ? '50,000+' : capital.replace('-', '–$')
  } positions you to build a structured, institutional-grade portfolio. ${
    isSmall
      ? 'Starting with discipline will compound significantly over a 12-month horizon.'
      : isMid
      ? 'Your range unlocks diversified allocation across staking, managed portfolios, and education.'
      : 'At this level, professional management and diversified deployment are critical.'
  }`;

  const allocations: Record<Goal, { label: string; pct: number; color: string }[]> = {
    preservation: [
      { label: 'Managed Portfolio', pct: 50, color: 'var(--cyan)'    },
      { label: 'Stake to Earn',     pct: 30, color: 'var(--purple)'  },
      { label: 'Cash Reserve',      pct: 20, color: 'var(--muted-2)' },
    ],
    growth: [
      { label: 'Managed Portfolio', pct: 40, color: 'var(--cyan)'   },
      { label: 'Stake to Earn',     pct: 40, color: 'var(--purple)'  },
      { label: 'Education',         pct: 20, color: 'var(--green)'   },
    ],
    aggressive: [
      { label: 'Stake to Earn',     pct: 50, color: 'var(--purple)'  },
      { label: 'Managed Portfolio', pct: 35, color: 'var(--cyan)'    },
      { label: 'Education',         pct: 15, color: 'var(--green)'   },
    ],
  };

  const riskMap: Record<Goal, string> = {
    preservation: 'Conservative capital protection is the primary objective. Structured plans with fixed monthly returns are prioritised over growth.',
    growth:       'Balanced a blend of structured staking returns and professionally managed growth. Consistent compounding across a 12-month horizon.',
    aggressive:   'High-Conviction maximum allocation to growth-oriented instruments. Suitable for investors with a long-term horizon and tolerance for short-term volatility.',
  };

  const missingMap: Record<IncomeType, string[]> = {
    business:     ['Structured capital deployment outside your business', 'Passive income streams that don\'t require your time', 'Portfolio diversification across uncorrelated assets'],
    professional: ['Tax-efficient wealth accumulation strategies', 'Compounding returns on idle savings', 'Access to institutional-grade investment structures'],
    investor:     ['Professional management beyond self-directed trading', 'Structured risk controls and position sizing', 'Diversified exposure across staking and managed portfolios'],
  };

  const doNothingMap: Record<CapitalRange, string> = {
    '500-2500':    '$2,500 idle loses approximately $150–$200 in real purchasing power annually through inflation. Over 3 years that gap compounds significantly.',
    '2500-10000':  '$10,000 in a standard savings account generates under $150/year while inflation erodes 6–8% of its real value.',
    '10000-25000': '$25,000 idle for 12 months represents a missed opportunity of $2,750–$5,500 in potential structured returns.',
    '25000-50000': '$50,000 undeployed for 12 months can represent $5,500–$19,000 in foregone structured returns.',
    '50000+':      'Capital of this magnitude requires active management. Without structure, erosion through inflation and opportunity cost compounds every year.',
  };

  return {
    score, statement,
    allocation:  allocations[goal],
    riskPosture: riskMap[goal],
    missing:     missingMap[income],
    doNothing:   doNothingMap[capital],
  };
}

/* ── Score ring ── */
function ScoreRing({ score }: { score: number }) {
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
      <svg width="104" height="104" viewBox="0 0 104 104" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="52" cy="52" r={r} fill="none" stroke="rgba(10,239,255,0.08)" strokeWidth="7" />
        <motion.circle cx="52" cy="52" r={r} fill="none"
          stroke="url(#sg)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#0AEFFF" />
            <stop offset="100%" stopColor="#7E22CE" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300, color: 'var(--text)', lineHeight: 1 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          {score}
        </motion.span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.12em', color: 'var(--muted-2)', textTransform: 'uppercase', marginTop: 2 }}>Score</span>
      </div>
    </div>
  );
}

/* ── Allocation bar ── */
function AllocationBar({ items }: { items: { label: string; pct: number; color: string }[] }) {
  return (
    <div>
      <div style={{ display: 'flex', height: 5, overflow: 'hidden', marginBottom: 14 }}>
        {items.map((item, i) => (
          <motion.div key={i} style={{ background: item.color, height: '100%' }}
            initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
            transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, background: item.color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--s7-muted)' }}>
              {item.label} · {item.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Expandable block ── */
function Expand({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: '1px solid rgba(10,239,255,0.08)' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cyan)' }}>{label}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--muted-2)', lineHeight: 1 }}>+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}>
            <div style={{ paddingBottom: 16 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Option pill ── */
function Pill<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string; sub?: string }[];
  value: T; onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 300,
            color: active ? 'var(--text)' : 'var(--s7-muted)',
            background: active ? 'rgba(10,239,255,0.06)' : 'transparent',
            border: `1px solid ${active ? 'rgba(10,239,255,0.35)' : 'rgba(240,237,230,0.10)'}`,
            padding: opt.sub ? '10px 16px' : '8px 16px',
            cursor: 'pointer', transition: 'all 0.2s ease',
            textAlign: 'left', lineHeight: 1.4,
          }}>
            <span style={{ display: 'block' }}>{opt.label}</span>
            {opt.sub && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', color: active ? 'var(--cyan)' : 'var(--muted-2)', display: 'block', marginTop: 2 }}>{opt.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ── Advisory result panel (shared desktop + mobile) ── */
function ResultPanel({ result, onReset }: { result: AdvisoryOutput; onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>

      {/* Score + statement */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
        <ScoreRing score={result.score} />
        <div>
          <span className="about-block-label" style={{ marginBottom: 8 }}>Capital Efficiency Score</span>
          <p className="body-text-sm">{result.statement}</p>
        </div>
      </div>

      {/* Allocation */}
      <div style={{ marginBottom: 20 }}>
        <span className="about-block-label" style={{ marginBottom: 10 }}>Suggested Allocation</span>
        <AllocationBar items={result.allocation} />
      </div>

      {/* Expandable insights */}
      <Expand label="Risk Posture">
        <p className="body-text-sm">{result.riskPosture}</p>
      </Expand>
      <Expand label="What You're Missing">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result.missing.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0, marginTop: 6 }} />
              <p className="body-text-sm" style={{ margin: 0 }}>{item}</p>
            </div>
          ))}
        </div>
      </Expand>
      <Expand label="If You Do Nothing">
        <p className="body-text-sm">{result.doNothing}</p>
      </Expand>

      {/* CTA */}
      <div style={{ marginTop: 20, padding: 18, background: 'rgba(10,239,255,0.04)', border: '1px solid rgba(10,239,255,0.12)' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontStyle: 'italic', fontWeight: 300, color: 'var(--text)', lineHeight: 1.6, marginBottom: 14 }}>
          "Apply this strategy through our Portfolio Management Programme"
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/portfolio" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Apply This Strategy</a>
          <button onClick={onReset} className="btn-ghost" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Start Over</button>
        </div>
      </div>

    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOBILE STEP WIZARD
   Shows one question at a time — result replaces form
═══════════════════════════════════════════════════════════ */
function MobileWizard() {
  const [step,    setStep]    = useState(0); // 0,1,2 = questions; 3 = result
  const [capital, setCapital] = useState<CapitalRange>('10000-25000');
  const [income,  setIncome]  = useState<IncomeType>('professional');
  const [goal,    setGoal]    = useState<Goal>('growth');
  const [result,  setResult]  = useState<AdvisoryOutput | null>(null);

  const capitalOpts: { value: CapitalRange; label: string; sub: string }[] = [
    { value: '500-2500',    label: '$500 – $2,500',     sub: 'Starter'        },
    { value: '2500-10000',  label: '$2,500 – $10,000',  sub: 'Foundation'     },
    { value: '10000-25000', label: '$10,000 – $25,000', sub: 'Established'    },
    { value: '25000-50000', label: '$25,000 – $50,000', sub: 'Serious Capital' },
    { value: '50000+',      label: '$50,000+',           sub: 'High Net Worth' },
  ];
  const incomeOpts: { value: IncomeType; label: string; sub: string }[] = [
    { value: 'business',     label: 'Business Owner',       sub: 'Entrepreneur / Founder' },
    { value: 'professional', label: 'Working Professional',  sub: 'Employed / Salaried'   },
    { value: 'investor',     label: 'Active Investor',       sub: 'Self-directed / HNW'   },
  ];
  const goalOpts: { value: Goal; label: string; sub: string }[] = [
    { value: 'preservation', label: 'Capital Preservation', sub: 'Protect & stabilise'  },
    { value: 'growth',       label: 'Steady Growth',        sub: 'Balanced compounding' },
    { value: 'aggressive',   label: 'Aggressive Growth',    sub: 'Maximum deployment'   },
  ];

  function next() {
    if (step < 2) { setStep(s => s + 1); return; }
    const r = generateAdvisory(capital, income, goal);
    setResult(r);
    setStep(3);
  }

  function reset() { setStep(0); setResult(null); }

  const steps = [
    { label: '01 — Capital Range',   node: <Pill options={capitalOpts} value={capital} onChange={v => setCapital(v)} /> },
    { label: '02 — Income Type',     node: <Pill options={incomeOpts}  value={income}  onChange={v => setIncome(v)}  /> },
    { label: '03 — Investment Goal', node: <Pill options={goalOpts}    value={goal}    onChange={v => setGoal(v)}    /> },
  ];

  const btnLabel = step < 2 ? 'Next →' : 'Generate My Advisory';

  return (
    <div>
      <AnimatePresence mode="wait">
        {step < 3 ? (
          <motion.div key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: i === step ? 20 : 6, height: 6,
                  background: i <= step ? 'var(--cyan)' : 'rgba(10,239,255,0.15)',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>

            <span className="about-block-label" style={{ marginBottom: 16 }}>
              {steps[step].label}
            </span>

            {steps[step].node}

            <div style={{ marginTop: 28, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn-primary" onClick={next}
                style={{ cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
                {btnLabel}
              </button>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', whiteSpace: 'nowrap' }}>
                  ← Back
                </button>
              )}
            </div>

          </motion.div>
        ) : (
          <motion.div key="result"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}>
            {result && <ResultPanel result={result} onReset={reset} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DESKTOP — all inputs + result side by side
═══════════════════════════════════════════════════════════ */
function DesktopAdvisory() {
  const [capital,    setCapital]    = useState<CapitalRange>('10000-25000');
  const [income,     setIncome]     = useState<IncomeType>('professional');
  const [goal,       setGoal]       = useState<Goal>('growth');
  const [result,     setResult]     = useState<AdvisoryOutput | null>(null);
  const [showResult, setShowResult] = useState(false);

  function handleGenerate() {
    setResult(generateAdvisory(capital, income, goal));
    setShowResult(true);
  }
  function handleReset() { setShowResult(false); setResult(null); }

  const capitalOpts: { value: CapitalRange; label: string; sub: string }[] = [
    { value: '500-2500',    label: '$500 – $2,500',     sub: 'Starter'        },
    { value: '2500-10000',  label: '$2,500 – $10,000',  sub: 'Foundation'     },
    { value: '10000-25000', label: '$10,000 – $25,000', sub: 'Established'    },
    { value: '25000-50000', label: '$25,000 – $50,000', sub: 'Serious Capital' },
    { value: '50000+',      label: '$50,000+',           sub: 'High Net Worth' },
  ];
  const incomeOpts: { value: IncomeType; label: string; sub: string }[] = [
    { value: 'business',     label: 'Business Owner',      sub: 'Entrepreneur / Founder' },
    { value: 'professional', label: 'Working Professional', sub: 'Employed / Salaried'   },
    { value: 'investor',     label: 'Active Investor',      sub: 'Self-directed / HNW'   },
  ];
  const goalOpts: { value: Goal; label: string; sub: string }[] = [
    { value: 'preservation', label: 'Capital Preservation', sub: 'Protect & stabilise'  },
    { value: 'growth',       label: 'Steady Growth',        sub: 'Balanced compounding' },
    { value: 'aggressive',   label: 'Aggressive Growth',    sub: 'Maximum deployment'   },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: showResult ? '1fr 1fr' : '1fr',
      gap: 1,
      background: 'rgba(10,239,255,0.08)',
      transition: 'grid-template-columns 0.4s ease',
    }}>

      {/* Input panel */}
      <div className="flush-cell">
        <div className="card-pad">
          <div style={{ marginBottom: 28 }}>
            <span className="about-block-label" style={{ marginBottom: 12 }}>01 — Capital Range</span>
            <Pill options={capitalOpts} value={capital} onChange={setCapital} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <span className="about-block-label" style={{ marginBottom: 12 }}>02 — Income Type</span>
            <Pill options={incomeOpts} value={income} onChange={setIncome} />
          </div>
          <div style={{ marginBottom: 32 }}>
            <span className="about-block-label" style={{ marginBottom: 12 }}>03 — Investment Goal</span>
            <Pill options={goalOpts} value={goal} onChange={setGoal} />
          </div>
          <button className="btn-primary" onClick={handleGenerate}
            style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
            Generate My Advisory
          </button>
          <p style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--muted-2)', lineHeight: 1.7, textTransform: 'uppercase' }}>
            Indicative guidance only not financial advice.
          </p>
        </div>
      </div>

      {/* Result panel */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div className="flush-cell"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <div className="card-pad">
              <ResultPanel result={result} onReset={handleReset} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN — renders mobile or desktop based on screen width
═══════════════════════════════════════════════════════════ */
export default function WealthAdvisory() {
  return (
    <section className="section-base section-py">
      <div className="container-s7">

        {/* Header */}
        <motion.div className="section-header"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>Capital Advisory</span>
            <h2 className="section-heading">Wealth <em>Advisory Tool</em></h2>
          </div>
          <p className="body-text" style={{ maxWidth: 340 }}>
            Answer three questions and receive a structured, personalised capital
            allocation strategy built on institutional principles.
          </p>
        </motion.div>

        {/* Mobile wizard — hidden on desktop via CSS */}
        <div className="wa-mobile">
          <div className="flush-cell">
            <div className="card-pad">
              <MobileWizard />
            </div>
          </div>
        </div>

        {/* Desktop layout — hidden on mobile via CSS */}
        <div className="wa-desktop">
          <DesktopAdvisory />
        </div>

        {/* Positioning strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginTop: 1, padding: '24px 32px', background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p className="about-manifesto" style={{ fontSize: 14, maxWidth: 520 }}>
            Seventy7 Kapital is a structured capital advisory platform not just an investment product provider.
          </p>
          <a href="/register" className="btn-ghost" style={{ textDecoration: 'none', flexShrink: 0 }}>
            Open Your Account
          </a>
        </motion.div>

      </div>
    </section>
  );
}