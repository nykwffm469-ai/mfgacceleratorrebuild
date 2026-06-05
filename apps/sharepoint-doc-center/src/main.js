const STORAGE_KEY = "sp-doc-center";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - SharePoint 2010 Document Center

SharePoint 2010 Document Center is a legacy enterprise content management portal used by knowledge workers, compliance teams, and shared-services analysts to store, classify, and route business documents through check-in/check-out, versioning, metadata, and workflow approvals. Common usage includes drafting contracts and policies in Word, uploading to a library, applying metadata, routing for legal/finance approval, and locking the final version for audit-period retention.

This experience is similar to SharePoint 2010/2013 portals, Documentum, OpenText Content Server, FileNet, and SAP DMS, where users navigate dense site hierarchies, work in ribbon-driven document libraries, and manage metadata and permissions per item. Potential RPA use cases include automated metadata tagging from document content, expiring-document detection and retention enforcement, approval workflow orchestration, mass library migration with audit logs, OCR-based classification of scanned PDFs, and scheduled compliance reports across site collections.`;

const SITES = [
  {
    id: "contoso-finance",
    name: "Contoso Finance",
    url: "/sites/Finance",
    quicklaunch: [
      { id: "lib-contracts", label: "Contracts", type: "library", iconColor: "#ffd06b" },
      { id: "lib-policies", label: "Policies", type: "library", iconColor: "#9cc4ff" },
      { id: "lib-month-end", label: "Month End Workpapers", type: "library", iconColor: "#ffd06b" },
      { id: "lib-sox-evidence", label: "SOX Evidence", type: "library", iconColor: "#c1e0c1" },
      { id: "list-policies", label: "Policy Register", type: "list", iconColor: "#c5c5c5" },
      { id: "list-tasks", label: "Tasks", type: "list", iconColor: "#c5c5c5" },
      { id: "site-treasury", label: "Treasury Subsite", type: "subsite", iconColor: "#d8b6ff" },
      { id: "recycle", label: "Recycle Bin", type: "recycle", iconColor: "#c5c5c5" }
    ]
  }
];

const DEFAULT_LIBRARIES = {
  "lib-contracts": {
    libraryId: "lib-contracts",
    libraryName: "Contracts",
    libraryUrl: "/sites/Finance/Contracts",
    icon: "DOC",
    columns: ["name", "modified", "modifiedBy", "checkedOutTo", "contractType", "renewalDate", "status"],
    items: [
      { id: "doc-c-001", name: "MSA - Acme Industrial v3.docx", modified: "6/4/2026 9:12 AM", modifiedBy: "j.morales", checkedOutTo: "", contractType: "MSA", renewalDate: "2027-03-31", status: "Approved", version: "3.0", size: "248 KB" },
      { id: "doc-c-002", name: "SOW - Apex Logistics 2026Q3.docx", modified: "6/3/2026 4:47 PM", modifiedBy: "s.parker", checkedOutTo: "s.parker", contractType: "SOW", renewalDate: "2026-09-30", status: "Pending Legal", version: "1.4", size: "182 KB" },
      { id: "doc-c-003", name: "NDA - Bluewater Partners.docx", modified: "5/29/2026 10:08 AM", modifiedBy: "l.kim", checkedOutTo: "", contractType: "NDA", renewalDate: "2028-05-29", status: "Approved", version: "1.0", size: "76 KB" },
      { id: "doc-c-004", name: "Renewal Notice - Globex Hosting.pdf", modified: "5/22/2026 1:30 PM", modifiedBy: "j.morales", checkedOutTo: "", contractType: "Renewal", renewalDate: "2026-06-30", status: "Expiring Soon", version: "1.0", size: "412 KB" },
      { id: "doc-c-005", name: "Amendment 2 - Stark Mfg.docx", modified: "5/14/2026 11:55 AM", modifiedBy: "a.diaz", checkedOutTo: "", contractType: "Amendment", renewalDate: "2027-12-31", status: "In Review", version: "2.1", size: "94 KB" },
      { id: "doc-c-006", name: "Master Pricing Schedule 2026.xlsx", modified: "5/10/2026 8:22 AM", modifiedBy: "p.nguyen", checkedOutTo: "", contractType: "Pricing", renewalDate: "2026-12-31", status: "Approved", version: "5.0", size: "1.2 MB" }
    ]
  },
  "lib-policies": {
    libraryId: "lib-policies",
    libraryName: "Policies",
    libraryUrl: "/sites/Finance/Policies",
    icon: "DOC",
    columns: ["name", "modified", "modifiedBy", "checkedOutTo", "policyArea", "reviewCycle", "status"],
    items: [
      { id: "doc-p-001", name: "Travel & Expense Policy.docx", modified: "4/12/2026 2:14 PM", modifiedBy: "m.harris", checkedOutTo: "", policyArea: "T&E", reviewCycle: "Annual", status: "Published", version: "8.0", size: "320 KB" },
      { id: "doc-p-002", name: "Procurement Authority Matrix.xlsx", modified: "3/30/2026 9:01 AM", modifiedBy: "p.nguyen", checkedOutTo: "p.nguyen", policyArea: "Procurement", reviewCycle: "Annual", status: "Draft", version: "2.3", size: "184 KB" },
      { id: "doc-p-003", name: "Records Retention Schedule.pdf", modified: "1/15/2026 10:45 AM", modifiedBy: "compliance.svc", checkedOutTo: "", policyArea: "Records", reviewCycle: "Biennial", status: "Published", version: "4.0", size: "528 KB" },
      { id: "doc-p-004", name: "Vendor Code of Conduct.docx", modified: "12/04/2025 3:30 PM", modifiedBy: "a.diaz", checkedOutTo: "", policyArea: "Compliance", reviewCycle: "Annual", status: "Published", version: "6.1", size: "212 KB" }
    ]
  },
  "lib-month-end": {
    libraryId: "lib-month-end",
    libraryName: "Month End Workpapers",
    libraryUrl: "/sites/Finance/MonthEnd",
    icon: "XLS",
    columns: ["name", "modified", "modifiedBy", "checkedOutTo", "period", "preparer", "status"],
    items: [
      { id: "doc-m-001", name: "GL Recon - May 2026.xlsx", modified: "6/2/2026 6:42 PM", modifiedBy: "k.zhao", checkedOutTo: "k.zhao", period: "May 2026", preparer: "K. Zhao", status: "In Progress", version: "0.4", size: "2.1 MB" },
      { id: "doc-m-002", name: "Intercompany Settlements - May 2026.xlsx", modified: "6/1/2026 1:18 PM", modifiedBy: "r.allen", checkedOutTo: "", period: "May 2026", preparer: "R. Allen", status: "Awaiting Review", version: "1.2", size: "988 KB" },
      { id: "doc-m-003", name: "Accruals Schedule - May 2026.xlsx", modified: "5/31/2026 8:30 PM", modifiedBy: "t.evans", checkedOutTo: "", period: "May 2026", preparer: "T. Evans", status: "Approved", version: "2.0", size: "612 KB" },
      { id: "doc-m-004", name: "Variance Analysis - April 2026.docx", modified: "5/05/2026 11:11 AM", modifiedBy: "k.zhao", checkedOutTo: "", period: "April 2026", preparer: "K. Zhao", status: "Approved", version: "1.0", size: "184 KB" }
    ]
  },
  "lib-sox-evidence": {
    libraryId: "lib-sox-evidence",
    libraryName: "SOX Evidence",
    libraryUrl: "/sites/Finance/SOX",
    icon: "PDF",
    columns: ["name", "modified", "modifiedBy", "checkedOutTo", "control", "tester", "status"],
    items: [
      { id: "doc-s-001", name: "ITGC-04 Access Review Q2.pdf", modified: "5/28/2026 4:55 PM", modifiedBy: "audit.svc", checkedOutTo: "", control: "ITGC-04", tester: "Big4 Audit", status: "Submitted", version: "1.0", size: "1.4 MB" },
      { id: "doc-s-002", name: "FIN-12 JE Approval Sample.xlsx", modified: "5/22/2026 9:25 AM", modifiedBy: "audit.svc", checkedOutTo: "", control: "FIN-12", tester: "Internal Audit", status: "Submitted", version: "1.0", size: "412 KB" },
      { id: "doc-s-003", name: "REV-07 Cutoff Test Workpaper.xlsx", modified: "5/19/2026 2:14 PM", modifiedBy: "audit.svc", checkedOutTo: "audit.svc", control: "REV-07", tester: "Internal Audit", status: "Draft", version: "0.6", size: "388 KB" }
    ]
  }
};

const COLUMN_LABELS = {
  name: "Name",
  modified: "Modified",
  modifiedBy: "Modified By",
  checkedOutTo: "Checked Out To",
  contractType: "Contract Type",
  renewalDate: "Renewal Date",
  policyArea: "Policy Area",
  reviewCycle: "Review Cycle",
  period: "Period",
  preparer: "Preparer",
  control: "Control",
  tester: "Tester",
  status: "Status"
};

const VIEWS = ["All Documents", "Checked Out To Me", "Pending Review", "Expiring This Quarter", "Recent"];

const WORKFLOWS = [
  { id: "wf-approval", name: "Standard Approval Workflow", steps: ["Submitted", "Manager Review", "Legal Review", "Final Sign-off", "Published"] },
  { id: "wf-sox", name: "SOX Evidence Workflow", steps: ["Drafted", "Control Owner Review", "Internal Audit Review", "External Audit Submit"] }
];

const TEAM_MEMBERS = [
  "j.morales", "s.parker", "l.kim", "a.diaz", "p.nguyen", "m.harris", "k.zhao", "r.allen", "t.evans", "compliance.svc", "audit.svc"
];

const FILE_TYPE_ICONS = {
  docx: { bg: "#2a5699", color: "#ffffff", label: "W" },
  doc: { bg: "#2a5699", color: "#ffffff", label: "W" },
  xlsx: { bg: "#1e7245", color: "#ffffff", label: "X" },
  xls: { bg: "#1e7245", color: "#ffffff", label: "X" },
  pdf: { bg: "#b30b00", color: "#ffffff", label: "P" },
  pptx: { bg: "#d04423", color: "#ffffff", label: "P" }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.libraries) return parsed;
    }
  } catch (e) {}
  const fresh = { libraries: JSON.parse(JSON.stringify(DEFAULT_LIBRARIES)), activeSite: "contoso-finance", activeLibrary: "lib-contracts", activeView: "All Documents", selectedIds: [], activeRibbon: "documents", versionHistory: {}, workflows: {}, lastAction: "" };
  saveState(fresh);
  return fresh;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function fileExt(name) {
  const m = String(name || "").toLowerCase().match(/\.([a-z]+)$/);
  return m ? m[1] : "doc";
}

function fileIcon(name) {
  const ext = fileExt(name);
  const def = FILE_TYPE_ICONS[ext] || { bg: "#5e6c7a", color: "#fff", label: "F" };
  return `<span class="sp-doc-icon" style="background:${def.bg};color:${def.color};">${def.label}</span>`;
}

function escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function renderRibbon(state) {
  const lib = state.libraries[state.activeLibrary];
  const hasSel = state.selectedIds.length > 0;
  const sel = hasSel ? lib.items.find((d) => d.id === state.selectedIds[0]) : null;
  const checkedOutByMe = sel && sel.checkedOutTo === "you";
  const checkedOutOther = sel && sel.checkedOutTo && sel.checkedOutTo !== "you";

  const browseTab = `
    <div class="sp-ribbon-group">
      <div class="sp-ribbon-group-title">Site</div>
      <button class="sp-ribbon-btn" data-action="site-actions">Site Actions</button>
      <button class="sp-ribbon-btn" data-action="navigate-up">Navigate Up</button>
    </div>
  `;

  const documentsTab = `
    <div class="sp-ribbon-group">
      <div class="sp-ribbon-group-title">New</div>
      <button class="sp-ribbon-btn sp-ribbon-large" data-action="new-document"><div class="sp-ribbon-icon sp-icon-new"></div>New Document</button>
      <button class="sp-ribbon-btn" data-action="new-folder">New Folder</button>
    </div>
    <div class="sp-ribbon-group">
      <div class="sp-ribbon-group-title">Open &amp; Check Out</div>
      <button class="sp-ribbon-btn sp-ribbon-large" data-action="upload"><div class="sp-ribbon-icon sp-icon-upload"></div>Upload Document</button>
      <button class="sp-ribbon-btn" data-action="check-out" ${hasSel && !checkedOutOther ? "" : "disabled"}>Check Out</button>
      <button class="sp-ribbon-btn" data-action="check-in" ${checkedOutByMe ? "" : "disabled"}>Check In</button>
      <button class="sp-ribbon-btn" data-action="discard-checkout" ${checkedOutByMe ? "" : "disabled"}>Discard Check Out</button>
    </div>
    <div class="sp-ribbon-group">
      <div class="sp-ribbon-group-title">Manage</div>
      <button class="sp-ribbon-btn" data-action="version-history" ${hasSel ? "" : "disabled"}>Version History</button>
      <button class="sp-ribbon-btn" data-action="properties" ${hasSel ? "" : "disabled"}>Edit Properties</button>
      <button class="sp-ribbon-btn" data-action="workflows" ${hasSel ? "" : "disabled"}>Workflows</button>
      <button class="sp-ribbon-btn" data-action="permissions" ${hasSel ? "" : "disabled"}>Document Permissions</button>
    </div>
    <div class="sp-ribbon-group">
      <div class="sp-ribbon-group-title">Share &amp; Track</div>
      <button class="sp-ribbon-btn" data-action="email-link" ${hasSel ? "" : "disabled"}>E-mail a Link</button>
      <button class="sp-ribbon-btn" data-action="alert-me" ${hasSel ? "" : "disabled"}>Alert Me</button>
    </div>
    <div class="sp-ribbon-group">
      <div class="sp-ribbon-group-title">Copies</div>
      <button class="sp-ribbon-btn" data-action="download-copy" ${hasSel ? "" : "disabled"}>Download a Copy</button>
      <button class="sp-ribbon-btn" data-action="send-to" ${hasSel ? "" : "disabled"}>Send To</button>
    </div>
    <div class="sp-ribbon-group sp-ribbon-end">
      <button class="sp-ribbon-btn sp-ribbon-danger" data-action="delete" ${hasSel ? "" : "disabled"}>Delete Document</button>
    </div>
  `;

  const libraryTab = `
    <div class="sp-ribbon-group">
      <div class="sp-ribbon-group-title">View Format</div>
      <button class="sp-ribbon-btn" data-action="standard-view">Standard View</button>
      <button class="sp-ribbon-btn" data-action="datasheet-view">Datasheet View</button>
    </div>
    <div class="sp-ribbon-group">
      <div class="sp-ribbon-group-title">Manage Views</div>
      <button class="sp-ribbon-btn" data-action="create-view">Create View</button>
      <button class="sp-ribbon-btn" data-action="modify-view">Modify View</button>
      <select class="sp-ribbon-select" data-action="current-view">
        ${VIEWS.map((v) => `<option ${v === state.activeView ? "selected" : ""}>${v}</option>`).join("")}
      </select>
    </div>
    <div class="sp-ribbon-group">
      <div class="sp-ribbon-group-title">Settings</div>
      <button class="sp-ribbon-btn" data-action="library-settings">Library Settings</button>
      <button class="sp-ribbon-btn" data-action="library-perms">Library Permissions</button>
      <button class="sp-ribbon-btn" data-action="workflow-settings">Workflow Settings</button>
    </div>
    <div class="sp-ribbon-group">
      <div class="sp-ribbon-group-title">Connect &amp; Export</div>
      <button class="sp-ribbon-btn" data-action="export-excel">Export to Excel</button>
      <button class="sp-ribbon-btn" data-action="open-explorer">Open with Explorer</button>
      <button class="sp-ribbon-btn" data-action="connect-outlook">Connect to Outlook</button>
    </div>
  `;

  const tabBody = state.activeRibbon === "browse" ? browseTab : (state.activeRibbon === "library" ? libraryTab : documentsTab);

  return `
    <div class="sp-ribbon-tabs">
      <div class="sp-site-actions-menu">Site Actions <span>&#9662;</span></div>
      <button class="sp-ribbon-tab ${state.activeRibbon === "browse" ? "active" : ""}" data-ribbon="browse">Browse</button>
      <div class="sp-ribbon-tab-group">
        <div class="sp-ribbon-tab-group-label">Library Tools</div>
        <div class="sp-ribbon-tab-group-tabs">
          <button class="sp-ribbon-tab sp-tools ${state.activeRibbon === "documents" ? "active" : ""}" data-ribbon="documents">Documents</button>
          <button class="sp-ribbon-tab sp-tools ${state.activeRibbon === "library" ? "active" : ""}" data-ribbon="library">Library</button>
        </div>
      </div>
    </div>
    <div class="sp-ribbon-body ${state.activeRibbon === "documents" || state.activeRibbon === "library" ? "sp-ribbon-tools" : ""}">
      ${tabBody}
    </div>
  `;
}

function renderQuicklaunch(state) {
  const site = SITES.find((s) => s.id === state.activeSite) || SITES[0];
  return `
    <div class="sp-ql-header">${site.name}</div>
    <div class="sp-ql-section">
      <div class="sp-ql-section-title">Libraries</div>
      ${site.quicklaunch.filter((n) => n.type === "library").map((node) => `
        <a class="sp-ql-item ${state.activeLibrary === node.id ? "active" : ""}" data-library="${node.id}">
          <span class="sp-ql-icon" style="background:${node.iconColor};"></span>${node.label}
        </a>`).join("")}
    </div>
    <div class="sp-ql-section">
      <div class="sp-ql-section-title">Lists</div>
      ${site.quicklaunch.filter((n) => n.type === "list").map((node) => `
        <a class="sp-ql-item" data-noop="1">
          <span class="sp-ql-icon" style="background:${node.iconColor};"></span>${node.label}
        </a>`).join("")}
    </div>
    <div class="sp-ql-section">
      <div class="sp-ql-section-title">Subsites</div>
      ${site.quicklaunch.filter((n) => n.type === "subsite").map((node) => `
        <a class="sp-ql-item" data-noop="1">
          <span class="sp-ql-icon" style="background:${node.iconColor};"></span>${node.label}
        </a>`).join("")}
    </div>
    <div class="sp-ql-section">
      <a class="sp-ql-item" data-noop="1">
        <span class="sp-ql-icon" style="background:#c5c5c5;"></span>Recycle Bin
      </a>
      <a class="sp-ql-item" data-action="site-content">All Site Content</a>
    </div>
  `;
}

function renderLibraryGrid(state) {
  const lib = state.libraries[state.activeLibrary];
  if (!lib) return `<div class="sp-empty">Select a library from the left navigation.</div>`;
  const headers = lib.columns.map((c) => `<th class="sp-col-${c}">${COLUMN_LABELS[c] || c}</th>`).join("");
  let items = lib.items.slice();
  if (state.activeView === "Checked Out To Me") items = items.filter((i) => i.checkedOutTo === "you");
  else if (state.activeView === "Pending Review") items = items.filter((i) => /pending|review|awaiting|draft/i.test(i.status));
  else if (state.activeView === "Expiring This Quarter") items = items.filter((i) => /expiring/i.test(i.status) || (i.renewalDate && i.renewalDate.startsWith("2026")));
  else if (state.activeView === "Recent") items = items.slice(0, 4);

  const rows = items.map((item) => {
    const sel = state.selectedIds.includes(item.id);
    const cells = lib.columns.map((c) => {
      if (c === "name") {
        const checkedTag = item.checkedOutTo ? `<span class="sp-checked-out" title="Checked out to ${escape(item.checkedOutTo)}">[checked out]</span>` : "";
        return `<td class="sp-cell-name">${fileIcon(item.name)} <a class="sp-doc-link" data-doc-id="${item.id}">${escape(item.name)}</a> ${checkedTag}</td>`;
      }
      if (c === "status") {
        const cls = /approved|published/i.test(item.status) ? "status-ok" : /expiring/i.test(item.status) ? "status-warn" : /draft|progress|review|pending|awaiting|submitted/i.test(item.status) ? "status-info" : "";
        return `<td><span class="sp-status ${cls}">${escape(item.status)}</span></td>`;
      }
      return `<td>${escape(item[c] || "")}</td>`;
    }).join("");
    return `<tr class="sp-row ${sel ? "selected" : ""}" data-doc-id="${item.id}"><td class="sp-checkbox-cell"><input type="checkbox" data-doc-check="${item.id}" ${sel ? "checked" : ""} /></td>${cells}</tr>`;
  }).join("");

  return `
    <div class="sp-library-header">
      <div class="sp-breadcrumb">Contoso Finance &raquo; <span>${escape(lib.libraryName)}</span></div>
      <div class="sp-library-actions">
        <span class="sp-page-meta">${items.length} items &nbsp;|&nbsp; View: <strong>${escape(state.activeView)}</strong></span>
      </div>
    </div>
    <table class="sp-library">
      <thead>
        <tr><th class="sp-checkbox-cell"><input type="checkbox" data-select-all /></th>${headers}</tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="${lib.columns.length + 1}" class="sp-empty">No items match this view.</td></tr>`}</tbody>
    </table>
  `;
}

