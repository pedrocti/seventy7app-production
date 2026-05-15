// client/src/components/AdminSidebar.tsx
import { Users, BarChart3, PieChart, Wallet, User, Activity, ClipboardList, Settings, TrendingUp, FileText, CreditCard } from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  active:    string;
  onNavigate: (key: string) => void;
}

const items = [
  { key: "overview",     label: "Overview",         icon: <Activity     size={16} /> },
  { key: "users",        label: "Users",            icon: <Users        size={16} /> },
  { key: "transactions", label: "Transactions",     icon: <BarChart3    size={16} /> },
  { key: "portfolio",    label: "Portfolio",        icon: <PieChart     size={16} /> },
  { key: "invest",       label: "Investments",      icon: <Wallet       size={16} /> },
  { key: "loans",        label: "Lends",            icon: <CreditCard   size={16} /> },
  { key: "mentorship",   label: "Mentorship",       icon: <User         size={16} /> },
  { key: "learning",     label: "Learning",         icon: <ClipboardList size={16} /> },
  { key: "plans",        label: "Plans",            icon: <ClipboardList size={16} /> },
  { key: "trades",       label: "Trades & PnL",     icon: <TrendingUp   size={16} /> },
  { key: "blog",         label: "Blog Posts",       icon: <FileText     size={16} /> },
  { key: "settings",     label: "Deposit Settings", icon: <Settings     size={16} /> },
];

export default function AdminSidebar({ collapsed, active, onNavigate }: SidebarProps) {
  return (
    <aside style={{
      background:    "var(--surface)",
      borderRight:   "1px solid rgba(10,239,255,0.08)",
      padding:       "0",
      transition:    "width 0.3s ease",
      width:         collapsed ? 56 : 220,
      flexShrink:    0,
      display:       "flex",
      flexDirection: "column",
      height:        "100vh",
      position:      "sticky",
      top:           0,
      overflowY:     "auto",
      overflowX:     "hidden",
    }}>

      {/* Brand */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 20px", borderBottom: "1px solid rgba(10,239,255,0.08)", textAlign: collapsed ? "center" : "left", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 300, color: "var(--text)", whiteSpace: "nowrap" }}>
          {collapsed ? <span style={{ color: "var(--cyan)" }}>77</span> : <><span style={{ color: "var(--cyan)" }}>77</span>Kapital</>}
        </span>
        {!collapsed && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(10,239,255,0.35)", marginTop: 3 }}>Admin</div>}
      </div>

      {/* Nav items */}
      <nav style={{ padding: "12px 0", flex: 1 }}>
        {items.map(item => {
          const isActive = active === item.key;
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)}
              style={{
                width:          "100%",
                display:        "flex",
                alignItems:     "center",
                gap:            10,
                padding:        collapsed ? "11px 0" : "10px 20px",
                justifyContent: collapsed ? "center" : "flex-start",
                background:     isActive ? "rgba(10,239,255,0.06)" : "transparent",
                borderLeft:     isActive ? "2px solid var(--cyan)" : "2px solid transparent",
                
                color:          isActive ? "var(--cyan)" : "var(--muted)",
                fontFamily:     "var(--font-mono)",
                fontSize:       9,
                letterSpacing:  "0.1em",
                textTransform:  "uppercase",
                cursor:         "pointer",
                transition:     "all 0.2s ease",
                whiteSpace:     "nowrap",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "rgba(10,239,255,0.03)"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; } }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
