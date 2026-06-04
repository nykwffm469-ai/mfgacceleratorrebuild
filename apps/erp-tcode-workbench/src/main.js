import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";

const namespace = "erp-tcode-workbench";

const txCatalog = [
  { code: "FB60", title: "Vendor Invoice Entry", module: "Finance", type: "entry", auth: "ap-clerk" },
  { code: "FB65", title: "Credit Memo Processing", module: "Finance", type: "entry", auth: "ap-clerk" },
  { code: "FBL1N", title: "Vendor Line Item Display", module: "Finance", type: "report" },
  { code: "F110", title: "Payment Run Processing", module: "Finance", type: "admin", auth: "finance-supervisor" },
  { code: "ZAP1", title: "AP Exception Queue", module: "Finance", type: "queue" },
  { code: "ZREC", title: "Reconciliation Dashboard", module: "Finance", type: "report" },
  { code: "ZCLOSE", title: "Close Cycle Monitor", module: "Finance", type: "report", businessUnitRequired: true },
  { code: "ME21", title: "Create Purchase Requisition", module: "Procurement", type: "entry" },
  { code: "ME29", title: "Requisition Approval", module: "Procurement", type: "queue", auth: "buyer-approver" },
  { code: "ME80", title: "PO Search Console", module: "Procurement", type: "report" },
  { code: "ZBID", title: "Bid Comparison Workbench", module: "Procurement", type: "queue" },
  { code: "ZSUP", title: "Supplier Compliance Review", module: "Procurement", type: "master", businessUnitRequired: true },
  { code: "ZHOLD", title: "Invoice Hold Queue", module: "Procurement", type: "queue", aliases: ["AP01"] },
  { code: "LX03", title: "Bin Inventory Review", module: "Warehouse", type: "report", plantRequired: true },
  { code: "LT10", title: "Transfer Orders", module: "Warehouse", type: "entry", plantRequired: true },
  { code: "ZPK1", title: "RF Picking Screen", module: "Warehouse", type: "queue", plantRequired: true },
  { code: "ZSHIP", title: "Shipment Staging", module: "Warehouse", type: "queue", aliases: ["WHSE"], plantRequired: true },
  { code: "ZRCV", title: "ASN Receiving", module: "Warehouse", type: "entry", plantRequired: true },
  { code: "ZCYCLE", title: "Cycle Count Dashboard", module: "Warehouse", type: "report", plantRequired: true },
  { code: "HD01", title: "Create Incident", module: "Helpdesk", type: "entry" },
  { code: "HD05", title: "Technician Queue", module: "Helpdesk", type: "queue" },
  { code: "HD08", title: "Escalation Review", module: "Helpdesk", type: "queue", auth: "service-manager" },
  { code: "HDKB", title: "Knowledge Search", module: "Helpdesk", type: "report" },
  { code: "ZSLA", title: "SLA Breach Monitor", module: "Helpdesk", type: "report" },
  { code: "PA20", title: "Employee Lookup", module: "HR", type: "master" },
  { code: "PA40", title: "New Hire Actions", module: "HR", type: "entry", auth: "hr-specialist" },
  { code: "ZONB", title: "Onboarding Dashboard", module: "HR", type: "queue" },
  { code: "ZATST", title: "Training Attestations", module: "HR", type: "queue" },
  { code: "ZPTO", title: "PTO Approval Queue", module: "HR", type: "queue", auth: "manager" },
  { code: "LC10", title: "Case Lookup", module: "Legal", type: "master" },
  { code: "ZDOCKET", title: "Docket Calendar", module: "Legal", type: "report" },
  { code: "ZEVID", title: "Evidence Registry", module: "Legal", type: "queue" },
  { code: "ZRAID", title: "RAID Register", module: "Projects", type: "queue" },
  { code: "ZPMO", title: "PMO Dashboard", module: "Projects", type: "report" },
  { code: "ZSTAT", title: "Weekly Status Submission", module: "Projects", type: "entry" },
  { code: "ZDEP", title: "Dependency Matrix", module: "Projects", type: "report" },
  { code: "XK90", title: "Vendor Master Maintenance", module: "Master Data", type: "master", auth: "mdm-admin" },
  { code: "MM17", title: "Material Master Mass Update", module: "Master Data", type: "admin", auth: "mdm-admin" },
  { code: "VA02", title: "Sales Order Change", module: "Sales", type: "entry" },
  { code: "PM04", title: "Plant Maintenance Planner", module: "Maintenance", type: "queue", plantRequired: true },
  { code: "FINC", title: "Finance Command Center", module: "Finance", type: "report", auth: "finance-supervisor" },
  { code: "HR22", title: "HR Case Escalation", module: "HR", type: "queue", auth: "hr-specialist" },
  { code: "FB99", title: "Legacy Finance Override", module: "Finance", type: "admin", disabled: true }
];

