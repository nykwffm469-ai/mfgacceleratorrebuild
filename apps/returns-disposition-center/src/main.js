import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "returns-disposition-center";
const modules = [
  {
    "id": "returns",
    "label": "Returns"
  },
  {
    "id": "inspection",
    "label": "Inspection"
  },
  {
    "id": "disposition",
    "label": "Disposition"
  },
  {
    "id": "refund",
    "label": "Refund Handoff"
  },
  {
    "id": "audit",
    "label": "Audit"
  }
];
const columns = {
  "returns": [
    "returnId",
    "customer",
    "rma",
    "warehouse",
    "status"
  ],
  "inspection": [
    "inspectionId",
    "returnId",
    "inspector",
    "condition",
    "status"
  ],
  "disposition": [
    "dispositionId",
    "returnId",
    "action",
    "approver",
    "status"
  ],
  "refund": [
    "handoffId",
    "returnId",
    "financeQueue",
    "owner",
    "status"
  ],
  "audit": [
    "auditId",
    "returnId",
    "event",
    "eventBy",
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
  "returns": [
    {
      "returnId": "RET-991",
      "customer": "Apex Labs",
      "rma": "RMA-7221",
      "warehouse": "WH-2",
      "status": "Received"
    }
  ],
  "inspection": [
    {
      "inspectionId": "INSP-77",
      "returnId": "RET-991",
      "inspector": "L. Grant",
      "condition": "Damaged",
      "status": "Review"
    }
  ],
  "disposition": [
    {
      "dispositionId": "DSP-118",
      "returnId": "RET-991",
      "action": "Scrap",
      "approver": "Warehouse Sup",
      "status": "Pending"
    }
  ],
  "refund": [
    {
      "handoffId": "HF-63",
      "returnId": "RET-991",
      "financeQueue": "AR Refund",
      "owner": "Returns Desk",
      "status": "ERP export pending"
    }
  ],
  "audit": [
    {
      "auditId": "AUD-52",
      "returnId": "RET-991",
      "event": "Open in separate window",
      "eventBy": "RETUSER",
      "status": "Logged"
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
    panel("Return intake, inspection workflows, disposition approvals, and refund/export handoff.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Returns Disposition Center 2010",
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
