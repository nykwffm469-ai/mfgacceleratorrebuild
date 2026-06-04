import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "dealer-incentive-settlement";
const modules = [
  {
    "id": "claims",
    "label": "Claims"
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
    "id": "settlement",
    "label": "Settlement"
  },
  {
    "id": "exceptions",
    "label": "Exceptions"
  }
];
const columns = {
  "claims": [
    "claimId",
    "dealer",
    "program",
    "amount",
    "status"
  ],
  "validation": [
    "validationId",
    "claimId",
    "rule",
    "analyst",
    "status"
  ],
  "approvals": [
    "approvalId",
    "claimId",
    "approver",
    "dueDate",
    "status"
  ],
  "settlement": [
    "settlementId",
    "claimId",
    "batch",
    "settledOn",
    "status"
  ],
  "exceptions": [
    "exceptionId",
    "claimId",
    "reason",
    "owner",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d5dce2",
  "--legacy-panel": "#edf2f7",
  "--legacy-nav": "#c7d2df",
  "--legacy-grid-head": "#d0dbe8",
  "--legacy-active": "#375f89"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "claims": [
    {
      "claimId": "DLR-210",
      "dealer": "Metro Auto",
      "program": "Q4 Rebate",
      "amount": "44000",
      "status": "Imported"
    }
  ],
  "validation": [
    {
      "validationId": "V-08",
      "claimId": "DLR-210",
      "rule": "VIN required",
      "analyst": "Incentive Ops",
      "status": "Open"
    }
  ],
  "approvals": [
    {
      "approvalId": "AP-67",
      "claimId": "DLR-210",
      "approver": "Sales Finance",
      "dueDate": "2011-12-09",
      "status": "Pending"
    }
  ],
  "settlement": [
    {
      "settlementId": "SET-91",
      "claimId": "DLR-201",
      "batch": "INC-22",
      "settledOn": "2011-12-06",
      "status": "Posted"
    }
  ],
  "exceptions": [
    {
      "exceptionId": "EX-43",
      "claimId": "DLR-210",
      "reason": "Pricing mismatch",
      "owner": "Program Admin",
      "status": "Review"
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
    panel("Dealer claim imports, rebate validation, approval routing, and settlement batch processing.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Dealer Incentive Settlement 2011",
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
