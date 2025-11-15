// src/auth/Login.tsx
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { login as loginApi, register as registerApi } from "./api";
import { useLocation } from "wouter";

const Login = () => {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (isRegister) {
      // 🔹 Register Mode
      const result = await registerApi(username, email, password);
      if (result.success) {
        setMessage("Registration successful! You can now log in.");
        setIsRegister(false);
        setUsername("");
        setEmail("");
        setPassword("");
      } else {
        setError(result.error || "Registration failed");
      }
    } else {
      // 🔹 Login Mode
      const result = await loginApi(username, password);
      if (result.success) {
        login(result.user, result.token);
        setTimeout(() => setLocation("/dashboard"), 200);
      } else {
        setError(result.error || "Login failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1E293B] p-8 rounded-2xl w-full max-w-md text-white shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? "Create Account" : "Login"}
        </h2>

        {error && <div className="text-red-400 mb-4">{error}</div>}
        {message && <div className="text-green-400 mb-4">{message}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]"
          required
        />

        {isRegister && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]"
            required
          />
        )}

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0AEFFF]"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-[#0AEFFF] hover:underline"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex justify-between items-center text-sm mb-6">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="text-[#0AEFFF] hover:underline"
          >
            ← Back to Home
          </button>

          {!isRegister && (
            <button
              type="button"
              onClick={() => setLocation("/forgot-password")}
              className="text-[#0AEFFF] hover:underline"
            >
              Forgot Password?
            </button>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#0AEFFF] text-[#0F172A] font-bold p-3 rounded hover:brightness-110 transition"
        >
          {isRegister ? "Register" : "Login"}
        </button>

        <div className="text-center mt-6 text-sm">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-[#0AEFFF] hover:underline"
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-[#0AEFFF] hover:underline"
              >
                Register
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
