import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel, tabs } from "@legacy/shared-ui";

const namespace = "ap-statement-reconciliation";
const modules = [
  {
    "id": "statements",
    "label": "Statements"
  },
  {
    "id": "openitems",
    "label": "Open Items"
  },
  {
    "id": "matching",
    "label": "Matching"
  },
  {
    "id": "discrepancies",
    "label": "Discrepancies"
  },
  {
    "id": "closures",
    "label": "Closures"
  }
];
const columns = {
  "statements": [
    "statementId",
    "vendor",
    "period",
    "balance",
    "status"
  ],
  "openitems": [
    "itemId",
    "statementId",
    "invoiceNo",
    "amount",
    "status"
  ],
  "matching": [
    "matchId",
    "itemId",
    "erpDoc",
    "analyst",
    "status"
  ],
  "discrepancies": [
    "caseId",
    "vendor",
    "reason",
    "owner",
    "status"
  ],
  "closures": [
    "closureId",
    "caseId",
    "resolvedOn",
    "resolver",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#ced3d8",
  "--legacy-panel": "#e7ebf0",
  "--legacy-nav": "#b8c0ca",
  "--legacy-grid-head": "#c2ccd8",
  "--legacy-active": "#375778",
  "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
};

let activeModule = modules[0].id;
let queueOrdering = "oldest-first";
let activeWorkbenchTab = "queue";
let statusInterval = null;
let messageInterval = null;
let activeContextMenu = null;

const ENV_LABEL = "PROD-FIN-APP03";
const LOGGED_IN_USER = "FINANCE\\ap.recon01";
const WORKSTATION = "WS-FIN-044";
const DB_CONN = "ODBC_AP_ERP_PRD";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - AP Statement Reconciliation 2008

AP Statement Reconciliation 2008 is a finance operations application used by enterprise Accounts Payable teams to reconcile vendor statements against open ERP transactions.

The platform centralizes reconciliation workflows including:
- vendor statement ingestion
- invoice matching
- discrepancy management
- supervisor approvals
- ERP export coordination
- audit tracking
- reconciliation closures

The application was commonly deployed between 2008-2015 within:
- manufacturing organizations
- retail shared-services centers
- logistics providers
- healthcare finance teams
- enterprise accounting departments

The system integrates with multiple legacy platforms including:
- SAP ECC
- Oracle Financials
- JD Edwards
- Lawson
- AS400 terminal systems
- Excel-based reconciliation processes
- network file-share repositories

Operational workflows are organized around queue-based processing stages such as:
- imported statements
- matching review
- discrepancy resolution
- supervisor approval
- ERP export
- archival closure

The user experience reflects enterprise desktop applications commonly built using:
- VB.NET WinForms
- Java Swing
- PowerBuilder
- early .NET Framework desktop clients

The application includes:
- reconciliation dashboards
- queue monitoring
- ERP synchronization tracking
- audit history viewers
- retry processing tools
- report generation
- background batch processing indicators

Typical users include:
- AP analysts
- finance operations specialists
- controllers
- audit reviewers
- shared-services reconciliation teams

RPA PROBLEM STATEMENT

Many reconciliation tasks within finance operations still rely on repetitive manual interaction across disconnected systems and legacy interfaces.

Common operational activities include:
- downloading emailed statements
- importing reconciliation files
- entering ERP transaction references
- validating failed exports
- navigating terminal-based applications
- generating reconciliation reports
- updating spreadsheets
- routing records for supervisor approval

These repetitive workflows create opportunities for RPA solutions to:
- automate data entry
- streamline reconciliation processing
- reduce manual ERP interaction
- improve queue management
- automate audit-document generation
- accelerate discrepancy resolution
- support attended and unattended automation scenarios`;

const systemMessages = [
  "Unable to acquire record lock.",
  "ERP acknowledgment timeout.",
  "Queue processor offline.",
  "ODBC driver not responding.",
  "Batch rollback initiated."
];

const services = ["OCR_WORKER_02", "ERP_EXPORT_04", "MATCH_ENGINE_01", "AUDIT_ARCHIVER"];
const retryLogSeed = [
  "[02:14:33] Opening terminal session...",
  "[02:14:37] Reprocessing failed batch...",
  "[02:14:41] ERP acknowledgement received..."
];

let randomSystemMessage = systemMessages[0];
let auditFeed = [
  makeAudit("Queue initialized from overnight statement ingestion", "ERP-AP-720001"),
  makeAudit("OCR confidence below SLA for 2 statement pages", "ERP-AP-720003"),
  makeAudit("Supervisor override approved for payment hold", "ERP-AP-720006")
];
let jobFeed = [
  "OCR_WORKER_02 heartbeat OK",
  "MATCH_ENGINE_01 confidence model reload complete",
  "ERP_EXPORT_04 waiting for acknowledgement",
  "AUDIT_ARCHIVER sweep window starts 02:30"
];

ensureSeed(namespace, () => ({
  "statements": [
    {
      "statementId": "STMT-88",
      "vendor": "Summit Travel",
      "period": "2008-08",
      "balance": "18,770",
      "status": "Loaded"
    }
  ],
  "openitems": [
    {
      "itemId": "OI-421",
      "statementId": "STMT-88",
      "invoiceNo": "INV-77102",
      "amount": "1,220",
      "status": "Unmatched"
    }
  ],
  "matching": [
    {
      "matchId": "MT-18",
      "itemId": "OI-421",
      "erpDoc": "51000881",
      "analyst": "AP Recon",
      "status": "Open"
    }
  ],
  "discrepancies": [
    {
      "caseId": "DS-12",
      "vendor": "Summit Travel",
      "reason": "Price variance",
      "owner": "AP",
      "status": "Investigate"
    }
  ],
  "closures": [
    {
      "closureId": "CL-77",
      "caseId": "DS-09",
      "resolvedOn": "2008-08-21",
      "resolver": "AP Lead",
      "status": "Closed"
    }
  ]
}));

function makeAudit(action, batchRef = "ERP-AP-720000") {
  const now = new Date();
  return {
    timestamp: now.toLocaleString(),
    user: LOGGED_IN_USER,
    workstation: WORKSTATION,
    action,
    exportRef: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
    batchRef
  };
}

function rotateMessage() {
  randomSystemMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
  const node = document.querySelector("[data-random-system-message]");
  if (node) {
    node.textContent = randomSystemMessage;
  }
}

function installPageStyles() {
  if (document.getElementById("ap-recon-legacy-tune")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "ap-recon-legacy-tune";
  style.textContent = `
    .ap-recon-workbench {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 8px;
    }

    .ap-recon-left-stack {
      display: grid;
      gap: 6px;
      align-content: start;
    }

    .ap-recon-mini-card {
      border: 1px solid #7f8995;
      background: linear-gradient(to bottom, #eef2f6 0%, #d3dbe4 100%);
      padding: 5px;
      font-size: 10px;
    }

    .ap-recon-mini-card h4 {
      margin: 0 0 4px;
      font-size: 10px;
      letter-spacing: 0.2px;
      text-transform: uppercase;
      color: #2f3d4f;
    }

    .ap-recon-mini-card ul {
      margin: 0;
      padding-left: 13px;
      display: grid;
      gap: 1px;
    }

    .ap-recon-density-grid {
      display: grid;
      gap: 8px;
    }

    .ap-recon-kpis {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 4px;
    }

    .ap-recon-kpi {
      border: 1px solid #7d8793;
      background: #d9e2ec;
      padding: 4px 6px;
      font-size: 10px;
    }

    .ap-recon-kpi strong {
      display: block;
      font-size: 12px;
      color: #24364a;
    }

    .ap-recon-queue-panels {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }

    .ap-recon-feed {
      max-height: 150px;
      overflow: auto;
      border: 1px solid #808a96;
      background: #f8fafc;
      padding: 4px;
      font-size: 10px;
    }

    .ap-recon-feed-row {
      border-bottom: 1px dotted #9da8b4;
      padding: 2px 0;
    }

    .ap-recon-feed-row:last-child {
      border-bottom: 0;
    }

    .ap-recon-status-dot {
      display: inline-block;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      margin-right: 4px;
      background: #2e7f2e;
      border: 1px solid #1f581f;
      vertical-align: middle;
    }

    .ap-recon-warning {
      border: 1px solid #a67b33;
      background: #f4dfb5;
      color: #4d3713;
      font-size: 10px;
      padding: 3px 6px;
    }

    .ap-recon-crystal-viewer {
      border: 1px solid #78818e;
      background: #f2f5f9;
      padding: 4px;
      font-size: 10px;
    }

    .ap-recon-crystal-toolbar {
      display: flex;
      gap: 4px;
      margin-bottom: 4px;
    }

    .ap-recon-report-canvas {
      border: 1px solid #8a94a1;
      min-height: 120px;
      background: repeating-linear-gradient(
        to bottom,
        #ffffff,
        #ffffff 21px,
        #f1f4f8 21px,
        #f1f4f8 22px
      );
      position: relative;
      padding: 8px;
    }

    .ap-recon-watermark {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: rgba(130, 37, 37, 0.16);
      font-weight: 700;
      letter-spacing: 2px;
      transform: rotate(-18deg);
      pointer-events: none;
    }

    .ap-recon-modal {
      position: absolute;
      inset: 0;
      z-index: 40;
      background: rgba(182, 191, 201, 0.56);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .ap-recon-modal-card {
      width: min(860px, calc(100vw - 38px));
      max-height: calc(100vh - 40px);
      overflow: auto;
      border: 1px solid #677383;
      background: #e8edf3;
      box-shadow: 2px 2px 0 #808b98;
    }

    .ap-recon-modal-head {
      background: linear-gradient(to bottom, #e6edf5 0%, #bcc8d6 100%);
      border-bottom: 1px solid #7e8995;
      padding: 6px 8px;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ap-recon-modal-body {
      padding: 8px;
      font-size: 11px;
    }

    .ap-recon-modal-foot {
      border-top: 1px solid #7e8995;
      padding: 6px 8px;
      display: flex;
      justify-content: flex-end;
      gap: 4px;
    }

    .ap-recon-progress {
      border: 1px solid #738191;
      background: #d0d9e3;
      height: 14px;
      margin: 8px 0;
      position: relative;
    }

    .ap-recon-progress > span {
      display: block;
      height: 100%;
      background: linear-gradient(to bottom, #96b0ca 0%, #557b9e 100%);
      width: 0;
    }

    .ap-recon-toast-wrap {
      position: absolute;
      top: 56px;
      right: 12px;
      z-index: 50;
      display: grid;
      gap: 4px;
    }

    .ap-recon-toast {
      border: 1px solid #6f7b88;
      background: #edf3f8;
      color: #243345;
      padding: 5px 7px;
      font-size: 10px;
      min-width: 220px;
      box-shadow: 1px 1px 0 #8b98a6;
    }

    .ap-recon-toast.warning {
      border-color: #a67b33;
      background: #f5e3bf;
      color: #4b3716;
    }

    .ap-recon-audit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }

    .ap-recon-audit-table th,
    .ap-recon-audit-table td {
      border: 1px solid #8b95a0;
      padding: 3px 4px;
    }

    .ap-recon-context-menu {
      position: fixed;
      z-index: 80;
      border: 1px solid #5f6c7b;
      background: #e5ebf2;
      box-shadow: 2px 2px 0 #7e8997;
      min-width: 190px;
    }

    .ap-recon-context-menu button {
      display: block;
      width: 100%;
      border: 0;
      border-bottom: 1px solid #98a3b0;
      background: transparent;
      text-align: left;
      padding: 5px 7px;
      font-size: 10px;
      cursor: pointer;
    }

    .ap-recon-context-menu button:last-child {
      border-bottom: 0;
    }

    .ap-recon-context-menu button:hover {
      background: #cfdae7;
    }

    .ap-recon-erp-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 5px;
      font-size: 10px;
    }

    .ap-recon-erp-cell {
      border: 1px solid #7f8995;
      background: #f2f6fb;
      padding: 4px;
    }

    @media (max-width: 1060px) {
      .ap-recon-workbench {
        grid-template-columns: 1fr;
      }

      .ap-recon-kpis {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .ap-recon-queue-panels {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function pushAudit(action, batchRef = `ERP-AP-${Math.floor(720100 + Math.random() * 300)}`) {
  auditFeed = [makeAudit(action, batchRef), ...auditFeed].slice(0, 18);
}

function pushJob(message) {
  jobFeed = [`${new Date().toLocaleTimeString()} ${message}`, ...jobFeed].slice(0, 14);
}

function toast(message, level = "info") {
  const host = document.querySelector(".legacy-window");
  if (!host) {
    return;
  }

  let wrap = host.querySelector(".ap-recon-toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "ap-recon-toast-wrap";
    host.appendChild(wrap);
  }

  const node = document.createElement("div");
  node.className = `ap-recon-toast${level === "warning" ? " warning" : ""}`;
  node.textContent = message;
  wrap.appendChild(node);

  window.setTimeout(() => node.remove(), 3800);
}

function closeContextMenu() {
  if (activeContextMenu) {
    activeContextMenu.remove();
    activeContextMenu = null;
  }
}

function openContextMenu(x, y, actions) {
  closeContextMenu();
  const menu = document.createElement("div");
  menu.className = "ap-recon-context-menu";
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      action.run();
      closeContextMenu();
    });
    menu.appendChild(button);
  });

  document.body.appendChild(menu);
  activeContextMenu = menu;
}

function openModal({ title, bodyHtml, footerButtons = [{ id: "close", label: "Close" }] }) {
  const host = document.querySelector(".legacy-window");
  if (!host) {
    return null;
  }

  const modal = document.createElement("div");
  modal.className = "ap-recon-modal";
  modal.innerHTML = `
    <div class="ap-recon-modal-card">
      <div class="ap-recon-modal-head">
        <span>${title}</span>
        <button class="legacy-btn" type="button" data-modal-close="1">X</button>
      </div>
      <div class="ap-recon-modal-body">${bodyHtml}</div>
      <div class="ap-recon-modal-foot">
        ${footerButtons.map((btn) => `<button class="legacy-btn" type="button" data-modal-btn="${btn.id}">${btn.label}</button>`).join("")}
      </div>
    </div>
  `;

  host.appendChild(modal);
  return modal;
}

function closeModal(modal) {
  modal?.remove();
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function currentSeed() {
  return loadSeed(namespace, () => ({}));
}

function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime });
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

  const timestamp = new Date().toLocaleString();
  const queueSize = currentSeed()[activeModule]?.length || 0;
  node.innerHTML = `<span class="ap-recon-status-dot"></span>ENV ${ENV_LABEL} | USER ${LOGGED_IN_USER} | WS ${WORKSTATION} | DB ${DB_CONN} CONNECTED | MODULE ${activeModule.toUpperCase()} | QUEUE ${queueOrdering} (${queueSize}) | ${timestamp}`;
}

function startLiveStatus() {
  if (statusInterval) {
    return;
  }

  updateStatusBar();
  statusInterval = window.setInterval(updateStatusBar, 1000);
}

function startMessageRotation() {
  if (messageInterval) {
    return;
  }

  messageInterval = window.setInterval(rotateMessage, 6500);
}

function buildFreshSeed() {
  const vendors = ["Summit Travel", "Northline Freight", "Pioneer Parts", "Granite Energy", "Metro Office Goods"];
  const statements = vendors.map((vendor, index) => ({
    statementId: `STMT-${90 + index}`,
    vendor,
    period: "2008-09",
    balance: String(4200 + Math.floor(Math.random() * 29000)),
    status: index % 2 === 0 ? "Loaded" : "Pending"
  }));

  const openitems = statements.map((stmt, index) => ({
    itemId: `OI-${500 + index}`,
    statementId: stmt.statementId,
    invoiceNo: `INV-${77000 + index * 11}`,
    amount: String(300 + Math.floor(Math.random() * 2400)),
    status: index % 3 === 0 ? "Payment Hold" : "Unmatched"
  }));

  const matching = openitems.map((item, index) => ({
    matchId: `MT-${30 + index}`,
    itemId: item.itemId,
    erpDoc: `51000${820 + index}`,
    analyst: index % 2 === 0 ? "AP Recon" : "Fin Ops",
    status: index % 2 === 0 ? "Open" : "Suggested"
  }));

  const discrepancyReasons = ["Tax variance", "Missing PO", "Duplicate invoice", "Currency mismatch"];
  const discrepancies = statements.map((stmt, index) => ({
    caseId: `DS-${20 + index}`,
    vendor: stmt.vendor,
    reason: discrepancyReasons[index % discrepancyReasons.length],
    owner: index % 2 === 0 ? "AP" : "Procurement",
    status: index % 2 === 0 ? "Investigate" : "Escalated"
  }));

  const closures = statements.slice(0, 3).map((stmt, index) => ({
    closureId: `CL-${90 + index}`,
    caseId: discrepancies[index].caseId,
    resolvedOn: `2008-09-${String(10 + index).padStart(2, "0")}`,
    resolver: "AP Lead",
    status: "Closed"
  }));

  return { statements, openitems, matching, discrepancies, closures };
}

async function handleExportExcel() {
  const modal = openModal({
    title: "Workbook Export",
    bodyHtml: `
      <div>Preparing workbook export...</div>
      <div class="ap-recon-progress"><span data-export-progress></span></div>
      <div class="ap-recon-feed" data-export-log></div>
    `,
    footerButtons: [{ id: "cancel", label: "Cancel" }]
  });

  if (!modal) {
    return;
  }

  let canceled = false;
  modal.querySelector('[data-modal-btn="cancel"]')?.addEventListener("click", () => {
    canceled = true;
    closeModal(modal);
    toast("Workbook export canceled by operator", "warning");
  });
  modal.querySelector("[data-modal-close]")?.addEventListener("click", () => {
    canceled = true;
    closeModal(modal);
  });

  const progress = modal.querySelector("[data-export-progress]");
  const log = modal.querySelector("[data-export-log]");
  const worksheets = ["Open Items", "Discrepancies", "ERP Failures", "Audit Notes"];

  for (let i = 0; i < worksheets.length; i += 1) {
    if (canceled) {
      return;
    }
    const pct = Math.round(((i + 1) / worksheets.length) * 100);
    progress.style.width = `${pct}%`;
    log.innerHTML += `<div class="ap-recon-feed-row">Adding worksheet: ${worksheets[i]}</div>`;
    await wait(500 + Math.floor(Math.random() * 300));
  }

  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
  const workbook = [
    `Workbook AP Statement Reconciliation ${stamp}`,
    "Worksheet Open Items",
    "Worksheet Discrepancies",
    "Worksheet ERP Failures",
    "Worksheet Audit Notes"
  ].join("\n");

  downloadFile(`ap-reconciliation-${stamp}.xlsx`, workbook, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  closeModal(modal);
  pushAudit("Generated reconciliation workbook export", `ERP-AP-${Math.floor(730000 + Math.random() * 7000)}`);
  toast("Workbook export complete", "info");
  if (Math.random() > 0.35) {
    toast("2 unresolved exception rows excluded.", "warning");
  }
  render();
}

async function handlePrintPreview() {
  const modal = openModal({
    title: "Print Preview",
    bodyHtml: `
      <div>Rendering report preview...</div>
      <div class="ap-recon-progress"><span data-print-progress></span></div>
      <div class="ap-recon-crystal-viewer" data-print-viewer style="display:none;">
        <div class="ap-recon-crystal-toolbar">
          <button class="legacy-btn" type="button">First</button>
          <button class="legacy-btn" type="button">Prev</button>
          <span>Page 1 of 7</span>
          <button class="legacy-btn" type="button">Next</button>
          <button class="legacy-btn" type="button">Last</button>
          <label>Zoom</label>
          <select class="legacy-field legacy-small"><option>75%</option><option selected>100%</option><option>125%</option><option>150%</option></select>
        </div>
        <div class="ap-recon-report-canvas">
          <div style="position:absolute;left:40px;top:0;bottom:0;width:1px;background:#9ba7b5;"></div>
          <div style="position:absolute;right:40px;top:0;bottom:0;width:1px;background:#9ba7b5;"></div>
          <div class="ap-recon-watermark">PRELIMINARY</div>
          <div><strong>AP Statement Reconciliation Report</strong></div>
          <div>Queue Ordering: ${queueOrdering}</div>
          <div>Rendered: ${new Date().toLocaleString()}</div>
          <div>Margin guides enabled | Crystal Reports Runtime 10.2 mock</div>
        </div>
      </div>
    `,
    footerButtons: [{ id: "close", label: "Close" }, { id: "print", label: "Print" }]
  });

  if (!modal) {
    return;
  }

  const bar = modal.querySelector("[data-print-progress]");
  const viewer = modal.querySelector("[data-print-viewer]");
  for (let pct = 0; pct <= 100; pct += 20) {
    bar.style.width = `${pct}%`;
    await wait(180);
  }
  viewer.style.display = "block";
  pushJob("Crystal Reports preview rendered in operator session");

  modal.querySelector('[data-modal-btn="print"]')?.addEventListener("click", () => {
    pushAudit("Printed preliminary reconciliation report");
    toast("Print job queued to FIN-PRN-02", "info");
    closeModal(modal);
    render();
  });
  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-modal-close]")?.addEventListener("click", () => closeModal(modal));
}

async function handleRetryFailed() {
  const modal = openModal({
    title: "Retry Processing Console",
    bodyHtml: `
      <div>Reconnecting ERP session and replaying failed queue items.</div>
      <div class="legacy-terminal" data-retry-terminal></div>
    `,
    footerButtons: [{ id: "close", label: "Close" }]
  });

  if (!modal) {
    return;
  }

  const terminal = modal.querySelector("[data-retry-terminal]");
  const failIndex = Math.floor(Math.random() * 4) + 2;
  const extra = [
    "[02:14:45] Validating response envelope...",
    "[02:14:49] Posting reconciliation delta...",
    "[02:14:53] Updating ERP batch header...",
    "[02:14:57] Closing terminal session..."
  ];

  [...retryLogSeed, ...extra].forEach((line, index) => {
    window.setTimeout(() => {
      const finalLine = index === failIndex ? `${line} FAILED ITEM DS-${Math.floor(20 + Math.random() * 15)}` : line;
      terminal.innerHTML += `<div class="line">${finalLine}</div>`;
      terminal.scrollTop = terminal.scrollHeight;

      if (index === failIndex) {
        pushAudit("Retry processing encountered one failed item");
        toast("1 item failed reprocessing and remains in exception queue", "warning");
      }

      if (index === retryLogSeed.length + extra.length - 1) {
        pushJob("Retry console completed with partial success");
        render();
      }
    }, 500 * (index + 1));
  });

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-modal-close]")?.addEventListener("click", () => closeModal(modal));
}

