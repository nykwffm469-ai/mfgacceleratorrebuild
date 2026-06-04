import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "procurement-invoice-holdboard";
const modules = [
  {
    "id": "holds",
    "label": "Hold Queue"
  },
  {
    "id": "discrepancies",
    "label": "Discrepancies"
  },
  {
    "id": "escalations",
    "label": "Escalations"
  },
  {
    "id": "approvals",
    "label": "Approvals"
  },
  {
    "id": "release",
    "label": "Release Posting"
  }
];
const columns = {
  "holds": [
    "holdId",
    "invoiceNo",
    "vendor",
    "holdReason",
    "status"
  ],
  "discrepancies": [
    "discrepancyId",
    "holdId",
    "poNo",
    "analyst",
    "status"
  ],
  "escalations": [
    "escalationId",
    "holdId",
    "buyer",
    "escalatedOn",
    "status"
  ],
  "approvals": [
    "approvalId",
    "holdId",
    "approver",
    "dueDate",
    "status"
  ],
  "release": [
    "releaseId",
    "holdId",
    "postedBy",
    "postedOn",
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
  "holds": [
    {
      "holdId": "HD-220",
      "invoiceNo": "51009921",
      "vendor": "Summit Process",
      "holdReason": "3-way mismatch",
      "status": "Open"
    }
  ],
  "discrepancies": [
    {
      "discrepancyId": "DS-17",
      "holdId": "HD-220",
      "poNo": "PO-88122",
      "analyst": "P2P Ops",
      "status": "Review"
    }
  ],
  "escalations": [
    {
      "escalationId": "ES-77",
      "holdId": "HD-220",
      "buyer": "K. Nye",
      "escalatedOn": "2011-06-09",
      "status": "Pending"
    }
  ],
  "approvals": [
    {
      "approvalId": "AP-66",
      "holdId": "HD-201",
      "approver": "Procurement Mgr",
      "dueDate": "2011-06-10",
      "status": "Approved"
    }
  ],
  "release": [
    {
      "releaseId": "RL-31",
      "holdId": "HD-201",
      "postedBy": "AP Shared",
      "postedOn": "2011-06-10",
      "status": "Posted"
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
    panel("Invoice hold queues, discrepancy review, buyer escalations, and release posting workflows.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Procurement Invoice Holdboard 2011",
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
