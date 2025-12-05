import { apiRequest } from "./http";

export function deposit(token: string, amount: number) {
  return apiRequest("/api/deposit", {
    method: "POST",
    body: JSON.stringify({ amount }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function withdraw(token: string, amount: number) {
  return apiRequest("/api/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount }),
    headers: { Authorization: `Bearer ${token}` },
  });
}
