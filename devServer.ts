import express, { Request, Response } from "express";
import path from "path";
import { app, ensureDatabaseReady } from "./server.js";

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  await ensureDatabaseReady();

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Makwa-Match server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error("Failed to start Makwa-Match server:", error);
    process.exit(1);
  });
}
