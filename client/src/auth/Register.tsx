// src/auth/Register.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { register as registerApi } from "@/api/auth";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function Register() {
  const { googleAuth } = useAuth();
  const [, setLocation] = useLocation();

  const [firstName,     setFirstName]     = useState("");
  const [lastName,      setLastName]      = useState("");
  const [username,      setUsername]      = useState("");
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [refCode,       setRefCode]       = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setRefCode(ref.toUpperCase());
  }, []);

  async function handleGoogle(credential: string) {
    setLoading(true); setError("");
    try {
      const result = await googleAuth(credential, refCode.trim() || undefined);
      if (result.success && result.user) {
        setLocation(result.user.role?.toLowerCase() === "admin" ? "/admin" : "/dashboard", { replace: true });
      } else {
        setError(result.error || "Google sign-up failed");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim())                          return setError("First name is required");
    if (firstName.trim().length < 2)                return setError("First name is too short");
    if (!lastName.trim())                           return setError("Last name is required");
    if (lastName.trim().length < 2)                 return setError("Last name is too short");
    if (!username.trim())                           return setError("Username is required");
    if (!email.trim())                              return setError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address");
    if (!password.trim())                           return setError("Password is required");
    if (password.length < 6)                        return setError("Password must be at least 6 characters");
    if (!agreedToTerms)                             return setError("You must agree to the Terms and Conditions");
    setLoading(true);
    try {
      const result = await registerApi(firstName.trim(), lastName.trim(), username.trim(), email.trim(), password.trim(), refCode.trim() || undefined);
      if (result.success) {
        alert("Registration successful! Check your email (including spam) to verify your account.");
        setLocation("/login", { replace: true });
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 30% 30%, rgba(10,239,255,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 70% 70%, rgba(126,34,206,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480 }}>
        <button type="button" onClick={() => setLocation("/")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", marginBottom: 32, padding: 0 }}>
          Back to Homepage
        </button>

        <div style={{ background: "var(--surface)", border: "1px solid rgba(10,239,255,0.14)", padding: "40px 36px" }}>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <img src={logo} alt="77KAPITAL" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto 20px" }} />
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 300, background: "linear-gradient(135deg, var(--cyan), var(--purple))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
              77KAPITAL
            </h1>
            <p className="body-text-sm" style={{ marginTop: 8 }}>Begin your Financial Journey</p>
          </div>

          {refCode && (
            <div style={{ marginBottom: 24, padding: "16px 20px", background: "rgba(10,239,255,0.04)", border: "1px solid rgba(10,239,255,0.2)", textAlign: "center" }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Referral Code Applied</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, letterSpacing: "0.2em", color: "var(--text)" }}>{refCode}</div>
            </div>
          )}

          {error && (
            <div style={{ marginBottom: 20, padding: "12px 16px", border: "1px solid rgba(246,70,93,0.3)", background: "rgba(246,70,93,0.06)", color: "var(--red)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textAlign: "center" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <GoogleAuthButton onCredential={handleGoogle} text="signup_with" />
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(10,239,255,0.1)" }} />
              <span className="data-label">or register with email</span>
              <div style={{ flex: 1, height: 1, background: "rgba(10,239,255,0.1)" }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="form-input" required />
              <input type="text" placeholder="Last Name"  value={lastName}  onChange={e => setLastName(e.target.value)}  className="form-input" required />
            </div>
            <input type="text"  placeholder="Username"             value={username} onChange={e => setUsername(e.target.value)} className="form-input" required />
            <input type="email" placeholder="Email (for verification)" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} className="form-input" style={{ paddingRight: 48 }} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input type="text" placeholder="Referral Code (optional)" value={refCode}
              onChange={e => setRefCode(e.target.value.toUpperCase())}
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.15em", color: "var(--cyan)" }}
              className="form-input" />

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingTop: 4 }}>
              <input type="checkbox" id="terms-agree" checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                disabled={loading}
                style={{ marginTop: 3, flexShrink: 0, accentColor: "var(--cyan)", width: 16, height: 16 }} />
              <label htmlFor="terms-agree" className="body-text-sm" style={{ margin: 0, cursor: "pointer" }}>
                I am at least 18 and agree to the Terms and Conditions, and understand participation in financial markets involves risk.
              </label>
            </div>

            <button type="submit" disabled={loading || !agreedToTerms}
              className="btn-primary"
              style={{ justifyContent: "center", marginTop: 4, cursor: loading || !agreedToTerms ? "not-allowed" : "pointer", opacity: loading || !agreedToTerms ? 0.6 : 1 }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {loading ? "Creating Account..." : "Register Now"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", color: "var(--muted-2)" }}>
            {"Already have an account? "}
            <button type="button" onClick={() => setLocation("/login")}
              style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em" }}>
              Login here
            </button>
          </p>

        </div>
      </div>
    </main>
  );
}
