import { db } from "./db/connection";
import * as schema from "./db/schema";
import {
  eq,
  and,
  desc,
  isNull,
} from "drizzle-orm";

// Storage interface (optional)
export const storage = {
  /* ===========================
        USERS
  ============================ */
  async getUser(id: number) {
    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return rows[0];
  },

  async getUserByUsername(username: string) {
    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    return rows[0];
  },

  // normalise incoming user keys to DB column names
  async createUser(data: any) {
    // accept either passwordHash or password_hash
    const payload: any = { ...data };
    if (payload.passwordHash && !payload.password_hash) {
      payload.password_hash = payload.passwordHash;
      delete payload.passwordHash;
    }
    // ensure required fields exist
    payload.email = payload.email ?? "";
    payload.role = payload.role ?? "client";
    payload.balance = payload.balance ?? 0;

    const rows = await db.insert(schema.users).values(payload).returning();
    return rows[0];
  },

  /* ===========================
        PLANS
  ============================ */
  async listPlans() {
    return await db.select().from(schema.plans).orderBy(desc(schema.plans.id));
  },

  async createPlan(data: any) {
    const rows = await db.insert(schema.plans).values(data).returning();
    return rows[0];
  },

  async updatePlan(id: number, patch: any) {
    const rows = await db
      .update(schema.plans)
      .set(patch)
      .where(eq(schema.plans.id, id))
      .returning();
    return rows[0];
  },

  async deletePlan(id: number) {
    await db.delete(schema.plans).where(eq(schema.plans.id, id));
    return true;
  },

  /* ===========================
        REQUESTS
  ============================ */
  async createRequest(data: any) {
    const rows = await db.insert(schema.investment_requests).values(data).returning();
    return rows[0];
  },

  async listRequests(filter: { user_id?: number; status?: string }) {
    let where: any[] = [];

    if (filter.user_id) where.push(eq(schema.investment_requests.user_id, filter.user_id));
    if (filter.status) where.push(eq(schema.investment_requests.status, filter.status));

    return await db
      .select()
      .from(schema.investment_requests)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(schema.investment_requests.id));
  },

  async updateRequestStatus(id: number, status: string) {
    const rows = await db
      .update(schema.investment_requests)
      .set({ status })
      .where(eq(schema.investment_requests.id, id))
      .returning();
    return rows[0];
  },

  /* Approve → create investment */
  async approveRequestAndCreateInvestment(id: number) {
    const reqRows = await db
      .select()
      .from(schema.investment_requests)
      .where(eq(schema.investment_requests.id, id))
      .limit(1);

    const req = reqRows[0];
    if (!req) throw new Error("Request not found");

    if (req.status !== "pending") throw new Error("Already processed");

    // mark request approved
    await db
      .update(schema.investment_requests)
      .set({ status: "approved" })
      .where(eq(schema.investment_requests.id, id));

    // create investment
    const invRows = await db
      .insert(schema.investments)
      .values({
        user_id: req.user_id,
        plan_id: req.plan_id,
        amount: req.amount,
        profit_loss: 0,
        progress: 0,
      })
      .returning();

    return invRows[0];
  },

  /* ===========================
        INVESTMENTS
  ============================ */
  async listInvestments(filter: { user_id?: number; plan_id?: number }) {
    let where: any[] = [];

    if (filter.user_id) where.push(eq(schema.investments.user_id, filter.user_id));
    if (filter.plan_id) where.push(eq(schema.investments.plan_id, filter.plan_id));

    return await db
      .select()
      .from(schema.investments)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(schema.investments.id));
  },

  async updateInvestment(id: number, patch: any) {
    const rows = await db
      .update(schema.investments)
      .set(patch)
      .where(eq(schema.investments.id, id))
      .returning();
    return rows[0];
  },

  /* ===========================
        PNL LOGS
  ============================ */
  async createPnlLog(plan_id: number, percent: number, totalProfit: number) {
    const rows = await db
      .insert(schema.pnl_logs)
      .values({ plan_id, percent, total_profit: totalProfit })
      .returning();
    return rows[0];
  },
};
