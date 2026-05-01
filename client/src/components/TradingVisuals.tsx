// ─── TradingVisuals.tsx ──────────────────────────────────────────────────────
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import strategyImage from '../assets/stock.webp';
import protectionImage from '../assets/stock2.webp';

const concepts = [
  'Support & Resistance','Price Action','Trend Analysis','Breakouts',
  'Risk Management','Market Structure','Technical Analysis','Liquidity Zones',
  'Order Blocks','Smart Money Concepts',
];

const testimonials = [
  { quote:'"The mentorship programme completely changed how I approach the markets. The focus on structure and risk management gave me clarity I never had before."', role:'Private Member' },
  { quote:'"What impressed me most is the professionalism and consistency of the strategy. It is not hype — it is a structured trading framework."', role:'Institutional Programme Student' },
  { quote:'"The education and community support helped me build confidence and discipline. I finally understand how professional traders actually analyse the market."', role:'Mentorship Client' },
];

export default function TradingVisuals() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold:0.08, triggerOnce:true });

  useEffect(() => { if(inView) controls.start('visible'); },[controls,inView]);

  const cv = { hidden:{opacity:0}, visible:{opacity:1,transition:{staggerChildren:0.1,delayChildren:0.1}} };
  const iv = { hidden:{opacity:0,y:20}, visible:{opacity:1,y:0,transition:{duration:0.7,ease:[0.22,1,0.36,1]}} };

  return (
    <section ref={ref} style={{ background:'#06080F', borderTop:'1px solid rgba(201,168,76,0.18)' }}>
      {/* Section header */}
      <div style={{ padding:'100px 60px 64px', display:'flex', alignItems:'flex-end', justifyContent:'space-between', borderBottom:'1px solid rgba(201,168,76,0.18)' }} className="max-lg:px-6 max-lg:py-16">
        <div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'#C9A84C', marginBottom:20 }}>Trading Education</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(38px,5vw,58px)', fontWeight:300, lineHeight:1.05, letterSpacing:'-0.012em', color:'#F0EDE6' }}>
            Professional<br/><em style={{fontStyle:'italic',color:'#C9A84C'}}>Education & Strategy</em>
          </div>
        </div>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:300, lineHeight:1.9, color:'rgba(240,237,230,0.38)', maxWidth:340 }} className="max-lg:hidden">
          Disciplined trading education, institutional market concepts, and structured risk management — designed for long-term consistency.
        </p>
      </div>

      <motion.div variants={cv} initial="hidden" animate={controls}>

        {/* Two image + text cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(201,168,76,0.12)', borderBottom:'1px solid rgba(201,168,76,0.18)' }} className="max-lg:grid-cols-1">
          {[
            { img:strategyImage, alt:'Strategic Market Analysis', title:'Strategic Market Analysis', body:'At 77Kapital we focus on disciplined market analysis built on proven institutional trading concepts. Our approach combines market structure, liquidity analysis and risk management to identify high-probability opportunities across global markets.', sub:'Rather than chasing short-term signals, our strategy prioritises structured decision-making, capital preservation and long-term consistency.' },
            { img:protectionImage, alt:'Capital Protection', title:'Capital Protection & Risk Management', body:'Professional trading is not only about identifying profitable opportunities — it is equally about protecting capital during uncertain market conditions. Our framework emphasises strict risk control, position sizing and disciplined execution.', sub:'By maintaining structured risk parameters and strategic trade management, we ensure stability and long-term performance regardless of market direction.' },
          ].map((card, i) => (
            <motion.div key={i} variants={iv} style={{ background:'#06080F', overflow:'hidden', position:'relative' }}
              whileHover={{ background:'#0A0D18' }} transition={{ duration:0.25 }}>
              <motion.div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'#C9A84C', scaleX:0, originX:0 }} whileHover={{ scaleX:1 }} transition={{ duration:0.5 }}/>
              <div style={{ height:240, overflow:'hidden', background:'#060A14' }}>
                <img src={card.img} alt={card.alt} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.6s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform='scale(1.04)')}
                  onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}/>
              </div>
              <div style={{ padding:'36px 40px' }}>
                <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:400, color:'#F0EDE6', marginBottom:14, lineHeight:1.25 }}>{card.title}</div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:300, lineHeight:1.9, color:'rgba(240,237,230,0.45)', marginBottom:12 }}>{card.body}</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:300, lineHeight:1.9, color:'rgba(240,237,230,0.28)' }}>{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div style={{ borderBottom:'1px solid rgba(201,168,76,0.18)' }}>
          <div style={{ padding:'16px 60px 0', borderBottom:'1px solid rgba(201,168,76,0.1)' }} className="max-lg:px-6">
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(240,237,230,0.25)', paddingBottom:16 }}>Member Testimonials</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(201,168,76,0.1)' }} className="max-lg:grid-cols-1">
            {testimonials.map((t,i) => (
              <motion.div key={i} variants={iv} style={{ background:'#06080F', padding:'44px 40px' }}>
                <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:52, fontWeight:300, color:'rgba(201,168,76,0.12)', lineHeight:1, marginBottom:16, userSelect:'none' }}>"</div>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:17, fontWeight:300, fontStyle:'italic', lineHeight:1.75, color:'rgba(240,237,230,0.6)', marginBottom:24 }}>{t.quote}</p>
                <div style={{ height:1, background:'rgba(201,168,76,0.1)', marginBottom:16 }}/>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'#C9A84C' }}>{t.role}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Concepts */}
        <motion.div variants={iv} style={{ padding:'52px 60px', borderBottom:'1px solid rgba(201,168,76,0.18)' }} className="max-lg:px-6">
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(240,237,230,0.22)', marginBottom:32 }}>Trading Concepts We Master</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {concepts.map((c,i) => (
              <motion.span key={c}
                style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:'0.1em', color:'rgba(240,237,230,0.32)', border:'1px solid rgba(201,168,76,0.12)', padding:'8px 18px', display:'inline-block' }}
                animate={{ opacity:[0.4,1,0.4], borderColor:['rgba(201,168,76,0.12)','rgba(201,168,76,0.38)','rgba(201,168,76,0.12)'], color:['rgba(240,237,230,0.32)','#C9A84C','rgba(240,237,230,0.32)'] }}
                transition={{ duration:5, repeat:Infinity, delay:i * 0.35, ease:'easeInOut' }}>
                {c}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── MarketImpactVisual.tsx ───────────────────────────────────────────────────