function renderDocPreview(state) {
  const lib = state.libraries[state.activeLibrary];
  if (!lib || state.selectedIds.length === 0) {
    return `<div class="sp-preview-empty">Select a document to view properties, version history, and workflows.</div>`;
  }
  const item = lib.items.find((i) => i.id === state.selectedIds[0]);
  if (!item) return "";
  const versions = (state.versionHistory[item.id] || []).slice().reverse();
  const wf = state.workflows[item.id];
  return `
    <div class="sp-preview-card">
      <div class="sp-preview-head">${fileIcon(item.name)} <span>${escape(item.name)}</span></div>
      <div class="sp-preview-meta">
        <div><strong>Modified:</strong> ${escape(item.modified)} by ${escape(item.modifiedBy)}</div>
        <div><strong>Version:</strong> ${escape(item.version)} &nbsp; <strong>Size:</strong> ${escape(item.size)}</div>
        <div><strong>Status:</strong> ${escape(item.status)}</div>
        ${item.checkedOutTo ? `<div class="sp-preview-warn">Checked out to ${escape(item.checkedOutTo)}</div>` : ""}
      </div>
      <div class="sp-preview-section">
        <div class="sp-preview-section-title">Properties</div>
        <table class="sp-prop-table">
          ${lib.columns.filter((c) => c !== "name" && c !== "modified" && c !== "modifiedBy").map((c) => `
            <tr><th>${COLUMN_LABELS[c] || c}</th><td>${escape(item[c] || "")}</td></tr>
          `).join("")}
        </table>
      </div>
      <div class="sp-preview-section">
        <div class="sp-preview-section-title">Version History</div>
        ${versions.length ? `<table class="sp-prop-table"><tr><th>Ver</th><th>When</th><th>Who</th><th>Comment</th></tr>${versions.map((v) => `<tr><td>${escape(v.version)}</td><td>${escape(v.timestamp)}</td><td>${escape(v.author)}</td><td>${escape(v.comment)}</td></tr>`).join("")}</table>` : `<div class="sp-preview-empty-small">No prior versions captured in this session.</div>`}
      </div>
      <div class="sp-preview-section">
        <div class="sp-preview-section-title">Workflow Status</div>
        ${wf ? `<div class="sp-wf-step">Workflow: <strong>${escape(wf.name)}</strong> &middot; Step ${wf.stepIndex + 1} of ${wf.steps.length}: <strong>${escape(wf.steps[wf.stepIndex])}</strong></div>` : `<div class="sp-preview-empty-small">No active workflow. Use Documents ribbon &gt; Workflows to start one.</div>`}
      </div>
    </div>
  `;
}

