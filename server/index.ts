// server/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import http from "http";
import { WebSocketServer } from "ws";

import apiRoutes from "./api.js";
import { payoutProfitsJob } from "./jobs/profitPayout.js";
import { marketService } from "./services/marketService.js";

const app = express();

// ---------------------------
// ENV
// ---------------------------
const isProd = process.env.NODE_ENV === "production";
const PORT   = Number(process.env.PORT) || (isProd ? 3000 : 3100);

// ---------------------------
// SECURITY MIDDLEWARE
// ---------------------------
if (isProd) {
  app.use(helmet());
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      max:      100,
    })
  );
}

// ---------------------------
// BODY PARSING
// ---------------------------
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------
// CORS
// ---------------------------
const allowedOrigins = [
  "http://localhost:5100",

  process.env.FRONTEND_URL,

  "https://www.seventy7hub.com",
  "https://seventy7hub.com",

  ...(isProd ? [] : [/^https:\/\/.*\.replit\.dev(:\d+)?$/]),
].filter(Boolean) as (string | RegExp)[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some(o =>
        o instanceof RegExp ? o.test(origin) : o === origin
      );
      if (allowed) return callback(null, true);
      console.warn("❌ BLOCKED ORIGIN:", origin);
      callback(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

app.options("*", cors());

// ---------------------------
// DEV LOGGING
// ---------------------------
if (!isProd) {
  app.use("/api", (req, _res, next) => {
    console.log(`[DEV] ${req.method} ${req.url}`, req.body);
    next();
  });
}

// ---------------------------
// API ROUTES
// ---------------------------
app.use("/api", apiRoutes);

// ---------------------------
// STATIC FRONTEND
// ---------------------------
if (isProd) {
  const clientBuildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuildPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// ---------------------------
// HEALTH CHECK
// ---------------------------
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===========================
// HTTP SERVER
// ===========================
const server = http.createServer(app);

// ===========================
// WEBSOCKET SERVER
// ===========================
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🔌 WS client connected");
  marketService.addClient(ws);
  ws.on("close", () => console.log("❌ WS client disconnected"));
});

// ===========================
// MARKET SERVICE
// ===========================
marketService.start();

// ===========================
// START SERVER
// ===========================
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running (${isProd ? "PROD" : "DEV"}) on port ${PORT}`);
});

// ===========================
// PAYOUT JOB SCHEDULER
// ===========================
// Runs every HOUR so monthly payouts are picked up within 60 minutes
// of their due date. The job itself is idempotent — it only pays out
// investments where next_payout_at <= now, so running hourly is safe.
// A running-flag prevents concurrent executions.
// ===========================

let jobRunning = false;

async function runPayoutJob() {
  if (jobRunning) {
    console.log("[Scheduler] Payout job already running — skipped");
    return;
  }
  jobRunning = true;
  try {
    await payoutProfitsJob();
  } catch (err) {
    console.error("[Scheduler] Unhandled payout job error:", err);
  } finally {
    jobRunning = false;
  }
}

// Run once immediately on startup to catch any missed payouts
// (e.g. after a server restart)
runPayoutJob();

// Then every hour
const ONE_HOUR_MS = 60 * 60 * 1000;
setInterval(runPayoutJob, ONE_HOUR_MS);

console.log("[Scheduler] Payout job scheduled — runs every 60 minutes");
