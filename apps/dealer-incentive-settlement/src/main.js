import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "dealer-incentive-settlement";
const modules = [
  { id: "claims", label: "Claims" },
  { id: "validation", label: "Validation" },
  { id: "approvals", label: "Approvals" },
  { id: "settlement", label: "Settlement" },
  { id: "exceptions", label: "Exceptions" },
  { id: "programs", label: "Dealer Programs" },
  { id: "import", label: "Import Queue" },
  { id: "audit", label: "Audit" }
];

const columns = {
  claims: ["claimId", "dealer", "program", "amount", "status"],
  validation: ["validationId", "claimId", "rule", "analyst", "status"],
  approvals: ["approvalId", "claimId", "approver", "dueDate", "status"],
  settlement: ["settlementId", "claimId", "batch", "settledOn", "status"],
  exceptions: ["exceptionId", "claimId", "reason", "owner", "status"],
  programs: ["programCode", "name", "owner", "cycle", "status"],
  import: ["importId", "dealerId", "fileName", "rows", "status"],
  audit: ["auditId", "claimId", "event", "user", "status"]
};

const palette = {
  "--legacy-bg": "#d7dde3",
  "--legacy-panel": "#edf3f8",
  "--legacy-nav": "#c6d1de",
  "--legacy-grid-head": "#d8cfb9",
  "--legacy-active": "#3f678f"
};

let activeModule = modules[0].id;
let selectedRowIndex = -1;
let sortAsc = true;
let activeModal = "";

