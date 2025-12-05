import { apiRequest } from "./http";

export function invest(token: string, plan: string, amount: number, plan_id?: number) {
  return apiRequest("/invest", {
    method: "POST",
    body: JSON.stringify({ plan, amount, plan_id }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getInvestments(token: string) {
  return apiRequest("/investments", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
