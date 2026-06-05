import "@legacy/shared-legacy-styles/legacy.css";
import { bootLegacyWorkbench } from "@legacy/shared-ui/legacy-workbench.js";

const modules = [
  { id: "controls", label: "Controls" },
  { id: "tests", label: "Control Tests" },
  { id: "evidence", label: "Evidence" },
  { id: "issues", label: "Issues" },
  { id: "audit", label: "Audit Response" }
];

bootLegacyWorkbench({
  namespace: "compliance-automation-center",
  title: "Compliance Automation Center 2012",
  environmentName: "GRC-AUTOMATION-PROD12",
  analyst: "ITAUDIT\\m.nelson",
  workstationPrefix: "GRC-WS",
  purpose: "Enterprise governance and audit-control workflow management platform.",
  modules,
  columns: {
    controls: ["controlId", "domain", "owner", "frequency", "evidenceQueue", "status"],
    tests: ["testId", "controlId", "tester", "targetDate", "result", "status"],
    evidence: ["evidenceId", "testId", "source", "archiveBucket", "owner", "status"],
    issues: ["issueId", "controlId", "severity", "assignee", "route", "status"],
    audit: ["responseId", "issueId", "reviewer", "dueDate", "packet", "status"]
  },
  palette: {
    "--legacy-bg": "#d3d7df",
    "--legacy-panel": "#ebf0f7",
    "--legacy-nav": "#c7cfdb",
    "--legacy-grid-head": "#ced8e7",
    "--legacy-active": "#3d5574",
    "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
  },
  appDescription: "LEGACY APP DESCRIPTION - Compliance Automation Center 2012\n\nGovernance and audit-control operations workspace used by internal audit and IT risk teams for control-test schedules, evidence collection, and issue escalation.",
  seedData: {
    controls: [
      { controlId: "CTL-201", domain: "Access", owner: "Security", frequency: "Quarterly", evidenceQueue: "EVQ-12", status: "supervisor review required" },
      { controlId: "CTL-222", domain: "Change Mgmt", owner: "IT Ops", frequency: "Monthly", evidenceQueue: "EVQ-08", status: "ERP export pending" }
    ],
    tests: [
      { testId: "TST-72", controlId: "CTL-201", tester: "Internal Audit", targetDate: "2012-06-10", result: "Not Started", status: "validation failed" },
      { testId: "TST-77", controlId: "CTL-222", tester: "SOX PMO", targetDate: "2012-06-14", result: "Partial", status: "retry queue active" }
    ],
    evidence: [
      { evidenceId: "EVD-9", testId: "TST-72", source: "IAM Export", archiveBucket: "Q2-AUDIT", owner: "Security", status: "nightly processing in progress" },
      { evidenceId: "EVD-14", testId: "TST-77", source: "Change Tickets", archiveBucket: "Q2-REMED", owner: "IT Ops", status: "locked by another user" }
    ],
    issues: [
      { issueId: "ISS-13", controlId: "CTL-201", severity: "High", assignee: "Security", route: "Control Owner -> VP", status: "awaiting host acknowledgement" },
      { issueId: "ISS-17", controlId: "CTL-222", severity: "Medium", assignee: "IT Ops", route: "PMO -> Director", status: "retry queue active" }
    ],
    audit: [
      { responseId: "AR-5", issueId: "ISS-13", reviewer: "External Audit", dueDate: "2012-06-22", packet: "PKT-2012-06", status: "validation failed" },
      { responseId: "AR-7", issueId: "ISS-17", reviewer: "Internal Audit", dueDate: "2012-06-25", packet: "PKT-2012-07", status: "ERP export pending" }
    ]
  },
  rpaUseCases: ["Audit evidence collection", "Reminder generation", "Screenshot gathering", "Audit packet assembly", "Issue escalation automation", "Evidence archival"],
  moduleDescriptions: {
    controls: "Control inventory tied to ownership, frequency, and evidence queues.",
    tests: "Control-test schedule and result tracking with retry workflows.",
    evidence: "Evidence ingestion queue and archival lifecycle management.",
    issues: "Issue escalation routing for remediation and governance reviews.",
    audit: "Audit response packet preparation and reviewer coordination."
  },
  kpis: [{ moduleId: "controls", label: "Controls" }, { moduleId: "evidence", label: "Evidence queues" }],
  packetSections: [
    { title: "Control Tests", moduleId: "tests", fields: ["testId", "controlId", "result", "status"] },
    { title: "Evidence", moduleId: "evidence", fields: ["evidenceId", "archiveBucket", "owner", "status"] },
    { title: "Issues", moduleId: "issues", fields: ["issueId", "severity", "route", "status"] }
  ],
  initialQueueAging: 14,
  initialRetryBacklog: 3,
  formPlaceholder: "Manual governance queue item",
  identityKey: "compliance-automation-center-2012-audit-office"
});
