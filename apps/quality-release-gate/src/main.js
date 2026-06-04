import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "quality-release-gate";
const modules = [
  {
    "id": "lots",
    "label": "Production Lots"
  },
  {
    "id": "inspection",
    "label": "Inspection"
  },
  {
    "id": "nc",
    "label": "Non-Conformance"
  },
  {
    "id": "release",
    "label": "Release"
  },
  {
    "id": "capa",
    "label": "CAPA"
  }
];
const columns = {
  "lots": [
    "lotId",
    "product",
    "plant",
    "inspector",
    "status"
  ],
  "inspection": [
    "inspectionId",
    "lotId",
    "testPack",
    "result",
    "status"
  ],
  "nc": [
    "ncId",
    "lotId",
    "defect",
    "owner",
    "status"
  ],
  "release": [
    "releaseId",
    "lotId",
    "approver",
    "decision",
    "status"
  ],
  "capa": [
    "capaId",
    "ncId",
    "actionOwner",
    "dueDate",
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
  "lots": [
    {
      "lotId": "LOT-311",
      "product": "Valve-Kit",
      "plant": "P2",
      "inspector": "Q. Shaw",
      "status": "Hold"
    }
  ],
  "inspection": [
    {
      "inspectionId": "IN-400",
      "lotId": "LOT-311",
      "testPack": "AQL-2",
      "result": "Fail",
      "status": "Open"
    }
  ],
  "nc": [
    {
      "ncId": "NC-22",
      "lotId": "LOT-311",
      "defect": "Seal deformation",
      "owner": "Quality Eng",
      "status": "Investigate"
    }
  ],
  "release": [
    {
      "releaseId": "RL-200",
      "lotId": "LOT-300",
      "approver": "QA Lead",
      "decision": "Approved",
      "status": "Released"
    }
  ],
  "capa": [
    {
      "capaId": "CA-80",
      "ncId": "NC-22",
      "actionOwner": "MFG Ops",
      "dueDate": "2012-11-04",
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
    panel("Inspection results, non-conformance review, release approvals, and CAPA follow-up tracking.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Quality Release Gate 2012",
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
