// client/src/components/Sidebar.tsx — BINANCE GOLD ELITE EDITION
import { Wallet, BarChart3, User, PieChart, Activity, X, ClipboardList } from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  collapsed: boolean;
  active: string;
  onNavigate: (key: string) => void;
}

const GOLD = "#F0B90B";
const GOLD_SOFT = "#F8D84A";
const DARK = "#0B0B0B";
const DARK_2 = "#111";

const Sidebar = ({ collapsed, active, onNavigate }: SidebarProps) => {
  const items = [
    { key: "overview", label: "Overview", icon: <Activity size={18} /> },
    { key: "portfolio", label: "Portfolio", icon: <PieChart size={18} /> },
    { key: "invest", label: "Invest", icon: <Wallet size={18} /> },
    { key: "trades", label: "Trades", icon: <BarChart3 size={18} /> },
    { key: "mentorship", label: "Mentorship", icon: <User size={18} /> },
    { key: "learning", label: "Learning", icon: <ClipboardList size={18} /> },
  ];

  return (
    <aside
      className={clsx(
        "backdrop-blur-md p-4 z-40 fixed md:static h-full transition-all duration-300 border-r",
        collapsed ? "w-16 -left-64 md:left-0" : "w-64 left-0"
      )}
      style={{ background: DARK + "CC", borderColor: DARK_2 + "80" }}
    >
      {/* Mobile close button */}
      <div className="flex items-center justify-between mb-6 md:hidden">
        {!collapsed && (
          <button onClick={() => onNavigate("toggle")} className="p-1 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Brand */}
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <div className="text-sm font-bold text-white">
            77<span style={{ color: GOLD }}>KAPITAL</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {items.map((it) => {
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onNavigate(it.key)}
              className={clsx(
                "w-full text-left flex items-center gap-3 p-3 rounded transition",
                isActive ? "bg-gradient-to-r from-[#F0B90B]/20 to-[#F8D84A]/10" : "hover:bg-[#F0B90B]/10"
              )}
            >
              <div
                className="flex-shrink-0"
                style={{ color: GOLD }}
              >
                {it.icon}
              </div>
              {!collapsed && (
                <div
                  className="font-medium"
                  style={{ color: isActive ? GOLD_SOFT : "#ddd" }}
                >
                  {it.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
