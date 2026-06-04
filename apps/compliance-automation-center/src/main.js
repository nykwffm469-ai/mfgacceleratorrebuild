import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "compliance-automation-center";
const modules = [
  {
    "id": "controls",
    "label": "Controls"
  },
  {
    "id": "tests",
    "label": "Control Tests"
  },
  {
    "id": "evidence",
    "label": "Evidence"
  },
  {
    "id": "issues",
    "label": "Issues"
  },
  {
    "id": "audit",
    "label": "Audit Response"
  }
];
const columns = {
  "controls": [
    "controlId",
    "domain",
    "owner",
    "frequency",
    "status"
  ],
  "tests": [
    "testId",
    "controlId",
    "tester",
    "targetDate",
    "status"
  ],
  "evidence": [
    "evidenceId",
    "testId",
    "source",
    "owner",
    "status"
  ],
  "issues": [
    "issueId",
    "controlId",
    "severity",
    "assignee",
    "status"
  ],
  "audit": [
    "responseId",
    "issueId",
    "reviewer",
    "dueDate",
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
  "controls": [
    {
      "controlId": "CTL-201",
      "domain": "Access",
      "owner": "Security",
      "frequency": "Quarterly",
      "status": "Active"
    }
  ],
  "tests": [
    {
      "testId": "TST-72",
      "controlId": "CTL-201",
      "tester": "Internal Audit",
      "targetDate": "2012-06-10",
      "status": "Planned"
    }
  ],
  "evidence": [
    {
      "evidenceId": "EVD-9",
      "testId": "TST-72",
      "source": "IAM Export",
      "owner": "Security",
      "status": "Pending"
    }
  ],
  "issues": [
    {
      "issueId": "ISS-13",
      "controlId": "CTL-201",
      "severity": "High",
      "assignee": "Security",
      "status": "Open"
    }
  ],
  "audit": [
    {
      "responseId": "AR-5",
      "issueId": "ISS-13",
      "reviewer": "External Audit",
      "dueDate": "2012-06-22",
      "status": "Draft"
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
    panel("Control testing schedules, evidence capture, issue triage, and audit response workflow.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Compliance Automation Center 2012",
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
