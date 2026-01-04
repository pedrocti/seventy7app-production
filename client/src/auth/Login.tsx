// src/pages/Login.tsx
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useLocation } from "wouter";
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(username.trim(), password.trim());
      if (success) {
        // Redirect based on role (already handled in AuthContext)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const role = JSON.parse(storedUser).role?.toLowerCase();
          setLocation(role === "admin" ? "/admin" : "/dashboard", { replace: true });
        }
      } else {
        setError("Invalid credentials or server error");
      }
    } catch (err: any) {
      setError(err.message || "Connection error. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Effects – identical to Register */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,239,255,0.08),transparent_70%)]" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#0AEFFF]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative w-full max-w-md z-10">
        {/* Back to Home */}
        <div className="mb-6 text-center">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="text-gray-400 hover:text-[#0AEFFF] transition flex items-center justify-center gap-2 mx-auto text-sm font-medium"
          >
            ← Back to Homepage
          </button>
        </div>

        {/* Glass Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0AEFFF] to-cyan-400 mb-6 shadow-lg">
              <Sparkles className="w-9 h-9 text-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0AEFFF] via-cyan-300 to-[#0AEFFF] bg-clip-text text-transparent">
              77KAPITAL
            </h1>
            <p className="text-gray-400 mt-3 text-lg">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF] focus:ring-4 focus:ring-[#0AEFFF]/20 transition"
              required
              autoFocus
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF] focus:ring-4 focus:ring-[#0AEFFF]/20 transition pr-14"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0AEFFF] transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-8 bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-black text-xl font-bold rounded-2xl hover:shadow-2xl hover:shadow-[#0AEFFF]/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <Sparkles className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          {/* Register link – cleaned up, reliable navigation */}
          <div className="text-center mt-8 text-gray-400">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                console.log("→ Navigating to /register");
                setLocation("/register");
              }}
              className="text-[#0AEFFF] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50 transition"
            >
              Register here
            </button>
          </div>
        </div>

        {/* Bottom Glow */}
        <div className="absolute inset-x-0 -bottom-20 h-40 bg-gradient-to-t from-[#0AEFFF]/20 to-transparent blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}