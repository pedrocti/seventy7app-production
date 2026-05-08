import { Router } from "express";
import { db } from "../../db/connection";
import { blog_posts } from "../../db/connection";
import { eq, desc } from "drizzle-orm";
const router = Router();
function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 80);
}
router.get("/", async (req, res) => {
  try {
    const posts = await db.select().from(blog_posts).orderBy(desc(blog_posts.created_at));
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch posts" });
  }
});
router.post("/", async (req, res) => {
  try {
    const { title, tag, excerpt, content, image_url, author, published } = req.body;
    if (!title || !excerpt || !content) return res.status(400).json({ success: false, error: "title, excerpt and content are required" });
    const [post] = await db.insert(blog_posts).values({
      title: title.trim(), slug: slugify(title), tag: tag || "Insights",
      excerpt: excerpt.trim(), content: content.trim(),
      image_url: image_url || null, author: author || "Seventy7 Kapital",
      published: !!published, published_at: published ? new Date() : null,
      updated_at: new Date(),
    }).returning();
    res.status(201).json({ success: true, post });
  } catch (err: any) {
    if (err?.code === "23505") return res.status(409).json({ success: false, error: "A post with this title already exists" });
    res.status(500).json({ success: false, error: "Failed to create post" });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid id" });
    const existing = await db.select().from(blog_posts).where(eq(blog_posts.id, id));
    if (!existing.length) return res.status(404).json({ success: false, error: "Post not found" });
    const { title, tag, excerpt, content, image_url, author, published } = req.body;
    const wasPublished = existing[0].published;
    const [post] = await db.update(blog_posts).set({
      ...(title     !== undefined && { title: title.trim(), slug: slugify(title) }),
      ...(tag       !== undefined && { tag }),
      ...(excerpt   !== undefined && { excerpt: excerpt.trim() }),
      ...(content   !== undefined && { content: content.trim() }),
      ...(image_url !== undefined && { image_url }),
      ...(author    !== undefined && { author }),
      ...(published !== undefined && { published: !!published, published_at: published && !wasPublished ? new Date() : existing[0].published_at }),
      updated_at: new Date(),
    }).where(eq(blog_posts.id, id)).returning();
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update post" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid id" });
    await db.delete(blog_posts).where(eq(blog_posts.id, id));
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete post" });
  }
});
export default router;
