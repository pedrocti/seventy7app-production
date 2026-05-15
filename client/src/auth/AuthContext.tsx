// src/auth/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import {
  login as loginApi,
  register as registerApi,
  requestPasswordReset as requestPasswordResetApi,
  resetPassword as resetPasswordApi,
} from "../api/auth";

export interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  balance: number;
  bonus_balance: number;
  referral_code: string;
  created_at?: string;
  email_verified_at?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
  code?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  register: (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    ref?: string
  ) => Promise<AuthResponse>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResponse>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  googleAuth: (credential: string, ref?: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // Load user from localStorage on mount
  // ----------------------------
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (!storedUser || !storedToken) {
        setLoading(false);
        return;
      }

      const parsedUser: User = JSON.parse(storedUser);

      setUser(parsedUser);
      setToken(storedToken);

      if (!parsedUser.email_verified_at) {
        toast.warning(
          "Your email is not verified. Some features are disabled until verification."
        );
      }
    } catch (error) {
      console.warn("Corrupted auth storage detected. Clearing session.");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------
  // LOGIN
  // ----------------------------
  const login = async (username: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await loginApi(username.trim(), password.trim());

      if (!res.success || !res.token || !res.user) {
        toast.error(res.error || "Login failed. Check credentials.");
        return { success: false, error: res.error || "Login failed" };
      }

      const isVerified = !!res.user.email_verified_at;

      const userData: User = {
        ...res.user,
        balance:       Number(res.user.balance ?? 0),
        bonus_balance: Number(res.user.bonus_balance ?? 0),
        referral_code: res.user.referral_code ?? "",
      };

      setUser(userData);
      setToken(res.token);
      localStorage.setItem("user",  JSON.stringify(userData));
      localStorage.setItem("token", res.token);

      if (!isVerified) {
        toast.warning(
          "Your email is not verified. Some features are disabled. Please verify your email."
        );
        return { success: true, token: res.token, user: userData, code: "EMAIL_NOT_VERIFIED" };
      }

      toast.success(`Welcome back, ${userData.username}!`);
      return { success: true, token: res.token, user: userData };
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(err?.message || "Network error during login");
      return { success: false, error: err?.message || "Network error" };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // REGISTER
  // ----------------------------
  const register = async (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    ref?: string
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await registerApi(firstName, lastName, username, email, password, ref);

      if (!res.success) {
        toast.error(res.error || "Registration failed");
        return { success: false, error: res.error || "Registration failed" };
      }

      if (res.user) {
        const userData: User = {
          ...res.user,
          balance:       Number(res.user.balance ?? 0),
          bonus_balance: Number(res.user.bonus_balance ?? 0),
          referral_code: res.user.referral_code ?? "",
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }

      toast.success("Registration successful! Please verify your email.");
      return res;
    } catch (err: any) {
      console.error("Register failed:", err);
      toast.error(err?.message || "Network error during registration");
      return { success: false, error: err?.message || "Network error" };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // LOGOUT
  // ----------------------------
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
  };

  // ----------------------------
  // REQUEST PASSWORD RESET
  // ----------------------------
  const requestPasswordReset = async (email: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await requestPasswordResetApi(email.trim());
      if (res.success) toast.success(res.message || "Password reset email sent!");
      else toast.error(res.error || "Failed to send password reset email");
      return res;
    } catch (err: any) {
      console.error("Password reset request error:", err);
      toast.error(err?.message || "Network error during password reset request");
      return { success: false, error: err?.message || "Network error" };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // RESET PASSWORD
  // ----------------------------
  const resetPassword = async (token: string, newPassword: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await resetPasswordApi(token, newPassword);
      if (res.success) toast.success(res.message || "Password reset successful! You can now log in.");
      else toast.error(res.error || "Failed to reset password");
      return res;
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast.error(err?.message || "Network error during password reset");
      return { success: false, error: err?.message || "Network error" };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // GOOGLE AUTH
  // ----------------------------
  const googleAuth = async (credential: string, ref?: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ credential, ref }),
      });
      const data = await res.json();

      if (!data.success || !data.token || !data.user) {
        toast.error(data.error || "Google sign-in failed");
        return { success: false, error: data.error || "Google sign-in failed" };
      }

      const userData: User = {
        ...data.user,
        balance:       Number(data.user.balance ?? 0),
        bonus_balance: Number(data.user.bonus_balance ?? 0),
        referral_code: data.user.referral_code ?? "",
      };

      setUser(userData);
      setToken(data.token);
      localStorage.setItem("user",  JSON.stringify(userData));
      localStorage.setItem("token", data.token);

      toast.success(`Welcome, ${userData.username}!`);
      return { success: true, token: data.token, user: userData };
    } catch (err: any) {
      toast.error(err?.message || "Network error");
      return { success: false, error: err?.message || "Network error" };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
        requestPasswordReset,
        resetPassword,
        setUser,
        googleAuth,
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