// src/pages/ResetPassword.tsx
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { useAuth } from "@/auth/AuthContext";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const routeResult = useRoute("/reset-password/:token");
  const token = routeResult?.[1]?.token ?? "";

  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate token presence
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing password reset link.");
    }
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!password || !confirmPassword) {
      setError("Please fill out both fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setInfo(res.message || "Password reset successful! Redirecting to login...");
        setTimeout(() => setLocation("/login"), 3000);
      } else {
        setError(res.error || "Failed to reset password.");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/40 p-8">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="77KAPITAL Logo"
            className="w-20 h-20 mx-auto mb-6 rounded-full object-cover shadow-lg shadow-cyan-500/30"
          />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0AEFFF] to-[#7E22CE]">
            Reset Password
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Enter your new password below</p>
        </div>

        {(error || info) && (
          <div
            className={`mb-6 p-4 border rounded-xl text-center text-sm ${
              error
                ? "bg-red-500/15 border-red-500/30 text-red-300"
                : "bg-green-500/15 border-green-500/30 text-green-300"
            }`}
          >
            {error || info}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF]/60 focus:ring-2 focus:ring-[#0AEFFF]/20 transition pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0AEFFF] transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF]/60 focus:ring-2 focus:ring-[#0AEFFF]/20 transition pr-12"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-gradient-to-r from-[#0AEFFF] to-[#7E22CE] text-[#0B1120] font-bold py-5 rounded-2xl hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400 text-sm">
          Remembered your password?{" "}
          <button
            type="button"
            onClick={() => setLocation("/login")}
            className="text-[#0AEFFF] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50 transition"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
