// vite.config.ts — Replit-friendly, environment-aware, fully proxied
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// Detect environment
// -----------------------------
const isProd = process.env.NODE_ENV === "production";

// -----------------------------
// Backend URL
// - Dev: local backend (Vite proxy to 0.0.0.0:3000)
// - Replit public preview: backend needs public URL
// - Prod: replace with your Hostinger backend URL
// -----------------------------
const BACKEND_URL = isProd
  ? "https://yourproductionbackend.com" // ← replace with Hostinger backend
  : process.env.REPLIT ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : "http://0.0.0.0:3000";

export default defineConfig(() => ({
  plugins: [react()],

  // Root folder for Vite
  root: path.resolve(__dirname, "client"),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },

  server: {
    host: true,
    port: 5000,
    strictPort: true, // prevents silent port changes
    allowedHosts: [".replit.dev", ".repl.co", ".id.repl.co"],

    // -----------------------------
    // Proxy backend routes
    // -----------------------------
    proxy: {
      "/auth": {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: isProd,
        ws: true,
      },
      "/api": {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: isProd,
        ws: true,
      },
      "/profile": {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: isProd,
      },
    },
  },

  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
}));
