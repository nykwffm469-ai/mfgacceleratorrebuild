import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "field-dispatch";
const modules = [{ id: "board", label: "Dispatch Board" }, { id: "techs", label: "Technicians" }, { id: "routes", label: "Routes" }, { id: "calls", label: "Service Calls" }, { id: "checks", label: "Check-ins" }];
const columns = {
  "board": [
    "slot",
    "region",
    "tech",
    "call",
    "status"
  ],
  "techs": [
    "techId",
    "name",
    "zone",
    "skills",
    "status"
  ],
  "routes": [
    "routeId",
    "techId",
    "stops",
    "eta",
    "status"
  ],
  "calls": [
    "callId",
    "customer",
    "type",
    "priority",
    "status"
  ],
  "checks": [
    "checkId",
    "techId",
    "time",
    "location",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#ddd6cc",
  "--legacy-panel": "#f5eee4",
  "--legacy-nav": "#d5cab9",
  "--legacy-grid-head": "#dfd2be",
  "--legacy-active": "#8a5a1f"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "board": [
    {
      "slot": "08:00",
      "region": "North",
      "tech": "T-14",
      "call": "C-910",
      "status": "Assigned"
    },
    {
      "slot": "08:30",
      "region": "Central",
      "tech": "T-09",
      "call": "C-911",
      "status": "Queued"
    }
  ],
  "techs": [
    {
      "techId": "T-14",
      "name": "H. Quinn",
      "zone": "North",
      "skills": "HVAC",
      "status": "Online"
    }
  ],
  "routes": [
    {
      "routeId": "R-88",
      "techId": "T-14",
      "stops": "6",
      "eta": "08:20",
      "status": "Running"
    }
  ],
  "calls": [
    {
      "callId": "C-910",
      "customer": "Beacon Labs",
      "type": "Repair",
      "priority": "High",
      "status": "Open"
    }
  ],
  "checks": [
    {
      "checkId": "K-300",
      "techId": "T-14",
      "time": "08:07",
      "location": "Depot 2",
      "status": "Received"
    }
  ]
}));

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function render() {
  applyPalette();
  const data = loadSeed(namespace, () => ({}));
  const moduleColumns = columns[activeModule];
  const rows = data[activeModule].map((row) => moduleColumns.map((key) => row[key]));
  const grid = dataGrid(moduleColumns, rows);

  const formFields = moduleColumns
    .map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`)
    .join("");

  const contentHtml =
    panel("Service board, route assignments, technician check-ins and call completion logs.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Field Dispatch 2002",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: `System: ${namespace.toUpperCase()} | Session: OPERATOR-01`,
    contentHtml
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
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
          first.status = first.status === "Open" ? "Closed" : first.status === "Pending" ? "Approved" : "Open";
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
