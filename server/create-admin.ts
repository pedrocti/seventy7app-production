import "dotenv/config";
import { db, users } from "./db/connection.js"; // <-- use .js for ESM runtime
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";


async function createAdmin() {
  const username = "admin";
  const password = "admin123";

  try {
    console.log("Checking for existing admin...");

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    console.log("Existing admin result:", existing);

    if (existing.length > 0) {
      console.log("⚠️ Admin already exists.");
      return;
    }

    const hash = await bcrypt.hash(password, 10);

    const inserted = await db.insert(users).values({
      username,
      email: "admin@crypto.com",
      password_hash: hash,
      role: "admin",
      balance: "1000000.00",
      email_verified_at: new Date(), // ✅ Mark admin as verified by default
    }).returning();

    console.log("Inserted admin:", inserted);

    console.log("✅ ADMIN CREATED SUCCESSFULLY!");
    console.log("Username:", username);
    console.log("Password:", password);

  } catch (err) {
    console.error("❌ Error creating admin:", err);
  }
}

createAdmin();
