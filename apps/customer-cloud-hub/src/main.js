import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "customer-cloud-hub";
const modules = [
  { id: "accounts", label: "Accounts" },
  { id: "opps", label: "Opportunities" },
  { id: "activities", label: "Activities" },
  { id: "forecast", label: "Forecast" },
  { id: "cases", label: "Customer Cases" },
  { id: "contracts", label: "Contracts" },
  { id: "quotes", label: "Quotes" },
  { id: "service", label: "Service Queue" },
  { id: "notes", label: "Notes" },
  { id: "documents", label: "Documents" }
];

const columns = {
  accounts: ["accountId", "name", "segment", "owner", "territory", "health", "status"],
  opps: ["oppId", "account", "stage", "amount", "probability", "agingDays", "status"],
  activities: ["activityId", "account", "type", "dueDate", "owner", "status"],
  forecast: ["period", "owner", "commit", "bestCase", "weighted", "status"],
  cases: ["caseId", "account", "priority", "sla", "assignee", "status"],
  contracts: ["contractId", "account", "expiresOn", "renewalOwner", "status"],
  quotes: ["quoteId", "account", "oppId", "value", "status"],
  service: ["queueId", "account", "ticketCount", "escalation", "status"],
  notes: ["noteId", "account", "category", "owner", "status"],
  documents: ["docId", "account", "docType", "lastSync", "status"]
};

const stageWeights = {
  Qualify: 0.1,
  Discovery: 0.25,
  Proposal: 0.5,
  Negotiation: 0.7,
  Commit: 0.9,
  "Closed Won": 1,
  "Closed Lost": 0
};

const palette = {
  "--legacy-bg": "#d8dde2",
  "--legacy-panel": "#eef2f6",
  "--legacy-nav": "#c4ced8",
  "--legacy-grid-head": "#d8ceb8",
  "--legacy-active": "#3a5e86"
};

let activeModule = modules[0].id;
let selectedRowIndex = -1;
let sortAsc = true;

