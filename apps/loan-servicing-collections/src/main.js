import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "loan-servicing-collections";
const modules = [
  {
    "id": "accounts",
    "label": "Delinquent Accounts"
  },
  {
    "id": "ptp",
    "label": "Promise To Pay"
  },
  {
    "id": "notes",
    "label": "Collector Notes"
  },
  {
    "id": "legal",
    "label": "Legal Handoff"
  },
  {
    "id": "productivity",
    "label": "Productivity"
  }
];
const columns = {
  "accounts": [
    "accountId",
    "borrower",
    "daysPastDue",
    "collector",
    "status"
  ],
  "ptp": [
    "promiseId",
    "accountId",
    "amount",
    "promiseDate",
    "status"
  ],
  "notes": [
    "noteId",
    "accountId",
    "summary",
    "createdBy",
    "status"
  ],
  "legal": [
    "legalId",
    "accountId",
    "firm",
    "handoffDate",
    "status"
  ],
  "productivity": [
    "metricId",
    "collector",
    "calls",
    "rpc",
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
  "accounts": [
    {
      "accountId": "LN-7201",
      "borrower": "C. Dorsey",
      "daysPastDue": "64",
      "collector": "A. Lopez",
      "status": "Open"
    }
  ],
  "ptp": [
    {
      "promiseId": "PTP-66",
      "accountId": "LN-7201",
      "amount": "420",
      "promiseDate": "2010-08-19",
      "status": "Tracked"
    }
  ],
  "notes": [
    {
      "noteId": "N-90",
      "accountId": "LN-7201",
      "summary": "Left voicemail",
      "createdBy": "A. Lopez",
      "status": "Logged"
    }
  ],
  "legal": [
    {
      "legalId": "LG-12",
      "accountId": "LN-6988",
      "firm": "M&R Law",
      "handoffDate": "2010-08-11",
      "status": "Pending"
    }
  ],
  "productivity": [
    {
      "metricId": "M-8",
      "collector": "A. Lopez",
      "calls": "53",
      "rpc": "17",
      "status": "Daily"
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
    panel("Delinquency queues, promise-to-pay tracking, legal escalations, and collector performance views.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Loan Servicing Collections 2010",
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
