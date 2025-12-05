// vite.config.ts — Replit-friendly with client root + proxy to backend
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [react()],

    // keep root pointed at your client folder (your project expects this)
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
      allowedHosts: [".replit.dev", ".repl.co", ".id.repl.co"],

      // This target (0.0.0.0:3000) is the one you used earlier that worked on Replit.
      proxy: {
        "/api": {
          target: "http://0.0.0.0:3000",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },

    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
  };
});
