import { apiRequest } from "./http";

export function getPlans() {
  return apiRequest("/api/plans");
}
