// client/src/utils/adminFetch.ts
export const adminFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found. Please log in again.");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};
