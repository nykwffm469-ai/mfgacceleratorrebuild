import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "legal-docket";
const modules = [{ id: "cases", label: "Cases" }, { id: "hearings", label: "Hearings" }, { id: "counsel", label: "Counsel" }, { id: "evidence", label: "Evidence" }, { id: "filings", label: "Filings" }];
const columns = {
  "cases": [
    "caseNo",
    "title",
    "court",
    "owner",
    "status"
  ],
  "hearings": [
    "hearingId",
    "caseNo",
    "date",
    "judge",
    "status"
  ],
  "counsel": [
    "counselId",
    "name",
    "specialty",
    "caseload",
    "status"
  ],
  "evidence": [
    "itemId",
    "caseNo",
    "category",
    "custodian",
    "status"
  ],
  "filings": [
    "filingId",
    "caseNo",
    "type",
    "dueDate",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d8d3cd",
  "--legacy-panel": "#f1ece6",
  "--legacy-nav": "#cbc1b8",
  "--legacy-grid-head": "#d8cbbd",
  "--legacy-active": "#6f402d"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "cases": [
    {
      "caseNo": "LC-2281",
      "title": "Riverside Contract",
      "court": "County",
      "owner": "G. Hale",
      "status": "Open"
    },
    {
      "caseNo": "LC-2282",
      "title": "Harbor Lease",
      "court": "State",
      "owner": "K. Bell",
      "status": "Review"
    }
  ],
  "hearings": [
    {
      "hearingId": "H-81",
      "caseNo": "LC-2281",
      "date": "1999-11-02",
      "judge": "J. Collins",
      "status": "Scheduled"
    }
  ],
  "counsel": [
    {
      "counselId": "C-17",
      "name": "E. Moran",
      "specialty": "Commercial",
      "caseload": "12",
      "status": "Active"
    }
  ],
  "evidence": [
    {
      "itemId": "E-901",
      "caseNo": "LC-2281",
      "category": "Contract",
      "custodian": "Records",
      "status": "Filed"
    }
  ],
  "filings": [
    {
      "filingId": "F-300",
      "caseNo": "LC-2282",
      "type": "Motion",
      "dueDate": "1999-10-18",
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
    panel("Case files, hearing dates, counsel assignments and evidence register.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Legal Docket 1999",
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
