// src/auth/Login.tsx
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function Login() {
  const { login, requestPasswordReset, googleAuth } = useAuth();
  const [, setLocation] = useLocation();

  const [username,      setUsername]      = useState("");
  const [password,      setPassword]      = useState("");
  const [emailForReset, setEmailForReset] = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState("");
  const [info,          setInfo]          = useState("");
  const [loading,       setLoading]       = useState(false);
  const [resetMode,     setResetMode]     = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);
    try {
      const response = await login(username.trim(), password.trim());
      if (response.success && response.user) {
        setLocation(response.user.role?.toLowerCase() === "admin" ? "/admin" : "/dashboard", { replace: true });
      } else {
        setError(response.error || "Invalid credentials or server error");
      }
    } catch (err: any) {
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  async function handleGoogle(credential: string) {
    setLoading(true); setError(""); setInfo("");
    try {
      const result = await googleAuth(credential);
      if (result.success && result.user) {
        setLocation(result.user.role?.toLowerCase() === "admin" ? "/admin" : "/dashboard", { replace: true });
      } else {
        setError(result.error || "Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);
    try {
      if (!emailForReset.trim()) { setError("Please enter your email address"); return; }
      const response = await requestPasswordReset(emailForReset.trim());
      if (response.success) { setInfo("If an account exists for this email, a password reset has been sent."); setEmailForReset(""); }
      else { setError(response.error || "Failed to send password reset email"); }
    } catch (err: any) {
      setError(err.message || "Connection error. Please try again.");
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
            <p className="body-text-sm" style={{ marginTop: 8 }}>
              {resetMode ? "Enter your email to reset password" : "Sign in to your account"}
            </p>
          </div>

          {(error || info) && (
            <div style={{ marginBottom: 20, padding: "12px 16px", border: error ? "1px solid rgba(246,70,93,0.3)" : "1px solid rgba(14,203,129,0.3)", background: error ? "rgba(246,70,93,0.06)" : "rgba(14,203,129,0.06)", color: error ? "var(--red)" : "var(--green)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textAlign: "center" }}>
              {error || info}
            </div>
          )}

          {!resetMode && (
            <div style={{ marginBottom: 24 }}>
              <GoogleAuthButton onCredential={handleGoogle} text="signin_with" />
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 0" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(10,239,255,0.1)" }} />
                <span className="data-label">or sign in with email</span>
                <div style={{ flex: 1, height: 1, background: "rgba(10,239,255,0.1)" }} />
              </div>
            </div>
          )}

          <form onSubmit={resetMode ? handlePasswordReset : handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {resetMode ? (
              <input type="email" placeholder="Email address" value={emailForReset}
                onChange={e => setEmailForReset(e.target.value)}
                className="form-input" required />
            ) : (
              <>
                <input type="text" placeholder="Username" value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="form-input" required autoFocus />
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="form-input" style={{ paddingRight: 48 }} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </>
            )}
            <button type="submit" disabled={loading}
              className="btn-primary"
              style={{ justifyContent: "center", marginTop: 4, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {loading ? (resetMode ? "Sending..." : "Signing In...") : (resetMode ? "Send Reset Link" : "Sign In")}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", color: "var(--muted-2)" }}>
            {resetMode ? (
              <span>Remembered your password?{" "}
                <button type="button" onClick={() => { setResetMode(false); setError(""); setInfo(""); }}
                  style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em" }}>
                  Login here
                </button>
              </span>
            ) : (
              <span>Forgot your password?{" "}
                <button type="button" onClick={() => { setResetMode(true); setError(""); setInfo(""); }}
                  style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em" }}>
                  Reset here
                </button>
              </span>
            )}
          </p>

          {!resetMode && (
            <p style={{ textAlign: "center", marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", color: "var(--muted-2)" }}>
              {"No account? "}
              <button type="button" onClick={() => setLocation("/register")}
                style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em" }}>
                Register here
              </button>
            </p>
          )}

        </div>
      </div>
    </main>
  );
}
