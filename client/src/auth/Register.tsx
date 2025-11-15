import { useState } from "react";
import { useAuth } from "./AuthContext";
import { register as registerApi } from "./api";
import { useLocation } from "wouter";

const Register = () => {
  const { login } = useAuth();
  const [, setLocation] = useLocation(); // ← replace useNavigate
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await registerApi(username, email, password);
    if (result.success) {
      login(result.user, result.token);
      setLocation("/dashboard"); // ← redirect
    } else {
      setError(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <form onSubmit={handleSubmit} className="bg-[#1E293B] p-8 rounded-2xl w-full max-w-md text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-[#0F172A]"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-[#0F172A]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-[#0F172A]"
        />
        <button
          type="submit"
          className="w-full bg-[#0AEFFF] text-[#0F172A] font-bold p-3 rounded hover:brightness-110 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
