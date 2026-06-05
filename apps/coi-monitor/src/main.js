import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "coi-monitor";
const modules = [
  { id: "certificates", label: "Certificates" },
  { id: "reminders", label: "Reminders" },
  { id: "collection", label: "Document Collection" },
  { id: "compliance", label: "Compliance" },
  { id: "exceptions", label: "Exceptions" }
];

const columns = {
  certificates: ["certificateId", "vendor", "expirationDate", "policyCarrier", "coverageTier", "complianceStatus", "renewalStage", "lock"],
  reminders: ["reminderId", "vendor", "noticeType", "noticeChannel", "escalationStage", "overdueDays", "contactRetryCount", "status"],
  collection: ["docId", "vendor", "docType", "ocrStatus", "acordStatus", "missingIndicator", "uploadedAt", "status"],
  compliance: ["complianceId", "vendor", "eligibility", "contractHold", "siteAccess", "subcontractorScore", "autoExpiryMonitor", "status"],
  exceptions: ["exceptionId", "vendor", "exceptionType", "severity", "queueOwner", "lastUpdate", "resolution", "status"]
};

const palette = {
  "--legacy-bg": "#d6d1c6",
  "--legacy-panel": "#ece7dc",
  "--legacy-nav": "#cdc5b8",
  "--legacy-grid-head": "#d9d0c1",
  "--legacy-active": "#5f6f53",
  "--legacy-font": "Tahoma, Verdana, Arial, sans-serif"
};

const ENVIRONMENT = "VENDOR-COMPLIANCE-PROD01";
const ANALYST = "RISKOPS\\c.holloway";
const REFERENCE_DATE = new Date("2011-08-15T08:30:00");

const backgroundServices = [
  "ACORD_IMPORT_ENGINE",
  "RENEWAL_REMINDER_JOB",
  "COMPLIANCE_SYNC_02",
  "OCR_DOC_PROCESSOR",
  "VENDOR_STATUS_MONITOR"
];

const systemMessages = [
  "Vendor compliance status pending.",
  "Policy endorsement missing.",
  "Certificate locked by another reviewer.",
  "Coverage threshold below requirement.",
  "Renewal reminder batch processing.",
  "ACORD extraction failed validation."
];

const retryLogs = [
  "[02:14:11] Reprocessing ACORD extraction...",
  "[02:14:15] Syncing compliance status...",
  "[02:14:19] Vendor record updated successfully."
];

const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - COI Monitor 2011

COI Monitor 2011 is a legacy vendor-compliance application used to manage Certificates of Insurance (COIs), vendor coverage validation, renewal tracking, and contractor compliance workflows.

The application centralizes certificate-management activities into a desktop operations environment commonly used by risk-management teams, procurement departments, facilities operations, and vendor compliance groups.

The platform supports:
- certificate tracking
- expiration monitoring
- renewal reminder workflows
- compliance validation
- document collection
- exception handling
- vendor eligibility tracking
- audit-history reporting

The application was commonly used within:
- construction organizations
- manufacturing companies
- facilities-management operations
- logistics providers
- energy and utilities companies
- enterprise procurement departments

The platform integrates with:
- vendor-management systems
- shared-drive repositories
- Outlook mailboxes
- PDF archives
- spreadsheet compliance logs
- contractor onboarding systems
- legacy ERP vendor records

Operational workflows are organized around queue-based processes including:
- expiring certificate queues
- missing-document exceptions
- renewal reminder campaigns
- compliance reviews
- endorsement verification
- vendor lock handling
- archived certificate records

The interface reflects enterprise desktop systems commonly developed using:
- VB.NET WinForms
- ASP.NET WebForms
- PowerBuilder
- early .NET desktop applications

The application provides:
- certificate dashboards
- expiration tracking
- compliance exception panels
- vendor document management
- audit-history viewers
- renewal campaign monitoring
- upload-processing indicators
- background synchronization tracking

Typical users include:
- vendor compliance analysts
- procurement specialists
- risk-management teams
- contractor onboarding coordinators
- facilities operations staff
- compliance-review supervisors

RPA PROBLEM STATEMENT

Many certificate-tracking and vendor-compliance workflows involve repetitive manual interaction across disconnected systems, email inboxes, document repositories, spreadsheets, and desktop applications.

Common activities include:
- opening emailed certificates
- reviewing PDF insurance forms
- entering expiration dates manually
- validating policy coverage amounts
- organizing vendor documents
- sending renewal reminders
- updating compliance spreadsheets
- routing expired vendors for review
- retrying failed document imports

