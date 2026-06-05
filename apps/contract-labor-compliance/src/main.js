import "@legacy/shared-legacy-styles/legacy.css";
import { bootLegacyWorkbench } from "@legacy/shared-ui/legacy-workbench.js";

const modules = [
  { id: "contractors", label: "Contractors" },
  { id: "attestations", label: "Attestations" },
  { id: "access", label: "Access" },
  { id: "exceptions", label: "Exceptions" },
  { id: "history", label: "History" }
];

bootLegacyWorkbench({
  namespace: "contract-labor-compliance",
  title: "Contract Labor Compliance 2012",
  environmentName: "ONBOARD-COMPLIANCE-PROD12",
  analyst: "HROPS\\d.benson",
  workstationPrefix: "CLAB-WS",
  purpose: "Contractor onboarding and workforce-compliance management application.",
  modules,
  columns: {
    contractors: ["contractorId", "name", "vendor", "site", "status"],
    attestations: ["attestationId", "contractorId", "policy", "dueDate", "status"],
    access: ["accessId", "contractorId", "accessType", "approver", "status"],
    exceptions: ["exceptionId", "contractorId", "reason", "owner", "status"],
    history: ["historyId", "contractorId", "event", "createdOn", "status"]
  },
  palette: {
    "--legacy-bg": "#d7d6cf",
    "--legacy-panel": "#ecebe4",
    "--legacy-nav": "#cdccc1",
    "--legacy-grid-head": "#d7d5cb",
    "--legacy-active": "#4d6a5b",
    "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
  },
  appDescription: "LEGACY APP DESCRIPTION - Contract Labor Compliance 2012\n\nEnterprise onboarding operations center for contractor lifecycle, badge and VPN approvals, attestation workflows, and workforce exception handling.",
  seedData: {
    contractors: [
      { contractorId: "CL-501", name: "S. Morris", vendor: "TempCore", site: "Plant 1", status: "supervisor review required" },
      { contractorId: "CL-507", name: "K. Lane", vendor: "StaffHub", site: "Plant 2", status: "ERP export pending" }
    ],
    attestations: [
      { attestationId: "AT-73", contractorId: "CL-501", policy: "Safety", dueDate: "2012-04-02", status: "retry queue active" },
      { attestationId: "AT-77", contractorId: "CL-507", policy: "Code of Conduct", dueDate: "2012-04-06", status: "validation failed" }
    ],
    access: [
      { accessId: "AX-61", contractorId: "CL-501", accessType: "VPN", approver: "IT Security", status: "locked by another user" },
      { accessId: "AX-64", contractorId: "CL-507", accessType: "Badge", approver: "Facilities", status: "awaiting host acknowledgement" }
    ],
    exceptions: [
      { exceptionId: "EX-14", contractorId: "CL-477", reason: "Expired badge", owner: "HR Ops", status: "nightly processing in progress" },
      { exceptionId: "EX-15", contractorId: "CL-507", reason: "Missing attestation", owner: "Onboarding", status: "retry queue active" }
    ],
    history: [
      { historyId: "H-95", contractorId: "CL-501", event: "Last nightly sync: 2:17 AM", createdOn: "2012-03-28", status: "ERP export pending" },
      { historyId: "H-99", contractorId: "CL-507", event: "Access route escalated", createdOn: "2012-03-29", status: "supervisor review required" }
    ]
  },
  rpaUseCases: ["Onboarding automation", "Badge provisioning workflows", "VPN approval coordination", "Contractor-status synchronization", "Reminder generation", "Document validation"],
  moduleDescriptions: {
    contractors: "Contractor onboarding queue and lifecycle validation.",
    attestations: "Compliance attestation scheduling and reminders.",
    access: "Badge and VPN approval workflow routing.",
    exceptions: "Onboarding exception handling and escalation.",
    history: "Workforce history timeline and audit snapshots."
  },
  kpis: [{ moduleId: "contractors", label: "Contractors" }, { moduleId: "exceptions", label: "Exceptions" }],
  packetSections: [
    { title: "Contractors", moduleId: "contractors", fields: ["contractorId", "name", "vendor", "status"] },
    { title: "Access", moduleId: "access", fields: ["accessId", "accessType", "approver", "status"] },
    { title: "Exceptions", moduleId: "exceptions", fields: ["exceptionId", "reason", "owner", "status"] }
  ],
  initialQueueAging: 16,
  initialRetryBacklog: 3,
  formPlaceholder: "Manual contractor queue item",
  identityKey: "contract-labor-compliance-2012-onboarding"
});
