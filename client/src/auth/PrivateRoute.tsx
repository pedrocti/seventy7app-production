// client/src/auth/PrivateRoute.tsx
import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/auth/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, token, loading } = useAuth();
  const [, navigate] = useLocation();

  // Wait until auth is restored from localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user || !token) {
    navigate("/login", { replace: true });
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}