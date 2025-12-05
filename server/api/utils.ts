// server/api/utils.ts
import type { RequestHandler } from "express";
import { sql } from "drizzle-orm";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-fallback";

// ----------------------
// SAFE NUMERIC OPERATORS
// ----------------------
export const addToColumn = (column: any, amount: number) =>
  sql`(COALESCE(${column}, '0')::numeric + ${amount}::numeric)`;

export const subFromColumn = (column: any, amount: number) =>
  sql`(COALESCE(${column}, '0')::numeric - ${amount}::numeric)`;

// ----------------------
// AUTH MIDDLEWARE
// ----------------------
export const auth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ----------------------
// ADMIN CHECK
// ----------------------
export const adminOnly: RequestHandler = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
