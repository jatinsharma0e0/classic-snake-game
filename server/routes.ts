import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Serve static files from snake-game directory
  app.use('/snake', express.static(path.join(process.cwd(), 'snake-game')));

  // Route to serve Snake game HTML at root /snake
  app.get('/snake', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'snake-game', 'index.html'));
  });

  const httpServer = createServer(app);

  return httpServer;
}
