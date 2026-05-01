// client/src/components/Topbar.tsx — UNIVERSAL CYAN EDITION

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Menu, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { apiRequest } from "@/api/http";

interface TopbarProps {
  active: string;
  onCollapse: () => void;
  onProfileClick?: () => void;
}

const CYAN = "#0AEFFF";
const CYAN_SOFT = "#4AFFF5";

export default function Topbar({
  active,
  onCollapse,
  onProfileClick,
}: TopbarProps) {
  const { logout, user, token } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // -------------------------
  // Fetch notifications
  // -------------------------
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await apiRequest("/user/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res?.success) {
        const list = res.notifications || [];
        setNotifications(list);
        setUnreadCount(list.filter((n: any) => !n.read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  // -------------------------
  // Close on outside click
  // -------------------------
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifications]);

  // -------------------------
  // Mark as read
  // -------------------------
  const markAsRead = async (id: string) => {
    try {
      await apiRequest(`/user/notifications/read/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(c - 1, 0));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // -------------------------
  // Toggle dropdown + position
  // -------------------------
  const toggleNotifications = () => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.right - 300,
      });
    }
    setShowNotifications((p) => !p);
  };

  return (
    <header
      className="backdrop-blur-sm px-6 py-4 border-b relative"
      style={{
        background: "rgba(15, 23, 42, 0.8)",
        borderColor: "rgba(30, 41, 59, 0.6)",
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
              77<span style={{ color: CYAN }}>KAPITAL</span>
            </h1>

            <span
              className="hidden sm:inline px-3 py-1 rounded text-sm font-medium border"
              style={{
                background: `${CYAN}22`,
                color: CYAN,
                borderColor: `${CYAN}33`,
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
            ref={bellRef}
            variant="ghost"
            size="icon"
            className="text-[#aaa] hover:text-white hover:bg-[#1A1A1A] relative"
            onClick={toggleNotifications}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>

          {/* PROFILE */}
          <button
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg hover:scale-110 transition shadow-lg"
            style={{
              background: `linear-gradient(90deg, ${CYAN}, ${CYAN_SOFT})`,
              color: "#000",
            }}
          >
            {user?.username?.[0]?.toUpperCase() || "U"}
          </button>

          {/* Logout Desktop */}
          <Button
            onClick={logout}
            variant="destructive"
            size="sm"
            className="hidden sm:flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            Logout
            <LogOut className="h-4 w-4" />
          </Button>

          {/* Logout Mobile */}
          <Button
            onClick={logout}
            variant="ghost"
            size="icon"
            className="text-red-400 hover:bg-red-500/20 sm:hidden"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* ================= PORTAL DROPDOWN ================= */}
      {showNotifications &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed w-72 bg-[#0F172A]/80 border border-[#1E293B]/60 rounded-xl shadow-2xl z-[999999]"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            <div className="p-4 border-b border-[#1E293B]/60 text-[#EAECEF] font-semibold">
              Notifications ({unreadCount})
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="text-sm text-[#848E9C] p-4">
                  No new notifications
                </p>
              )}

              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-[#1E293B]/60 ${
                    !n.read ? "bg-[#0AEFFF]/10" : ""
                  } hover:bg-[#0AEFFF]/5`}
                >
                  <p className="text-sm text-[#EAECEF]">{n.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-[#848E9C]">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-xs px-2 py-1 rounded bg-[#0ECB81] text-black hover:bg-[#0AEFFF]"
                      >
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
