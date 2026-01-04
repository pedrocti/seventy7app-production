import crypto from "crypto";

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function getExpiry(hours = 1) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}