function renderStatusBar(state) {
  return `<div class="sp-statusbar">${escape(state.lastAction || "Ready")} &nbsp;&middot;&nbsp; Site: <strong>${escape(SITES[0].name)}</strong> &nbsp;&middot;&nbsp; User: <strong>you</strong> &nbsp;&middot;&nbsp; SharePoint Server 2010 Enterprise</div>`;
}

function renderShell(state) {
  return `
    <div class="sp-shell">
      <div class="sp-suite-bar">
        <div class="sp-suite-left">Contoso Document Center</div>
        <div class="sp-suite-right">
          <span>you@contoso.com</span>
          <a href="../" class="sp-suite-link">My Site</a>
          <a href="../" class="sp-suite-link">My Links</a>
          <button class="sp-help" type="button" data-action="legacy-app-help" title="App context">?</button>
        </div>
      </div>
      <div class="sp-title-bar">
        <div class="sp-logo">SharePoint</div>
        <div class="sp-title">Contoso Finance &raquo; ${escape(state.libraries[state.activeLibrary].libraryName)}</div>
        <div class="sp-search"><input type="text" placeholder="Search this site..." /><button>&#128270;</button></div>
      </div>
      <div class="sp-ribbon">${renderRibbon(state)}</div>
      <div class="sp-body">
        <aside class="sp-ql">${renderQuicklaunch(state)}</aside>
        <main class="sp-main">
          <div class="sp-grid-wrap">${renderLibraryGrid(state)}</div>
        </main>
        <aside class="sp-preview">${renderDocPreview(state)}</aside>
      </div>
      ${renderStatusBar(state)}
    </div>
  `;
}

