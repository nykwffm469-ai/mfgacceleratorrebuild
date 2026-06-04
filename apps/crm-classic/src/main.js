import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel, tabs } from "@legacy/shared-ui";

const namespace = "crm-classic";

const modules = [
  { id: "dashboard", label: "Dashboard" },
  { id: "accounts", label: "Accounts" },
  { id: "contacts", label: "Contacts" },
  { id: "opportunities", label: "Opportunities" },
  { id: "activities", label: "Activities" }
];

const schema = {
  accounts: ["accountId", "name", "industry", "owner", "status"],
  contacts: ["contactId", "fullName", "accountName", "email", "phone"],
  opportunities: ["opportunityId", "name", "accountName", "amount", "stage"],
  activities: ["activityId", "subject", "type", "dueDate", "owner"]
};

ensureSeed(namespace, () => ({
  accounts: [
    { accountId: "ACC-1001", name: "Northwind Metals", industry: "Industrial", owner: "Brenda M.", status: "Active" },
    { accountId: "ACC-1002", name: "Alpine Components", industry: "Automotive", owner: "Gary T.", status: "Prospect" }
  ],
  contacts: [
    { contactId: "CON-2101", fullName: "Jill Tran", accountName: "Northwind Metals", email: "jtran@example.test", phone: "555-0110" },
    { contactId: "CON-2102", fullName: "Mark Souza", accountName: "Alpine Components", email: "msouza@example.test", phone: "555-0194" }
  ],
  opportunities: [
    { opportunityId: "OPP-3101", name: "Q3 Steel Frame Contract", accountName: "Northwind Metals", amount: "125000", stage: "Propose" },
    { opportunityId: "OPP-3102", name: "Brake Assembly Pilot", accountName: "Alpine Components", amount: "78000", stage: "Qualify" }
  ],
  activities: [
    { activityId: "ACT-4101", subject: "Renewal call", type: "Phone", dueDate: "2011-03-15", owner: "Brenda M." },
    { activityId: "ACT-4102", subject: "Site visit", type: "Appointment", dueDate: "2011-03-22", owner: "Gary T." }
  ]
}));

let state = {
  activeModule: "dashboard",
  activeTab: "accounts"
};

function loadData() {
  return loadSeed(namespace, () => ({}));
}

function saveData(data) {
  saveSeed(namespace, data);
}

function moduleContent(data) {
  if (state.activeModule === "dashboard") {
    const body = `
      <div class="legacy-form-grid">
        <div>Total Accounts</div><div>${data.accounts.length}</div>
        <div>Total Contacts</div><div>${data.contacts.length}</div>
        <div>Open Opportunities</div><div>${data.opportunities.length}</div>
        <div>Pending Activities</div><div>${data.activities.length}</div>
      </div>
    `;

    return panel("Executive Snapshot", body) + panel("Module Tabs", tabs([
      { id: "accounts", label: "Accounts" },
      { id: "contacts", label: "Contacts" },
      { id: "opportunities", label: "Opportunities" },
      { id: "activities", label: "Activities" }
    ], state.activeTab));
  }

  const rows = data[state.activeModule].map((record) => schema[state.activeModule].map((key) => record[key]));
  const grid = dataGrid(schema[state.activeModule], rows);

  const fields = schema[state.activeModule]
    .map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`)
    .join("");

  const form = `
    <form id="legacy-record-form" data-module="${state.activeModule}">
      <div class="legacy-form-grid">${fields}</div>
      <div style="margin-top:8px; display:flex; gap:4px;">
        <button class="legacy-btn" type="submit">Save Record</button>
      </div>
    </form>
  `;

  return panel(`${state.activeModule.toUpperCase()} GRID`, grid) + panel("Record Editor", form);
}

function render() {
  const data = loadData();
  const shell = appShell({
    title: "CRM Classic 2011",
    modules,
    activeModule: state.activeModule,
    toolbarButtons: [
      { id: "new", label: "New" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: "Connected Organization: DEMO-ORG-01 | User: legacy.admin",
    contentHtml: moduleContent(data)
  });

  document.getElementById("app").innerHTML = shell;

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeTab = tab.getAttribute("data-tab");
      state.activeModule = state.activeTab;
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const latest = loadData();

      if (action === "seed-reset") {
        localStorage.removeItem(`legacy-demo:${namespace}`);
        ensureSeed(namespace, () => latest);
      }

      if (state.activeModule !== "dashboard" && action === "delete-last" && latest[state.activeModule].length > 0) {
        latest[state.activeModule].pop();
        saveData(latest);
      }

      render();
    });
  });

  const form = document.getElementById("legacy-record-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const moduleName = form.getAttribute("data-module");
      const row = {};
      const keyField = schema[moduleName][0];
      schema[moduleName].forEach((field) => {
        row[field] = formData.get(field)?.toString() || "";
      });
      if (!row[keyField]) {
        row[keyField] = makeId(moduleName.slice(0, 3).toUpperCase());
      }
      const latest = loadData();
      const existingIndex = latest[moduleName].findIndex((item) => item[keyField] === row[keyField]);
      if (existingIndex >= 0) {
        latest[moduleName][existingIndex] = row;
      } else {
        latest[moduleName].push(row);
      }
      saveData(latest);
      render();
    });
  }
}

render();
