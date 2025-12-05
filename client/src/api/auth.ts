import { apiRequest } from "./http";

// ----------------------
// AUTH
// ----------------------
export async function login(username: string, password: string) {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (!res.success) {
    return { success: false, error: res.error || "Login failed" };
  }

  return res;
}

export async function register(username: string, email: string, password: string) {
  const res = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.success) {
    return { success: false, error: res.error || "Registration failed" };
  }

  return res;
}

export async function getProfile(token: string) {
  return apiRequest("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
