import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerActivityRoutes } from "./routes/activity.js";

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: true,
  credentials: true
});

server.get("/health", async () => ({ status: "ok" }));

await server.register(registerActivityRoutes, { prefix: "/api" });

const port = Number(process.env.PORT || 5001);
const host = process.env.HOST || "0.0.0.0";

try {
  await server.listen({ port, host });
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
