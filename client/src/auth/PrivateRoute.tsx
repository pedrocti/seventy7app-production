// client/src/auth/PrivateRoute.tsx
import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/auth/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, token, loading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect only 
  useEffect(() => {
    if (!loading && (!user || !token)) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }
  
  //  don't render the protected children
  if (!user || !token) {
    return null;
  }

  return <>{children}</>;
}