const txByCode = Object.fromEntries(txCatalog.map((tx) => [tx.code, tx]));
const aliasToCode = txCatalog.reduce((acc, tx) => {
  (tx.aliases || []).forEach((alias) => {
    acc[alias] = tx.code;
  });
  return acc;
}, {});

const defaultData = {
  companyCodes: [
    { code: "1000", name: "North America Ops" },
    { code: "2000", name: "Europe Shared Services" }
  ],
  plants: [
    { code: "1100", name: "Chicago Distribution" },
    { code: "1200", name: "Dallas Packaging" },
    { code: "1400", name: "Phoenix Assembly" }
  ],
  businessUnits: ["Industrial", "Distribution", "Aftermarket"],
  vendors: [
    { vendorId: "400129", name: "Alpine Industrial Supply", status: "Approved", risk: "Medium" },
    { vendorId: "400331", name: "Summit Process Tools", status: "Conditional", risk: "High" }
  ],
  queues: [
    { queueId: "Q-1801", queueName: "AP Exceptions", owner: "Ops Finance", ageDays: "3", status: "Open" },
    { queueId: "Q-1802", queueName: "Shipment Escalation", owner: "Warehouse Control", ageDays: "1", status: "Escalated" },
    { queueId: "Q-1803", queueName: "PTO Approval", owner: "HR Shared Services", ageDays: "2", status: "Pending" }
  ],
  entries: [
    { docNo: "51009211", docType: "Invoice", amount: "12450", currency: "USD", status: "Parked" },
    { docNo: "51009212", docType: "CreditMemo", amount: "-880", currency: "USD", status: "Posted" }
  ],
  reports: [
    { rowId: "R-01", dimension: "Aging 30+", value: "18", variance: "2", status: "Review" },
    { rowId: "R-02", dimension: "Open GR/IR", value: "74", variance: "-4", status: "Watch" },
    { rowId: "R-03", dimension: "SLA Breaches", value: "5", variance: "1", status: "Escalate" }
  ],
  admins: [
    { setting: "Workflow Route", value: "v12", owner: "COE", status: "Active" },
    { setting: "Job Scheduler", value: "Nightly 02:13", owner: "Basis", status: "Running" }
  ],
  txMessages: []
};

const seedFactory = () => ({
  ...defaultData,
  session: {
    id: `S-${Math.floor(Math.random() * 899999 + 100000)}`,
    role: "ops-clerk",
    user: "OPERATIONS.USER01",
    companyCode: "1000",
    plant: "1100",
    businessUnit: "Industrial",
    currentTx: "ZPMO",
    commandInput: "",
    recent: ["ZPMO", "FB60", "ME80", "ZAP1"],
    favorites: ["FB60", "ME80", "ZPK1", "ZPMO", "PA20"],
    saved: ["ZAP1", "ZREC", "HD05", "ZRAID"],
    currentModule: "Projects",
    breadcrumb: "SAPMENU > Z > PMO > Dashboard",
    dirty: false,
    statusText: "Ready"
  }
});

ensureSeed(namespace, seedFactory);

function loadState() {
  return loadSeed(namespace, seedFactory);
}

function saveState(state) {
  saveSeed(namespace, state);
}

function setStatus(state, message) {
  state.session.statusText = message;
  state.txMessages.unshift({ id: makeId("MSG"), message, time: new Date().toLocaleTimeString() });
  state.txMessages = state.txMessages.slice(0, 12);
}

function resolveTx(raw) {
  const code = (raw || "").trim().toUpperCase();
  if (!code) return null;
  return txByCode[code] || txByCode[aliasToCode[code]] || null;
}