function handleToggleFirst() {
  const latest = currentSeed();
  queueOrdering = queueOrdering === "oldest-first" ? "newest-first" : "oldest-first";
  latest[activeModule].reverse();
  saveSeed(namespace, latest);
  pushAudit(`Queue ordering switched to ${queueOrdering}`);
  toast("Queue priority ordering updated.", "info");
  render();
}

function handleDeleteLast() {
  const latest = currentSeed();
  const last = latest[activeModule][latest[activeModule].length - 1];

  const modal = openModal({
    title: "Confirm Delete",
    bodyHtml: `
      <div>Delete latest reconciliation entry from ${activeModule.toUpperCase()}?</div>
      <div class="ap-recon-warning" style="margin-top:6px;">Record: ${last ? Object.values(last)[0] : "None"}</div>
    `,
    footerButtons: [
      { id: "cancel", label: "Cancel" },
      { id: "confirm", label: "Delete Entry" }
    ]
  });

  if (!modal) {
    return;
  }

  modal.querySelector('[data-modal-btn="cancel"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-modal-close]")?.addEventListener("click", () => closeModal(modal));
  modal.querySelector('[data-modal-btn="confirm"]')?.addEventListener("click", () => {
    if (latest[activeModule].length > 0) {
      latest[activeModule].pop();
      saveSeed(namespace, latest);
      pushAudit(`Deleted latest ${activeModule} entry via operator queue tools`);
      if (Math.random() > 0.45) {
        toast("Archival retention check: latest record moved to 90-day hold queue", "warning");
      }
    } else {
      toast("No entries available for deletion", "warning");
    }

    closeModal(modal);
    render();
  });
}

async function handleResetSeed() {
  const modal = openModal({
    title: "Reset Seed Data",
    bodyHtml: `
      <div>Regenerating vendors, balances, and discrepancy queue.</div>
      <div class="ap-recon-progress"><span data-reset-progress></span></div>
      <div class="ap-recon-feed" data-reset-log></div>
    `,
    footerButtons: [{ id: "close", label: "Close" }]
  });

  if (!modal) {
    return;
  }

  const steps = [
    "Resetting statement cache...",
    "Reloading OCR worker...",
    "Restarting reconciliation engine...",
    "Rebuilding discrepancy queue..."
  ];
  const bar = modal.querySelector("[data-reset-progress]");
  const log = modal.querySelector("[data-reset-log]");

  for (let i = 0; i < steps.length; i += 1) {
    bar.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
    log.innerHTML += `<div class="ap-recon-feed-row">${steps[i]}</div>`;
    await wait(520);
  }

  saveSeed(namespace, buildFreshSeed());
  pushAudit("Seed reset completed with regenerated vendor and balance queues");
  pushJob("Reconciliation engine restart acknowledged by batch monitor");
  toast("Seed reset complete. Reconciliation queues rebuilt.", "info");

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-modal-close]")?.addEventListener("click", () => closeModal(modal));
  render();
}

