// server/api.cjs
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const path = require("path");

// --- Config ---
const PORT = process.env.API_PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const DB_FILE = process.env.SQLITE_FILE || path.join(__dirname, "seventy7.db");

// --- DB setup ---
const db = new Database(DB_FILE);

// --- Create tables ---
db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS investments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan TEXT,
  amount INTEGER NOT NULL,
  start_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount_invested INTEGER NOT NULL DEFAULT 0,
  admin_percentage INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'ongoing',
  profit_loss INTEGER DEFAULT 0,
  start_time TEXT DEFAULT (datetime('now')),
  end_time TEXT
);

CREATE TABLE IF NOT EXISTS trade_clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  invested_amount INTEGER NOT NULL,
  profit_loss INTEGER DEFAULT 0,
  FOREIGN KEY(trade_id) REFERENCES trades(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// --- Helpers ---
function run(sql, params = []) {
  return db.prepare(sql).run(...params);
}
function get(sql, params = []) {
  return db.prepare(sql).get(...params);
}
function all(sql, params = []) {
  return db.prepare(sql).all(...params);
}

// --- Express app ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Utilities ---
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: "24h"
  });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing authorization header" });
  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid auth header" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}

// --- Routes ---

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Seventy7 Kapital API is running" });
});

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username and password required" });
    if (get("SELECT id FROM users WHERE username = ?", [username])) return res.status(400).json({ error: "username exists" });

    const hash = await bcrypt.hash(password, 10);
    const info = run("INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'client')", [username, email || null, hash]);
    const user = get("SELECT id, username, email, role, balance, created_at FROM users WHERE id = ?", [info.lastInsertRowid]);
    const token = generateToken(user);
    res.json({ success: true, user, token });
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ error: "registration failed" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) return res.status(400).json({ error: "invalid credentials" });
    if (!(await bcrypt.compare(password, user.password_hash))) return res.status(400).json({ error: "invalid credentials" });

    const safeUser = { id: user.id, username: user.username, email: user.email, role: user.role, balance: user.balance };
    const token = generateToken(safeUser);
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "login failed" });
  }
});

// Profile
app.get("/api/profile", authMiddleware, (req, res) => {
  const user = get("SELECT id, username, email, role, balance, created_at FROM users WHERE id = ?", [req.user.id]);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// Deposit
app.post("/api/deposit", authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    let { amount } = req.body;
    amount = Number(amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    run("INSERT INTO transactions (user_id, type, amount, status) VALUES (?, 'deposit', ?, 'completed')", [userId, amount]);
    run("UPDATE users SET balance = balance + ? WHERE id = ?", [amount, userId]);

    const user = get("SELECT id, username, balance FROM users WHERE id = ?", [userId]);
    res.json({ success: true, balance: user.balance });
  } catch (err) {
    console.error("deposit error", err);
    res.status(500).json({ error: "deposit failed" });
  }
});

// Withdraw
app.post("/api/withdraw", authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    let { amount } = req.body;
    amount = Number(amount);
    const user = get("SELECT id, balance FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!amount || amount <= 0 || amount > user.balance) return res.status(400).json({ error: "Invalid amount" });

    run("INSERT INTO transactions (user_id, type, amount, status) VALUES (?, 'withdraw', ?, 'completed')", [userId, amount]);
    run("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, userId]);

    const updated = get("SELECT id, balance FROM users WHERE id = ?", [userId]);
    res.json({ success: true, balance: updated.balance });
  } catch (err) {
    console.error("withdraw error", err);
    res.status(500).json({ error: "withdraw failed" });
  }
});

// Investments
app.post("/api/invest", authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { plan, amount } = req.body;
    const amt = Number(amount);
    const user = get("SELECT id, balance FROM users WHERE id = ?", [userId]);
    if (!amt || amt <= 0 || !user || amt > user.balance) return res.status(400).json({ error: "Invalid or insufficient funds" });

    run("UPDATE users SET balance = balance - ? WHERE id = ?", [amt, userId]);
    run("INSERT INTO investments (user_id, plan, amount, status) VALUES (?, ?, ?, 'active')", [userId, plan || "default", amt]);
    run("INSERT INTO transactions (user_id, type, amount, status) VALUES (?, 'invest', ?, 'completed')", [userId, amt]);

    const investments = all("SELECT * FROM investments WHERE user_id = ?", [userId]);
    res.json({ success: true, investments });
  } catch (err) {
    console.error("invest error", err);
    res.status(500).json({ error: "investment failed" });
  }
});

// Get user's investments
app.get("/api/investments", authMiddleware, (req, res) => {
  const investments = all("SELECT * FROM investments WHERE user_id = ?", [req.user.id]);
  res.json({ investments });
});

