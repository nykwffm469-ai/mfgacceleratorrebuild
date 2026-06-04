import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "helpdesk-ops";
const modules = [
  { id: "tickets", label: "Tickets" },
  { id: "queues", label: "Queues" },
  { id: "slas", label: "SLAs" },
  { id: "assignments", label: "Assignments" },
  { id: "knowledge", label: "Knowledge" }
];
let activeModule = "tickets";

ensureSeed(namespace, () => ({
  tickets: [
    { ticketId: "INC-1011", summary: "Email sync failure", priority: "High", owner: "Desk A", status: "Open" },
    { ticketId: "SR-1402", summary: "Request VPN access", priority: "Medium", owner: "Desk B", status: "Pending" }
  ],
  queues: [
    { queueId: "Q-01", name: "Desktop Support", volume: "18", status: "Stable" }
  ],
  slas: [
    { slaId: "SLA-7", metric: "P1 Response", target: "00:15", status: "At Risk" }
  ],
  assignments: [
    { assignmentId: "ASG-77", analyst: "Harper L.", team: "Infra", load: "12", status: "Busy" }
  ],
  knowledge: [
    { articleId: "KB-100", title: "Resetting Outlook Profile", category: "Messaging", status: "Published" }
  ]
}));

const columns = {
  tickets: ["ticketId", "summary", "priority", "owner", "status"],
  queues: ["queueId", "name", "volume", "status"],
  slas: ["slaId", "metric", "target", "status"],
  assignments: ["assignmentId", "analyst", "team", "load", "status"],
  knowledge: ["articleId", "title", "category", "status"]
};

function render() {
  const data = loadSeed(namespace, () => ({}));
  const grid = dataGrid(columns[activeModule], data[activeModule].map((row) => columns[activeModule].map((key) => row[key])));
  const formFields = columns[activeModule].map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`).join("");

  document.getElementById("app").innerHTML = appShell({
    title: "Helpdesk Operations Center",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "escalate", label: "Escalate First" },
      { id: "reset", label: "Reset Seed" }
    ],
    statusText: "Queue Monitor: LIVE | Service Clock: ON | Escalation Policy: STANDARD",
    contentHtml: panel("Queue Grid", grid) + panel("Create Record", `<form id="record-form"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px;"><button class="legacy-btn" type="submit">Add</button></div></form>`)
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
      if (action === "escalate" && latest[activeModule][0] && latest[activeModule][0].status) {
        latest[activeModule][0].status = "Escalated";
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
