import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health.js";
import { registerCopilotRoutes } from "./routes/copilot.js";

const app = Fastify({ logger: true });

await registerHealthRoutes(app);
await registerCopilotRoutes(app);

const port = Number(process.env.PORT ?? 8787);
const host = "0.0.0.0";

app.listen({ port, host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
