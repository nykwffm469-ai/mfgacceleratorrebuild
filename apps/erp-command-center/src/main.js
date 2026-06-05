import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "erp-command-center";
const modules = [
  { id: "orders", label: "Order Mgmt" },
  { id: "inventory", label: "Inventory" },
  { id: "procure", label: "Procure" },
  { id: "finance", label: "Finance" },
  { id: "exceptions", label: "Exceptions" },
  { id: "fulfillment", label: "Fulfillment" },
  { id: "planning", label: "Planning" },
  { id: "audit", label: "Audit" }
];

const columns = {
  orders: ["orderNo", "customer", "plant", "value", "status"],
  inventory: ["material", "storageLoc", "onHand", "planner", "status"],
  procure: ["poNo", "vendor", "buyer", "value", "status"],
  finance: ["docNo", "companyCode", "period", "owner", "status"],
  exceptions: ["exceptionId", "domain", "reason", "assignee", "status"],
  fulfillment: ["deliveryId", "orderNo", "warehouse", "eta", "status"],
  planning: ["planId", "material", "plant", "exception", "status"],
  audit: ["auditId", "entity", "action", "user", "status"]
};

const palette = {
  "--legacy-bg": "#d6ddd6",
  "--legacy-panel": "#eef4ee",
  "--legacy-nav": "#c7d3c7",
  "--legacy-grid-head": "#cedccb",
  "--legacy-active": "#3c6f3a"
};

let activeModule = modules[0].id;
let selectedRowIndex = -1;
let sortAsc = true;
let activeModal = "";

