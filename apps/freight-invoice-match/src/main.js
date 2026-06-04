import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "freight-invoice-match";
const modules = [
  {
    "id": "invoices",
    "label": "Carrier Invoices"
  },
  {
    "id": "match",
    "label": "3-Way Match"
  },
  {
    "id": "accessorial",
    "label": "Accessorial"
  },
  {
    "id": "disputes",
    "label": "Disputes"
  },
  {
    "id": "settlement",
    "label": "Settlement"
  }
];
const columns = {
  "invoices": [
    "invoiceId",
    "carrier",
    "proNo",
    "amount",
    "status"
  ],
  "match": [
    "matchId",
    "invoiceId",
    "poNo",
    "bolNo",
    "status"
  ],
  "accessorial": [
    "chargeId",
    "invoiceId",
    "chargeType",
    "reviewer",
    "status"
  ],
  "disputes": [
    "disputeId",
    "invoiceId",
    "reason",
    "owner",
    "status"
  ],
  "settlement": [
    "settlementId",
    "invoiceId",
    "approvedAmount",
    "postDate",
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
  "invoices": [
    {
      "invoiceId": "FR-2201",
      "carrier": "RoadEx",
      "proNo": "PRO-9181",
      "amount": "3,820",
      "status": "Imported"
    }
  ],
  "match": [
    {
      "matchId": "MW-44",
      "invoiceId": "FR-2201",
      "poNo": "PO-77120",
      "bolNo": "BOL-902",
      "status": "Mismatch"
    }
  ],
  "accessorial": [
    {
      "chargeId": "AC-72",
      "invoiceId": "FR-2201",
      "chargeType": "Fuel Surcharge",
      "reviewer": "Logistics",
      "status": "Open"
    }
  ],
  "disputes": [
    {
      "disputeId": "DSP-FR-7",
      "invoiceId": "FR-2201",
      "reason": "Weight delta",
      "owner": "Freight AP",
      "status": "Draft"
    }
  ],
  "settlement": [
    {
      "settlementId": "SET-14",
      "invoiceId": "FR-2201",
      "approvedAmount": "3,510",
      "postDate": "2008-09-02",
      "status": "Pending"
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
    panel("PO-BOL-invoice matching, accessorial validation, and freight dispute initiation.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Freight Invoice Match 2008",
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
