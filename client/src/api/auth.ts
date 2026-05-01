// src/api/auth.ts
import { apiRequest } from "./http";

// ────────────────────────────────────────────────
// SHARED API TYPES
// ────────────────────────────────────────────────
interface ApiFailure {
  success: false;
  error?: string;
  code?: string;
  status?: number;
}

interface ApiSuccess {
  success: true;
  token?: string;
  user?: any;
  message?: string;
  code?: string;
}

type AuthApiResponse = ApiFailure | ApiSuccess;

// ────────────────────────────────────────────────
// Type Guard (THIS IS THE FIX)
// ────────────────────────────────────────────────
function isFailure(res: AuthApiResponse): res is ApiFailure {
  return res.success === false;
}

// Frontend-friendly response
export interface AuthResponse {
  success: boolean;
  error?: string;
  code?: string;
  token?: string;
  user?: any;
  message?: string;
}

// ────────────────────────────────────────────────
// LOGIN
// ────────────────────────────────────────────────
export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  try {
    const response = (await apiRequest<AuthApiResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })) as AuthApiResponse;

    if (isFailure(response)) {
      return {
        success: false,
        error: response.error || "Login failed. Please check your credentials.",
        code: response.code,
      };
    }

    return {
      success: true,
      token: response.token,
      user: response.user,
      message: response.message,
      code: response.code,
    };
  } catch (err: any) {
    console.error("Login API error:", err);
    return {
      success: false,
      error: err?.message || "Network error during login",
    };
  }
}

// ────────────────────────────────────────────────
// REGISTER
// ────────────────────────────────────────────────
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

    const response = (await apiRequest<AuthApiResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })) as AuthApiResponse;

    if (isFailure(response)) {
      return {
        success: false,
        error: response.error || "Registration failed. Please try again.",
        code: response.code,
      };
    }

    return {
      success: true,
      token: response.token,
      user: response.user,
      message: response.message,
      code: response.code,
    };
  } catch (err: any) {
    console.error("Register API error:", err);
    return {
      success: false,
      error: err?.message || "Network error during registration",
    };
  }
}

// ────────────────────────────────────────────────
// PROFILE
// ────────────────────────────────────────────────
export async function getProfile(token: string): Promise<AuthResponse> {
  if (!token) {
    return { success: false, error: "No authentication token provided" };
  }

  try {
    const response = (await apiRequest<AuthApiResponse>("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })) as AuthApiResponse;

    if (isFailure(response)) {
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
    return {
      success: false,
      error: err?.message || "Network error fetching profile",
    };
  }
}

// ────────────────────────────────────────────────
// FORGOT PASSWORD
// ────────────────────────────────────────────────
export async function requestPasswordReset(
  email: string
): Promise<AuthResponse> {
  try {
    const response = (await apiRequest<AuthApiResponse>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    )) as AuthApiResponse;

    if (isFailure(response)) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      message: response.message,
    };
  } catch (err: any) {
    console.error("Forgot password API error:", err);
    return {
      success: false,
      error: err?.message || "Network error during password reset request",
    };
  }
}

// ────────────────────────────────────────────────
// RESET PASSWORD
// ────────────────────────────────────────────────
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AuthResponse> {
  try {
    const response = (await apiRequest<AuthApiResponse>(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      }
    )) as AuthApiResponse;

    if (isFailure(response)) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      message: response.message,
    };
  } catch (err: any) {
    console.error("Reset password API error:", err);
    return {
      success: false,
      error: err?.message || "Network error during password reset",
    };
  }
}
