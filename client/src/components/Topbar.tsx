// client/src/components/Topbar.tsx
import { useState } from "react";
import { LogOut, Bell, Menu } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

interface TopbarProps {
  active: string;
  onCollapse: () => void;
}

const Topbar = ({ active, onCollapse }: TopbarProps) => {
  const { logout } = useAuth();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#0F172A]/50">
      <div className="flex items-center gap-3">
          <button onClick={onCollapse} className="p-2 rounded hover:bg-[#0AEFFF]/10 md:hidden">
          <Menu size={18} />
        </button>
        <div className="text-lg font-bold tracking-wide">77<span className="text-[#0AEFFF]">KAPITAL</span></div>
        <div className="ml-4 px-3 py-1 rounded bg-[#0AEFFF]/6 text-sm text-[#0AEFFF]">{active.toUpperCase()}</div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded hover:bg-[#0AEFFF]/10">
          <Bell />
        </button>
        <button onClick={logout} className="bg-red-500 px-3 py-1 rounded flex items-center gap-1">
          Logout <LogOut size={14} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;
