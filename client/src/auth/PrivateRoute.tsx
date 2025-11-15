// src/auth/PrivateRoute.tsx
import { Route, useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";

interface PrivateRouteProps {
  path: string;
  component: React.FC<any>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ path, component: Component }) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return; // ✅ Wait until auth check finishes

    if (!user) {
      setAllowed(false);
      setLocation("/login");
    } else {
      setAllowed(true);
    }
  }, [user, loading, setLocation]);

  if (loading || !allowed) return null; // prevents flicker before redirect check

  return <Route path={path} component={Component} />;
};

export default PrivateRoute;
