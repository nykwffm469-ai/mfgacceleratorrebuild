import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "customer-refund-processing";
const modules = [
  { id: "requests", label: "Requests" },
  { id: "eligibility", label: "Eligibility" },
  { id: "payments", label: "Payment Reversal" },
  { id: "gl", label: "GL Adjustments" },
  { id: "notices", label: "Customer Notices" },
  { id: "approvals", label: "Approvals" },
  { id: "exceptions", label: "Exceptions" },
  { id: "audit", label: "Audit" }
];

const columns = {
  requests: ["refundId", "customer", "requestSource", "amount", "paymentMethod", "priority", "status"],
  eligibility: ["caseId", "refundId", "policyRule", "eligibilityScore", "reviewer", "status"],
  payments: ["paymentId", "refundId", "methodRoute", "paymentBatchId", "reversalStatus", "status"],
  gl: ["journalId", "refundId", "accountingPeriod", "glCode", "taxRecalc", "status"],
  notices: ["noticeId", "refundId", "template", "channel", "statementPreview", "status"],
  approvals: ["approvalId", "refundId", "threshold", "manager", "queue", "status"],
  exceptions: ["exceptionId", "refundId", "reasonCode", "holdReason", "owner", "status"],
  audit: ["auditId", "refundId", "event", "userStamp", "timestamp", "status"]
};

const palette = {
  "--legacy-bg": "#d9dce1",
  "--legacy-panel": "#f0f3f7",
  "--legacy-nav": "#c7cfda",
  "--legacy-grid-head": "#d9cfb9",
  "--legacy-active": "#4f5f7f"
};

let activeModule = modules[0].id;
let selectedRowIndex = -1;
let sortAsc = true;

ensureSeed(namespace, () => ({
  requests: [
    {
      refundId: "RF-1102",
      customer: "Beacon Retail",
      requestSource: "call center",
      amount: "219.00",
      paymentMethod: "ACH",
      priority: "High",
      status: "duplicate refund risk"
    },
    {
      refundId: "RF-1128",
      customer: "Metro Auto",
      requestSource: "web",
      amount: "148.72",
      paymentMethod: "card reversal",
      priority: "Normal",
      status: "New"
    }
  ],
  eligibility: [
    {
      caseId: "EL-67",
      refundId: "RF-1102",
      policyRule: "30-day return",
      eligibilityScore: "82",
      reviewer: "CS Lead",
      status: "Pass"
    }
  ],
  payments: [
    {
      paymentId: "PM-551",
      refundId: "RF-1102",
      methodRoute: "ACH",
      paymentBatchId: "ACH-22",
      reversalStatus: "Pending",
      status: "ACH transmission pending"
    }
  ],
  gl: [
    {
      journalId: "JRN-312",
      refundId: "RF-1102",
      accountingPeriod: "2009-03",
      glCode: "402200",
      taxRecalc: "Yes",
      status: "GL posting validation failed"
    }
  ],
  notices: [
    {
      noticeId: "NT-90",
      refundId: "RF-1102",
      template: "Refund Approved",
      channel: "Email",
      statementPreview: "Ready",
      status: "Pending"
    }
  ],
  approvals: [
    {
      approvalId: "APR-201",
      refundId: "RF-1102",
      threshold: ">200",
      manager: "Finance Mgr",
      queue: "Release Queue",
      status: "supervisor approval required"
    }
  ],
  exceptions: [
    {
      exceptionId: "EX-42",
      refundId: "RF-1102",
      reasonCode: "DUP-RISK",
      holdReason: "Duplicate found",
      owner: "AR Clerk 2",
      status: "Review"
    }
  ],
  audit: [
    {
      auditId: "AU-901",
      refundId: "RF-1102",
      event: "Eligibility override",
      userStamp: "OPR-214",
      timestamp: "2009-03-18 13:22",
      status: "Logged"
    }
  ]
}));

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function moduleRows(data, moduleColumns) {
  const sorted = [...data[activeModule]].sort((a, b) => {
    const left = String(a[moduleColumns[0]] || "");
    const right = String(b[moduleColumns[0]] || "");
    return sortAsc ? left.localeCompare(right) : right.localeCompare(left);
  });
  return sorted.map((row) => moduleColumns.map((key) => row[key]));
}

