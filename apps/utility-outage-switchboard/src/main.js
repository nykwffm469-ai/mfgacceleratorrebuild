import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "utility-outage-switchboard";
const modules = [
  {
    "id": "outages",
    "label": "Outages"
  },
  {
    "id": "crews",
    "label": "Crew Dispatch"
  },
  {
    "id": "restoration",
    "label": "Restoration"
  },
  {
    "id": "notifications",
    "label": "Notifications"
  },
  {
    "id": "postmortem",
    "label": "Postmortem"
  }
];
const columns = {
  "outages": [
    "outageId",
    "region",
    "severity",
    "dispatcher",
    "status"
  ],
  "crews": [
    "crewId",
    "outageId",
    "crewLead",
    "eta",
    "status"
  ],
  "restoration": [
    "restoreId",
    "outageId",
    "restoredPct",
    "updatedOn",
    "status"
  ],
  "notifications": [
    "noticeId",
    "outageId",
    "channel",
    "batch",
    "status"
  ],
  "postmortem": [
    "reportId",
    "outageId",
    "owner",
    "dueDate",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d4d8df",
  "--legacy-panel": "#eef1f6",
  "--legacy-nav": "#c7cfdb",
  "--legacy-grid-head": "#cfd8e5",
  "--legacy-active": "#2c4e77"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "outages": [
    {
      "outageId": "OUT-810",
      "region": "North Grid",
      "severity": "High",
      "dispatcher": "Control Room",
      "status": "Open"
    }
  ],
  "crews": [
    {
      "crewId": "CR-41",
      "outageId": "OUT-810",
      "crewLead": "D. Cole",
      "eta": "00:35",
      "status": "Assigned"
    }
  ],
  "restoration": [
    {
      "restoreId": "RS-09",
      "outageId": "OUT-810",
      "restoredPct": "45",
      "updatedOn": "2011-01-17 18:20",
      "status": "Processing..."
    }
  ],
  "notifications": [
    {
      "noticeId": "NT-56",
      "outageId": "OUT-810",
      "channel": "Call Tree",
      "batch": "N-201",
      "status": "Queued"
    }
  ],
  "postmortem": [
    {
      "reportId": "PM-77",
      "outageId": "OUT-755",
      "owner": "Ops Manager",
      "dueDate": "2011-01-20",
      "status": "Open"
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
    panel("Outage intake, crew dispatch, restoration status updates, and customer notification tracking.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Utility Outage Switchboard 2011",
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
