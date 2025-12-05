// src/api/transaction.ts

import { apiRequest } from "./http";

// NO TOKEN NEEDED ANYMORE — IT'S AUTOMATIC
export async function getTransactions() {
  return apiRequest("/transactions");
}