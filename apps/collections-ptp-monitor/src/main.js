import "@legacy/shared-legacy-styles/legacy.css";
import { bootLegacyWorkbench } from "@legacy/shared-ui/legacy-workbench.js";

const modules = [
  { id: "promises", label: "Promises" },
  { id: "followups", label: "Follow-ups" },
  { id: "letters", label: "Letters" },
  { id: "defaults", label: "Defaults" },
  { id: "queues", label: "Work Queues" }
];

bootLegacyWorkbench({
  namespace: "collections-ptp-monitor",
  title: "Collections PTP Monitor 2011",
  environmentName: "COLLECTIONS-OPS-PROD11",
  analyst: "AROPS\\j.patterson",
  workstationPrefix: "CLCT-WS",
  purpose: "Promise-to-pay monitoring system for collections and AR operations teams.",
  modules,
  columns: {
    promises: ["promiseId", "customer", "promiseDate", "amount", "collector", "status"],
    followups: ["followupId", "promiseId", "collector", "nextAction", "dueDate", "status"],
    letters: ["letterId", "customer", "template", "queue", "sendDate", "status"],
    defaults: ["defaultId", "promiseId", "daysLate", "escalationRoute", "erpBalance", "status"],
    queues: ["queueId", "collector", "items", "dialerSegment", "approvalGate", "status"]
  },
  palette: {
    "--legacy-bg": "#d9d5cb",
    "--legacy-panel": "#f3efe6",
    "--legacy-nav": "#cec7ba",
    "--legacy-grid-head": "#d7d0c3",
    "--legacy-active": "#7a4f22",
    "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
  },
  appDescription: "LEGACY APP DESCRIPTION - Collections PTP Monitor 2011\n\nPromise-to-pay monitoring desktop platform for high-volume collections call center workflows including broken promise escalation, dunning follow-ups, and ERP balance synchronization.",
  seedData: {
    promises: [
      { promiseId: "PTP-221", customer: "Metro Foods", promiseDate: "2011-08-20", amount: "9000", collector: "R. James", status: "supervisor review required" },
      { promiseId: "PTP-233", customer: "Talon Hardware", promiseDate: "2011-08-22", amount: "12400", collector: "L. Quin", status: "retry queue active" }
    ],
    followups: [
      { followupId: "FU-PTP-8", promiseId: "PTP-221", collector: "R. James", nextAction: "Outbound call", dueDate: "2011-08-21", status: "validation failed" },
      { followupId: "FU-PTP-9", promiseId: "PTP-233", collector: "L. Quin", nextAction: "Reminder email", dueDate: "2011-08-22", status: "ERP export pending" }
    ],
    letters: [
      { letterId: "LTR-18", customer: "Metro Foods", template: "PTP-BROKEN", queue: "Print-02", sendDate: "2011-08-19", status: "nightly processing in progress" },
      { letterId: "LTR-21", customer: "Talon Hardware", template: "DUNNING-2", queue: "Print-01", sendDate: "2011-08-19", status: "locked by another user" }
    ],
    defaults: [
      { defaultId: "DF-10", promiseId: "PTP-199", daysLate: "5", escalationRoute: "Supervisor -> Legal", erpBalance: "15120", status: "awaiting host acknowledgement" },
      { defaultId: "DF-11", promiseId: "PTP-201", daysLate: "9", escalationRoute: "Legal Queue", erpBalance: "9300", status: "retry queue active" }
    ],
    queues: [
      { queueId: "Q-AR-2", collector: "R. James", items: "23", dialerSegment: "Segment-B", approvalGate: "Manager", status: "ERP export pending" },
      { queueId: "Q-AR-7", collector: "L. Quin", items: "17", dialerSegment: "Segment-A", approvalGate: "Supervisor", status: "supervisor review required" }
    ]
  },
  rpaUseCases: ["Automated reminder emails", "Collections queue monitoring", "Broken promise escalation", "ERP balance lookups", "Auto-generation of payment letters", "Customer follow-up workflows"],
  moduleDescriptions: {
    promises: "Promise scheduling and aging indicators for high-volume collector workflows.",
    followups: "Dunning follow-up management with outbound reminders and retry counters.",
    letters: "Letter queue operations for payment reminders and collections notifications.",
    defaults: "Broken promise tracking and default escalation routing.",
    queues: "Collector workload queues with approval and host-acknowledgement states."
  },
  kpis: [{ moduleId: "promises", label: "Promises" }, { moduleId: "defaults", label: "Default escalations" }],
  packetSections: [
    { title: "Promises", moduleId: "promises", fields: ["promiseId", "customer", "amount", "status"] },
    { title: "Follow-ups", moduleId: "followups", fields: ["followupId", "collector", "nextAction", "status"] },
    { title: "Letters", moduleId: "letters", fields: ["letterId", "template", "queue", "status"] }
  ],
  initialQueueAging: 18,
  initialRetryBacklog: 4,
  formPlaceholder: "Manual collections queue item",
  identityKey: "collections-ptp-monitor-2011-call-center"
});