function recordAudit(state, item, comment, author) {
  if (!state.versionHistory[item.id]) state.versionHistory[item.id] = [];
  state.versionHistory[item.id].push({ version: item.version, timestamp: new Date().toLocaleString(), author, comment });
}

function bumpVersion(version, major) {
  const m = String(version || "0.0").split(".").map(Number);
  if (major) return `${(m[0] || 0) + 1}.0`;
  return `${m[0] || 0}.${(m[1] || 0) + 1}`;
}

function nowStamp() {
  return new Date().toLocaleString([], { month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function openModal(html) {
  closeModal();
  const m = document.createElement("div");
  m.className = "sp-modal-overlay";
  m.innerHTML = `<div class="sp-modal">${html}</div>`;
  document.body.appendChild(m);
  m.addEventListener("click", (e) => { if (e.target === m) closeModal(); });
}
function closeModal() { document.querySelectorAll(".sp-modal-overlay").forEach((n) => n.remove()); }

function openAppDescription() {
  openModal(`
    <div class="sp-modal-head">App Context</div>
    <pre class="sp-modal-body">${escape(APP_DESCRIPTION)}</pre>
    <div class="sp-modal-foot"><button class="sp-btn-primary" data-modal-close>Close</button></div>
  `);
}

function openWorkflowDialog(state, item) {
  openModal(`
    <div class="sp-modal-head">Start a Workflow on '${escape(item.name)}'</div>
    <div class="sp-modal-body">
      <p>Select a workflow to associate with this document.</p>
      ${WORKFLOWS.map((wf) => `<label class="sp-radio"><input type="radio" name="wf" value="${wf.id}" /> <strong>${escape(wf.name)}</strong> &nbsp;<span class="sp-muted">Steps: ${wf.steps.join(" &rarr; ")}</span></label>`).join("")}
    </div>
    <div class="sp-modal-foot">
      <button class="sp-btn-primary" data-modal-start-wf>Start</button>
      <button class="sp-btn" data-modal-close>Cancel</button>
    </div>
  `);
}

function openCheckInDialog(state, item) {
  openModal(`
    <div class="sp-modal-head">Check In '${escape(item.name)}'</div>
    <div class="sp-modal-body">
      <label class="sp-form-row">Version Type
        <select name="major">
          <option value="minor">Minor version (incremental change)</option>
          <option value="major">Major version (publish)</option>
        </select>
      </label>
      <label class="sp-form-row">Check-in comments
        <textarea name="comment" rows="4" placeholder="Describe the changes..."></textarea>
      </label>
    </div>
    <div class="sp-modal-foot">
      <button class="sp-btn-primary" data-modal-checkin>OK</button>
      <button class="sp-btn" data-modal-close>Cancel</button>
    </div>
  `);
}

function openPropertiesDialog(state, item) {
  const lib = state.libraries[state.activeLibrary];
  openModal(`
    <div class="sp-modal-head">Edit Properties - ${escape(item.name)}</div>
    <div class="sp-modal-body">
      ${lib.columns.filter((c) => c !== "modified" && c !== "modifiedBy" && c !== "checkedOutTo").map((c) => `
        <label class="sp-form-row"><span>${COLUMN_LABELS[c] || c}</span>
          <input type="text" name="${c}" value="${escape(item[c] || "")}" />
        </label>`).join("")}
    </div>
    <div class="sp-modal-foot">
      <button class="sp-btn-primary" data-modal-save-props>OK</button>
      <button class="sp-btn" data-modal-close>Cancel</button>
    </div>
  `);
}

function openUploadDialog(state) {
  openModal(`
    <div class="sp-modal-head">Upload Document</div>
    <div class="sp-modal-body">
      <label class="sp-form-row"><span>Name</span><input type="text" name="name" placeholder="ReportName.docx" /></label>
      <label class="sp-form-row"><span>Upload comments</span><textarea name="comment" rows="3" placeholder="Initial upload"></textarea></label>
      <label class="sp-checkbox-line"><input type="checkbox" name="overwrite" checked /> Add as a new version to existing files</label>
    </div>
    <div class="sp-modal-foot">
      <button class="sp-btn-primary" data-modal-upload>OK</button>
      <button class="sp-btn" data-modal-close>Cancel</button>
    </div>
  `);
}

let STATE = loadState();
const root = () => document.getElementById("app");

function render() {
  if (!root()) return;
  root().innerHTML = renderShell(STATE);
  wireUp();
}

function setAction(msg) { STATE.lastAction = msg; }

function wireUp() {
  document.querySelectorAll(".sp-ribbon-tab").forEach((b) => b.addEventListener("click", () => { STATE.activeRibbon = b.dataset.ribbon; saveState(STATE); render(); }));
  document.querySelectorAll("[data-library]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); STATE.activeLibrary = a.dataset.library; STATE.selectedIds = []; saveState(STATE); render(); }));
  document.querySelectorAll("[data-doc-id]").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "A") return;
      const id = row.dataset.docId;
      STATE.selectedIds = STATE.selectedIds.includes(id) && STATE.selectedIds.length === 1 ? [] : [id];
      saveState(STATE); render();
    });
  });
  document.querySelectorAll("[data-doc-check]").forEach((cb) => {
    cb.addEventListener("click", (e) => e.stopPropagation());
    cb.addEventListener("change", () => {
      const id = cb.dataset.docCheck;
      if (cb.checked) STATE.selectedIds = Array.from(new Set([...STATE.selectedIds, id]));
      else STATE.selectedIds = STATE.selectedIds.filter((i) => i !== id);
      saveState(STATE); render();
    });
  });
  const all = document.querySelector("[data-select-all]");
  if (all) all.addEventListener("change", () => {
    const lib = STATE.libraries[STATE.activeLibrary];
    STATE.selectedIds = all.checked ? lib.items.map((i) => i.id) : [];
    saveState(STATE); render();
  });
  const viewSel = document.querySelector('[data-action="current-view"]');
  if (viewSel) viewSel.addEventListener("change", () => { STATE.activeView = viewSel.value; saveState(STATE); render(); });

  document.querySelectorAll(".sp-ribbon-btn").forEach((btn) => btn.addEventListener("click", () => handleAction(btn.dataset.action)));
  document.querySelector('[data-action="legacy-app-help"]').addEventListener("click", openAppDescription);
  document.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", closeModal));
  document.querySelectorAll(".sp-doc-link").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); const id = a.dataset.docId; STATE.selectedIds = [id]; saveState(STATE); render(); }));
}

