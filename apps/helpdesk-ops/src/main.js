import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "helpdesk-ops";
const modules = [
  { id: "incidents", label: "Incidents" },
  { id: "requests", label: "Service Requests" },
  { id: "problem", label: "Problem Mgmt" },
  { id: "change", label: "Change Mgmt" },
  { id: "cmdb", label: "CMDB" },
  { id: "assignment", label: "Assignment Groups" },
  { id: "major", label: "Major Incident" },
  { id: "knowledge", label: "Knowledge" },
  { id: "sla", label: "SLA Desk" },
  { id: "cab", label: "CAB Queue" }
];

const columns = {
  incidents: ["ticketId", "service", "priority", "assignmentGroup", "sla", "status"],
  requests: ["requestId", "requestor", "item", "approvalPath", "target", "status"],
  problem: ["problemId", "service", "knownError", "owner", "impact", "status"],
  change: ["changeId", "type", "window", "risk", "owner", "status"],
  cmdb: ["ciId", "ciName", "class", "owner", "deps", "status"],
  assignment: ["groupId", "name", "backlog", "lead", "status"],
  major: ["miId", "bridge", "commander", "affected", "timer", "status"],
  knowledge: ["articleId", "title", "category", "author", "reviewDate", "status"],
  sla: ["slaId", "metric", "target", "breachCount", "owner", "status"],
  cab: ["cabId", "recordType", "recordRef", "ageHours", "approver", "status"]
};

const palette = {
  "--legacy-bg": "#d6dbe1",
  "--legacy-panel": "#edf2f7",
  "--legacy-nav": "#c4cfdb",
  "--legacy-grid-head": "#d9cfb8",
  "--legacy-active": "#2f567f"
};

let activeModule = modules[0].id;
let selectedRowIndex = -1;
let sortAsc = true;
let activeModal = "";

ensureSeed(namespace, () => ({
  incidents: [{ ticketId: "INC-1011", service: "Email", priority: "P1", assignmentGroup: "Messaging", sla: "00:15", status: "In Progress" }],
  requests: [{ requestId: "SR-1402", requestor: "M. Lee", item: "VPN Access", approvalPath: "Manager->Security", target: "24h", status: "Pending Approval" }],
  problem: [{ problemId: "PRB-29", service: "Identity", knownError: "KE-12", owner: "Infra", impact: "HR + Finance", status: "Investigating" }],
  change: [{ changeId: "CHG-221", type: "Normal", window: "Sun 01:00", risk: "Medium", owner: "Change Board", status: "Scheduled" }],
  cmdb: [{ ciId: "CI-441", ciName: "AD-DC-01", class: "Domain Controller", owner: "Platform", deps: "18", status: "Operational" }],
  assignment: [{ groupId: "GRP-03", name: "Service Desk L2", backlog: "26", lead: "Harper L.", status: "Backlog High" }],
  major: [{ miId: "MI-11", bridge: "Bridge-2", commander: "Ops Duty", affected: "Billing", timer: "00:48", status: "War Room Active" }],
  knowledge: [{ articleId: "KB-100", title: "Resetting Outlook Profile", category: "Messaging", author: "Service Desk", reviewDate: "2012-05-19", status: "Published" }],
  sla: [{ slaId: "SLA-7", metric: "P1 Response", target: "00:15", breachCount: "2", owner: "NOC", status: "At Risk" }],
  cab: [{ cabId: "CAB-91", recordType: "Change", recordRef: "CHG-221", ageHours: "11", approver: "CAB Board", status: "Awaiting Review" }]
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

function renderSummary(data) {
  const openIncidents = data.incidents.filter((item) => !String(item.status).toLowerCase().includes("closed")).length;
  const majorOpen = data.major.length;
  const cabPending = data.cab.filter((item) => String(item.status).toLowerCase().includes("awaiting")).length;
  const breaches = data.sla.reduce((acc, item) => acc + toNumber(item.breachCount), 0);
  const pressure = openIncidents * 7 + majorOpen * 15 + cabPending * 8 + breaches * 4;
  return `
    <div style="display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:6px;margin-bottom:8px;">
      <div class="legacy-pill">Open Incidents: ${openIncidents}</div>
      <div class="legacy-pill">Major Incidents: ${majorOpen}</div>
      <div class="legacy-pill">CAB Pending: ${cabPending}</div>
      <div class="legacy-pill">SLA Breaches: ${breaches}</div>
      <div class="legacy-pill">Ops Pressure Index: ${pressure}</div>
    </div>
    <div class="legacy-alert-list">
      <span class="legacy-alert-item">SLA breach risk elevated</span>
      <span class="legacy-alert-item">major incident bridge running</span>
      <span class="legacy-alert-item">change collision check required</span>
      <span class="legacy-alert-item">CMDB impact map stale</span>
      <span class="legacy-alert-item">approval workflow pending</span>
    </div>
  `;
}

function renderContext() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="border:1px solid #8b97a4;background:#f6f8fb;padding:6px;">
        <strong>Legacy ITSM Stack (2012)</strong>
        <div style="margin-top:4px;">Incident, Request, Problem, and Change workflows with CAB gates.</div>
        <div>CMDB-backed impact analysis and assignment group workload balancing.</div>
        <div>Service catalog fulfillment and knowledge lifecycle management.</div>
      </div>
      <div style="border:1px solid #8b97a4;background:#f6f8fb;padding:6px;">
        <strong>ServiceNow / Salesforce Service Cloud Pattern</strong>
        <div style="margin-top:4px;">Major incident command bridge and war-room communications.</div>
        <div>SLA monitor with breach and escalation counters.</div>
        <div>Approval-heavy, queue-driven operations with audit traceability.</div>
      </div>
    </div>
  `;
}

function modalBody(data) {
  if (activeModal === "audit") {
    return data.cab.map((item) => `<div>${item.cabId} | ${item.recordType} ${item.recordRef} | ${item.status}</div>`).join("");
  }
  if (activeModal === "retry") {
    return data.incidents.map((item) => `<div>${item.ticketId} | ${item.assignmentGroup} | retry queued</div>`).join("");
  }
  if (activeModal === "approval") {
    return data.cab.map((item) => `<div>${item.cabId} | ${item.approver} | ${item.ageHours}h</div>`).join("");
  }
  if (activeModal === "export") {
    return "<div>Helpdesk ITSM packet prepared: Incident queue, CAB queue, SLA exceptions, and major incident timeline.</div>";
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
    panel("Helpdesk ITSM Summary", renderSummary(data)) +
    panel("ITSM Queue Workspace", grid) +
    panel("Platform Context", renderContext()) +
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
    title: "Helpdesk Operations Center 2012",
    identityKey: "itsm-blue-shell",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: "System: HELPDESK-ITSM | Queue: INCIDENT+CAB | Operator: Service Desk Manager",
    appDescription:
      "Helpdesk Operations Center 2012 is a legacy full ITSM platform modeled after ServiceNow and Salesforce Service Cloud-era operations, including incident, request, problem, change, CMDB, CAB approvals, SLA controls, and major incident workflows.",
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