async function handleGeneratePdf() {
  const modal = openModal({
    title: "Generate Audit Packet",
    bodyHtml: `
      <div>Building faux audit packet for reconciliation closure.</div>
      <div class="ap-recon-feed" data-pdf-log></div>
      <div class="ap-recon-progress"><span data-pdf-progress></span></div>
    `,
    footerButtons: [{ id: "close", label: "Close" }]
  });

  if (!modal) {
    return;
  }

  const steps = [
    "Merging statement images...",
    "Merging discrepancy notes...",
    "Merging approval trail...",
    "Applying Bates numbering...",
    "Compressing scanned attachments..."
  ];
  const log = modal.querySelector("[data-pdf-log]");
  const bar = modal.querySelector("[data-pdf-progress]");

  for (let i = 0; i < steps.length; i += 1) {
    log.innerHTML += `<div class="ap-recon-feed-row">${steps[i]}</div>`;
    bar.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
    await wait(430);
  }

  const packet = [
    "Audit Packet - AP Statement Reconciliation",
    "Included: statement images",
    "Included: discrepancy notes",
    "Included: approval trail",
    `Generated ${new Date().toISOString()}`
  ].join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  downloadFile(`ap-audit-packet-${stamp}.pdf`, packet, "application/pdf");
  pushAudit("Generated PDF audit packet for closure review");
  pushJob("Audit packet assembled and archived");
  toast("Audit packet assembled and downloaded", "info");

  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-modal-close]")?.addEventListener("click", () => closeModal(modal));
  render();
}

