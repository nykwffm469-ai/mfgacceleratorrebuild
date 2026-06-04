import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const palettes = [
  { "--legacy-bg": "#ddd8ce", "--legacy-panel": "#f6f1e7", "--legacy-nav": "#d2cabd", "--legacy-grid-head": "#d8d0c3", "--legacy-active": "#7a4b1d" },
  { "--legacy-bg": "#d4d8df", "--legacy-panel": "#eef1f6", "--legacy-nav": "#c7cfdb", "--legacy-grid-head": "#cfd8e5", "--legacy-active": "#2c4e77" },
  { "--legacy-bg": "#dadade", "--legacy-panel": "#f2f2f6", "--legacy-nav": "#cecee0", "--legacy-grid-head": "#d6d6e7", "--legacy-active": "#5f4d88" },
  { "--legacy-bg": "#d6ddd6", "--legacy-panel": "#eef4ee", "--legacy-nav": "#c7d3c7", "--legacy-grid-head": "#cedccb", "--legacy-active": "#3c6f3a" },
  { "--legacy-bg": "#ddd6cc", "--legacy-panel": "#f5eee4", "--legacy-nav": "#d5cab9", "--legacy-grid-head": "#dfd2be", "--legacy-active": "#8a5a1f" },
  { "--legacy-bg": "#d5dce2", "--legacy-panel": "#edf2f7", "--legacy-nav": "#c7d2df", "--legacy-grid-head": "#d0dbe8", "--legacy-active": "#375f89" }
];

