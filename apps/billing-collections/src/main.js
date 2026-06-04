import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "billing-collections";
const modules = [{ id: "invoices", label: "Invoices" }, { id: "dunning", label: "Dunning" }, { id: "notes", label: "Collection Notes" }, { id: "disputes", label: "Disputes" }, { id: "promises", label: "Promise to Pay" }];
const columns = {
  "invoices": [
    "invoiceId",
    "customer",
    "amount",
    "dueDate",
    "status"
  ],
  "dunning": [
    "stepId",
    "customer",
    "stage",
    "owner",
    "status"
  ],
  "notes": [
    "noteId",
    "customer",
    "collector",
    "summary",
    "status"
  ],
  "disputes": [
    "disputeId",
    "invoiceId",
    "reason",
    "owner",
    "status"
  ],
  "promises": [
    "promiseId",
    "customer",
    "amount",
    "promiseDate",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#d5dce2",
  "--legacy-panel": "#edf2f7",
  "--legacy-nav": "#c7d2df",
  "--legacy-grid-head": "#d0dbe8",
  "--legacy-active": "#375f89"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "invoices": [
    {
      "invoiceId": "INV-7001",
      "customer": "Delta Foods",
      "amount": "9200",
      "dueDate": "2001-06-12",
      "status": "Overdue"
    },
    {
      "invoiceId": "INV-7002",
      "customer": "Orion Supply",
      "amount": "4100",
      "dueDate": "2001-06-20",
      "status": "Open"
    }
  ],
  "dunning": [
    {
      "stepId": "DUN-12",
      "customer": "Delta Foods",
      "stage": "Letter 2",
      "owner": "Collections",
      "status": "Active"
    }
  ],
  "notes": [
    {
      "noteId": "N-55",
      "customer": "Delta Foods",
      "collector": "M. Vega",
      "summary": "Callback requested",
      "status": "Open"
    }
  ],
  "disputes": [
    {
      "disputeId": "DSP-08",
      "invoiceId": "INV-6902",
      "reason": "Qty mismatch",
      "owner": "AR Ops",
      "status": "Pending"
    }
  ],
  "promises": [
    {
      "promiseId": "PTP-91",
      "customer": "Delta Foods",
      "amount": "3000",
      "promiseDate": "2001-06-18",
      "status": "Tracked"
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
    panel("Invoice batches, dunning steps, collection notes and dispute queues.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Billing & Collections 2001",
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
