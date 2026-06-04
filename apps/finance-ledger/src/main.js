import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "finance-ledger";
const modules = [{ id: "journals", label: "Journals" }, { id: "accounts", label: "Accounts" }, { id: "aging", label: "Aging" }, { id: "close", label: "Period Close" }, { id: "exceptions", label: "Exceptions" }];
const columns = {
  "journals": [
    "journalId",
    "period",
    "owner",
    "amount",
    "status"
  ],
  "accounts": [
    "accountNo",
    "name",
    "type",
    "balance",
    "status"
  ],
  "aging": [
    "customer",
    "bucket30",
    "bucket60",
    "bucket90",
    "status"
  ],
  "close": [
    "taskId",
    "task",
    "owner",
    "dueDate",
    "status"
  ],
  "exceptions": [
    "exceptionId",
    "source",
    "severity",
    "owner",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#ddd8ce",
  "--legacy-panel": "#f6f1e7",
  "--legacy-nav": "#d2cabd",
  "--legacy-grid-head": "#d8d0c3",
  "--legacy-active": "#7a4b1d"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "journals": [
    {
      "journalId": "JRN-1001",
      "period": "2003-09",
      "owner": "L. Drake",
      "amount": "18920",
      "status": "Posted"
    },
    {
      "journalId": "JRN-1002",
      "period": "2003-09",
      "owner": "A. Nori",
      "amount": "-6100",
      "status": "Pending"
    }
  ],
  "accounts": [
    {
      "accountNo": "400100",
      "name": "Revenue Main",
      "type": "Income",
      "balance": "442100",
      "status": "Open"
    },
    {
      "accountNo": "510220",
      "name": "Travel Expense",
      "type": "Expense",
      "balance": "31890",
      "status": "Open"
    }
  ],
  "aging": [
    {
      "customer": "Northwind Retail",
      "bucket30": "8200",
      "bucket60": "2100",
      "bucket90": "500",
      "status": "Watch"
    },
    {
      "customer": "Alpine Stores",
      "bucket30": "12200",
      "bucket60": "0",
      "bucket90": "0",
      "status": "Current"
    }
  ],
  "close": [
    {
      "taskId": "CLS-01",
      "task": "Bank Reconciliation",
      "owner": "Treasury",
      "dueDate": "2003-09-28",
      "status": "Open"
    }
  ],
  "exceptions": [
    {
      "exceptionId": "EX-88",
      "source": "AP Batch",
      "severity": "Medium",
      "owner": "Finance Ops",
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
    panel("General ledger posting, journal review, aging and close cycle controls.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Finance Ledger 2003",
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