const platformApps = [
  {
    slug: "customer-cloud-hub",
    title: "Customer Cloud Hub 2012",
    summary: "CRM-style pipeline, account, opportunity, and activity execution workspace.",
    modules: [
      ["accounts", "Accounts", ["accountId", "name", "segment", "owner", "status"], { accountId: "AC-101", name: "Northwind Steel", segment: "Enterprise", owner: "J. Park", status: "Active" }],
      ["opps", "Opportunities", ["oppId", "account", "stage", "amount", "status"], { oppId: "OP-771", account: "Northwind Steel", stage: "Proposal", amount: "420000", status: "Open" }],
      ["activities", "Activities", ["activityId", "account", "type", "dueDate", "status"], { activityId: "ACT-31", account: "Northwind Steel", type: "Call", dueDate: "2012-03-12", status: "Pending" }],
      ["forecast", "Forecast", ["period", "owner", "commit", "bestCase", "status"], { period: "2012-Q2", owner: "J. Park", commit: "780000", bestCase: "990000", status: "Submitted" }],
      ["cases", "Customer Cases", ["caseId", "account", "priority", "assignee", "status"], { caseId: "CS-15", account: "Northwind Steel", priority: "High", assignee: "Support", status: "Open" }]
    ]
  },
  {
    slug: "service-desk-plus",
    title: "Service Desk Plus 2011",
    summary: "ITSM-inspired incident, change, and request fulfillment operations board.",
    modules: [
      ["incidents", "Incidents", ["incidentId", "service", "impact", "owner", "status"], { incidentId: "INC-420", service: "Email", impact: "Medium", owner: "NOC", status: "Open" }],
      ["requests", "Requests", ["requestId", "requestor", "catalogItem", "sla", "status"], { requestId: "REQ-812", requestor: "M. Lee", catalogItem: "VPN Access", sla: "24h", status: "Pending" }],
      ["changes", "Changes", ["changeId", "environment", "window", "manager", "status"], { changeId: "CHG-58", environment: "Prod", window: "Sat 02:00", manager: "Change Board", status: "Scheduled" }],
      ["problems", "Problems", ["problemId", "service", "rootCause", "owner", "status"], { problemId: "PRB-10", service: "Network", rootCause: "Router failover", owner: "Infra", status: "Investigating" }],
      ["knowledge", "Knowledge", ["articleId", "title", "category", "author", "status"], { articleId: "KB-91", title: "Reset MFA", category: "Identity", author: "Service Desk", status: "Published" }]
    ]
  },
  {
    slug: "data-warehouse-ops",
    title: "Data Warehouse Ops 2012",
    summary: "Warehouse jobs, virtual compute pools, and query history monitoring console.",
    modules: [
      ["warehouses", "Warehouses", ["whId", "name", "size", "owner", "status"], { whId: "WH-01", name: "ANALYTICS_XL", size: "XL", owner: "Data Eng", status: "Running" }],
      ["jobs", "Pipelines", ["jobId", "dataset", "schedule", "runtime", "status"], { jobId: "JOB-771", dataset: "sales_fact", schedule: "Hourly", runtime: "6m", status: "Success" }],
      ["queries", "Query History", ["queryId", "user", "elapsed", "costUnits", "status"], { queryId: "Q-5412", user: "analyst1", elapsed: "12s", costUnits: "3.1", status: "Complete" }],
      ["loads", "Load Queue", ["loadId", "table", "source", "queuedOn", "status"], { loadId: "LD-22", table: "customer_dim", source: "S3", queuedOn: "2012-05-03", status: "Queued" }],
      ["governance", "Governance", ["policyId", "scope", "owner", "severity", "status"], { policyId: "GV-8", scope: "PII Masking", owner: "Data Gov", severity: "High", status: "Active" }]
    ]
  },
  {
    slug: "erp-command-center",
    title: "ERP Command Center 2010",
    summary: "SAP/Oracle-style cross-functional operations cockpit for order-to-cash and procure-to-pay.",
    modules: [
      ["orders", "Order Mgmt", ["orderNo", "customer", "plant", "value", "status"], { orderNo: "SO-8802", customer: "Apex Parts", plant: "P01", value: "128000", status: "Released" }],
      ["inventory", "Inventory", ["material", "storageLoc", "onHand", "planner", "status"], { material: "MAT-771", storageLoc: "A1", onHand: "420", planner: "MPS", status: "Healthy" }],
      ["procure", "Procure", ["poNo", "vendor", "buyer", "value", "status"], { poNo: "PO-6611", vendor: "Metro Metals", buyer: "Sourcing", value: "74000", status: "Open" }],
      ["finance", "Finance", ["docNo", "companyCode", "period", "owner", "status"], { docNo: "FI-5002", companyCode: "1000", period: "2010-08", owner: "Controller", status: "Posted" }],
      ["exceptions", "Exceptions", ["exceptionId", "domain", "reason", "assignee", "status"], { exceptionId: "EX-ERP-5", domain: "Procure", reason: "GR/IR mismatch", assignee: "AP", status: "Open" }]
    ]
  },
  {
    slug: "finance-close-studio",
    title: "Finance Close Studio 2011",
    summary: "Period-close orchestration, reconciliations, journal approvals, and sign-off tracking.",
    modules: [
      ["close", "Close Tasks", ["taskId", "entity", "owner", "dueDate", "status"], { taskId: "CL-81", entity: "US01", owner: "Accounting", dueDate: "2011-11-29", status: "Open" }],
      ["recon", "Reconciliations", ["reconId", "account", "preparer", "variance", "status"], { reconId: "RC-22", account: "101000", preparer: "A. Gray", variance: "120", status: "Review" }],
      ["journals", "Journals", ["journalId", "period", "amount", "approver", "status"], { journalId: "JN-501", period: "2011-11", amount: "9320", approver: "Controller", status: "Pending" }],
      ["allocations", "Allocations", ["allocationId", "driver", "owner", "runDate", "status"], { allocationId: "AL-6", driver: "Headcount", owner: "FP&A", runDate: "2011-11-28", status: "Queued" }],
      ["signoff", "Sign-off", ["signoffId", "entity", "role", "signedOn", "status"], { signoffId: "SOFF-11", entity: "US01", role: "CFO", signedOn: "", status: "Waiting" }]
    ]
  },
  {
    slug: "procurement-sourcing-suite",
    title: "Procurement Sourcing Suite 2012",
    summary: "Sourcing events, bid evaluation, supplier awards, and contract handoff management.",
    modules: [
      ["events", "Sourcing Events", ["eventId", "category", "owner", "dueDate", "status"], { eventId: "EV-900", category: "Logistics", owner: "Sourcing", dueDate: "2012-06-02", status: "Open" }],
      ["bids", "Bids", ["bidId", "eventId", "supplier", "score", "status"], { bidId: "BID-41", eventId: "EV-900", supplier: "CargoMax", score: "86", status: "Shortlist" }],
      ["awards", "Awards", ["awardId", "eventId", "supplier", "value", "status"], { awardId: "AW-8", eventId: "EV-900", supplier: "CargoMax", value: "210000", status: "Draft" }],
      ["contracts", "Contracts", ["contractId", "supplier", "owner", "term", "status"], { contractId: "SC-77", supplier: "CargoMax", owner: "Legal", term: "24m", status: "Review" }],
      ["risk", "Supplier Risk", ["riskId", "supplier", "factor", "severity", "status"], { riskId: "RSK-12", supplier: "CargoMax", factor: "Concentration", severity: "Medium", status: "Monitor" }]
    ]
  },
  {
    slug: "subscription-revenue-studio",
    title: "Subscription Revenue Studio 2012",
    summary: "Subscription lifecycle, usage billing, revenue schedules, and churn intervention workflows.",
    modules: [
      ["subs", "Subscriptions", ["subscriptionId", "customer", "plan", "renewal", "status"], { subscriptionId: "SUB-410", customer: "Blue Ridge Labs", plan: "Enterprise", renewal: "2012-09-01", status: "Active" }],
      ["usage", "Usage", ["usageId", "subscriptionId", "meter", "units", "status"], { usageId: "USG-19", subscriptionId: "SUB-410", meter: "API Calls", units: "120000", status: "Captured" }],
      ["billing", "Billing", ["invoiceId", "subscriptionId", "amount", "billDate", "status"], { invoiceId: "INV-S-77", subscriptionId: "SUB-410", amount: "12800", billDate: "2012-05-01", status: "Posted" }],
      ["revenue", "Revenue Schedules", ["scheduleId", "subscriptionId", "month", "recognized", "status"], { scheduleId: "REV-62", subscriptionId: "SUB-410", month: "2012-05", recognized: "4266", status: "Open" }],
      ["retention", "Retention", ["playId", "customer", "riskScore", "owner", "status"], { playId: "RET-3", customer: "Blue Ridge Labs", riskScore: "0.61", owner: "CSM", status: "Action" }]
    ]
  },
  {
    slug: "field-service-workbench",
    title: "Field Service Workbench 2011",
    summary: "Work order dispatch, route balancing, parts checks, and service closure handling.",
    modules: [
      ["workorders", "Work Orders", ["woId", "customer", "skill", "window", "status"], { woId: "WO-FS-11", customer: "Delta Health", skill: "Electrical", window: "8-12", status: "Queued" }],
      ["dispatch", "Dispatch", ["dispatchId", "tech", "zone", "assigned", "status"], { dispatchId: "DSP-44", tech: "T. Cole", zone: "North", assigned: "5", status: "Active" }],
      ["routes", "Routes", ["routeId", "tech", "stops", "eta", "status"], { routeId: "R-912", tech: "T. Cole", stops: "6", eta: "08:20", status: "Rolling" }],
      ["parts", "Parts", ["partNo", "woId", "availability", "bin", "status"], { partNo: "PT-88", woId: "WO-FS-11", availability: "Low", bin: "M-14", status: "Reserve" }],
      ["closure", "Closure", ["closureId", "woId", "completedOn", "csr", "status"], { closureId: "CL-77", woId: "WO-FS-10", completedOn: "2011-06-08", csr: "Service Ops", status: "Closed" }]
    ]
  },
  {
    slug: "lowcode-flow-studio",
    title: "Lowcode Flow Studio 2012",
    summary: "Flow registry, trigger mappings, connector configs, and run history dashboard.",
    modules: [
      ["flows", "Flows", ["flowId", "name", "owner", "trigger", "status"], { flowId: "FL-100", name: "Invoice Approval", owner: "Ops", trigger: "SharePoint", status: "Active" }],
      ["connectors", "Connectors", ["connectorId", "system", "authType", "owner", "status"], { connectorId: "CON-5", system: "SAP", authType: "Service Account", owner: "Integration", status: "Healthy" }],
      ["triggers", "Triggers", ["triggerId", "flowId", "source", "lastFired", "status"], { triggerId: "TR-20", flowId: "FL-100", source: "SharePoint", lastFired: "2012-05-04", status: "On" }],
      ["runs", "Run History", ["runId", "flowId", "duration", "result", "status"], { runId: "RUN-9001", flowId: "FL-100", duration: "12s", result: "Success", status: "Complete" }],
      ["failures", "Failure Queue", ["failureId", "flowId", "reason", "owner", "status"], { failureId: "FAIL-7", flowId: "FL-88", reason: "Connector timeout", owner: "Integration", status: "Open" }]
    ]
  },
  {
    slug: "process-mining-lab",
    title: "Process Mining Lab 2012",
    summary: "Event log ingestion, process variant maps, bottleneck detection, and action backlog.",
    modules: [
      ["logs", "Event Logs", ["logId", "process", "source", "records", "status"], { logId: "LG-11", process: "P2P", source: "ERP", records: "220k", status: "Loaded" }],
      ["variants", "Variants", ["variantId", "process", "frequency", "owner", "status"], { variantId: "VAR-22", process: "P2P", frequency: "31%", owner: "COE", status: "Review" }],
      ["bottlenecks", "Bottlenecks", ["nodeId", "process", "waitTime", "severity", "status"], { nodeId: "BN-4", process: "P2P", waitTime: "5.2d", severity: "High", status: "Open" }],
      ["simulations", "Simulations", ["simId", "scenario", "owner", "impact", "status"], { simId: "SIM-9", scenario: "Auto-match 3-way", owner: "COE", impact: "-18% cycle", status: "Ready" }],
      ["actions", "Action Backlog", ["actionId", "process", "assignee", "dueDate", "status"], { actionId: "ACT-301", process: "P2P", assignee: "Ops Lead", dueDate: "2012-06-01", status: "Planned" }]
    ]
  },
  {
    slug: "integration-gateway-manager",
    title: "Integration Gateway Manager 2011",
    summary: "API route maps, queue monitoring, transform rules, and replay operations.",
    modules: [
      ["routes", "Routes", ["routeId", "source", "target", "owner", "status"], { routeId: "RT-51", source: "CRM", target: "ERP", owner: "iPaaS", status: "Active" }],
      ["queues", "Queues", ["queueId", "topic", "depth", "lag", "status"], { queueId: "Q-44", topic: "orders.v1", depth: "120", lag: "14s", status: "Watch" }],
      ["transforms", "Transforms", ["transformId", "routeId", "version", "editor", "status"], { transformId: "TRN-8", routeId: "RT-51", version: "v3", editor: "Integration", status: "Published" }],
      ["errors", "Errors", ["errorId", "routeId", "message", "owner", "status"], { errorId: "ER-20", routeId: "RT-51", message: "Schema mismatch", owner: "iPaaS", status: "Open" }],
      ["replay", "Replay", ["replayId", "batch", "startedOn", "operator", "status"], { replayId: "RP-2", batch: "B-221", startedOn: "2011-12-01", operator: "NOC", status: "Running" }]
    ]
  },
  {
    slug: "master-data-governor",
    title: "Master Data Governor 2010",
    summary: "Golden record stewardship, duplicate resolution, survivorship rules, and publishing.",
    modules: [
      ["entities", "Entities", ["entityId", "domain", "steward", "qualityScore", "status"], { entityId: "ENT-11", domain: "Customer", steward: "MDM Team", qualityScore: "87", status: "Monitor" }],
      ["duplicates", "Duplicates", ["dupeId", "domain", "candidateCount", "owner", "status"], { dupeId: "DP-71", domain: "Customer", candidateCount: "4", owner: "Steward", status: "Open" }],
      ["survivorship", "Survivorship", ["ruleId", "domain", "priority", "editor", "status"], { ruleId: "SV-10", domain: "Supplier", priority: "SourceRank", editor: "MDM", status: "Active" }],
      ["approvals", "Approvals", ["approvalId", "entityId", "approver", "dueDate", "status"], { approvalId: "APR-MDM-5", entityId: "ENT-11", approver: "Data Gov", dueDate: "2010-04-22", status: "Pending" }],
      ["publish", "Publish", ["publishId", "domain", "targetSystems", "runDate", "status"], { publishId: "PUB-12", domain: "Customer", targetSystems: "CRM,ERP", runDate: "2010-04-20", status: "Queued" }]
    ]
  },
  {
    slug: "portfolio-work-boards",
    title: "Portfolio Work Boards 2012",
    summary: "Smartsheet-like project rows, dependencies, approvals, and portfolio rollups.",
    modules: [
      ["sheets", "Sheets", ["sheetId", "name", "owner", "rows", "status"], { sheetId: "SH-100", name: "Capital Projects", owner: "PMO", rows: "282", status: "Active" }],
      ["rows", "Task Rows", ["rowId", "sheet", "task", "dueDate", "status"], { rowId: "RW-21", sheet: "Capital Projects", task: "Site survey", dueDate: "2012-07-12", status: "In Progress" }],
      ["deps", "Dependencies", ["depId", "predecessor", "successor", "type", "status"], { depId: "DP-3", predecessor: "RW-21", successor: "RW-22", type: "FS", status: "Linked" }],
      ["approvals", "Approvals", ["approvalId", "rowId", "approver", "submittedOn", "status"], { approvalId: "APR-WB-9", rowId: "RW-21", approver: "Director", submittedOn: "2012-07-01", status: "Pending" }],
      ["rollups", "Portfolio Rollups", ["rollupId", "portfolio", "health", "budget", "status"], { rollupId: "RL-8", portfolio: "FY12 Transform", health: "Yellow", budget: "4.2M", status: "Tracking" }]
    ]
  },
  {
    slug: "hr-case-lifecycle",
    title: "HR Case Lifecycle 2011",
    summary: "Employee HR case intake, routing, approvals, and policy compliance history.",
    modules: [
      ["cases", "Cases", ["caseId", "employee", "category", "openedOn", "status"], { caseId: "HR-411", employee: "C. Diaz", category: "Leave", openedOn: "2011-02-11", status: "Open" }],
      ["routing", "Routing", ["routeId", "caseId", "queue", "owner", "status"], { routeId: "RT-HR-4", caseId: "HR-411", queue: "Benefits", owner: "HR Ops", status: "Assigned" }],
      ["approvals", "Approvals", ["approvalId", "caseId", "approver", "dueDate", "status"], { approvalId: "APR-HR-1", caseId: "HR-411", approver: "HR Manager", dueDate: "2011-02-15", status: "Pending" }],
      ["docs", "Documents", ["docId", "caseId", "docType", "receivedOn", "status"], { docId: "DOC-HR-8", caseId: "HR-411", docType: "Medical note", receivedOn: "2011-02-12", status: "Received" }],
      ["history", "History", ["eventId", "caseId", "event", "actor", "status"], { eventId: "EV-HR-21", caseId: "HR-411", event: "Case created", actor: "Portal", status: "Logged" }]
    ]
  },
  {
    slug: "compliance-automation-center",
    title: "Compliance Automation Center 2012",
    summary: "Control testing schedules, evidence capture, issue triage, and audit response workflow.",
    modules: [
      ["controls", "Controls", ["controlId", "domain", "owner", "frequency", "status"], { controlId: "CTL-201", domain: "Access", owner: "Security", frequency: "Quarterly", status: "Active" }],
      ["tests", "Control Tests", ["testId", "controlId", "tester", "targetDate", "status"], { testId: "TST-72", controlId: "CTL-201", tester: "Internal Audit", targetDate: "2012-06-10", status: "Planned" }],
      ["evidence", "Evidence", ["evidenceId", "testId", "source", "owner", "status"], { evidenceId: "EVD-9", testId: "TST-72", source: "IAM Export", owner: "Security", status: "Pending" }],
      ["issues", "Issues", ["issueId", "controlId", "severity", "assignee", "status"], { issueId: "ISS-13", controlId: "CTL-201", severity: "High", assignee: "Security", status: "Open" }],
      ["audit", "Audit Response", ["responseId", "issueId", "reviewer", "dueDate", "status"], { responseId: "AR-5", issueId: "ISS-13", reviewer: "External Audit", dueDate: "2012-06-22", status: "Draft" }]
    ]
  }
];

