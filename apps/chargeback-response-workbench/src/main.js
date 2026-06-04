import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "chargeback-response-workbench";
const modules = [
  {
    "id": "cases",
    "label": "Cases"
  },
  {
    "id": "evidence",
    "label": "Evidence"
  },
  {
    "id": "deadlines",
    "label": "Deadlines"
  },
  {
    "id": "submissions",
    "label": "Submissions"
  },
  {
    "id": "outcomes",
    "label": "Outcomes"
  }
];
const columns = {
  "cases": [
    "caseId",
    "cardNetwork",
    "receivedOn",
    "amount",
    "status"
  ],
  "evidence": [
    "evidenceId",
    "caseId",
    "artifactType",
    "owner",
    "status"
  ],
  "deadlines": [
    "deadlineId",
    "caseId",
    "responseBy",
    "bufferDays",
    "status"
  ],
  "submissions": [
    "submissionId",
    "caseId",
    "portal",
    "submittedOn",
    "status"
  ],
  "outcomes": [
    "outcomeId",
    "caseId",
    "decision",
    "postedOn",
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
  "cases": [
    {
      "caseId": "CB-901",
      "cardNetwork": "Visa",
      "receivedOn": "2010-06-10",
      "amount": "122.00",
      "status": "Open"
    }
  ],
  "evidence": [
    {
      "evidenceId": "EV-41",
      "caseId": "CB-901",
      "artifactType": "Delivery POD",
      "owner": "Risk Ops",
      "status": "Missing"
    }
  ],
  "deadlines": [
    {
      "deadlineId": "DL-22",
      "caseId": "CB-901",
      "responseBy": "2010-06-18",
      "bufferDays": "2",
      "status": "Urgent"
    }
  ],
  "submissions": [
    {
      "submissionId": "SUB-CB-5",
      "caseId": "CB-901",
      "portal": "Chase Orbital",
      "submittedOn": "",
      "status": "Draft"
    }
  ],
  "outcomes": [
    {
      "outcomeId": "OUT-13",
      "caseId": "CB-801",
      "decision": "Won",
      "postedOn": "2010-05-30",
      "status": "Closed"
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
    panel("Dispute evidence assembly, submission deadlines, and acquirer portal updates.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Chargeback Response Workbench 2010",
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
