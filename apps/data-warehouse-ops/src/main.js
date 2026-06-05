import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "data-warehouse-ops";
const modules = [
  { id: "warehouses", label: "Warehouses" },
  { id: "jobs", label: "Pipelines" },
  { id: "queries", label: "Query History" },
  { id: "loads", label: "Load Queue" },
  { id: "governance", label: "Governance" },
  { id: "compute", label: "Compute Pools" },
  { id: "etl", label: "ETL Jobs" },
  { id: "audit", label: "Audit" }
];

const columns = {
  warehouses: ["whId", "name", "size", "owner", "status"],
  jobs: ["jobId", "dataset", "schedule", "runtime", "status"],
  queries: ["queryId", "user", "elapsed", "costUnits", "status"],
  loads: ["loadId", "table", "source", "queuedOn", "status"],
  governance: ["policyId", "scope", "owner", "severity", "status"],
  compute: ["poolId", "nodes", "saturation", "owner", "status"],
  etl: ["runId", "pipeline", "duration", "retryCount", "status"],
  audit: ["auditId", "entity", "action", "actor", "status"]
};

const palette = {
  "--legacy-bg": "#d7dce1",
  "--legacy-panel": "#eef2f6",
  "--legacy-nav": "#c4ced8",
  "--legacy-grid-head": "#d8cfbd",
  "--legacy-active": "#4c6382"
};

let activeModule = modules[0].id;
let selectedRowIndex = -1;
let sortAsc = true;
let activeModal = "";

ensureSeed(namespace, () => ({
  warehouses: [{ whId: "WH-01", name: "ANALYTICS_XL", size: "XL", owner: "Data Eng", status: "Running" }],
  jobs: [{ jobId: "JOB-771", dataset: "sales_fact", schedule: "Hourly", runtime: "6m", status: "Success" }],
  queries: [{ queryId: "Q-5412", user: "analyst1", elapsed: "12s", costUnits: "3.1", status: "Complete" }],
  loads: [{ loadId: "LD-22", table: "customer_dim", source: "S3", queuedOn: "2012-05-03", status: "Queued" }],
  governance: [{ policyId: "GV-8", scope: "PII Masking", owner: "Data Gov", severity: "High", status: "Active" }],
  compute: [{ poolId: "CP-06", nodes: "12", saturation: "84%", owner: "Platform Ops", status: "Slow query threshold exceeded" }],
  etl: [{ runId: "ETL-9331", pipeline: "sales_fact_hourly", duration: "00:08:32", retryCount: "1", status: "Retry scheduled" }],
  audit: [{ auditId: "AU-231", entity: "PIPELINE", action: "Force Retry", actor: "Data Eng", status: "Logged" }]
}));

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function toNumber(value) {
  const cleaned = String(value || "0").replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);
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
  const queuedLoads = data.loads.length;
  const retryRuns = data.etl.reduce((acc, item) => acc + toNumber(item.retryCount), 0);
  const avgCost = data.queries.length ? data.queries.reduce((acc, item) => acc + toNumber(item.costUnits), 0) / data.queries.length : 0;
  const saturation = data.compute.length ? data.compute.reduce((acc, item) => acc + toNumber(item.saturation), 0) / data.compute.length : 0;
  const queuePressure = Math.round(queuedLoads * 8 + retryRuns * 12 + saturation * 0.5);

  return `
    <div style="display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:6px;margin-bottom:8px;">
      <div class="legacy-pill">Load Queue Depth: ${queuedLoads}</div>
      <div class="legacy-pill">ETL Retry Count: ${retryRuns}</div>
      <div class="legacy-pill">Avg Query Cost: ${avgCost.toFixed(2)}</div>
      <div class="legacy-pill">Compute Saturation: ${saturation.toFixed(0)}%</div>
      <div class="legacy-pill">Queue Pressure Index: ${queuePressure}</div>
    </div>
    <div class="legacy-alert-list">
      <span class="legacy-alert-item">dependency chain warning</span>
      <span class="legacy-alert-item">schema drift alert</span>
      <span class="legacy-alert-item">slow query threshold exceeded</span>
      <span class="legacy-alert-item">failed ETL retry queue active</span>
      <span class="legacy-alert-item">governance approval pending</span>
    </div>
  `;
}

function renderDomainPanel() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="border:1px solid #8b97a4;background:#f6f8fb;padding:6px;">
        <strong>Warehouse Operations</strong>
        <div style="margin-top:4px;">Auto-suspend/auto-resume state tracked per warehouse.</div>
        <div>Node allocation and pool saturation monitored every 5 minutes.</div>
        <div>Deadlock and partition imbalance warnings routed to queue processor.</div>
      </div>
      <div style="border:1px solid #8b97a4;background:#f6f8fb;padding:6px;">
        <strong>RPA Candidate Flows</strong>
        <div style="margin-top:4px;">Failed job retry automation and governance packet export.</div>
        <div>Daily status packet generation and query log extraction.</div>
        <div>Queue-based exception handling with supervisor approval checkpoints.</div>
      </div>
    </div>
  `;
}

function modalBody(data) {
  if (activeModal === "audit") {
    return data.audit.map((item) => `<div>${item.auditId} | ${item.entity} | ${item.action} | ${item.actor}</div>`).join("");
  }
  if (activeModal === "retry") {
    return data.etl.map((item) => `<div>${item.runId} -> retry ${item.retryCount} | ${item.status}</div>`).join("");
  }
  if (activeModal === "approval") {
    return `<div>Supervisor approvals: Governance policy exceptions awaiting release.</div><div>Pending items: ${data.governance.length}</div>`;
  }
  if (activeModal === "export") {
    return `<div>Export/Print packet queued for warehouse operations summary.</div><div>Formats: XLS, PDF, Print Preview.</div>`;
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
    panel("Data Platform Summary", renderWidgets(data)) +
    panel("Warehouse Workspace", grid) +
    panel("Operations Context", renderDomainPanel()) +
    panel(
      "Workflow Console",
      `<div style="display:flex;gap:4px;flex-wrap:wrap;"><button class="legacy-btn" type="button" data-local-action="open-audit">Audit History</button><button class="legacy-btn" type="button" data-local-action="open-retry">Retry Failed</button><button class="legacy-btn" type="button" data-local-action="open-approval">Supervisor Review</button><button class="legacy-btn" type="button" data-local-action="open-export">Print/Export</button></div>`
    ) +
    panel(
      "Entry Form",
      `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button><button class="legacy-btn" type="button" data-local-action="edit-selected">Edit Selected</button><button class="legacy-btn" type="button" data-local-action="toggle-sort">Toggle Sort</button></div></form>`
    ) +
    renderModal(data);

  document.getElementById("app").innerHTML = appShell({
    title: "Data Warehouse Ops 2012",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: "System: DW-OPS | Queue: ETL-RETRY | Operator: Data Eng | Host sync latency: 18s",
    appDescription:
      "Legacy data platform admin console with queue-driven ETL retries, warehouse monitoring, governance checks, and audit-heavy operations workflows.",
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