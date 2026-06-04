import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "project-tracker";
const modules = [{ id: "projects", label: "Projects" }, { id: "milestones", label: "Milestones" }, { id: "risks", label: "Risks" }, { id: "issues", label: "Issues" }, { id: "dependencies", label: "Dependencies" }];
const columns = {
  "projects": [
    "projectId",
    "name",
    "sponsor",
    "budget",
    "status"
  ],
  "milestones": [
    "milestoneId",
    "projectId",
    "targetDate",
    "owner",
    "status"
  ],
  "risks": [
    "riskId",
    "projectId",
    "impact",
    "owner",
    "status"
  ],
  "issues": [
    "issueId",
    "projectId",
    "category",
    "assignee",
    "status"
  ],
  "dependencies": [
    "dependencyId",
    "projectId",
    "externalTeam",
    "needBy",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#dadade",
  "--legacy-panel": "#f2f2f6",
  "--legacy-nav": "#cecee0",
  "--legacy-grid-head": "#d6d6e7",
  "--legacy-active": "#5f4d88"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "projects": [
    {
      "projectId": "PRJ-900",
      "name": "Plant Upgrade",
      "sponsor": "Ops VP",
      "budget": "340000",
      "status": "Amber"
    },
    {
      "projectId": "PRJ-901",
      "name": "Regional Rollout",
      "sponsor": "Sales VP",
      "budget": "220000",
      "status": "Green"
    }
  ],
  "milestones": [
    {
      "milestoneId": "MS-31",
      "projectId": "PRJ-900",
      "targetDate": "2004-10-20",
      "owner": "PMO",
      "status": "Open"
    }
  ],
  "risks": [
    {
      "riskId": "R-12",
      "projectId": "PRJ-900",
      "impact": "High",
      "owner": "Program Mgr",
      "status": "Mitigate"
    }
  ],
  "issues": [
    {
      "issueId": "I-07",
      "projectId": "PRJ-901",
      "category": "Vendor",
      "assignee": "S. Cho",
      "status": "Open"
    }
  ],
  "dependencies": [
    {
      "dependencyId": "D-55",
      "projectId": "PRJ-900",
      "externalTeam": "Network",
      "needBy": "2004-09-25",
      "status": "Pending"
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
    panel("Portfolio milestones, RAID logs, dependencies and PMO action tracking.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Project Tracker PMO 2004",
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
