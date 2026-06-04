import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "document-imaging-queue";
const modules = [
  {
    "id": "scan",
    "label": "Scan Queue"
  },
  {
    "id": "ocr",
    "label": "OCR"
  },
  {
    "id": "indexing",
    "label": "Indexing"
  },
  {
    "id": "reprocess",
    "label": "Reprocess"
  },
  {
    "id": "export",
    "label": "Export"
  }
];
const columns = {
  "scan": [
    "scanId",
    "source",
    "pages",
    "operator",
    "status"
  ],
  "ocr": [
    "ocrId",
    "scanId",
    "engine",
    "confidence",
    "status"
  ],
  "indexing": [
    "indexId",
    "scanId",
    "docType",
    "indexer",
    "status"
  ],
  "reprocess": [
    "jobId",
    "scanId",
    "reason",
    "attempt",
    "status"
  ],
  "export": [
    "exportId",
    "scanId",
    "targetSystem",
    "runDate",
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
  "scan": [
    {
      "scanId": "SCN-901",
      "source": "Mailroom",
      "pages": "38",
      "operator": "IMG01",
      "status": "Captured"
    }
  ],
  "ocr": [
    {
      "ocrId": "OCR-72",
      "scanId": "SCN-901",
      "engine": "ABBYY 9",
      "confidence": "91",
      "status": "Review"
    }
  ],
  "indexing": [
    {
      "indexId": "IDX-61",
      "scanId": "SCN-901",
      "docType": "Invoice",
      "indexer": "Queue B",
      "status": "Open"
    }
  ],
  "reprocess": [
    {
      "jobId": "RP-401",
      "scanId": "SCN-884",
      "reason": "7 records failed validation",
      "attempt": "2",
      "status": "Retry failed rows"
    }
  ],
  "export": [
    {
      "exportId": "EX-77",
      "scanId": "SCN-880",
      "targetSystem": "ERP",
      "runDate": "2009-04-17",
      "status": "ERP export pending"
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
    panel("Scan intake, OCR validation, indexing exceptions, and workflow reprocessing operations.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Document Imaging Queue 2009",
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
