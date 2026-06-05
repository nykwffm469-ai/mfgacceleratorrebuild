import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel, tabs } from "@legacy/shared-ui";

const namespace = "billing-collections";
const modules = [
  { id: "invoices", label: "Invoices" },
  { id: "dunning", label: "Dunning" },
  { id: "notes", label: "Collection Notes" },
  { id: "disputes", label: "Disputes" },
  { id: "promises", label: "Promise To Pay" }
];

const columns = {
  invoices: ["invoiceId", "customer", "amount", "dueDate", "status"],
  dunning: ["stepId", "customer", "stage", "daysOverdue", "attempts"],
  notes: ["noteId", "customer", "collector", "summary", "status"],
  disputes: ["disputeId", "invoiceId", "reason", "owner", "status"],
  promises: ["promiseId", "customer", "amount", "promiseDate", "status"]
};

const palette = {
  "--legacy-bg": "#cdd5de",
  "--legacy-panel": "#e8edf4",
  "--legacy-nav": "#bdc8d6",
  "--legacy-grid-head": "#c3d0df",
  "--legacy-active": "#365b84",
  "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
};

const ENV = "AR-COLLECT-PROD02";
const COLLECTOR = "COLLECTOR\\j.hart";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - Billing & Collections 2001

Billing & Collections 2001 is an enterprise Accounts Receivable operations application used to manage customer invoicing, overdue balances, collections workflows, disputes, and payment tracking activities.

The platform centralizes billing and collections processes into a desktop operations workspace used by finance and shared-services teams.

The application supports:
- invoice management
- customer aging review
- dunning workflows
- collection note tracking
- dispute management
- payment posting coordination
- promise-to-pay tracking
- audit and reporting operations

The application was commonly used in:
- manufacturing organizations
- utilities providers
- retail enterprises
- logistics providers
- healthcare billing operations
- enterprise shared-services centers

The platform integrates with enterprise systems such as:
- SAP Financials
- Oracle AR systems
- JD Edwards
- AS400 billing environments
- customer payment databases
- shared-drive reporting systems
- Excel reconciliation files

Operational workflows are organized around queue-driven processing including:
- overdue customer queues
- collector assignments
- dispute investigation queues
- payment exception handling
- ERP export processing
- statement generation

The interface reflects enterprise desktop applications commonly developed using:
- VB.NET WinForms
- PowerBuilder
- Java Swing
- Delphi desktop applications

The application provides:
- invoice aging dashboards
- collection queues
- escalation tracking
- dispute workflows
- customer statement generation
- collector activity notes
- ERP payment synchronization
- audit tracking and reporting

Typical users include:
- AR analysts
- collections specialists
- customer account representatives
- finance operations teams
- controllers
- dispute-resolution teams

RPA PROBLEM STATEMENT

Many collections and billing workflows within Accounts Receivable operations involve repetitive manual steps across disconnected systems and legacy interfaces.

Common activities include:
- opening customer accounts manually
- checking overdue balances
- generating dunning notices
- updating collector notes
- re-entering payment confirmations
- posting payment adjustments into ERP systems
- updating spreadsheets
- handling failed export batches
- reviewing promise-to-pay schedules

