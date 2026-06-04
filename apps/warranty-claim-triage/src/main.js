import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "warranty-claim-triage";
const modules = [
  {
    "id": "claims",
    "label": "Claims"
  },
  {
    "id": "entitlement",
    "label": "Entitlement"
  },
  {
    "id": "triage",
    "label": "Triage"
  },
  {
    "id": "service",
    "label": "Service Assignment"
  },
  {
    "id": "settlement",
    "label": "Settlement"
  }
];
const columns = {
  "claims": [
    "claimId",
    "customer",
    "productSerial",
    "submittedOn",
    "status"
  ],
  "entitlement": [
    "entitlementId",
    "claimId",
    "coverageType",
    "reviewer",
    "status"
  ],
  "triage": [
    "triageId",
    "claimId",
    "failureType",
    "priority",
    "status"
  ],
  "service": [
    "assignmentId",
    "claimId",
    "provider",
    "targetDate",
    "status"
  ],
  "settlement": [
    "settlementId",
    "claimId",
    "settlementType",
    "owner",
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
  "claims": [
    {
      "claimId": "WC-188",
      "customer": "Hilltop Gas",
      "productSerial": "SN-7711",
      "submittedOn": "2011-10-08",
      "status": "New"
    }
  ],
  "entitlement": [
    {
      "entitlementId": "EN-24",
      "claimId": "WC-188",
      "coverageType": "Standard",
      "reviewer": "Warranty Ops",
      "status": "Pass"
    }
  ],
  "triage": [
    {
      "triageId": "TR-33",
      "claimId": "WC-188",
      "failureType": "Seal leak",
      "priority": "High",
      "status": "Assigned"
    }
  ],
  "service": [
    {
      "assignmentId": "SV-71",
      "claimId": "WC-188",
      "provider": "Field West",
      "targetDate": "2011-10-11",
      "status": "Open"
    }
  ],
  "settlement": [
    {
      "settlementId": "ST-10",
      "claimId": "WC-177",
      "settlementType": "Credit",
      "owner": "Claims",
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
    panel("Claim intake validation, serial entitlement checks, and service assignment routing.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Warranty Claim Triage 2011",
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
