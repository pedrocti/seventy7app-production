// client/src/api/http.ts

export const API_BASE =
  window.location.hostname.includes("replit.dev")
    ? window.location.origin.replace(":5000", ":3000") + "/api"
    : "http://localhost:3000/api";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  const url = `${API_BASE}${endpoint}`;

  const token = localStorage.getItem("token");

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers || {}),
  });

  // Add token automatically
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return {
      success: false,
      error: (data as any).error || `Request failed: ${res.status}`,
      status: res.status,
    };
  }

  return { success: true, ...data };
}
