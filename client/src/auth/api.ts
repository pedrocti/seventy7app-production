const BASE_URL = "http://localhost:5050/api";

// --- Mock Fallback User (for development) ---
const mockUser = {
  id: 1,
  username: "testuser",
  email: "testuser@example.com",
  role: "Trader",
  balance: 5000,
};
const mockPassword = "1234";

// --- REGISTER ---
export const register = async (username: string, email: string, password: string) => {
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    // If backend unavailable, fall back to mock
    if (!res.ok) throw new Error("Backend offline, using mock");

    return res.json();
  } catch {
    return {
      success: true,
      user: { ...mockUser, username, email },
      token: "mock-token-123",
    };
  }
};

// --- LOGIN ---
export const login = async (username: string, password: string) => {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error("Backend offline, using mock");

    return res.json();
  } catch {
    // ✅ Fallback to test account
    if (username === mockUser.username && password === mockPassword) {
      return {
        success: true,
        user: mockUser,
        token: "mock-token-123",
      };
    }
    return { success: false, error: "Invalid username or password" };
  }
};
