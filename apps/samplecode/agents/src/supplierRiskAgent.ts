import { Supplier } from "@mfg/domain";

export function calculateHeuristicRisk(supplier: Supplier): number {
  const base = 100 - supplier.riskScore;
  const capabilityPenalty = Math.max(0, 3 - supplier.capabilities.length) * 6;
  const certificationPenalty = Math.max(0, 2 - supplier.certifications.length) * 9;
  return Math.min(100, base + capabilityPenalty + certificationPenalty);
}

const sampleSupplier: Supplier = {
  supplierId: "SUP-1024",
  legalName: "Contoso Precision Works",
  region: "NA",
  riskScore: 62,
  status: "onboarding",
  capabilities: ["CNC", "anodizing"],
  certifications: ["ISO9001"]
};

const risk = calculateHeuristicRisk(sampleSupplier);
console.log(JSON.stringify({ supplierId: sampleSupplier.supplierId, risk }, null, 2));
