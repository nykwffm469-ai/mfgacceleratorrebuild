import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "maintenance-cmms";
const modules = [{ id: "workorders", label: "Work Orders" }, { id: "pm", label: "PM Routes" }, { id: "assets", label: "Assets" }, { id: "parts", label: "Parts Bin" }, { id: "downtime", label: "Downtime" }];
const columns = {
  "workorders": [
    "woId",
    "asset",
    "priority",
    "tech",
    "status"
  ],
  "pm": [
    "routeId",
    "frequency",
    "assetClass",
    "owner",
    "status"
  ],
  "assets": [
    "assetId",
    "name",
    "line",
    "criticality",
    "status"
  ],
  "parts": [
    "partId",
    "description",
    "bin",
    "qty",
    "status"
  ],
  "downtime": [
    "eventId",
    "asset",
    "durationMin",
    "cause",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d6ddd6",
  "--legacy-panel": "#eef4ee",
  "--legacy-nav": "#c7d3c7",
  "--legacy-grid-head": "#cedccb",
  "--legacy-active": "#3c6f3a"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "workorders": [
    {
      "woId": "WO-5001",
      "asset": "Compressor 4",
      "priority": "Urgent",
      "tech": "A. Cole",
      "status": "Assigned"
    },
    {
      "woId": "WO-5002",
      "asset": "Conveyor 2",
      "priority": "Normal",
      "tech": "J. Nix",
      "status": "Open"
    }
  ],
  "pm": [
    {
      "routeId": "PM-A1",
      "frequency": "Weekly",
      "assetClass": "Hydraulic",
      "owner": "Reliability",
      "status": "Active"
    }
  ],
  "assets": [
    {
      "assetId": "AST-223",
      "name": "Mixer 7",
      "line": "L3",
      "criticality": "High",
      "status": "Running"
    }
  ],
  "parts": [
    {
      "partId": "PT-908",
      "description": "Drive Belt",
      "bin": "B12",
      "qty": "14",
      "status": "In Stock"
    }
  ],
  "downtime": [
    {
      "eventId": "DT-01",
      "asset": "Compressor 4",
      "durationMin": "48",
      "cause": "Seal",
      "status": "Closed"
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
    panel("Work orders, preventive maintenance routes, parts bins and downtime logs.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "CMMS Workbench 2000",
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
