// client/src/pages/Learning/ProgramsList.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { LearningAPI } from '@/api/learning';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle2, ArrowRight, Lock } from 'lucide-react';

interface Program {
  id: number; title: string; description: string | null;
  price: string; duration_days: number; thumbnail_url?: string | null;
}
interface Props { onSelect: (programId: number) => void; }

const FALLBACK = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';

export default function ProgramsList({ onSelect }: Props) {
  const { token } = useAuth();
  const isMobile  = useMobile();
  const [programs,  setPrograms]  = useState<Program[]>([]);
  const [purchased, setPurchased] = useState<number[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [buyingId,  setBuyingId]  = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    LearningAPI.getPrograms(token)
      .then(d => {
        if (d.success) { setPrograms(d.programs || []); setPurchased(d.purchased || []); }
        else toast.error(d.error || 'Failed to load programmes');
      })
      .catch(() => toast.error('Network error'))
      .finally(() => setLoading(false));
  }, [token]);

  async function accessOrBuy(p: Program) {
    if (!token) return;
    const isOwned = purchased.includes(p.id);
    if (isOwned || Number(p.price) === 0) { onSelect(p.id); return; }
    setBuyingId(p.id);
    try {
      const d = await LearningAPI.buyProgram(p.id, token);
      if (d.success) { toast.success('Payment successful!'); setPurchased(prev => [...prev, p.id]); onSelect(p.id); }
      else toast.error(d.error || 'Payment failed');
    } catch { toast.error('Network error'); }
    finally { setBuyingId(null); }
  }

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:300, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted-2)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
      Loading programmes...
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:1 }}>

      <div style={{ background:"var(--surface)", borderBottom:"1px solid rgba(10,239,255,0.08)", padding: isMobile ? "28px 20px" : "48px 48px 40px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:320, height:320, background:"radial-gradient(circle, rgba(10,239,255,0.04) 0%, transparent 70%)", pointerEvents:"none" }} />
        <span style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--cyan)", background:"rgba(10,239,255,0.06)", border:"1px solid rgba(10,239,255,0.15)", padding:"3px 10px", display:"inline-block", marginBottom:16 }}>Learning Hub</span>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,4vw,48px)", fontWeight:300, color:"var(--text)", lineHeight:1.1, margin:"0 0 14px" }}>
          Elevate Your <em style={{ color:"var(--cyan)" }}>Trading Edge</em>
        </h1>
        <p style={{ fontFamily:"var(--font-sans)", fontSize:14, fontWeight:300, color:"var(--s7-muted)", lineHeight:1.75, maxWidth:540, margin:0 }}>
          Expert-led programmes in trading strategy, risk management and market analysis — built for serious investors at every level.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:"rgba(10,239,255,0.06)" }}>
        {[
          { label:"Programmes", value: String(programs.length) },
          { label:"Enrolled",   value: String(purchased.length) },
          { label:"Format",     value:"Self-paced" },
        ].map((item,i) => (
          <div key={i} style={{ background:"var(--surface)", padding: isMobile ? "14px 16px" : "18px 24px" }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--muted-2)", marginBottom:6 }}>{item.label}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:"clamp(18px,2vw,26px)", fontWeight:300, color:"var(--text)" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {programs.length === 0 ? (
        <div style={{ background:"var(--surface)", padding:"80px 24px", textAlign:"center" }}>
          <BookOpen size={40} style={{ color:"var(--muted-2)", display:"block", margin:"0 auto 16px", opacity:0.3 }} />
          <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-2)" }}>No programmes available yet</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(320px,1fr))", gap:1, background:"rgba(10,239,255,0.06)" }}>
          {programs.map((p, idx) => {
            const isFree   = Number(p.price) === 0;
            const isOwned  = purchased.includes(p.id);
            const isBuying = buyingId === p.id;
            const img      = p.thumbnail_url || FALLBACK;
            return (
              <motion.div key={p.id}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: idx * 0.07, duration:0.45 }}
                style={{ background:"var(--surface)", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>

                {isOwned && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg, var(--cyan), var(--purple))", zIndex:2 }} />}

                <div style={{ position:"relative", width:"100%", height:200, overflow:"hidden", flexShrink:0 }}>
                  <img src={img} alt={p.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"transform 0.5s ease" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform="scale(1.04)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform="scale(1)")} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(11,17,32,0.75) 0%, transparent 55%)" }} />
                  <div style={{ position:"absolute", top:12, right:12, fontFamily:"var(--font-display)", fontSize:18, fontWeight:300, color: isFree ? "var(--green)" : "var(--cyan)", background:"rgba(11,17,32,0.88)", border:`1px solid ${isFree ? "rgba(14,203,129,0.3)" : "rgba(10,239,255,0.25)"}`, padding:"4px 10px", lineHeight:1 }}>
                    {isFree ? "FREE" : `$${p.price}`}
                  </div>
                  <div style={{ position:"absolute", top:12, left:12 }}>
                    {isOwned ? (
                      <span style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--green)", background:"rgba(14,203,129,0.12)", border:"1px solid rgba(14,203,129,0.25)", padding:"3px 8px" }}>
                        <CheckCircle2 size={9} />
                        {"Enrolled"}
                      </span>
                    ) : !isFree ? (
                      <span style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted-2)", background:"rgba(11,17,32,0.7)", border:"1px solid rgba(240,237,230,0.1)", padding:"3px 8px" }}>
                        <Lock size={9} />
                        {"Premium"}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div style={{ padding: isMobile ? "20px 18px" : "24px", flex:1, display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", color:"var(--muted-2)" }}>
                    <Clock size={11} />
                    {`${p.duration_days} days access`}
                  </div>
                  <h3 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(18px,1.8vw,22px)", fontWeight:300, color:"var(--text)", lineHeight:1.25, margin:0 }}>
                    {p.title}
                  </h3>
                  {p.description && (
                    <p style={{ fontFamily:"var(--font-sans)", fontSize:13, fontWeight:300, color:"var(--s7-muted)", lineHeight:1.75, margin:0 }}>
                      {p.description.length > 140 ? p.description.slice(0,140) + "..." : p.description}
                    </p>
                  )}
                  <button onClick={() => onSelect(p.id)}
                    style={{ display:"inline-flex", alignItems:"center", gap:6, background:"none", border:"none", color:"var(--cyan)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", padding:0, alignSelf:"flex-start", marginTop:"auto" }}>
                    {"View Details"} <ArrowRight size={11} />
                  </button>
                </div>

                <div style={{ padding: isMobile ? "14px 18px" : "16px 24px", borderTop:"1px solid rgba(10,239,255,0.07)" }}>
                  <button onClick={() => accessOrBuy(p)} disabled={isBuying} className="btn-primary"
                    style={{ width:"100%", justifyContent:"center", cursor: isBuying ? "not-allowed" : "pointer", opacity: isBuying ? 0.6 : 1 }}>
                    {isBuying ? "Processing..." : isOwned || isFree ? "Access Programme" : "Buy & Access"}
                    <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
