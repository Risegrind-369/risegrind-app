// REMOVED for v1.0: Manus OAuth replaced with Supabase Auth
// This file is kept for reference but all functionality is disabled.

import type { Express, Request, Response } from "express";

export function registerOAuthRoutes(app: Express) {
  // OAuth routes are now handled by Supabase Auth on the client side
  // The backend no longer needs to handle OAuth callbacks
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    res.status(401).json({ error: "Use Supabase Auth instead", user: null });
  });

  app.post("/api/auth/session", async (req: Request, res: Response) => {
    res.status(401).json({ error: "Use Supabase Auth instead" });
  });
}
