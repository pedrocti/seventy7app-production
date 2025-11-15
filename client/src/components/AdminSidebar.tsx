import { Users, BarChart3, PieChart, Wallet, User, Activity } from "lucide-react";
import clsx from "clsx";

interface SidebarProps {
  collapsed: boolean;
  active: string;
  onNavigate: (key: string) => void;
}

export default function AdminSidebar({ collapsed, active, onNavigate }: SidebarProps) {
  const items = [
    { key: "overview", label: "Overview", icon: <Activity size={18} /> },
    { key: "users", label: "Users", icon: <Users size={18} /> },
    { key: "transactions", label: "Transactions", icon: <BarChart3 size={18} /> },
    { key: "portfolio", label: "Portfolio", icon: <PieChart size={18} /> },
    { key: "invest", label: "Invest", icon: <Wallet size={18} /> },
    { key: "mentorship", label: "Mentorship", icon: <User size={18} /> },
  ];

  return (
    <aside
      className={clsx(
        "bg-[#071029]/60 backdrop-blur-sm border-r border-[#0F172A]/50 p-4 transition-all duration-300",
        "fixed md:static z-40 h-full md:h-auto",
        collapsed ? "w-16 -left-64 md:left-0 md:w-16" : "w-64 left-0"
      )}
    >
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
}