function handleAction(action) {
  const lib = STATE.libraries[STATE.activeLibrary];
  const sel = STATE.selectedIds.length ? lib.items.find((d) => d.id === STATE.selectedIds[0]) : null;
  switch (action) {
    case "new-document":
    case "upload": openUploadDialog(STATE); wireModal(); break;
    case "new-folder":
      setAction("Folder created (new folder dialog skipped in demo)");
      lib.items.unshift({ id: `folder-${Date.now()}`, name: "[Folder] New Folder", modified: nowStamp(), modifiedBy: "you", checkedOutTo: "", contractType: "", renewalDate: "", policyArea: "", reviewCycle: "", period: "", preparer: "", control: "", tester: "", status: "Folder", version: "-", size: "-" });
      saveState(STATE); render(); break;
    case "check-out":
      if (!sel) return;
      if (sel.checkedOutTo) { setAction(`'${sel.name}' is already checked out`); render(); return; }
      sel.checkedOutTo = "you";
      recordAudit(STATE, sel, "Checked out", "you");
      setAction(`Checked out '${sel.name}' to you`);
      saveState(STATE); render(); break;
    case "check-in":
      if (!sel || sel.checkedOutTo !== "you") return;
      openCheckInDialog(STATE, sel); wireModal(); break;
    case "discard-checkout":
      if (!sel || sel.checkedOutTo !== "you") return;
      sel.checkedOutTo = "";
      setAction(`Discarded check out on '${sel.name}'`);
      saveState(STATE); render(); break;
    case "version-history":
      if (!sel) return;
      openModal(`
        <div class="sp-modal-head">Version History - ${escape(sel.name)}</div>
        <div class="sp-modal-body">
          <table class="sp-prop-table"><tr><th>Ver</th><th>When</th><th>Who</th><th>Comment</th></tr>
            ${(STATE.versionHistory[sel.id] || []).slice().reverse().map((v) => `<tr><td>${escape(v.version)}</td><td>${escape(v.timestamp)}</td><td>${escape(v.author)}</td><td>${escape(v.comment)}</td></tr>`).join("") || `<tr><td colspan="4">No version history captured.</td></tr>`}
          </table>
        </div>
        <div class="sp-modal-foot"><button class="sp-btn-primary" data-modal-close>Close</button></div>
      `); wireModal(); break;
    case "properties":
      if (!sel) return; openPropertiesDialog(STATE, sel); wireModal(); break;
    case "workflows":
      if (!sel) return; openWorkflowDialog(STATE, sel); wireModal(); break;
    case "permissions":
      if (!sel) return;
      openModal(`
        <div class="sp-modal-head">Document Permissions - ${escape(sel.name)}</div>
        <div class="sp-modal-body">
          <table class="sp-prop-table"><tr><th>User/Group</th><th>Permission</th></tr>
            <tr><td>Contoso\\Finance Owners</td><td>Full Control</td></tr>
            <tr><td>Contoso\\Finance Members</td><td>Contribute</td></tr>
            <tr><td>Contoso\\Audit Readers</td><td>Read</td></tr>
            <tr><td>${escape(sel.modifiedBy)}</td><td>Contribute (Author)</td></tr>
          </table>
        </div>
        <div class="sp-modal-foot"><button class="sp-btn-primary" data-modal-close>Close</button></div>
      `); wireModal(); break;
    case "email-link":
      setAction(`E-mail link copied for '${sel ? sel.name : ""}'`); render(); break;
    case "alert-me":
      setAction(`Alert subscription set for '${sel ? sel.name : ""}'`); render(); break;
    case "download-copy":
      setAction(`Download started: '${sel ? sel.name : ""}'`); render(); break;
    case "send-to":
      setAction(`'Send To' destinations dialog opened`); render(); break;
    case "delete":
      if (!sel) return;
      lib.items = lib.items.filter((i) => i.id !== sel.id);
      STATE.selectedIds = [];
      setAction(`Sent '${sel.name}' to Site Recycle Bin`);
      saveState(STATE); render(); break;
    case "export-excel":
      exportExcel(); break;
    case "open-explorer":
      setAction("Opening library in Windows Explorer (WebDAV)..."); render(); break;
    case "connect-outlook":
      setAction("Connected library to Outlook for offline sync."); render(); break;
    case "library-settings":
    case "library-perms":
    case "workflow-settings":
    case "create-view":
    case "modify-view":
    case "standard-view":
    case "datasheet-view":
    case "site-actions":
    case "navigate-up":
    case "site-content":
      setAction(`Ribbon: ${action.replace(/-/g, " ")}`); render(); break;
  }
}

