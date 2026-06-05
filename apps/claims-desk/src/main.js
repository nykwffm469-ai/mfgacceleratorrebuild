import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "claims-desk";
const modules = [
  { id: "intake", label: "Intake" },
  { id: "adjusters", label: "Adjusters" },
  { id: "reserves", label: "Reserves" },
  { id: "payments", label: "Payments" },
  { id: "appeals", label: "Appeals" }
];

const columns = {
  intake: ["claimId", "policyNo", "lossDate", "category", "status"],
  adjusters: ["adjuster", "region", "openClaims", "availability", "status"],
  reserves: ["claimId", "initialReserve", "currentReserve", "lossCategory", "status"],
  payments: ["paymentId", "claimId", "payee", "amount", "status"],
  appeals: ["appealId", "claimId", "reviewer", "nextStep", "status"]
};

const palette = {
  "--legacy-bg": "#c8ced6",
  "--legacy-panel": "#e2e7ee",
  "--legacy-nav": "#b7c0cb",
  "--legacy-grid-head": "#bfc8d3",
  "--legacy-active": "#2f4e73",
  "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
};

const ENV = "CLAIMS-PROD-02";
const ADJUSTER = "CLAIMS\\m.walker";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - Claims Desk 2001

Claims Desk 2001 is a legacy insurance operations application used to manage claim intake, adjuster assignment, reserve tracking, payout coordination, and appeals processing.

The application centralizes claims-processing workflows into a desktop operations environment commonly used by insurance carriers, third-party administrators, and regional claims-processing centers.

The platform supports:
- first notice of loss (FNOL) intake
- claims assignment
- reserve management
- payout coordination
- payment approvals
- appeals handling
- adjuster workflow tracking
- audit reporting
- claims document management

The application was commonly used in:
- property insurance operations
- auto claims departments
- workers compensation processing
- healthcare claims environments
- regional insurance carriers
- enterprise shared-services teams

The platform integrates with:
- AS400 policy systems
- legacy policy-management databases
- payment processing systems
- document imaging repositories
- scanned-form archives
- Excel reporting workbooks
- shared-drive storage systems

Operational workflows are organized around queue-based processing including:
- intake queues
- adjuster assignment workflows
- reserve review queues
- payout processing
- appeals escalation
- supervisor approvals
- closed claim archives

The interface reflects enterprise desktop systems commonly developed using:
- VB6
- WinForms
- PowerBuilder
- early .NET Framework desktop applications

The application provides:
- claims dashboards
- adjuster work queues
- reserve-review tools
- payout processing workflows
- audit-history viewers
- document management panels
- nightly batch-processing indicators
- exception and escalation tracking

Typical users include:
- claims intake specialists
- insurance adjusters
- payment coordinators
- appeals reviewers
- supervisor teams
- operations administrators

RPA PROBLEM STATEMENT

Many insurance claims workflows involve repetitive manual interaction across multiple disconnected systems including policy databases, payment platforms, imaging repositories, and desktop applications.

Common activities include:
- opening claim-intake emails
- downloading scanned forms
- rekeying policy information
- routing claims to adjusters
- validating reserve thresholds
- updating payout statuses
- reopening failed payment batches
- generating claims packets
- organizing supporting documentation

