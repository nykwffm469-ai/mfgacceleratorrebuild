import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "product-data-syndication";
const modules = [
  {
    "id": "catalog",
    "label": "Catalog"
  },
  {
    "id": "mapping",
    "label": "Channel Mapping"
  },
  {
    "id": "batches",
    "label": "Export Batches"
  },
  {
    "id": "errors",
    "label": "Error Queue"
  },
  {
    "id": "retries",
    "label": "Retry Queue"
  }
];
const columns = {
  "catalog": [
    "sku",
    "productName",
    "category",
    "owner",
    "status"
  ],
  "mapping": [
    "mappingId",
    "sku",
    "channel",
    "template",
    "status"
  ],
  "batches": [
    "batchId",
    "channel",
    "recordCount",
    "runDate",
    "status"
  ],
  "errors": [
    "errorId",
    "batchId",
    "errorType",
    "assignee",
    "status"
  ],
  "retries": [
    "retryId",
    "errorId",
    "attempt",
    "nextRun",
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
  "catalog": [
    {
      "sku": "SKU-8011",
      "productName": "Valve Kit A",
      "category": "Industrial",
      "owner": "MDM",
      "status": "Ready"
    }
  ],
  "mapping": [
    {
      "mappingId": "MAP-72",
      "sku": "SKU-8011",
      "channel": "Amazon",
      "template": "A-Flatfile",
      "status": "Mapped"
    }
  ],
  "batches": [
    {
      "batchId": "BAT-SYN-2",
      "channel": "Amazon",
      "recordCount": "422",
      "runDate": "2011-04-11",
      "status": "Running"
    }
  ],
  "errors": [
    {
      "errorId": "ERR-29",
      "batchId": "BAT-SYN-2",
      "errorType": "Missing UPC",
      "assignee": "Catalog Ops",
      "status": "Open"
    }
  ],
  "retries": [
    {
      "retryId": "RT-99",
      "errorId": "ERR-29",
      "attempt": "2",
      "nextRun": "2011-04-11 18:00",
      "status": "Scheduled"
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
    panel("Catalog normalization, channel mapping, batch exports, and upload retry management.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Product Data Syndication 2011",
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
