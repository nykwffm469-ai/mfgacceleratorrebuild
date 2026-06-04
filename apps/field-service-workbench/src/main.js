import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "field-service-workbench";
const modules = [
  {
    "id": "workorders",
    "label": "Work Orders"
  },
  {
    "id": "dispatch",
    "label": "Dispatch"
  },
  {
    "id": "routes",
    "label": "Routes"
  },
  {
    "id": "parts",
    "label": "Parts"
  },
  {
    "id": "closure",
    "label": "Closure"
  }
];
const columns = {
  "workorders": [
    "woId",
    "customer",
    "skill",
    "window",
    "status"
  ],
  "dispatch": [
    "dispatchId",
    "tech",
    "zone",
    "assigned",
    "status"
  ],
  "routes": [
    "routeId",
    "tech",
    "stops",
    "eta",
    "status"
  ],
  "parts": [
    "partNo",
    "woId",
    "availability",
    "bin",
    "status"
  ],
  "closure": [
    "closureId",
    "woId",
    "completedOn",
    "csr",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d4d8df",
  "--legacy-panel": "#eef1f6",
  "--legacy-nav": "#c7cfdb",
  "--legacy-grid-head": "#cfd8e5",
  "--legacy-active": "#2c4e77"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "workorders": [
    {
      "woId": "WO-FS-11",
      "customer": "Delta Health",
      "skill": "Electrical",
      "window": "8-12",
      "status": "Queued"
    }
  ],
  "dispatch": [
    {
      "dispatchId": "DSP-44",
      "tech": "T. Cole",
      "zone": "North",
      "assigned": "5",
      "status": "Active"
    }
  ],
  "routes": [
    {
      "routeId": "R-912",
      "tech": "T. Cole",
      "stops": "6",
      "eta": "08:20",
      "status": "Rolling"
    }
  ],
  "parts": [
    {
      "partNo": "PT-88",
      "woId": "WO-FS-11",
      "availability": "Low",
      "bin": "M-14",
      "status": "Reserve"
    }
  ],
  "closure": [
    {
      "closureId": "CL-77",
      "woId": "WO-FS-10",
      "completedOn": "2011-06-08",
      "csr": "Service Ops",
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
    panel("Work order dispatch, route balancing, parts checks, and service closure handling.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Field Service Workbench 2011",
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
