// client/src/api/http.ts
export const API_BASE =
  window.location.hostname.includes("replit.dev")
    ? window.location.origin.replace(/:\d+$/, "") + "/api" // keeps /api for Replit
    : "http://localhost:5000"; // ← fixed to backend port, not 3000

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;
  const url = `${API_BASE}${endpoint}`;

  const token = localStorage.getItem("token");

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return { success: false, error: "Session expired" };
      }
      return {
        success: false,
        error: (data as any)?.error || `Request failed: ${res.status}`,
        status: res.status,
      };
    }

    return { success: true, ...data };
  } catch (err) {
    console.error("apiRequest error:", err);
    return {
      success: false,
      error: "Network error — please check your connection",
    };
  }
}
