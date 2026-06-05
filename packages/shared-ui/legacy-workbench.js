import { ensureSeed, loadSeed, saveSeed, makeId } from "../shared-mock-data/index.js";
import { appShell, dataGrid, panel } from "./index.js";

const defaultMessages = [
  "Record locked by another user",
  "ERP export pending",
  "Queue processor unavailable",
  "Batch rollback initiated",
  "Validation failed",
  "Supervisor approval required",
  "Retry job scheduled",
  "ODBC synchronization delayed"
];

const defaultStatusTags = [
  "validation failed",
  "ERP export pending",
  "locked by another user",
  "awaiting host acknowledgement",
  "retry queue active",
  "supervisor review required",
  "nightly processing in progress"
];

const defaultBackgroundJobs = [
  "OCR_WORKER_01",
  "ERP_SYNC_02",
  "AUDIT_ARCHIVER",
  "APPROVAL_ENGINE",
  "BATCH_ROUTER_03",
  "REMINDER_PROCESSOR"
];

const defaultTerminalSystems = ["AS400 sessions", "green-screen payment retries", "ERP posting consoles", "mainframe synchronization logs"];

export function bootLegacyWorkbench(config) {
  const {
    namespace,
    title,
    environmentName,
    analyst,
    workstationPrefix,
    purpose,
    modules,
    columns,
    palette,
    appDescription,
    seedData,
    rpaUseCases,
    moduleDescriptions,
    kpis,
    packetSections,
    initialQueueAging = 12,
    initialRetryBacklog = 3,
    formPlaceholder = "Manual queue work item",
    identityKey
  } = config;

  let activeModule = modules[0].id;
  let randomMessage = defaultMessages[0];
  let queueAgingCounter = initialQueueAging;
  let retryBacklog = initialRetryBacklog;
  let statusTicker = null;

  let activityFeed = [
    `${new Date().toLocaleString()} Queue monitor initialized`,
    `${new Date().toLocaleString()} Batch router synchronized pending records`,
    `${new Date().toLocaleString()} Overnight worker replay scheduled`
  ];

  let auditFeed = [
    makeAudit("Queue refresh", "Initial queue snapshot loaded"),
    makeAudit("Batch route", "Records routed for supervisor review"),
    makeAudit("Retry prep", "Terminal replay workflow queued")
  ];

  ensureSeed(namespace, () => seedData);

  function fallbackSeed() {
    const next = {};
    modules.forEach((moduleDef) => {
      next[moduleDef.id] = [];
    });
    return next;
  }

  function normalizeData(raw) {
    const next = { ...fallbackSeed(), ...(raw && typeof raw === "object" ? raw : {}) };
    modules.forEach((moduleDef) => {
      if (!Array.isArray(next[moduleDef.id])) {
        next[moduleDef.id] = [];
      }
    });
    return next;
  }

  function readData() {
    return normalizeData(loadSeed(namespace, fallbackSeed));
  }

  function applyPalette() {
    const root = document.documentElement;
    Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
  }

  function installStyles() {
    const styleId = `${namespace}-style`;
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .ops-wrap { display:grid; grid-template-columns:260px 1fr; gap:8px; }
      .ops-left { display:grid; gap:6px; align-content:start; }
      .ops-card { border:1px solid #7f8896; background:linear-gradient(to bottom,#edf2f8,#d4dbe6); padding:5px; font-size:10px; }
      .ops-card h4 { margin:0 0 4px; font-size:10px; text-transform:uppercase; color:#424f61; }
      .ops-card ul { margin:0; padding-left:14px; display:grid; gap:1px; }
      .ops-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:5px; margin-bottom:6px; }
      .ops-kpi { border:1px solid #8592a2; background:#dfe6f1; padding:4px 6px; font-size:10px; }
      .ops-kpi strong { display:block; font-size:12px; color:#304458; }
      .ops-banner { border:1px solid #8592a2; background:#e6edf7; padding:3px 6px; font-size:10px; margin-bottom:6px; display:flex; justify-content:space-between; gap:6px; }
      .ops-tags { display:flex; flex-wrap:wrap; gap:4px; }
      .ops-tag { border:1px solid #8f9dab; background:#d7e0ec; color:#34485d; padding:0 5px; font-size:9px; }
      .ops-feed { border:1px solid #8592a2; background:#f6f9fd; max-height:160px; overflow:auto; padding:4px; font-size:10px; }
      .ops-feed div { border-bottom:1px dotted #a7b4c4; padding:2px 0; }
      .ops-feed div:last-child { border-bottom:0; }
      .ops-split { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
      .ops-form { display:grid; grid-template-columns:150px 1fr; gap:5px 8px; align-items:center; }
      .ops-form-actions { margin-top:6px; display:flex; gap:4px; flex-wrap:wrap; }
      .ops-modal { position:absolute; inset:0; z-index:46; background:rgba(153,165,181,0.58); display:flex; align-items:center; justify-content:center; }
      .ops-modal-card { width:min(860px, calc(100vw - 30px)); max-height:calc(100vh - 36px); overflow:auto; border:1px solid #758293; background:#eaf1f9; box-shadow:2px 2px 0 #95a4b8; }
      .ops-modal-head { background:linear-gradient(to bottom,#ecf3fb,#c8d5e7); border-bottom:1px solid #7d8b9d; padding:6px 8px; font-size:11px; font-weight:700; display:flex; justify-content:space-between; }
      .ops-modal-body { padding:8px; font-size:11px; }
      .ops-modal-foot { border-top:1px solid #7d8b9d; padding:6px 8px; display:flex; justify-content:flex-end; gap:4px; }
      .ops-progress { border:1px solid #8592a2; height:14px; background:#d1dbe8; margin:8px 0; }
      .ops-progress span { display:block; height:100%; width:0; background:linear-gradient(to bottom,#8ca2bb,#4f7295); }
      .ops-console { border:1px solid #1f3721; background:#0c170d; color:#99dd99; font-family:Consolas, "Courier New", monospace; padding:8px; font-size:11px; min-height:170px; white-space:pre-wrap; }
      .ops-audit { width:100%; border-collapse:collapse; font-size:10px; }
      .ops-audit th, .ops-audit td { border:1px solid #8793a5; padding:3px 4px; }
      @media (max-width: 1060px) {
        .ops-wrap { grid-template-columns:1fr; }
        .ops-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); }
        .ops-split { grid-template-columns:1fr; }
        .ops-form { grid-template-columns:1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function makeAudit(action, detail) {
    return {
      timestamp: new Date().toLocaleString(),
      workstation: `${workstationPrefix}-${Math.floor(10 + Math.random() * 80)}`,
      user: analyst,
      action,
      detail,
      route: "Analyst -> Supervisor -> Host System"
    };
  }

  function pushActivity(message) {
    activityFeed = [`${new Date().toLocaleTimeString()} ${message}`, ...activityFeed].slice(0, 18);
  }

  function pushAudit(action, detail) {
    auditFeed = [makeAudit(action, detail), ...auditFeed].slice(0, 28);
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
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

  function openModal({ titleText, bodyHtml, buttons = [{ id: "close", label: "Close" }] }) {
    const host = document.querySelector(".legacy-window");
    if (!host) {
      return null;
    }

    const modal = document.createElement("div");
    modal.className = "ops-modal";
    modal.innerHTML = `
      <div class="ops-modal-card">
        <div class="ops-modal-head"><span>${titleText}</span><button class="legacy-btn" data-close-x="1">X</button></div>
        <div class="ops-modal-body">${bodyHtml}</div>
        <div class="ops-modal-foot">${buttons.map((item) => `<button class="legacy-btn" data-modal-btn="${item.id}">${item.label}</button>`).join("")}</div>
      </div>
    `;
    host.appendChild(modal);
    return modal;
  }

  function wireModalClose(modal) {
    modal?.querySelector("[data-close-x]")?.addEventListener("click", () => modal.remove());
    modal?.querySelectorAll("[data-modal-btn]").forEach((button) => {
      button.addEventListener("click", () => modal.remove());
    });
  }

  function buildCsv(tableColumns, rows) {
    const csvRows = [tableColumns.join(",")].concat(rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")));
    return csvRows.join("\r\n");
  }

  async function runExportExcel(data) {
    const moduleRows = data[activeModule] || [];
    const tableColumns = columns[activeModule];
    const modal = openModal({
      titleText: "Export Excel - Progress",
      bodyHtml: `<div>Generating workbook for ${activeModule} queue...</div><div class="ops-progress"><span id="export-progress"></span></div><div id="export-status">Initializing export worker...</div>`,
      buttons: [{ id: "close", label: "Close" }]
    });

    if (!modal) {
      return;
    }

    const progress = modal.querySelector("#export-progress");
    const status = modal.querySelector("#export-status");
    for (let step = 1; step <= 5; step += 1) {
      await wait(180);
      if (progress) {
        progress.style.width = `${step * 20}%`;
      }
      if (status) {
        status.textContent = `Processing batch ${step}/5...`;
      }
    }

    const csv = buildCsv(tableColumns, moduleRows.map((row) => tableColumns.map((key) => row[key] || "")));
    downloadFile(`${namespace}-${activeModule}-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv;charset=utf-8");

    const warning = Math.random() > 0.45 ? "Warning: records skipped due to active lock." : "Export completed without warnings.";
    if (status) {
      status.textContent = warning;
    }
    pushActivity(`Export workbook completed for ${activeModule}`);
    pushAudit("Export Excel", warning);
    wireModalClose(modal);
  }

  function runPrintPreview(data) {
    const watermark = Math.random() > 0.5 ? "PRELIMINARY" : "INTERNAL";
    const modal = openModal({
      titleText: "Crystal Reports Preview",
      bodyHtml: `
        <div style="display:flex; gap:6px; margin-bottom:8px;">
          <button class="legacy-btn">Printer Setup</button>
          <button class="legacy-btn">Portrait</button>
          <button class="legacy-btn">Landscape</button>
          <button class="legacy-btn">Queue View</button>
        </div>
        <div style="border:1px solid #8895a7; background:#fbfdff; padding:10px; position:relative; min-height:170px;">
          <div style="position:absolute; top:36%; left:20%; opacity:0.16; font-size:36px; transform:rotate(-20deg);">${watermark}</div>
          <strong>${title} Report Viewer</strong>
          <div>Module: ${activeModule}</div>
          <div>Records: ${(data[activeModule] || []).length}</div>
          <div>Approval routing: Analyst -> Supervisor -> Host System</div>
        </div>
      `,
      buttons: [{ id: "close", label: "Close" }]
    });
    pushActivity("Print preview opened with Crystal-style controls");
    pushAudit("Print Preview", `Watermark ${watermark} applied`);
    wireModalClose(modal);
  }

  async function runRetryFailed() {
    const modal = openModal({
      titleText: "Retry Failed - Terminal Replay",
      bodyHtml: `<div class="ops-console" id="retry-console">Connecting to terminal systems...</div>`,
      buttons: [{ id: "close", label: "Close" }]
    });

    if (!modal) {
      return;
    }

    const consoleNode = modal.querySelector("#retry-console");
    const logs = [
      "[02:14:11] AS400 session opened for queue replay.",
      "[02:14:13] Replaying failed queue transactions...",
      "[02:14:16] ODBC synchronization delayed, retrying host acknowledgement.",
      "[02:14:20] Mainframe synchronization logs confirm update.",
      "[02:14:22] Retry batch marked successful."
    ];

    for (const line of logs) {
      await wait(220);
      if (consoleNode) {
        consoleNode.textContent += `\n${line}`;
      }
    }

    retryBacklog = Math.max(0, retryBacklog - 1);
    pushActivity("Retry batch replay executed for failed queue");
    pushAudit("Retry Failed", "Failed queue transactions replayed through terminal console");
    wireModalClose(modal);
  }

  function runGeneratePdf(data) {
    const packetRows = packetSections
      .map((section) => {
        const entries = (data[section.moduleId] || []).map((row) => section.fields.map((field) => row[field] || "").join(" | "));
        return [section.title, ...entries, ""].join("\r\n");
      })
      .join("\r\n");

    const packet = [
      `${title} Operational Packet`,
      "",
      packetRows
    ].join("\r\n");

    downloadFile(`${namespace}-packet-${new Date().toISOString().slice(0, 10)}.txt`, packet, "text/plain;charset=utf-8");
    pushActivity("PDF packet assembled and archived to compliance repository");
    pushAudit("Generate PDF", "Operational packet merged and archived");
  }

  function runOpenTerminal() {
    const modal = openModal({
      titleText: "Terminal Automation Popup",
      bodyHtml: `<div class="ops-console">HOST TERMINAL READY\nF6=QueueSync\nF8=RetryBatch\nSession routed via automation runtime.</div>`,
      buttons: [{ id: "close", label: "Close" }]
    });
    pushActivity("Terminal emulator popup opened for attended automation demo");
    pushAudit("Terminal Popup", "Green-screen session exposed to analyst");
    wireModalClose(modal);
  }

  function runViewAudit() {
    const rows = auditFeed
      .map(
        (item) => `<tr><td>${item.timestamp}</td><td>${item.workstation}</td><td>${item.user}</td><td>${item.action}</td><td>${item.detail}</td><td>${item.route}</td></tr>`
      )
      .join("");
    const modal = openModal({
      titleText: "Audit History Timeline",
      bodyHtml: `<table class="ops-audit"><thead><tr><th>Timestamp</th><th>Workstation</th><th>User</th><th>Action</th><th>Status Change</th><th>Approval Routing</th></tr></thead><tbody>${rows}</tbody></table>`,
      buttons: [{ id: "close", label: "Close" }]
    });
    wireModalClose(modal);
  }

  function computeHealth(data) {
    const joined = Object.values(data)
      .flat()
      .map((row) => String(row.status || "").toLowerCase());
    const riskCount = joined.filter((value) => value.includes("failed") || value.includes("pending") || value.includes("review") || value.includes("retry") || value.includes("locked")).length;
    return Math.max(26, Math.min(97, 92 - riskCount * 4));
  }

  function renderContent(data) {
    const moduleCols = columns[activeModule];
    const rows = (data[activeModule] || []).map((row) => moduleCols.map((key) => row[key] || ""));
    const grid = dataGrid(moduleCols, rows);
    const health = computeHealth(data);

    return `
      <section class="ops-wrap">
        <aside class="ops-left">
          <div class="ops-card"><h4>Environment Indicator</h4><ul><li>${environmentName}</li><li>Analyst: ${analyst}</li><li>Queue aging counter: ${queueAgingCounter}</li></ul></div>
          <div class="ops-card"><h4>Workflow Indicators</h4><ul><li>Approval workflow: active</li><li>Retry batch backlog: ${retryBacklog}</li><li>ERP synchronization monitor: active</li></ul></div>
          <div class="ops-card"><h4>Background Worker Jobs</h4><ul>${defaultBackgroundJobs.map((job) => `<li>${job}</li>`).join("")}</ul></div>
          <div class="ops-card"><h4>Terminal Systems</h4><ul>${defaultTerminalSystems.map((name) => `<li>${name}</li>`).join("")}</ul></div>
          <div class="ops-card"><h4>RPA Demo Moments</h4><ul>${rpaUseCases.map((item) => `<li>${item}</li>`).join("")}</ul></div>
        </aside>
        <div>
          <div class="ops-kpis">
            ${kpis.map((kpi) => `<div class="ops-kpi"><strong>${(data[kpi.moduleId] || []).length}</strong>${kpi.label}</div>`).join("")}
            <div class="ops-kpi"><strong>${retryBacklog}</strong>Retry queue active</div>
            <div class="ops-kpi"><strong>${health}%</strong>System health</div>
          </div>
          <div class="ops-banner"><span>${purpose}</span><span data-system-message="1">${randomMessage}</span></div>
          <div class="ops-tags" style="margin-bottom:6px;">${defaultStatusTags.map((tag) => `<span class="ops-tag">${tag}</span>`).join("")}</div>
          ${panel(`${modules.find((moduleDef) => moduleDef.id === activeModule)?.label || "Queue"} Dashboard`, `<div style="font-size:10px; color:#4e5d70; margin-bottom:6px;">${moduleDescriptions[activeModule] || "Operationally dense queue dashboard."}</div>${grid}`)}
          ${panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="ops-form"><label>Record Description</label><input class="legacy-field" name="description" placeholder="${formPlaceholder}" /><label>Owner</label><input class="legacy-field" name="owner" value="${analyst}" /><label>Status Tag</label><select class="legacy-field" name="status">${defaultStatusTags.map((tag) => `<option>${tag}</option>`).join("")}</select></div><div class="ops-form-actions"><button class="legacy-btn" type="submit">Save Queue Item</button><button class="legacy-btn" type="button" data-action="open-terminal">Open Terminal</button></div></form>`)}
          <section class="ops-split" style="margin-top:6px;">
            ${panel("Live Queue Updates", `<div class="ops-feed">${activityFeed.map((line) => `<div>${line}</div>`).join("")}</div>`)}
            ${panel("Approval Routing Monitor", `<div class="ops-feed">${auditFeed.slice(0, 8).map((item) => `<div>${item.timestamp} | ${item.action} | ${item.route}</div>`).join("")}</div>`)}
          </section>
        </div>
      </section>
    `;
  }

  function render() {
    installStyles();
    applyPalette();
    const data = readData();
    const contentHtml = renderContent(data);

    document.getElementById("app").innerHTML = appShell({
      title,
      modules,
      activeModule,
      toolbarButtons: [
        { id: "generate-pdf", label: "Generate PDF" },
        { id: "view-audit", label: "View Audit History" },
        { id: "open-terminal", label: "Terminal Popup" }
      ],
      statusText: `Env: ${environmentName} | Analyst: ${analyst} | Queue Aging: ${queueAgingCounter} | Retry Backlog: ${retryBacklog} | ERP Sync: active | Audit timeline: ${auditFeed.length} events`,
      contentHtml,
      identityKey: identityKey || `${namespace}-legacy-workbench`,
      appDescription
    });

    document.querySelectorAll("[data-module]").forEach((button) => {
      button.addEventListener("click", () => {
        activeModule = button.getAttribute("data-module");
        render();
      });
    });

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const action = button.getAttribute("data-action");
        const latest = readData();

        if (action === "legacy-app-help") {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (action === "export-excel") {
          await runExportExcel(latest);
        } else if (action === "print-preview") {
          runPrintPreview(latest);
        } else if (action === "retry-failed") {
          await runRetryFailed();
        } else if (action === "generate-pdf") {
          runGeneratePdf(latest);
        } else if (action === "view-audit") {
          runViewAudit();
        } else if (action === "open-terminal") {
          runOpenTerminal();
        }
      });
    });

    const form = document.getElementById("entry-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const moduleName = form.getAttribute("data-module") || activeModule;
        const moduleCols = columns[moduleName] || [];
        const latest = readData();
        const row = {};

        moduleCols.forEach((field, index) => {
          if (index === 0) {
            row[field] = makeId(moduleName.slice(0, 3).toUpperCase());
          } else if (field === "status") {
            row[field] = formData.get("status")?.toString() || defaultStatusTags[0];
          } else if (field === "owner" || field === "collector" || field === "assignee" || field === "lead" || field === "reviewer") {
            row[field] = formData.get("owner")?.toString() || analyst;
          } else if (field.toLowerCase().includes("date") || field.toLowerCase().includes("window")) {
            row[field] = new Date().toISOString().slice(0, 10);
          } else {
            row[field] = formData.get("description")?.toString() || `${moduleName} queue item`;
          }
        });

        latest[moduleName].unshift(row);
        saveSeed(namespace, latest);
        pushActivity(`Manual queue entry captured in ${moduleName}`);
        pushAudit("Manual Entry", `${moduleName} row inserted by analyst`);
        queueAgingCounter += 1;
        render();
      });
    }
  }

  function startTicker() {
    if (statusTicker) {
      return;
    }

    statusTicker = window.setInterval(() => {
      randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
      queueAgingCounter = queueAgingCounter >= 34 ? 11 : queueAgingCounter + 1;
      retryBacklog = Math.max(0, Math.min(8, retryBacklog + (Math.random() > 0.52 ? 1 : -1)));
      const node = document.querySelector("[data-system-message]");
      if (node) {
        node.textContent = randomMessage;
      }
    }, 5200);
  }

  startTicker();
  render();
}
