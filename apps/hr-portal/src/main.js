import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "hr-portal";
const modules = [
  { id: "onboarding", label: "Onboarding" },
  { id: "equipment", label: "Equipment Requests" },
  { id: "approvals", label: "Approvals" },
  { id: "policies", label: "Policy Ack" },
  { id: "tasks", label: "Task Tracker" }
];

let activeModule = "onboarding";

ensureSeed(namespace, () => ({
  onboarding: [
    { employeeId: "EMP-1001", name: "Ruth Meyers", startDate: "2011-07-05", department: "Finance", status: "In Progress" },
    { employeeId: "EMP-1002", name: "Leon Price", startDate: "2011-07-11", department: "HR", status: "Pending" }
  ],
  equipment: [
    { requestId: "EQ-3001", employee: "Ruth Meyers", item: "Laptop", status: "Approved" },
    { requestId: "EQ-3002", employee: "Leon Price", item: "Desk Phone", status: "Pending" }
  ],
  approvals: [
    { approvalId: "APR-4001", subject: "Background Check", owner: "HR Ops", status: "Pending" }
  ],
  policies: [
    { policyId: "POL-9001", employee: "Ruth Meyers", name: "Code of Conduct", acknowledged: "Yes" },
    { policyId: "POL-9002", employee: "Leon Price", name: "Remote Access Policy", acknowledged: "No" }
  ],
  tasks: [
    { taskId: "TSK-5101", task: "Create badge", owner: "Facilities", dueDate: "2011-07-06", status: "Open" }
  ]
}));

const columns = {
  onboarding: ["employeeId", "name", "startDate", "department", "status"],
  equipment: ["requestId", "employee", "item", "status"],
  approvals: ["approvalId", "subject", "owner", "status"],
  policies: ["policyId", "employee", "name", "acknowledged"],
  tasks: ["taskId", "task", "owner", "dueDate", "status"]
};

function renderModule(data) {
  const rows = data[activeModule].map((record) => columns[activeModule].map((key) => record[key]));
  const grid = dataGrid(columns[activeModule], rows);

  const form = `
    <form id="record-form" data-module="${activeModule}">
      <div class="legacy-form-grid">
        ${columns[activeModule].map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`).join("")}
      </div>
      <div style="margin-top:8px;"><button class="legacy-btn" type="submit">Add Row</button></div>
    </form>
  `;

  return panel(`${modules.find((item) => item.id === activeModule).label}`, grid) + panel("Data Entry", form);
}

function render() {
  const data = loadSeed(namespace, () => ({}));
  document.getElementById("app").innerHTML = appShell({
    title: "Employee Services Portal 2010",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First Status" },
      { id: "reset", label: "Reset Seed" }
    ],
    statusText: "Portal Zone: HR-INT-01 | Authentication: Windows Integrated",
    contentHtml: renderModule(data)
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const latest = loadSeed(namespace, () => ({}));
      const action = button.getAttribute("data-action");
      if (action === "toggle-first" && latest[activeModule][0]) {
        const record = latest[activeModule][0];
        if (record.status) record.status = record.status === "Pending" ? "Approved" : "Pending";
        if (record.acknowledged) record.acknowledged = record.acknowledged === "Yes" ? "No" : "Yes";
        saveSeed(namespace, latest);
      }
      if (action === "reset") {
        localStorage.removeItem(`legacy-demo:${namespace}`);
      }
      render();
    });
  });

  document.getElementById("record-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const latest = loadSeed(namespace, () => ({}));
    const row = {};
    columns[activeModule].forEach((field, index) => {
      row[field] = formData.get(field)?.toString() || (index === 0 ? makeId(activeModule.slice(0, 3).toUpperCase()) : "");
    });
    latest[activeModule].push(row);
    saveSeed(namespace, latest);
    render();
  });
}

render();