function renderAuditRows(filterValue = "") {
  const needle = filterValue.trim().toLowerCase();
  return auditFeed
    .filter((row) => {
      if (!needle) {
        return true;
      }
      return [row.user, row.workstation, row.timestamp, row.action, row.exportRef, row.batchRef]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    })
    .map(
      (row) => `
      <tr>
        <td>${row.timestamp}</td>
        <td>${row.user}</td>
        <td>${row.workstation}</td>
        <td>${row.action}</td>
        <td>${row.exportRef}</td>
        <td>${row.batchRef}</td>
      </tr>
    `
    )
    .join("");
}

function handleViewAuditHistory() {
  const modal = openModal({
    title: "Audit History Explorer",
    bodyHtml: `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
        <label for="audit-search">Search</label>
        <input id="audit-search" class="legacy-field" style="max-width:280px;" placeholder="user, workstation, batch ref, action" />
      </div>
      <table class="ap-recon-audit-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User ID</th>
            <th>Workstation</th>
            <th>Change</th>
            <th>Export History</th>
            <th>ERP Batch Ref</th>
          </tr>
        </thead>
        <tbody data-audit-rows>${renderAuditRows()}</tbody>
      </table>
    `,
    footerButtons: [{ id: "close", label: "Close" }]
  });

  if (!modal) {
    return;
  }

  const rows = modal.querySelector("[data-audit-rows]");
  modal.querySelector("#audit-search")?.addEventListener("input", (event) => {
    const query = event.target.value || "";
    rows.innerHTML = renderAuditRows(query);
  });
  modal.querySelector('[data-modal-btn="close"]')?.addEventListener("click", () => closeModal(modal));
  modal.querySelector("[data-modal-close]")?.addEventListener("click", () => closeModal(modal));
}

