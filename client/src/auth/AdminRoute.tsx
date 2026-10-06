import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/auth/AuthContext";

interface AdminRouteProps { children: ReactNode; }

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, token, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!user || !token) { navigate("/login", { replace: true }); return null; }
  if (user.role?.toLowerCase() !== "admin") { navigate("/dashboard", { replace: true }); return null; }

  return <>{children}</>;
}