// Transactions
app.get("/api/transactions", authMiddleware, (req, res) => {
  const tx = all("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
  res.json({ transactions: tx });
});

// Admin: list users
app.get("/api/admin/users", authMiddleware, adminMiddleware, (req, res) => {
  const users = all("SELECT id, username, email, role, balance, created_at FROM users ORDER BY created_at DESC");
  res.json({ users });
});

// Admin: stats
app.get("/api/admin/stats", authMiddleware, adminMiddleware, (req, res) => {
  const totalUsers = get("SELECT COUNT(*) as cnt FROM users").cnt;
  const totalBalance = get("SELECT SUM(balance) as total FROM users").total || 0;
  const totalInvested = get("SELECT SUM(amount) as invested FROM investments").invested || 0;
  res.json({ totalUsers, totalBalance, totalInvested });
});

// Admin approve transaction
app.patch("/api/admin/transaction/:id/approve", authMiddleware, adminMiddleware, (req, res) => {
  const txId = Number(req.params.id);
  run("UPDATE transactions SET status = 'completed' WHERE id = ?", [txId]);
  res.json({ success: true });
});

// --- Create trades tables ---
db.exec(`
CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount_invested INTEGER NOT NULL DEFAULT 0,
  admin_percentage INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'ongoing', -- ongoing/completed
  profit_loss INTEGER DEFAULT 0,
  start_time TEXT DEFAULT (datetime('now')),
  end_time TEXT
);

CREATE TABLE IF NOT EXISTS trade_clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  invested_amount INTEGER NOT NULL,
  profit_loss INTEGER DEFAULT 0,
  FOREIGN KEY(trade_id) REFERENCES trades(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// --- ADMIN: create a new trade ---
app.post("/api/admin/trade", authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { title, admin_percentage = 10 } = req.body;
    if (!title) return res.status(400).json({ error: "Trade title required" });

    const info = run("INSERT INTO trades (title, admin_percentage) VALUES (?, ?)", [title, admin_percentage]);
    const trade = get("SELECT * FROM trades WHERE id = ?", [info.lastInsertRowid]);
    res.json({ success: true, trade });
  } catch (err) {
    console.error("create trade error", err);
    res.status(500).json({ error: "failed to create trade" });
  }
});

// --- ADMIN: update trade (amount, status, profit/loss) ---
app.patch("/api/admin/trade/:id", authMiddleware, adminMiddleware, (req, res) => {
  try {
    const tradeId = Number(req.params.id);
    const { amount_invested, status, profit_loss, end_time } = req.body;

    const trade = get("SELECT * FROM trades WHERE id = ?", [tradeId]);
    if (!trade) return res.status(404).json({ error: "Trade not found" });

    run(
      `UPDATE trades SET 
        amount_invested = COALESCE(?, amount_invested), 
        status = COALESCE(?, status), 
        profit_loss = COALESCE(?, profit_loss),
        end_time = COALESCE(?, end_time)
      WHERE id = ?`,
      [amount_invested, status, profit_loss, end_time, tradeId]
    );

    const updated = get("SELECT * FROM trades WHERE id = ?", [tradeId]);
    res.json({ success: true, trade: updated });
  } catch (err) {
    console.error("update trade error", err);
    res.status(500).json({ error: "failed to update trade" });
  }
});

// --- ADMIN: assign user profits after trade ---
app.post("/api/admin/trade/:id/profit", authMiddleware, adminMiddleware, (req, res) => {
  try {
    const tradeId = Number(req.params.id);
    const { profit_loss } = req.body; // total profit/loss for the trade

    const trade = get("SELECT * FROM trades WHERE id = ?", [tradeId]);
    if (!trade) return res.status(404).json({ error: "Trade not found" });

    // get all invested clients
    const clients = all("SELECT * FROM trade_clients WHERE trade_id = ?", [tradeId]);

    clients.forEach(c => {
      // client profit = (invested_amount / total_invested) * total_profit_loss
      const clientProfit = Math.round((c.invested_amount / trade.amount_invested) * profit_loss);
      run("UPDATE trade_clients SET profit_loss = ? WHERE id = ?", [clientProfit, c.id]);

      // update client balance
      run("UPDATE users SET balance = balance + ? WHERE id = ?", [clientProfit, c.user_id]);
    });

    // mark trade completed
    run("UPDATE trades SET profit_loss = ?, status = 'completed', end_time = datetime('now') WHERE id = ?", [profit_loss, tradeId]);

    res.json({ success: true, message: "Trade profits distributed", trade: get("SELECT * FROM trades WHERE id = ?", [tradeId]) });
  } catch (err) {
    console.error("trade profit error", err);
    res.status(500).json({ error: "failed to distribute profits" });
  }
});

// --- ADMIN: list all trades ---
app.get("/api/admin/trades", authMiddleware, adminMiddleware, (req, res) => {
  try {
    const trades = all("SELECT * FROM trades ORDER BY start_time DESC");
    res.json({ trades });
  } catch (err) {
    console.error("admin trades error", err);
    res.status(500).json({ error: "failed to fetch trades" });
  }
});

// --- CLIENT: get all active trades ---
app.get("/api/trades", authMiddleware, (req, res) => {
  try {
    const trades = all("SELECT * FROM trades WHERE status = 'ongoing' ORDER BY start_time DESC");
    res.json({ trades });
  } catch (err) {
    console.error("client trades error", err);
    res.status(500).json({ error: "failed to fetch trades" });
  }
});


// --- Start server ---
app.listen(PORT, () => console.log(`✅ API running at http://localhost:${PORT}`));
