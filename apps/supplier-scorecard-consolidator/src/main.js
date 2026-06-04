import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "supplier-scorecard-consolidator";
const modules = [
  {
    "id": "feeds",
    "label": "KPI Feeds"
  },
  {
    "id": "rules",
    "label": "Normalization"
  },
  {
    "id": "scores",
    "label": "Scores"
  },
  {
    "id": "exceptions",
    "label": "Exceptions"
  },
  {
    "id": "distribution",
    "label": "Distribution"
  }
];
const columns = {
  "feeds": [
    "feedId",
    "supplier",
    "period",
    "source",
    "status"
  ],
  "rules": [
    "ruleId",
    "metric",
    "formula",
    "owner",
    "status"
  ],
  "scores": [
    "scoreId",
    "supplier",
    "overall",
    "tier",
    "status"
  ],
  "exceptions": [
    "exceptionId",
    "supplier",
    "metric",
    "analyst",
    "status"
  ],
  "distribution": [
    "distributionId",
    "period",
    "audience",
    "sentOn",
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
  "feeds": [
    {
      "feedId": "FD-901",
      "supplier": "Prime Metals",
      "period": "2009-08",
      "source": "CSV",
      "status": "Loaded"
    }
  ],
  "rules": [
    {
      "ruleId": "NR-11",
      "metric": "On-time",
      "formula": "z-score",
      "owner": "Procurement",
      "status": "Active"
    }
  ],
  "scores": [
    {
      "scoreId": "SC-771",
      "supplier": "Prime Metals",
      "overall": "82",
      "tier": "B",
      "status": "Published"
    }
  ],
  "exceptions": [
    {
      "exceptionId": "SX-15",
      "supplier": "Prime Metals",
      "metric": "Defect rate",
      "analyst": "Sourcing",
      "status": "Review"
    }
  ],
  "distribution": [
    {
      "distributionId": "DST-44",
      "period": "2009-08",
      "audience": "Ops + Sourcing",
      "sentOn": "2009-09-02",
      "status": "Sent"
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
    panel("KPI file intake, normalization rules, score generation, and monthly distribution.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Supplier Scorecard Consolidator 2009",
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
