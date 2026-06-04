import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "license-permit-renewal";
const modules = [
  {
    "id": "registry",
    "label": "License Registry"
  },
  {
    "id": "packages",
    "label": "Filing Packages"
  },
  {
    "id": "submissions",
    "label": "Submissions"
  },
  {
    "id": "receipts",
    "label": "Receipts"
  },
  {
    "id": "calendar",
    "label": "Deadline Calendar"
  }
];
const columns = {
  "registry": [
    "licenseId",
    "entity",
    "jurisdiction",
    "renewalDate",
    "status"
  ],
  "packages": [
    "packageId",
    "licenseId",
    "documentSet",
    "owner",
    "status"
  ],
  "submissions": [
    "submissionId",
    "licenseId",
    "channel",
    "submittedOn",
    "status"
  ],
  "receipts": [
    "receiptId",
    "submissionId",
    "receiptNo",
    "receivedOn",
    "status"
  ],
  "calendar": [
    "calendarId",
    "licenseId",
    "milestone",
    "dueDate",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d8d8d2",
  "--legacy-panel": "#f1f1eb",
  "--legacy-nav": "#ccccbe",
  "--legacy-grid-head": "#d8d8c8",
  "--legacy-active": "#6d6b30"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "registry": [
    {
      "licenseId": "LIC-414",
      "entity": "Plant 4",
      "jurisdiction": "TX",
      "renewalDate": "2007-12-15",
      "status": "Due"
    }
  ],
  "packages": [
    {
      "packageId": "PKG-11",
      "licenseId": "LIC-414",
      "documentSet": "Annual",
      "owner": "Compliance",
      "status": "Draft"
    }
  ],
  "submissions": [
    {
      "submissionId": "SUB-98",
      "licenseId": "LIC-414",
      "channel": "Portal",
      "submittedOn": "2007-12-02",
      "status": "Sent"
    }
  ],
  "receipts": [
    {
      "receiptId": "RCT-30",
      "submissionId": "SUB-98",
      "receiptNo": "TX-88211",
      "receivedOn": "2007-12-03",
      "status": "Posted"
    }
  ],
  "calendar": [
    {
      "calendarId": "CAL-71",
      "licenseId": "LIC-414",
      "milestone": "Final approval",
      "dueDate": "2007-12-15",
      "status": "Watch"
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
    panel("Jurisdictional filing calendars, package preparation, and renewal submission tracking.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "License Permit Renewal 2007",
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
