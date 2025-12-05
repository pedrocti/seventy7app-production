// src/auth/AuthContext.tsx 
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  balance: string;
  bonus_balance: string;
  referral_code?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success && data.token && data.user) {
        const userData = {
          ...data.user,
          balance: Number(data.user.balance || 0).toFixed(2),
          bonus_balance: Number(data.user.bonus_balance || 0).toFixed(2),
        };

        setUser(userData);
        setToken(data.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", data.token);

        toast.success("Welcome back, " + userData.username + "!");
        return true;
      } else {
        toast.error(data.error || "Invalid credentials");
        return false;
      }
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
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