function renderFinanceWidgets(data) {
  const duplicateRisk = data.requests.filter((item) => String(item.status).toLowerCase().includes("duplicate")).length;
  const pendingApprovals = data.approvals.filter((item) => String(item.status).toLowerCase().includes("approval")).length;
  const failedPosting = data.gl.filter((item) => String(item.status).toLowerCase().includes("failed")).length;
  const exceptionCount = data.exceptions.length;
  return `
    <div style="display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:6px;margin-bottom:8px;">
      <div class="legacy-pill">Duplicate Risk: ${duplicateRisk}</div>
      <div class="legacy-pill">Pending Approvals: ${pendingApprovals}</div>
      <div class="legacy-pill">Failed GL Posts: ${failedPosting}</div>
      <div class="legacy-pill">Exceptions Queue: ${exceptionCount}</div>
    </div>
    <div class="legacy-alert-list">
      <span class="legacy-alert-item">ACH transmission pending</span>
      <span class="legacy-alert-item">duplicate refund risk</span>
      <span class="legacy-alert-item">GL posting validation failed</span>
      <span class="legacy-alert-item">check processing delayed</span>
      <span class="legacy-alert-item">supervisor approval required</span>
    </div>
  `;
}

function renderWorkflowPanel() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="border:1px solid #8b97a4;background:#f8fafc;padding:6px;">
        <strong>Refund Workflow Routing</strong>
        <div style="margin-top:4px;">Method Routing: check / ACH / card reversal / store credit</div>
        <div>Request Source: call center / branch / web / retail</div>
        <div>Fraud Flag: duplicate customer/balance mismatch</div>
        <div>Finance Manager Release Queue: active</div>
      </div>
      <div style="border:1px solid #8b97a4;background:#f8fafc;padding:6px;">
        <strong>Settlement + Audit</strong>
        <div style="margin-top:4px;">Accounting Period: 2009-03</div>
        <div>Payment Batch ID: ACH-22</div>
        <div>GL Code / Write-off Reason / Hold Reason captured</div>
        <div>Statement Preview panel available before notice generation</div>
      </div>
    </div>
  `;
}

function render() {
  applyPalette();
  const data = loadSeed(namespace, () => ({}));
  const moduleColumns = columns[activeModule];
  const rows = moduleRows(data, moduleColumns);
  const grid = dataGrid(moduleColumns, rows);
  const formFields = moduleColumns.map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`).join("");

  const contentHtml =
    panel("Refund Operations Summary", renderFinanceWidgets(data)) +
    panel("Refund Queue Workspace", grid) +
    panel("Eligibility + Settlement Controls", renderWorkflowPanel()) +
    panel(
      "Entry Form",
      `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button><button class="legacy-btn" type="button" data-action="edit-selected">Edit Selected</button><button class="legacy-btn" type="button" data-action="toggle-sort">Toggle Sort</button></div></form>`
    );

  document.getElementById("app").innerHTML = appShell({
    title: "Customer Refund Processing 2009",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" },
      { id: "toggle-sort", label: "Toggle Sort" }
    ],
    statusText: "System: REFUND-FIN-OPS | Operator: AR Clerk 2 | Queue: FIN-RELEASE | Reversal engine: active",
    appDescription:
      "Legacy back-office refund platform with eligibility checks, payment reversal routing, GL adjustment workflow, exception queues, and audit-heavy finance approvals.",
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
          first.status = first.status === "Open" ? "Closed" : "Open";
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

    saveSeed(namespace, latest);
    render();
  });
}

render();