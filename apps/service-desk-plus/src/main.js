import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "service-desk-plus";
const modules = [
  { id: "incidents", label: "Incidents" },
  { id: "requests", label: "Service Requests" },
  { id: "problems", label: "Problems" },
  { id: "changes", label: "Changes" },
  { id: "cmdb", label: "CMDB" },
  { id: "assets", label: "Assets" },
  { id: "catalog", label: "Catalog" },
  { id: "knowledge", label: "Knowledge" },
  { id: "major", label: "Major Incidents" },
  { id: "release", label: "Release" },
  { id: "approvals", label: "CAB Approvals" },
  { id: "sla", label: "SLA Monitor" }
];

const columns = {
  incidents: ["incidentId", "service", "priority", "assignmentGroup", "sla", "status"],
  requests: ["requestId", "requestor", "catalogItem", "fulfillmentTeam", "target", "status"],
  problems: ["problemId", "service", "rootCause", "knownError", "owner", "status"],
  changes: ["changeId", "type", "window", "risk", "cabRef", "status"],
  cmdb: ["ciId", "ciName", "class", "owner", "relationshipCount", "status"],
  assets: ["assetId", "assetType", "serialNo", "custodian", "lifecycle", "status"],
  catalog: ["itemId", "itemName", "category", "approvalPath", "sla", "status"],
  knowledge: ["articleId", "title", "category", "author", "lastReview", "status"],
  major: ["miId", "incidentId", "bridge", "commander", "impact", "status"],
  release: ["releaseId", "train", "environment", "goNoGo", "owner", "status"],
  approvals: ["approvalId", "recordType", "recordRef", "approver", "ageHours", "status"],
  sla: ["slaId", "metric", "target", "breached", "owner", "status"]
};

const palette = {
  "--legacy-bg": "#d5d9df",
  "--legacy-panel": "#edf1f6",
  "--legacy-nav": "#c6cfdb",
  "--legacy-grid-head": "#d9cfb8",
  "--legacy-active": "#31567e"
};

let activeModule = modules[0].id;
let selectedRowIndex = -1;
let sortAsc = true;
let activeModal = "";

