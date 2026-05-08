import { Router } from "express";
import { db } from "../db/connection";
import { blog_posts } from "../db/connection";
import { eq, desc, and } from "drizzle-orm";
const router = Router();
router.get("/", async (req, res) => {
  try {
    const posts = await db.select().from(blog_posts).where(eq(blog_posts.published, true)).orderBy(desc(blog_posts.published_at));
    res.json({ success: true, posts });
  } catch (err) {
    console.error("[Blog] GET error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch posts" });
  }
});
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [post] = await db.select().from(blog_posts).where(and(eq(blog_posts.slug, slug), eq(blog_posts.published, true)));
    if (!post) return res.status(404).json({ success: false, error: "Post not found" });
    res.json({ success: true, post });
  } catch (err) {
    console.error("[Blog] GET slug error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch post" });
  }
});
export default router;
