import { z } from "zod";

export const SupplierStatusSchema = z.enum([
  "candidate",
  "qualified",
  "onboarding",
  "active",
  "blocked"
]);

export const SupplierSchema = z.object({
  supplierId: z.string().min(1),
  legalName: z.string().min(2),
  region: z.string().min(2),
  riskScore: z.number().min(0).max(100),
  status: SupplierStatusSchema,
  capabilities: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([])
});

export const SupplierAssessmentRequestSchema = z.object({
  supplierId: z.string().min(1),
  signals: z.array(z.string()).min(1),
  promptContext: z.string().optional()
});

export type Supplier = z.infer<typeof SupplierSchema>;
export type SupplierAssessmentRequest = z.infer<typeof SupplierAssessmentRequestSchema>;
