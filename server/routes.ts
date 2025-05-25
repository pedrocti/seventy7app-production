import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Static assets handling if we want to add an API later
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Seventy7 Kapital API is running' });
  });

  const httpServer = createServer(app);

  return httpServer;
}