ensureSeed(namespace, () => ({
  incidents: [{ incidentId: "INC-420", service: "Exchange", priority: "P2", assignmentGroup: "Messaging Ops", sla: "00:45", status: "In Progress" }],
  requests: [{ requestId: "REQ-812", requestor: "M. Lee", catalogItem: "VPN Access", fulfillmentTeam: "Identity Ops", target: "24h", status: "Pending Approval" }],
  problems: [{ problemId: "PRB-10", service: "Network", rootCause: "Core router failover", knownError: "KE-77", owner: "Infra", status: "Investigating" }],
  changes: [{ changeId: "CHG-58", type: "Normal", window: "Sat 02:00", risk: "Medium", cabRef: "CAB-114", status: "Scheduled" }],
  cmdb: [{ ciId: "CI-9901", ciName: "EXCH-DB-01", class: "Mail DB", owner: "Messaging Ops", relationshipCount: "12", status: "Operational" }],
  assets: [{ assetId: "AST-440", assetType: "Laptop", serialNo: "SN-774411", custodian: "J. Park", lifecycle: "Active", status: "In Service" }],
  catalog: [{ itemId: "CAT-22", itemName: "New Hire Access Bundle", category: "Identity", approvalPath: "Manager->Security", sla: "8h", status: "Published" }],
  knowledge: [{ articleId: "KB-91", title: "Reset MFA with Legacy Portal", category: "Identity", author: "Service Desk", lastReview: "2012-06-04", status: "Published" }],
  major: [{ miId: "MI-07", incidentId: "INC-420", bridge: "Bridge-1", commander: "Ops Lead", impact: "Finance + HR", status: "War Room Active" }],
  release: [{ releaseId: "REL-12", train: "June-Train-A", environment: "Prod", goNoGo: "Pending", owner: "Release Mgr", status: "Ready for CAB" }],
  approvals: [{ approvalId: "APR-334", recordType: "Change", recordRef: "CHG-58", approver: "CAB Board", ageHours: "17", status: "Awaiting Review" }],
  sla: [{ slaId: "SLA-7", metric: "P1 Response", target: "00:15", breached: "2", owner: "NOC", status: "At Risk" }]
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

function renderItsmWidgets(data) {
  const openIncidents = data.incidents.filter((item) => !String(item.status).toLowerCase().includes("closed")).length;
  const pendingChanges = data.changes.filter((item) => String(item.status).toLowerCase().includes("scheduled") || String(item.status).toLowerCase().includes("ready")).length;
  const pendingApprovals = data.approvals.filter((item) => String(item.status).toLowerCase().includes("awaiting")).length;
  const breached = data.sla.reduce((acc, item) => acc + toNumber(item.breached), 0);
  const operationalRisk = openIncidents * 8 + pendingChanges * 10 + pendingApprovals * 6 + breached * 5;
  return `
    <div style="display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:6px;margin-bottom:8px;">
      <div class="legacy-pill">Open Incidents: ${openIncidents}</div>
      <div class="legacy-pill">Pending Changes: ${pendingChanges}</div>
      <div class="legacy-pill">CAB Approvals: ${pendingApprovals}</div>
      <div class="legacy-pill">SLA Breaches: ${breached}</div>
      <div class="legacy-pill">ITSM Risk Index: ${operationalRisk}</div>
    </div>
    <div class="legacy-alert-list">
      <span class="legacy-alert-item">major incident bridge active</span>
      <span class="legacy-alert-item">change collision risk detected</span>
      <span class="legacy-alert-item">CMDB relationship drift warning</span>
      <span class="legacy-alert-item">SLA breach threshold exceeded</span>
      <span class="legacy-alert-item">CAB review queue backlog</span>
    </div>
  `;
}

function renderItsmPanel() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="border:1px solid #8b97a4;background:#f6f8fb;padding:6px;">
        <strong>2012 ITSM Toolset</strong>
        <div style="margin-top:4px;">Incident -> Problem -> Change linkage with known error tracking.</div>
        <div>CMDB CI relationship visibility for impact analysis and approvals.</div>
        <div>Service Catalog request workflows with assignment group routing.</div>
      </div>
      <div style="border:1px solid #8b97a4;background:#f6f8fb;padding:6px;">
        <strong>ServiceNow / Salesforce-era Patterns</strong>
        <div style="margin-top:4px;">CAB queue, release train readiness, and go/no-go controls.</div>
        <div>Major incident war-room timeline with communications bridge tags.</div>
        <div>Knowledge lifecycle and SLA policy reporting for audit readiness.</div>
      </div>
    </div>
  `;
}

function modalBody(data) {
  if (activeModal === "audit") {
    return data.approvals.map((item) => `<div>${item.approvalId} | ${item.recordType} ${item.recordRef} | ${item.status}</div>`).join("");
  }
  if (activeModal === "retry") {
    return data.incidents.map((item) => `<div>${item.incidentId} -> workflow retry queued for ${item.assignmentGroup}</div>`).join("");
  }
  if (activeModal === "approval") {
    return data.approvals.map((item) => `<div>${item.approvalId} | ${item.approver} | age ${item.ageHours}h</div>`).join("");
  }
  if (activeModal === "export") {
    return "<div>ITSM pack generated: Incident backlog, CAB board, SLA exceptions, and release status.</div>";
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
    approval: "Supervisor/CAB Review",
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
    panel("ITSM Executive Snapshot", renderItsmWidgets(data)) +
    panel("ITSM Operations Workspace", grid) +
    panel("Platform Context", renderItsmPanel()) +
    panel(
      "Workflow Console",
      `<div style="display:flex;gap:4px;flex-wrap:wrap;"><button class="legacy-btn" type="button" data-local-action="open-audit">Audit History</button><button class="legacy-btn" type="button" data-local-action="open-retry">Retry Failed</button><button class="legacy-btn" type="button" data-local-action="open-approval">CAB/Supervisor Review</button><button class="legacy-btn" type="button" data-local-action="open-export">Print/Export</button></div>`
    ) +
    panel(
      "Record Editor",
      `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px;display:flex;gap:4px;"><button class="legacy-btn" type="submit">Save</button><button class="legacy-btn" type="button" data-local-action="edit-selected">Edit Selected</button><button class="legacy-btn" type="button" data-local-action="toggle-sort">Toggle Sort</button></div></form>`
    ) +
    renderModal(data);

  document.getElementById("app").innerHTML = appShell({
    title: "Service Desk Plus 2012",
    identityKey: "itsm-blue-shell",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: "System: ITSM-CORE-2012 | Queue: CAB + INCIDENT | Operator: Service Manager",
    appDescription:
      "Service Desk Plus 2012 is a full legacy ITSM platform inspired by ServiceNow and Salesforce-era service operations tooling, including incidents, problems, changes, CMDB, catalog, knowledge, major incident control, CAB approvals, release governance, and SLA monitoring.",
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