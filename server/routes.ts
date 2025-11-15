import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

const SECRET = "supersecretjwtkey"; // ⚠️ change this in production

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());

  // ✅ Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Seventy7 Kapital API is running" });
  });

  // ✅ Register
  app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Missing username or password" });

    const existing = await storage.getUserByUsername(username);
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      username,
      password: hashed,
      balance: 0,
      investments: [],
    });

    res.json({ message: "User registered successfully", user });
  });

  // ✅ Login
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: "2h" });
    res.json({ token, user });
  });

  // ✅ Middleware to verify JWT
  const auth = (req: any, res: any, next: any) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Missing token" });
    try {
      const decoded = jwt.verify(header.split(" ")[1], SECRET);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // ✅ Deposit
  app.post("/api/deposit", auth, async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Invalid amount" });

    const user = await storage.getUser(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.balance += amount;
    res.json({ message: "Deposit successful", balance: user.balance });
  });

  // ✅ Withdraw
  app.post("/api/withdraw", auth, async (req, res) => {
    const { amount } = req.body;
    const user = await storage.getUser(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (amount > user.balance)
      return res.status(400).json({ error: "Insufficient balance" });

    user.balance -= amount;
    res.json({ message: "Withdrawal successful", balance: user.balance });
  });

  // ✅ Invest
  app.post("/api/invest", auth, async (req, res) => {
    const { plan, amount } = req.body;
    const user = await storage.getUser(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (amount > user.balance)
      return res.status(400).json({ error: "Insufficient balance" });

    user.balance -= amount;
    user.investments.push({
      plan,
      amount,
      startDate: new Date(),
      progress: 0,
    });

    res.json({
      message: "Investment started successfully",
      investments: user.investments,
    });
  });

  // ✅ Fetch Investments
  app.get("/api/investments", auth, async (req, res) => {
    const user = await storage.getUser(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.investments);
  });

  const httpServer = createServer(app);
  return httpServer;
}
