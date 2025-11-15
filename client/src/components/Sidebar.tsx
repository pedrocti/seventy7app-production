// client/src/components/Sidebar.tsx
import { Wallet, BarChart3, User, PieChart, Activity, X } from "lucide-react";
import clsx from "clsx";

interface SidebarProps {
  collapsed: boolean;
  active: string;
  onNavigate: (key: string) => void;
}

const Sidebar = ({ collapsed, active, onNavigate }: SidebarProps) => {
  const items = [
    { key: "overview", label: "Overview", icon: <Activity size={18} /> },
    { key: "portfolio", label: "Portfolio", icon: <PieChart size={18} /> },
    { key: "invest", label: "Invest", icon: <Wallet size={18} /> },
    { key: "trades", label: "Trades", icon: <BarChart3 size={18} /> },
    { key: "mentorship", label: "Mentorship", icon: <User size={18} /> },
  ];

  return (
    <aside
      className={clsx(
        "bg-[#071029]/60 backdrop-blur-md border-r border-[#0F172A]/50 p-4 z-40 fixed md:static h-full transition-all duration-300",
        collapsed ? "w-16 -left-64 md:left-0" : "w-64 left-0"
      )}
    >
      {/* Mobile close button */}
      <div className="flex items-center justify-between mb-6 md:hidden">
        {!collapsed && (
          <button onClick={() => onNavigate("toggle")} className="p-1">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <div className="text-sm font-bold">
            77<span className="text-[#0AEFFF]">KAPITAL</span>
          </div>
        )}
      </div>

      <nav className="space-y-2">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onNavigate(it.key)}
            className={clsx(
              "w-full text-left flex items-center gap-3 p-3 rounded hover:bg-[#0AEFFF]/10 transition",
              active === it.key ? "bg-[#0AEFFF]/20" : ""
            )}
          >
            <div className="text-[#0AEFFF]">{it.icon}</div>
            {!collapsed && <div className="font-medium">{it.label}</div>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
