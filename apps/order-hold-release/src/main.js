import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "order-hold-release";
const modules = [
  {
    "id": "orders",
    "label": "Held Orders"
  },
  {
    "id": "credit",
    "label": "Credit Review"
  },
  {
    "id": "fraud",
    "label": "Fraud Handoff"
  },
  {
    "id": "approvals",
    "label": "Release Approvals"
  },
  {
    "id": "erp",
    "label": "ERP Updates"
  }
];
const columns = {
  "orders": [
    "orderNo",
    "customer",
    "holdType",
    "orderValue",
    "status"
  ],
  "credit": [
    "reviewId",
    "orderNo",
    "exposure",
    "analyst",
    "status"
  ],
  "fraud": [
    "fraudCase",
    "orderNo",
    "riskScore",
    "owner",
    "status"
  ],
  "approvals": [
    "approvalId",
    "orderNo",
    "approver",
    "dueDate",
    "status"
  ],
  "erp": [
    "updateId",
    "orderNo",
    "transaction",
    "postedOn",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d5d9d5",
  "--legacy-panel": "#edf1ed",
  "--legacy-nav": "#c5cec4",
  "--legacy-grid-head": "#d0d8cf",
  "--legacy-active": "#466645"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "orders": [
    {
      "orderNo": "SO-99122",
      "customer": "Apex Retail",
      "holdType": "Credit",
      "orderValue": "44,900",
      "status": "On Hold"
    }
  ],
  "credit": [
    {
      "reviewId": "CR-291",
      "orderNo": "SO-99122",
      "exposure": "120,000",
      "analyst": "Credit Ops",
      "status": "Open"
    }
  ],
  "fraud": [
    {
      "fraudCase": "FRD-11",
      "orderNo": "SO-99122",
      "riskScore": "0.22",
      "owner": "Risk Desk",
      "status": "Clear"
    }
  ],
  "approvals": [
    {
      "approvalId": "APR-H-4",
      "orderNo": "SO-99122",
      "approver": "Sales Mgr",
      "dueDate": "2011-05-20",
      "status": "Pending"
    }
  ],
  "erp": [
    {
      "updateId": "UPD-60",
      "orderNo": "SO-99011",
      "transaction": "VKM3",
      "postedOn": "2011-05-14",
      "status": "Done"
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
    panel("Credit holds, fraud review handoffs, release approvals, and ERP hold updates.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Order Hold Release 2011",
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
