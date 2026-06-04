import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "procurement-sourcing-suite";
const modules = [
  {
    "id": "events",
    "label": "Sourcing Events"
  },
  {
    "id": "bids",
    "label": "Bids"
  },
  {
    "id": "awards",
    "label": "Awards"
  },
  {
    "id": "contracts",
    "label": "Contracts"
  },
  {
    "id": "risk",
    "label": "Supplier Risk"
  }
];
const columns = {
  "events": [
    "eventId",
    "category",
    "owner",
    "dueDate",
    "status"
  ],
  "bids": [
    "bidId",
    "eventId",
    "supplier",
    "score",
    "status"
  ],
  "awards": [
    "awardId",
    "eventId",
    "supplier",
    "value",
    "status"
  ],
  "contracts": [
    "contractId",
    "supplier",
    "owner",
    "term",
    "status"
  ],
  "risk": [
    "riskId",
    "supplier",
    "factor",
    "severity",
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
  "events": [
    {
      "eventId": "EV-900",
      "category": "Logistics",
      "owner": "Sourcing",
      "dueDate": "2012-06-02",
      "status": "Open"
    }
  ],
  "bids": [
    {
      "bidId": "BID-41",
      "eventId": "EV-900",
      "supplier": "CargoMax",
      "score": "86",
      "status": "Shortlist"
    }
  ],
  "awards": [
    {
      "awardId": "AW-8",
      "eventId": "EV-900",
      "supplier": "CargoMax",
      "value": "210000",
      "status": "Draft"
    }
  ],
  "contracts": [
    {
      "contractId": "SC-77",
      "supplier": "CargoMax",
      "owner": "Legal",
      "term": "24m",
      "status": "Review"
    }
  ],
  "risk": [
    {
      "riskId": "RSK-12",
      "supplier": "CargoMax",
      "factor": "Concentration",
      "severity": "Medium",
      "status": "Monitor"
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
    panel("Sourcing events, bid evaluation, supplier awards, and contract handoff management.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Procurement Sourcing Suite 2012",
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
