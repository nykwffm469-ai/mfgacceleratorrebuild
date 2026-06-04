import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "new-hire-provisioning";
const modules = [
  {
    "id": "intake",
    "label": "Hire Intake"
  },
  {
    "id": "identity",
    "label": "Identity"
  },
  {
    "id": "access",
    "label": "Application Access"
  },
  {
    "id": "hardware",
    "label": "Hardware"
  },
  {
    "id": "completion",
    "label": "Completion"
  }
];
const columns = {
  "intake": [
    "hireId",
    "employeeName",
    "startDate",
    "department",
    "status"
  ],
  "identity": [
    "identityId",
    "hireId",
    "adAccount",
    "owner",
    "status"
  ],
  "access": [
    "ticketId",
    "hireId",
    "application",
    "approver",
    "status"
  ],
  "hardware": [
    "requestId",
    "hireId",
    "deviceType",
    "assignee",
    "status"
  ],
  "completion": [
    "checklistId",
    "hireId",
    "itemsDone",
    "owner",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d4d8dc",
  "--legacy-panel": "#edf2f6",
  "--legacy-nav": "#c6ced7",
  "--legacy-grid-head": "#cfd8e2",
  "--legacy-active": "#2f5c73"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "intake": [
    {
      "hireId": "NH-602",
      "employeeName": "C. Watts",
      "startDate": "2010-09-13",
      "department": "Finance",
      "status": "New"
    }
  ],
  "identity": [
    {
      "identityId": "ID-44",
      "hireId": "NH-602",
      "adAccount": "cwatts",
      "owner": "IAM",
      "status": "Queued"
    }
  ],
  "access": [
    {
      "ticketId": "ACC-91",
      "hireId": "NH-602",
      "application": "SAP ECC",
      "approver": "Dept Mgr",
      "status": "Open"
    }
  ],
  "hardware": [
    {
      "requestId": "HW-38",
      "hireId": "NH-602",
      "deviceType": "Laptop",
      "assignee": "IT Depot",
      "status": "Allocated"
    }
  ],
  "completion": [
    {
      "checklistId": "CHK-77",
      "hireId": "NH-602",
      "itemsDone": "6/9",
      "owner": "HRIS",
      "status": "In Progress"
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
    panel("Identity setup, access tickets, hardware checklists, and onboarding completion.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "New Hire Provisioning 2010",
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
