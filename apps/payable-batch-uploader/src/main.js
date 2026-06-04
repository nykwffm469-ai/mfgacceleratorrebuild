import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "payable-batch-uploader";
const modules = [
  {
    "id": "imports",
    "label": "Imports"
  },
  {
    "id": "validation",
    "label": "Validation"
  },
  {
    "id": "reprocess",
    "label": "Reprocess"
  },
  {
    "id": "posting",
    "label": "Posting"
  },
  {
    "id": "history",
    "label": "History"
  }
];
const columns = {
  "imports": [
    "batchId",
    "sourceFile",
    "rows",
    "loadedBy",
    "status"
  ],
  "validation": [
    "validationId",
    "batchId",
    "rule",
    "failedRows",
    "status"
  ],
  "reprocess": [
    "jobId",
    "batchId",
    "attempt",
    "owner",
    "status"
  ],
  "posting": [
    "postId",
    "batchId",
    "companyCode",
    "period",
    "status"
  ],
  "history": [
    "eventId",
    "batchId",
    "message",
    "createdOn",
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
  "imports": [
    {
      "batchId": "APB-71",
      "sourceFile": "vendor_apr.csv",
      "rows": "922",
      "loadedBy": "APBOT",
      "status": "Imported"
    }
  ],
  "validation": [
    {
      "validationId": "VAL-22",
      "batchId": "APB-71",
      "rule": "PO required",
      "failedRows": "7",
      "status": "Open"
    }
  ],
  "reprocess": [
    {
      "jobId": "RP-11",
      "batchId": "APB-71",
      "attempt": "2",
      "owner": "AP Ops",
      "status": "Queued"
    }
  ],
  "posting": [
    {
      "postId": "POST-09",
      "batchId": "APB-71",
      "companyCode": "1000",
      "period": "2008-04",
      "status": "Posting period closed"
    }
  ],
  "history": [
    {
      "eventId": "H-601",
      "batchId": "APB-71",
      "message": "Batch import completed",
      "createdOn": "2008-04-08 22:17",
      "status": "Logged"
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
    panel("AP invoice batch imports, validation failures, reprocessing queue, and posting oversight.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Payable Batch Uploader 2008",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: `Last nightly sync: 2:17 AM | Session timeout warning: 5m | Job queue backlog`,
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
