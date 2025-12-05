import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isRegister) {
        const result = await registerApi(username, email, password);
        if (result.success) {
          setMessage("Registration successful! You can now log in.");
          setIsRegister(false);
          setEmail("");
          setPassword("");
        } else {
          setError(result.error || "Registration failed");
        }
      } else {
        const success = await login(username, password);
        if (!success) {
          setError("Invalid credentials or network error");
          return;
        }
        // Redirect based on role
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const role = JSON.parse(storedUser).role?.toLowerCase();
          setLocation(role === "admin" ? "/admin" : "/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
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
          className="w-full mb-4 p-3 rounded bg-[#0F172A]"
          required
        />

        {isRegister && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-[#0F172A]"
            required
          />
        )}

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-[#0F172A]"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-[#0AEFFF]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0AEFFF] text-[#0F172A] font-bold p-3 rounded hover:brightness-110 transition disabled:opacity-40"
        >
          {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>

        <div className="text-center mt-6 text-sm">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-[#0AEFFF]"
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
                className="text-[#0AEFFF]"
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
