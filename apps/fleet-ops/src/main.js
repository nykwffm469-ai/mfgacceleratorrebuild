import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "fleet-ops";
const modules = [{ id: "vehicles", label: "Vehicles" }, { id: "routes", label: "Routes" }, { id: "service", label: "Service" }, { id: "fuel", label: "Fuel Logs" }, { id: "incidents", label: "Incidents" }];
const columns = {
  "vehicles": [
    "unitNo",
    "type",
    "depot",
    "mileage",
    "status"
  ],
  "routes": [
    "routeId",
    "driver",
    "origin",
    "destination",
    "status"
  ],
  "service": [
    "serviceId",
    "unitNo",
    "window",
    "vendor",
    "status"
  ],
  "fuel": [
    "logId",
    "unitNo",
    "gallons",
    "date",
    "status"
  ],
  "incidents": [
    "incidentId",
    "unitNo",
    "severity",
    "owner",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d4d8dc",
  "--legacy-panel": "#edf2f6",
  "--legacy-nav": "#c6ced7",
  "--legacy-grid-head": "#cfd8e2",
  "--legacy-active": "#2f5c73"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "vehicles": [
    {
      "unitNo": "TRK-11",
      "type": "Box Truck",
      "depot": "West",
      "mileage": "144220",
      "status": "Active"
    },
    {
      "unitNo": "VAN-07",
      "type": "Van",
      "depot": "North",
      "mileage": "88430",
      "status": "Service Due"
    }
  ],
  "routes": [
    {
      "routeId": "RTE-7",
      "driver": "D. Wu",
      "origin": "West Depot",
      "destination": "Central Hub",
      "status": "Scheduled"
    }
  ],
  "service": [
    {
      "serviceId": "SRV-42",
      "unitNo": "VAN-07",
      "window": "2000-08-14",
      "vendor": "Metro Garage",
      "status": "Booked"
    }
  ],
  "fuel": [
    {
      "logId": "FL-100",
      "unitNo": "TRK-11",
      "gallons": "31",
      "date": "2000-08-01",
      "status": "Posted"
    }
  ],
  "incidents": [
    {
      "incidentId": "INC-4",
      "unitNo": "TRK-11",
      "severity": "Low",
      "owner": "Fleet Ops",
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
    panel("Vehicle registry, route plans, maintenance windows and fuel logs.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Fleet Ops Console 2000",
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