function wireModal() {
  document.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", closeModal));
  const startWf = document.querySelector("[data-modal-start-wf]");
  if (startWf) startWf.addEventListener("click", () => {
    const lib = STATE.libraries[STATE.activeLibrary];
    const sel = lib.items.find((d) => d.id === STATE.selectedIds[0]);
    const radio = document.querySelector('input[name="wf"]:checked');
    if (!radio || !sel) { closeModal(); return; }
    const wf = WORKFLOWS.find((w) => w.id === radio.value);
    STATE.workflows[sel.id] = { name: wf.name, steps: wf.steps, stepIndex: 0 };
    setAction(`Started workflow '${wf.name}' on '${sel.name}'`);
    closeModal(); saveState(STATE); render();
  });
  const checkIn = document.querySelector("[data-modal-checkin]");
  if (checkIn) checkIn.addEventListener("click", () => {
    const lib = STATE.libraries[STATE.activeLibrary];
    const sel = lib.items.find((d) => d.id === STATE.selectedIds[0]);
    const major = document.querySelector('select[name="major"]').value === "major";
    const comment = document.querySelector('textarea[name="comment"]').value || "(no comment)";
    sel.version = bumpVersion(sel.version, major);
    sel.modified = nowStamp();
    sel.modifiedBy = "you";
    sel.checkedOutTo = "";
    if (major && /draft|review|pending|progress|in progress/i.test(sel.status)) sel.status = "Approved";
    recordAudit(STATE, sel, comment, "you");
    setAction(`Checked in '${sel.name}' as v${sel.version} (${major ? "major" : "minor"})`);
    closeModal(); saveState(STATE); render();
  });
  const saveProps = document.querySelector("[data-modal-save-props]");
  if (saveProps) saveProps.addEventListener("click", () => {
    const lib = STATE.libraries[STATE.activeLibrary];
    const sel = lib.items.find((d) => d.id === STATE.selectedIds[0]);
    document.querySelectorAll(".sp-modal input[type=text]").forEach((inp) => { sel[inp.name] = inp.value; });
    sel.modified = nowStamp(); sel.modifiedBy = "you";
    setAction(`Properties updated for '${sel.name}'`);
    closeModal(); saveState(STATE); render();
  });
  const upload = document.querySelector("[data-modal-upload]");
  if (upload) upload.addEventListener("click", () => {
    const lib = STATE.libraries[STATE.activeLibrary];
    const name = (document.querySelector('input[name="name"]').value || `New Document ${Date.now()}.docx`).trim();
    const comment = document.querySelector('textarea[name="comment"]').value || "Initial upload";
    const id = `doc-${Date.now()}`;
    lib.items.unshift({ id, name, modified: nowStamp(), modifiedBy: "you", checkedOutTo: "", contractType: "", renewalDate: "", policyArea: "", reviewCycle: "", period: "", preparer: "", control: "", tester: "", status: "Draft", version: "0.1", size: "12 KB" });
    if (!STATE.versionHistory[id]) STATE.versionHistory[id] = [];
    STATE.versionHistory[id].push({ version: "0.1", timestamp: new Date().toLocaleString(), author: "you", comment });
    STATE.selectedIds = [id];
    setAction(`Uploaded '${name}'`);
    closeModal(); saveState(STATE); render();
  });
}

