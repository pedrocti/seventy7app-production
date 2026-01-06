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
  balance: string;
  bonus_balance: string;
  referral_code?: string;
  created_at?: string;
  email_verified_at?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
  code?: string; // backend codes like EMAIL_NOT_VERIFIED
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // Load user from localStorage on mount
  // ----------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser: User = JSON.parse(storedUser);

        // Only load if user is verified
        const isVerified = !!parsedUser.email_verified_at;

        if (isVerified) {
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          // Remove invalid/blocked users
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } catch {
        // Remove corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
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

      // ------------------------------
      // Safe verification check
      // ------------------------------
      const isVerified = !!res.user.email_verified_at;

      // Save user anyway, even if unverified
      const userData: User = {
        ...res.user,
        balance: Number(res.user.balance || 0).toFixed(2),
        bonus_balance: Number(res.user.bonus_balance || 0).toFixed(2),
      };

      setUser(userData);
      setToken(res.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", res.token);

      // Inform user about verification
      if (!isVerified) {
        toast.warning(
          "Your email is not verified. Some features like deposits and investments are disabled. Please verify your email."
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
