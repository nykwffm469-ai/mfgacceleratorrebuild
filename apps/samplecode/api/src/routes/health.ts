import { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    status: "ok",
    service: "mfg-api",
    timestamp: new Date().toISOString()
  }));
}
