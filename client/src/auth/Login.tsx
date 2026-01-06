// src/pages/Login.tsx
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "@/assets/logo.jpeg"; // ← Your system logo

export default function Login() {
  const { login, requestPasswordReset } = useAuth(); // add password reset method
  const [, setLocation] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailForReset, setEmailForReset] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(""); // For success messages
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false); // toggles login / forgot password form

  // ----------------------
  // Login Handler
  // ----------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      console.log("→ Frontend sending login request:", { username, password });
      const response = await login(username.trim(), password.trim());
      console.log("→ Backend response:", response);

      if (response.success && response.user) {
        // Redirect based on role
        const role = response.user.role?.toLowerCase();
        setLocation(role === "admin" ? "/admin" : "/dashboard", { replace: true });
      } else {
        // Error already returned from backend (including email verification)
        setError(response.error || "Invalid credentials or server error");
      }
    } catch (err: any) {
      setError(err.message || "Connection error. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };



  // ----------------------
  // Password Reset Handler
  // ----------------------
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (!emailForReset.trim()) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      const response = await requestPasswordReset(emailForReset.trim());
      console.log("→ Password reset response:", response);

      if (response.success) {
        setInfo("If an account exists for this email, a password reset has been sent.");
        setEmailForReset("");
      } else {
        setError(response.error || "Failed to send password reset email");
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Subtle background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0AEFFF]/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#7E22CE]/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      {/* Form container */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Back link */}
        <button
          type="button"
          onClick={() => setLocation("/")}
          className="mb-8 text-gray-400 hover:text-[#0AEFFF] transition flex items-center gap-2 text-sm font-medium mx-auto"
        >
          ← Back to Homepage
        </button>

        {/* Card */}
        <div className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/40 p-8 md:p-10">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="77KAPITAL Logo"
              className="w-20 h-20 mx-auto mb-6 rounded-full object-cover shadow-lg shadow-cyan-500/30"
              loading="lazy"
            />
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#0AEFFF] to-[#7E22CE] bg-clip-text text-transparent">
              77KAPITAL
            </h1>
            <p className="text-gray-400 mt-3 text-lg">
              {resetMode ? "Enter your email to reset password" : "Sign in to your account"}
            </p>
          </div>

          {/* Info / Error Messages */}
          {(error || info) && (
            <div
              className={`mb-6 p-4 border rounded-xl text-center text-sm ${
                error ? "bg-red-500/15 border-red-500/30 text-red-300" : "bg-green-500/15 border-green-500/30 text-green-300"
              }`}
            >
              {error || info}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={resetMode ? handlePasswordReset : handleLogin}
            className="space-y-6"
          >
            {resetMode ? (
              // ---------------------- Password Reset Form ----------------------
              <input
                type="email"
                placeholder="Email address"
                value={emailForReset}
                onChange={(e) => setEmailForReset(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF]/60 focus:ring-2 focus:ring-[#0AEFFF]/20 transition"
                required
              />
            ) : (
              <>
                {/* Username */}
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF]/60 focus:ring-2 focus:ring-[#0AEFFF]/20 transition"
                  required
                  autoFocus
                />

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
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
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0AEFFF] to-[#7E22CE] text-[#0B1120] font-bold py-5 rounded-2xl hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {resetMode ? "Sending..." : "Signing In..."}
                </>
              ) : (
                resetMode ? "Send Reset Link" : "Sign In"
              )}
            </button>
          </form>

          {/* Switch between login / forgot password */}
          <p className="text-center mt-6 text-gray-400 text-sm">
            {resetMode ? (
              <>
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={() => { setResetMode(false); setError(""); setInfo(""); }}
                  className="text-[#0AEFFF] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50 transition"
                >
                  Login here
                </button>
              </>
            ) : (
              <>
                Forgot your password?{" "}
                <button
                  type="button"
                  onClick={() => { setResetMode(true); setError(""); setInfo(""); }}
                  className="text-[#0AEFFF] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50 transition"
                >
                  Reset here
                </button>
              </>
            )}
          </p>

          {/* Register link */}
          {!resetMode && (
            <p className="text-center mt-8 text-gray-400 text-sm">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setLocation("/register")}
                className="text-[#0AEFFF] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50 transition"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
