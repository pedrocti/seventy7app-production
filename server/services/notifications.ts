import { db } from "../db/connection";
import { notifications } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getNotifications(userId: number) {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at));
}

export async function markNotificationRead(userId: number, id: number) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.user_id, userId),
        eq(notifications.id, id)
      )
    );
}