ensureSeed(namespace, () => ({
  orders: [{ orderNo: "SO-8802", customer: "Apex Parts", plant: "P01", value: "128000", status: "Released" }],
  inventory: [{ material: "MAT-771", storageLoc: "A1", onHand: "420", planner: "MPS", status: "Healthy" }],
  procure: [{ poNo: "PO-6611", vendor: "Metro Metals", buyer: "Sourcing", value: "74000", status: "Open" }],
  finance: [{ docNo: "FI-5002", companyCode: "1000", period: "2010-08", owner: "Controller", status: "Posted" }],
  exceptions: [{ exceptionId: "EX-ERP-5", domain: "Procure", reason: "GR/IR mismatch", assignee: "AP", status: "Open" }],
  fulfillment: [{ deliveryId: "DLV-4001", orderNo: "SO-8802", warehouse: "WH-CHI-1", eta: "2010-08-12", status: "Pending Allocation" }],
  planning: [{ planId: "MRP-88", material: "MAT-771", plant: "P01", exception: "Shortage 120", status: "MRP exception indicator" }],
  audit: [{ auditId: "AUD-776", entity: "SO-8802", action: "Allocation retry", user: "Ops Planner", status: "Logged" }]
}));

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function toNumber(value) {
  const parsed = Number.parseFloat(String(value || "0").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortedRows(data, moduleColumns) {
  const ordered = [...data[activeModule]].sort((a, b) => {
    const left = String(a[moduleColumns[0]] || "");
    const right = String(b[moduleColumns[0]] || "");
    return sortAsc ? left.localeCompare(right) : right.localeCompare(left);
  });
  return ordered.map((row) => moduleColumns.map((key) => row[key]));
}

function renderWidgets(data) {
  const orderValue = data.orders.reduce((acc, item) => acc + toNumber(item.value), 0);
  const poValue = data.procure.reduce((acc, item) => acc + toNumber(item.value), 0);
  const shortageCount = data.planning.filter((item) => String(item.exception).toLowerCase().includes("shortage")).length;
  const exceptionCount = data.exceptions.length;
  const frictionIndex = Math.round(shortageCount * 14 + exceptionCount * 12 + data.fulfillment.length * 5);
  return `
    <div style="display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:6px;margin-bottom:8px;">
      <div class="legacy-pill">Open Order Value: ${orderValue.toLocaleString()}</div>
      <div class="legacy-pill">Open PO Value: ${poValue.toLocaleString()}</div>
      <div class="legacy-pill">MRP Shortages: ${shortageCount}</div>
      <div class="legacy-pill">Exceptions: ${exceptionCount}</div>
      <div class="legacy-pill">Cockpit Friction Index: ${frictionIndex}</div>
    </div>
    <div class="legacy-alert-list">
      <span class="legacy-alert-item">SAP RFC timeout detected</span>
      <span class="legacy-alert-item">inventory allocation conflict</span>
      <span class="legacy-alert-item">purchase order blocked</span>
      <span class="legacy-alert-item">cross-plant transfer pending</span>
      <span class="legacy-alert-item">finance posting validation hold</span>
    </div>
  `;
}

function renderDomainPanel() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="border:1px solid #8b97a4;background:#f3f7f3;padding:6px;">
        <strong>ERP Cockpit Operations</strong>
        <div style="margin-top:4px;">Company code / plant / material tracking across O2C and P2P.</div>
        <div>Blocked order monitoring and procurement approval queue.</div>
        <div>Cross-plant transfer and release strip for fulfillment teams.</div>
      </div>
      <div style="border:1px solid #8b97a4;background:#f3f7f3;padding:6px;">
        <strong>RPA Candidate Flows</strong>
        <div style="margin-top:4px;">PO creation and SAP screen navigation automation.</div>
        <div>Invoice extraction bots and exception logging loops.</div>
        <div>Allocation notices and blocked order triage workflows.</div>
      </div>
    </div>
  `;
}

function modalBody(data) {
  if (activeModal === "audit") {
    return data.audit.map((item) => `<div>${item.auditId} | ${item.entity} | ${item.action}</div>`).join("");
  }
  if (activeModal === "retry") {
    return data.exceptions.map((item) => `<div>${item.exceptionId} -> ${item.reason} | retry prepared</div>`).join("");
  }
  if (activeModal === "approval") {
    return `<div>Supervisor review queue for procurement holds and finance exceptions.</div><div>Pending count: ${data.exceptions.length}</div>`;
  }
  if (activeModal === "export") {
    return "<div>Cockpit packet ready: print preview, XLS export, and PDF posting report.</div>";
  }
  return "";
}

function renderModal(data) {
  if (!activeModal) {
    return "";
  }
  const titleMap = {
    audit: "Audit History",
    retry: "Retry Failed Records",
    approval: "Supervisor Approval Queue",
    export: "Print/Export Preview"
  };
  return `
    <div class="legacy-command-modal">
      <div class="legacy-command-dialog">
        <div class="legacy-command-head">${titleMap[activeModal]}</div>
        <div class="legacy-command-sub">${modalBody(data)}</div>
        <div class="legacy-command-footer"><button class="legacy-btn" type="button" data-local-action="close-modal">Close</button></div>
      </div>
    </div>
  `;
}

function render() {
  applyPalette();
  const data = loadSeed(namespace, () => ({}));
  const moduleColumns = columns[activeModule];
  const rows = sortedRows(data, moduleColumns);
  const grid = dataGrid(moduleColumns, rows);
  const formFields = moduleColumns.map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`).join("");

  const contentHtml =
    panel("ERP Cockpit Summary", renderWidgets(data)) +
    panel("ERP Workspace", grid) +
    panel("Cross-Functional Operations Context", renderDomainPanel()) +
    panel(
      "Workflow Console",
      `<div style="display:flex;gap:4px;flex-wrap:wrap;"><button class="legacy-btn" type="button" data-local-action="open-audit">Audit History</button><button class="legacy-btn" type="button" data-local-action="open-retry">Retry Failed</button><button class="legacy-btn" type="button" data-local-action="open-approval">Supervisor Review</button><button class="legacy-btn" type="button" data-local-action="open-export">Print/Export</button></div>`
    ) +
    panel(
      "Entry Form",
      `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px;display:flex;gap:4px;"><button class="legacy-btn" type="submit">Save</button><button class="legacy-btn" type="button" data-local-action="edit-selected">Edit Selected</button><button class="legacy-btn" type="button" data-local-action="toggle-sort">Toggle Sort</button></div></form>`
    ) +
    renderModal(data);

  document.getElementById("app").innerHTML = appShell({
    title: "ERP Command Center 2010",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: "System: ERP-CMD-CTR | Queue: CROSS-FUNCTION | Operator: Ops Planner",
    appDescription:
      "Legacy ERP cockpit simulation spanning order, inventory, procurement, finance, planning, fulfillment, and exception management with audit-heavy controls.",
    contentHtml
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      selectedRowIndex = -1;
      render();
    });
  });

  document.querySelectorAll(".legacy-grid tbody tr").forEach((rowEl, index) => {
    if (index === selectedRowIndex) {
      rowEl.classList.add("legacy-row-selected");
    }
    rowEl.addEventListener("click", () => {
      selectedRowIndex = index;
      render();
    });
  });

  document.querySelectorAll("[data-local-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-local-action");
      const latest = loadSeed(namespace, () => ({}));
      if (action === "toggle-sort") {
        sortAsc = !sortAsc;
      } else if (action === "edit-selected") {
        const ordered = [...latest[activeModule]].sort((a, b) => {
          const left = String(a[moduleColumns[0]] || "");
          const right = String(b[moduleColumns[0]] || "");
          return sortAsc ? left.localeCompare(right) : right.localeCompare(left);
        });
        const selected = ordered[selectedRowIndex];
        if (selected) {
          const form = document.getElementById("entry-form");
          moduleColumns.forEach((field) => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
              input.value = selected[field] || "";
            }
          });
          return;
        }
      } else if (action === "open-audit") {
        activeModal = "audit";
      } else if (action === "open-retry") {
        activeModal = "retry";
      } else if (action === "open-approval") {
        activeModal = "approval";
      } else if (action === "open-export") {
        activeModal = "export";
      } else if (action === "close-modal") {
        activeModal = "";
      }
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
          first.status = String(first.status).includes("Open") ? "Closed" : "Open";
        }
        saveSeed(namespace, latest);
      }
      if (action === "delete-last" && latest[activeModule].length > 0) {
        latest[activeModule].pop();
        saveSeed(namespace, latest);
      }
      if (action === "seed-reset") {
        localStorage.removeItem(`legacy-demo:${namespace}`);
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