const challengeFields = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "company", label: "Company" },
  { key: "role", label: "Role" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "startDate", label: "Start Date" },
  { key: "referenceId", label: "Reference ID" }
];

function appTemplate(app, palette) {
  const modules = app.modules.map(([id, label]) => ({ id, label }));
  const columns = Object.fromEntries(app.modules.map(([id, , col]) => [id, col]));
  const seed = Object.fromEntries(app.modules.map(([id, , , row]) => [id, [row]]));

  return `import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "${app.slug}";
const modules = ${JSON.stringify(modules, null, 2)};
const columns = ${JSON.stringify(columns, null, 2)};
const palette = ${JSON.stringify(palette, null, 2)};

let activeModule = modules[0].id;

ensureSeed(namespace, () => (${JSON.stringify(seed, null, 2)}));

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function render() {
  applyPalette();
  const data = loadSeed(namespace, () => ({}));
  const moduleColumns = columns[activeModule];
  const rows = data[activeModule].map((row) => moduleColumns.map((key) => row[key]));
  const grid = dataGrid(moduleColumns, rows);

  const formFields = moduleColumns
    .map((field) => \`<label>\${field}</label><input class="legacy-field" name="\${field}" />\`)
    .join("");

  const contentHtml =
    panel("${app.summary}", grid) +
    panel("Entry Form", \`<form id="entry-form" data-module="\${activeModule}"><div class="legacy-form-grid">\${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>\`);

  document.getElementById("app").innerHTML = appShell({
    title: "${app.title}",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: \`System: \${namespace.toUpperCase()} | Session: OPERATOR-01\`,
    contentHtml
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const latest = loadSeed(namespace, () => ({}));

      if (action === "toggle-first" && latest[activeModule][0]) {
        const first = latest[activeModule][0];
        if (first.status) {
          first.status = first.status === "Open" ? "Closed" : first.status === "Pending" ? "Approved" : "Open";
        }
        saveSeed(namespace, latest);
      }

      if (action === "delete-last" && latest[activeModule].length > 0) {
        latest[activeModule].pop();
        saveSeed(namespace, latest);
      }

      if (action === "seed-reset") {
        localStorage.removeItem(\`legacy-demo:\${namespace}\`);
      }

      render();
    });
  });

  const form = document.getElementById("entry-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const moduleName = form.getAttribute("data-module");
    const moduleKeys = columns[moduleName];
    const row = {};
    const keyField = moduleKeys[0];

    moduleKeys.forEach((field) => {
      row[field] = formData.get(field)?.toString() || "";
    });

    if (!row[keyField]) {
      row[keyField] = makeId(moduleName.slice(0, 3).toUpperCase());
    }

    const latest = loadSeed(namespace, () => ({}));
    const index = latest[moduleName].findIndex((item) => item[keyField] === row[keyField]);
    if (index >= 0) {
      latest[moduleName][index] = row;
    } else {
      latest[moduleName].push(row);
    }

    saveSeed(namespace, latest);
    render();
  });
}

render();
`;
}

