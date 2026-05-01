import { Router } from "express";
import { authMiddleware } from "../auth";
import {
  getNotifications,
  markNotificationRead,
} from "../../services/notifications";

const router = Router();

// GET /api/user/notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const notifications = await getNotifications(userId);
    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Notifications fetch error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch notifications" });
  }
});

// POST /api/user/notifications/read/:id
router.post("/read/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const notificationId = Number(req.params.id);

    await markNotificationRead(userId, notificationId);

    res.json({ success: true });
  } catch (err) {
    console.error("Mark read error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to mark notification as read" });
  }
});

export default router;
