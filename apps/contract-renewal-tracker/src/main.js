import "@legacy/shared-legacy-styles/legacy.css";
import { bootLegacyWorkbench } from "@legacy/shared-ui/legacy-workbench.js";

const modules = [
  { id: "contracts", label: "Contracts" },
  { id: "clauses", label: "Clause Review" },
  { id: "reminders", label: "Reminders" },
  { id: "approvals", label: "Approvals" },
  { id: "archives", label: "Archive" }
];

bootLegacyWorkbench({
  namespace: "contract-renewal-tracker",
  title: "Contract Renewal Tracker 2007",
  environmentName: "LEGAL-RENEWALS-PROD07",
  analyst: "LEGALOPS\\r.finch",
  workstationPrefix: "LGL-WS",
  purpose: "Legal operations renewal-management and contract lifecycle application.",
  modules,
  columns: {
    contracts: ["contractId", "counterparty", "renewalDate", "owner", "status"],
    clauses: ["reviewId", "contractId", "riskClause", "reviewer", "status"],
    reminders: ["reminderId", "contractId", "channel", "sendDate", "status"],
    approvals: ["approvalId", "contractId", "approver", "dueDate", "status"],
    archives: ["archiveId", "contractId", "location", "retention", "status"]
  },
  palette: {
    "--legacy-bg": "#d5d9df",
    "--legacy-panel": "#edf1f7",
    "--legacy-nav": "#c9d1dc",
    "--legacy-grid-head": "#d2dbe7",
    "--legacy-active": "#3a5877",
    "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
  },
  appDescription: "LEGACY APP DESCRIPTION - Contract Renewal Tracker 2007\n\nLegal operations shared-services platform for renewal timelines, clause-review routing, approvals, reminder campaigns, and archival synchronization.",
  seedData: {
    contracts: [
      { contractId: "CTR-780", counterparty: "Northwind Freight", renewalDate: "2007-10-02", owner: "Legal Ops", status: "supervisor review required" },
      { contractId: "CTR-794", counterparty: "Crown Shipping", renewalDate: "2007-10-19", owner: "Commercial Legal", status: "ERP export pending" }
    ],
    clauses: [
      { reviewId: "CR-42", contractId: "CTR-780", riskClause: "Auto-renew", reviewer: "Counsel", status: "retry queue active" },
      { reviewId: "CR-45", contractId: "CTR-794", riskClause: "Termination", reviewer: "Senior Counsel", status: "validation failed" }
    ],
    reminders: [
      { reminderId: "REM-88", contractId: "CTR-780", channel: "Email", sendDate: "2007-09-10", status: "locked by another user" },
      { reminderId: "REM-93", contractId: "CTR-794", channel: "Letter", sendDate: "2007-09-12", status: "awaiting host acknowledgement" }
    ],
    approvals: [
      { approvalId: "APR-650", contractId: "CTR-780", approver: "VP Legal", dueDate: "2007-09-22", status: "nightly processing in progress" },
      { approvalId: "APR-663", contractId: "CTR-794", approver: "Chief Counsel", dueDate: "2007-09-25", status: "retry queue active" }
    ],
    archives: [
      { archiveId: "ARC-19", contractId: "CTR-552", location: "SharePoint", retention: "7y", status: "ERP export pending" },
      { archiveId: "ARC-24", contractId: "CTR-780", location: "FileNet", retention: "10y", status: "supervisor review required" }
    ]
  },
  rpaUseCases: ["Contract reminder automation", "Approval workflow routing", "Archival synchronization", "Clause-review coordination", "Expiry escalation"],
  moduleDescriptions: {
    contracts: "Contract renewal timeline and watchlist monitoring.",
    clauses: "Clause-review routing and legal risk indicators.",
    reminders: "Reminder scheduling queues across channels.",
    approvals: "Approval routing workflow and legal SLA tracking.",
    archives: "Renewal archive management and retention controls."
  },
  kpis: [{ moduleId: "contracts", label: "Contracts" }, { moduleId: "approvals", label: "Approvals" }],
  packetSections: [
    { title: "Contracts", moduleId: "contracts", fields: ["contractId", "counterparty", "owner", "status"] },
    { title: "Clause Reviews", moduleId: "clauses", fields: ["reviewId", "riskClause", "reviewer", "status"] },
    { title: "Approvals", moduleId: "approvals", fields: ["approvalId", "approver", "dueDate", "status"] }
  ],
  initialQueueAging: 13,
  initialRetryBacklog: 2,
  formPlaceholder: "Manual contract queue item",
  identityKey: "contract-renewal-tracker-2007-legal"
});
