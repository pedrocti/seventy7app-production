import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/connection";
import { users, transactions } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "./utils";

/* --------------------------------------------------
   Types
-------------------------------------------------- */

interface AuthenticatedUser {
  id: number;
  username: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

const router = Router();

/* --------------------------------------------------
   Apply auth middleware safely
-------------------------------------------------- */
router.use(auth);

/* --------------------------------------------------
   GET /api/user/profile
-------------------------------------------------- */
router.get(
  "/profile",
  async (req: Request, res: Response) => {
    const userReq = req as AuthenticatedRequest;

    try {
      if (!userReq.user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          balance: users.balance,
          bonus_balance: users.bonus_balance,
          referral_code: users.referral_code,
          referred_by: users.referred_by,
        })
        .from(users)
        .where(eq(users.id, userReq.user.id))
        .limit(1);

      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email ?? "",
          role: user.role,
          balance: Number(user.balance ?? 0).toFixed(2),
          bonus_balance: Number(user.bonus_balance ?? 0).toFixed(2),
          referral_code: user.referral_code ?? null,
          referred_by: user.referred_by ?? null,
        },
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

/* --------------------------------------------------
   GET /api/user/transactions
-------------------------------------------------- */
router.get(
  "/transactions",
  async (req: Request, res: Response) => {
    const userReq = req as AuthenticatedRequest;

    if (!userReq.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
      const rows = await db
        .select()
        .from(transactions)
        .where(eq(transactions.user_id, userReq.user.id))
        .orderBy(desc(transactions.id));

      const formatted = rows.map((tx) => {
        const amount = Number(tx.amount ?? 0) / 100;
        const signedAmount =
          tx.type === "withdrawal" ? -amount : amount;

        let reject_reason: string | null = null;

        if (tx.details) {
          try {
            const parsed =
              typeof tx.details === "string"
                ? JSON.parse(tx.details)
                : tx.details;

            reject_reason = parsed?.reject_reason ?? null;
          } catch {
            reject_reason = null;
          }
        }

        return {
          id: tx.id,
          type: tx.type,
          amount: Number(signedAmount.toFixed(2)),
          status: tx.status,
          created_at: tx.created_at,
          reject_reason,
        };
      });

      return res.json({ success: true, transactions: formatted });
    } catch (err) {
      console.error("User transactions fetch error:", err);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

/* --------------------------------------------------
   GET /api/user/referrals
-------------------------------------------------- */
router.get(
  "/referrals",
  async (req: Request, res: Response) => {
    const userReq = req as AuthenticatedRequest;

    if (!userReq.user) {
      return res
        .status(401)
        .json({ success: false, count: 0, error: "Unauthorized" });
    }

    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.referred_by, userReq.user.id));

      return res.json({
        success: true,
        count: Number(result?.count ?? 0),
      });
    } catch (err) {
      console.error("Referral count fetch error:", err);
      return res.status(500).json({
        success: false,
        count: 0,
        error: "Failed to fetch referrals",
      });
    }
  }
);

export default router;
