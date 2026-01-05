// src/api/auth.ts
import { apiRequest } from "./http";

// ────────────────────────────────────────────────
// AUTHENTICATION API CALLS
// ────────────────────────────────────────────────

// Standard response type for auth operations
export interface AuthResponse {
  success: boolean;
  error?: string;
  token?: string;
  user?: any;
  message?: string;
}

/**
 * Logs in a user with username and password
 */
export async function login(username: string, password: string): Promise<AuthResponse> {
  try {
    const response = await apiRequest<{ token?: string; user?: any; success: boolean; error?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Login failed. Please check your credentials.",
      };
    }

    return {
      success: true,
      token: response.token,
      user: response.user,
    };
  } catch (err: any) {
    console.error("Login API error:", err);
    return { success: false, error: err?.message || "Network error during login" };
  }
}

/**
 * Registers a new user
 */
export async function register(
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
  ref?: string
): Promise<AuthResponse> {
  try {
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      ...(ref?.trim() && { ref: ref.trim() }),
    };

    const response = await apiRequest<{ token?: string; user?: any; success: boolean; error?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Registration failed. Please try again.",
      };
    }

    return {
      success: true,
      token: response.token,
      user: response.user,
    };
  } catch (err: any) {
    console.error("Register API error:", err);
    return { success: false, error: err?.message || "Network error during registration" };
  }
}

/**
 * Fetches the current user's profile
 */
export async function getProfile(token: string): Promise<AuthResponse> {
  if (!token) return { success: false, error: "No authentication token provided" };

  try {
    const response = await apiRequest<{ user?: any; success: boolean; error?: string }>("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Failed to fetch profile",
      };
    }

    return {
      success: true,
      user: response.user,
    };
  } catch (err: any) {
    console.error("Profile API error:", err);
    return { success: false, error: err?.message || "Network error fetching profile" };
  }
}

/**
 * Request a password reset email
 */
export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  try {
    const response = await apiRequest<{ success: boolean; error?: string; message?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return {
      success: response.success,
      error: response.error,
      message: response.message,
    };
  } catch (err: any) {
    console.error("Forgot password API error:", err);
    return { success: false, error: err?.message || "Network error during password reset request" };
  }
}

/**
 * Reset password using token from email
 */
export async function resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
  try {
    const response = await apiRequest<{ success: boolean; error?: string; message?: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });

    return {
      success: response.success,
      error: response.error,
      message: response.message,
    };
  } catch (err: any) {
    console.error("Reset password API error:", err);
    return { success: false, error: err?.message || "Network error during password reset" };
  }
}
