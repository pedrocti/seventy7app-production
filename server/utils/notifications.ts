import { db } from "../db/connection";
import { notifications } from "../db/schema";

// server/utils/notifications.ts
export async function createNotification(
  userId: number,
  title: string,
  message: string
) {
  await db.insert(notifications).values({
    user_id: userId,
    title,
    message,
  });
}