import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "dock-appointment-scheduler";
const modules = [
  { id: "appointments", label: "Appointments" },
  { id: "checkin", label: "Check-in" },
  { id: "staging", label: "Staging" },
  { id: "exceptions", label: "Exceptions" },
  { id: "audit", label: "Audit" },
  { id: "dockboard", label: "Dock Board" },
  { id: "carriers", label: "Carriers" },
  { id: "dispatch", label: "Dispatch" }
];

const columns = {
  appointments: ["appointmentId", "carrier", "dock", "window", "status"],
  checkin: ["checkinId", "appointmentId", "trailer", "guard", "status"],
  staging: ["stagingId", "trailer", "zone", "loader", "status"],
  exceptions: ["exceptionId", "appointmentId", "reason", "owner", "status"],
  audit: ["auditId", "event", "user", "eventTime", "status"],
  dockboard: ["doorId", "slot", "trailer", "turnTime", "status"],
  carriers: ["scac", "carrier", "dispatchRef", "contact", "status"],
  dispatch: ["dispatchId", "appointmentId", "priority", "owner", "status"]
};

const palette = {
  "--legacy-bg": "#d7dce2",
  "--legacy-panel": "#eef2f7",
  "--legacy-nav": "#c5ceda",
  "--legacy-grid-head": "#d9cfbb",
  "--legacy-active": "#3f5f84"
};

let activeModule = modules[0].id;
let selectedRowIndex = -1;
let sortAsc = true;
let activeModal = "";

ensureSeed(namespace, () => ({
  appointments: [{ appointmentId: "DK-301", carrier: "RoadEx", dock: "D04", window: "08:00", status: "Scheduled" }],
  checkin: [{ checkinId: "CI-81", appointmentId: "DK-301", trailer: "TR-2209", guard: "Gate A", status: "Arrived" }],
  staging: [{ stagingId: "ST-62", trailer: "TR-2209", zone: "Yard 2", loader: "M. Baird", status: "Queued" }],
  exceptions: [{ exceptionId: "EX-15", appointmentId: "DK-298", reason: "Late arrival", owner: "Dock Ops", status: "Review" }],
  audit: [{ auditId: "AU-710", event: "Slot reassigned", user: "DISPATCH", eventTime: "2009-07-09 07:14", status: "Logged" }],
  dockboard: [{ doorId: "D04", slot: "08:00-08:30", trailer: "TR-2209", turnTime: "38m", status: "Assigned" }],
  carriers: [{ scac: "RDEX", carrier: "RoadEx", dispatchRef: "DSP-2271", contact: "Gate Desk", status: "Active" }],
  dispatch: [{ dispatchId: "DSP-2271", appointmentId: "DK-301", priority: "High", owner: "Ops Planner", status: "yard congestion warning" }]
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
  const arrivals = data.checkin.length;
  const waiting = data.staging.length;
  const exceptions = data.exceptions.length;
  const avgTurn = data.dockboard.length ? data.dockboard.reduce((acc, item) => acc + toNumber(item.turnTime), 0) / data.dockboard.length : 0;
  const congestion = Math.round(waiting * 12 + exceptions * 15 + avgTurn);
  return `
    <div style="display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:6px;margin-bottom:8px;">
      <div class="legacy-pill">Arrived Trailers: ${arrivals}</div>
      <div class="legacy-pill">Yard Waiting: ${waiting}</div>
      <div class="legacy-pill">Exceptions: ${exceptions}</div>
      <div class="legacy-pill">Avg Turn Time: ${avgTurn.toFixed(0)}m</div>
      <div class="legacy-pill">Congestion Index: ${congestion}</div>
    </div>
    <div class="legacy-alert-list">
      <span class="legacy-alert-item">dock conflict detected</span>
      <span class="legacy-alert-item">yard congestion warning</span>
      <span class="legacy-alert-item">detention timer elevated</span>
      <span class="legacy-alert-item">gate queue triage active</span>
      <span class="legacy-alert-item">dispatch escalation pending</span>
    </div>
  `;
}

function renderDomainPanel() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="border:1px solid #8b97a4;background:#f6f8fb;padding:6px;">
        <strong>Dock Board Operations</strong>
        <div style="margin-top:4px;">Inbound and outbound windows separated by lane.</div>
        <div>SCAC reference, trailer tracking, and gate light indicators.</div>
        <div>No-show and late-arrival exception handling queue active.</div>
      </div>
      <div style="border:1px solid #8b97a4;background:#f6f8fb;padding:6px;">
        <strong>RPA Candidate Flows</strong>
        <div style="margin-top:4px;">Carrier email ingestion and appointment auto-creation.</div>
        <div>Delay notifications and dispatch escalation routing.</div>
        <div>Gate kiosk automation and reminder generation.</div>
      </div>
    </div>
  `;
}

function modalBody(data) {
  if (activeModal === "audit") {
    return data.audit.map((item) => `<div>${item.auditId} | ${item.event} | ${item.eventTime}</div>`).join("");
  }
  if (activeModal === "retry") {
    return data.exceptions.map((item) => `<div>${item.exceptionId} -> ${item.reason} | retry scheduled</div>`).join("");
  }
  if (activeModal === "approval") {
    return `<div>Supervisor review queue for dock conflicts and no-show exceptions.</div><div>Pending approvals: ${data.exceptions.length}</div>`;
  }
  if (activeModal === "export") {
    return "<div>Dock board print packet and carrier schedule export prepared.</div>";
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
    panel("Dock Scheduling Summary", renderWidgets(data)) +
    panel("Dock Workspace", grid) +
    panel("Gate and Yard Context", renderDomainPanel()) +
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
    title: "Dock Appointment Scheduler 2009",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: "System: DOCK-OPS | Queue: GATE-DISPATCH | Operator: Ops Planner",
    appDescription:
      "Legacy logistics dock scheduling platform with gate check-in, staging queues, detention monitoring, conflict handling, and dispatch escalation workflows.",
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