import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "ap-statement-reconciliation";
const modules = [
  {
    "id": "statements",
    "label": "Statements"
  },
  {
    "id": "openitems",
    "label": "Open Items"
  },
  {
    "id": "matching",
    "label": "Matching"
  },
  {
    "id": "discrepancies",
    "label": "Discrepancies"
  },
  {
    "id": "closures",
    "label": "Closures"
  }
];
const columns = {
  "statements": [
    "statementId",
    "vendor",
    "period",
    "balance",
    "status"
  ],
  "openitems": [
    "itemId",
    "statementId",
    "invoiceNo",
    "amount",
    "status"
  ],
  "matching": [
    "matchId",
    "itemId",
    "erpDoc",
    "analyst",
    "status"
  ],
  "discrepancies": [
    "caseId",
    "vendor",
    "reason",
    "owner",
    "status"
  ],
  "closures": [
    "closureId",
    "caseId",
    "resolvedOn",
    "resolver",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d8d3cd",
  "--legacy-panel": "#f1ece6",
  "--legacy-nav": "#cbc1b8",
  "--legacy-grid-head": "#d8cbbd",
  "--legacy-active": "#6f402d"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "statements": [
    {
      "statementId": "STMT-88",
      "vendor": "Summit Travel",
      "period": "2008-08",
      "balance": "18,770",
      "status": "Loaded"
    }
  ],
  "openitems": [
    {
      "itemId": "OI-421",
      "statementId": "STMT-88",
      "invoiceNo": "INV-77102",
      "amount": "1,220",
      "status": "Unmatched"
    }
  ],
  "matching": [
    {
      "matchId": "MT-18",
      "itemId": "OI-421",
      "erpDoc": "51000881",
      "analyst": "AP Recon",
      "status": "Open"
    }
  ],
  "discrepancies": [
    {
      "caseId": "DS-12",
      "vendor": "Summit Travel",
      "reason": "Price variance",
      "owner": "AP",
      "status": "Investigate"
    }
  ],
  "closures": [
    {
      "closureId": "CL-77",
      "caseId": "DS-09",
      "resolvedOn": "2008-08-21",
      "resolver": "AP Lead",
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
    panel("Vendor statement ingestion, open-item matching, and discrepancy case handling.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "AP Statement Reconciliation 2008",
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
