import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "document-imaging-queue";
const modules = [
  { id: "scan", label: "Scan Queue" },
  { id: "ocr", label: "OCR" },
  { id: "indexing", label: "Indexing" },
  { id: "reprocess", label: "Reprocess" },
  { id: "export", label: "Export" },
  { id: "validation", label: "Validation" },
  { id: "batch", label: "Batch Mgmt" },
  { id: "exceptions", label: "Exceptions" }
];

const columns = {
  scan: ["scanId", "source", "pages", "operator", "status"],
  ocr: ["ocrId", "scanId", "engine", "confidence", "status"],
  indexing: ["indexId", "scanId", "docType", "indexer", "status"],
  reprocess: ["jobId", "scanId", "reason", "attempt", "status"],
  export: ["exportId", "scanId", "targetSystem", "runDate", "status"],
  validation: ["validationId", "scanId", "confidence", "operator", "status"],
  batch: ["batchId", "sourceChannel", "pageCount", "lockOwner", "status"],
  exceptions: ["exceptionId", "scanId", "reason", "retryAt", "status"]
};

const palette = {
  "--legacy-bg": "#ddd6cc",
  "--legacy-panel": "#f5eee4",
  "--legacy-nav": "#d5cab9",
  "--legacy-grid-head": "#dfd2be",
  "--legacy-active": "#8a5a1f"
};

let activeModule = modules[0].id;
let selectedRowIndex = -1;
let sortAsc = true;
let activeModal = "";

ensureSeed(namespace, () => ({
  scan: [{ scanId: "SCN-901", source: "Mailroom", pages: "38", operator: "IMG01", status: "Captured" }],
  ocr: [{ ocrId: "OCR-72", scanId: "SCN-901", engine: "ABBYY 9", confidence: "91", status: "Review" }],
  indexing: [{ indexId: "IDX-61", scanId: "SCN-901", docType: "Invoice", indexer: "Queue B", status: "Open" }],
  reprocess: [{ jobId: "RP-401", scanId: "SCN-884", reason: "7 records failed validation", attempt: "2", status: "Retry failed rows" }],
  export: [{ exportId: "EX-77", scanId: "SCN-880", targetSystem: "ERP", runDate: "2009-04-17", status: "ERP export pending" }],
  validation: [{ validationId: "VAL-18", scanId: "SCN-901", confidence: "91%", operator: "IMG01", status: "OCR confidence threshold failed" }],
  batch: [{ batchId: "BT-402", sourceChannel: "mailroom", pageCount: "38", lockOwner: "Queue B", status: "record locked by another user" }],
  exceptions: [{ exceptionId: "EXC-14", scanId: "SCN-884", reason: "Corrupt TIFF detected", retryAt: "2009-04-18 01:00", status: "Retry queued" }]
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
  const totalPages = data.scan.reduce((acc, item) => acc + toNumber(item.pages), 0);
  const avgConfidence = data.ocr.length ? data.ocr.reduce((acc, item) => acc + toNumber(item.confidence), 0) / data.ocr.length : 0;
  const exceptionCount = data.exceptions.length;
  const reprocessCount = data.reprocess.length;
  const captureHealth = Math.round(avgConfidence - reprocessCount * 5 - exceptionCount * 4);
  return `
    <div style="display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:6px;margin-bottom:8px;">
      <div class="legacy-pill">Scanned Pages: ${totalPages}</div>
      <div class="legacy-pill">OCR Confidence Avg: ${avgConfidence.toFixed(0)}%</div>
      <div class="legacy-pill">Reprocess Queue: ${reprocessCount}</div>
      <div class="legacy-pill">Exceptions: ${exceptionCount}</div>
      <div class="legacy-pill">Capture Health Index: ${captureHealth}</div>
    </div>
    <div class="legacy-alert-list">
      <span class="legacy-alert-item">scanner offline warning</span>
      <span class="legacy-alert-item">OCR confidence threshold failed</span>
      <span class="legacy-alert-item">corrupt TIFF detected</span>
      <span class="legacy-alert-item">indexing validation queue active</span>
      <span class="legacy-alert-item">export routing delayed</span>
    </div>
  `;
}

function renderDomainPanel() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="border:1px solid #8b97a4;background:#f8f2e7;padding:6px;">
        <strong>Capture and Indexing</strong>
        <div style="margin-top:4px;">Source channels: mailroom, branch, fax, upload.</div>
        <div>Barcode recognition and document type mapping enabled.</div>
        <div>Split/merge operations and page count checks per batch.</div>
      </div>
      <div style="border:1px solid #8b97a4;background:#f8f2e7;padding:6px;">
        <strong>RPA Candidate Flows</strong>
        <div style="margin-top:4px;">Folder/email intake and OCR classification automation.</div>
        <div>ERP export handoff and failed export retry routing.</div>
        <div>QA exception packet generation and audit archive creation.</div>
      </div>
    </div>
  `;
}

function modalBody(data) {
  if (activeModal === "audit") {
    return data.batch.map((item) => `<div>${item.batchId} | ${item.sourceChannel} | ${item.status}</div>`).join("");
  }
  if (activeModal === "retry") {
    return data.reprocess.map((item) => `<div>${item.jobId} | attempt ${item.attempt} | ${item.reason}</div>`).join("");
  }
  if (activeModal === "approval") {
    return `<div>Supervisor queue for indexing overrides and validation exceptions.</div><div>Pending reviews: ${data.validation.length}</div>`;
  }
  if (activeModal === "export") {
    return "<div>Print/export packet generated for OCR/Indexing audit and throughput report.</div>";
  }
  return "";
}

function renderModal(data) {
  if (!activeModal) {
    return "";
  }
  const titleMap = {
    audit: "Audit History",
    retry: "Retry Failed Batches",
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
    panel("Imaging Operations Summary", renderWidgets(data)) +
    panel("Imaging Workspace", grid) +
    panel("Capture and Export Context", renderDomainPanel()) +
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
    title: "Document Imaging Queue 2009",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: "System: DOC-IMG-OPS | Queue: OCR-VALIDATION | Operator: IMG01",
    appDescription:
      "Legacy document capture and OCR operations platform with indexing validation, batch reprocess queues, export routing, and audit-heavy exception handling.",
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