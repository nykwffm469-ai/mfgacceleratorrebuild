import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "dock-appointment-scheduler";
const modules = [
  {
    "id": "appointments",
    "label": "Appointments"
  },
  {
    "id": "checkin",
    "label": "Check-in"
  },
  {
    "id": "staging",
    "label": "Staging"
  },
  {
    "id": "exceptions",
    "label": "Exceptions"
  },
  {
    "id": "audit",
    "label": "Audit"
  }
];
const columns = {
  "appointments": [
    "appointmentId",
    "carrier",
    "dock",
    "window",
    "status"
  ],
  "checkin": [
    "checkinId",
    "appointmentId",
    "trailer",
    "guard",
    "status"
  ],
  "staging": [
    "stagingId",
    "trailer",
    "zone",
    "loader",
    "status"
  ],
  "exceptions": [
    "exceptionId",
    "appointmentId",
    "reason",
    "owner",
    "status"
  ],
  "audit": [
    "auditId",
    "event",
    "user",
    "eventTime",
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
  "appointments": [
    {
      "appointmentId": "DK-301",
      "carrier": "RoadEx",
      "dock": "D04",
      "window": "08:00",
      "status": "Scheduled"
    }
  ],
  "checkin": [
    {
      "checkinId": "CI-81",
      "appointmentId": "DK-301",
      "trailer": "TR-2209",
      "guard": "Gate A",
      "status": "Arrived"
    }
  ],
  "staging": [
    {
      "stagingId": "ST-62",
      "trailer": "TR-2209",
      "zone": "Yard 2",
      "loader": "M. Baird",
      "status": "Queued"
    }
  ],
  "exceptions": [
    {
      "exceptionId": "EX-15",
      "appointmentId": "DK-298",
      "reason": "Late arrival",
      "owner": "Dock Ops",
      "status": "Review"
    }
  ],
  "audit": [
    {
      "auditId": "AU-710",
      "event": "Slot reassigned",
      "user": "DISPATCH",
      "eventTime": "2009-07-09 07:14",
      "status": "Logged"
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
    panel("Dock scheduling board, carrier check-ins, trailer assignments, and gate queue triage.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Dock Appointment Scheduler 2009",
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
