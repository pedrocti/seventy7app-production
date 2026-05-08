// client/src/dashboard/MentorshipPage.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';

interface Event {
  id: number; title: string; description: string;
  date: string; time: string; venue: string; link: string; price: string;
}

export default function MentorshipPage() {
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
    if (amount > 0 && !confirm(`Pay $${amount} from your balance?`)) return;

    try {
      const r = await fetch(`/api/mentorship/buy/${eventId}`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      });
      const d = await r.json();
      if (r.ok && d.success) {
        toast.success(d.message || (amount === 0 ? 'Access granted' : 'Payment successful'));
        setPurchased(p => p.includes(eventId) ? p : [...p, eventId]);
      } else {
        toast.error(d.error || 'Payment failed');
      }
    } catch { toast.error('Network error'); }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
      Loading events…
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>

      {/* Header */}
      <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'24px' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted-2)', display:'block', marginBottom:10 }}>
          Mentorship Programme
        </span>
        <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:300, color:'var(--text)', marginBottom:8 }}>
          Exclusive <em>Events & Sessions</em>
        </div>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:300, color:'var(--muted)', lineHeight:1.7 }}>
          Live, interactive mentorship sessions with industry professionals — career-accelerating and market-focused.
        </p>
      </div>

      {/* Events */}
      {events.length === 0 ? (
        <div style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'64px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)' }}>
          No events scheduled — new sessions added regularly
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
          {events.map((ev, i) => {
            const isBought = purchased.includes(ev.id);
            const isFree   = ev.price === '0.00';
            return (
              <motion.div key={ev.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06, duration:0.5 }}
                style={{ background:'var(--surface)', border:'1px solid rgba(10,239,255,0.08)', padding:'24px', display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'start' }}>

                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(16px,1.8vw,22px)', fontWeight:300, color:'var(--text)', marginBottom:12 }}>
                    {ev.title}
                  </div>

                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 24px', marginBottom:12 }}>
                    {[
                      { icon: Calendar, value: new Date(ev.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) },
                      { icon: Clock,    value: ev.time },
                      { icon: MapPin,   value: ev.venue },
                    ].map(({ icon: Icon, value }) => (
                      <div key={value} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <Icon size={12} style={{ color:'var(--cyan)', flexShrink:0 }}/>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--muted)' }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {ev.description && (
                    <p style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--muted)', lineHeight:1.7 }}>{ev.description}</p>
                  )}
                </div>

                <div style={{ textAlign:'center', flexShrink:0 }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(20px,2.5vw,32px)', fontWeight:300, color: isFree ? 'var(--green)' : 'var(--cyan)', marginBottom:14 }}>
                    {isFree ? 'FREE' : `$${ev.price}`}
                  </div>

                  {isBought ? (
                    <a href={ev.link} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', background:'rgba(14,203,129,0.08)', border:'1px solid rgba(14,203,129,0.25)', color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', transition:'all 0.2s' }}>
                      Join Session <ExternalLink size={11}/>
                    </a>
                  ) : (
                    <button onClick={() => buyEvent(ev.id, ev.price)}
                      className="btn-primary"
                      style={{ cursor:'pointer' }}>
                      {isFree ? 'Get Access' : 'Purchase'}
                    </button>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}