function authorize(state, tx) {
  if (tx.disabled) {
    return `You are not authorized for transaction ${tx.code}.`;
  }
  if (tx.plantRequired && !state.session.plant) {
    return "Plant 1200 authorization required.";
  }
  if (tx.businessUnitRequired && !state.session.businessUnit) {
    return "Business Unit selection required before continuing.";
  }
  if (tx.auth && ![state.session.role, "finance-supervisor", "mdm-admin"].includes(tx.auth)) {
    return `Authorization check failed for ${tx.code}. Required role: ${tx.auth}.`;
  }
  return null;
}

function pushRecent(state, code) {
  state.session.recent = [code, ...state.session.recent.filter((item) => item !== code)].slice(0, 12);
}

function enterTransaction(state, rawCode) {
  const tx = resolveTx(rawCode);
  const normalized = (rawCode || "").trim().toUpperCase();

  if (!tx) {
    setStatus(state, `Transaction code ${normalized || "(blank)"} does not exist or is not authorized.`);
    return;
  }

  const authError = authorize(state, tx);
  if (authError) {
    setStatus(state, authError);
    return;
  }

  state.session.currentTx = tx.code;
  state.session.currentModule = tx.module;
  state.session.breadcrumb = `SAPMENU > ${tx.module.toUpperCase()} > ${tx.code}`;
  state.session.commandInput = tx.code;
  state.session.dirty = false;
  pushRecent(state, tx.code);

  const aliasUsed = aliasToCode[normalized] ? ` Alias ${normalized} resolved.` : "";
  setStatus(state, `Processing requested... Loaded ${tx.code} ${tx.title}.${aliasUsed}`);
}

function toggleFavorite(state, code) {
  if (state.session.favorites.includes(code)) {
    state.session.favorites = state.session.favorites.filter((item) => item !== code);
    setStatus(state, `${code} removed from favorites.`);
  } else {
    state.session.favorites.unshift(code);
    state.session.favorites = state.session.favorites.slice(0, 12);
    setStatus(state, `${code} added to favorites.`);
  }
}

