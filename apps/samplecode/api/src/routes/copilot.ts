import { FastifyInstance } from "fastify";
import OpenAI from "openai";
import { SupplierAssessmentRequestSchema } from "@mfg/domain";

export async function registerCopilotRoutes(app: FastifyInstance) {
  app.post("/copilot/supplier-assessment", async (request, reply) => {
    const parsed = SupplierAssessmentRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        recommendation: "OPENAI_API_KEY is not configured. Returning fallback assessment.",
        riskBand: "moderate"
      };
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

    const completion = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: "You are a manufacturing supplier risk analyst. Respond in concise JSON."
        },
        {
          role: "user",
          content: JSON.stringify(parsed.data)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "supplier_assessment",
          schema: {
            type: "object",
            properties: {
              riskBand: {
                type: "string",
                enum: ["low", "moderate", "high", "critical"]
              },
              recommendation: { type: "string" },
              nextActions: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["riskBand", "recommendation", "nextActions"],
            additionalProperties: false
          }
        }
      }
    });

    return completion.output_text;
  });
}
