// src/api/auth.ts    ← recommended file name/location
// or src/pages/api.ts if you prefer to keep it there

import { apiRequest } from "./http";

// ────────────────────────────────────────────────
// AUTHENTICATION API CALLS
// ────────────────────────────────────────────────

/**
 * Logs in a user with username and password
 */
export async function login(username: string, password: string) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

    if (response.success !== true) {
    return {
      success: false,
      error: response.error || "Login failed. Please check your credentials.",
    };
  }

  return response;
}

/**
 * Registers a new user
 * @param firstName - User's first name (required)
 * @param lastName  - User's last name (required)
 * @param username  - Unique username
 * @param email     - Email address (will be used for verification)
 * @param password  - User password
 * @param ref       - Optional referral code
 */
export async function register(
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
  ref?: string,
) {
  const payload = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    username: username.trim(),
    email: email.trim(),
    password: password.trim(),
    ...(ref?.trim() && { ref: ref.trim() }), // only include if non-empty
  };

  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

    if (response.success !== true) {
    return {
      success: false,
      error: response.error || "Registration failed. Please try again.",
    };
  }

  return response;
}

/**
 * Fetches the current user's profile
 * @param token - JWT authentication token
 */
export async function getProfile(token: string) {
  if (!token) {
    return { success: false, error: "No authentication token provided" };
  }

  return apiRequest("/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}