// src/pages/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/api/http";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    (async () => {
      try {
        const res = await apiRequest("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        if ((res as any).success) {
          setStatus("success");
          setTimeout(() => setLocation("/login"), 2500);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Email verification error:", err);
        setStatus("error");
      }
    })();
  }, [token, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E11] text-white">
      {status === "loading" && <p>Verifying your email…</p>}
      {status === "success" && <p className="text-green-400">Email verified! Redirecting to login…</p>}
      {status === "error"   && <p className="text-red-400">Invalid or expired verification link.</p>}
    </div>
  );
}
