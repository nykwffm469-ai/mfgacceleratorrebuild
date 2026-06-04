import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerHealthRoutes } from "./routes/health.js";
import { registerCopilotRoutes } from "./routes/copilot.js";
import { registerExperienceRoutes } from "./routes/experiences.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true
});

await registerHealthRoutes(app);
await registerCopilotRoutes(app);
await registerExperienceRoutes(app);

const port = Number(process.env.PORT ?? 8787);
const host = "0.0.0.0";

app.listen({ port, host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
