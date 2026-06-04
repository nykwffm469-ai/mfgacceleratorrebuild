import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const palettes = [
  { "--legacy-bg": "#ddd8ce", "--legacy-panel": "#f6f1e7", "--legacy-nav": "#d2cabd", "--legacy-grid-head": "#d8d0c3", "--legacy-active": "#7a4b1d" },
  { "--legacy-bg": "#d4d8df", "--legacy-panel": "#eef1f6", "--legacy-nav": "#c7cfdb", "--legacy-grid-head": "#cfd8e5", "--legacy-active": "#2c4e77" },
  { "--legacy-bg": "#dadade", "--legacy-panel": "#f2f2f6", "--legacy-nav": "#cecee0", "--legacy-grid-head": "#d6d6e7", "--legacy-active": "#5f4d88" },
  { "--legacy-bg": "#d6ddd6", "--legacy-panel": "#eef4ee", "--legacy-nav": "#c7d3c7", "--legacy-grid-head": "#cedccb", "--legacy-active": "#3c6f3a" },
  { "--legacy-bg": "#ddd6cc", "--legacy-panel": "#f5eee4", "--legacy-nav": "#d5cab9", "--legacy-grid-head": "#dfd2be", "--legacy-active": "#8a5a1f" },
  { "--legacy-bg": "#d5dce2", "--legacy-panel": "#edf2f7", "--legacy-nav": "#c7d2df", "--legacy-grid-head": "#d0dbe8", "--legacy-active": "#375f89" },
  { "--legacy-bg": "#d8d3cd", "--legacy-panel": "#f1ece6", "--legacy-nav": "#cbc1b8", "--legacy-grid-head": "#d8cbbd", "--legacy-active": "#6f402d" },
  { "--legacy-bg": "#d5d9d5", "--legacy-panel": "#edf1ed", "--legacy-nav": "#c5cec4", "--legacy-grid-head": "#d0d8cf", "--legacy-active": "#466645" }
];

