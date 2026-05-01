// client/src/api/http.ts

// -----------------------------
// API base URL
// -----------------------------
// Dev: "" → Vite proxy handles /api
// Prod: set via VITE_API_BASE (e.g., "https://yourhostingerdomain.com/api")
export const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "/api";

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
  // Ensure leading slash
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  // Prevent double "/api/api" prefix
  const url = endpoint.startsWith(API_BASE) ? endpoint : `${API_BASE}${endpoint}`;

  const token = localStorage.getItem("token");

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  });

  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    let data: T = {} as T;

    // Try to parse JSON, ignore parse error
    try {
      data = await res.json();
    } catch {
      data = {} as T;
    }

    // Handle non-OK responses
    if (!res.ok) {
      // Handle unauthorized (token expired)
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return { success: false, error: "Session expired", status: 401 };
      }

      return {
        success: false,
        error: (data as any)?.error || `Request failed (${res.status})`,
        status: res.status,
      };
    }

    return { success: true, ...data };
  } catch (err: any) {
    console.error("apiRequest network error:", err);
    return { success: false, error: "Network error — please check your connection" };
  }
}
