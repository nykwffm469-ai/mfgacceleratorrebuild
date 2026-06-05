import "@legacy/shared-legacy-styles/legacy.css";
import { bootLegacyWorkbench } from "@legacy/shared-ui/legacy-workbench.js";

const modules = [
  { id: "controls", label: "Controls" },
  { id: "findings", label: "Findings" },
  { id: "remediation", label: "Remediation" },
  { id: "attestations", label: "Attestations" },
  { id: "audits", label: "Audits" }
];

bootLegacyWorkbench({
  namespace: "compliance-register",
  title: "Compliance Register 2005",
  environmentName: "GRC-REGISTER-PROD05",
  analyst: "RISKOPS\\k.barlow",
  workstationPrefix: "RISK-WS",
  purpose: "Centralized enterprise control register and remediation tracking platform.",
  modules,
  columns: {
    controls: ["controlId", "domain", "owner", "frequency", "status"],
    findings: ["findingId", "controlId", "severity", "owner", "status"],
    remediation: ["planId", "findingId", "dueDate", "owner", "status"],
    attestations: ["attestationId", "owner", "period", "result", "status"],
    audits: ["auditId", "scope", "lead", "window", "status"]
  },
  palette: {
    "--legacy-bg": "#d6d6d0",
    "--legacy-panel": "#ecece6",
    "--legacy-nav": "#cdccc3",
    "--legacy-grid-head": "#d7d6ce",
    "--legacy-active": "#5f684a",
    "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
  },
  appDescription: "LEGACY APP DESCRIPTION - Compliance Register 2005\n\nLegacy governance-risk-compliance workspace used to maintain control inventories, finding escalation, remediation workflows, attestation tracking, and audit preparation queues.",
  seedData: {
    controls: [
      { controlId: "CTL-101", domain: "Access", owner: "Security", frequency: "Quarterly", status: "supervisor review required" },
      { controlId: "CTL-102", domain: "Change", owner: "IT Ops", frequency: "Monthly", status: "ERP export pending" }
    ],
    findings: [
      { findingId: "FND-44", controlId: "CTL-101", severity: "High", owner: "Security", status: "retry queue active" },
      { findingId: "FND-46", controlId: "CTL-102", severity: "Medium", owner: "IT Ops", status: "validation failed" }
    ],
    remediation: [
      { planId: "RM-22", findingId: "FND-44", dueDate: "2005-02-15", owner: "Security", status: "locked by another user" },
      { planId: "RM-28", findingId: "FND-46", dueDate: "2005-02-22", owner: "IT Ops", status: "awaiting host acknowledgement" }
    ],
    attestations: [
      { attestationId: "ATT-7", owner: "IT Ops", period: "2005-Q1", result: "Pending", status: "nightly processing in progress" },
      { attestationId: "ATT-9", owner: "Security", period: "2005-Q1", result: "Draft", status: "retry queue active" }
    ],
    audits: [
      { auditId: "AUD-91", scope: "SOX", lead: "Internal Audit", window: "Feb", status: "ERP export pending" },
      { auditId: "AUD-95", scope: "ITGC", lead: "Risk Audit", window: "Mar", status: "supervisor review required" }
    ]
  },
  rpaUseCases: ["Remediation follow-up reminders", "Spreadsheet synchronization", "Audit evidence processing", "Finding escalation workflows", "Attestation tracking automation"],
  moduleDescriptions: {
    controls: "Control inventory operations and ownership routing.",
    findings: "Finding escalation queues with severity and owner tracking.",
    remediation: "Remediation plans coordinated through spreadsheet and tracker sync.",
    attestations: "Attestation workflow batches and route-to-approval chains.",
    audits: "Audit preparation window with packet assembly and status review."
  },
  kpis: [{ moduleId: "controls", label: "Controls" }, { moduleId: "findings", label: "Findings" }],
  packetSections: [
    { title: "Findings", moduleId: "findings", fields: ["findingId", "severity", "owner", "status"] },
    { title: "Remediation", moduleId: "remediation", fields: ["planId", "dueDate", "owner", "status"] },
    { title: "Audits", moduleId: "audits", fields: ["auditId", "scope", "lead", "status"] }
  ],
  initialQueueAging: 21,
  initialRetryBacklog: 5,
  formPlaceholder: "Manual compliance queue item",
  identityKey: "compliance-register-2005-grc-ops"
});
