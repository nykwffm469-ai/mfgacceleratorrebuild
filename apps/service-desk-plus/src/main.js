import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "service-desk-plus";
const modules = [
  {
    "id": "incidents",
    "label": "Incidents"
  },
  {
    "id": "requests",
    "label": "Requests"
  },
  {
    "id": "changes",
    "label": "Changes"
  },
  {
    "id": "problems",
    "label": "Problems"
  },
  {
    "id": "knowledge",
    "label": "Knowledge"
  }
];
const columns = {
  "incidents": [
    "incidentId",
    "service",
    "impact",
    "owner",
    "status"
  ],
  "requests": [
    "requestId",
    "requestor",
    "catalogItem",
    "sla",
    "status"
  ],
  "changes": [
    "changeId",
    "environment",
    "window",
    "manager",
    "status"
  ],
  "problems": [
    "problemId",
    "service",
    "rootCause",
    "owner",
    "status"
  ],
  "knowledge": [
    "articleId",
    "title",
    "category",
    "author",
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
  "incidents": [
    {
      "incidentId": "INC-420",
      "service": "Email",
      "impact": "Medium",
      "owner": "NOC",
      "status": "Open"
    }
  ],
  "requests": [
    {
      "requestId": "REQ-812",
      "requestor": "M. Lee",
      "catalogItem": "VPN Access",
      "sla": "24h",
      "status": "Pending"
    }
  ],
  "changes": [
    {
      "changeId": "CHG-58",
      "environment": "Prod",
      "window": "Sat 02:00",
      "manager": "Change Board",
      "status": "Scheduled"
    }
  ],
  "problems": [
    {
      "problemId": "PRB-10",
      "service": "Network",
      "rootCause": "Router failover",
      "owner": "Infra",
      "status": "Investigating"
    }
  ],
  "knowledge": [
    {
      "articleId": "KB-91",
      "title": "Reset MFA",
      "category": "Identity",
      "author": "Service Desk",
      "status": "Published"
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
    panel("ITSM-inspired incident, change, and request fulfillment operations board.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Service Desk Plus 2011",
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