function rpaChallengeTemplate() {
  return `import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "rpa-challenge";
const modules = [
  { id: "challenge", label: "Challenge Form" },
  { id: "submissions", label: "Submissions" },
  { id: "telemetry", label: "Telemetry" }
];
const columns = {
  challenge: ["field", "currentOrder", "note", "seed", "status"],
  submissions: ["submissionId", "firstName", "lastName", "email", "company"],
  telemetry: ["eventId", "eventType", "detail", "eventTime", "status"]
};
const allFields = ${JSON.stringify(challengeFields, null, 2)};
let activeModule = "challenge";

ensureSeed(namespace, () => ({
  challenge: allFields.map((f, idx) => ({ field: f.label, currentOrder: String(idx + 1), note: "Initial", seed: "static", status: "Ready" })),
  submissions: [],
  telemetry: [{ eventId: "EV-1", eventType: "Init", detail: "Field map loaded", eventTime: new Date().toISOString(), status: "OK" }],
  fieldOrder: allFields.map((f) => f.key)
}));

function shuffle(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function challengeForm(data) {
  const order = data.fieldOrder || allFields.map((f) => f.key);
  const byKey = Object.fromEntries(allFields.map((f) => [f.key, f]));
  const rows = order
    .map((key) => byKey[key])
    .filter(Boolean)
    .map((f) => \`<label for="fld-\${f.key}">\${f.label}</label><input class="legacy-field" id="fld-\${f.key}" name="\${f.key}" />\`)
    .join("");

  return \`<form id="challenge-form"><div class="legacy-form-grid">\${rows}</div><div style="margin-top:8px;display:flex;gap:4px;"><button class="legacy-btn" type="submit">Submit + Scramble</button></div></form>\`;
}

function render() {
  const data = loadSeed(namespace, () => ({}));
  const gridRows = data[activeModule].map((row) => columns[activeModule].map((key) => row[key]));
  const grid = dataGrid(columns[activeModule], gridRows);

  let content = panel("RPA Challenge Data", grid);
  if (activeModule === "challenge") {
    content += panel("Form", challengeForm(data));
  }

  document.getElementById("app").innerHTML = appShell({
    title: "RPA Challenge 1.0",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "scramble", label: "Scramble Now" },
      { id: "reset", label: "Reset Seed" }
    ],
    statusText: "Purpose: self-healing selector and resilient automation testing",
    contentHtml: content
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const latest = loadSeed(namespace, () => ({}));
      const action = button.getAttribute("data-action");
      if (action === "scramble") {
        latest.fieldOrder = shuffle(latest.fieldOrder || allFields.map((f) => f.key));
        latest.challenge = latest.fieldOrder.map((k, idx) => {
          const f = allFields.find((x) => x.key === k);
          return { field: f?.label || k, currentOrder: String(idx + 1), note: "Scrambled", seed: "dynamic", status: "Ready" };
        });
        latest.telemetry.unshift({ eventId: makeId("EV"), eventType: "Scramble", detail: "Manual scramble", eventTime: new Date().toISOString(), status: "OK" });
      }
      if (action === "reset") {
        localStorage.removeItem(\`legacy-demo:\${namespace}\`);
      } else {
        saveSeed(namespace, latest);
      }
      render();
    });
  });

  const form = document.getElementById("challenge-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const latest = loadSeed(namespace, () => ({}));
      const fd = new FormData(form);
      const row = {
        submissionId: makeId("SUB"),
        firstName: fd.get("firstName")?.toString() || "",
        lastName: fd.get("lastName")?.toString() || "",
        email: fd.get("email")?.toString() || "",
        company: fd.get("company")?.toString() || ""
      };
      latest.submissions.unshift(row);
      latest.fieldOrder = shuffle(latest.fieldOrder || allFields.map((f) => f.key));
      latest.challenge = latest.fieldOrder.map((k, idx) => {
        const f = allFields.find((x) => x.key === k);
        return { field: f?.label || k, currentOrder: String(idx + 1), note: "Scrambled on submit", seed: "dynamic", status: "Ready" };
      });
      latest.telemetry.unshift({ eventId: makeId("EV"), eventType: "Submit", detail: "Form submitted and fields scrambled", eventTime: new Date().toISOString(), status: "OK" });
      saveSeed(namespace, latest);
      activeModule = "challenge";
      render();
    });
  }
}

render();
`;
}