function buildLeftSidebar() {
  return `
    <div class="ap-recon-left-stack">
      <section class="ap-recon-mini-card">
        <h4>Statements</h4>
        <ul>
          <li data-statement-item="imported">Imported statements: 34</li>
          <li>OCR confidence: 89.7%</li>
          <li>Ingestion status: Queue Active</li>
          <li>Right-click for context menu</li>
        </ul>
      </section>
      <section class="ap-recon-mini-card">
        <h4>Open Items</h4>
        <ul>
          <li>Unmatched invoices: 17</li>
          <li>Payment holds: 6</li>
          <li>Negative balances: 2</li>
          <li>SLA aging: 9 items > 72h</li>
        </ul>
      </section>
      <section class="ap-recon-mini-card">
        <h4>Matching</h4>
        <ul>
          <li>Fuzzy matching workbench online</li>
          <li>Confidence scoring model: v2.14</li>
          <li>Auto-resolve suggestions: 11</li>
          <li>Force-match controls enabled</li>
        </ul>
      </section>
      <section class="ap-recon-mini-card">
        <h4>Discrepancies</h4>
        <ul>
          <li>Tax variance: 4</li>
          <li>Missing PO: 3</li>
          <li>Duplicate invoice: 2</li>
          <li>Currency mismatch: 1</li>
          <li>Escalation workflow: 5 active</li>
        </ul>
      </section>
      <section class="ap-recon-mini-card">
        <h4>Closures</h4>
        <ul>
          <li>Completed reconciliations: 42</li>
          <li>ERP batch IDs staged</li>
          <li>Archive references linked</li>
          <li>Closure timestamp sync on</li>
        </ul>
      </section>
    </div>
  `;
}

