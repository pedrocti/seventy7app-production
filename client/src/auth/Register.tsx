// src/pages/Register.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { register as registerApi } from "./api";
import { useLocation } from "wouter";
import { Sparkles } from "lucide-react";

export default function Register() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [refCode, setRefCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setRefCode(ref.toUpperCase());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) return setError("First name is required");
    if (firstName.trim().length < 2) return setError("First name is too short");

    if (!lastName.trim()) return setError("Last name is required");
    if (lastName.trim().length < 2) return setError("Last name is too short");

    if (!username.trim()) return setError("Username is required");
    if (!email.trim()) return setError("Email is required");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Please enter a valid email address (e.g. name@example.com)");
    }

    if (!password.trim()) return setError("Password is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    if (!agreedToTerms) {
      return setError("You must agree to the Terms & Conditions to register");
    }

    setLoading(true);

    try {
      const result = await registerApi(
        username.trim(),
        email.trim(),
        password.trim(),
        refCode.trim() || undefined
        // If your backend supports first/last name, pass them here:
        // firstName: firstName.trim(),
        // lastName: lastName.trim(),
      );

      if (result.success) {
        alert(
          "Registration successful! Please check your email (including spam) and verify your account before logging in."
        );
        setLocation("/login", { replace: true });
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Effects */}
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

        {/* Main Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0AEFFF] to-cyan-400 mb-6 shadow-lg">
              <Sparkles className="w-9 h-9 text-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0AEFFF] via-cyan-300 to-[#0AEFFF] bg-clip-text text-transparent">
              77KAPITAL
            </h1>
            <p className="text-gray-400 mt-3 text-lg">Join the future of wealth</p>
          </div>

          {/* Referral Banner */}
          {refCode && (
            <div className="mb-8 p-5 bg-gradient-to-r from-[#0AEFFF]/20 to-cyan-500/20 border border-[#0AEFFF]/40 rounded-2xl text-center transform hover:scale-105 transition">
              <p className="text-[#0AEFFF] font-medium">Referral Code Applied</p>
              <p className="text-3xl font-bold text-white mt-1 tracking-widest">{refCode}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF] focus:ring-4 focus:ring-[#0AEFFF]/20 transition"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF] focus:ring-4 focus:ring-[#0AEFFF]/20 transition"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF] focus:ring-4 focus:ring-[#0AEFFF]/20 transition"
              required
            />

            <input
              type="email"
              placeholder="Email (required for verification)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF] focus:ring-4 focus:ring-[#0AEFFF]/20 transition"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF] focus:ring-4 focus:ring-[#0AEFFF]/20 transition"
              required
            />

            <input
              type="text"
              placeholder="Referral Code (optional)"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              className="w-full px-6 py-5 bg-gradient-to-r from-[#0AEFFF]/10 to-cyan-500/10 border border-[#0AEFFF]/40 rounded-2xl text-[#0AEFFF] placeholder-cyan-400 font-mono tracking-wider focus:outline-none focus:border-[#0AEFFF] focus:ring-4 focus:ring-[#0AEFFF]/30 transition"
            />

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms-agree"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1.5 h-5 w-5 rounded border-white/20 bg-white/5 text-[#0AEFFF] focus:ring-[#0AEFFF] focus:ring-offset-2 focus:ring-offset-slate-900"
                disabled={loading}
              />
              <label
                htmlFor="terms-agree"
                className="text-sm text-gray-300 leading-relaxed"
              >
                I am at least 18 years old, I have read and agree to the{" "}
                <a
                  href="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0AEFFF] hover:text-cyan-300 underline transition-colors"
                >
                  Terms & Conditions
                </a>
                , and I understand that trading and investing involve significant risk of loss.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className={`w-full py-5 px-8 bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-black text-xl font-bold rounded-2xl hover:shadow-2xl hover:shadow-[#0AEFFF]/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 ${
                !agreedToTerms ? "opacity-60" : ""
              }`}
            >
              {loading ? (
                <>Creating Account...</>
              ) : (
                <>
                  Register Now
                  <Sparkles className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="text-center mt-8 text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="text-[#0AEFFF] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]/50 transition"
            >
              Login here
            </button>
          </div>
        </div>

        {/* Bottom Glow */}
        <div className="absolute inset-x-0 -bottom-20 h-40 bg-gradient-to-t from-[#0AEFFF]/20 to-transparent blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}