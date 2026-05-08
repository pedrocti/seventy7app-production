// client/src/components/Sidebar.tsx
import { Activity, PieChart, BarChart3, User, ClipboardList, LogOut, ChevronRight, CreditCard } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  active:    string;
  onNavigate:(key: string) => void;
}

const NAV = [
  { key:'overview',    label:'Overview',    icon: Activity     },
  { key:'invest',      label:'Staking',     icon: BarChart3    },
  { key:'portfolio',   label:'Portfolio',   icon: PieChart     },
  { key:'trades',      label:'Trades',      icon: BarChart3    },
  { key:'mentorship',  label:'Mentorship',  icon: User         },
  { key:'learning',    label:'Learning',    icon: ClipboardList},
  { key:'loan', label:'Loans', icon: CreditCard },
];

export default function Sidebar({ collapsed, active, onNavigate }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <>
      {!collapsed && (
        <div style={{ position:'fixed', inset:0, zIndex:39, background:'rgba(11,17,32,0.7)' }}
          onClick={() => onNavigate('toggle')} />
      )}

      <aside style={{
        position:'fixed', top:0, left:0, height:'100vh',
        width: collapsed ? 64 : 240,
        background:'var(--surface)',
        borderRight:'1px solid rgba(10,239,255,0.10)',
        display:'flex', flexDirection:'column',
        transition:'width 0.25s ease',
        zIndex:40, flexShrink:0, overflowX:'hidden',
      }}>

        {/* Brand */}
        <div style={{
          height:64, display:'flex', alignItems:'center',
          padding: collapsed ? '0 20px' : '0 24px',
          borderBottom:'1px solid rgba(10,239,255,0.08)',
          flexShrink:0, gap:10, overflow:'hidden', whiteSpace:'nowrap',
        }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--cyan)', flexShrink:0 }}/>
          {!collapsed && (
            <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:300, color:'var(--text)', letterSpacing:'-0.01em' }}>
              <span style={{ color:'var(--cyan)' }}>77</span>Kapital
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'16px 0', overflowY:'auto', overflowX:'hidden' }}>
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button key={item.key} onClick={() => onNavigate(item.key)}
                title={collapsed ? item.label : undefined}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:12,
                  padding: collapsed ? '12px 20px' : '12px 24px',
                  background: isActive ? 'rgba(10,239,255,0.06)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? 'var(--cyan)' : 'transparent'}`,
                  borderTop:'none', borderRight:'none', borderBottom:'none',
                  cursor:'pointer', transition:'all 0.18s ease',
                  whiteSpace:'nowrap', overflow:'hidden',
                }}
                onMouseEnter={e => { if(!isActive)(e.currentTarget as HTMLElement).style.background='rgba(10,239,255,0.03)'; }}
                onMouseLeave={e => { if(!isActive)(e.currentTarget as HTMLElement).style.background='transparent'; }}
              >
                <Icon size={15} style={{ color: isActive ? 'var(--cyan)' : 'var(--muted)', flexShrink:0 }}/>
                {!collapsed && (
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color: isActive ? 'var(--cyan)' : 'var(--muted)' }}>
                    {item.label}
                  </span>
                )}
                {!collapsed && isActive && (
                  <ChevronRight size={11} style={{ color:'var(--cyan)', marginLeft:'auto', flexShrink:0 }}/>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding:'16px 0', borderTop:'1px solid rgba(10,239,255,0.08)', flexShrink:0 }}>
          <button onClick={logout}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:12,
              padding: collapsed ? '12px 20px' : '12px 24px',
              background:'transparent', border:'none', cursor:'pointer',
              whiteSpace:'nowrap', overflow:'hidden', transition:'all 0.18s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(246,70,93,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; }}
          >
            <LogOut size={15} style={{ color:'var(--red)', flexShrink:0 }}/>
            {!collapsed && (
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--red)' }}>Sign Out</span>
            )}
          </button>
        </div>

      </aside>
    </>
  );
}