import "@legacy/shared-legacy-styles/legacy.css";
import { bootLegacyWorkbench } from "@legacy/shared-ui/legacy-workbench.js";

const modules = [
  { id: "requests", label: "Requests" },
  { id: "validation", label: "Validation" },
  { id: "approvals", label: "Approvals" },
  { id: "posting", label: "Posting" },
  { id: "queue", label: "Queue" }
];

bootLegacyWorkbench({
  namespace: "credit-memo-routing",
  title: "Credit Memo Routing 2009",
  environmentName: "AR-CREDIT-PROD09",
  analyst: "FINOPS\\a.wright",
  workstationPrefix: "CMR-WS",
  purpose: "Finance operations workflow application for handling credit memo requests and ERP posting coordination.",
  modules,
  columns: {
    requests: ["requestId", "customer", "memoType", "amount", "status"],
    validation: ["validationId", "requestId", "rule", "failed", "status"],
    approvals: ["approvalId", "requestId", "approver", "sla", "status"],
    posting: ["postingId", "requestId", "docNo", "companyCode", "status"],
    queue: ["queueId", "owner", "backlog", "priority", "status"]
  },
  palette: {
    "--legacy-bg": "#d7d8d4",
    "--legacy-panel": "#eceeea",
    "--legacy-nav": "#cfd1c8",
    "--legacy-grid-head": "#d8dad1",
    "--legacy-active": "#536b43",
    "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
  },
  appDescription: "LEGACY APP DESCRIPTION - Credit Memo Routing 2009\n\nAccounts receivable back-office processing center for credit memo triage, validation exceptions, manager approvals, and ERP posting retry workflows.",
  seedData: {
    requests: [
      { requestId: "CM-18", customer: "Northwind Retail", memoType: "Pricing", amount: "1820", status: "supervisor review required" },
      { requestId: "CM-26", customer: "Atlas Industrial", memoType: "Freight", amount: "940", status: "ERP export pending" }
    ],
    validation: [
      { validationId: "VL-34", requestId: "CM-18", rule: "Original invoice", failed: "No", status: "retry queue active" },
      { validationId: "VL-39", requestId: "CM-26", rule: "Tax code", failed: "Yes", status: "validation failed" }
    ],
    approvals: [
      { approvalId: "AP-220", requestId: "CM-18", approver: "AR Manager", sla: "24h", status: "locked by another user" },
      { approvalId: "AP-228", requestId: "CM-26", approver: "Controller", sla: "48h", status: "awaiting host acknowledgement" }
    ],
    posting: [
      { postingId: "PS-44", requestId: "CM-11", docNo: "61004421", companyCode: "1000", status: "nightly processing in progress" },
      { postingId: "PS-49", requestId: "CM-26", docNo: "61004510", companyCode: "1100", status: "retry queue active" }
    ],
    queue: [
      { queueId: "Q-CM-1", owner: "AR Shared", backlog: "27", priority: "High", status: "ERP export pending" },
      { queueId: "Q-CM-4", owner: "AR Shared", backlog: "14", priority: "Medium", status: "supervisor review required" }
    ]
  },
  rpaUseCases: ["ERP data-entry automation", "Approval synchronization", "Request validation", "Retry batch handling", "Customer lookup automation", "Posting reconciliation"],
  moduleDescriptions: {
    requests: "Credit memo request triage and customer lookup operations.",
    validation: "Validation exception queue for finance policy checks.",
    approvals: "Manager approval routing and SLA monitoring.",
    posting: "ERP posting handoff and retry workflow controls.",
    queue: "Backlog queue prioritization and operational counters."
  },
  kpis: [{ moduleId: "requests", label: "Requests" }, { moduleId: "posting", label: "Posting queue" }],
  packetSections: [
    { title: "Requests", moduleId: "requests", fields: ["requestId", "customer", "amount", "status"] },
    { title: "Validation", moduleId: "validation", fields: ["validationId", "rule", "failed", "status"] },
    { title: "Posting", moduleId: "posting", fields: ["postingId", "docNo", "companyCode", "status"] }
  ],
  initialQueueAging: 15,
  initialRetryBacklog: 4,
  formPlaceholder: "Manual credit memo queue item",
  identityKey: "credit-memo-routing-2009-ar-ops"
});
