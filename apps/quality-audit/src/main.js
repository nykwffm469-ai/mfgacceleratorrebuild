import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "quality-audit";
const modules = [{ id: "lots", label: "Inspection Lots" }, { id: "ncr", label: "NCR" }, { id: "capa", label: "CAPA" }, { id: "releases", label: "Release Gates" }, { id: "metrics", label: "Metrics" }];
const columns = {
  "lots": [
    "lotId",
    "line",
    "inspector",
    "result",
    "status"
  ],
  "ncr": [
    "ncrId",
    "lotId",
    "defect",
    "owner",
    "status"
  ],
  "capa": [
    "capaId",
    "ncrId",
    "dueDate",
    "owner",
    "status"
  ],
  "releases": [
    "gateId",
    "product",
    "approver",
    "date",
    "status"
  ],
  "metrics": [
    "metricId",
    "name",
    "value",
    "period",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d8d8d2",
  "--legacy-panel": "#f1f1eb",
  "--legacy-nav": "#ccccbe",
  "--legacy-grid-head": "#d8d8c8",
  "--legacy-active": "#6d6b30"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "lots": [
    {
      "lotId": "LOT-81",
      "line": "L2",
      "inspector": "J. Yates",
      "result": "Pass",
      "status": "Closed"
    },
    {
      "lotId": "LOT-82",
      "line": "L2",
      "inspector": "J. Yates",
      "result": "Hold",
      "status": "Open"
    }
  ],
  "ncr": [
    {
      "ncrId": "NCR-19",
      "lotId": "LOT-82",
      "defect": "Seal offset",
      "owner": "QA",
      "status": "Open"
    }
  ],
  "capa": [
    {
      "capaId": "CAPA-4",
      "ncrId": "NCR-19",
      "dueDate": "2006-04-04",
      "owner": "Process Eng",
      "status": "In Progress"
    }
  ],
  "releases": [
    {
      "gateId": "REL-3",
      "product": "Valve Kit",
      "approver": "QA Lead",
      "date": "2006-03-31",
      "status": "Blocked"
    }
  ],
  "metrics": [
    {
      "metricId": "M-1",
      "name": "First Pass Yield",
      "value": "94.2",
      "period": "2006-W13",
      "status": "Watch"
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
    panel("Inspection lots, non-conformance records, CAPA tasks and release gates.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Quality Audit Station 2006",
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
