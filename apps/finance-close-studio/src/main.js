import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "finance-close-studio";
const modules = [
  {
    "id": "close",
    "label": "Close Tasks"
  },
  {
    "id": "recon",
    "label": "Reconciliations"
  },
  {
    "id": "journals",
    "label": "Journals"
  },
  {
    "id": "allocations",
    "label": "Allocations"
  },
  {
    "id": "signoff",
    "label": "Sign-off"
  }
];
const columns = {
  "close": [
    "taskId",
    "entity",
    "owner",
    "dueDate",
    "status"
  ],
  "recon": [
    "reconId",
    "account",
    "preparer",
    "variance",
    "status"
  ],
  "journals": [
    "journalId",
    "period",
    "amount",
    "approver",
    "status"
  ],
  "allocations": [
    "allocationId",
    "driver",
    "owner",
    "runDate",
    "status"
  ],
  "signoff": [
    "signoffId",
    "entity",
    "role",
    "signedOn",
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
  "close": [
    {
      "taskId": "CL-81",
      "entity": "US01",
      "owner": "Accounting",
      "dueDate": "2011-11-29",
      "status": "Open"
    }
  ],
  "recon": [
    {
      "reconId": "RC-22",
      "account": "101000",
      "preparer": "A. Gray",
      "variance": "120",
      "status": "Review"
    }
  ],
  "journals": [
    {
      "journalId": "JN-501",
      "period": "2011-11",
      "amount": "9320",
      "approver": "Controller",
      "status": "Pending"
    }
  ],
  "allocations": [
    {
      "allocationId": "AL-6",
      "driver": "Headcount",
      "owner": "FP&A",
      "runDate": "2011-11-28",
      "status": "Queued"
    }
  ],
  "signoff": [
    {
      "signoffId": "SOFF-11",
      "entity": "US01",
      "role": "CFO",
      "signedOn": "",
      "status": "Waiting"
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
    panel("Period-close orchestration, reconciliations, journal approvals, and sign-off tracking.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Finance Close Studio 2011",
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
