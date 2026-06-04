import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "subscription-revenue-studio";
const modules = [
  {
    "id": "subs",
    "label": "Subscriptions"
  },
  {
    "id": "usage",
    "label": "Usage"
  },
  {
    "id": "billing",
    "label": "Billing"
  },
  {
    "id": "revenue",
    "label": "Revenue Schedules"
  },
  {
    "id": "retention",
    "label": "Retention"
  }
];
const columns = {
  "subs": [
    "subscriptionId",
    "customer",
    "plan",
    "renewal",
    "status"
  ],
  "usage": [
    "usageId",
    "subscriptionId",
    "meter",
    "units",
    "status"
  ],
  "billing": [
    "invoiceId",
    "subscriptionId",
    "amount",
    "billDate",
    "status"
  ],
  "revenue": [
    "scheduleId",
    "subscriptionId",
    "month",
    "recognized",
    "status"
  ],
  "retention": [
    "playId",
    "customer",
    "riskScore",
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
  "subs": [
    {
      "subscriptionId": "SUB-410",
      "customer": "Blue Ridge Labs",
      "plan": "Enterprise",
      "renewal": "2012-09-01",
      "status": "Active"
    }
  ],
  "usage": [
    {
      "usageId": "USG-19",
      "subscriptionId": "SUB-410",
      "meter": "API Calls",
      "units": "120000",
      "status": "Captured"
    }
  ],
  "billing": [
    {
      "invoiceId": "INV-S-77",
      "subscriptionId": "SUB-410",
      "amount": "12800",
      "billDate": "2012-05-01",
      "status": "Posted"
    }
  ],
  "revenue": [
    {
      "scheduleId": "REV-62",
      "subscriptionId": "SUB-410",
      "month": "2012-05",
      "recognized": "4266",
      "status": "Open"
    }
  ],
  "retention": [
    {
      "playId": "RET-3",
      "customer": "Blue Ridge Labs",
      "riskScore": "0.61",
      "owner": "CSM",
      "status": "Action"
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
    panel("Subscription lifecycle, usage billing, revenue schedules, and churn intervention workflows.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Subscription Revenue Studio 2012",
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
