import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel, tabs } from "@legacy/shared-ui";

const namespace = "chargeback-response-workbench";
const modules = [
  { id: "cases", label: "Cases" },
  { id: "evidence", label: "Evidence" },
  { id: "deadlines", label: "Deadlines" },
  { id: "submissions", label: "Submissions" },
  { id: "outcomes", label: "Outcomes" }
];

const columns = {
  cases: ["caseId", "reasonCode", "merchantId", "networkStatus", "assignedAnalyst"],
  evidence: ["evidenceId", "caseId", "artifactType", "ocrStatus", "status"],
  deadlines: ["deadlineId", "caseId", "network", "dueDate", "status"],
  submissions: ["submissionId", "caseId", "acquirerStatus", "ackStatus", "status"],
  outcomes: ["outcomeId", "caseId", "decision", "postedOn", "status"]
};

const palette = {
  "--legacy-bg": "#ccd5df",
  "--legacy-panel": "#e7edf4",
  "--legacy-nav": "#bcc8d6",
  "--legacy-grid-head": "#c3d1df",
  "--legacy-active": "#33577e",
  "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
};

const ENV = "CB-OPS-PROD04";
const ANALYST = "PAYOPS\\r.mitchell";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - Chargeback Response Workbench 2010

Chargeback Response Workbench 2010 is an enterprise payment-operations application used to manage credit-card dispute workflows, evidence submission processes, and chargeback response tracking.

The platform centralizes dispute-management activities into a desktop operations environment used by payment analysts, finance operations teams, and merchant-services departments.

The application supports:
- chargeback case management
- evidence collection
- dispute deadline tracking
- analyst workflow queues
- submission monitoring
- arbitration handling
- acquirer portal coordination
- compliance reporting
- audit tracking

The platform was commonly used within:
- retail payment operations
- e-commerce merchant services
- hospitality organizations
- logistics payment teams
- banking operations centers
- enterprise finance departments

The application integrates with:
- Visa dispute systems
- Mastercard processing platforms
- merchant acquirer portals
- AS400 transaction systems
- shared-drive repositories
- PDF archival systems
- Excel tracking workbooks

Operational workflows are organized around queue-based processing including:
- open disputes
- deadline monitoring
- evidence gathering
- analyst assignment
- submission retry handling
- arbitration escalation
- closed-case archiving

The interface reflects enterprise desktop systems commonly developed using:
- VB.NET WinForms
- Java Swing
- PowerBuilder
- early .NET Framework clients

The application provides:
- dispute dashboards
- evidence-management panels
- submission tracking
- compliance reporting
- retry processing consoles
- audit-history tools
- network synchronization monitoring
- deadline and aging visibility

Typical users include:
- chargeback analysts
- merchant-services teams
- payment operations specialists
- compliance reviewers
- dispute managers
- finance operations teams

RPA PROBLEM STATEMENT

Many dispute-management workflows require repetitive manual interaction across disconnected payment systems, portals, desktop applications, and shared repositories.

Common operational activities include:
- downloading chargeback notices
- renaming and organizing evidence files
- uploading documents into portals
- gathering receipts from multiple systems
- entering dispute references manually
- tracking submission deadlines
- retrying failed submissions
- updating spreadsheet trackers
- reviewing analyst queues