These repetitive workflows create opportunities for RPA automation to:
- automate customer statement generation
- streamline payment posting
- reduce repetitive account navigation
- automate overdue-notice workflows
- improve collections queue visibility
- update aging records automatically
- support attended and unattended desktop automation`;

const systemMessages = [
  "Customer account locked by another collector.",
  "ERP posting queue unavailable.",
  "Nightly statement generation in progress.",
  "Payment batch awaiting approval.",
  "Dunning engine delayed."
];

const retryLogs = [
  "[03:11:22] Reconnecting billing export queue...",
  "[03:11:25] Posting payment transactions...",
  "[03:11:29] ERP acknowledgement received..."
];

const backgroundJobs = ["DUNNING_ENGINE_01", "PAYMENT_POSTER_03", "ERP_SYNC_AR_02", "CREDIT_MEMO_BATCH_01"];

let activeModule = modules[0].id;
let queueOrdering = "oldest-first";
let statusInterval = null;
let messageInterval = null;

let randomSystemMessage = systemMessages[0];
let activityFeed = [
  `${new Date().toLocaleString()} Collector queue loaded for ${COLLECTOR}`,
  `${new Date().toLocaleString()} Nightly aging refresh completed`,
  `${new Date().toLocaleString()} ERP sync waiting on batch approval`
];
let auditFeed = [
  makeAudit("Supervisor escalation set for account ACC-4401"),
  makeAudit("Collector reassigned disputed invoice INV-7001"),
  makeAudit("Promise-to-pay follow-up generated for 4 accounts")
];

ensureSeed(namespace, () => ({
  invoices: [
    { invoiceId: "INV-7001", customer: "Delta Foods", amount: "9200", dueDate: "2001-06-12", status: "121+ Days" },
    { invoiceId: "INV-7002", customer: "Orion Supply", amount: "4100", dueDate: "2001-06-20", status: "61-90 Days" }
  ],
  dunning: [{ stepId: "DUN-12", customer: "Delta Foods", stage: "Second Notice", daysOverdue: "94", attempts: "4" }],
  notes: [{ noteId: "N-55", customer: "Delta Foods", collector: "J. Hart", summary: "Promise-to-pay request for Friday", status: "Follow-up" }],
  disputes: [{ disputeId: "DSP-08", invoiceId: "INV-6902", reason: "Qty mismatch", owner: "AR Ops", status: "RESEARCHING" }],
  promises: [{ promiseId: "PTP-91", customer: "Delta Foods", amount: "3000", promiseDate: "2001-06-18", status: "BROKEN" }]
}));

function installPageStyles() {
  if (document.getElementById("billing-collections-tune")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "billing-collections-tune";
  style.textContent = `
    .ar-workbench { display:grid; grid-template-columns:240px 1fr; gap:8px; }
    .ar-left-stack { display:grid; gap:6px; align-content:start; }
    .ar-mini { border:1px solid #7d8895; background:linear-gradient(to bottom,#edf2f7,#d0d9e4); padding:5px; font-size:10px; }
    .ar-mini h4 { margin:0 0 4px; font-size:10px; text-transform:uppercase; letter-spacing:0.2px; color:#2f3f52; }
    .ar-mini ul { margin:0; padding-left:13px; display:grid; gap:1px; }
    .ar-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:4px; }
    .ar-kpi { border:1px solid #7a8795; background:#dce5ef; padding:4px 6px; font-size:10px; }
    .ar-kpi strong { display:block; font-size:12px; color:#22374d; }
    .ar-split { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
    .ar-feed { max-height:150px; overflow:auto; border:1px solid #808a96; background:#f8fafc; padding:4px; font-size:10px; }
    .ar-row { border-bottom:1px dotted #9ca8b5; padding:2px 0; }
    .ar-row:last-child { border-bottom:0; }
    .ar-warning { border:1px solid #a67b33; background:#f4dfb5; color:#4d3713; font-size:10px; padding:3px 6px; }
    .ar-overdue { color:#861f1f; font-weight:700; }
    .ar-flag { display:inline-block; border:1px solid #8b2732; background:#f7c7d1; color:#5d1a22; font-size:9px; padding:0 4px; margin-left:4px; }
    .ar-modal { position:absolute; inset:0; z-index:45; background:rgba(182,191,201,0.56); display:flex; align-items:center; justify-content:center; }
    .ar-modal-card { width:min(840px, calc(100vw - 36px)); max-height:calc(100vh - 38px); overflow:auto; border:1px solid #677383; background:#e8edf3; box-shadow:2px 2px 0 #808b98; }
    .ar-modal-head { background:linear-gradient(to bottom,#e6edf5,#bcc8d6); border-bottom:1px solid #7e8995; padding:6px 8px; font-size:11px; font-weight:700; display:flex; justify-content:space-between; }
    .ar-modal-body { padding:8px; font-size:11px; }
    .ar-modal-foot { border-top:1px solid #7e8995; padding:6px 8px; display:flex; gap:4px; justify-content:flex-end; }
    .ar-progress { border:1px solid #738191; background:#d0d9e3; height:14px; margin:8px 0; }
    .ar-progress > span { display:block; height:100%; width:0; background:linear-gradient(to bottom,#95adca,#54799e); }
    .ar-toast-wrap { position:absolute; top:56px; right:12px; z-index:50; display:grid; gap:4px; }
    .ar-toast { border:1px solid #6f7b88; background:#edf3f8; color:#243345; padding:5px 7px; font-size:10px; min-width:220px; box-shadow:1px 1px 0 #8b98a6; }
    .ar-toast.warning { border-color:#a67b33; background:#f5e3bf; color:#4b3716; }
    .ar-audit { width:100%; border-collapse:collapse; font-size:10px; }
    .ar-audit th, .ar-audit td { border:1px solid #8b95a0; padding:3px 4px; }
    .ar-printer { border:1px solid #6f7b87; background:#e8edf3; padding:2px 6px; font-size:10px; }
    @media (max-width:1040px) {
      .ar-workbench { grid-template-columns:1fr; }
      .ar-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .ar-split { grid-template-columns:1fr; }
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
    collector: COLLECTOR,
    action,
    batch: `AR-${Math.floor(110000 + Math.random() * 99000)}`
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
  auditFeed = [makeAudit(action), ...auditFeed].slice(0, 18);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function openModal({ title, bodyHtml, footerButtons = [{ id: "close", label: "Close" }] }) {
  const host = document.querySelector(".legacy-window");
  if (!host) {
    return null;
  }

  const modal = document.createElement("div");
  modal.className = "ar-modal";
  modal.innerHTML = `
    <div class="ar-modal-card">
      <div class="ar-modal-head"><span>${title}</span><button class="legacy-btn" data-close-x="1">X</button></div>
      <div class="ar-modal-body">${bodyHtml}</div>
      <div class="ar-modal-foot">${footerButtons.map((btn) => `<button class="legacy-btn" data-modal-btn="${btn.id}">${btn.label}</button>`).join("")}</div>
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

  let wrap = host.querySelector(".ar-toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "ar-toast-wrap";
    host.appendChild(wrap);
  }

  const node = document.createElement("div");
  node.className = `ar-toast${warning ? " warning" : ""}`;
  node.textContent = message;
  wrap.appendChild(node);
  window.setTimeout(() => node.remove(), 3500);
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

function updateStatusBar() {
  const node = document.querySelector(".legacy-statusbar");
  if (!node) {
    return;
  }
  const latency = 32 + Math.floor(Math.random() * 42);
  const seed = currentSeed();
  const aging = (seed.invoices || []).length;
  node.innerHTML = `ENV ${ENV} | USER ${COLLECTOR} | Latency ${latency}ms | Queue ${queueOrdering} | Queue Aging ${aging} | Nightly Batch 02:00 ACTIVE`;
}

function startStatus() {
  if (!statusInterval) {
    updateStatusBar();
    statusInterval = window.setInterval(updateStatusBar, 1000);
  }
  if (!messageInterval) {
    messageInterval = window.setInterval(rotateMessage, 6000);
  }
}

function decorateInvoiceRows() {
  document.querySelectorAll(".legacy-grid tbody tr").forEach((row) => {
    const statusCell = row.children[4];
    if (!statusCell) {
      return;
    }
    const text = statusCell.textContent || "";
    if (/121\+|91-120|BROKEN|Overdue/i.test(text)) {
      statusCell.classList.add("ar-overdue");
      if (!statusCell.querySelector(".ar-flag")) {
        statusCell.innerHTML = `${statusCell.textContent}<span class="ar-flag">FLAG</span>`;
      }
    }
  });
}

function buildLeftSidebar() {
  return `
    <div class="ar-left-stack">
      <section class="ar-mini"><h4>Collector Work Queues</h4><ul><li>My accounts: 32</li><li>Supervisor escalations: 3</li><li>Callback queue: 7</li></ul></section>
      <section class="ar-mini"><h4>Overdue Accounts</h4><ul><li>121+ days: 9</li><li>91-120 days: 6</li><li>61-90 days: 8</li></ul></section>
      <section class="ar-mini"><h4>High-Risk Customers</h4><ul><li>Credit hold pending: 4</li><li>Repeat broken PTP: 5</li></ul></section>
      <section class="ar-mini"><h4>Payment Exceptions</h4><ul><li>Failed posting: 3</li><li>Unapplied cash: 2</li></ul></section>
      <section class="ar-mini"><h4>Dispute Escalations</h4><ul><li>OPEN: 4</li><li>PENDING CREDIT: 2</li><li>ESCALATED: 1</li></ul></section>
      <section class="ar-mini"><h4>Broken Promises To Pay</h4><ul><li>Today: 3</li><li>This week: 8</li></ul></section>
    </div>
  `;
}

function renderTopTabSection(data) {
  if (activeModule === "invoices") {
    return panel(
      "Invoices Tab",
      `
      <div class="ar-kpis">
        <div class="ar-kpi"><strong>23</strong>30-60 Days</div>
        <div class="ar-kpi"><strong>14</strong>61-90 Days</div>
        <div class="ar-kpi"><strong>8</strong>91-120 Days</div>
        <div class="ar-kpi"><strong>9</strong>121+ Days</div>
      </div>
      <div class="ar-split" style="margin-top:6px;">
        <section class="ar-mini"><h4>Aging Buckets</h4><ul><li>Current: 42</li><li>30-60: 23</li><li>61-90: 14</li><li>91+: 17</li></ul></section>
        <section class="ar-mini"><h4>Status and Flags</h4><ul><li>Payment status tracked</li><li>Collector assignment active</li><li>Dispute flags visible in grid</li></ul></section>
      </div>
      `
    );
  }

  if (activeModule === "dunning") {
    return panel(
      "Dunning Tab",
      `
      <div class="ar-split">
        <section class="ar-mini"><h4>Workflow Stages</h4><ul><li>First Notice</li><li>Second Notice</li><li>Final Demand</li><li>Escalated Account</li></ul></section>
        <section class="ar-mini"><h4>Automation Counters</h4><ul><li>Days overdue tracked</li><li>Outbound attempts logged</li><li>Queue-based reminder engine active</li></ul></section>
      </div>
      `
    );
  }

  if (activeModule === "notes") {
    return panel(
      "Collection Notes Tab",
      `
      <div class="ar-split">
        <section class="ar-mini"><h4>Collector Call Logs</h4><ul><li>Promise-to-pay notes</li><li>Payment follow-up reminders</li><li>Escalation comments</li></ul></section>
        <section class="ar-mini"><h4>Timestamps</h4><ul><li>Auto timestamp insert enabled</li><li>Last note sync: ${new Date().toLocaleTimeString()}</li></ul></section>
      </div>
      `
    );
  }

  if (activeModule === "disputes") {
    return panel(
      "Disputes Tab",
      `<div class="ar-mini"><h4>Dispute Status Workflow</h4><ul><li>OPEN</li><li>RESEARCHING</li><li>PENDING CREDIT</li><li>ESCALATED</li><li>RESOLVED</li></ul></div>`
    );
  }

  return panel(
    "Promise To Pay Tab",
    `
      <div class="ar-split">
        <section class="ar-mini"><h4>Customer Commitments</h4><ul><li>Scheduled payment dates</li><li>Collector follow-up queue</li><li>Broken promise alerts</li></ul></section>
        <section class="ar-mini"><h4>Monitoring</h4><ul><li>Broken promises: 5</li><li>Due this week: 12</li><li>Supervisor watchlist: 3</li></ul></section>
      </div>
    `
  );
}

function makeWorkbookText() {
  return [
    "Customer Aging Workbook",
    "Worksheet: Overdue Accounts",
    "Worksheet: Collector Metrics",
    "Worksheet: Dispute Summaries"
  ].join("\n");
}

async function handleExportExcel() {
  const modal = openModal({
    title: "Export Aging Workbook",
    bodyHtml: `<div>Preparing customer aging workbook...</div><div class="ar-progress"><span data-progress></span></div><div class="ar-feed" data-log></div>`,
    footerButtons: [{ id: "close", label: "Close" }]
  });
  if (!modal) {
    return;
  }

  const bar = modal.querySelector("[data-progress]");
  const log = modal.querySelector("[data-log]");
  const steps = ["Scanning overdue accounts...", "Compiling collector metrics...", "Summarizing disputes..."];
  for (let i = 0; i < steps.length; i += 1) {
    log.innerHTML += `<div class="ar-row">${steps[i]}</div>`;
    bar.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
    await wait(420);
  }

  downloadFile(`billing-aging-${new Date().toISOString().slice(0, 10)}.xlsx`, makeWorkbookText(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  pushAudit("Exported customer aging workbook");
  toast("Aging workbook export complete");
  if (Math.random() > 0.4) {
    toast("One account omitted due to active dispute lock.", true);
  }

  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  render();
}

async function handlePrintPreview() {
  const modal = openModal({
    title: "Crystal Aging Report Preview",
    bodyHtml: `
      <div class="ar-progress"><span data-print-progress></span></div>
      <div style="border:1px solid #8a94a1;min-height:180px;background:#fff;padding:10px;position:relative;">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;color:rgba(130,37,37,0.16);font-weight:700;transform:rotate(-18deg);">PRELIMINARY</div>
        <div><strong>Customer Aging Summary</strong></div>
        <div>Customer balances, aging totals, payment history snapshot</div>
        <div>Crystal Reports Runtime mock preview</div>
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
    await wait(150);
  }

  modal.querySelector('[data-modal-btn="print"]')?.addEventListener("click", () => {
    toast("Printer spool queued to FIN-AR-PRN02");
    pushActivity("Printer spool notification posted for aging report");
    pushAudit("Printed Crystal aging preview");
    closeModal(modal);
    render();
  });
  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
}

function handleRetryFailed() {
  const modal = openModal({
    title: "ERP Payment Retry Console",
    bodyHtml: `<div class="legacy-terminal" data-terminal></div>`,
    footerButtons: [{ id: "close", label: "Close" }]
  });
  if (!modal) {
    return;
  }

  const terminal = modal.querySelector("[data-terminal]");
  const failAt = Math.floor(Math.random() * 3);
  retryLogs.forEach((line, index) => {
    window.setTimeout(() => {
      const row = index === failAt ? `${line} WARN: retry required for account ACC-${4300 + index}` : line;
      terminal.innerHTML += `<div class="line">${row}</div>`;
      terminal.scrollTop = terminal.scrollHeight;
      if (index === retryLogs.length - 1) {
        pushActivity("ERP payment-post retry console completed");
        pushAudit("Executed retry failed ERP payment-post action");
      }
    }, (index + 1) * 520);
  });

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
}

function handleGeneratePdf() {
  const modal = openModal({
    title: "Generate Customer Statement Packet",
    bodyHtml: `<div>Assembling statement packet...</div><div class="ar-feed" data-log></div><div class="ar-progress"><span data-progress></span></div>`,
    footerButtons: [{ id: "close", label: "Close" }]
  });
  if (!modal) {
    return;
  }

  const steps = ["Attaching invoices...", "Attaching collection notes...", "Attaching dunning history...", "Attaching dispute summaries..."];
  const log = modal.querySelector("[data-log]");
  const bar = modal.querySelector("[data-progress]");

  (async () => {
    for (let i = 0; i < steps.length; i += 1) {
      log.innerHTML += `<div class="ar-row">${steps[i]}</div>`;
      bar.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
      await wait(360);
    }

    downloadFile(`customer-statement-packet-${new Date().toISOString().slice(0, 10)}.pdf`, "Customer Statement Packet", "application/pdf");
    pushAudit("Generated customer statement packet PDF");
    toast("Customer statement packet generated");
    render();
  })();

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
}

function renderAuditRows(filter = "") {
  const q = filter.trim().toLowerCase();
  return auditFeed
    .filter((row) => (q ? `${row.timestamp} ${row.collector} ${row.action} ${row.batch}`.toLowerCase().includes(q) : true))
    .map((row) => `<tr><td>${row.timestamp}</td><td>${row.collector}</td><td>${row.action}</td><td>${row.batch}</td></tr>`)
    .join("");
}

function handleViewAuditHistory() {
  const modal = openModal({
    title: "Collector Audit History",
    bodyHtml: `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;"><label for="audit-search">Search</label><input id="audit-search" class="legacy-field" style="max-width:280px;" placeholder="collector, action, batch"/></div>
      <table class="ar-audit"><thead><tr><th>Timestamp</th><th>Collector</th><th>Action</th><th>Batch</th></tr></thead><tbody data-audit-rows>${renderAuditRows()}</tbody></table>
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
  toast("Queue ordering toggled");
  render();
}

function handleDeleteLast() {
  const latest = currentSeed();
  if (latest[activeModule].length > 0) {
    latest[activeModule].pop();
    saveSeed(namespace, latest);
    pushAudit(`Removed last ${activeModule} queue item`);
    toast("Latest queue row removed", true);
  } else {
    toast("No rows available for delete", true);
  }
  render();
}

function freshSeed() {
  return {
    invoices: [
      { invoiceId: "INV-8101", customer: "Nova Utility", amount: "11800", dueDate: "2001-07-01", status: "91-120 Days" },
      { invoiceId: "INV-8102", customer: "Metro Retail", amount: "5400", dueDate: "2001-07-06", status: "61-90 Days" }
    ],
    dunning: [{ stepId: "DUN-31", customer: "Nova Utility", stage: "Final Demand", daysOverdue: "108", attempts: "5" }],
    notes: [{ noteId: "N-71", customer: "Metro Retail", collector: "J. Hart", summary: "Customer requested 10-day extension", status: "Open" }],
    disputes: [{ disputeId: "DSP-17", invoiceId: "INV-8044", reason: "Rate mismatch", owner: "AR Ops", status: "OPEN" }],
    promises: [{ promiseId: "PTP-112", customer: "Nova Utility", amount: "5000", promiseDate: "2001-07-10", status: "SCHEDULED" }]
  };
}

function handleSeedReset() {
  saveSeed(namespace, freshSeed());
  pushActivity("Seed data regenerated for collector queues");
  toast("Collector queues rebuilt and reset");
  render();
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

  const workbenchTabs = tabs(modules.map((m) => ({ id: m.id, label: m.label })), activeModule);
  const contentHtml =
    `<div class="ar-workbench">${buildLeftSidebar()}<div>` +
    panel(
      "Accounts Receivable Operations",
      `${workbenchTabs}
      ${renderTopTabSection(data)}
      <div class="ar-split">
        <section class="ar-mini"><h4>Queue Aging Counters</h4><ul><li>Overdue queue: ${(data.invoices || []).length}</li><li>Dunning queue: ${(data.dunning || []).length}</li><li>Broken PTP queue: ${(data.promises || []).filter((x) => /BROKEN/i.test(x.status)).length}</li></ul></section>
        <section class="ar-mini"><h4>Payment Processing Monitor</h4><ul><li>PAYMENT_POSTER_03 ONLINE</li><li>Current latency: ${35 + Math.floor(Math.random() * 30)}ms</li><li>Supervisor escalation alerts: 2</li></ul><div class="ar-printer">Printer spool: AR-AGING-RPT waiting</div></section>
      </div>
      <div class="ar-warning" data-system-message>${randomSystemMessage}</div>
      <div class="ar-split" style="margin-top:6px;">
        <section class="ar-mini"><h4>Nightly Batch Indicators</h4><ul>${backgroundJobs.map((job) => `<li>${job} ACTIVE</li>`).join("")}</ul></section>
        <section class="ar-mini"><h4>Live Activity Console</h4><div class="ar-feed">${activityFeed.map((line) => `<div class="ar-row">${line}</div>`).join("")}</div></section>
      </div>`
    ) +
    panel("Collector Grid", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:6px;display:flex;gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`) +
    `</div></div>`;

  document.getElementById("app").innerHTML = appShell({
    title: "Billing & Collections 2001",
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
    statusText: `ENV ${ENV} | USER ${COLLECTOR}`,
    contentHtml
  });

  startStatus();
  updateStatusBar();
  decorateInvoiceRows();

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

    if (moduleName === "notes") {
      row.summary = `${row.summary || "Collector note"} (${new Date().toLocaleTimeString()})`;
    }

    const latest = currentSeed();
    const index = latest[moduleName].findIndex((item) => item[keyField] === row[keyField]);
    if (index >= 0) {
      latest[moduleName][index] = row;
    } else {
      latest[moduleName].push(row);
    }
    saveSeed(namespace, latest);
    pushActivity(`Collector updated ${moduleName} queue record ${row[keyField]}`);
    pushAudit(`Updated ${moduleName} record ${row[keyField]}`);
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
