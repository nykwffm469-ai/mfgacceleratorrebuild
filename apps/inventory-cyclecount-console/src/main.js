import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "inventory-cyclecount-console";
const modules = [
  {
    "id": "waves",
    "label": "Count Waves"
  },
  {
    "id": "uploads",
    "label": "Handheld Uploads"
  },
  {
    "id": "variance",
    "label": "Variance"
  },
  {
    "id": "recount",
    "label": "Recount"
  },
  {
    "id": "close",
    "label": "Close"
  }
];
const columns = {
  "waves": [
    "waveId",
    "warehouse",
    "zone",
    "owner",
    "status"
  ],
  "uploads": [
    "uploadId",
    "waveId",
    "device",
    "rows",
    "status"
  ],
  "variance": [
    "varianceId",
    "material",
    "difference",
    "reviewer",
    "status"
  ],
  "recount": [
    "recountId",
    "varianceId",
    "counter",
    "scheduledOn",
    "status"
  ],
  "close": [
    "closeId",
    "waveId",
    "closedBy",
    "closeOn",
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
  "waves": [
    {
      "waveId": "WV-11",
      "warehouse": "DC-3",
      "zone": "Aisle 4",
      "owner": "Inventory Ctrl",
      "status": "Released"
    }
  ],
  "uploads": [
    {
      "uploadId": "UP-51",
      "waveId": "WV-11",
      "device": "RF-22",
      "rows": "144",
      "status": "Imported"
    }
  ],
  "variance": [
    {
      "varianceId": "VR-70",
      "material": "MAT-771",
      "difference": "-18",
      "reviewer": "Warehouse Sup",
      "status": "Pending"
    }
  ],
  "recount": [
    {
      "recountId": "RC-18",
      "varianceId": "VR-70",
      "counter": "Team B",
      "scheduledOn": "2008-12-09",
      "status": "Queued"
    }
  ],
  "close": [
    {
      "closeId": "CL-99",
      "waveId": "WV-09",
      "closedBy": "Inventory Lead",
      "closeOn": "2008-12-06",
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
    panel("Cycle count task waves, handheld count uploads, variance approvals, and recount operations.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Inventory Cyclecount Console 2008",
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
