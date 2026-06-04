import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "process-mining-lab";
const modules = [
  {
    "id": "logs",
    "label": "Event Logs"
  },
  {
    "id": "variants",
    "label": "Variants"
  },
  {
    "id": "bottlenecks",
    "label": "Bottlenecks"
  },
  {
    "id": "simulations",
    "label": "Simulations"
  },
  {
    "id": "actions",
    "label": "Action Backlog"
  }
];
const columns = {
  "logs": [
    "logId",
    "process",
    "source",
    "records",
    "status"
  ],
  "variants": [
    "variantId",
    "process",
    "frequency",
    "owner",
    "status"
  ],
  "bottlenecks": [
    "nodeId",
    "process",
    "waitTime",
    "severity",
    "status"
  ],
  "simulations": [
    "simId",
    "scenario",
    "owner",
    "impact",
    "status"
  ],
  "actions": [
    "actionId",
    "process",
    "assignee",
    "dueDate",
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
  "logs": [
    {
      "logId": "LG-11",
      "process": "P2P",
      "source": "ERP",
      "records": "220k",
      "status": "Loaded"
    }
  ],
  "variants": [
    {
      "variantId": "VAR-22",
      "process": "P2P",
      "frequency": "31%",
      "owner": "COE",
      "status": "Review"
    }
  ],
  "bottlenecks": [
    {
      "nodeId": "BN-4",
      "process": "P2P",
      "waitTime": "5.2d",
      "severity": "High",
      "status": "Open"
    }
  ],
  "simulations": [
    {
      "simId": "SIM-9",
      "scenario": "Auto-match 3-way",
      "owner": "COE",
      "impact": "-18% cycle",
      "status": "Ready"
    }
  ],
  "actions": [
    {
      "actionId": "ACT-301",
      "process": "P2P",
      "assignee": "Ops Lead",
      "dueDate": "2012-06-01",
      "status": "Planned"
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
    panel("Event log ingestion, process variant maps, bottleneck detection, and action backlog.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Process Mining Lab 2012",
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
