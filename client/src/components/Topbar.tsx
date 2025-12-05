// client/src/components/Topbar.tsx — BINANCE GOLD ELITE EDITION
import { Menu, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";

interface TopbarProps {
  active: string;
  onCollapse: () => void;
  onProfileClick?: () => void;
}

const GOLD = "#F0B90B";
const GOLD_SOFT = "#F8D84A";
const DARK = "#0B0B0B";
const DARK_2 = "#111";

export default function Topbar({ active, onCollapse, onProfileClick }: TopbarProps) {
  const { logout, user } = useAuth();

  return (
    <header
      className="backdrop-blur px-6 py-4 border-b"
      style={{
        background: `${DARK}CC`,
        borderColor: "#222",
      }}
    >
      <div className="flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="md:hidden text-[#999] hover:text-white hover:bg-[#1A1A1A]"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-wide text-white">
              77<span style={{ color: GOLD }}>KAPITAL</span>
            </h1>

            <span
              className="hidden sm:inline px-3 py-1 rounded text-sm font-medium border"
              style={{
                background: GOLD + "22",
                color: GOLD,
                borderColor: GOLD + "33",
              }}
            >
              {active.toUpperCase()}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* Notification */}
          <Button
            variant="ghost"
            size="icon"
            className="text-[#aaa] hover:text-white hover:bg-[#1A1A1A] relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* PROFILE (clickable) */}
          <button
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg hover:scale-110 transition transform-gpu cursor-pointer shadow-lg"
            style={{
              background: `linear-gradient(90deg, ${GOLD}, ${GOLD_SOFT})`,
              color: "#000",
              boxShadow: `0 0 20px ${GOLD}33`,
              ring: `4px solid ${GOLD}33`,
            }}
            title="Open Referral Center"
          >
            {user?.username?.[0]?.toUpperCase() || "U"}
          </button>

          {/* Logout Desktop */}
          <Button
            onClick={logout}
            variant="destructive"
            size="sm"
            className="font-medium hidden sm:flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            Logout
            <LogOut className="h-4 w-4" />
          </Button>

          {/* Logout Mobile */}
          <Button
            onClick={logout}
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 sm:hidden"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
