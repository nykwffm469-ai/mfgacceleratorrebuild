import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "compliance-register";
const modules = [{ id: "controls", label: "Controls" }, { id: "findings", label: "Findings" }, { id: "remediation", label: "Remediation" }, { id: "attestations", label: "Attestations" }, { id: "audits", label: "Audits" }];
const columns = {
  "controls": [
    "controlId",
    "domain",
    "owner",
    "frequency",
    "status"
  ],
  "findings": [
    "findingId",
    "controlId",
    "severity",
    "owner",
    "status"
  ],
  "remediation": [
    "planId",
    "findingId",
    "dueDate",
    "owner",
    "status"
  ],
  "attestations": [
    "attestationId",
    "owner",
    "period",
    "result",
    "status"
  ],
  "audits": [
    "auditId",
    "scope",
    "lead",
    "window",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d5d9d5",
  "--legacy-panel": "#edf1ed",
  "--legacy-nav": "#c5cec4",
  "--legacy-grid-head": "#d0d8cf",
  "--legacy-active": "#466645"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "controls": [
    {
      "controlId": "CTL-101",
      "domain": "Access",
      "owner": "Security",
      "frequency": "Quarterly",
      "status": "Active"
    },
    {
      "controlId": "CTL-102",
      "domain": "Change",
      "owner": "IT Ops",
      "frequency": "Monthly",
      "status": "Active"
    }
  ],
  "findings": [
    {
      "findingId": "FND-44",
      "controlId": "CTL-101",
      "severity": "High",
      "owner": "Security",
      "status": "Open"
    }
  ],
  "remediation": [
    {
      "planId": "RM-22",
      "findingId": "FND-44",
      "dueDate": "2005-02-15",
      "owner": "Security",
      "status": "In Progress"
    }
  ],
  "attestations": [
    {
      "attestationId": "ATT-7",
      "owner": "IT Ops",
      "period": "2005-Q1",
      "result": "Pending",
      "status": "Open"
    }
  ],
  "audits": [
    {
      "auditId": "AUD-91",
      "scope": "SOX",
      "lead": "Internal Audit",
      "window": "Feb",
      "status": "Planned"
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
    panel("Control catalog, findings, remediation plans and attestations.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Compliance Register 2005",
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
