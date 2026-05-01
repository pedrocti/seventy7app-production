import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CandlestickBackground from './CandlestickBackground';

/* ═══════════════════════════════════════════════════════════
   MARKET INSTRUMENTS
   — Crypto: Bybit WebSocket (real-time)
   — Forex/Gold: Frankfurter + metals-api polling (30s)
═══════════════════════════════════════════════════════════ */
interface Instrument {
  id:       string;
  sym:      string;
  label:    string;
  type:     'crypto' | 'forex' | 'gold';
  bybit?:   string;   // Bybit symbol e.g. "BTCUSDT"
  price:    number | null;
  change:   number | null;
  prevClose:number | null;
  spark:    number[];
}

const INSTRUMENTS: Instrument[] = [
  { id:'btc',    sym:'BTC/USD', label:'Bitcoin',    type:'crypto', bybit:'BTCUSDT',  price:null, change:null, prevClose:null, spark:[] },
  { id:'eth',    sym:'ETH/USD', label:'Ethereum',   type:'crypto', bybit:'ETHUSDT',  price:null, change:null, prevClose:null, spark:[] },
  { id:'sol',    sym:'SOL/USD', label:'Solana',     type:'crypto', bybit:'SOLUSDT',  price:null, change:null, prevClose:null, spark:[] },
  { id:'xrp',    sym:'XRP/USD', label:'XRP',        type:'crypto', bybit:'XRPUSDT',  price:null, change:null, prevClose:null, spark:[] },
  { id:'xau',    sym:'XAU/USD', label:'Gold',       type:'gold',                      price:null, change:null, prevClose:null, spark:[] },
  { id:'gbpusd', sym:'GBP/USD', label:'Pound',      type:'forex',                     price:null, change:null, prevClose:null, spark:[] },
  { id:'eurusd', sym:'EUR/USD', label:'Euro',       type:'forex',                     price:null, change:null, prevClose:null, spark:[] },
  { id:'usdjpy', sym:'USD/JPY', label:'Yen',        type:'forex',                     price:null, change:null, prevClose:null, spark:[] },
];

