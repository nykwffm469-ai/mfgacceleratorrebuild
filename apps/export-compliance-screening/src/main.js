import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "export-compliance-screening";
const modules = [
  { id: "screening", label: "Screening Queue" },
  { id: "matches", label: "Potential Matches" },
  { id: "retries", label: "Retry Queue" },
  { id: "approvals", label: "Approvals" },
  { id: "release", label: "Release" },
  { id: "audit", label: "Audit" },
  { id: "escalations", label: "Escalations" },
  { id: "holds", label: "Holds" }
];

const columns = {
  screening: ["screenId", "customer", "orderNo", "score", "status"],
  matches: ["matchId", "screenId", "listName", "analyst", "status"],
  retries: ["retryId", "screenId", "attempt", "nextRun", "status"],
  approvals: ["approvalId", "screenId", "approver", "dueDate", "status"],
  release: ["releaseId", "orderNo", "releasedBy", "releaseOn", "status"],
  audit: ["auditId", "screenId", "event", "reviewer", "status"],
  escalations: ["escalationId", "screenId", "severity", "owner", "status"],
  holds: ["holdId", "orderNo", "reason", "expiresOn", "status"]
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
  screening: [{ screenId: "SC-540", customer: "Arbor Components", orderNo: "SO-92181", score: "0.71", status: "Hold" }],
  matches: [{ matchId: "M-49", screenId: "SC-540", listName: "Denied Party", analyst: "Trade Ops", status: "Review" }],
  retries: [{ retryId: "RT-27", screenId: "SC-533", attempt: "3", nextRun: "2011-09-19 01:00", status: "Retry failed rows" }],
  approvals: [{ approvalId: "APR-95", screenId: "SC-540", approver: "Compliance Mgr", dueDate: "2011-09-19", status: "Workflow pending approval" }],
  release: [{ releaseId: "RL-12", orderNo: "SO-91820", releasedBy: "Compliance", releaseOn: "2011-09-17", status: "Released" }],
  audit: [{ auditId: "AUD-221", screenId: "SC-540", event: "Potential match disposition", reviewer: "Legal Ops", status: "Logged" }],
  escalations: [{ escalationId: "ESC-90", screenId: "SC-540", severity: "High", owner: "Compliance Mgr", status: "legal review pending" }],
  holds: [{ holdId: "H-31", orderNo: "SO-92181", reason: "OFAC match suspected", expiresOn: "2011-09-22", status: "shipment hold active" }]
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
  const highRisk = data.escalations.filter((item) => item.severity === "High").length;
  const holdCount = data.holds.length;
  const retryCount = data.retries.length;
  const avgScore = data.screening.length ? data.screening.reduce((acc, item) => acc + toNumber(item.score), 0) / data.screening.length : 0;
  const complianceRisk = Math.round(avgScore * 100 + holdCount * 12 + highRisk * 20 + retryCount * 8);
  return `
    <div style="display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:6px;margin-bottom:8px;">
      <div class="legacy-pill">High Risk Escalations: ${highRisk}</div>
      <div class="legacy-pill">Shipment Holds: ${holdCount}</div>
      <div class="legacy-pill">Retry Queue: ${retryCount}</div>
      <div class="legacy-pill">Avg Match Score: ${avgScore.toFixed(2)}</div>
      <div class="legacy-pill">Compliance Risk Index: ${complianceRisk}</div>
    </div>
    <div class="legacy-alert-list">
      <span class="legacy-alert-item">OFAC match suspected</span>
      <span class="legacy-alert-item">legal review pending</span>
      <span class="legacy-alert-item">shipment hold active</span>
      <span class="legacy-alert-item">list synchronization failed</span>
      <span class="legacy-alert-item">retry screening queued</span>
    </div>
  `;
}

function renderDomainPanel() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="border:1px solid #8b97a4;background:#f3f7f3;padding:6px;">
        <strong>Trade Compliance Routing</strong>
        <div style="margin-top:4px;">Denied-party fuzzy matching with score thresholds.</div>
        <div>Legal approval routing and shipment hold workflow controls.</div>
        <div>False positive disposition and release approval history.</div>
      </div>
      <div style="border:1px solid #8b97a4;background:#f3f7f3;padding:6px;">
        <strong>RPA Candidate Flows</strong>
        <div style="margin-top:4px;">Shipment ingestion and screening rerun automation.</div>
        <div>Legal packet generation and release notice creation.</div>
        <div>Compliance archive export and retry queue processing.</div>
      </div>
    </div>
  `;
}

function modalBody(data) {
  if (activeModal === "audit") {
    return data.audit.map((item) => `<div>${item.auditId} | ${item.screenId} | ${item.event}</div>`).join("");
  }
  if (activeModal === "retry") {
    return data.retries.map((item) => `<div>${item.retryId} | attempt ${item.attempt} | ${item.status}</div>`).join("");
  }
  if (activeModal === "approval") {
    return data.approvals.map((item) => `<div>${item.approvalId} | ${item.screenId} | ${item.status}</div>`).join("");
  }
  if (activeModal === "export") {
    return "<div>Compliance evidence packet ready for print preview, Excel, and PDF output.</div>";
  }
  return "";
}

function renderModal(data) {
  if (!activeModal) {
    return "";
  }
  const titleMap = {
    audit: "Audit History",
    retry: "Retry Failed Screenings",
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
    panel("Compliance Screening Summary", renderWidgets(data)) +
    panel("Screening Workspace", grid) +
    panel("Legal and Hold Context", renderDomainPanel()) +
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
    title: "Export Compliance Screening 2011",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: "System: TRADE-COMPLIANCE | Queue: LEGAL-REVIEW | Operator: Legal Ops",
    appDescription:
      "Legacy denied-party and export screening operations platform with legal approvals, hold/release workflows, retry queues, and compliance audit history.",
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