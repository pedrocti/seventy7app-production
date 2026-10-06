// client/src/dashboard/MentorshipPage.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, ExternalLink, CheckCircle2, Users } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';

interface Event {
  id: number; title: string; description: string;
  date: string; time: string; venue: string; link: string; price: string;
}

function DateBadge({ dateStr }: { dateStr: string }) {
  const d = new Date(dateStr);
  const day   = d.toLocaleDateString('en-GB', { day:   '2-digit' });
  const month = d.toLocaleDateString('en-GB', { month: 'short'   }).toUpperCase();
  const year  = d.toLocaleDateString('en-GB', { year:  'numeric' });
  return (
    <div style={{ width:56, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', background:'rgba(10,239,255,0.06)', border:'1px solid rgba(10,239,255,0.15)', padding:'8px 4px' }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', color:'var(--cyan)', textTransform:'uppercase' }}>{month}</span>
      <span style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:300, color:'var(--text)', lineHeight:1 }}>{day}</span>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--muted-2)' }}>{year}</span>
    </div>
  );
}

export default function MentorshipPage() {
  const isMobile = useMobile();
  const [events,    setEvents]    = useState<Event[]>([]);
  const [purchased, setPurchased] = useState<number[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/mentorship/events', { headers: token ? { Authorization:`Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(d => { if (d.success) { setEvents(d.events || []); setPurchased(d.purchased || []); } })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  async function buyEvent(eventId: number, price: string) {
    const amount = Number(price);
    const token  = localStorage.getItem('token');
    if (!token) { toast.error('Please log in'); return; }
    if (amount > 0 && !confirm(`Pay $${amount} from your balance to access this session?`)) return;
    try {
      const r = await fetch(`/api/mentorship/buy/${eventId}`, {
        method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      });
      const d = await r.json();
      if (r.ok && d.success) {
        toast.success(d.message || (amount === 0 ? 'Access granted' : 'Payment successful'));
        setPurchased(p => p.includes(eventId) ? p : [...p, eventId]);
      } else { toast.error(d.error || 'Payment failed'); }
    } catch { toast.error('Network error'); }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
      Loading events...
    </div>
  );

  const upcoming = events.filter(e => new Date(e.date) >= new Date(new Date().toDateString()));
  const past     = events.filter(e => new Date(e.date) <  new Date(new Date().toDateString()));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>

      <div style={{ background:'var(--surface)', borderBottom:'1px solid rgba(10,239,255,0.08)', padding: isMobile ? '24px 20px' : '36px 40px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, background:'radial-gradient(circle, rgba(10,239,255,0.04) 0%, transparent 70%)', pointerEvents:'none' }} />
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--cyan)', background:'rgba(10,239,255,0.06)', border:'1px solid rgba(10,239,255,0.15)', padding:'3px 10px', display:'inline-block', marginBottom:14 }}>
          Mentorship Programme
        </span>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px,3vw,36px)', fontWeight:300, color:'var(--text)', lineHeight:1.1, margin:'0 0 12px' }}>
          Exclusive <em>Events & Sessions</em>
        </h1>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:300, color:'var(--s7-muted)', lineHeight:1.75, maxWidth:520, margin:0 }}>
          Live, interactive mentorship sessions with industry professionals — career-accelerating and market-focused.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(10,239,255,0.06)' }}>
        {[
          { label:'Total Events',    value: String(events.length)     },
          { label:'Upcoming',        value: String(upcoming.length)   },
          { label:'Accessed',        value: String(purchased.length)  },
        ].map((item,i) => (
          <div key={i} style={{ background:'var(--surface)', padding: isMobile ? '14px 16px' : '18px 24px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', marginBottom:6 }}>{item.label}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(20px,2.5vw,30px)', fontWeight:300, color:'var(--text)' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {events.length === 0 ? (
        <div style={{ background:'var(--surface)', padding:'80px 24px', textAlign:'center' }}>
          <Users size={36} style={{ color:'var(--muted-2)', display:'block', margin:'0 auto 16px', opacity:0.3 }} />
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
            No events scheduled — new sessions added regularly
          </div>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
              <div style={{ background:'var(--surface)', padding:'12px 24px', borderBottom:'1px solid rgba(10,239,255,0.07)' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--cyan)' }}>Upcoming Sessions</div>
              </div>
              {upcoming.map((ev, i) => {
                const isBought = purchased.includes(ev.id);
                const isFree   = Number(ev.price) === 0;
                return (
                  <motion.div key={ev.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06, duration:0.45 }}
                    style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.06)', padding: isMobile ? '18px 16px' : '24px', display:'flex', gap: isMobile ? 14 : 20, alignItems:'flex-start', position:'relative' }}>

                    {isBought && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, var(--green), transparent)' }} />}

                    <DateBadge dateStr={ev.date} />

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(15px,1.8vw,20px)', fontWeight:300, color:'var(--text)', marginBottom:10, lineHeight:1.2 }}>
                        {ev.title}
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 20px', marginBottom: ev.description ? 10 : 0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.08em', color:'var(--s7-muted)' }}>
                          <Clock size={11} style={{ color:'var(--cyan)', flexShrink:0 }} /> {ev.time}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:5, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.08em', color:'var(--s7-muted)' }}>
                          <MapPin size={11} style={{ color:'var(--cyan)', flexShrink:0 }} /> {ev.venue}
                        </div>
                      </div>
                      {ev.description && (
                        <p style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--s7-muted)', lineHeight:1.7, margin:0 }}>{ev.description}</p>
                      )}
                    </div>

                    <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10, minWidth: isMobile ? 'auto' : 120 }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(18px,2vw,26px)', fontWeight:300, color: isFree ? 'var(--green)' : 'var(--cyan)', lineHeight:1 }}>
                        {isFree ? 'FREE' : `$${ev.price}`}
                      </div>
                      {isBought ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:5, fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--green)' }}>
                            <CheckCircle2 size={10} /> Registered
                          </div>
                          {ev.link && (
                            <a href={ev.link} target="_blank" rel="noopener noreferrer"
                              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', background:'rgba(14,203,129,0.08)', border:'1px solid rgba(14,203,129,0.25)', color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none' }}>
                              Join <ExternalLink size={10}/>
                            </a>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => buyEvent(ev.id, ev.price)} className="btn-primary" style={{ cursor:'pointer', padding:'9px 16px', fontSize:9 }}>
                          {isFree ? 'Get Access' : 'Purchase'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {past.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
              <div style={{ background:'var(--surface)', padding:'12px 24px', borderBottom:'1px solid rgba(10,239,255,0.05)' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)' }}>Past Sessions</div>
              </div>
              {past.map((ev, i) => {
                const isBought = purchased.includes(ev.id);
                return (
                  <div key={ev.id} style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.04)', padding: isMobile ? '14px 16px' : '18px 24px', display:'flex', gap:14, alignItems:'center', opacity:0.6 }}>
                    <DateBadge dateStr={ev.date} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--s7-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ev.title}</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', marginTop:4 }}>{ev.venue}</div>
                    </div>
                    {isBought && ev.link && (
                      <a href={ev.link} target="_blank" rel="noopener noreferrer"
                        style={{ flexShrink:0, display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', background:'transparent', border:'1px solid rgba(10,239,255,0.1)', color:'var(--muted-2)', fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none' }}>
                        Recording <ExternalLink size={9}/>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
