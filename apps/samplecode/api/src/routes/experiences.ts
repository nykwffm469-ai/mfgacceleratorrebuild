import { FastifyInstance } from "fastify";
import {
  appendTimelineCheckpoint,
  escalateRiskSignal,
  listChecklist,
  listRiskSignals,
  listSuppliers,
  listTimeline,
  resolveSupplierAction,
  toggleChecklist
} from "../data/experienceStore.js";

type TimelineBody = {
  event?: string;
  stage?: string;
};

export async function registerExperienceRoutes(app: FastifyInstance) {
  app.get("/experiences/suppliers", async () => listSuppliers());

  app.post<{ Params: { supplierId: string } }>(
    "/experiences/suppliers/:supplierId/resolve-action",
    async (request, reply) => {
      const updated = resolveSupplierAction(request.params.supplierId);
      if (!updated) {
        return reply.code(404).send({ error: "Supplier not found" });
      }
      return updated;
    }
  );

  app.get("/experiences/risk-signals", async () => listRiskSignals());

  app.post<{ Params: { title: string } }>(
    "/experiences/risk-signals/:title/escalate",
    async (request, reply) => {
      const updated = escalateRiskSignal(request.params.title);
      if (!updated) {
        return reply.code(404).send({ error: "Risk signal not found" });
      }
      return updated;
    }
  );

  app.get("/experiences/qualification-checklist", async () => listChecklist());

  app.post<{ Params: { area: string } }>(
    "/experiences/qualification-checklist/:area/toggle",
    async (request, reply) => {
      const updated = toggleChecklist(request.params.area);
      if (!updated) {
        return reply.code(404).send({ error: "Checklist item not found" });
      }
      return updated;
    }
  );

  app.get("/experiences/onboarding-timeline", async () => listTimeline());

  app.post<{ Body: TimelineBody }>("/experiences/onboarding-timeline/checkpoint", async (request, reply) => {
    const event = request.body?.event?.trim();
    const stage = request.body?.stage?.trim();

    if (!event || !stage) {
      return reply.code(400).send({ error: "event and stage are required" });
    }

    return appendTimelineCheckpoint(event, stage);
  });
}
