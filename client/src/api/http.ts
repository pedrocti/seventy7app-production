// client/src/api/http.ts

// -----------------------------
// API base URL
// -----------------------------
// Dev: use "" → Vite proxy handles /api, /auth
// Prod: use environment variable or default to "/api"
export const API_BASE =
  import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? "" : "/api");

// -----------------------------
// API response type
// -----------------------------
export type ApiResponse<T = any> =
  | ({ success: true } & T)
  | { success: false; error: string; status?: number };

// -----------------------------
// Generic API request helper
// -----------------------------
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;
  const url = `${API_BASE}${endpoint}`;

  const token = localStorage.getItem("token");

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  });

  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const res = await fetch(url, { ...options, headers, credentials: "include" });

    let data: T = {} as T;
    try {
      data = await res.json();
    } catch {
      data = {} as T;
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
        error: (data as any)?.error || `Request failed (${res.status})`,
        status: res.status,
      };
    }

    return { success: true, ...data };
  } catch (err: any) {
    console.error("apiRequest error:", err);
    return { success: false, error: "Network error — please check your connection" };
  }
}