function buildDashboardSection() {
  const queueDepth = currentSeed()[activeModule]?.length || 0;
  const tabHtml = tabs(
    [
      { id: "queue", label: "Queue Dashboard" },
      { id: "processing", label: "Batch Processing" },
      { id: "integration", label: "ERP Integration" },
      { id: "reports", label: "Crystal Reports" }
    ],
    activeWorkbenchTab
  );

  const queuePanel = `
    <div class="ap-recon-density-grid">
      <div class="ap-recon-kpis">
        <div class="ap-recon-kpi"><strong>${queueDepth}</strong>Active Queue Depth</div>
        <div class="ap-recon-kpi"><strong>${Math.floor(queueDepth * 0.35) + 2}</strong>Discrepancy Cases</div>
        <div class="ap-recon-kpi"><strong>${Math.floor(queueDepth * 0.2) + 1}</strong>ERP Failures</div>
        <div class="ap-recon-kpi"><strong>${Math.floor(queueDepth * 0.45) + 4}</strong>SLA Aging Flags</div>
      </div>
      <div class="ap-recon-queue-panels">
        <section class="ap-recon-mini-card">
          <h4>Queue Monitoring</h4>
          <ul>
            <li>Priority: ${queueOrdering}</li>
            <li>Batch scheduler: active</li>
            <li>Retry queue: ${Math.floor(queueDepth / 2) + 2}</li>
            <li>Dead-letter queue: 1</li>
          </ul>
        </section>
        <section class="ap-recon-mini-card">
          <h4>Background Services</h4>
          <ul>${services.map((name) => `<li>${name} ONLINE</li>`).join("")}</ul>
        </section>
      </div>
      <div class="ap-recon-warning" data-random-system-message>${randomSystemMessage}</div>
    </div>
  `;

  const batchPanel = `
    <div class="ap-recon-queue-panels">
      <section class="ap-recon-mini-card">
        <h4>Background Job Monitor</h4>
        <div class="ap-recon-feed">
          ${jobFeed.map((line) => `<div class="ap-recon-feed-row">${line}</div>`).join("")}
        </div>
      </section>
      <section class="ap-recon-mini-card">
        <h4>Retry Processing Console</h4>
        <div class="ap-recon-feed">
          ${retryLogSeed.map((line) => `<div class="ap-recon-feed-row">${line}</div>`).join("")}
        </div>
        <div style="margin-top:6px;"><button class="legacy-btn" data-action="retry-failed">Open Terminal Popup</button></div>
      </section>
    </div>
  `;

  const integrationPanel = `
    <div class="ap-recon-erp-grid">
      <section class="ap-recon-erp-cell">
        <strong>ERP Synchronization Tracker</strong>
        <div>Session: FIN_AP_INT_03</div>
        <div>Acknowledgement: 98.4%</div>
        <div>Pending exports: ${Math.max(1, Math.floor(queueDepth / 2))}</div>
      </section>
      <section class="ap-recon-erp-cell">
        <strong>Database Connection Indicator</strong>
        <div><span class="ap-recon-status-dot"></span>${DB_CONN} CONNECTED</div>
        <div>Latency: ${38 + Math.floor(Math.random() * 30)} ms</div>
        <div>Record locks: ${Math.floor(Math.random() * 3)}</div>
      </section>
      <section class="ap-recon-erp-cell">
        <strong>Queue-driven Workflow</strong>
        <div>Ingestion -> Matching -> Discrepancy -> Closure</div>
        <div>ERP bridge: active</div>
        <div>RPA handoff: enabled</div>
      </section>
      <section class="ap-recon-erp-cell">
        <strong>Operational Friction Events</strong>
        <div>Timeout retries in current hour: ${Math.floor(Math.random() * 4) + 1}</div>
        <div>Supervisor escalations: ${Math.floor(Math.random() * 3) + 1}</div>
        <div>Pending acknowledgements: ${Math.floor(Math.random() * 5) + 1}</div>
      </section>
    </div>
  `;

  const reportPanel = `
    <div class="ap-recon-crystal-viewer">
      <div class="ap-recon-crystal-toolbar">
        <button class="legacy-btn" type="button">First</button>
        <button class="legacy-btn" type="button">Prev</button>
        <span>Page 1 / 4</span>
        <button class="legacy-btn" type="button">Next</button>
        <label>Zoom</label>
        <select class="legacy-field legacy-small"><option>80%</option><option selected>100%</option><option>125%</option></select>
      </div>
      <div class="ap-recon-report-canvas">
        <div class="ap-recon-watermark">PRELIMINARY</div>
        <div><strong>Crystal Reports Viewer (Mock)</strong></div>
        <div>AP reconciliation packet summary</div>
        <div>Margin guides and print controls emulated for 2008 runtime</div>
      </div>
    </div>
  `;

  const tabBody =
    activeWorkbenchTab === "queue"
      ? queuePanel
      : activeWorkbenchTab === "processing"
        ? batchPanel
        : activeWorkbenchTab === "integration"
          ? integrationPanel
          : reportPanel;

  return `${tabHtml}<div data-workbench-tab-body>${tabBody}</div>`;
}

