import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "timesheet-exception-resolver";
const modules = [
  {
    "id": "exceptions",
    "label": "Exceptions"
  },
  {
    "id": "overtime",
    "label": "Overtime Rules"
  },
  {
    "id": "manager",
    "label": "Manager Follow-up"
  },
  {
    "id": "payroll",
    "label": "Payroll Corrections"
  },
  {
    "id": "reports",
    "label": "Exception Report"
  }
];
const columns = {
  "exceptions": [
    "exceptionId",
    "employee",
    "weekEnding",
    "type",
    "status"
  ],
  "overtime": [
    "ruleCase",
    "employee",
    "hours",
    "policy",
    "status"
  ],
  "manager": [
    "followupId",
    "employee",
    "manager",
    "dueDate",
    "status"
  ],
  "payroll": [
    "correctionId",
    "employee",
    "deltaHours",
    "owner",
    "status"
  ],
  "reports": [
    "reportId",
    "period",
    "exceptions",
    "generatedBy",
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
  "exceptions": [
    {
      "exceptionId": "TS-401",
      "employee": "L. Price",
      "weekEnding": "2010-07-16",
      "type": "Missing OUT",
      "status": "New"
    }
  ],
  "overtime": [
    {
      "ruleCase": "OT-77",
      "employee": "L. Price",
      "hours": "46",
      "policy": "Union A",
      "status": "Flagged"
    }
  ],
  "manager": [
    {
      "followupId": "FU-93",
      "employee": "L. Price",
      "manager": "R. Kim",
      "dueDate": "2010-07-19",
      "status": "Pending"
    }
  ],
  "payroll": [
    {
      "correctionId": "PC-12",
      "employee": "L. Price",
      "deltaHours": "-2",
      "owner": "Payroll",
      "status": "Open"
    }
  ],
  "reports": [
    {
      "reportId": "RPT-TS-9",
      "period": "2010-W28",
      "exceptions": "14",
      "generatedBy": "BOT-TS",
      "status": "Ready"
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
    panel("Missing punches, overtime rules, manager follow-ups, and payroll correction workflows.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Timesheet Exception Resolver 2010",
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
