// vite.config.ts — environment-aware, production-ready, fully proxied
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
// - Dev: local backend (use 127.0.0.1 to avoid IPv6/localhost issues)
// - Replit: same (Vite proxy handles public URL)
// - Prod: Hostinger backend URL or same domain if integrated
// -----------------------------
const BACKEND_URL = isProd
  ? "https://yourproductionbackend.com" // ← replace with Hostinger backend
  : "http://127.0.0.1:3000";           // dev & Replit proxy use IPv4 loopback

export default defineConfig({
  plugins: [react()],

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
    strictPort: true,
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
});