function exportExcel() {
  const lib = STATE.libraries[STATE.activeLibrary];
  const headers = ["Name", ...lib.columns.filter((c) => c !== "name").map((c) => COLUMN_LABELS[c] || c)];
  const rows = lib.items.map((i) => [i.name, ...lib.columns.filter((c) => c !== "name").map((c) => i[c] || "")]);
  const csv = "\uFEFF" + [headers, ...rows].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${lib.libraryName.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link); link.click(); link.remove();
  URL.revokeObjectURL(link.href);
  setAction(`Exported ${lib.items.length} items from '${lib.libraryName}' to Excel`);
  render();
}

// Inline stylesheet (full SharePoint 2010 look)
const css = document.createElement("style");
css.textContent = `
  body { background: #ffffff; }
  .sp-shell { display: flex; flex-direction: column; min-height: 100vh; background: #ffffff; color: #1f1f1f; font-family: "Segoe UI", Tahoma, Verdana, Arial, sans-serif; font-size: 12px; }
  .sp-suite-bar { background: #21374C; color: #cfdcef; padding: 4px 10px; display: flex; justify-content: space-between; font-size: 11px; }
  .sp-suite-link { color: #cfdcef; text-decoration: none; margin-left: 10px; }
  .sp-suite-right { display: inline-flex; align-items: center; gap: 8px; }
  .sp-help { background: #1f497d; color: #fff; border: 1px solid #0e2945; width: 18px; height: 18px; border-radius: 2px; cursor: pointer; font-weight: 700; font-size: 11px; line-height: 14px; padding: 0; }
  .sp-title-bar { background: linear-gradient(to bottom, #ffffff 0%, #dde7f4 100%); border-bottom: 1px solid #b3c4d8; padding: 6px 10px; display: flex; align-items: center; gap: 14px; }
  .sp-logo { font-size: 18px; font-weight: 300; color: #1f497d; letter-spacing: -0.5px; }
  .sp-title { font-size: 13px; color: #1f497d; font-weight: 600; flex: 1; }
  .sp-search { display: inline-flex; }
  .sp-search input { border: 1px solid #7e8896; padding: 3px 6px; font-size: 12px; width: 240px; }
  .sp-search button { border: 1px solid #7e8896; border-left: 0; background: linear-gradient(to bottom, #fff 0%, #d9e3ef 100%); padding: 2px 8px; cursor: pointer; }
  .sp-ribbon { border-bottom: 1px solid #b3c4d8; background: #f5f9fd; }
  .sp-ribbon-tabs { display: flex; align-items: flex-end; padding: 0 8px; background: linear-gradient(to bottom, #e6eef8 0%, #d2dff0 100%); border-bottom: 1px solid #afc1d8; gap: 4px; height: 24px; }
  .sp-site-actions-menu { padding: 4px 10px; background: linear-gradient(to bottom, #f5d877 0%, #d49a1a 100%); color: #4a3500; border: 1px solid #b87f00; border-bottom: 0; font-size: 11px; font-weight: 600; cursor: pointer; }
  .sp-ribbon-tab { background: transparent; border: 0; padding: 4px 14px; cursor: pointer; color: #1f497d; font-size: 12px; }
  .sp-ribbon-tab.active { background: #ffffff; border: 1px solid #afc1d8; border-bottom: 0; font-weight: 600; }
  .sp-ribbon-tab-group { display: inline-flex; flex-direction: column; align-items: stretch; margin-left: 8px; }
  .sp-ribbon-tab-group-label { background: linear-gradient(to bottom, #fcdf8a 0%, #e6a93a 100%); color: #4a3500; padding: 0 10px; font-size: 10px; text-align: center; border: 1px solid #b87f00; border-bottom: 0; }
  .sp-ribbon-tab-group-tabs { display: inline-flex; }
  .sp-ribbon-tab.sp-tools { background: linear-gradient(to bottom, #fff6dc 0%, #ffe48a 100%); border: 1px solid #b87f00; border-bottom: 0; color: #4a3500; }
  .sp-ribbon-tab.sp-tools.active { background: #fffbe5; }
  .sp-ribbon-body { display: flex; gap: 6px; padding: 6px 10px; background: #f5f9fd; min-height: 78px; }
  .sp-ribbon-body.sp-ribbon-tools { background: #fffbe5; }
  .sp-ribbon-group { display: flex; flex-direction: column; padding: 2px 8px; border-right: 1px solid #d1ddec; min-width: 110px; }
  .sp-ribbon-group-title { font-size: 10px; color: #4f5b6c; text-align: center; padding-top: 4px; order: 99; }
  .sp-ribbon-btn { background: transparent; border: 1px solid transparent; padding: 3px 6px; font-size: 11px; color: #1f1f1f; cursor: pointer; text-align: left; display: inline-flex; align-items: center; gap: 4px; }
  .sp-ribbon-btn:hover:not(:disabled) { background: #fff3bf; border-color: #d3b85a; }
  .sp-ribbon-btn:disabled { color: #a0a0a0; cursor: default; }
  .sp-ribbon-large { flex-direction: column; min-width: 60px; padding: 2px 6px 4px; font-size: 11px; }
  .sp-ribbon-icon { width: 32px; height: 32px; background: linear-gradient(to bottom, #ffffff 0%, #d9d9d9 100%); border: 1px solid #9e9e9e; display: inline-block; }
  .sp-icon-new { background: linear-gradient(to bottom, #fff 0%, #cce4ff 100%); position: relative; }
  .sp-icon-new::after { content: "+"; position: absolute; right: 2px; bottom: -2px; color: #2a5699; font-weight: 700; font-size: 16px; }
  .sp-icon-upload { background: linear-gradient(to bottom, #fff 0%, #cfeacc 100%); position: relative; }
  .sp-icon-upload::after { content: "↑"; position: absolute; right: 2px; top: -1px; color: #2a7d2a; font-weight: 700; font-size: 16px; }
  .sp-ribbon-select { border: 1px solid #7e8896; padding: 2px; font-size: 11px; margin-top: 2px; }
  .sp-ribbon-danger { color: #a01000; }
  .sp-ribbon-end { margin-left: auto; border-right: 0; }
  .sp-body { display: grid; grid-template-columns: 200px 1fr 320px; flex: 1; min-height: 0; }
  .sp-ql { background: #f4f8fc; border-right: 1px solid #cfd9e6; padding: 8px 0; font-size: 12px; }
  .sp-ql-header { padding: 4px 12px 8px; font-weight: 700; color: #1f497d; }
  .sp-ql-section { padding: 4px 0; }
  .sp-ql-section-title { color: #1f497d; font-weight: 600; padding: 2px 12px; font-size: 11px; text-transform: uppercase; }
  .sp-ql-item { display: flex; align-items: center; gap: 6px; padding: 3px 12px 3px 16px; color: #1f497d; cursor: pointer; text-decoration: none; }
  .sp-ql-item:hover { background: #dde7f4; }
  .sp-ql-item.active { background: #1f497d; color: #ffffff; }
  .sp-ql-icon { display: inline-block; width: 10px; height: 10px; }
  .sp-main { background: #ffffff; padding: 10px 14px; min-width: 0; overflow: auto; }
  .sp-library-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #c9d6e8; padding-bottom: 4px; margin-bottom: 4px; }
  .sp-breadcrumb { font-size: 12px; color: #1f497d; font-weight: 600; }
  .sp-page-meta { font-size: 11px; color: #4f5b6c; }
  .sp-library { width: 100%; border-collapse: collapse; }
  .sp-library th { text-align: left; background: #e6eef8; color: #1f497d; padding: 4px 6px; font-size: 11px; border-bottom: 1px solid #c9d6e8; font-weight: 600; }
  .sp-library td { padding: 4px 6px; font-size: 12px; border-bottom: 1px dotted #dfe6ee; vertical-align: middle; }
  .sp-row { cursor: pointer; }
  .sp-row:hover td { background: #fffbe5; }
  .sp-row.selected td { background: #ffeaa3; }
  .sp-checkbox-cell { width: 22px; text-align: center; }
  .sp-doc-link { color: #1f497d; text-decoration: none; }
  .sp-doc-link:hover { text-decoration: underline; }
  .sp-doc-icon { display: inline-block; width: 18px; height: 18px; text-align: center; line-height: 18px; font-size: 11px; font-weight: 700; margin-right: 4px; border-radius: 1px; }
  .sp-status { display: inline-block; padding: 1px 6px; border: 1px solid #b7c3d3; background: #eef3fa; font-size: 11px; }
  .sp-status.status-ok { background: #dff0d8; border-color: #8aba6c; color: #2c5b1c; }
  .sp-status.status-warn { background: #fcf2d2; border-color: #d5b04e; color: #6b4900; }
  .sp-status.status-info { background: #d9edf7; border-color: #5b9bd5; color: #1f497d; }
  .sp-checked-out { color: #b87f00; font-size: 10px; margin-left: 4px; }
  .sp-preview { border-left: 1px solid #cfd9e6; background: #f4f8fc; padding: 8px; overflow: auto; }
  .sp-preview-card { background: #fff; border: 1px solid #cfd9e6; padding: 8px; }
  .sp-preview-head { font-weight: 600; color: #1f497d; font-size: 13px; border-bottom: 1px solid #cfd9e6; padding-bottom: 4px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .sp-preview-meta div { padding: 1px 0; font-size: 11px; color: #2f3d52; }
  .sp-preview-warn { color: #a01000; font-weight: 600; }
  .sp-preview-section { margin-top: 8px; }
  .sp-preview-section-title { font-weight: 600; color: #1f497d; font-size: 12px; border-bottom: 1px solid #e0e8f4; padding-bottom: 2px; margin-bottom: 4px; }
  .sp-prop-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .sp-prop-table th { text-align: left; background: #eef3fa; padding: 3px 6px; color: #1f497d; font-weight: 600; border-bottom: 1px solid #cfd9e6; }
  .sp-prop-table td { padding: 3px 6px; border-bottom: 1px dotted #dfe6ee; }
  .sp-preview-empty, .sp-preview-empty-small { color: #6c7a8d; font-style: italic; font-size: 11px; padding: 6px; }
  .sp-preview-empty { padding: 20px; text-align: center; }
  .sp-wf-step { font-size: 11px; }
  .sp-statusbar { background: #1f497d; color: #cfdcef; padding: 4px 10px; font-size: 11px; }
  .sp-modal-overlay { position: fixed; inset: 0; background: rgba(31,45,71,0.5); display: flex; align-items: flex-start; justify-content: center; z-index: 9999; padding-top: 80px; }
  .sp-modal { background: #ffffff; border: 1px solid #1f497d; min-width: 460px; max-width: 720px; box-shadow: 2px 2px 8px rgba(0,0,0,0.3); }
  .sp-modal-head { background: linear-gradient(to bottom, #2a5fa0 0%, #1f497d 100%); color: #fff; padding: 6px 12px; font-weight: 600; }
  .sp-modal-body { padding: 12px 16px; font-size: 12px; max-height: 60vh; overflow: auto; }
  .sp-modal-foot { padding: 8px 12px; background: #eef3fa; border-top: 1px solid #cfd9e6; display: flex; gap: 6px; justify-content: flex-end; }
  .sp-form-row { display: grid; grid-template-columns: 140px 1fr; gap: 6px; align-items: center; padding: 4px 0; }
  .sp-form-row > span { color: #1f497d; font-weight: 600; font-size: 11px; }
  .sp-form-row input, .sp-form-row select, .sp-form-row textarea { border: 1px solid #7e8896; padding: 3px 5px; font-size: 12px; font-family: inherit; }
  .sp-btn, .sp-btn-primary { border: 1px solid #7e8896; padding: 3px 12px; font-size: 12px; cursor: pointer; font-family: inherit; }
  .sp-btn { background: linear-gradient(to bottom, #fff 0%, #d9e3ef 100%); }
  .sp-btn-primary { background: linear-gradient(to bottom, #4d7fc1 0%, #1f497d 100%); color: #fff; border-color: #1f497d; }
  .sp-radio { display: block; padding: 4px 0; }
  .sp-checkbox-line { display: block; padding: 4px 0; }
  .sp-muted { color: #6c7a8d; font-size: 11px; }
  .sp-empty { padding: 20px; text-align: center; color: #6c7a8d; }
  pre.sp-modal-body { white-space: pre-wrap; font-family: inherit; font-size: 12px; line-height: 1.4; }
`;
document.head.appendChild(css);

render();
