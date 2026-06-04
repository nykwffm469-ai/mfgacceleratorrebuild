import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "lowcode-flow-studio";
const modules = [
  {
    "id": "flows",
    "label": "Flows"
  },
  {
    "id": "connectors",
    "label": "Connectors"
  },
  {
    "id": "triggers",
    "label": "Triggers"
  },
  {
    "id": "runs",
    "label": "Run History"
  },
  {
    "id": "failures",
    "label": "Failure Queue"
  }
];
const columns = {
  "flows": [
    "flowId",
    "name",
    "owner",
    "trigger",
    "status"
  ],
  "connectors": [
    "connectorId",
    "system",
    "authType",
    "owner",
    "status"
  ],
  "triggers": [
    "triggerId",
    "flowId",
    "source",
    "lastFired",
    "status"
  ],
  "runs": [
    "runId",
    "flowId",
    "duration",
    "result",
    "status"
  ],
  "failures": [
    "failureId",
    "flowId",
    "reason",
    "owner",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#dadade",
  "--legacy-panel": "#f2f2f6",
  "--legacy-nav": "#cecee0",
  "--legacy-grid-head": "#d6d6e7",
  "--legacy-active": "#5f4d88"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "flows": [
    {
      "flowId": "FL-100",
      "name": "Invoice Approval",
      "owner": "Ops",
      "trigger": "SharePoint",
      "status": "Active"
    }
  ],
  "connectors": [
    {
      "connectorId": "CON-5",
      "system": "SAP",
      "authType": "Service Account",
      "owner": "Integration",
      "status": "Healthy"
    }
  ],
  "triggers": [
    {
      "triggerId": "TR-20",
      "flowId": "FL-100",
      "source": "SharePoint",
      "lastFired": "2012-05-04",
      "status": "On"
    }
  ],
  "runs": [
    {
      "runId": "RUN-9001",
      "flowId": "FL-100",
      "duration": "12s",
      "result": "Success",
      "status": "Complete"
    }
  ],
  "failures": [
    {
      "failureId": "FAIL-7",
      "flowId": "FL-88",
      "reason": "Connector timeout",
      "owner": "Integration",
      "status": "Open"
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
    panel("Flow registry, trigger mappings, connector configs, and run history dashboard.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Lowcode Flow Studio 2012",
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
