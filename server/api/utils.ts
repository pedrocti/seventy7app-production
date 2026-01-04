import type { RequestHandler } from "express";
import { sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import jwt from "jsonwebtoken";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

// ----------------------
// GLOBAL USER
// ----------------------
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string; username?: string };
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
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string; username?: string };
    req.user = {
      id: payload.id,
      role: payload.role,
      username: payload.username ?? undefined,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};


// ----------------------
// ADMIN HELPER
// ----------------------
export async function getAdmin<T extends typeof db | PgTransaction<any>>(tx: T) {
  const [admin] = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  if (!admin) throw new Error("Admin user not found");
  return admin;
}

// ----------------------
// ADMIN CHECK
// ----------------------
export const adminOnly: RequestHandler = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
