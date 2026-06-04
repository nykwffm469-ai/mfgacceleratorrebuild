import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "government-benefits-intake";
const modules = [
  {
    "id": "intake",
    "label": "Intake"
  },
  {
    "id": "eligibility",
    "label": "Eligibility"
  },
  {
    "id": "docs",
    "label": "Documents"
  },
  {
    "id": "notices",
    "label": "Notices"
  },
  {
    "id": "escalations",
    "label": "Escalations"
  }
];
const columns = {
  "intake": [
    "caseId",
    "citizen",
    "program",
    "worker",
    "status"
  ],
  "eligibility": [
    "reviewId",
    "caseId",
    "rulePack",
    "reviewer",
    "status"
  ],
  "docs": [
    "docId",
    "caseId",
    "docType",
    "receivedOn",
    "status"
  ],
  "notices": [
    "noticeId",
    "caseId",
    "template",
    "channel",
    "status"
  ],
  "escalations": [
    "escalationId",
    "caseId",
    "reason",
    "owner",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#ddd8ce",
  "--legacy-panel": "#f6f1e7",
  "--legacy-nav": "#d2cabd",
  "--legacy-grid-head": "#d8d0c3",
  "--legacy-active": "#7a4b1d"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "intake": [
    {
      "caseId": "GB-110",
      "citizen": "R. Allen",
      "program": "SNAP",
      "worker": "Desk 4",
      "status": "Open"
    }
  ],
  "eligibility": [
    {
      "reviewId": "EL-92",
      "caseId": "GB-110",
      "rulePack": "State-202",
      "reviewer": "Worker Lead",
      "status": "Pending"
    }
  ],
  "docs": [
    {
      "docId": "DOC-61",
      "caseId": "GB-110",
      "docType": "Income",
      "receivedOn": "2010-03-11",
      "status": "Received"
    }
  ],
  "notices": [
    {
      "noticeId": "NT-07",
      "caseId": "GB-110",
      "template": "Missing Document",
      "channel": "Mail",
      "status": "Queued"
    }
  ],
  "escalations": [
    {
      "escalationId": "ESC-4",
      "caseId": "GB-098",
      "reason": "Supervisor review required",
      "owner": "Team 2",
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
    panel("Citizen intake processing, eligibility checks, correspondence queues, and supervisor approvals.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Government Benefits Intake 2010",
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
