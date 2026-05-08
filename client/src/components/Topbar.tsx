// client/src/components/Topbar.tsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { apiRequest } from '@/api/http';

interface TopbarProps {
  active:          string;
  onCollapse:      () => void;
  onProfileClick?: () => void;
}

const PAGE_LABELS: Record<string, string> = {
  overview:   'Overview',
  invest:     'Staking',
  portfolio:  'Portfolio',
  trades:     'Trades & PnL',
  mentorship: 'Mentorship',
  learning:   'Learning',
};

export default function Topbar({ active, onCollapse, onProfileClick }: TopbarProps) {
  const { logout, user, token } = useAuth();
  const [showNotif,   setShowNotif]   = useState(false);
  const [notifs,      setNotifs]      = useState<any[]>([]);
  const [unread,      setUnread]      = useState(0);
  const [dropPos,     setDropPos]     = useState({ top:0, left:0 });
  const bellRef  = useRef<HTMLButtonElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);

  async function fetchNotifs() {
    if (!token) return;
    try {
      const r = await apiRequest('/user/notifications', { headers:{ Authorization:`Bearer ${token}` } });
      if (r?.success) {
        const list = r.notifications || [];
        setNotifs(list);
        setUnread(list.filter((n:any) => !n.read).length);
      }
    } catch {}
  }

  useEffect(() => { fetchNotifs(); }, [token]);

  useEffect(() => {
    if (!showNotif) return;
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [showNotif]);

  async function markRead(id: string) {
    try {
      await apiRequest(`/user/notifications/read/${id}`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } });
      setNotifs(p => p.map(n => n.id===id ? { ...n, read:true } : n));
      setUnread(c => Math.max(c-1, 0));
    } catch {}
  }

  function toggleNotif() {
    if (bellRef.current) {
      const r = bellRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 8, left: r.right - 300 });
    }
    setShowNotif(p => !p);
  }

  const initial = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <header style={{
      height: 64, flexShrink:0,
      display:'flex', alignItems:'center',
      justifyContent:'space-between',
      padding:'0 24px',
      background:'var(--surface)',
      borderBottom:'1px solid rgba(10,239,255,0.08)',
      position:'sticky', top:0, zIndex:30,
    }}>

      {/* Left */}
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        {/* Hamburger */}
        <button onClick={onCollapse} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', display:'flex', alignItems:'center' }}>
          <Menu size={18} />
        </button>

        {/* Page label */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)', letterSpacing:'-0.01em' }}>
            {PAGE_LABELS[active] || active}
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--cyan)', background:'rgba(10,239,255,0.06)', border:'1px solid rgba(10,239,255,0.15)', padding:'3px 8px' }}>
            Live
          </span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>

        {/* Bell */}
        <button ref={bellRef} onClick={toggleNotif}
          style={{ position:'relative', background:'none', border:'1px solid rgba(10,239,255,0.12)', cursor:'pointer', color:'var(--muted)', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(10,239,255,0.35)'; (e.currentTarget as HTMLElement).style.color='var(--cyan)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(10,239,255,0.12)'; (e.currentTarget as HTMLElement).style.color='var(--muted)'; }}>
          <Bell size={15}/>
          {unread > 0 && (
            <span style={{ position:'absolute', top:6, right:6, width:6, height:6, borderRadius:'50%', background:'var(--red)' }}/>
          )}
        </button>

        {/* Profile */}
        <button onClick={onProfileClick}
          style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, var(--cyan), var(--purple))', border:'none', cursor:'pointer', flexShrink:0 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:500, color:'var(--bg)' }}>{initial}</span>
        </button>

        {/* Sign out — desktop */}
        <button onClick={logout}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', background:'transparent', border:'1px solid rgba(246,70,93,0.2)', cursor:'pointer', color:'var(--red)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(246,70,93,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; }}>
          <LogOut size={13}/> Sign Out
        </button>

      </div>

      {/* Notification dropdown */}
      {showNotif && createPortal(
        <div ref={dropRef} style={{
          position:'fixed', top:dropPos.top, left:dropPos.left,
          width:300, background:'var(--surface)',
          border:'1px solid rgba(10,239,255,0.14)',
          zIndex:999999, boxShadow:'0 16px 48px rgba(0,0,0,0.4)',
        }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(10,239,255,0.08)', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--cyan)' }}>
            Notifications {unread > 0 && `(${unread})`}
          </div>
          <div style={{ maxHeight:280, overflowY:'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding:20, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>No new notifications</div>
            ) : notifs.map(n => (
              <div key={n.id} style={{ padding:'12px 16px', borderBottom:'1px solid rgba(10,239,255,0.06)', background: !n.read ? 'rgba(10,239,255,0.03)' : 'transparent' }}>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--text)', marginBottom:6 }}>{n.message}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--muted-2)', letterSpacing:'0.08em' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)}
                      style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 8px', background:'rgba(10,239,255,0.08)', border:'1px solid rgba(10,239,255,0.2)', color:'var(--cyan)', cursor:'pointer' }}>
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

    </header>
  );
}