import { useState } from 'react';

const insights = [
  { n:'01', title:'Market Structure', body:'We identify higher highs and lower lows to determine trend direction before placing any trade. Structure first, entry second.' },
  { n:'02', title:'Smart Money Concepts', body:'Our strategies follow the footprints of institutional traders through order blocks, fair value gaps, and liquidity grabs.' },
  { n:'03', title:'Risk Management', body:'Capital preservation is paramount. We only risk 1–2% per trade with predefined stop losses and structured position sizing.' },
  { n:'04', title:'Psychological Edge', body:'Trading psychology separates consistent winners from the rest. We teach emotional control, patience, and disciplined consistency.' },
];

const statsConfig = [
  { label:'Markets Analysed', target:85,  suffix:'+' },
  { label:'Strategies Studied', target:120, suffix:'+' },
  { label:'Scenarios Reviewed', target:450, suffix:'+' },
  { label:'Insights Published', target:320, suffix:'+' },
];

export function MarketImpactVisual() {
  const [ref2, inView2] = useInView({ threshold:0.1, triggerOnce:true });
  const [stats, setStats] = useState({ 0:0, 1:0, 2:0, 3:0 } as Record<number,number>);

  useEffect(() => {
    if(!inView2) return;
    const steps = [2, 3, 10, 8];
    const timer = setInterval(() => {
      setStats(prev => {
        const next = { ...prev };
        let done = true;
        statsConfig.forEach((s,i) => {
          if(next[i] < s.target) { next[i] = Math.min(s.target, next[i] + steps[i]); done = false; }
        });
        if(done) clearInterval(timer);
        return next;
      });
    }, 28);
    return () => clearInterval(timer);
  }, [inView2]);

  useEffect(() => {
    const id = 'tv-ticker-s';
    if(!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id; s.src = 'https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js';
      s.type = 'module'; s.async = true; document.body.appendChild(s);
    }
  }, []);

  return (
    <section ref={ref2} style={{ background:'#06080F', borderTop:'1px solid rgba(201,168,76,0.18)' }}>
      {/* Header */}
      <div style={{ padding:'100px 60px 64px', display:'flex', alignItems:'flex-end', justifyContent:'space-between', borderBottom:'1px solid rgba(201,168,76,0.18)' }} className="max-lg:px-6 max-lg:py-16">
        <div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'#C9A84C', marginBottom:20 }}>Market Intelligence</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(38px,5vw,58px)', fontWeight:300, lineHeight:1.05, letterSpacing:'-0.012em', color:'#F0EDE6' }}>
            Intelligence &<br/><em style={{fontStyle:'italic',color:'#C9A84C'}}>Insights</em>
          </div>
        </div>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:300, lineHeight:1.9, color:'rgba(240,237,230,0.38)', maxWidth:340 }} className="max-lg:hidden">
          Technical analysis, macro awareness, and market psychology — combined to help individuals understand financial market dynamics.
        </p>
      </div>

      {/* TradingView ticker */}
      <div style={{ padding:'24px 60px', borderBottom:'1px solid rgba(201,168,76,0.1)', background:'#0A0D18' }} className="max-lg:px-4">
        <div dangerouslySetInnerHTML={{ __html:`<tv-ticker-tape symbols="FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD"></tv-ticker-tape>` }}/>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'rgba(201,168,76,0.12)', borderBottom:'1px solid rgba(201,168,76,0.18)' }} className="max-sm:grid-cols-2">
        {statsConfig.map((s,i) => (
          <div key={i} style={{ background:'#06080F', padding:'48px 40px', textAlign:'center' }}>
            <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:56, fontWeight:300, lineHeight:1, color:'#F0EDE6', marginBottom:10 }}>
              {stats[i]}<span style={{ fontSize:32, color:'#C9A84C' }}>{s.suffix}</span>
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(240,237,230,0.3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Knowledge cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:1, background:'rgba(201,168,76,0.12)' }} className="max-lg:grid-cols-1">
        {insights.map((item,i) => (
          <motion.div key={i}
            style={{ background:'#06080F', padding:'44px 48px', position:'relative', overflow:'hidden' }}
            whileHover={{ background:'#0A0D18' }} transition={{ duration:0.25 }}>
            <motion.div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'#C9A84C', scaleX:0, originX:0 }} whileHover={{ scaleX:1 }} transition={{ duration:0.4 }}/>
            <div style={{ display:'flex', alignItems:'flex-start', gap:24 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:48, fontWeight:300, color:'rgba(201,168,76,0.1)', lineHeight:1, flexShrink:0, userSelect:'none' }}>{item.n}</div>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:400, color:'#F0EDE6', marginBottom:12, lineHeight:1.2 }}>{item.title}</div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:300, lineHeight:1.9, color:'rgba(240,237,230,0.42)' }}>{item.body}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}