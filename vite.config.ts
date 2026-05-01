import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";

const BACKEND_URL = isProd
  ? process.env.FRONTEND_BACKEND_URL || "https://yourproductionbackend.com"
  : "http://127.0.0.1:3100";

const DEV_FRONTEND_PORT = 5100;

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
    port: DEV_FRONTEND_PORT,
    strictPort: true,

    // ✅ FIXED: allowedHosts must be string[] or true
    allowedHosts: [".replit.dev", ".repl.co", ".id.repl.co"] as string[],

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
    outDir: path.resolve(__dirname, "client/dist"),
    emptyOutDir: true,
  },
});
