export type SupplierSnapshot = {
  supplierId: string;
  legalName: string;
  region: string;
  status: "candidate" | "qualified" | "onboarding" | "active" | "blocked";
  riskScore: number;
  capabilities: string[];
  certifications: string[];
  openActions: number;
};

export type RiskSignal = {
  title: string;
  level: "low" | "moderate" | "high" | "critical";
  summary: string;
  owner: string;
};

export type ChecklistItem = {
  area: string;
  done: boolean;
  notes: string;
};

export type TimelineItem = {
  date: string;
  event: string;
  stage: string;
};

const suppliers: SupplierSnapshot[] = [
  {
    supplierId: "SUP-1024",
    legalName: "Contoso Precision Works",
    region: "NA",
    status: "onboarding",
    riskScore: 62,
    capabilities: ["CNC", "Anodizing"],
    certifications: ["ISO9001"],
    openActions: 3
  },
  {
    supplierId: "SUP-4408",
    legalName: "Fabrikam Components GmbH",
    region: "EU",
    status: "qualified",
    riskScore: 31,
    capabilities: ["Forging", "Heat Treat", "Metrology"],
    certifications: ["IATF16949", "ISO14001"],
    openActions: 1
  },
  {
    supplierId: "SUP-8890",
    legalName: "Northwind Materials",
    region: "APAC",
    status: "candidate",
    riskScore: 77,
    capabilities: ["Polymers"],
    certifications: ["ISO9001"],
    openActions: 5
  }
];

const riskSignals: RiskSignal[] = [
  {
    title: "Financial instability trend",
    level: "high",
    summary: "Credit outlook moved from stable to negative in last 90 days.",
    owner: "Finance Ops"
  },
  {
    title: "Regulatory certification mismatch",
    level: "moderate",
    summary: "Supplier claims ISO14001 but latest certificate is expired.",
    owner: "Compliance"
  },
  {
    title: "On-time delivery variance",
    level: "moderate",
    summary: "Late shipment rate increased from 4% to 11% this quarter.",
    owner: "Logistics"
  },
  {
    title: "Quality incident velocity",
    level: "critical",
    summary: "Three non-conformance events opened within 14 days.",
    owner: "Quality Engineering"
  }
];

const qualificationChecklist: ChecklistItem[] = [
  { area: "Legal entity validation", done: true, notes: "TIN and registration verified." },
  { area: "Capability verification", done: true, notes: "Factory visit completed and recorded." },
  { area: "Security and data terms", done: false, notes: "DPA redlines pending legal review." },
  { area: "EDI readiness", done: false, notes: "ASN payload mapping requires one more test cycle." }
];

const onboardingTimeline: TimelineItem[] = [
  { date: "2026-05-04", event: "Supplier application submitted", stage: "Intake" },
  { date: "2026-05-10", event: "Risk triage completed", stage: "Assessment" },
  { date: "2026-05-19", event: "Conditional qualification approved", stage: "Approval" },
  { date: "2026-05-27", event: "Pilot purchase order issued", stage: "Activation" }
];

export function listSuppliers() {
  return suppliers;
}

export function resolveSupplierAction(supplierId: string) {
  const supplier = suppliers.find((item) => item.supplierId === supplierId);
  if (!supplier) {
    return null;
  }

  supplier.openActions = Math.max(0, supplier.openActions - 1);
  return supplier;
}

export function listRiskSignals() {
  return riskSignals;
}

export function escalateRiskSignal(title: string) {
  const signal = riskSignals.find((item) => item.title === title);
  if (!signal) {
    return null;
  }

  signal.level = "critical";
  signal.owner = "Executive Risk Council";
  return signal;
}

export function listChecklist() {
  return qualificationChecklist;
}

export function toggleChecklist(area: string) {
  const item = qualificationChecklist.find((entry) => entry.area === area);
  if (!item) {
    return null;
  }

  item.done = !item.done;
  return item;
}

export function listTimeline() {
  return onboardingTimeline;
}

export function appendTimelineCheckpoint(event: string, stage: string) {
  const date = new Date().toISOString().slice(0, 10);
  const checkpoint: TimelineItem = { date, event, stage };
  onboardingTimeline.unshift(checkpoint);
  return checkpoint;
}
