// server/services/cloudinary.service.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64 image string to Cloudinary.
 * Returns the secure URL.
 */
export async function uploadImage(
  base64Data: string,
  folder = "seventy7/blog"
): Promise<string> {
  const result = await cloudinary.uploader.upload(base64Data, {
    folder,
    resource_type: "image",
    transformation: [
      { width: 1200, height: 630, crop: "fill", gravity: "auto" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
  return result.secure_url;
}

/**
 * Delete an image from Cloudinary by its public_id.
 * Safe to call — won't throw if image doesn't exist.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    // Extract public_id from URL
    // e.g. https://res.cloudinary.com/cloud/image/upload/v123/seventy7/blog/abc.jpg
    const parts   = url.split("/");
    const file    = parts[parts.length - 1].split(".")[0];
    const folder  = parts[parts.length - 2];
    const publicId = `${folder}/${file}`;
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Non-fatal — image may have already been deleted
  }
}