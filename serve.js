import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import apiRouter from "./server/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------
// Middleware
// ------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------
// API routes
// ------------------------
app.use("/api", apiRouter); // all routes under /api

// ------------------------
// Serve React static files (production)
// ------------------------
const clientBuildPath = join(__dirname, "client", "dist");
app.use(express.static(clientBuildPath));

// Serve index.html for all other routes (client-side routing)
app.get("*", (req, res) => {
  res.sendFile(join(clientBuildPath, "index.html"));
});

// ------------------------
// Start server
// ------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Seventy7 Kapital running on port ${PORT}`);
});