ensureSeed(namespace, () => ({
  accounts: [
    {
      accountId: "AC-101",
      name: "Northwind Steel",
      segment: "Enterprise",
      owner: "J. Park",
      territory: "Great Lakes",
      health: "At Risk",
      status: "ERP customer sync pending"
    },
    {
      accountId: "AC-148",
      name: "Arbor Components",
      segment: "Strategic",
      owner: "M. Chen",
      territory: "Central",
      health: "Healthy",
      status: "Active"
    }
  ],
  opps: [
    {
      oppId: "OP-771",
      account: "Northwind Steel",
      stage: "Proposal",
      amount: "420000",
      probability: "50",
      agingDays: "42",
      status: "Open"
    },
    {
      oppId: "OP-812",
      account: "Arbor Components",
      stage: "Negotiation",
      amount: "290000",
      probability: "70",
      agingDays: "27",
      status: "Open"
    }
  ],
  activities: [
    {
      activityId: "ACT-31",
      account: "Northwind Steel",
      type: "Call",
      dueDate: "2012-03-12",
      owner: "J. Park",
      status: "Pending"
    },
    {
      activityId: "ACT-48",
      account: "Arbor Components",
      type: "Meeting",
      dueDate: "2012-03-11",
      owner: "M. Chen",
      status: "Open"
    }
  ],
  forecast: [
    {
      period: "2012-Q2",
      owner: "J. Park",
      commit: "780000",
      bestCase: "990000",
      weighted: "672000",
      status: "Submitted"
    }
  ],
  cases: [
    {
      caseId: "CS-15",
      account: "Northwind Steel",
      priority: "High",
      sla: "4h",
      assignee: "Support",
      status: "case escalation pending"
    }
  ],
  contracts: [{ contractId: "CT-330", account: "Northwind Steel", expiresOn: "2012-07-30", renewalOwner: "Legal Ops", status: "Renewal Window" }],
  quotes: [{ quoteId: "QT-981", account: "Arbor Components", oppId: "OP-812", value: "315000", status: "Issued" }],
  service: [{ queueId: "SQ-44", account: "Northwind Steel", ticketCount: "6", escalation: "2", status: "supervisor approval required" }],
  notes: [{ noteId: "NT-501", account: "Northwind Steel", category: "Territory", owner: "Ops Admin", status: "territory reassignment required" }],
  documents: [{ docId: "DOC-77", account: "Arbor Components", docType: "SLA", lastSync: "2012-03-08 19:42", status: "Exchange sync delayed" }]
}));

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function toNumber(value) {
  const parsed = Number.parseFloat(value || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildSummary(data) {
  const openOpps = data.opps.filter((item) => item.status === "Open");
  const weighted = openOpps.reduce((acc, item) => {
    const explicitWeight = toNumber(item.probability) / 100;
    const stageWeight = stageWeights[item.stage] ?? explicitWeight;
    return acc + toNumber(item.amount) * stageWeight;
  }, 0);
  const openCases = data.cases.filter((item) => !String(item.status).toLowerCase().includes("closed")).length;
  const pendingActivities = data.activities.filter((item) => item.status !== "Complete").length;
  const renewalsDue = data.contracts.filter((item) => item.status !== "Renewed").length;

  return {
    weighted,
    openCases,
    pendingActivities,
    renewalsDue,
    openOpps: openOpps.length
  };
}

function renderWidgets(data) {
  const summary = buildSummary(data);
  return `
    <div style="display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:6px;margin-bottom:8px;">
      <div class="legacy-pill">Open Opportunities: ${summary.openOpps}</div>
      <div class="legacy-pill">Forecast Commit: ${Math.round(summary.weighted).toLocaleString()}</div>
      <div class="legacy-pill">Cases Due Today: ${summary.openCases}</div>
      <div class="legacy-pill">Activities Pending: ${summary.pendingActivities}</div>
      <div class="legacy-pill">Contracts Expiring: ${summary.renewalsDue}</div>
    </div>
    <div class="legacy-alert-list">
      <span class="legacy-alert-item">Exchange sync delayed</span>
      <span class="legacy-alert-item">ERP customer sync pending</span>
      <span class="legacy-alert-item">duplicate account suspected</span>
      <span class="legacy-alert-item">territory reassignment required</span>
      <span class="legacy-alert-item">case escalation pending</span>
    </div>
  `;
}

function renderAccountTree() {
  return `
    <div style="border:1px solid #8b97a4;background:#f5f7fa;padding:6px;font-size:10px;line-height:1.35;">
      <strong>Account Hierarchy</strong>
      <div>[AC-101] Northwind Steel</div>
      <div style="padding-left:14px;">- Plant Ops Midwest</div>
      <div style="padding-left:14px;">- Northwind Distribution</div>
      <div>[AC-148] Arbor Components</div>
      <div style="padding-left:14px;">- Arbor Service Group</div>
    </div>
  `;
}

function buildGridRows(data, moduleColumns) {
  const sorted = [...data[activeModule]].sort((a, b) => {
    const left = String(a[moduleColumns[0]] || "");
    const right = String(b[moduleColumns[0]] || "");
    return sortAsc ? left.localeCompare(right) : right.localeCompare(left);
  });
  return sorted.map((row) => moduleColumns.map((key) => row[key]));
}

function render() {
  applyPalette();
  const data = loadSeed(namespace, () => ({}));
  const moduleColumns = columns[activeModule];
  const rows = buildGridRows(data, moduleColumns);
  const grid = dataGrid(moduleColumns, rows);

  const formFields = moduleColumns.map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`).join("");

  const detailPanel = `
    <div style="display:grid;grid-template-columns:240px 1fr;gap:8px;">
      ${renderAccountTree()}
      <div style="border:1px solid #8b97a4;background:#f8fafc;padding:6px;">
        <strong>Account 360 / SLA</strong>
        <div style="margin-top:4px;">Ownership Mapping: Great Lakes -> J. Park</div>
        <div>Interaction Summary: Email 24 | Call 17 | Meeting 6</div>
        <div>Service Request Count: 6 open / 2 escalated</div>
        <div>Outlook Sync Notice: inbox sync delayed by 00:18</div>
        <div>Duplicate Detection: AC-101 near match with AC-101A</div>
      </div>
    </div>
  `;

  const contentHtml =
    panel("Pipeline Summary Widgets", renderWidgets(data)) +
    panel("Customer Operations Workspace", grid) +
    panel("Account 360 + Ownership", detailPanel) +
    panel(
      "Quick Activity Logging",
      `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button><button class="legacy-btn" type="button" data-action="edit-selected">Edit Selected</button><button class="legacy-btn" type="button" data-action="toggle-sort">Toggle Sort</button></div></form>`
    );

  document.getElementById("app").innerHTML = appShell({
    title: "Customer Cloud Hub 2012",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" },
      { id: "toggle-sort", label: "Toggle Sort" }
    ],
    statusText: "System: CUSTOMER-CLOUD-HUB | Operator: OPR-144 | Queue: SERVICE-CRM | ERP master sync: delayed",
    appDescription:
      "CRM-style customer operations platform with account hierarchy, weighted pipeline forecast, support case linkage, SLA tracking, and Exchange/ERP synchronization notices for legacy modernization storytelling.",
    contentHtml
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      selectedRowIndex = -1;
      render();
    });
  });

  document.querySelectorAll(".legacy-grid tbody tr").forEach((rowEl, index) => {
    if (index === selectedRowIndex) {
      rowEl.classList.add("legacy-row-selected");
    }
    rowEl.addEventListener("click", () => {
      selectedRowIndex = index;
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
          first.status = first.status === "Open" ? "Closed Won" : "Open";
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

      if (action === "toggle-sort") {
        sortAsc = !sortAsc;
      }

      if (action === "edit-selected") {
        const list = [...latest[activeModule]].sort((a, b) => {
          const left = String(a[moduleColumns[0]] || "");
          const right = String(b[moduleColumns[0]] || "");
          return sortAsc ? left.localeCompare(right) : right.localeCompare(left);
        });
        const selected = list[selectedRowIndex];
        if (selected) {
          const form = document.getElementById("entry-form");
          moduleColumns.forEach((field) => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
              input.value = selected[field] || "";
            }
          });
          return;
        }
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

    if (moduleName === "opps") {
      const weighted = latest.opps.reduce((acc, item) => {
        const stageWeight = stageWeights[item.stage] ?? toNumber(item.probability) / 100;
        return acc + toNumber(item.amount) * stageWeight;
      }, 0);
      latest.forecast[0] = {
        period: "2012-Q2",
        owner: "Regional Rollup",
        commit: String(Math.round(weighted * 0.85)),
        bestCase: String(Math.round(weighted * 1.2)),
        weighted: String(Math.round(weighted)),
        status: "Recalculated"
      };
    }

    saveSeed(namespace, latest);
    render();
  });
}

render();