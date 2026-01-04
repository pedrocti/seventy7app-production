// client/src/components/Sidebar.tsx
import { Wallet, BarChart3, User, PieChart, Activity, X, ClipboardList } from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  collapsed: boolean;
  active: string;
  onNavigate: (key: string) => void;
}

const CYAN = "#0AEFFF";
const CYAN_SOFT = "#4AFFF5";
const DARK = "#0B0B0B";
const DARK_2 = "#111111";

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
      style={{ background: `${DARK}CC`, borderColor: `${DARK_2}80` }}
    >
      {/* Mobile close button */}
      <div className="flex items-center justify-between mb-6 md:hidden">
        {!collapsed && (
          <button onClick={() => onNavigate("toggle")} className="p-1 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Brand - hide text when collapsed */}
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <div className="text-sm font-bold text-white">
            77<span style={{ color: CYAN }}>KAPITAL</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = active === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}   // ← shows native tooltip on hover when collapsed
              className={clsx(
                "group relative w-full text-left flex items-center justify-center md:justify-start gap-3 p-3 rounded transition-all duration-200",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-gradient-to-r from-[#0AEFFF]/15 to-[#4AFFF5]/10 border-l-4 border-[#0AEFFF]"
                  : "hover:bg-[#0AEFFF]/10"
              )}
            >
              <div
                className="flex-shrink-0 transition-colors"
                style={{ color: isActive ? CYAN : "#888" }}
              >
                {item.icon}
              </div>

              {/* Label only shown when NOT collapsed */}
              {!collapsed && (
                <div
                  className="font-medium transition-colors"
                  style={{ color: isActive ? CYAN_SOFT : "#ddd" }}
                >
                  {item.label}
                </div>
              )}

              {/* Optional: subtle cyan glow ring on hover when collapsed */}
              {collapsed && (
                <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity bg-gradient-to-r from-[#0AEFFF]/0 to-[#0AEFFF]/10" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;