ensureSeed(namespace, () => ({
  claims: [{ claimId: "DLR-210", dealer: "Metro Auto", program: "Q4 Rebate", amount: "44000", status: "Imported" }],
  validation: [{ validationId: "V-08", claimId: "DLR-210", rule: "VIN required", analyst: "Incentive Ops", status: "Open" }],
  approvals: [{ approvalId: "AP-67", claimId: "DLR-210", approver: "Sales Finance", dueDate: "2011-12-09", status: "Pending Approval" }],
  settlement: [{ settlementId: "SET-91", claimId: "DLR-201", batch: "INC-22", settledOn: "2011-12-06", status: "Posted" }],
  exceptions: [{ exceptionId: "EX-43", claimId: "DLR-210", reason: "Pricing mismatch", owner: "Program Admin", status: "Review" }],
  programs: [{ programCode: "PRG-Q4-REB", name: "Q4 Dealer Rebate", owner: "Sales Finance", cycle: "Monthly", status: "Active" }],
  import: [{ importId: "IMP-77", dealerId: "DLR-210", fileName: "claims_20111206.csv", rows: "124", status: "Validation Failed" }],
  audit: [{ auditId: "AUD-44", claimId: "DLR-210", event: "Invoice mismatch flagged", user: "Incentive Ops", status: "Logged" }]
}));

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function toNumber(value) {
  const parsed = Number.parseFloat(String(value || "0").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortedRows(data, moduleColumns) {
  const ordered = [...data[activeModule]].sort((a, b) => {
    const left = String(a[moduleColumns[0]] || "");
    const right = String(b[moduleColumns[0]] || "");
    return sortAsc ? left.localeCompare(right) : right.localeCompare(left);
  });
  return ordered.map((row) => moduleColumns.map((key) => row[key]));
}

function renderWidgets(data) {
  const exposure = data.claims.reduce((acc, item) => acc + toNumber(item.amount), 0);
  const exceptions = data.exceptions.length;
  const pendingApprovals = data.approvals.filter((item) => String(item.status).toLowerCase().includes("pending")).length;
  const failedImports = data.import.filter((item) => String(item.status).toLowerCase().includes("failed")).length;
  const riskIndex = Math.round(exceptions * 9 + failedImports * 7 + pendingApprovals * 6);
  return `
    <div style="display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:6px;margin-bottom:8px;">
      <div class="legacy-pill">Claim Exposure: ${exposure.toLocaleString()}</div>
      <div class="legacy-pill">Pending Approvals: ${pendingApprovals}</div>
      <div class="legacy-pill">Exceptions: ${exceptions}</div>
      <div class="legacy-pill">Failed Imports: ${failedImports}</div>
      <div class="legacy-pill">Settlement Risk Index: ${riskIndex}</div>
    </div>
    <div class="legacy-alert-list">
      <span class="legacy-alert-item">invoice mismatch banner active</span>
      <span class="legacy-alert-item">suspicious claim flagged</span>
      <span class="legacy-alert-item">approval aging counter elevated</span>
      <span class="legacy-alert-item">payout release controls required</span>
      <span class="legacy-alert-item">settlement batch locked</span>
    </div>
  `;
}

function renderDomainPanel() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="border:1px solid #8b97a4;background:#f6f8fb;padding:6px;">
        <strong>Dealer Program Routing</strong>
        <div style="margin-top:4px;">Dealer hierarchy and territory owner assignment.</div>
        <div>Accrual and chargeback handling by program code.</div>
        <div>Claim lifecycle: Imported -> Validation -> Approval -> Settlement.</div>
      </div>
      <div style="border:1px solid #8b97a4;background:#f6f8fb;padding:6px;">
        <strong>RPA Candidate Flows</strong>
        <div style="margin-top:4px;">Invoice OCR extraction and claim intake automation.</div>
        <div>Settlement batch prep and exception routing.</div>
        <div>Dealer notification generation from queue states.</div>
      </div>
    </div>
  `;
}

function modalBody(data) {
  if (activeModal === "audit") {
    return data.audit.map((item) => `<div>${item.auditId} | ${item.claimId} | ${item.event}</div>`).join("");
  }
  if (activeModal === "retry") {
    return data.import.map((item) => `<div>${item.importId} -> ${item.fileName} | ${item.status}</div>`).join("");
  }
  if (activeModal === "approval") {
    return data.approvals.map((item) => `<div>${item.approvalId} | ${item.claimId} | ${item.status}</div>`).join("");
  }
  if (activeModal === "export") {
    return "<div>Settlement packet prepared for Excel/PDF/Print dispatch.</div>";
  }
  return "";
}

function renderModal(data) {
  if (!activeModal) {
    return "";
  }
  const titleMap = {
    audit: "Audit History",
    retry: "Retry Failed Imports",
    approval: "Supervisor Approval Queue",
    export: "Print/Export Preview"
  };
  return `
    <div class="legacy-command-modal">
      <div class="legacy-command-dialog">
        <div class="legacy-command-head">${titleMap[activeModal]}</div>
        <div class="legacy-command-sub">${modalBody(data)}</div>
        <div class="legacy-command-footer"><button class="legacy-btn" type="button" data-local-action="close-modal">Close</button></div>
      </div>
    </div>
  `;
}

function render() {
  applyPalette();
  const data = loadSeed(namespace, () => ({}));
  const moduleColumns = columns[activeModule];
  const rows = sortedRows(data, moduleColumns);
  const grid = dataGrid(moduleColumns, rows);
  const formFields = moduleColumns.map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`).join("");

  const contentHtml =
    panel("Dealer Settlement Summary", renderWidgets(data)) +
    panel("Claims Workspace", grid) +
    panel("Program and Exception Context", renderDomainPanel()) +
    panel(
      "Workflow Console",
      `<div style="display:flex;gap:4px;flex-wrap:wrap;"><button class="legacy-btn" type="button" data-local-action="open-audit">Audit History</button><button class="legacy-btn" type="button" data-local-action="open-retry">Retry Failed</button><button class="legacy-btn" type="button" data-local-action="open-approval">Supervisor Review</button><button class="legacy-btn" type="button" data-local-action="open-export">Print/Export</button></div>`
    ) +
    panel(
      "Entry Form",
      `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px;display:flex;gap:4px;"><button class="legacy-btn" type="submit">Save</button><button class="legacy-btn" type="button" data-local-action="edit-selected">Edit Selected</button><button class="legacy-btn" type="button" data-local-action="toggle-sort">Toggle Sort</button></div></form>`
    ) +
    renderModal(data);

  document.getElementById("app").innerHTML = appShell({
    title: "Dealer Incentive Settlement 2011",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: "System: DLR-INCENTIVE | Queue: SETTLEMENT-APPROVAL | Operator: Incentive Ops",
    appDescription:
      "Legacy dealer claims and rebate settlement system with import validation, approval thresholds, settlement batches, and exception-heavy audit workflows.",
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

  document.querySelectorAll("[data-local-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-local-action");
      const latest = loadSeed(namespace, () => ({}));
      if (action === "toggle-sort") {
        sortAsc = !sortAsc;
      } else if (action === "edit-selected") {
        const ordered = [...latest[activeModule]].sort((a, b) => {
          const left = String(a[moduleColumns[0]] || "");
          const right = String(b[moduleColumns[0]] || "");
          return sortAsc ? left.localeCompare(right) : right.localeCompare(left);
        });
        const selected = ordered[selectedRowIndex];
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
      } else if (action === "open-audit") {
        activeModal = "audit";
      } else if (action === "open-retry") {
        activeModal = "retry";
      } else if (action === "open-approval") {
        activeModal = "approval";
      } else if (action === "open-export") {
        activeModal = "export";
      } else if (action === "close-modal") {
        activeModal = "";
      }
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
          first.status = String(first.status).includes("Open") ? "Closed" : "Open";
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