function renderGrid(columns, rows, cssClass = "") {
  return `<table class="legacy-grid ${cssClass}"><thead><tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function renderWorkspace(state) {
  const tx = txByCode[state.session.currentTx] || txCatalog[0];
  const commonHeader = `
    <div class="erp-head-row">
      <div><strong>${tx.code}</strong> - ${tx.title}</div>
      <div class="erp-mono">Session ${state.session.id}</div>
    </div>
    <div class="erp-breadcrumb">${state.session.breadcrumb}</div>
  `;

  const formFields = `
    <div class="erp-form-grid">
      <label>Company Code</label><input class="legacy-field" value="${state.session.companyCode}" data-param="companyCode" />
      <label>Plant</label><input class="legacy-field" value="${state.session.plant}" data-param="plant" />
      <label>Business Unit</label><input class="legacy-field" value="${state.session.businessUnit}" data-param="businessUnit" />
      <label>Posting Date</label><input class="legacy-field" value="${new Date().toISOString().slice(0, 10)}" />
      <label>Document Text</label><input class="legacy-field" value="Workflow routing initiated" />
      <label>Reference</label><input class="legacy-field" value="${makeId("DOC")}" />
    </div>
  `;

  if (tx.type === "master") {
    return commonHeader + `
      <div class="erp-split">
        <section class="legacy-panel">
          <div class="legacy-panel-head">Master Record</div>
          <div class="legacy-panel-body">
            ${formFields}
            <div class="erp-action-row">
              <button class="legacy-btn" data-ws-action="save">Ctrl+S Save</button>
              <button class="legacy-btn" data-ws-action="commit">Commit</button>
              <button class="legacy-btn" data-ws-action="lock">Lock Check</button>
            </div>
          </div>
        </section>
        <section class="legacy-panel">
          <div class="legacy-panel-head">Related Master Grid</div>
          <div class="legacy-panel-body">
            ${renderGrid(
              ["Vendor", "Name", "Status", "Risk"],
              state.vendors.map((v) => [v.vendorId, v.name, v.status, v.risk])
            )}
          </div>
        </section>
      </div>
    `;
  }

  if (tx.type === "queue") {
    return commonHeader + `
      <section class="legacy-panel">
        <div class="legacy-panel-head">Queue Filters</div>
        <div class="legacy-panel-body erp-filter-row">
          <label>Status</label><select class="legacy-field erp-filter"><option>Open</option><option>Pending</option><option>Escalated</option></select>
          <label>Owner</label><input class="legacy-field erp-filter" value="${state.session.user}" />
          <label>Aging</label><input class="legacy-field erp-filter" value=">2 days" />
          <button class="legacy-btn" data-ws-action="execute">F8 Execute</button>
          <button class="legacy-btn" data-ws-action="export">Export list to spreadsheet</button>
        </div>
      </section>
      <section class="legacy-panel">
        <div class="legacy-panel-head">${tx.title}</div>
        <div class="legacy-panel-body">
          ${renderGrid(
            ["Queue", "Owner", "Age", "Status", "Action"],
            state.queues.map((q) => [q.queueName, q.owner, `${q.ageDays}d`, q.status, "Review"])
          )}
          <div class="erp-action-row">
            <button class="legacy-btn" data-ws-action="route">Workflow routing initiated</button>
            <button class="legacy-btn" data-ws-action="retry">Retry failed records</button>
            <button class="legacy-btn" data-ws-action="escalate">Escalation triggered</button>
          </div>
        </div>
      </section>
    `;
  }

  if (tx.type === "entry") {
    return commonHeader + `
      <section class="legacy-panel">
        <div class="legacy-panel-head">Transactional Entry</div>
        <div class="legacy-panel-body">
          ${formFields}
          <div class="erp-form-grid">
            <label>Amount</label><input class="legacy-field" value="12840.00" />
            <label>Currency</label><input class="legacy-field" value="USD" />
            <label>GL Account</label><input class="legacy-field" value="45510" />
            <label>Cost Center</label><input class="legacy-field" value="45510" />
            <label>Approver</label><input class="legacy-field" value="M. Ortega" />
            <label>Date Picker</label><input class="legacy-field" placeholder="MM/DD/YYYY" />
          </div>
          <div class="erp-action-row">
            <button class="legacy-btn" data-ws-action="park">Park</button>
            <button class="legacy-btn" data-ws-action="post">Post</button>
            <button class="legacy-btn" data-ws-action="cancel">Shift+F12 Cancel</button>
          </div>
        </div>
      </section>
      <section class="legacy-panel">
        <div class="legacy-panel-head">Recent Documents</div>
        <div class="legacy-panel-body">
          ${renderGrid(
            ["Doc", "Type", "Amount", "Curr", "Status"],
            state.entries.map((e) => [e.docNo, e.docType, e.amount, e.currency, e.status])
          )}
        </div>
      </section>
    `;
  }

  if (tx.type === "report") {
    return commonHeader + `
      <section class="legacy-panel">
        <div class="legacy-panel-head">Report Parameters</div>
        <div class="legacy-panel-body erp-filter-row">
          <label>Company</label><input class="legacy-field erp-filter" value="${state.session.companyCode}" />
          <label>Plant</label><input class="legacy-field erp-filter" value="${state.session.plant}" />
          <label>From</label><input class="legacy-field erp-filter" value="2026-01-01" />
          <label>To</label><input class="legacy-field erp-filter" value="2026-06-30" />
          <button class="legacy-btn" data-ws-action="execute">F8 Execute</button>
        </div>
      </section>
      <section class="legacy-panel">
        <div class="legacy-panel-head">${tx.title} Output</div>
        <div class="legacy-panel-body">
          ${renderGrid(
            ["Dimension", "Value", "Variance", "Status", "Comment"],
            state.reports.map((r) => [r.dimension, r.value, r.variance, r.status, "Review aging exceptions"]) 
          )}
          <div class="erp-action-row">
            <button class="legacy-btn" data-ws-action="background">Background job submitted</button>
            <button class="legacy-btn" data-ws-action="print">Ctrl+P Print</button>
          </div>
        </div>
      </section>
    `;
  }

  return commonHeader + `
    <section class="legacy-panel">
      <div class="legacy-panel-head">Administration Workspace</div>
      <div class="legacy-panel-body">
        ${renderGrid(
          ["Setting", "Value", "Owner", "Status"],
          state.admins.map((a) => [a.setting, a.value, a.owner, a.status])
        )}
        <div class="erp-action-row">
          <button class="legacy-btn" data-ws-action="schedule">Job scheduler</button>
          <button class="legacy-btn" data-ws-action="commit">Changes not yet committed</button>
          <button class="legacy-btn" data-ws-action="auth">Authorization check</button>
        </div>
      </div>
    </section>
  `;
}

function renderModuleTree(state) {
  const modules = [...new Set(txCatalog.map((tx) => tx.module))];
  return modules
    .map((moduleName) => {
      const txItems = txCatalog.filter((tx) => tx.module === moduleName).slice(0, 5);
      const list = txItems
        .map(
          (tx) =>
            `<li><button class="legacy-nav-item ${state.session.currentTx === tx.code ? "active" : ""}" data-tx="${tx.code}"><span class="erp-mono">${tx.code}</span> ${tx.title}</button></li>`
        )
        .join("");
      return `<details open><summary>${moduleName}</summary><ul class="erp-tree">${list}</ul></details>`;
    })
    .join("");
}

function renderSidebarList(title, key, items) {
  const rows = items
    .map(
      (item) =>
        `<button class="legacy-nav-item compact" data-side-action="${key}" data-code="${item}"><span class="erp-mono">${item}</span> ${txByCode[item]?.title || "Custom"}</button>`
    )
    .join("");
  return `<section class="legacy-panel"><div class="legacy-panel-head">${title}</div><div class="legacy-panel-body">${rows || "<div>No entries</div>"}</div></section>`;
}

function render(state) {
  const tx = txByCode[state.session.currentTx] || txCatalog[0];
  const app = document.getElementById("app");
  app.innerHTML = `
    <style>
      .erp-shell { margin: 6px; border: 1px solid #6f7d8a; background: #edf1f5; font-size: 11px; }
      .erp-top { display: grid; grid-template-columns: 160px 1fr 360px; gap: 6px; align-items: center; border-bottom: 1px solid #7c8894; background: linear-gradient(to bottom, #e6ecf3 0%, #c4cfdb 100%); padding: 6px; }
      .erp-logo { font-weight: 700; border: 1px solid #768390; padding: 4px 6px; background: #d9e1ea; text-align: center; }
      .erp-system { font-weight: 700; }
      .erp-command { display: flex; align-items: center; gap: 4px; justify-content: flex-end; }
      .erp-command label { font-weight: 700; }
      .erp-command input { width: 190px; font-family: Consolas, "Courier New", monospace; }
      .erp-layout { display: grid; grid-template-columns: 340px 1fr; min-height: calc(100vh - 130px); }
      .erp-left { border-right: 1px solid #808b97; background: #d8e0e9; padding: 6px; overflow: auto; }
      .erp-main { padding: 6px; background: #f3f5f8; overflow: auto; }
      .erp-head-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
      .erp-breadcrumb { border: 1px solid #81909e; background: #e2e9f1; padding: 3px 6px; margin-bottom: 6px; }
      .erp-mono { font-family: Consolas, "Courier New", monospace; }
      .erp-tree { margin: 4px 0 8px 16px; padding: 0; list-style: square; }
      .erp-tree li { margin-bottom: 3px; }
      .erp-form-grid { display: grid; grid-template-columns: 150px 1fr; gap: 5px 8px; align-items: center; }
      .erp-filter-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
      .erp-filter { width: 130px; }
      .erp-action-row { display: flex; gap: 5px; margin-top: 7px; flex-wrap: wrap; }
      .erp-split { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .erp-status { border-top: 1px solid #7b8794; background: #c5cfda; padding: 4px 8px; display: flex; justify-content: space-between; }
      .erp-warning { color: #7a2f14; font-weight: 700; }
    </style>
    <div class="erp-shell">
      <div class="erp-top">
        <div class="erp-logo">NORTHSTAR ERP</div>
        <div class="erp-system">Enterprise Transaction Workbench 2009</div>
        <form id="tx-form" class="erp-command">
          <label for="tx-code">Transaction Code</label>
          <input id="tx-code" class="legacy-field" value="${state.session.commandInput || state.session.currentTx}" placeholder="ZPRK" />
          <button class="legacy-btn" type="submit">Enter</button>
        </form>
      </div>
      <div class="erp-layout">
        <aside class="erp-left">
          ${renderSidebarList("Favorites", "favorite-run", state.session.favorites)}
          ${renderSidebarList("Recent Transactions", "recent-run", state.session.recent)}
          ${renderSidebarList("Saved Transactions", "saved-run", state.session.saved)}
          <section class="legacy-panel">
            <div class="legacy-panel-head">Navigation Tree</div>
            <div class="legacy-panel-body">${renderModuleTree(state)}</div>
          </section>
        </aside>
        <main class="erp-main">${renderWorkspace(state)}</main>
      </div>
      <div class="erp-status">
        <div>
          ${state.session.statusText} ${state.session.dirty ? "<span class='erp-warning'>Changes not yet committed</span>" : ""}
        </div>
        <div>
          Company ${state.session.companyCode} | Plant ${state.session.plant} | Session ${state.session.id} | User session will expire in 5 minutes
        </div>
      </div>
    </div>
  `;

  app.querySelector("#tx-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextState = loadState();
    const code = app.querySelector("#tx-code")?.value || "";
    enterTransaction(nextState, code);
    saveState(nextState);
    render(nextState);
  });

  app.querySelectorAll("[data-tx]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextState = loadState();
      enterTransaction(nextState, button.getAttribute("data-tx") || "");
      saveState(nextState);
      render(nextState);
    });
  });

  app.querySelectorAll("[data-side-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextState = loadState();
      const code = button.getAttribute("data-code") || "";
      enterTransaction(nextState, code);
      saveState(nextState);
      render(nextState);
    });
  });

  app.querySelectorAll("[data-param]").forEach((field) => {
    field.addEventListener("change", () => {
      const nextState = loadState();
      const key = field.getAttribute("data-param");
      nextState.session[key] = field.value;
      nextState.session.dirty = true;
      setStatus(nextState, `${key} updated. Changes not yet committed.`);
      saveState(nextState);
      render(nextState);
    });
  });

  app.querySelectorAll("[data-ws-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextState = loadState();
      const action = button.getAttribute("data-ws-action");
      if (action === "save") {
        setStatus(nextState, "Changes saved in session buffer.");
      } else if (action === "commit") {
        nextState.session.dirty = false;
        setStatus(nextState, "Batch 840193 completed. Changes committed.");
      } else if (action === "lock") {
        setStatus(nextState, "Record currently locked by another user.");
      } else if (action === "execute") {
        setStatus(nextState, "Processing requested...");
      } else if (action === "route") {
        setStatus(nextState, "Workflow routing initiated.");
      } else if (action === "retry") {
        setStatus(nextState, "3 records skipped during import. Retry queue opened.");
      } else if (action === "escalate") {
        setStatus(nextState, "Escalation triggered.");
      } else if (action === "park") {
        nextState.entries.unshift({ docNo: makeId("5100"), docType: "Invoice", amount: "630", currency: "USD", status: "Parked" });
        setStatus(nextState, "Document parked.");
      } else if (action === "post") {
        if (nextState.session.currentTx === "FB60" && nextState.session.companyCode === "1000") {
          setStatus(nextState, "Posting period closed.");
        } else {
          setStatus(nextState, "Document posted successfully.");
        }
      } else if (action === "cancel") {
        setStatus(nextState, "Entry cancelled by user.");
      } else if (action === "background") {
        setStatus(nextState, "Background job submitted.");
      } else if (action === "print") {
        window.print();
      } else if (action === "schedule") {
        setStatus(nextState, "Job scheduler screen opened.");
      } else if (action === "auth") {
        setStatus(nextState, "Authorization check failed.");
      } else if (action === "export") {
        setStatus(nextState, "Export list to spreadsheet.");
      }
      saveState(nextState);
      render(nextState);
    });
  });
}

function applyHotkeys() {
  document.addEventListener("keydown", (event) => {
    const state = loadState();
    if (event.ctrlKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      state.session.dirty = false;
      setStatus(state, "Ctrl+S Save executed.");
      saveState(state);
      render(state);
      return;
    }
    if (event.key === "F3") {
      event.preventDefault();
      const prev = state.session.recent[1] || "ZPMO";
      enterTransaction(state, prev);
      saveState(state);
      render(state);
      return;
    }
    if (event.key === "F5") {
      event.preventDefault();
      setStatus(state, "F5 Refresh complete.");
      saveState(state);
      render(state);
      return;
    }
    if (event.key === "F8") {
      event.preventDefault();
      setStatus(state, "F8 Execute triggered.");
      saveState(state);
      render(state);
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === "p") {
      event.preventDefault();
      window.print();
      return;
    }
    if (event.shiftKey && event.key === "F12") {
      event.preventDefault();
      setStatus(state, "Shift+F12 Cancel applied.");
      saveState(state);
      render(state);
    }
  });
}

const initialState = loadState();
render(initialState);
applyHotkeys();
