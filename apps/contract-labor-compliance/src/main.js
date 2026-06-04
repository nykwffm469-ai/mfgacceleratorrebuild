import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "contract-labor-compliance";
const modules = [
  {
    "id": "contractors",
    "label": "Contractors"
  },
  {
    "id": "attestations",
    "label": "Attestations"
  },
  {
    "id": "access",
    "label": "Access"
  },
  {
    "id": "exceptions",
    "label": "Exceptions"
  },
  {
    "id": "history",
    "label": "History"
  }
];
const columns = {
  "contractors": [
    "contractorId",
    "name",
    "vendor",
    "site",
    "status"
  ],
  "attestations": [
    "attestationId",
    "contractorId",
    "policy",
    "dueDate",
    "status"
  ],
  "access": [
    "accessId",
    "contractorId",
    "accessType",
    "approver",
    "status"
  ],
  "exceptions": [
    "exceptionId",
    "contractorId",
    "reason",
    "owner",
    "status"
  ],
  "history": [
    "historyId",
    "contractorId",
    "event",
    "createdOn",
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
  "contractors": [
    {
      "contractorId": "CL-501",
      "name": "S. Morris",
      "vendor": "TempCore",
      "site": "Plant 1",
      "status": "Active"
    }
  ],
  "attestations": [
    {
      "attestationId": "AT-73",
      "contractorId": "CL-501",
      "policy": "Safety",
      "dueDate": "2012-04-02",
      "status": "Open"
    }
  ],
  "access": [
    {
      "accessId": "AX-61",
      "contractorId": "CL-501",
      "accessType": "VPN",
      "approver": "IT Security",
      "status": "Pending"
    }
  ],
  "exceptions": [
    {
      "exceptionId": "EX-14",
      "contractorId": "CL-477",
      "reason": "Expired badge",
      "owner": "HR Ops",
      "status": "Escalated"
    }
  ],
  "history": [
    {
      "historyId": "H-95",
      "contractorId": "CL-501",
      "event": "Last nightly sync: 2:17 AM",
      "createdOn": "2012-03-28",
      "status": "Info"
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
    panel("Contractor onboarding, policy attestations, badge/VPN approvals, and compliance exception handling.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Contract Labor Compliance 2012",
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
