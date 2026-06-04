import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "claims-desk";
const modules = [{ id: "intake", label: "Intake" }, { id: "adjusters", label: "Adjusters" }, { id: "reserves", label: "Reserves" }, { id: "payments", label: "Payments" }, { id: "appeals", label: "Appeals" }];
const columns = {
  "intake": [
    "claimId",
    "policyNo",
    "lossDate",
    "category",
    "status"
  ],
  "adjusters": [
    "adjuster",
    "region",
    "openClaims",
    "tier",
    "status"
  ],
  "reserves": [
    "claimId",
    "initialReserve",
    "currentReserve",
    "owner",
    "status"
  ],
  "payments": [
    "paymentId",
    "claimId",
    "payee",
    "amount",
    "status"
  ],
  "appeals": [
    "appealId",
    "claimId",
    "reviewer",
    "nextStep",
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
  "intake": [
    {
      "claimId": "CLM-4431",
      "policyNo": "POL-22018",
      "lossDate": "2001-04-09",
      "category": "Property",
      "status": "Open"
    },
    {
      "claimId": "CLM-4432",
      "policyNo": "POL-11910",
      "lossDate": "2001-04-10",
      "category": "Auto",
      "status": "Queued"
    }
  ],
  "adjusters": [
    {
      "adjuster": "P. Mendez",
      "region": "NW",
      "openClaims": "19",
      "tier": "Senior",
      "status": "Active"
    },
    {
      "adjuster": "R. Lane",
      "region": "SE",
      "openClaims": "27",
      "tier": "Standard",
      "status": "Busy"
    }
  ],
  "reserves": [
    {
      "claimId": "CLM-4431",
      "initialReserve": "9000",
      "currentReserve": "11200",
      "owner": "P. Mendez",
      "status": "Revised"
    }
  ],
  "payments": [
    {
      "paymentId": "PAY-1108",
      "claimId": "CLM-4431",
      "payee": "Beacon Glass",
      "amount": "1400",
      "status": "Pending"
    }
  ],
  "appeals": [
    {
      "appealId": "APL-77",
      "claimId": "CLM-4211",
      "reviewer": "Committee A",
      "nextStep": "Doc Review",
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
    panel("Claims intake, adjuster assignment, reserve updates and payout queue.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Claims Desk 2001",
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
