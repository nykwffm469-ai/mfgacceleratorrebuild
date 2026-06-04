import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "export-compliance-screening";
const modules = [
  {
    "id": "screening",
    "label": "Screening Queue"
  },
  {
    "id": "matches",
    "label": "Potential Matches"
  },
  {
    "id": "retries",
    "label": "Retry Queue"
  },
  {
    "id": "approvals",
    "label": "Approvals"
  },
  {
    "id": "release",
    "label": "Release"
  }
];
const columns = {
  "screening": [
    "screenId",
    "customer",
    "orderNo",
    "score",
    "status"
  ],
  "matches": [
    "matchId",
    "screenId",
    "listName",
    "analyst",
    "status"
  ],
  "retries": [
    "retryId",
    "screenId",
    "attempt",
    "nextRun",
    "status"
  ],
  "approvals": [
    "approvalId",
    "screenId",
    "approver",
    "dueDate",
    "status"
  ],
  "release": [
    "releaseId",
    "orderNo",
    "releasedBy",
    "releaseOn",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d6ddd6",
  "--legacy-panel": "#eef4ee",
  "--legacy-nav": "#c7d3c7",
  "--legacy-grid-head": "#cedccb",
  "--legacy-active": "#3c6f3a"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "screening": [
    {
      "screenId": "SC-540",
      "customer": "Arbor Components",
      "orderNo": "SO-92181",
      "score": "0.71",
      "status": "Hold"
    }
  ],
  "matches": [
    {
      "matchId": "M-49",
      "screenId": "SC-540",
      "listName": "Denied Party",
      "analyst": "Trade Ops",
      "status": "Review"
    }
  ],
  "retries": [
    {
      "retryId": "RT-27",
      "screenId": "SC-533",
      "attempt": "3",
      "nextRun": "2011-09-19 01:00",
      "status": "Retry failed rows"
    }
  ],
  "approvals": [
    {
      "approvalId": "APR-95",
      "screenId": "SC-540",
      "approver": "Compliance Mgr",
      "dueDate": "2011-09-19",
      "status": "Workflow pending approval"
    }
  ],
  "release": [
    {
      "releaseId": "RL-12",
      "orderNo": "SO-91820",
      "releasedBy": "Compliance",
      "releaseOn": "2011-09-17",
      "status": "Released"
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
    panel("Denied-party checks, shipment holds, release approvals, and screening retry workflows.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Export Compliance Screening 2011",
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
