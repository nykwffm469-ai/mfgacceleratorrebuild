import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "utility-bill-reconciliation";
const modules = [
  {
    "id": "invoices",
    "label": "Invoices"
  },
  {
    "id": "meters",
    "label": "Meter Reads"
  },
  {
    "id": "variance",
    "label": "Variance"
  },
  {
    "id": "batches",
    "label": "Payment Batch"
  },
  {
    "id": "audit",
    "label": "Audit Trail"
  }
];
const columns = {
  "invoices": [
    "invoiceId",
    "provider",
    "billingPeriod",
    "amount",
    "status"
  ],
  "meters": [
    "meterId",
    "site",
    "kwh",
    "readDate",
    "status"
  ],
  "variance": [
    "varianceId",
    "invoiceId",
    "threshold",
    "analyst",
    "status"
  ],
  "batches": [
    "batchId",
    "invoiceCount",
    "runDate",
    "owner",
    "status"
  ],
  "audit": [
    "auditId",
    "event",
    "source",
    "timestamp",
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
  "invoices": [
    {
      "invoiceId": "UT-9901",
      "provider": "City Electric",
      "billingPeriod": "2006-04",
      "amount": "44,220",
      "status": "Imported"
    }
  ],
  "meters": [
    {
      "meterId": "MTR-41",
      "site": "Plant 2",
      "kwh": "191220",
      "readDate": "2006-04-30",
      "status": "Captured"
    }
  ],
  "variance": [
    {
      "varianceId": "VAR-77",
      "invoiceId": "UT-9901",
      "threshold": "5%",
      "analyst": "Energy Ops",
      "status": "Review"
    }
  ],
  "batches": [
    {
      "batchId": "BAT-12",
      "invoiceCount": "8",
      "runDate": "2006-05-02",
      "owner": "AP",
      "status": "Ready"
    }
  ],
  "audit": [
    {
      "auditId": "AUD-332",
      "event": "Meter mismatch",
      "source": "OCR",
      "timestamp": "2006-05-01 08:42",
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
    panel("Invoice extraction, meter usage checks, variance matching, and payment batch preparation.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Utility Bill Reconciliation 2006",
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
