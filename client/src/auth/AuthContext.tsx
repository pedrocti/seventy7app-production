// src/auth/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { login as loginApi } from "../api";

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  balance: string;
  bonus_balance: string;
  referral_code?: string;
  created_at?: string;
  email_verified_at?: string | null;  // added for clarity (from your login check)
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;  // ← Added this!
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // LOGIN FUNCTION
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await loginApi(username.trim(), password.trim());
      if (!res.success || !res.token || !res.user) {
        toast.error(res.error || "Invalid credentials");
        return false;
      }

      // Block unverified users
      if (!res.user.email_verified_at) {
        toast.error("Please verify your email before logging in.");
        return false;
      }

      // Format balances as strings with 2 decimals (consistent with your User type)
      const userData = {
        ...res.user,
        balance: Number(res.user.balance || 0).toFixed(2),
        bonus_balance: Number(res.user.bonus_balance || 0).toFixed(2),
      };

      setUser(userData);
      setToken(res.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", res.token);

      toast.success(`Welcome back, ${userData.username}!`);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Network error — is backend running?");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        login, 
        logout,
        setUser   // ← Now exposed!
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};