/* ── Format price by instrument type ── */
function fmt(price: number, type: string): string {
  if (type === 'forex') return price.toFixed(4);
  if (type === 'forex' && price > 20) return price.toFixed(2); 
  if (type === 'gold')   return `$${price.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
  if (price >= 10000) return `$${price.toLocaleString('en-US', { maximumFractionDigits:0 })}`;
  if (price >= 1)     return `$${price.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
  return `$${price.toFixed(4)}`;
}

/* ── Sparkline SVG ── */
function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  if (data.length < 2) {
    return <div style={{ width:64, height:24 }} />;
  }
  const w = 64, h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${pts.join(' L')}`;
  const area = `M0,${h} L${pts.join(' L')} L${w},${h} Z`;
  const c = up ? '#0ECB81' : '#F6465D';
  const uid = data[0]?.toFixed(0) ?? '0';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="lmp-spark">
      <defs>
        <linearGradient id={`sg${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={c} stopOpacity="0.3" />
          <stop offset="100%" stopColor={c} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg${uid})`} />
      <path d={line} fill="none" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   LIVE MARKET PANEL
═══════════════════════════════════════════════════════════ */
function LiveMarketPanel() {
  const [instruments, setInstruments] = useState<Instrument[]>(INSTRUMENTS);
  const [active, setActive]           = useState(0);
  const [status, setStatus]           = useState<'loading' | 'live' | 'error'>('loading');
  const wsRef    = useRef<WebSocket | null>(null);
  const sparks   = useRef<Record<string, number[]>>({});
  const mounted  = useRef(true);

  /* ── Update helper ── */
  const update = useCallback((id: string, price: number, change: number | null) => {
    if (!mounted.current) return;
    // Build sparkline
    if (!sparks.current[id]) sparks.current[id] = [];
    sparks.current[id].push(price);
    if (sparks.current[id].length > 24) sparks.current[id].shift();

    setInstruments(prev => prev.map(inst =>
      inst.id !== id ? inst : {
        ...inst,
        price,
        change: change ?? inst.change,
        spark:  [...sparks.current[id]],
      }
    ));
  }, []);

  /* ── BYBIT WebSocket — crypto pairs ── */
  useEffect(() => {
    mounted.current = true;
    let pingInterval: ReturnType<typeof setInterval>;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      const ws = new WebSocket('wss://stream.bybit.com/v5/public/spot');
      wsRef.current = ws;

      ws.onopen = () => {
        // Subscribe to all crypto tickers
        const cryptoSymbols = INSTRUMENTS
          .filter(i => i.type === 'crypto')
          .map(i => `tickers.${i.bybit}`);

        ws.send(JSON.stringify({
          op:   'subscribe',
          args: cryptoSymbols,
        }));

        // Bybit requires ping every 20s
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 'ping' }));
          }
        }, 20000);

        if (mounted.current) setStatus('live');
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          // Ignore pong and subscription confirmations
          if (msg.op === 'pong' || msg.op === 'subscribe') return;
          if (!msg.data || !msg.topic) return;

          const d = msg.data;
          const bybitSym = msg.topic.replace('tickers.', '');
          const inst = INSTRUMENTS.find(i => i.bybit === bybitSym);
          if (!inst) return;

          const price  = parseFloat(d.lastPrice);
          const change = parseFloat(d.price24hPcnt) * 100;
          if (isNaN(price)) return;

          update(inst.id, price, change);
          if (mounted.current) setStatus('live');
        } catch { /* ignore parse errors */ }
      };

      ws.onerror = () => {
        if (mounted.current) setStatus('error');
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        // Auto-reconnect after 3s
        if (mounted.current) {
          setStatus('error');
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      mounted.current = false;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, [update]);


  /* ── BACKEND WebSocket — forex + gold + crypto sync ── */
  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connectBackend() {
      const ws = new WebSocket(
        import.meta.env.PROD
          ? `wss://${window.location.host}`
          : `ws://localhost:3100`
      );

      ws.onopen = () => {
        console.log('[WS] Backend connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // crypto (optional override)
          if (data.btc) update('btc', data.btc.price, data.btc.change);
          if (data.eth) update('eth', data.eth.price, data.eth.change);
          if (data.sol) update('sol', data.sol.price, data.sol.change);
          if (data.xrp) update('xrp', data.xrp.price, data.xrp.change);

          // forex
          if (data.gbpusd) update('gbpusd', data.gbpusd.price, null);
          if (data.eurusd) update('eurusd', data.eurusd.price, null);
          if (data.usdjpy) update('usdjpy', data.usdjpy.price, null);

          // gold
          if (data.xau) update('xau', data.xau.price, null);

        } catch (err) {
          console.error('[WS] Parse error', err);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectBackend, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connectBackend();

    return () => {
      clearTimeout(reconnectTimeout);
    };
  }, [update]);

  const selected = instruments[active];
  const up = (selected.change ?? 0) >= 0;

  return (
    <motion.div
      className="lmp-wrap"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
    >
      {/* Header */}
      <div className="lmp-header">
        <div className="lmp-header-left">
          <span className={`lmp-dot lmp-dot--${status}`} />
          <span className="lmp-header-label">
            {status === 'loading' ? 'Connecting…'
            : status === 'error'   ? 'Reconnecting…'
            : 'Live Markets'}
          </span>
        </div>
        <span className="lmp-badge">Bybit · ER-API</span>
      </div>

      {/* Hero price — selected instrument */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="lmp-hero"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          <div className="lmp-hero-top">
            <span className="lmp-hero-sym">{selected.sym}</span>
            <span className="lmp-hero-label">{selected.label}</span>
            <span className={`lmp-hero-type lmp-hero-type--${selected.type}`}>
              {selected.type === 'gold' ? 'Metal' : selected.type === 'forex' ? 'Forex' : 'Crypto'}
            </span>
          </div>
          <div className="lmp-hero-bottom">
            <span className="lmp-hero-price">
              {selected.price !== null
                ? fmt(selected.price, selected.id)
                : <span className="lmp-loading-bar" />}
            </span>
            {selected.change !== null && (
              <span className={`lmp-hero-chg ${selected.change >= 0 ? 'lmp-up' : 'lmp-dn'}`}>
                {selected.change >= 0 ? '▲' : '▼'} {Math.abs(selected.change).toFixed(2)}%
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Divider */}
      <div className="lmp-divider" />

      {/* Instrument rows */}
      <div className="lmp-rows">
        {instruments.map((inst, i) => {
          const iup = (inst.change ?? 0) >= 0;
          const isActive = i === active;
          return (
            <button
              key={inst.id}
              className={`lmp-row ${isActive ? 'lmp-row--active' : ''}`}
              onClick={() => setActive(i)}
            >
              <div className="lmp-row-info">
                <span className="lmp-row-sym">{inst.sym}</span>
                <span className="lmp-row-name">{inst.label}</span>
              </div>

              <Sparkline data={inst.spark} up={iup} />

              <div className="lmp-row-nums">
                <span className="lmp-row-price">
                  {inst.price !== null ? fmt(inst.price, inst.id) : '—'}
                </span>
                {inst.change !== null ? (
                  <span className={`lmp-row-chg ${iup ? 'lmp-up' : 'lmp-dn'}`}>
                    {iup ? '+' : ''}{inst.change.toFixed(2)}%
                  </span>
                ) : (
                  <span className="lmp-row-chg lmp-muted">—</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="lmp-footer">
        <span className="lmp-footer-text">
          Crypto · Bybit &nbsp;|&nbsp; Forex &amp; Gold · ER-API
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

          {/* RIGHT — live market panel */}
          <LiveMarketPanel />

        </div>
      </div>
    </section>
  );
}