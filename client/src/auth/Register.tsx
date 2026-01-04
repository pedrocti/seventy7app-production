// src/pages/Register.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { register as registerApi } from "./api";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "@/assets/logo.jpeg";

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
  const [showPassword, setShowPassword] = useState(false);
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
      return setError("Please enter a valid email address");
    }
    if (!password.trim()) return setError("Password is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (!agreedToTerms) {
      return setError("You must agree to the Terms & Conditions");
    }

    setLoading(true);

    try {
      const result = await registerApi(
        firstName.trim(),          // 1: firstName
        lastName.trim(),           // 2: lastName
        username.trim(),           // 3: username
        email.trim(),              // 4: email
        password.trim(),           // 5: password
        refCode.trim() || undefined // 6: ref (optional)
      );

      if (result.success) {
        alert("Registration successful! Check your email (including spam) to verify your account.");
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
            <p className="text-gray-400 mt-3 text-lg">Create your trading future</p>
          </div>

          {/* Referral banner */}
          {refCode && (
            <div className="mb-8 p-5 bg-gradient-to-r from-[#0AEFFF]/15 to-[#7E22CE]/15 border border-[#0AEFFF]/30 rounded-2xl text-center">
              <p className="text-[#0AEFFF] font-medium">Referral Code Applied</p>
              <p className="text-3xl font-bold text-white mt-1 tracking-widest">{refCode}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-center text-sm">
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
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF]/60 focus:ring-2 focus:ring-[#0AEFFF]/20 transition"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF]/60 focus:ring-2 focus:ring-[#0AEFFF]/20 transition"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF]/60 focus:ring-2 focus:ring-[#0AEFFF]/20 transition"
              required
            />

            <input
              type="email"
              placeholder="Email (for verification)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0AEFFF]/60 focus:ring-2 focus:ring-[#0AEFFF]/20 transition"
              required
            />

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

            <input
              type="text"
              placeholder="Referral Code (optional)"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              className="w-full px-5 py-4 bg-gradient-to-r from-[#0AEFFF]/5 to-cyan-500/5 border border-[#0AEFFF]/20 rounded-xl text-[#0AEFFF] placeholder-cyan-400 font-mono tracking-wider focus:outline-none focus:border-[#0AEFFF]/60 focus:ring-2 focus:ring-[#0AEFFF]/20 transition"
            />

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms-agree"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1.5 h-5 w-5 rounded border-white/20 bg-white/5 text-[#0AEFFF] focus:ring-[#0AEFFF] focus:ring-offset-2 focus:ring-offset-[#0B1120]"
                disabled={loading}
              />
              <label htmlFor="terms-agree" className="text-sm text-gray-300 leading-relaxed">
                I am at least 18, I agree to the{" "}
                <a
                  href="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0AEFFF] hover:text-cyan-300 underline transition-colors"
                >
                  Terms & Conditions
                </a>
                , and understand trading involves risk.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className={`w-full py-5 bg-gradient-to-r from-[#0AEFFF] to-[#7E22CE] text-[#0B1120] font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                !agreedToTerms ? "opacity-60" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <img
                    src={logo}
                    alt="77KAPITAL"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  Register Now
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center mt-8 text-gray-400 text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="text-[#0AEFFF] font-semibold hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}