import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "master-data-governor";
const modules = [
  {
    "id": "entities",
    "label": "Entities"
  },
  {
    "id": "duplicates",
    "label": "Duplicates"
  },
  {
    "id": "survivorship",
    "label": "Survivorship"
  },
  {
    "id": "approvals",
    "label": "Approvals"
  },
  {
    "id": "publish",
    "label": "Publish"
  }
];
const columns = {
  "entities": [
    "entityId",
    "domain",
    "steward",
    "qualityScore",
    "status"
  ],
  "duplicates": [
    "dupeId",
    "domain",
    "candidateCount",
    "owner",
    "status"
  ],
  "survivorship": [
    "ruleId",
    "domain",
    "priority",
    "editor",
    "status"
  ],
  "approvals": [
    "approvalId",
    "entityId",
    "approver",
    "dueDate",
    "status"
  ],
  "publish": [
    "publishId",
    "domain",
    "targetSystems",
    "runDate",
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
  "entities": [
    {
      "entityId": "ENT-11",
      "domain": "Customer",
      "steward": "MDM Team",
      "qualityScore": "87",
      "status": "Monitor"
    }
  ],
  "duplicates": [
    {
      "dupeId": "DP-71",
      "domain": "Customer",
      "candidateCount": "4",
      "owner": "Steward",
      "status": "Open"
    }
  ],
  "survivorship": [
    {
      "ruleId": "SV-10",
      "domain": "Supplier",
      "priority": "SourceRank",
      "editor": "MDM",
      "status": "Active"
    }
  ],
  "approvals": [
    {
      "approvalId": "APR-MDM-5",
      "entityId": "ENT-11",
      "approver": "Data Gov",
      "dueDate": "2010-04-22",
      "status": "Pending"
    }
  ],
  "publish": [
    {
      "publishId": "PUB-12",
      "domain": "Customer",
      "targetSystems": "CRM,ERP",
      "runDate": "2010-04-20",
      "status": "Queued"
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
    panel("Golden record stewardship, duplicate resolution, survivorship rules, and publishing.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Master Data Governor 2010",
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
