// src/pages/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/api/http";

export default function VerifyEmail() {
  const [location, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // Extract token from query string
  const params = new URLSearchParams(location.split("?")[1]);
  const token = params.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const res = await apiRequest(`/auth/verify-email?token=${token}`);
        if (res.success) {
          setStatus("success");
          // redirect after 2.5s
          setTimeout(() => setLocation("/login"), 2500);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Email verification error:", err);
        setStatus("error");
      }
    };

    verify();
  }, [token, setLocation]);

  const renderMessage = () => {
    switch (status) {
      case "loading":
        return <p>Verifying your email…</p>;
      case "success":
        return <p className="text-green-400">Email verified! Redirecting to login…</p>;
      case "error":
        return <p className="text-red-400">Invalid or expired verification link.</p>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E11] text-white">
      {renderMessage()}
    </div>
  );
}
