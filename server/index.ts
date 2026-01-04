// server/index.ts
import express from "express";
import cors from "cors";
import apiRoutes from "./api";

const app = express();

// ---------------------------
// JSON & URL-Encoded parsing
// ---------------------------
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------
// CORS CONFIG (IMPORTANT)
// ---------------------------
const allowedOrigins = [
  /^https:\/\/[a-z0-9-]+\.worf\.replit\.dev(:\d+)?$/, // your Replit dev domain
  "http://localhost:5173", // optional local dev
  process.env.FRONTEND_URL, // Production domain
].filter(Boolean) as (string | RegExp)[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.some((allowed) =>
          allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
        )
      ) {
        return callback(null, true);
      }

      console.log("❌ BLOCKED ORIGIN:", origin);
      callback(new Error("CORS blocked for origin: " + origin));
    },
    credentials: true,
  })
);

// Preflight
app.options("*", cors());

// ---------------------------
// Debug Log
// ---------------------------
app.use("/api", (req, _res, next) => {
  console.log(`API HIT: ${req.method} ${req.url}`, "BODY:", req.body);
  next();
});

// ---------------------------
// API Routes
// ---------------------------
app.use("/api", apiRoutes);

// ---------------------------
// Root Test Endpoint
// ---------------------------
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "77KAPITAL backend running" });
});

// ---------------------------
// Start Server
// ---------------------------
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