These repetitive processes create opportunities for RPA solutions to:
- automate intake processing
- streamline claims routing
- reduce manual document handling
- accelerate adjuster assignment
- automate payout workflows
- improve queue visibility
- synchronize claim updates automatically
- support attended and unattended desktop automation`;

const systemMessages = [
  "Policy verification delayed.",
  "Claim locked by another adjuster.",
  "Reserve threshold exceeded.",
  "Payment export awaiting approval.",
  "Nightly claim sync in progress.",
  "Document imaging queue offline."
];

const backgroundServices = [
  "CLAIM_ROUTER_01",
  "POLICY_SYNC_ENGINE",
  "PAYMENT_BATCH_04",
  "OCR_IMPORT_WORKER",
  "APPEALS_MONITOR_02"
];

const retryLogs = [
  "[02:18:14] Connecting to policy server...",
  "[02:18:18] Retrying payout transaction...",
  "[02:18:21] Claim synchronization completed."
];

let activeModule = modules[0].id;
let queueOrdering = "oldest-first";
let statusInterval = null;
let messageInterval = null;

let randomSystemMessage = systemMessages[0];
let activityFeed = [
  `${new Date().toLocaleString()} FNOL intake queue refreshed`,
  `${new Date().toLocaleString()} Reserve approval monitor checkpoint`,
  `${new Date().toLocaleString()} Nightly adjudication monitor awaiting batch window`
];
let auditFeed = [
  makeAudit("Adjuster reassigned claim CLM-4432"),
  makeAudit("Supervisor override on reserve threshold for CLM-4431"),
  makeAudit("Payout approval updated for payment PAY-1108")
];

ensureSeed(namespace, () => ({
  intake: [
    { claimId: "CLM-4431", policyNo: "POL-22018", lossDate: "2001-04-09", category: "Property", status: "Open" },
    { claimId: "CLM-4432", policyNo: "POL-11910", lossDate: "2001-04-10", category: "Auto", status: "Queued" }
  ],
  adjusters: [
    { adjuster: "P. Mendez", region: "NW", openClaims: "19", availability: "Available", status: "Active" },
    { adjuster: "R. Lane", region: "SE", openClaims: "27", availability: "Limited", status: "Escalated" }
  ],
  reserves: [
    { claimId: "CLM-4431", initialReserve: "9000", currentReserve: "11200", lossCategory: "Property", status: "Threshold Review" },
    { claimId: "CLM-4438", initialReserve: "4500", currentReserve: "4500", lossCategory: "Auto", status: "Approved" }
  ],
  payments: [
    { paymentId: "PAY-1108", claimId: "CLM-4431", payee: "Beacon Glass", amount: "1400", status: "Settlement Hold" },
    { paymentId: "PAY-1112", claimId: "CLM-4432", payee: "Town Body Shop", amount: "2600", status: "ACH Pending" }
  ],
  appeals: [
    { appealId: "APL-77", claimId: "CLM-4211", reviewer: "Committee A", nextStep: "Attorney Review", status: "Open" },
    { appealId: "APL-81", claimId: "CLM-4303", reviewer: "Supervisor B", nextStep: "Outcome Review", status: "Escalated" }
  ]
}));

function installPageStyles() {
  if (document.getElementById("claims-desk-desktop-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "claims-desk-desktop-style";
  style.textContent = `
    .legacy-window { border: 2px solid #5f6d7a; box-shadow: 2px 2px 0 #8e99a5; }
    .legacy-titlebar { background: linear-gradient(to bottom,#dfe5ec 0%,#a8b4c1 100%); }
    .legacy-toolbar { border-bottom: 2px solid #6f7c89; }
    .legacy-btn { border: 1px solid #4d5a67; padding: 2px 7px; font-size: 10px; }
    .legacy-grid { border: 2px solid #6c7682; }
    .legacy-grid th, .legacy-grid td { border: 1px solid #74818e; padding: 3px 5px; }

    .cd-workbench { display:grid; grid-template-columns:250px 1fr; gap:8px; }
    .cd-left { display:grid; gap:6px; align-content:start; }
    .cd-mini { border:1px solid #687684; background:linear-gradient(to bottom,#e5ebf2,#c4ceda); padding:5px; font-size:10px; }
    .cd-mini h4 { margin:0 0 4px; font-size:10px; text-transform:uppercase; color:#2f4052; letter-spacing:0.2px; }
    .cd-mini ul { margin:0; padding-left:13px; display:grid; gap:1px; }
    .cd-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:4px; }
    .cd-kpi { border:1px solid #6d7988; background:#d6e0ea; padding:4px 6px; font-size:10px; }
    .cd-kpi strong { display:block; font-size:12px; color:#24384d; }
    .cd-split { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
    .cd-feed { max-height:160px; overflow:auto; border:1px solid #798594; background:#f7f9fc; padding:4px; font-size:10px; }
    .cd-row { border-bottom:1px dotted #9ca8b5; padding:2px 0; }
    .cd-row:last-child { border-bottom:0; }
    .cd-warning { border:1px solid #9c6f2b; background:#f2ddb4; color:#4d3713; font-size:10px; padding:3px 6px; }
    .cd-flag { display:inline-block; border:1px solid #8b2732; background:#f7c7d1; color:#5d1a22; font-size:9px; padding:0 4px; margin-left:4px; }
    .cd-urgent { color:#8a1f1f; font-weight:700; }

    .cd-entry-grid { display:grid; grid-template-columns:150px 1fr; gap:5px 8px; align-items:center; }
    .cd-fraud-banner { border:1px solid #8b2732; background:#f6ccd4; color:#651d27; padding:4px 6px; font-size:10px; margin-bottom:6px; }
    .cd-dup-banner { border:1px solid #9c6f2b; background:#f3e4bf; color:#533d1a; padding:4px 6px; font-size:10px; margin-top:6px; }

    .cd-modal { position:absolute; inset:0; z-index:45; background:rgba(182,191,201,0.56); display:flex; align-items:center; justify-content:center; }
    .cd-modal-card { width:min(860px, calc(100vw - 36px)); max-height:calc(100vh - 38px); overflow:auto; border:1px solid #677383; background:#e8edf3; box-shadow:2px 2px 0 #808b98; }
    .cd-modal-head { background:linear-gradient(to bottom,#e6edf5,#bcc8d6); border-bottom:1px solid #7e8995; padding:6px 8px; font-size:11px; font-weight:700; display:flex; justify-content:space-between; }
    .cd-modal-body { padding:8px; font-size:11px; }
    .cd-modal-foot { border-top:1px solid #7e8995; padding:6px 8px; display:flex; gap:4px; justify-content:flex-end; }
    .cd-progress { border:1px solid #738191; background:#d0d9e3; height:14px; margin:8px 0; }
    .cd-progress > span { display:block; height:100%; width:0; background:linear-gradient(to bottom,#95adca,#54799e); }

    .cd-toast-wrap { position:absolute; top:56px; right:12px; z-index:50; display:grid; gap:4px; }
    .cd-toast { border:1px solid #6f7b88; background:#edf3f8; color:#243345; padding:5px 7px; font-size:10px; min-width:220px; box-shadow:1px 1px 0 #8b98a6; }
    .cd-toast.warning { border-color:#a67b33; background:#f5e3bf; color:#4b3716; }

    .cd-audit { width:100%; border-collapse:collapse; font-size:10px; }
    .cd-audit th, .cd-audit td { border:1px solid #8b95a0; padding:3px 4px; }

    @media (max-width:1040px) {
      .cd-workbench { grid-template-columns:1fr; }
      .cd-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .cd-split { grid-template-columns:1fr; }
      .cd-entry-grid { grid-template-columns:1fr; }
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
    adjuster: ADJUSTER,
    action,
    ref: `CLM-${Math.floor(120000 + Math.random() * 99000)}`
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
  modal.className = "cd-modal";
  modal.innerHTML = `
    <div class="cd-modal-card">
      <div class="cd-modal-head"><span>${title}</span><button class="legacy-btn" data-close-x="1">X</button></div>
      <div class="cd-modal-body">${bodyHtml}</div>
      <div class="cd-modal-foot">${footerButtons.map((btn) => `<button class="legacy-btn" data-modal-btn="${btn.id}">${btn.label}</button>`).join("")}</div>
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

  let wrap = host.querySelector(".cd-toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "cd-toast-wrap";
    host.appendChild(wrap);
  }

  const node = document.createElement("div");
  node.className = `cd-toast${warning ? " warning" : ""}`;
  node.textContent = message;
  wrap.appendChild(node);
  window.setTimeout(() => node.remove(), 3600);
}

function updateStatusBar() {
  const node = document.querySelector(".legacy-statusbar");
  if (!node) {
    return;
  }
  const latency = 28 + Math.floor(Math.random() * 35);
  const aging = (currentSeed().intake || []).length;
  node.innerHTML = `ENV ${ENV} | USER ${ADJUSTER} | Policy Verify ${latency}ms | Queue Aging ${aging} | Payout Auth Tracker ACTIVE | Nightly Adjudication Monitor 01:00`;
}

function startStatusLoops() {
  if (!statusInterval) {
    updateStatusBar();
    statusInterval = window.setInterval(updateStatusBar, 1000);
  }
  if (!messageInterval) {
    messageInterval = window.setInterval(rotateMessage, 6000);
  }
}

function buildSidebarCards() {
  return `
    <div class="cd-left">
      <section class="cd-mini"><h4>Intake</h4><ul><li>New FNOL intake queue: 11</li><li>Scanned intake forms: 6</li><li>Call-center submissions: 4</li><li>Fax-import status: Delayed</li><li>Missing documentation alerts: 3</li></ul></section>
      <section class="cd-mini"><h4>Adjusters</h4><ul><li>Assignment queue active</li><li>Workload balancing monitor</li><li>Availability indicators online</li><li>Escalation flags: 2</li><li>Reassignment workflow pending</li></ul></section>
      <section class="cd-mini"><h4>Reserves</h4><ul><li>Reserve amount history</li><li>Approval review queue</li><li>Threshold alerts: 2</li><li>Loss-category calculations</li><li>Supervisor approval workflow</li></ul></section>
      <section class="cd-mini"><h4>Payments</h4><ul><li>Payout queue: 7</li><li>Check-print processing</li><li>ACH status tracker</li><li>Settlement hold queue: 3</li><li>Payment reversal workflow</li></ul></section>
      <section class="cd-mini"><h4>Appeals</h4><ul><li>Reconsideration queue</li><li>Disputed settlements</li><li>Supervisor escalations</li><li>Attorney-review status</li><li>Appeal outcome tracking</li></ul></section>
    </div>
  `;
}

function renderModuleSummary() {
  if (activeModule === "intake") {
    return panel(
      "Intake Dashboard",
      `
      <div class="cd-kpis">
        <div class="cd-kpi"><strong>11</strong>FNOL Queue</div>
        <div class="cd-kpi"><strong>6</strong>Scanned Forms</div>
        <div class="cd-kpi"><strong>4</strong>Call-Center Intake</div>
        <div class="cd-kpi"><strong>3</strong>Missing Docs</div>
      </div>
      <div class="cd-split" style="margin-top:6px;">
        <section class="cd-mini"><h4>Routing</h4><ul><li>Claim-routing dashboards active</li><li>Queue-driven intake triage</li><li>Policy verification indicator visible</li></ul></section>
        <section class="cd-mini"><h4>Operations</h4><ul><li>Overnight import job mapping</li><li>Fax-import reconciliation</li><li>Duplicate claim review enabled</li></ul></section>
      </div>
      `
    );
  }

  if (activeModule === "adjusters") {
    return panel(
      "Adjuster Assignment Queue",
      `<div class="cd-split"><section class="cd-mini"><h4>Workload Balance</h4><ul><li>Open-claim spread by region</li><li>Availability indicators</li><li>Escalation flags</li></ul></section><section class="cd-mini"><h4>Reassignment</h4><ul><li>Supervisor approvals required</li><li>Priority queue routing</li><li>Call-center urgency handoff</li></ul></section></div>`
    );
  }

  if (activeModule === "reserves") {
    return panel(
      "Reserve Review",
      `<div class="cd-split"><section class="cd-mini"><h4>Reserve Controls</h4><ul><li>Reserve amount history</li><li>Threshold alerts</li><li>Loss-category calculations</li></ul></section><section class="cd-mini"><h4>Approvals</h4><ul><li>Supervisor workflow</li><li>Reserve-change alerts</li><li>Payout authorization tracker</li></ul></section></div>`
    );
  }

  if (activeModule === "payments") {
    return panel(
      "Payments Processing",
      `<div class="cd-split"><section class="cd-mini"><h4>Payout Queue</h4><ul><li>Check-print processing</li><li>ACH status tracker</li><li>Settlement hold queue</li></ul></section><section class="cd-mini"><h4>Reversals</h4><ul><li>Payment reversal workflow</li><li>Failed payout retry monitor</li><li>Approval hold exceptions</li></ul></section></div>`
    );
  }

  return panel(
    "Appeals Processing",
    `<div class="cd-split"><section class="cd-mini"><h4>Appeal Queue</h4><ul><li>Claim reconsideration queue</li><li>Disputed settlements</li><li>Attorney-review status</li></ul></section><section class="cd-mini"><h4>Outcomes</h4><ul><li>Supervisor escalations</li><li>Appeal outcome tracking</li><li>Closed-case archival</li></ul></section></div>`
  );
}

async function handleExportExcel() {
  const modal = openModal({
    title: "Export Claims Aging Workbook",
    bodyHtml: `<div>Generating legacy claims export...</div><div class="cd-progress"><span data-progress></span></div><div class="cd-feed" data-log></div>`,
    footerButtons: [{ id: "close", label: "Close" }]
  });
  if (!modal) {
    return;
  }

  const bar = modal.querySelector("[data-progress]");
  const log = modal.querySelector("[data-log]");
  const steps = [
    "Collecting claim categories...",
    "Collecting payout statuses...",
    "Collecting reserve balances...",
    "Collecting adjuster workloads..."
  ];

  for (let i = 0; i < steps.length; i += 1) {
    log.innerHTML += `<div class="cd-row">${steps[i]}</div>`;
    bar.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
    await wait(340);
  }

  const workbook = [
    "Claims Aging Workbook",
    "Claim Categories",
    "Payout Statuses",
    "Reserve Balances",
    "Adjuster Workloads"
  ].join("\n");

  downloadFile(`claims-aging-${new Date().toISOString().slice(0, 10)}.xlsx`, workbook, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  pushAudit("Exported claims aging workbook");
  toast("Legacy export generation complete");
  if (Math.random() > 0.35) {
    toast("2 claims excluded due to active lock.", true);
  }

  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  render();
}

async function handlePrintPreview() {
  const modal = openModal({
    title: "Insurance Report Preview",
    bodyHtml: `
      <div class="cd-progress"><span data-print-progress></span></div>
      <div style="border:1px solid #8a94a1;min-height:180px;background:#fff;padding:10px;position:relative;">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:24px;color:rgba(130,37,37,0.16);font-weight:700;transform:rotate(-18deg);">INTERNAL CLAIMS REVIEW</div>
        <div><strong>Claims Summary</strong></div>
        <div>Policy details, adjuster comments, reserve history</div>
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
    toast("Insurance report queued to print spool");
    pushActivity("Print spool notification created for internal claims review");
    pushAudit("Opened report preview and sent to spool");
    closeModal(modal);
    render();
  });

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
}

function handleRetryFailed() {
  const modal = openModal({
    title: "Retry Failed Claim Sync",
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
        pushActivity("Policy host reconnect and claim sync completed");
        pushAudit("Executed failed claim-sync retry");
      }
    }, (index + 1) * 520);
  });

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
}

function handleGeneratePdf() {
  const modal = openModal({
    title: "Generate Full Claims Packet",
    bodyHtml: `<div>Assembling claims packet...</div><div class="cd-feed" data-log></div><div class="cd-progress"><span data-progress></span></div>`,
    footerButtons: [{ id: "close", label: "Close" }]
  });
  if (!modal) {
    return;
  }

  const steps = [
    "Merging intake forms...",
    "Merging adjuster reports...",
    "Merging scanned photos...",
    "Merging payout approvals...",
    "Merging appeal documentation...",
    "Archiving packet automatically..."
  ];
  const log = modal.querySelector("[data-log]");
  const bar = modal.querySelector("[data-progress]");

  (async () => {
    for (let i = 0; i < steps.length; i += 1) {
      log.innerHTML += `<div class="cd-row">${steps[i]}</div>`;
      bar.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
      await wait(300);
    }

    downloadFile(`claims-packet-${new Date().toISOString().slice(0, 10)}.pdf`, "Claims Packet", "application/pdf");
    pushAudit("Generated full claims packet PDF");
    toast("Claims packet archived automatically");
    render();
  })();

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
}

function renderAuditRows(filter = "") {
  const q = filter.trim().toLowerCase();
  return auditFeed
    .filter((row) => (q ? `${row.timestamp} ${row.adjuster} ${row.action} ${row.ref}`.toLowerCase().includes(q) : true))
    .map((row) => `<tr><td>${row.timestamp}</td><td>${row.adjuster}</td><td>${row.action}</td><td>${row.ref}</td></tr>`)
    .join("");
}

function handleViewAuditHistory() {
  const modal = openModal({
    title: "Claims Audit History",
    bodyHtml: `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;"><label for="audit-search">Search</label><input id="audit-search" class="legacy-field" style="max-width:280px;" placeholder="adjuster, action, reference"/></div>
      <table class="cd-audit"><thead><tr><th>Timestamp</th><th>Adjuster</th><th>Action</th><th>Reference</th></tr></thead><tbody data-audit-rows>${renderAuditRows()}</tbody></table>
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
  toast("Queue ordering updated");
  render();
}

function handleDeleteLast() {
  const latest = currentSeed();
  if (latest[activeModule].length > 0) {
    latest[activeModule].pop();
    saveSeed(namespace, latest);
    pushAudit(`Removed latest ${activeModule} queue record`);
    toast("Latest row removed", true);
  } else {
    toast("No queue rows available", true);
  }
  render();
}

function buildFreshSeed() {
  return {
    intake: [
      { claimId: "CLM-4512", policyNo: "POL-32201", lossDate: "2001-04-21", category: "Workers Comp", status: "Open" },
      { claimId: "CLM-4515", policyNo: "POL-28811", lossDate: "2001-04-22", category: "Property", status: "Queued" }
    ],
    adjusters: [
      { adjuster: "M. Walker", region: "NE", openClaims: "24", availability: "Limited", status: "Active" },
      { adjuster: "C. Singh", region: "SW", openClaims: "17", availability: "Available", status: "Active" }
    ],
    reserves: [
      { claimId: "CLM-4512", initialReserve: "12000", currentReserve: "15500", lossCategory: "Workers Comp", status: "Threshold Review" },
      { claimId: "CLM-4515", initialReserve: "6000", currentReserve: "6200", lossCategory: "Property", status: "Approved" }
    ],
    payments: [
      { paymentId: "PAY-1202", claimId: "CLM-4512", payee: "Metro Clinic", amount: "2100", status: "ACH Pending" },
      { paymentId: "PAY-1203", claimId: "CLM-4515", payee: "Rapid Repairs", amount: "1800", status: "Settlement Hold" }
    ],
    appeals: [
      { appealId: "APL-90", claimId: "CLM-4410", reviewer: "Supervisor C", nextStep: "Attorney Review", status: "Escalated" },
      { appealId: "APL-92", claimId: "CLM-4401", reviewer: "Committee D", nextStep: "Outcome Review", status: "Open" }
    ]
  };
}

function handleSeedReset() {
  saveSeed(namespace, buildFreshSeed());
  pushActivity("Claim queues regenerated by reset process");
  toast("Claims seed reset complete");
  render();
}

function decorateGridRows() {
  if (activeModule !== "reserves" && activeModule !== "payments") {
    return;
  }

  document.querySelectorAll(".legacy-grid tbody tr").forEach((row) => {
    const statusCell = row.children[4];
    if (!statusCell) {
      return;
    }
    const value = statusCell.textContent || "";
    if (/threshold|hold|escalated/i.test(value)) {
      statusCell.classList.add("cd-urgent");
      if (!statusCell.querySelector(".cd-flag")) {
        statusCell.innerHTML = `${statusCell.textContent}<span class="cd-flag">Review</span>`;
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

  const policyHints = ["POL-22018", "POL-11910", "POL-32201", "POL-28811", "POL-45110"];
  const formFields = `
    <div class="cd-fraud-banner">Fraud Alert Banner: No active fraud alerts for selected policy.</div>
    <div class="cd-entry-grid">
      <label>claimId</label><input class="legacy-field" name="claimId" />
      <label>policyNo</label><input class="legacy-field" name="policyNo" list="policy-hints" placeholder="Policy lookup autocomplete" />
      <label>lossDate</label><input class="legacy-field" name="lossDate" type="date" />
      <label>category</label><input class="legacy-field" name="category" />
      <label>status</label><input class="legacy-field" name="status" placeholder="Payout-threshold review" />
    </div>
    <datalist id="policy-hints">${policyHints.map((p) => `<option value="${p}"></option>`).join("")}</datalist>
    <div class="cd-dup-banner" data-dup-banner>Duplicate-claim detection: no match found.</div>
  `;

  const contentHtml =
    `<div class="cd-workbench">${buildSidebarCards()}<div>` +
    panel(
      "Claims Operations Workspace",
      `${renderModuleSummary()}
      <div class="cd-split">
        <section class="cd-mini"><h4>Queue Aging Counters</h4><ul><li>Intake aging: ${(data.intake || []).length}</li><li>Reserve reviews: ${(data.reserves || []).length}</li><li>Appeal queue: ${(data.appeals || []).length}</li></ul></section>
        <section class="cd-mini"><h4>Claim Assignment Feed</h4><div class="cd-feed">${activityFeed.map((line) => `<div class="cd-row">${line}</div>`).join("")}</div></section>
      </div>
      <div class="cd-warning" data-system-message>${randomSystemMessage}</div>
      <div class="cd-split" style="margin-top:6px;">
        <section class="cd-mini"><h4>Background Batch-Job Monitor</h4><ul>${backgroundServices.map((job) => `<li>${job} ONLINE</li>`).join("")}</ul></section>
        <section class="cd-mini"><h4>Operational Indicators</h4><ul><li>Policy verification indicator: Connected</li><li>Reserve-change alerts: 2</li><li>Nightly adjudication monitor: Pending window</li><li>Payout authorization tracker: Active</li></ul></section>
      </div>`
    ) +
    panel("Claims Grid", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}">${formFields}<div style="margin-top:6px;display:flex;gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`) +
    `</div></div>`;

  document.getElementById("app").innerHTML = appShell({
    title: "Claims Desk 2001",
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
    statusText: `ENV ${ENV} | USER ${ADJUSTER}`,
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

  const policyInput = document.querySelector('input[name="policyNo"]');
  const dupBanner = document.querySelector("[data-dup-banner]");
  policyInput?.addEventListener("input", () => {
    const value = (policyInput.value || "").trim();
    const existing = (currentSeed().intake || []).some((row) => row.policyNo === value);
    if (dupBanner) {
      dupBanner.textContent = existing
        ? "Duplicate-claim detection: existing claim found for selected policy."
        : "Duplicate-claim detection: no match found.";
    }
  });

  const form = document.getElementById("entry-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const moduleName = activeModule;
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
