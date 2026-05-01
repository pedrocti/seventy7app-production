// server/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import http from "http";
import { WebSocketServer } from "ws";

import apiRoutes from "./api";
import { payoutProfitsJob } from "./jobs/profitPayout";
import { marketService } from "./services/marketService";

const app = express();

// ---------------------------
// ENV
// ---------------------------
const isProd = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || (isProd ? 3000 : 3100);

// ---------------------------
// SECURITY MIDDLEWARE
// ---------------------------
if (isProd) {
  app.use(helmet());

  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
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
  ...(isProd ? [] : [/^https:\/\/.*\.replit\.dev(:\d+)?$/]),
].filter(Boolean) as (string | RegExp)[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = allowedOrigins.some((o) =>
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
  res.json({ status: "ok" });
});

// ===========================
// 🔥 CREATE HTTP SERVER
// ===========================
const server = http.createServer(app);

// ===========================
// 🔥 WEBSOCKET SERVER
// ===========================
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🔌 Client connected to WS");
  marketService.addClient(ws);

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

// ===========================
// 🔥 START MARKET SERVICE
// ===========================
marketService.start();

// ===========================
// START SERVER
// ===========================
server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `✅ Server running (${isProd ? "PROD" : "DEV"}) on port ${PORT}`
  );
});

// ---------------------------
// BACKGROUND JOB
// ---------------------------
let running = false;

async function runJobSafe() {
  if (running) return;
  running = true;
  try {
    await payoutProfitsJob();
  } finally {
    running = false;
  }
}

runJobSafe();
setInterval(runJobSafe, 24 * 60 * 60 * 1000);