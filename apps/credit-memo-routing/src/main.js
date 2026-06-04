import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "credit-memo-routing";
const modules = [
  {
    "id": "requests",
    "label": "Requests"
  },
  {
    "id": "validation",
    "label": "Validation"
  },
  {
    "id": "approvals",
    "label": "Approvals"
  },
  {
    "id": "posting",
    "label": "Posting"
  },
  {
    "id": "queue",
    "label": "Queue"
  }
];
const columns = {
  "requests": [
    "requestId",
    "customer",
    "memoType",
    "amount",
    "status"
  ],
  "validation": [
    "validationId",
    "requestId",
    "rule",
    "failed",
    "status"
  ],
  "approvals": [
    "approvalId",
    "requestId",
    "approver",
    "sla",
    "status"
  ],
  "posting": [
    "postingId",
    "requestId",
    "docNo",
    "companyCode",
    "status"
  ],
  "queue": [
    "queueId",
    "owner",
    "backlog",
    "priority",
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
  "requests": [
    {
      "requestId": "CM-18",
      "customer": "Northwind Retail",
      "memoType": "Pricing",
      "amount": "1820",
      "status": "Open"
    }
  ],
  "validation": [
    {
      "validationId": "VL-34",
      "requestId": "CM-18",
      "rule": "Original invoice",
      "failed": "No",
      "status": "Cleared"
    }
  ],
  "approvals": [
    {
      "approvalId": "AP-220",
      "requestId": "CM-18",
      "approver": "AR Manager",
      "sla": "24h",
      "status": "Pending"
    }
  ],
  "posting": [
    {
      "postingId": "PS-44",
      "requestId": "CM-11",
      "docNo": "61004421",
      "companyCode": "1000",
      "status": "Posted"
    }
  ],
  "queue": [
    {
      "queueId": "Q-CM-1",
      "owner": "AR Shared",
      "backlog": "27",
      "priority": "High",
      "status": "Job queue backlog"
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
    panel("Credit memo request queues, validation exceptions, manager approvals, and ERP posting handoff.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Credit Memo Routing 2009",
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
