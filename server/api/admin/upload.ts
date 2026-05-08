import { Router } from "express";
import { uploadImage } from "../../services/cloudinary.service";
const router = Router();
router.post("/image", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== "string") return res.status(400).json({ success: false, error: "No image data provided" });
    if (!data.startsWith("data:image/")) return res.status(400).json({ success: false, error: "Invalid image format" });
    if (Buffer.byteLength(data, "utf8") > 10 * 1024 * 1024) return res.status(400).json({ success: false, error: "Image too large — max 10MB" });
    const url = await uploadImage(data);
    res.json({ success: true, url });
  } catch (err: any) {
    console.error("[Upload] Cloudinary error:", err?.message || err);
    res.status(500).json({ success: false, error: "Upload failed — please try again" });
  }
});
export default router;