const apps = [
  {
    slug: "government-benefits-intake",
    title: "Government Benefits Intake 2010",
    summary: "Citizen intake processing, eligibility checks, correspondence queues, and supervisor approvals.",
    modules: [
      ["intake", "Intake", ["caseId", "citizen", "program", "worker", "status"], { caseId: "GB-110", citizen: "R. Allen", program: "SNAP", worker: "Desk 4", status: "Open" }],
      ["eligibility", "Eligibility", ["reviewId", "caseId", "rulePack", "reviewer", "status"], { reviewId: "EL-92", caseId: "GB-110", rulePack: "State-202", reviewer: "Worker Lead", status: "Pending" }],
      ["docs", "Documents", ["docId", "caseId", "docType", "receivedOn", "status"], { docId: "DOC-61", caseId: "GB-110", docType: "Income", receivedOn: "2010-03-11", status: "Received" }],
      ["notices", "Notices", ["noticeId", "caseId", "template", "channel", "status"], { noticeId: "NT-07", caseId: "GB-110", template: "Missing Document", channel: "Mail", status: "Queued" }],
      ["escalations", "Escalations", ["escalationId", "caseId", "reason", "owner", "status"], { escalationId: "ESC-4", caseId: "GB-098", reason: "Supervisor review required", owner: "Team 2", status: "Open" }]
    ]
  },
  {
    slug: "dock-appointment-scheduler",
    title: "Dock Appointment Scheduler 2009",
    summary: "Dock scheduling board, carrier check-ins, trailer assignments, and gate queue triage.",
    modules: [
      ["appointments", "Appointments", ["appointmentId", "carrier", "dock", "window", "status"], { appointmentId: "DK-301", carrier: "RoadEx", dock: "D04", window: "08:00", status: "Scheduled" }],
      ["checkin", "Check-in", ["checkinId", "appointmentId", "trailer", "guard", "status"], { checkinId: "CI-81", appointmentId: "DK-301", trailer: "TR-2209", guard: "Gate A", status: "Arrived" }],
      ["staging", "Staging", ["stagingId", "trailer", "zone", "loader", "status"], { stagingId: "ST-62", trailer: "TR-2209", zone: "Yard 2", loader: "M. Baird", status: "Queued" }],
      ["exceptions", "Exceptions", ["exceptionId", "appointmentId", "reason", "owner", "status"], { exceptionId: "EX-15", appointmentId: "DK-298", reason: "Late arrival", owner: "Dock Ops", status: "Review" }],
      ["audit", "Audit", ["auditId", "event", "user", "eventTime", "status"], { auditId: "AU-710", event: "Slot reassigned", user: "DISPATCH", eventTime: "2009-07-09 07:14", status: "Logged" }]
    ]
  },
  {
    slug: "payable-batch-uploader",
    title: "Payable Batch Uploader 2008",
    summary: "AP invoice batch imports, validation failures, reprocessing queue, and posting oversight.",
    modules: [
      ["imports", "Imports", ["batchId", "sourceFile", "rows", "loadedBy", "status"], { batchId: "APB-71", sourceFile: "vendor_apr.csv", rows: "922", loadedBy: "APBOT", status: "Imported" }],
      ["validation", "Validation", ["validationId", "batchId", "rule", "failedRows", "status"], { validationId: "VAL-22", batchId: "APB-71", rule: "PO required", failedRows: "7", status: "Open" }],
      ["reprocess", "Reprocess", ["jobId", "batchId", "attempt", "owner", "status"], { jobId: "RP-11", batchId: "APB-71", attempt: "2", owner: "AP Ops", status: "Queued" }],
      ["posting", "Posting", ["postId", "batchId", "companyCode", "period", "status"], { postId: "POST-09", batchId: "APB-71", companyCode: "1000", period: "2008-04", status: "Posting period closed" }],
      ["history", "History", ["eventId", "batchId", "message", "createdOn", "status"], { eventId: "H-601", batchId: "APB-71", message: "Batch import completed", createdOn: "2008-04-08 22:17", status: "Logged" }]
    ]
  },
  {
    slug: "export-compliance-screening",
    title: "Export Compliance Screening 2011",
    summary: "Denied-party checks, shipment holds, release approvals, and screening retry workflows.",
    modules: [
      ["screening", "Screening Queue", ["screenId", "customer", "orderNo", "score", "status"], { screenId: "SC-540", customer: "Arbor Components", orderNo: "SO-92181", score: "0.71", status: "Hold" }],
      ["matches", "Potential Matches", ["matchId", "screenId", "listName", "analyst", "status"], { matchId: "M-49", screenId: "SC-540", listName: "Denied Party", analyst: "Trade Ops", status: "Review" }],
      ["retries", "Retry Queue", ["retryId", "screenId", "attempt", "nextRun", "status"], { retryId: "RT-27", screenId: "SC-533", attempt: "3", nextRun: "2011-09-19 01:00", status: "Retry failed rows" }],
      ["approvals", "Approvals", ["approvalId", "screenId", "approver", "dueDate", "status"], { approvalId: "APR-95", screenId: "SC-540", approver: "Compliance Mgr", dueDate: "2011-09-19", status: "Workflow pending approval" }],
      ["release", "Release", ["releaseId", "orderNo", "releasedBy", "releaseOn", "status"], { releaseId: "RL-12", orderNo: "SO-91820", releasedBy: "Compliance", releaseOn: "2011-09-17", status: "Released" }]
    ]
  },
  {
    slug: "plant-safety-observation-log",
    title: "Plant Safety Observation Log 2012",
    summary: "Safety observations, corrective action routing, supervisor verification, and closeout history.",
    modules: [
      ["observations", "Observations", ["obsId", "plant", "area", "observer", "status"], { obsId: "OBS-700", plant: "Plant 4", area: "Packaging", observer: "K. Moss", status: "Open" }],
      ["corrective", "Corrective Actions", ["actionId", "obsId", "owner", "targetDate", "status"], { actionId: "CA-111", obsId: "OBS-700", owner: "Maintenance", targetDate: "2012-02-18", status: "In Progress" }],
      ["verification", "Verification", ["verifyId", "actionId", "verifiedBy", "verifyDate", "status"], { verifyId: "VF-72", actionId: "CA-111", verifiedBy: "Supervisor", verifyDate: "", status: "Supervisor review required" }],
      ["escalations", "Escalations", ["escalationId", "obsId", "reason", "owner", "status"], { escalationId: "ES-9", obsId: "OBS-655", reason: "Past due", owner: "Safety Lead", status: "Open" }],
      ["history", "History", ["historyId", "obsId", "event", "eventOn", "status"], { historyId: "HS-22", obsId: "OBS-700", event: "Record locked by another user", eventOn: "2012-02-10 10:22", status: "Logged" }]
    ]
  },
  {
    slug: "dealer-incentive-settlement",
    title: "Dealer Incentive Settlement 2011",
    summary: "Dealer claim imports, rebate validation, approval routing, and settlement batch processing.",
    modules: [
      ["claims", "Claims", ["claimId", "dealer", "program", "amount", "status"], { claimId: "DLR-210", dealer: "Metro Auto", program: "Q4 Rebate", amount: "44000", status: "Imported" }],
      ["validation", "Validation", ["validationId", "claimId", "rule", "analyst", "status"], { validationId: "V-08", claimId: "DLR-210", rule: "VIN required", analyst: "Incentive Ops", status: "Open" }],
      ["approvals", "Approvals", ["approvalId", "claimId", "approver", "dueDate", "status"], { approvalId: "AP-67", claimId: "DLR-210", approver: "Sales Finance", dueDate: "2011-12-09", status: "Pending" }],
      ["settlement", "Settlement", ["settlementId", "claimId", "batch", "settledOn", "status"], { settlementId: "SET-91", claimId: "DLR-201", batch: "INC-22", settledOn: "2011-12-06", status: "Posted" }],
      ["exceptions", "Exceptions", ["exceptionId", "claimId", "reason", "owner", "status"], { exceptionId: "EX-43", claimId: "DLR-210", reason: "Pricing mismatch", owner: "Program Admin", status: "Review" }]
    ]
  },
  {
    slug: "returns-disposition-center",
    title: "Returns Disposition Center 2010",
    summary: "Return intake, inspection workflows, disposition approvals, and refund/export handoff.",
    modules: [
      ["returns", "Returns", ["returnId", "customer", "rma", "warehouse", "status"], { returnId: "RET-991", customer: "Apex Labs", rma: "RMA-7221", warehouse: "WH-2", status: "Received" }],
      ["inspection", "Inspection", ["inspectionId", "returnId", "inspector", "condition", "status"], { inspectionId: "INSP-77", returnId: "RET-991", inspector: "L. Grant", condition: "Damaged", status: "Review" }],
      ["disposition", "Disposition", ["dispositionId", "returnId", "action", "approver", "status"], { dispositionId: "DSP-118", returnId: "RET-991", action: "Scrap", approver: "Warehouse Sup", status: "Pending" }],
      ["refund", "Refund Handoff", ["handoffId", "returnId", "financeQueue", "owner", "status"], { handoffId: "HF-63", returnId: "RET-991", financeQueue: "AR Refund", owner: "Returns Desk", status: "ERP export pending" }],
      ["audit", "Audit", ["auditId", "returnId", "event", "eventBy", "status"], { auditId: "AUD-52", returnId: "RET-991", event: "Open in separate window", eventBy: "RETUSER", status: "Logged" }]
    ]
  },
  {
    slug: "credit-memo-routing",
    title: "Credit Memo Routing 2009",
    summary: "Credit memo request queues, validation exceptions, manager approvals, and ERP posting handoff.",
    modules: [
      ["requests", "Requests", ["requestId", "customer", "memoType", "amount", "status"], { requestId: "CM-18", customer: "Northwind Retail", memoType: "Pricing", amount: "1820", status: "Open" }],
      ["validation", "Validation", ["validationId", "requestId", "rule", "failed", "status"], { validationId: "VL-34", requestId: "CM-18", rule: "Original invoice", failed: "No", status: "Cleared" }],
      ["approvals", "Approvals", ["approvalId", "requestId", "approver", "sla", "status"], { approvalId: "AP-220", requestId: "CM-18", approver: "AR Manager", sla: "24h", status: "Pending" }],
      ["posting", "Posting", ["postingId", "requestId", "docNo", "companyCode", "status"], { postingId: "PS-44", requestId: "CM-11", docNo: "61004421", companyCode: "1000", status: "Posted" }],
      ["queue", "Queue", ["queueId", "owner", "backlog", "priority", "status"], { queueId: "Q-CM-1", owner: "AR Shared", backlog: "27", priority: "High", status: "Job queue backlog" }]
    ]
  },
  {
    slug: "contract-labor-compliance",
    title: "Contract Labor Compliance 2012",
    summary: "Contractor onboarding, policy attestations, badge/VPN approvals, and compliance exception handling.",
    modules: [
      ["contractors", "Contractors", ["contractorId", "name", "vendor", "site", "status"], { contractorId: "CL-501", name: "S. Morris", vendor: "TempCore", site: "Plant 1", status: "Active" }],
      ["attestations", "Attestations", ["attestationId", "contractorId", "policy", "dueDate", "status"], { attestationId: "AT-73", contractorId: "CL-501", policy: "Safety", dueDate: "2012-04-02", status: "Open" }],
      ["access", "Access", ["accessId", "contractorId", "accessType", "approver", "status"], { accessId: "AX-61", contractorId: "CL-501", accessType: "VPN", approver: "IT Security", status: "Pending" }],
      ["exceptions", "Exceptions", ["exceptionId", "contractorId", "reason", "owner", "status"], { exceptionId: "EX-14", contractorId: "CL-477", reason: "Expired badge", owner: "HR Ops", status: "Escalated" }],
      ["history", "History", ["historyId", "contractorId", "event", "createdOn", "status"], { historyId: "H-95", contractorId: "CL-501", event: "Last nightly sync: 2:17 AM", createdOn: "2012-03-28", status: "Info" }]
    ]
  },
  {
    slug: "utility-outage-switchboard",
    title: "Utility Outage Switchboard 2011",
    summary: "Outage intake, crew dispatch, restoration status updates, and customer notification tracking.",
    modules: [
      ["outages", "Outages", ["outageId", "region", "severity", "dispatcher", "status"], { outageId: "OUT-810", region: "North Grid", severity: "High", dispatcher: "Control Room", status: "Open" }],
      ["crews", "Crew Dispatch", ["crewId", "outageId", "crewLead", "eta", "status"], { crewId: "CR-41", outageId: "OUT-810", crewLead: "D. Cole", eta: "00:35", status: "Assigned" }],
      ["restoration", "Restoration", ["restoreId", "outageId", "restoredPct", "updatedOn", "status"], { restoreId: "RS-09", outageId: "OUT-810", restoredPct: "45", updatedOn: "2011-01-17 18:20", status: "Processing..." }],
      ["notifications", "Notifications", ["noticeId", "outageId", "channel", "batch", "status"], { noticeId: "NT-56", outageId: "OUT-810", channel: "Call Tree", batch: "N-201", status: "Queued" }],
      ["postmortem", "Postmortem", ["reportId", "outageId", "owner", "dueDate", "status"], { reportId: "PM-77", outageId: "OUT-755", owner: "Ops Manager", dueDate: "2011-01-20", status: "Open" }]
    ]
  },
  {
    slug: "loan-servicing-collections",
    title: "Loan Servicing Collections 2010",
    summary: "Delinquency queues, promise-to-pay tracking, legal escalations, and collector performance views.",
    modules: [
      ["accounts", "Delinquent Accounts", ["accountId", "borrower", "daysPastDue", "collector", "status"], { accountId: "LN-7201", borrower: "C. Dorsey", daysPastDue: "64", collector: "A. Lopez", status: "Open" }],
      ["ptp", "Promise To Pay", ["promiseId", "accountId", "amount", "promiseDate", "status"], { promiseId: "PTP-66", accountId: "LN-7201", amount: "420", promiseDate: "2010-08-19", status: "Tracked" }],
      ["notes", "Collector Notes", ["noteId", "accountId", "summary", "createdBy", "status"], { noteId: "N-90", accountId: "LN-7201", summary: "Left voicemail", createdBy: "A. Lopez", status: "Logged" }],
      ["legal", "Legal Handoff", ["legalId", "accountId", "firm", "handoffDate", "status"], { legalId: "LG-12", accountId: "LN-6988", firm: "M&R Law", handoffDate: "2010-08-11", status: "Pending" }],
      ["productivity", "Productivity", ["metricId", "collector", "calls", "rpc", "status"], { metricId: "M-8", collector: "A. Lopez", calls: "53", rpc: "17", status: "Daily" }]
    ]
  },
  {
    slug: "quality-release-gate",
    title: "Quality Release Gate 2012",
    summary: "Inspection results, non-conformance review, release approvals, and CAPA follow-up tracking.",
    modules: [
      ["lots", "Production Lots", ["lotId", "product", "plant", "inspector", "status"], { lotId: "LOT-311", product: "Valve-Kit", plant: "P2", inspector: "Q. Shaw", status: "Hold" }],
      ["inspection", "Inspection", ["inspectionId", "lotId", "testPack", "result", "status"], { inspectionId: "IN-400", lotId: "LOT-311", testPack: "AQL-2", result: "Fail", status: "Open" }],
      ["nc", "Non-Conformance", ["ncId", "lotId", "defect", "owner", "status"], { ncId: "NC-22", lotId: "LOT-311", defect: "Seal deformation", owner: "Quality Eng", status: "Investigate" }],
      ["release", "Release", ["releaseId", "lotId", "approver", "decision", "status"], { releaseId: "RL-200", lotId: "LOT-300", approver: "QA Lead", decision: "Approved", status: "Released" }],
      ["capa", "CAPA", ["capaId", "ncId", "actionOwner", "dueDate", "status"], { capaId: "CA-80", ncId: "NC-22", actionOwner: "MFG Ops", dueDate: "2012-11-04", status: "Open" }]
    ]
  },
  {
    slug: "document-imaging-queue",
    title: "Document Imaging Queue 2009",
    summary: "Scan intake, OCR validation, indexing exceptions, and workflow reprocessing operations.",
    modules: [
      ["scan", "Scan Queue", ["scanId", "source", "pages", "operator", "status"], { scanId: "SCN-901", source: "Mailroom", pages: "38", operator: "IMG01", status: "Captured" }],
      ["ocr", "OCR", ["ocrId", "scanId", "engine", "confidence", "status"], { ocrId: "OCR-72", scanId: "SCN-901", engine: "ABBYY 9", confidence: "91", status: "Review" }],
      ["indexing", "Indexing", ["indexId", "scanId", "docType", "indexer", "status"], { indexId: "IDX-61", scanId: "SCN-901", docType: "Invoice", indexer: "Queue B", status: "Open" }],
      ["reprocess", "Reprocess", ["jobId", "scanId", "reason", "attempt", "status"], { jobId: "RP-401", scanId: "SCN-884", reason: "7 records failed validation", attempt: "2", status: "Retry failed rows" }],
      ["export", "Export", ["exportId", "scanId", "targetSystem", "runDate", "status"], { exportId: "EX-77", scanId: "SCN-880", targetSystem: "ERP", runDate: "2009-04-17", status: "ERP export pending" }]
    ]
  },
  {
    slug: "procurement-invoice-holdboard",
    title: "Procurement Invoice Holdboard 2011",
    summary: "Invoice hold queues, discrepancy review, buyer escalations, and release posting workflows.",
    modules: [
      ["holds", "Hold Queue", ["holdId", "invoiceNo", "vendor", "holdReason", "status"], { holdId: "HD-220", invoiceNo: "51009921", vendor: "Summit Process", holdReason: "3-way mismatch", status: "Open" }],
      ["discrepancies", "Discrepancies", ["discrepancyId", "holdId", "poNo", "analyst", "status"], { discrepancyId: "DS-17", holdId: "HD-220", poNo: "PO-88122", analyst: "P2P Ops", status: "Review" }],
      ["escalations", "Escalations", ["escalationId", "holdId", "buyer", "escalatedOn", "status"], { escalationId: "ES-77", holdId: "HD-220", buyer: "K. Nye", escalatedOn: "2011-06-09", status: "Pending" }],
      ["approvals", "Approvals", ["approvalId", "holdId", "approver", "dueDate", "status"], { approvalId: "AP-66", holdId: "HD-201", approver: "Procurement Mgr", dueDate: "2011-06-10", status: "Approved" }],
      ["release", "Release Posting", ["releaseId", "holdId", "postedBy", "postedOn", "status"], { releaseId: "RL-31", holdId: "HD-201", postedBy: "AP Shared", postedOn: "2011-06-10", status: "Posted" }]
    ]
  },
  {
    slug: "inventory-cyclecount-console",
    title: "Inventory Cyclecount Console 2008",
    summary: "Cycle count task waves, handheld count uploads, variance approvals, and recount operations.",
    modules: [
      ["waves", "Count Waves", ["waveId", "warehouse", "zone", "owner", "status"], { waveId: "WV-11", warehouse: "DC-3", zone: "Aisle 4", owner: "Inventory Ctrl", status: "Released" }],
      ["uploads", "Handheld Uploads", ["uploadId", "waveId", "device", "rows", "status"], { uploadId: "UP-51", waveId: "WV-11", device: "RF-22", rows: "144", status: "Imported" }],
      ["variance", "Variance", ["varianceId", "material", "difference", "reviewer", "status"], { varianceId: "VR-70", material: "MAT-771", difference: "-18", reviewer: "Warehouse Sup", status: "Pending" }],
      ["recount", "Recount", ["recountId", "varianceId", "counter", "scheduledOn", "status"], { recountId: "RC-18", varianceId: "VR-70", counter: "Team B", scheduledOn: "2008-12-09", status: "Queued" }],
      ["close", "Close", ["closeId", "waveId", "closedBy", "closeOn", "status"], { closeId: "CL-99", waveId: "WV-09", closedBy: "Inventory Lead", closeOn: "2008-12-06", status: "Closed" }]
    ]
  }
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
    statusText: \`Last nightly sync: 2:17 AM | Session timeout warning: 5m | Job queue backlog\`,
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

for (const [index, app] of apps.entries()) {
  const appRoot = join(root, "apps", app.slug);
  mkdirSync(join(appRoot, "src"), { recursive: true });

  const packageJson = {
    name: `@legacy/${app.slug}`,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build --base ./",
      test: `node -e \"console.log('${app.slug}: no tests yet')\"`
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

  const readme = `# ${app.slug}\n\n${app.summary}\n\nRun:\n\n\`\`\`bash\ncorepack pnpm --filter @legacy/${app.slug} dev\n\`\`\`\n`;

  const indexHtml = `<!doctype html>\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${app.title}</title>\n  </head>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="./src/main.js"></script>\n  </body>\n</html>\n`;

  writeFileSync(join(appRoot, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");
  writeFileSync(join(appRoot, "README.md"), readme);
  writeFileSync(join(appRoot, "index.html"), indexHtml);
  writeFileSync(join(appRoot, "src", "main.js"), appTemplate(app, palettes[index % palettes.length]));
}

console.log(`Generated ${apps.length} operations-heavy legacy app scaffolds.`);