These repetitive workflows create opportunities for RPA solutions to:
- automate certificate ingestion
- extract insurance details from PDFs
- streamline compliance workflows
- automate reminder generation
- reduce manual data entry
- improve expiration visibility
- centralize vendor document processing
- support attended and unattended automation scenarios`;

let activeModule = modules[0].id;
let queueView = "Exception-Driven";
let randomMessage = systemMessages[0];
let reminderPulse = 17;
let ingestionQueue = 6;

let activityFeed = [
  `${new Date().toLocaleString()} Overnight sync completed for vendor lock table`,
  `${new Date().toLocaleString()} Renewal campaign segment R3 released`,
  `${new Date().toLocaleString()} ACORD parser waiting on 2 unsupported forms`
];

let auditFeed = [
  makeAudit("Upload", "DOC-ACORD-9001 accepted and indexed"),
  makeAudit("Override", "Coverage waiver approved for Iron Peak Logistics"),
  makeAudit("Reminder", "Escalation notice sent to Northline Contractors")
];

let statusTimer = null;
let queueTimer = null;

ensureSeed(namespace, () => ({
  certificates: [
    { certificateId: "COI-1001", vendor: "Northline Contractors", expirationDate: "2011-09-10", policyCarrier: "Zurich", coverageTier: "Tier-1 / 2M GL", complianceStatus: "Pending", renewalStage: "Notice-1", lock: "Open" },
    { certificateId: "COI-1002", vendor: "Summit Process Controls", expirationDate: "2011-08-20", policyCarrier: "Travelers", coverageTier: "Tier-2 / 1M GL", complianceStatus: "Exception", renewalStage: "Escalated", lock: "Locked" },
    { certificateId: "COI-1003", vendor: "Iron Peak Logistics", expirationDate: "2011-10-01", policyCarrier: "AIG", coverageTier: "Tier-1 / 3M GL", complianceStatus: "Compliant", renewalStage: "Scheduled", lock: "Open" }
  ],
  reminders: [
    { reminderId: "REM-881", vendor: "Northline Contractors", noticeType: "Expiration Notice", noticeChannel: "Email", escalationStage: "Stage-1", overdueDays: "0", contactRetryCount: "1", status: "Queued" },
    { reminderId: "REM-882", vendor: "Summit Process Controls", noticeType: "Overdue Renewal", noticeChannel: "Phone", escalationStage: "Supervisor", overdueDays: "12", contactRetryCount: "4", status: "Escalated" },
    { reminderId: "REM-883", vendor: "Oakbridge Mechanical", noticeType: "Endorsement Missing", noticeChannel: "Email", escalationStage: "Stage-2", overdueDays: "5", contactRetryCount: "2", status: "Retry Pending" }
  ],
  collection: [
    { docId: "DOC-ACORD-9001", vendor: "Northline Contractors", docType: "ACORD 25", ocrStatus: "Parsed", acordStatus: "Validated", missingIndicator: "No", uploadedAt: "2011-08-13 07:41", status: "Indexed" },
    { docId: "DOC-PDF-9008", vendor: "Summit Process Controls", docType: "Endorsement PDF", ocrStatus: "Failed", acordStatus: "Not-Applicable", missingIndicator: "Yes", uploadedAt: "2011-08-14 02:11", status: "Exception" },
    { docId: "DOC-SCAN-9012", vendor: "Iron Peak Logistics", docType: "Scanned COI", ocrStatus: "Review", acordStatus: "Pending", missingIndicator: "No", uploadedAt: "2011-08-14 04:38", status: "Manual Review" }
  ],
  compliance: [
    { complianceId: "CMP-511", vendor: "Northline Contractors", eligibility: "Conditional", contractHold: "No", siteAccess: "Limited", subcontractorScore: "76", autoExpiryMonitor: "Active", status: "Pending" },
    { complianceId: "CMP-512", vendor: "Summit Process Controls", eligibility: "Ineligible", contractHold: "Yes", siteAccess: "Revoked", subcontractorScore: "42", autoExpiryMonitor: "Alert", status: "Exception" },
    { complianceId: "CMP-513", vendor: "Iron Peak Logistics", eligibility: "Eligible", contractHold: "No", siteAccess: "Approved", subcontractorScore: "91", autoExpiryMonitor: "Active", status: "Compliant" }
  ],
  exceptions: [
    { exceptionId: "EX-441", vendor: "Summit Process Controls", exceptionType: "Expired Certificate", severity: "Critical", queueOwner: "Risk Ops", lastUpdate: "2011-08-14 06:20", resolution: "Pending", status: "Open" },
    { exceptionId: "EX-442", vendor: "Oakbridge Mechanical", exceptionType: "Low Coverage Warning", severity: "High", queueOwner: "Vendor Mgmt", lastUpdate: "2011-08-14 06:45", resolution: "Under Review", status: "Escalated" },
    { exceptionId: "EX-443", vendor: "Blue Harbor Services", exceptionType: "Policy Mismatch Alert", severity: "Medium", queueOwner: "Compliance Desk", lastUpdate: "2011-08-14 07:02", resolution: "Document Request Sent", status: "Queued" }
  ]
}));

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function installScopedStyles() {
  if (document.getElementById("coi-monitor-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "coi-monitor-style";
  style.textContent = `
    .coi-desktop { display:grid; grid-template-columns:264px 1fr; gap:8px; }
    .coi-left { display:grid; gap:6px; align-content:start; }
    .coi-card { border:1px solid #8b8375; background:linear-gradient(to bottom,#f2ede2,#ddd4c4); padding:5px 6px; font-size:10px; }
    .coi-card h4 { margin:0 0 4px; font-size:10px; text-transform:uppercase; color:#5d5344; letter-spacing:0.2px; }
    .coi-card ul { margin:0; padding-left:13px; display:grid; gap:1px; }
    .coi-ops-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:5px; margin-bottom:6px; }
    .coi-kpi { border:1px solid #897f71; background:#ece4d5; padding:4px 6px; font-size:10px; }
    .coi-kpi strong { display:block; font-size:12px; color:#4f4639; }
    .coi-kpi small { color:#6f6354; }
    .coi-banner { border:1px solid #8f846f; background:#eee4cf; color:#4d4438; padding:3px 6px; font-size:10px; margin-bottom:6px; display:flex; justify-content:space-between; gap:6px; }
    .coi-banner .warn { color:#7a3f24; font-weight:700; }
    .coi-split { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
    .coi-feed { border:1px solid #908576; background:#f6f2e9; max-height:156px; overflow:auto; padding:4px; font-size:10px; }
    .coi-feed div { border-bottom:1px dotted #b3a999; padding:2px 0; }
    .coi-feed div:last-child { border-bottom:0; }
    .coi-pulse { display:inline-block; border:1px solid #8f846e; background:#e4dac6; padding:0 4px; font-size:9px; margin-left:4px; }
    .coi-form-grid { display:grid; grid-template-columns:145px 1fr; gap:5px 8px; align-items:center; }
    .coi-badges { display:flex; flex-wrap:wrap; gap:4px; margin:6px 0; }
    .coi-badge { border:1px solid #8a7f71; background:#ece4d5; color:#4b4338; font-size:10px; padding:1px 6px; }
    .coi-badge.warn { border-color:#a16636; background:#f0ddbe; color:#5a391a; }
    .coi-badge.alert { border-color:#98563f; background:#efcfbe; color:#602d1d; }
    .coi-mini-toolbar { display:flex; flex-wrap:wrap; gap:4px; margin-top:6px; }
    .coi-mini-toolbar .legacy-btn { font-size:10px; padding:2px 7px; }
    .coi-modal { position:absolute; inset:0; z-index:44; background:rgba(172,165,152,0.56); display:flex; align-items:center; justify-content:center; }
    .coi-modal-card { width:min(860px, calc(100vw - 30px)); max-height:calc(100vh - 36px); overflow:auto; border:1px solid #817967; background:#efe7d9; box-shadow:2px 2px 0 #9d9280; }
    .coi-modal-head { background:linear-gradient(to bottom,#f2ece1,#d2c7b6); border-bottom:1px solid #8a806e; padding:6px 8px; font-size:11px; font-weight:700; display:flex; justify-content:space-between; }
    .coi-modal-body { padding:8px; font-size:11px; }
    .coi-modal-foot { border-top:1px solid #8a806e; padding:6px 8px; display:flex; justify-content:flex-end; gap:4px; }
    .coi-modal pre { margin:0; font-family:Consolas, "Courier New", monospace; font-size:11px; }
    .coi-audit { width:100%; border-collapse:collapse; font-size:10px; }
    .coi-audit th, .coi-audit td { border:1px solid #928978; padding:3px 4px; }
    @media (max-width: 1080px) {
      .coi-desktop { grid-template-columns:1fr; }
      .coi-ops-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .coi-split { grid-template-columns:1fr; }
      .coi-form-grid { grid-template-columns:1fr; }
    }
  `;

  document.head.appendChild(style);
}

function makeAudit(action, detail) {
  return {
    timestamp: new Date().toLocaleString(),
    analyst: ANALYST,
    action,
    detail
  };
}

function pushActivity(text) {
  activityFeed = [`${new Date().toLocaleTimeString()} ${text}`, ...activityFeed].slice(0, 16);
}

function pushAudit(action, detail) {
  auditFeed = [makeAudit(action, detail), ...auditFeed].slice(0, 24);
}

function daysUntil(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return Math.ceil((date.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24));
}

function calcHealth(data) {
  const total = data.compliance.length || 1;
  const compliant = data.compliance.filter((row) => row.status === "Compliant").length;
  const pending = data.compliance.filter((row) => row.status === "Pending").length;
  return Math.max(24, Math.min(99, Math.round(((compliant + pending * 0.55) / total) * 100)));
}

function lockedCount(data) {
  return data.certificates.filter((row) => row.lock === "Locked").length;
}

function expiringCount(data) {
  return data.certificates.filter((row) => daysUntil(row.expirationDate) <= 30).length;
}

function overdueReminderCount(data) {
  return data.reminders.filter((row) => Number(row.overdueDays) > 0).length;
}

function collectionExceptions(data) {
  return data.collection.filter((row) => row.missingIndicator === "Yes" || row.ocrStatus === "Failed").length;
}

function coverageFromTier(tierText) {
  if (tierText.includes("3M")) {
    return 3;
  }
  if (tierText.includes("2M")) {
    return 2;
  }
  return 1;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function downloadFile(fileName, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openModal({ title, bodyHtml, footerButtons = [{ id: "close", label: "Close" }] }) {
  const host = document.querySelector(".legacy-window");
  if (!host) {
    return null;
  }

  const modal = document.createElement("div");
  modal.className = "coi-modal";
  modal.innerHTML = `
    <div class="coi-modal-card">
      <div class="coi-modal-head"><span>${title}</span><button class="legacy-btn" data-close-x="1">X</button></div>
      <div class="coi-modal-body">${bodyHtml}</div>
      <div class="coi-modal-foot">${footerButtons.map((button) => `<button class="legacy-btn" data-modal-btn="${button.id}">${button.label}</button>`).join("")}</div>
    </div>
  `;

  host.appendChild(modal);
  return modal;
}

function closeModal(modal) {
  modal?.remove();
}

function closeAllModals() {
  document.querySelectorAll(".coi-modal").forEach((node) => node.remove());
}

function queueSummary(data) {
  return {
    ingestion: ingestionQueue,
    acordPending: data.collection.filter((row) => row.acordStatus === "Pending").length,
    reminderBacklog: data.reminders.length,
    exceptionQueue: data.exceptions.length,
    renewalCampaign: `${11 + (reminderPulse % 7)} vendors in campaign batch`
  };
}

function activeTabCaption() {
  if (activeModule === "certificates") {
    return "Vendor insurance records with expiration monitoring, carrier details, and renewal stage workflow.";
  }
  if (activeModule === "reminders") {
    return "Outbound reminder queue with escalation notices, overdue alerts, and contact retry counters.";
  }
  if (activeModule === "collection") {
    return "Uploaded ACORD forms and scanned PDFs with OCR extraction and missing-document indicators.";
  }
  if (activeModule === "compliance") {
    return "Vendor eligibility status, contract holds, site-access permissions, and score-based compliance checks.";
  }
  return "Exception-driven queue for expired certificates, low coverage, endorsement gaps, and rejected records.";
}

function renderContent(data) {
  const moduleColumns = columns[activeModule];
  const rows = data[activeModule].map((row) => moduleColumns.map((key) => row[key]));
  const grid = dataGrid(moduleColumns, rows);

  const health = calcHealth(data);
  const summary = queueSummary(data);
  const vendorOptions = Array.from(new Set(data.certificates.map((row) => row.vendor))).sort();
  const firstCert = data.certificates[0];
  const countdown = firstCert ? daysUntil(firstCert.expirationDate) : 0;

  const desktopHtml = `
    <section class="coi-desktop">
      <aside class="coi-left">
        <div class="coi-card">
          <h4>Background Reminder Monitor</h4>
          <ul>
            <li>Queue pulse: ${reminderPulse} sec<span class="coi-pulse">live</span></li>
            <li>Escalation reminders: ${overdueReminderCount(data)}</li>
            <li>Retry contacts pending: ${data.reminders.filter((row) => Number(row.contactRetryCount) > 2).length}</li>
          </ul>
        </div>
        <div class="coi-card">
          <h4>Document Ingestion Queue</h4>
          <ul>
            <li>Ingestion backlog: ${summary.ingestion}</li>
            <li>OCR exceptions: ${collectionExceptions(data)}</li>
            <li>Scanned PDFs awaiting parse: ${data.collection.filter((row) => row.docType.includes("PDF")).length}</li>
          </ul>
        </div>
        <div class="coi-card">
          <h4>ACORD Parsing Monitor</h4>
          <ul>
            <li>Pending validation: ${summary.acordPending}</li>
            <li>Failed extraction review: ${data.collection.filter((row) => row.ocrStatus === "Failed").length}</li>
            <li>Schema mismatch hold: ${data.exceptions.filter((row) => row.exceptionType.includes("Mismatch")).length}</li>
          </ul>
        </div>
        <div class="coi-card">
          <h4>Renewal Campaign Tracker</h4>
          <ul>
            <li>${summary.renewalCampaign}</li>
            <li>Notice batches sent: ${data.reminders.filter((row) => row.status !== "Queued").length}</li>
            <li>Overdue renewal alerts: ${overdueReminderCount(data)}</li>
          </ul>
        </div>
        <div class="coi-card">
          <h4>Background Services</h4>
          <ul>${backgroundServices.map((name) => `<li>${name}</li>`).join("")}</ul>
        </div>
      </aside>
      <div>
        <div class="coi-ops-grid">
          <div class="coi-kpi"><strong>${expiringCount(data)}</strong><small>Certificate aging monitor</small></div>
          <div class="coi-kpi"><strong>${health}%</strong><small>Compliance health percentage</small></div>
          <div class="coi-kpi"><strong>${lockedCount(data)}</strong><small>Vendor lock indicators</small></div>
          <div class="coi-kpi"><strong>${summary.exceptionQueue}</strong><small>Exception queue depth</small></div>
        </div>
        <div class="coi-banner">
          <span>Queue Model: ${queueView} | Analyst Login: ${ANALYST}</span>
          <span class="warn">System Message: ${randomMessage}</span>
        </div>
        ${panel(`${modules.find((item) => item.id === activeModule)?.label || "Queue"} - Operational Dashboard`, `<div style="margin-bottom:6px; font-size:10px; color:#635a4d;">${activeTabCaption()}</div>${grid}`)}
        <section style="margin-top:8px;">
          <div class="coi-split">
            ${panel("Operations Feed", `<div class="coi-feed">${activityFeed.map((line) => `<div>${line}</div>`).join("")}</div>`)}
            ${panel("Exception Workflow Focus", `<div class="coi-feed">${data.exceptions.map((row) => `<div><strong>${row.vendor}</strong> - ${row.exceptionType} (${row.status})</div>`).join("")}</div>`) }
          </div>
        </section>
      </div>
    </section>
  `;

  const entryHtml = `
    <form id="entry-form" data-module="${activeModule}">
      <datalist id="vendor-search-options">${vendorOptions.map((name) => `<option value="${name}"></option>`).join("")}</datalist>
      <div class="coi-form-grid">
        <label>Vendor Search</label><input class="legacy-field" name="vendor" list="vendor-search-options" placeholder="Type vendor name" required />
        <label>Policy Number</label><input class="legacy-field" name="policyNo" placeholder="POL-#####" />
        <label>Expiration Date</label><input class="legacy-field" type="date" name="expirationDate" value="2011-09-15" />
        <label>Coverage Tier</label><select class="legacy-field" name="coverageTier"><option>Tier-1 / 3M GL</option><option selected>Tier-1 / 2M GL</option><option>Tier-2 / 1M GL</option></select>
        <label>Endorsement</label><select class="legacy-field" name="endorsement"><option selected>Primary Non-Contributory</option><option>Waiver of Subrogation Missing</option><option>Additional Insured</option></select>
      </div>
      <div class="coi-badges" id="entry-badges">
        <span class="coi-badge">Expiration countdown: ${countdown} days</span>
        <span class="coi-badge warn">Duplicate-policy detection: clear</span>
        <span class="coi-badge">Coverage-threshold warning: none</span>
        <span class="coi-badge alert">Missing-endorsement alerts: 1</span>
      </div>
      <div class="coi-mini-toolbar">
        <button class="legacy-btn" type="submit">Save Queue Record</button>
        <button class="legacy-btn" type="button" data-action="run-overnight-sync">Run Overnight Sync</button>
        <button class="legacy-btn" type="button" data-action="toggle-queue-view">Toggle Queue View</button>
      </div>
      <div style="margin-top:6px; font-size:10px; color:#6d6253;">Manual workflow baseline preserved for RPA demonstration scenarios.</div>
    </form>
  `;

  return desktopHtml + panel("Entry Form - Vendor Compliance Intake", entryHtml);
}

function buildStatusText(data) {
  return `Env: ${ENVIRONMENT} | Analyst: ${ANALYST} | Certificate Aging: ${expiringCount(data)} expiring | Health: ${calcHealth(data)}% | Vendor Locks: ${lockedCount(data)} | Reminder Monitor: ${overdueReminderCount(data)} overdue | Ingestion Queue: ${ingestionQueue} | ACORD Monitor: ${data.collection.filter((row) => row.acordStatus === "Pending").length} pending | Renewal Tracker: ${data.reminders.length} active`;
}

async function runOvernightSync() {
  closeAllModals();
  const modal = openModal({
    title: "Overnight Compliance Sync",
    bodyHtml: `<div style="margin-bottom:6px;">Preparing fake overnight processing pipeline for vendor-compliance jobs.</div><pre id="sync-console">[00:01:02] Starting COMPLIANCE_SYNC_02...</pre>`,
    footerButtons: [{ id: "close", label: "Close" }]
  });

  if (!modal) {
    return;
  }

  const consoleNode = modal.querySelector("#sync-console");
  const steps = [
    "[00:01:08] Pulling expiring certificate queue...",
    "[00:01:13] Running ACORD validation reconciliation...",
    "[00:01:18] Refreshing vendor lock indicators...",
    "[00:01:23] Renewal reminder batch processing.",
    "[00:01:29] Overnight sync complete."
  ];

  for (const line of steps) {
    await wait(380);
    if (consoleNode) {
      consoleNode.textContent += `\n${line}`;
    }
  }

  pushActivity("Overnight sync simulation completed for compliance queues");
  pushAudit("Sync", "Fake overnight sync completed");

  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
  modal.querySelectorAll("[data-modal-btn]").forEach((button) => {
    button.addEventListener("click", () => closeModal(modal));
  });
}

function openPrintPreview(data) {
  const exceptions = data.exceptions.map((row) => `${row.vendor} - ${row.exceptionType} (${row.status})`).join("\n");
  const certs = data.certificates.map((row) => `${row.vendor} | ${row.policyCarrier} | ${row.coverageTier} | ${row.expirationDate}`).join("\n");
  const timeline = data.certificates.map((row) => `${row.certificateId}: ${daysUntil(row.expirationDate)} days`).join("\n");

  const win = window.open("", "_blank", "width=1020,height=760");
  if (!win) {
    return;
  }

  win.document.open();
  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Legacy Compliance Report Viewer</title>
    <style>
      body { font-family: Tahoma, Arial, sans-serif; background:#f6f3ec; color:#3f362e; padding:14px; }
      .head { border:1px solid #8f8676; background:#ece4d5; padding:8px; margin-bottom:8px; }
      .mark { position:fixed; top:46%; left:15%; font-size:40px; color:rgba(120,110,96,0.18); transform:rotate(-18deg); pointer-events:none; }
      pre { border:1px solid #a19686; background:#fffdf8; padding:8px; white-space:pre-wrap; }
    </style>
  </head>
  <body>
    <div class="mark">INTERNAL COMPLIANCE REVIEW</div>
    <div class="head"><strong>Legacy Compliance Report Viewer</strong><br/>Coverage summaries, expiration timeline, vendor details, and compliance exceptions.</div>
    <h4>Coverage Summaries</h4><pre>${certs}</pre>
    <h4>Expiration Timeline</h4><pre>${timeline}</pre>
    <h4>Compliance Exceptions</h4><pre>${exceptions || "None"}</pre>
  </body>
</html>`);
  win.document.close();

  pushActivity("Print preview opened in legacy report viewer");
  pushAudit("Print", "Legacy compliance report viewer launched");
}

function runRetryFailed() {
  closeAllModals();
  const modal = openModal({
    title: "Retry Failed Document Sync",
    bodyHtml: `<div style="margin-bottom:6px;">Reconnecting to vendor repository and replaying failed extraction.</div><pre>${retryLogs.join("\n")}</pre>`,
    footerButtons: [{ id: "close", label: "Close" }]
  });

  if (!modal) {
    return;
  }

  ingestionQueue = Math.max(1, ingestionQueue - 1);
  pushActivity("Retry failed sync completed for ACORD extraction queue");
  pushAudit("Retry", "Failed document-sync record reprocessed");

  modal.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
  modal.querySelectorAll("[data-modal-btn]").forEach((button) => {
    button.addEventListener("click", () => closeModal(modal));
  });
}

function exportWorkbook(data) {
  const expiring = data.certificates.filter((row) => daysUntil(row.expirationDate) <= 30);
  const missingDocs = data.collection.filter((row) => row.missingIndicator === "Yes");
  const compliancePct = data.compliance.map((row) => `${row.vendor},${row.subcontractorScore}%`);

  const workbook = [
    "Vendor Compliance Workbook",
    "",
    "Expiring COIs",
    "Certificate,Vendor,Expiration,Carrier,Coverage,Renewal",
    ...expiring.map((row) => `${row.certificateId},${row.vendor},${row.expirationDate},${row.policyCarrier},${row.coverageTier},${row.renewalStage}`),
    "",
    "Missing Documents",
    "DocId,Vendor,DocType,Status",
    ...missingDocs.map((row) => `${row.docId},${row.vendor},${row.docType},${row.status}`),
    "",
    "Renewal Statuses",
    "Reminder,Vendor,Escalation,OverdueDays,RetryCount,Status",
    ...data.reminders.map((row) => `${row.reminderId},${row.vendor},${row.escalationStage},${row.overdueDays},${row.contactRetryCount},${row.status}`),
    "",
    "Vendor Compliance Percentages",
    "Vendor,CompliancePercentage",
    ...compliancePct
  ].join("\r\n");

  downloadFile(`coi-compliance-workbook-${new Date().toISOString().slice(0, 10)}.csv`, workbook, "text/csv;charset=utf-8");

  const skipWarning = Math.random() > 0.45;
  pushActivity("Vendor compliance workbook exported");
  pushAudit("Export", "Workbook generated for compliance analysis");

  if (skipWarning) {
    closeAllModals();
    const modal = openModal({
      title: "Export Warning",
      bodyHtml: "3 vendor records skipped due to active compliance lock.",
      footerButtons: [{ id: "close", label: "Acknowledge" }]
    });
    modal?.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
    modal?.querySelectorAll("[data-modal-btn]").forEach((button) => {
      button.addEventListener("click", () => closeModal(modal));
    });
  }
}

function generatePdfPacket(data) {
  const merged = [
    "Vendor Compliance Packet",
    "",
    "Certificates",
    ...data.certificates.map((row) => `${row.certificateId} | ${row.vendor} | ${row.policyCarrier} | ${row.coverageTier}`),
    "",
    "Endorsement Forms",
    ...data.collection.filter((row) => row.docType.includes("Endorsement") || row.docType.includes("ACORD")).map((row) => `${row.docId} | ${row.vendor} | ${row.docType} | ${row.status}`),
    "",
    "Coverage Waivers",
    ...data.exceptions.filter((row) => row.exceptionType.includes("Coverage") || row.exceptionType.includes("Endorsement")).map((row) => `${row.vendor} | ${row.exceptionType} | ${row.resolution}`),
    "",
    "Reminder Logs",
    ...data.reminders.map((row) => `${row.reminderId} | ${row.vendor} | ${row.noticeType} | ${row.status}`)
  ].join("\r\n");

  downloadFile(`coi-compliance-packet-${new Date().toISOString().slice(0, 10)}.txt`, merged, "text/plain;charset=utf-8");
  pushActivity("Vendor compliance packet generated");
  pushAudit("PDF", "Compliance packet merged and generated");
}

function viewAuditHistory() {
  closeAllModals();
  const body = `
    <table class="coi-audit">
      <thead><tr><th>Timestamp</th><th>Analyst</th><th>Action</th><th>Details</th></tr></thead>
      <tbody>${auditFeed.map((item) => `<tr><td>${item.timestamp}</td><td>${item.analyst}</td><td>${item.action}</td><td>${item.detail}</td></tr>`).join("")}</tbody>
    </table>
  `;

  const modal = openModal({ title: "Audit History", bodyHtml: body, footerButtons: [{ id: "close", label: "Close" }] });
  modal?.querySelector("[data-close-x]")?.addEventListener("click", () => closeModal(modal));
  modal?.querySelectorAll("[data-modal-btn]").forEach((button) => {
    button.addEventListener("click", () => closeModal(modal));
  });
}

function updateEntryBadges(data) {
  const form = document.getElementById("entry-form");
  const badgeHost = document.getElementById("entry-badges");
  if (!form || !badgeHost) {
    return;
  }

  const vendorField = form.querySelector("[name='vendor']");
  const expirationField = form.querySelector("[name='expirationDate']");
  const coverageField = form.querySelector("[name='coverageTier']");
  const endorsementField = form.querySelector("[name='endorsement']");

  const refreshBadges = () => {
    const vendor = vendorField?.value?.trim() || "(none)";
    const expiration = expirationField?.value || "2011-09-15";
    const countdown = daysUntil(expiration);
    const duplicate = data.certificates.some((row) => row.vendor.toLowerCase() === vendor.toLowerCase());
    const coverageScore = coverageFromTier(coverageField?.value || "Tier-2 / 1M GL");
    const thresholdWarn = coverageScore < 2;
    const missingEndorsement = (endorsementField?.value || "").toLowerCase().includes("missing");

    badgeHost.innerHTML = `
      <span class="coi-badge ${countdown <= 15 ? "alert" : ""}">Expiration countdown: ${countdown} days</span>
      <span class="coi-badge ${duplicate ? "warn" : ""}">Duplicate-policy detection: ${duplicate ? "possible duplicate" : "clear"}</span>
      <span class="coi-badge ${thresholdWarn ? "warn" : ""}">Coverage-threshold warning: ${thresholdWarn ? "below requirement" : "none"}</span>
      <span class="coi-badge ${missingEndorsement ? "alert" : ""}">Missing-endorsement alerts: ${missingEndorsement ? "1" : "0"}</span>
    `;
  };

  [vendorField, expirationField, coverageField, endorsementField].forEach((field) => {
    field?.addEventListener("input", refreshBadges);
    field?.addEventListener("change", refreshBadges);
  });

  refreshBadges();
}

function render() {
  installScopedStyles();
  applyPalette();
  const data = loadSeed(namespace, () => ({}));
  const contentHtml = renderContent(data);

  document.getElementById("app").innerHTML = appShell({
    title: "COI Monitor 2011",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "generate-pdf", label: "Generate PDF" },
      { id: "view-audit", label: "View Audit History" },
      { id: "run-overnight-sync", label: "Overnight Sync" }
    ],
    statusText: buildStatusText(data),
    contentHtml,
    identityKey: "coi-monitor-2011-compliance-workbench",
    appDescription: APP_DESCRIPTION
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const action = button.getAttribute("data-action");
      const latest = loadSeed(namespace, () => ({}));

      if (action === "legacy-app-help") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (action === "export-excel") {
        exportWorkbook(latest);
        return;
      }

      if (action === "print-preview") {
        openPrintPreview(latest);
        return;
      }

      if (action === "retry-failed") {
        runRetryFailed();
        render();
        return;
      }

      if (action === "generate-pdf") {
        generatePdfPacket(latest);
        return;
      }

      if (action === "view-audit") {
        viewAuditHistory();
        return;
      }

      if (action === "toggle-queue-view") {
        queueView = queueView === "Exception-Driven" ? "Document-Driven" : "Exception-Driven";
        pushActivity(`Queue view switched to ${queueView}`);
        render();
        return;
      }

      if (action === "run-overnight-sync") {
        await runOvernightSync();
        return;
      }
    });
  });

  const form = document.getElementById("entry-form");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const latest = loadSeed(namespace, () => ({}));

      const vendor = formData.get("vendor")?.toString() || "Unknown Vendor";
      const policyNo = formData.get("policyNo")?.toString() || makeId("POL");
      const expirationDate = formData.get("expirationDate")?.toString() || "2011-09-30";
      const coverageTier = formData.get("coverageTier")?.toString() || "Tier-2 / 1M GL";
      const endorsement = formData.get("endorsement")?.toString() || "Missing";

      latest.certificates.push({
        certificateId: makeId("COI"),
        vendor,
        expirationDate,
        policyCarrier: "Manual Intake",
        coverageTier,
        complianceStatus: endorsement.includes("Missing") ? "Exception" : "Pending",
        renewalStage: "Intake",
        lock: "Open"
      });

      latest.collection.push({
        docId: makeId("DOC"),
        vendor,
        docType: endorsement.includes("Missing") ? "Endorsement Pending" : "ACORD 25",
        ocrStatus: "Parsed",
        acordStatus: "Pending",
        missingIndicator: endorsement.includes("Missing") ? "Yes" : "No",
        uploadedAt: `${REFERENCE_DATE.toISOString().slice(0, 10)} 08:42`,
        status: "Queued"
      });

      latest.reminders.push({
        reminderId: makeId("REM"),
        vendor,
        noticeType: "Manual Intake Reminder",
        noticeChannel: "Email",
        escalationStage: "Stage-1",
        overdueDays: "0",
        contactRetryCount: "0",
        status: "Queued"
      });

      latest.compliance.push({
        complianceId: makeId("CMP"),
        vendor,
        eligibility: coverageFromTier(coverageTier) >= 2 ? "Conditional" : "Ineligible",
        contractHold: coverageFromTier(coverageTier) >= 2 ? "No" : "Yes",
        siteAccess: coverageFromTier(coverageTier) >= 2 ? "Limited" : "Revoked",
        subcontractorScore: String(coverageFromTier(coverageTier) >= 2 ? 72 : 39),
        autoExpiryMonitor: "Active",
        status: endorsement.includes("Missing") ? "Exception" : "Pending"
      });

      if (coverageFromTier(coverageTier) < 2 || endorsement.includes("Missing")) {
        latest.exceptions.push({
          exceptionId: makeId("EX"),
          vendor,
          exceptionType: endorsement.includes("Missing") ? "Missing Endorsement" : "Coverage Threshold Below Requirement",
          severity: coverageFromTier(coverageTier) < 2 ? "High" : "Medium",
          queueOwner: "Compliance Desk",
          lastUpdate: `${REFERENCE_DATE.toISOString().slice(0, 10)} 09:04`,
          resolution: "Pending Analyst Review",
          status: "Open"
        });
      }

      saveSeed(namespace, latest);
      pushActivity(`Manual intake saved for ${vendor} (${policyNo})`);
      pushAudit("Entry", `Vendor record created for ${vendor}`);
      render();
    });
  }

  updateEntryBadges(data);
}

function installIntervals() {
  if (!statusTimer) {
    statusTimer = window.setInterval(() => {
      randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
      const target = document.querySelector(".coi-banner .warn");
      if (target) {
        target.textContent = `System Message: ${randomMessage}`;
      }
    }, 5200);
  }

  if (!queueTimer) {
    queueTimer = window.setInterval(() => {
      reminderPulse = reminderPulse >= 29 ? 13 : reminderPulse + 1;
      ingestionQueue = ingestionQueue >= 10 ? 4 : ingestionQueue + 1;
    }, 4100);
  }
}

installIntervals();
render();
