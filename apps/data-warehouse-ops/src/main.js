import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "data-warehouse-ops";
const modules = [
  {
    "id": "warehouses",
    "label": "Warehouses"
  },
  {
    "id": "jobs",
    "label": "Pipelines"
  },
  {
    "id": "queries",
    "label": "Query History"
  },
  {
    "id": "loads",
    "label": "Load Queue"
  },
  {
    "id": "governance",
    "label": "Governance"
  }
];
const columns = {
  "warehouses": [
    "whId",
    "name",
    "size",
    "owner",
    "status"
  ],
  "jobs": [
    "jobId",
    "dataset",
    "schedule",
    "runtime",
    "status"
  ],
  "queries": [
    "queryId",
    "user",
    "elapsed",
    "costUnits",
    "status"
  ],
  "loads": [
    "loadId",
    "table",
    "source",
    "queuedOn",
    "status"
  ],
  "governance": [
    "policyId",
    "scope",
    "owner",
    "severity",
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
  "warehouses": [
    {
      "whId": "WH-01",
      "name": "ANALYTICS_XL",
      "size": "XL",
      "owner": "Data Eng",
      "status": "Running"
    }
  ],
  "jobs": [
    {
      "jobId": "JOB-771",
      "dataset": "sales_fact",
      "schedule": "Hourly",
      "runtime": "6m",
      "status": "Success"
    }
  ],
  "queries": [
    {
      "queryId": "Q-5412",
      "user": "analyst1",
      "elapsed": "12s",
      "costUnits": "3.1",
      "status": "Complete"
    }
  ],
  "loads": [
    {
      "loadId": "LD-22",
      "table": "customer_dim",
      "source": "S3",
      "queuedOn": "2012-05-03",
      "status": "Queued"
    }
  ],
  "governance": [
    {
      "policyId": "GV-8",
      "scope": "PII Masking",
      "owner": "Data Gov",
      "severity": "High",
      "status": "Active"
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
    panel("Warehouse jobs, virtual compute pools, and query history monitoring console.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Data Warehouse Ops 2012",
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