These repetitive workflows create opportunities for RPA solutions to:
- automate evidence collection
- streamline dispute submission workflows
- reduce manual document handling
- assist with portal navigation
- automate retry processing
- monitor approaching deadlines
- improve dispute queue visibility
- support attended and unattended automation scenarios`;

const systemMessages = [
  "Card-network gateway unavailable.",
  "Evidence packet incomplete.",
  "Case locked by another analyst.",
  "Submission deadline approaching.",
  "Acquirer acknowledgement delayed."
];

const backgroundServices = [
  "VISA_SYNC_ENGINE",
  "MC_RETRY_QUEUE",
  "PDF_PACKET_BUILDER",
  "OCR_ATTACHMENT_WORKER",
  "SLA_MONITOR_02"
];

const retryLogs = [
  "[01:41:12] Rebuilding evidence package...",
  "[01:41:16] Submitting to Visa dispute gateway...",
  "[01:41:19] Awaiting network acknowledgement...",
  "[01:41:24] Submission accepted."
];

let activeModule = modules[0].id;
let queueOrdering = "oldest-first";
let statusInterval = null;
let messageInterval = null;

let randomSystemMessage = systemMessages[0];
let activityFeed = [
  `${new Date().toLocaleString()} Visa sync checkpoint completed`,
  `${new Date().toLocaleString()} Arbitration queue snapshot refreshed`,
  `${new Date().toLocaleString()} Submission engine waiting for ack`
];
let auditFeed = [
  makeAudit("Case CB-901 escalated to supervisor"),
  makeAudit("Evidence packet for CB-884 modified by analyst"),
  makeAudit("Resubmission attempt logged for CB-877")
];

ensureSeed(namespace, () => ({
  cases: [
    { caseId: "CB-901", reasonCode: "13.1", merchantId: "MID-44102", networkStatus: "Visa Pending", assignedAnalyst: "R. Mitchell" },
    { caseId: "CB-905", reasonCode: "4863", merchantId: "MID-44818", networkStatus: "MC Review", assignedAnalyst: "T. Hughes" }
  ],
  evidence: [
    { evidenceId: "EV-41", caseId: "CB-901", artifactType: "Signed delivery proof", ocrStatus: "Extracted", status: "Complete" },
    { evidenceId: "EV-52", caseId: "CB-905", artifactType: "POS screenshot", ocrStatus: "Queued", status: "Missing" }
  ],
  deadlines: [
    { deadlineId: "DL-22", caseId: "CB-901", network: "Visa", dueDate: "2010-06-18", status: "SLA-24h" },
    { deadlineId: "DL-29", caseId: "CB-905", network: "Mastercard", dueDate: "2010-06-20", status: "SLA-48h" }
  ],
  submissions: [
    { submissionId: "SUB-17", caseId: "CB-901", acquirerStatus: "Queued", ackStatus: "Pending", status: "Retry" },
    { submissionId: "SUB-18", caseId: "CB-905", acquirerStatus: "Transmitted", ackStatus: "Accepted", status: "Complete" }
  ],
  outcomes: [
    { outcomeId: "OUT-13", caseId: "CB-801", decision: "Won", postedOn: "2010-05-30", status: "Closed" },
    { outcomeId: "OUT-22", caseId: "CB-772", decision: "Arbitration Pending", postedOn: "", status: "Open" }
  ]
}));

function installPageStyles() {
  if (document.getElementById("cb-workbench-tune")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "cb-workbench-tune";
  style.textContent = `
    .cb-workbench { display:grid; grid-template-columns:250px 1fr; gap:8px; }
    .cb-left { display:grid; gap:6px; align-content:start; }
    .cb-mini { border:1px solid #7d8996; background:linear-gradient(to bottom,#edf2f7,#d0d9e4); padding:5px; font-size:10px; }
    .cb-mini h4 { margin:0 0 4px; font-size:10px; text-transform:uppercase; letter-spacing:0.2px; color:#2f3f52; }
    .cb-mini ul { margin:0; padding-left:13px; display:grid; gap:1px; }
    .cb-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:4px; }
    .cb-kpi { border:1px solid #7a8795; background:#dce5ef; padding:4px 6px; font-size:10px; }
    .cb-kpi strong { display:block; font-size:12px; color:#22374d; }
    .cb-split { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
    .cb-feed { max-height:150px; overflow:auto; border:1px solid #808a96; background:#f8fafc; padding:4px; font-size:10px; }
    .cb-row { border-bottom:1px dotted #9ca8b5; padding:2px 0; }
    .cb-row:last-child { border-bottom:0; }
    .cb-warning { border:1px solid #a67b33; background:#f4dfb5; color:#4d3713; font-size:10px; padding:3px 6px; }
    .cb-badge { display:inline-block; border:1px solid #8b2732; background:#f7c7d1; color:#5d1a22; font-size:9px; padding:0 4px; margin-left:4px; }
    .cb-urgent { color:#8b1f1f; font-weight:700; }
    .cb-modal { position:absolute; inset:0; z-index:45; background:rgba(182,191,201,0.56); display:flex; align-items:center; justify-content:center; }
    .cb-modal-card { width:min(860px, calc(100vw - 36px)); max-height:calc(100vh - 38px); overflow:auto; border:1px solid #677383; background:#e8edf3; box-shadow:2px 2px 0 #808b98; }
    .cb-modal-head { background:linear-gradient(to bottom,#e6edf5,#bcc8d6); border-bottom:1px solid #7e8995; padding:6px 8px; font-size:11px; font-weight:700; display:flex; justify-content:space-between; }
    .cb-modal-body { padding:8px; font-size:11px; }
    .cb-modal-foot { border-top:1px solid #7e8995; padding:6px 8px; display:flex; gap:4px; justify-content:flex-end; }
    .cb-progress { border:1px solid #738191; background:#d0d9e3; height:14px; margin:8px 0; }
    .cb-progress > span { display:block; height:100%; width:0; background:linear-gradient(to bottom,#95adca,#54799e); }
    .cb-toast-wrap { position:absolute; top:56px; right:12px; z-index:50; display:grid; gap:4px; }
    .cb-toast { border:1px solid #6f7b88; background:#edf3f8; color:#243345; padding:5px 7px; font-size:10px; min-width:220px; box-shadow:1px 1px 0 #8b98a6; }
    .cb-toast.warning { border-color:#a67b33; background:#f5e3bf; color:#4b3716; }
    .cb-audit { width:100%; border-collapse:collapse; font-size:10px; }
    .cb-audit th, .cb-audit td { border:1px solid #8b95a0; padding:3px 4px; }
    .cb-spool { border:1px solid #6f7b87; background:#e8edf3; padding:2px 6px; font-size:10px; }
    @media (max-width:1040px) {
      .cb-workbench { grid-template-columns:1fr; }
      .cb-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .cb-split { grid-template-columns:1fr; }
    }
  `;
  document.head.appendChild(style);
}

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function makeAudit(action) {
  return {
    timestamp: new Date().toLocaleString(),
    analyst: ANALYST,
    action,
    ref: `CB-${Math.floor(110000 + Math.random() * 99000)}`
  };
}

function rotateMessage() {
  randomSystemMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
  const node = document.querySelector("[data-system-message]");
  if (node) {
    node.textContent = randomSystemMessage;
  }
}

function pushActivity(message) {
  activityFeed = [`${new Date().toLocaleTimeString()} ${message}`, ...activityFeed].slice(0, 16);
}

function pushAudit(action) {
  auditFeed = [makeAudit(action), ...auditFeed].slice(0, 20);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function currentSeed() {
  return loadSeed(namespace, () => ({}));
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openModal({ title, bodyHtml, footerButtons = [{ id: "close", label: "Close" }] }) {
  const host = document.querySelector(".legacy-window");
  if (!host) {
    return null;
  }

  const modal = document.createElement("div");
  modal.className = "cb-modal";
  modal.innerHTML = `
    <div class="cb-modal-card">
      <div class="cb-modal-head"><span>${title}</span><button class="legacy-btn" data-close-x="1">X</button></div>
      <div class="cb-modal-body">${bodyHtml}</div>
      <div class="cb-modal-foot">${footerButtons.map((btn) => `<button class="legacy-btn" data-modal-btn="${btn.id}">${btn.label}</button>`).join("")}</div>
    </div>
  `;
  host.appendChild(modal);
  return modal;
}

function closeModal(modal) {
  modal?.remove();
}

function toast(message, warning = false) {
  const host = document.querySelector(".legacy-window");
  if (!host) {
    return;
  }

  let wrap = host.querySelector(".cb-toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "cb-toast-wrap";
    host.appendChild(wrap);
  }

  const node = document.createElement("div");
  node.className = `cb-toast${warning ? " warning" : ""}`;
  node.textContent = message;
  wrap.appendChild(node);
  window.setTimeout(() => node.remove(), 3600);
}

function updateStatusBar() {
  const node = document.querySelector(".legacy-statusbar");
  if (!node) {
    return;
  }
  const latency = 34 + Math.floor(Math.random() * 38);
  const cases = (currentSeed().cases || []).length;
  node.innerHTML = `ENV ${ENV} | USER ${ANALYST} | Sync ${latency}ms | Queue ${queueOrdering} | Dispute Aging ${cases} | Frozen Queue: 1`;
}

function startStatusLoops() {
  if (!statusInterval) {
    updateStatusBar();
    statusInterval = window.setInterval(updateStatusBar, 1000);
  }
  if (!messageInterval) {
    messageInterval = window.setInterval(rotateMessage, 6500);
  }
}

function buildSidebar() {
  return `
    <div class="cb-left">
      <section class="cb-mini"><h4>Open Cases</h4><ul><li>Visa: 18</li><li>Mastercard: 14</li><li>Amex: 5</li></ul></section>
      <section class="cb-mini"><h4>Missing Evidence</h4><ul><li>Receipts missing: 4</li><li>Delivery proof missing: 2</li></ul></section>
      <section class="cb-mini"><h4>Escalated Disputes</h4><ul><li>Supervisor review: 3</li><li><span class="cb-badge">Priority</span> CB-901</li></ul></section>
      <section class="cb-mini"><h4>Arbitration Queue</h4><ul><li>Pending arbitration: 6</li><li>Awaiting docs: 2</li></ul></section>
      <section class="cb-mini"><h4>Deadline Failures</h4><ul><li>Past SLA: 1</li><li>Within 24h: 3</li></ul></section>
      <section class="cb-mini"><h4>Network Rejections</h4><ul><li>Visa rejects: 2</li><li>MC rejects: 1</li></ul></section>
    </div>
  `;
}

function renderModuleSummary() {
  if (activeModule === "cases") {
    return panel(
      "Cases Tab",
      `
      <div class="cb-kpis">
        <div class="cb-kpi"><strong>37</strong>Active Disputes</div>
        <div class="cb-kpi"><strong>9</strong>Cases 30+ Days</div>
        <div class="cb-kpi"><strong>5</strong>Frozen Queue Items</div>
        <div class="cb-kpi"><strong>3</strong>Supervisor Escalations</div>
      </div>
      <div class="cb-split" style="margin-top:6px;">
        <section class="cb-mini"><h4>Case Fields</h4><ul><li>Case aging</li><li>Dispute reason code</li><li>Merchant ID</li><li>Network status</li><li>Assigned analyst</li></ul></section>
        <section class="cb-mini"><h4>Queue Handling</h4><ul><li>Queue-driven case routing</li><li>Card-network sync indicators</li><li>Compliance checkpoint tags</li></ul></section>
      </div>
      `
    );
  }

  if (activeModule === "evidence") {
    return panel(
      "Evidence Tab",
      `
      <div class="cb-split">
        <section class="cb-mini"><h4>Evidence Types</h4><ul><li>Uploaded receipts</li><li>Signed delivery proof</li><li>POS screenshots</li><li>Customer communication logs</li></ul></section>
        <section class="cb-mini"><h4>Upload Monitor</h4><ul><li>OCR attachment extraction status tracked</li><li>Evidence upload queue monitor active</li><li>Packet completeness checks enabled</li></ul></section>
      </div>
      `
    );
  }

  if (activeModule === "deadlines") {
    return panel(
      "Deadlines Tab",
      `
      <div class="cb-split">
        <section class="cb-mini"><h4>Network Deadlines</h4><ul><li>Visa deadlines</li><li>Mastercard arbitration dates</li><li>Amex retrieval requests</li></ul></section>
        <section class="cb-mini"><h4>SLA Timers</h4><ul><li>Escalation countdowns</li><li class="cb-urgent">Approaching deadlines highlighted</li><li>Auto-color timer states</li></ul></section>
      </div>
      `
    );
  }

  if (activeModule === "submissions") {
    return panel(
      "Submissions Tab",
      `
      <div class="cb-split">
        <section class="cb-mini"><h4>Batch Submission Monitor</h4><ul><li>Transmission logs</li><li>Acquirer status updates</li><li>Rejected case queue</li></ul></section>
        <section class="cb-mini"><h4>Acknowledgements</h4><ul><li>Network acknowledgement statuses</li><li>Background submission engine active</li><li>Retry queue health monitored</li></ul></section>
      </div>
      `
    );
  }

  return panel(
    "Outcomes Tab",
    `<div class="cb-mini"><h4>Outcome States</h4><ul><li>Won</li><li>Lost</li><li>Arbitration Pending</li><li>Write-Off Approved</li><li>Recovery Posted</li></ul></div>`
  );
}

async function handleExportExcel() {
  const modal = openModal({
    title: "Export Chargeback Aging Workbook",
    bodyHtml: `<div>Packaging export workbook...</div><div class="cb-progress"><span data-progress></span></div><div class="cb-feed" data-log></div>`,
    footerButtons: [{ id: "close", label: "Close" }]
  });
  if (!modal) {
    return;
  }

  const bar = modal.querySelector("[data-progress]");
  const log = modal.querySelector("[data-log]");
  const steps = [
    "Collecting dispute statuses...",
    "Collecting pending deadlines...",
    "Collecting analyst workloads...",
    "Collecting evidence completeness..."
  ];

  for (let i = 0; i < steps.length; i += 1) {
    log.innerHTML += `<div class="cb-row">${steps[i]}</div>`;
    bar.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
    await wait(360);
  }

  const workbook = [
    "Chargeback Aging Workbook",
    "Dispute Statuses",
    "Pending Deadlines",
    "Analyst Workloads",
    "Evidence Completeness"
  ].join("\n");
  downloadFile(`chargeback-aging-${new Date().toISOString().slice(0, 10)}.xlsx`, workbook, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  pushAudit("Exported chargeback aging workbook");
  toast("Export packaging complete");

  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  render();
}

async function handlePrintPreview() {
  const modal = openModal({
    title: "Compliance Report Viewer",
    bodyHtml: `
      <div class="cb-progress"><span data-print-progress></span></div>
      <div style="border:1px solid #8a94a1;min-height:180px;background:#fff;padding:10px;position:relative;">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:24px;color:rgba(130,37,37,0.16);font-weight:700;transform:rotate(-18deg);">INTERNAL REVIEW</div>
        <div><strong>Chargeback Compliance Summary</strong></div>
        <div>Dispute summaries, merchant notes, evidence checklist, submission history</div>
      </div>
    `,
    footerButtons: [{ id: "close", label: "Close" }, { id: "print", label: "Print" }]
  });

  if (!modal) {
    return;
  }

  const bar = modal.querySelector("[data-print-progress]");
  for (let pct = 0; pct <= 100; pct += 20) {
    bar.style.width = `${pct}%`;
    await wait(140);
  }

  modal.querySelector('[data-modal-btn="print"]')?.addEventListener("click", () => {
    toast("Compliance report sent to printer spool");
    pushActivity("Faux print spool notification posted");
    pushAudit("Opened print preview and sent report to spool");
    closeModal(modal);
    render();
  });

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
}

function handleRetryFailed() {
  const modal = openModal({
    title: "Retry Failed Submissions",
    bodyHtml: `<div class="legacy-terminal" data-terminal></div>`,
    footerButtons: [{ id: "close", label: "Close" }]
  });
  if (!modal) {
    return;
  }

  const terminal = modal.querySelector("[data-terminal]");
  retryLogs.forEach((line, index) => {
    window.setTimeout(() => {
      terminal.innerHTML += `<div class="line">${line}</div>`;
      terminal.scrollTop = terminal.scrollHeight;
      if (index === retryLogs.length - 1) {
        pushActivity("Card-network resubmission completed");
        pushAudit("Executed retry failed gateway submission");
      }
    }, (index + 1) * 520);
  });

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
}

function handleGeneratePdf() {
  const modal = openModal({
    title: "Generate Evidence Packet",
    bodyHtml: `<div>Compiling evidence packet...</div><div class="cb-feed" data-log></div><div class="cb-progress"><span data-progress></span></div>`,
    footerButtons: [{ id: "close", label: "Close" }]
  });
  if (!modal) {
    return;
  }

  const steps = [
    "Merging receipt images...",
    "Merging signed forms...",
    "Merging customer correspondence...",
    "Merging transaction logs...",
    "Compressing archival package..."
  ];
  const log = modal.querySelector("[data-log]");
  const bar = modal.querySelector("[data-progress]");

  (async () => {
    for (let i = 0; i < steps.length; i += 1) {
      log.innerHTML += `<div class="cb-row">${steps[i]}</div>`;
      bar.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
      await wait(320);
    }

    downloadFile(`chargeback-evidence-packet-${new Date().toISOString().slice(0, 10)}.pdf`, "Chargeback Evidence Packet", "application/pdf");
    pushAudit("Generated PDF evidence packet");
    toast("Evidence packet compiled and archived");
    render();
  })();

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
}

function renderAuditRows(filter = "") {
  const q = filter.trim().toLowerCase();
  return auditFeed
    .filter((row) => (q ? `${row.timestamp} ${row.analyst} ${row.action} ${row.ref}`.toLowerCase().includes(q) : true))
    .map((row) => `<tr><td>${row.timestamp}</td><td>${row.analyst}</td><td>${row.action}</td><td>${row.ref}</td></tr>`)
    .join("");
}

function handleViewAuditHistory() {
  const modal = openModal({
    title: "Audit History",
    bodyHtml: `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;"><label for="audit-search">Search</label><input id="audit-search" class="legacy-field" style="max-width:280px;" placeholder="analyst, action, reference"/></div>
      <table class="cb-audit"><thead><tr><th>Timestamp</th><th>Analyst</th><th>Action</th><th>Reference</th></tr></thead><tbody data-audit-rows>${renderAuditRows()}</tbody></table>
    `,
    footerButtons: [{ id: "close", label: "Close" }]
  });
  if (!modal) {
    return;
  }

  const rows = modal.querySelector("[data-audit-rows]");
  modal.querySelector("#audit-search")?.addEventListener("input", (event) => {
    rows.innerHTML = renderAuditRows(event.target.value || "");
  });

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
}

function handleToggleFirst() {
  const latest = currentSeed();
  queueOrdering = queueOrdering === "oldest-first" ? "newest-first" : "oldest-first";
  latest[activeModule].reverse();
  saveSeed(namespace, latest);
  pushActivity(`Queue ordering switched to ${queueOrdering}`);
  toast("Case queue ordering updated");
  render();
}

function handleDeleteLast() {
  const latest = currentSeed();
  if (latest[activeModule].length > 0) {
    latest[activeModule].pop();
    saveSeed(namespace, latest);
    pushAudit(`Removed latest ${activeModule} queue item`);
    toast("Latest row removed from queue", true);
  } else {
    toast("No queue rows available for delete", true);
  }
  render();
}

function buildFreshSeed() {
  return {
    cases: [
      { caseId: "CB-944", reasonCode: "10.4", merchantId: "MID-45210", networkStatus: "Visa Review", assignedAnalyst: "R. Mitchell" },
      { caseId: "CB-955", reasonCode: "4853", merchantId: "MID-47022", networkStatus: "MC Pending", assignedAnalyst: "K. Flores" }
    ],
    evidence: [
      { evidenceId: "EV-77", caseId: "CB-944", artifactType: "Receipt image", ocrStatus: "Extracted", status: "Complete" },
      { evidenceId: "EV-78", caseId: "CB-955", artifactType: "Customer correspondence", ocrStatus: "Queued", status: "Missing" }
    ],
    deadlines: [
      { deadlineId: "DL-33", caseId: "CB-944", network: "Visa", dueDate: "2010-07-01", status: "SLA-48h" },
      { deadlineId: "DL-35", caseId: "CB-955", network: "Amex", dueDate: "2010-07-03", status: "SLA-24h" }
    ],
    submissions: [
      { submissionId: "SUB-31", caseId: "CB-944", acquirerStatus: "Queued", ackStatus: "Pending", status: "Retry" },
      { submissionId: "SUB-32", caseId: "CB-955", acquirerStatus: "Transmitted", ackStatus: "Accepted", status: "Complete" }
    ],
    outcomes: [
      { outcomeId: "OUT-51", caseId: "CB-844", decision: "Recovery Posted", postedOn: "2010-06-22", status: "Closed" },
      { outcomeId: "OUT-53", caseId: "CB-832", decision: "Write-Off Approved", postedOn: "2010-06-18", status: "Closed" }
    ]
  };
}

function handleSeedReset() {
  saveSeed(namespace, buildFreshSeed());
  pushActivity("Case and evidence queues regenerated");
  toast("Seed reset complete");
  render();
}

function decorateGridRows() {
  if (activeModule !== "deadlines") {
    return;
  }

  document.querySelectorAll(".legacy-grid tbody tr").forEach((row) => {
    const statusCell = row.children[4];
    if (!statusCell) {
      return;
    }
    const value = statusCell.textContent || "";
    if (/24h|urgent|sla/i.test(value)) {
      statusCell.classList.add("cb-urgent");
      if (!statusCell.querySelector(".cb-badge")) {
        statusCell.innerHTML = `${statusCell.textContent}<span class="cb-badge">Alert</span>`;
      }
    }
  });
}

function render() {
  installPageStyles();
  applyPalette();

  const data = currentSeed();
  const moduleColumns = columns[activeModule];
  const orderedRows = queueOrdering === "oldest-first" ? data[activeModule] : [...data[activeModule]].reverse();
  const rows = orderedRows.map((row) => moduleColumns.map((key) => row[key]));
  const grid = dataGrid(moduleColumns, rows);

  const formFields = moduleColumns.map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`).join("");
  const topTabs = tabs(modules.map((m) => ({ id: m.id, label: m.label })), activeModule);

  const contentHtml =
    `<div class="cb-workbench">${buildSidebar()}<div>` +
    panel(
      "Chargeback Operations Workspace",
      `${topTabs}
      ${renderModuleSummary()}
      <div class="cb-split">
        <section class="cb-mini"><h4>Dispute Aging Counters</h4><ul><li>0-7 days: 11</li><li>8-14 days: 9</li><li>15+ days: 7</li></ul></section>
        <section class="cb-mini"><h4>Payment Network Status Feed</h4><div class="cb-feed">${activityFeed.map((line) => `<div class="cb-row">${line}</div>`).join("")}</div></section>
      </div>
      <div class="cb-warning" data-system-message>${randomSystemMessage}</div>
      <div class="cb-split" style="margin-top:6px;">
        <section class="cb-mini"><h4>Background Submission Engine</h4><ul>${backgroundServices.map((job) => `<li>${job} ONLINE</li>`).join("")}</ul></section>
        <section class="cb-mini"><h4>Operational Alerts</h4><ul><li>Frozen queue indicators: 1</li><li>Evidence upload queue depth: 6</li><li>Supervisor escalation badges: 3</li></ul><div class="cb-spool">Printer spool: compliance report waiting</div></section>
      </div>`
    ) +
    panel("Dispute Grid", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:6px;display:flex;gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`) +
    `</div></div>`;

  document.getElementById("app").innerHTML = appShell({
    title: "Chargeback Response Workbench 2010",
    modules,
    activeModule,
    appDescription: APP_DESCRIPTION,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" },
      { id: "generate-pdf", label: "Generate PDF" },
      { id: "view-audit", label: "View Audit History" }
    ],
    statusText: `ENV ${ENV} | USER ${ANALYST}`,
    contentHtml
  });

  startStatusLoops();
  updateStatusBar();
  decorateGridRows();

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-tab");
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

    const latest = currentSeed();
    const index = latest[moduleName].findIndex((item) => item[keyField] === row[keyField]);
    if (index >= 0) {
      latest[moduleName][index] = row;
    } else {
      latest[moduleName].push(row);
    }

    saveSeed(namespace, latest);
    pushActivity(`Updated ${moduleName} queue record ${row[keyField]}`);
    pushAudit(`Modified ${moduleName} record ${row[keyField]}`);
    render();
  });
}

function installHandlers() {
  const root = document.getElementById("app");
  if (!root || root.dataset.actionsInstalled === "1") {
    return;
  }
  root.dataset.actionsInstalled = "1";

  root.addEventListener(
    "click",
    (event) => {
      const target = event.target instanceof Element ? event.target.closest("[data-action]") : null;
      if (!target) {
        return;
      }

      const action = target.getAttribute("data-action");
      const known = new Set([
        "export-excel",
        "print-preview",
        "retry-failed",
        "toggle-first",
        "delete-last",
        "seed-reset",
        "generate-pdf",
        "view-audit"
      ]);

      if (!known.has(action)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (action === "export-excel") {
        handleExportExcel();
      } else if (action === "print-preview") {
        handlePrintPreview();
      } else if (action === "retry-failed") {
        handleRetryFailed();
      } else if (action === "toggle-first") {
        handleToggleFirst();
      } else if (action === "delete-last") {
        handleDeleteLast();
      } else if (action === "seed-reset") {
        handleSeedReset();
      } else if (action === "generate-pdf") {
        handleGeneratePdf();
      } else if (action === "view-audit") {
        handleViewAuditHistory();
      }
    },
    true
  );
}

installHandlers();
render();