function writeAppFiles(slug, title, summary, mainJs) {
  const appRoot = join(root, "apps", slug);
  mkdirSync(join(appRoot, "src"), { recursive: true });

  const packageJson = {
    name: `@legacy/${slug}`,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build --base ./",
      test: `node -e \"console.log('${slug}: no tests yet')\"`
    },
    dependencies: {
      "@legacy/shared-legacy-styles": "workspace:*",
      "@legacy/shared-mock-data": "workspace:*",
      "@legacy/shared-ui": "workspace:*"
    },
    devDependencies: {
      vite: "^6.0.0"
    }
  };

  const readme = `# ${slug}\n\n${summary}\n\nRun:\n\n\`\`\`bash\ncorepack pnpm --filter @legacy/${slug} dev\n\`\`\`\n`;
  const indexHtml = `<!doctype html>\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${title}</title>\n  </head>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="./src/main.js"></script>\n  </body>\n</html>\n`;

  writeFileSync(join(appRoot, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");
  writeFileSync(join(appRoot, "README.md"), readme);
  writeFileSync(join(appRoot, "index.html"), indexHtml);
  writeFileSync(join(appRoot, "src", "main.js"), mainJs);
}

for (const [index, app] of platformApps.entries()) {
  writeAppFiles(app.slug, app.title, app.summary, appTemplate(app, palettes[index % palettes.length]));
}

writeAppFiles(
  "rpa-challenge",
  "RPA Challenge 1.0",
  "RPA challenge app with stable field set that scrambles order after every submit for resilience and self-healing automation tests.",
  rpaChallengeTemplate()
);

console.log(`Generated ${platformApps.length} platform-style apps plus rpa-challenge.`);