function render() {
  installPageStyles();
  applyPalette();
  const data = loadSeed(namespace, () => ({}));
  const moduleColumns = columns[activeModule];
  const orderedRows = queueOrdering === "oldest-first" ? data[activeModule] : [...data[activeModule]].reverse();
  const rows = orderedRows.map((row) => moduleColumns.map((key) => row[key]));
  const grid = dataGrid(moduleColumns, rows);

  const formFields = moduleColumns
    .map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`)
    .join("");

  const contentHtml =
    `<div class="ap-recon-workbench">${buildLeftSidebar()}<div class="ap-recon-density-grid">` +
    panel("Operational Workbench", buildDashboardSection()) +
    panel("Reconciliation Grid", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:6px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`) +
    panel(
      "Audit Activity Feed",
      `<div class="ap-recon-feed">${auditFeed
        .slice(0, 10)
        .map((row) => `<div class="ap-recon-feed-row">${row.timestamp} | ${row.user} | ${row.action} | ${row.batchRef}</div>`)
        .join("")}</div>`
    ) +
    `</div></div>`;

  document.getElementById("app").innerHTML = appShell({
    title: "AP Statement Reconciliation 2008",
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
    statusText: `ENV ${ENV_LABEL} | USER ${LOGGED_IN_USER} | DB ${DB_CONN} CONNECTED`,
    contentHtml
  });

  startLiveStatus();
  startMessageRotation();
  updateStatusBar();

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeWorkbenchTab = button.getAttribute("data-tab");
      render();
    });
  });

  document.querySelectorAll("[data-statement-item]").forEach((node) => {
    node.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      openContextMenu(event.clientX, event.clientY, [
        {
          label: "Open ingestion details",
          run: () => toast("Statement ingestion detail opened", "info")
        },
        {
          label: "Force OCR re-queue",
          run: () => {
            pushJob("OCR_WORKER_02 forced reload by operator");
            pushAudit("Forced OCR re-queue from statement context menu");
            render();
          }
        },
        {
          label: "Route to discrepancy queue",
          run: () => {
            pushAudit("Statement routed to discrepancy queue from context menu");
            toast("Statement routed to discrepancy queue", "warning");
            render();
          }
        }
      ]);
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
    pushAudit(`Saved ${moduleName} record ${row[keyField]}`);
    pushJob(`Queue mutation committed for ${moduleName}`);
    render();
  });
}

function installEventHandlers() {
  const root = document.getElementById("app");
  if (!root || root.dataset.handlersInstalled === "1") {
    return;
  }

  root.dataset.handlersInstalled = "1";
  root.addEventListener(
    "click",
    (event) => {
      const actionTarget = event.target instanceof Element ? event.target.closest("[data-action]") : null;
      if (actionTarget) {
        const action = actionTarget.getAttribute("data-action");
        const knownActions = new Set([
          "export-excel",
          "print-preview",
          "retry-failed",
          "toggle-first",
          "delete-last",
          "seed-reset",
          "generate-pdf",
          "view-audit"
        ]);

        if (knownActions.has(action)) {
          event.preventDefault();
          event.stopPropagation();
        }

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
          handleResetSeed();
        } else if (action === "generate-pdf") {
          handleGeneratePdf();
        } else if (action === "view-audit") {
          handleViewAuditHistory();
        }
      }

      if (!(event.target instanceof Element) || !event.target.closest(".ap-recon-context-menu")) {
        closeContextMenu();
      }
    },
    true
  );

  document.addEventListener("scroll", closeContextMenu, true);
}

installEventHandlers();
render();
