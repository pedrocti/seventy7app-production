import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";

// --- Database setup ---
const db = drizzle(new Database("seventy7.db"));

// Define users table
const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: text("role").default("client"),
});

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "super_secret_key"; // change later

// --- REGISTER ---
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) return res.status(400).json({ error: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  db.insert(users).values({ name, email, password_hash: hashed }).run();

  res.json({ success: true, message: "User registered successfully" });
});

// --- LOGIN ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ success: true, token });
});

// --- PROFILE (Protected) ---
app.get("/api/profile", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = db.select().from(users).where(eq(users.id, decoded.id)).get();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(5050, () =>
  console.log("✅ API running on http://localhost:5050")
);
