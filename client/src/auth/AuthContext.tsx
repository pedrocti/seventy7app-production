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
  email_verified_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // LOGIN FUNCTION
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await loginApi(username.trim(), password.trim());

      // Debug: log the FULL raw response
      console.log("Raw backend login response:", res);

      // Handle possible wrapped response (e.g. { data: { success: true } })
      const responseData = res.data || res;

      console.log("Processed response data:", responseData);
      console.log("success value:", responseData?.success);

      if (!responseData || responseData.success !== true) {
        toast.error(responseData?.error || "Invalid credentials");
        return false;
      }

      if (!responseData.token || !responseData.user) {
        toast.error("Invalid response from server");
        return false;
      }

      // Block unverified users
      if (!responseData.user.email_verified_at) {
        toast.error("Please verify your email before logging in.");
        return false;
      }

      // Format balances as strings with 2 decimals
      const userData: User = {
        ...responseData.user,
        balance: Number(responseData.user.balance || 0).toFixed(2),
        bonus_balance: Number(responseData.user.bonus_balance || 0).toFixed(2),
      };

      setUser(userData);
      setToken(responseData.token);

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", responseData.token);

      toast.success(`Welcome back, ${userData.username}!`);

      return true;
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(err.message || "Network error — is the backend running?");
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
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        setUser,
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