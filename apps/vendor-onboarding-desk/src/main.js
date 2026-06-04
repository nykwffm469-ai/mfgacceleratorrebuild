import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "vendor-onboarding-desk";
const modules = [
  {
    "id": "intake",
    "label": "Intake"
  },
  {
    "id": "validation",
    "label": "Tax Validation"
  },
  {
    "id": "banking",
    "label": "Banking"
  },
  {
    "id": "master",
    "label": "Vendor Master"
  },
  {
    "id": "approvals",
    "label": "Approvals"
  }
];
const columns = {
  "intake": [
    "requestId",
    "vendorName",
    "taxId",
    "owner",
    "status"
  ],
  "validation": [
    "taxCase",
    "vendorName",
    "tinMatch",
    "jurisdiction",
    "status"
  ],
  "banking": [
    "bankCase",
    "vendorName",
    "accountType",
    "verification",
    "status"
  ],
  "master": [
    "vendorCode",
    "vendorName",
    "erpSystem",
    "owner",
    "status"
  ],
  "approvals": [
    "approvalId",
    "requestId",
    "approver",
    "slaDate",
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
  "intake": [
    {
      "requestId": "VO-1001",
      "vendorName": "Atlas Supply",
      "taxId": "94-1022231",
      "owner": "AP Ops",
      "status": "New"
    }
  ],
  "validation": [
    {
      "taxCase": "TV-229",
      "vendorName": "Atlas Supply",
      "tinMatch": "Pass",
      "jurisdiction": "US",
      "status": "Cleared"
    }
  ],
  "banking": [
    {
      "bankCase": "BK-81",
      "vendorName": "Atlas Supply",
      "accountType": "ACH",
      "verification": "Micro-deposit",
      "status": "Pending"
    }
  ],
  "master": [
    {
      "vendorCode": "V-9098",
      "vendorName": "Atlas Supply",
      "erpSystem": "SAP ECC",
      "owner": "MDM",
      "status": "Queued"
    }
  ],
  "approvals": [
    {
      "approvalId": "APR-991",
      "requestId": "VO-1001",
      "approver": "Controller",
      "slaDate": "2008-05-12",
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
    panel("W-9 intake, tax validation, bank setup checks, and ERP vendor master onboarding.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Vendor Onboarding Desk 2008",
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
