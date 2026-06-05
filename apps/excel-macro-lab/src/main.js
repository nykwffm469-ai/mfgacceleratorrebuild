const KEY = "excel-macro-lab";

const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - Month-End Recon Workbook (Excel Macro Replacement Lab)

Month-End Recon Workbook is the spiritual descendant of every shared-services month-close workbook ever built. Finance analysts and ops staff use it during the close cycle to pull data from multiple source systems, paste into source tabs, refresh a master VLOOKUP/SUMIFS chain, and produce a reconciliation summary. Common usage in real life includes downloading CSVs from SAP / Oracle / banking portals, opening the file at 11pm on the last business day of the month, fixing #N/A and #REF! errors by hand, re-pointing formulas to renamed sheets, running a macro that takes 20+ minutes, and re-saving with a new version suffix. This app reproduces that pain so you can show stakeholders exactly what RPA replaces.

This experience is inspired by real Excel-based macro workbooks (SUMIFS / VLOOKUP / SUMPRODUCT / PivotTable chains, manual paste areas, Sheet1!A1 hardlinks). Potential RPA use cases include automated source-system download (SAP RFC, Oracle DB, banking SFTP), automated tab refresh, replacing VBA macros with Python / Power Query / Power Automate / UiPath, automated variance analysis, exception highlighting, auto-email to controllers when ready for review, and end-to-end month-close orchestration through a control room.`;

const TABS = [
  { id: "summary", name: "Summary" },
  { id: "gl-actuals", name: "GL_Actuals" },
  { id: "bank-feed", name: "Bank_Feed" },
  { id: "ar-aging", name: "AR_Aging" },
  { id: "intercompany", name: "Intercompany" },
  { id: "instructions", name: "_Instructions" }
];

function loadState() {
  try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.activeTab) return p; } } catch (e) {}
  const fresh = { activeTab: "summary", brokenState: true, macroLog: [], lastRun: "" };
  saveState(fresh); return fresh;
}
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
let STATE = loadState();

function cell(content, cls) { return `<td class="${cls || ""}">${content == null ? "" : content}</td>`; }
function header(letter) { return `<th>${letter}</th>`; }
function rowNum(n) { return `<th>${n}</th>`; }

function gridShell(rows) {
  return `
    <div class="xl-grid">
      <table>
        <thead><tr><th></th>${["A","B","C","D","E","F","G","H"].map((l) => header(l)).join("")}</tr></thead>
        <tbody>${rows.map((r, i) => `<tr>${rowNum(i + 1)}${r.map((c) => typeof c === "string" ? cell(c) : cell(c.v, c.cls)).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function summarySheet() {
  const broken = STATE.brokenState;
  return gridShell([
    [{ v: "<strong>Month-End Reconciliation - JUNE 2026</strong>", cls: "" }, "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    [{ v: "<strong>Section</strong>" }, { v: "<strong>GL Balance</strong>" }, { v: "<strong>Sub-Ledger</strong>" }, { v: "<strong>Variance</strong>" }, { v: "<strong>Status</strong>" }, "", "", ""],
    [{ v: "Cash - Operating" }, { v: broken ? `<span class="xl-err">#N/A</span>` : "$2,418,210", cls: broken ? "xl-err" : "" }, { v: broken ? `<span class="xl-err">#REF!</span>` : "$2,418,210", cls: broken ? "xl-err" : "" }, { v: broken ? `<span class="xl-err">#N/A</span>` : "$0", cls: broken ? "xl-err" : "xl-good" }, { v: broken ? `<span class="xl-err">RECON BROKEN</span>` : `<span class="xl-good">OK</span>`, cls: broken ? "xl-err" : "" }, "", "", ""],
    [{ v: "Cash - Payroll" }, { v: broken ? `<span class="xl-err">#N/A</span>` : "$184,000", cls: broken ? "xl-err" : "" }, { v: broken ? `<span class="xl-err">#REF!</span>` : "$184,000", cls: broken ? "xl-err" : "" }, { v: broken ? `<span class="xl-err">#N/A</span>` : "$0", cls: broken ? "xl-err" : "xl-good" }, { v: broken ? `<span class="xl-err">RECON BROKEN</span>` : `<span class="xl-good">OK</span>` }, "", "", ""],
    [{ v: "AR - Trade" }, { v: broken ? `<span class="xl-err">#N/A</span>` : "$4,840,210", cls: broken ? "xl-err" : "" }, { v: broken ? `<span class="xl-err">#N/A</span>` : "$4,842,910", cls: broken ? "xl-err" : "" }, { v: broken ? `<span class="xl-err">#N/A</span>` : `<span class="xl-warn">$(2,700)</span>`, cls: broken ? "xl-err" : "xl-warn" }, { v: broken ? `<span class="xl-err">RECON BROKEN</span>` : `<span class="xl-warn">VARIANCE</span>` }, "", "", ""],
    [{ v: "Intercompany" }, { v: broken ? `<span class="xl-err">#REF!</span>` : "$1,210,400", cls: broken ? "xl-err" : "" }, { v: broken ? `<span class="xl-err">#REF!</span>` : "$1,210,400", cls: broken ? "xl-err" : "" }, { v: broken ? `<span class="xl-err">#REF!</span>` : "$0", cls: broken ? "xl-err" : "xl-good" }, { v: broken ? `<span class="xl-err">RECON BROKEN</span>` : `<span class="xl-good">OK</span>` }, "", "", ""],
    [{ v: "AP - Trade" }, { v: broken ? `<span class="xl-err">#N/A</span>` : "$2,914,888", cls: broken ? "xl-err" : "" }, { v: broken ? `<span class="xl-err">#N/A</span>` : "$2,914,888", cls: broken ? "xl-err" : "" }, { v: broken ? `<span class="xl-err">#N/A</span>` : "$0", cls: broken ? "xl-err" : "xl-good" }, { v: broken ? `<span class="xl-err">RECON BROKEN</span>` : `<span class="xl-good">OK</span>` }, "", "", ""],
    ["", "", "", "", "", "", "", ""],
    [{ v: "<strong>Total Variance</strong>" }, "", "", { v: broken ? `<span class="xl-err">#N/A</span>` : `<span class="xl-warn">$(2,700)</span>`, cls: broken ? "xl-err" : "xl-warn" }, { v: broken ? "" : `<span class="xl-warn">REQUIRES JE</span>` }, "", "", ""],
    ["", "", "", "", "", "", "", ""],
    [{ v: `<em style="color:#605e5c;">Last refresh: ${STATE.lastRun || "(never - VLOOKUP source tabs broken)"}</em>` }, "", "", "", "", "", "", ""]
  ]);
}

function glSheet() {
  return gridShell([
    [{ v: "<strong>GL_Actuals (paste from SAP FBL3N export)</strong>" }, "", "", "", "", "", "", ""],
    [{ v: "<strong>Account</strong>" }, { v: "<strong>Description</strong>" }, { v: "<strong>Debit</strong>" }, { v: "<strong>Credit</strong>" }, { v: "<strong>Balance</strong>" }, "", "", ""],
    ...(STATE.brokenState ? [
      [{ v: '<span style="color:#999;">paste GL data here from SAP FBL3N export &raquo;</span>', cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, "", "", ""],
      ...Array.from({ length: 8 }, () => ["", "", "", "", "", "", "", ""])
    ] : [
      [{ v: "1010" }, { v: "Cash - Operating" }, { v: "2,418,210" }, "", { v: "2,418,210" }, "", "", ""],
      [{ v: "1020" }, { v: "Cash - Payroll" }, { v: "184,000" }, "", { v: "184,000" }, "", "", ""],
      [{ v: "1100" }, { v: "AR - Trade" }, { v: "4,840,210" }, "", { v: "4,840,210" }, "", "", ""],
      [{ v: "1150" }, { v: "Intercompany Receivable" }, { v: "1,210,400" }, "", { v: "1,210,400" }, "", "", ""],
      [{ v: "2100" }, { v: "AP - Trade" }, "", { v: "2,914,888" }, { v: "(2,914,888)" }, "", "", ""],
      [{ v: "3010" }, { v: "Common Stock" }, "", { v: "500,000" }, { v: "(500,000)" }, "", "", ""],
      [{ v: "4000" }, { v: "Revenue" }, "", { v: "8,440,222" }, { v: "(8,440,222)" }, "", "", ""],
      [{ v: "5000" }, { v: "COGS" }, { v: "4,210,884" }, "", { v: "4,210,884" }, "", "", ""],
      [{ v: "6100" }, { v: "Operating Expense" }, { v: "1,910,114" }, "", { v: "1,910,114" }, "", "", ""]
    ])
  ]);
}

function bankSheet() {
  return gridShell([
    [{ v: "<strong>Bank_Feed (paste from JPMorgan ACCESS CSV)</strong>" }, "", "", "", "", "", "", ""],
    [{ v: "<strong>Date</strong>" }, { v: "<strong>Account</strong>" }, { v: "<strong>Description</strong>" }, { v: "<strong>Amount</strong>" }, { v: "<strong>Balance</strong>" }, "", "", ""],
    ...(STATE.brokenState ? [
      [{ v: '<span style="color:#999;">paste bank statement CSV here &raquo;</span>', cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, "", "", ""],
      ...Array.from({ length: 8 }, () => ["", "", "", "", "", "", "", ""])
    ] : [
      [{ v: "6/30/26" }, { v: "****1419" }, { v: "Beginning balance" }, { v: "2,418,210" }, { v: "2,418,210" }, "", "", ""],
      [{ v: "6/30/26" }, { v: "****1419" }, { v: "ACH credit Acme Industrial" }, { v: "84,210" }, { v: "2,502,420" }, "", "", ""],
      [{ v: "6/30/26" }, { v: "****1419" }, { v: "Wire OUT Coastline Logistics" }, { v: "(48,210)" }, { v: "2,454,210" }, "", "", ""],
      [{ v: "6/30/26" }, { v: "****1419" }, { v: "Service charge - account analysis" }, { v: "(184)" }, { v: "2,454,026" }, "", "", ""]
    ])
  ]);
}

function arSheet() {
  return gridShell([
    [{ v: "<strong>AR_Aging (paste from Oracle EBS XXAR_AGING_RPT)</strong>" }, "", "", "", "", "", "", ""],
    [{ v: "<strong>Customer</strong>" }, { v: "<strong>0-30</strong>" }, { v: "<strong>31-60</strong>" }, { v: "<strong>61-90</strong>" }, { v: "<strong>90+</strong>" }, { v: "<strong>Total</strong>" }, "", ""],
    ...(STATE.brokenState ? [
      [{ v: '<span style="color:#999;">paste AR aging here &raquo;</span>', cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, "", ""],
      ...Array.from({ length: 8 }, () => ["", "", "", "", "", "", "", ""])
    ] : [
      [{ v: "Apex Industrial" }, { v: "184,210" }, { v: "98,222" }, { v: "44,118" }, { v: "0" }, { v: "326,550" }, "", ""],
      [{ v: "Coastline Logistics" }, { v: "224,422" }, { v: "48,210" }, { v: "0" }, { v: "0" }, { v: "272,632" }, "", ""],
      [{ v: "MegaCorp Customer" }, { v: "1,884,210" }, { v: "440,000" }, { v: "210,400" }, { v: "84,210" }, { v: "2,618,820" }, "", ""],
      [{ v: "Stark Mfg" }, { v: "884,210" }, { v: "240,180" }, { v: "0" }, { v: "0" }, { v: "1,124,390" }, "", ""],
      [{ v: "Globex Hosting" }, { v: "184,210" }, { v: "121,888" }, { v: "0" }, { v: "0" }, { v: "306,098" }, "", ""],
      [{ v: "Bluewater Mktg" }, { v: "84,210" }, { v: "44,180" }, { v: "0" }, { v: "0" }, { v: "128,390" }, "", ""],
      [{ v: "Vertex Cyber" }, { v: "44,210" }, { v: "0" }, { v: "0" }, { v: "0" }, { v: "44,210" }, "", ""],
      [{ v: "<strong>Total</strong>" }, "", "", "", "", { v: "<strong>4,840,090</strong>" }, "", ""]
    ])
  ]);
}

function icSheet() {
  return gridShell([
    [{ v: "<strong>Intercompany (paste from HFM)</strong>" }, "", "", "", "", "", "", ""],
    [{ v: "<strong>Entity</strong>" }, { v: "<strong>Partner</strong>" }, { v: "<strong>Debit</strong>" }, { v: "<strong>Credit</strong>" }, { v: "<strong>Status</strong>" }, "", "", ""],
    ...(STATE.brokenState ? [
      [{ v: '<span style="color:#999;">paste IC trial balance here &raquo;</span>', cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, { v: "", cls: "xl-paste" }, "", "", ""],
      ...Array.from({ length: 6 }, () => ["", "", "", "", "", "", "", ""])
    ] : [
      [{ v: "US-01" }, { v: "EU-05" }, { v: "488,400" }, "", { v: `<span class="xl-good">Matched</span>` }, "", "", ""],
      [{ v: "EU-05" }, { v: "US-01" }, "", { v: "488,400" }, { v: `<span class="xl-good">Matched</span>` }, "", "", ""],
      [{ v: "US-01" }, { v: "APAC-08" }, { v: "722,000" }, "", { v: `<span class="xl-good">Matched</span>` }, "", "", ""],
      [{ v: "APAC-08" }, { v: "US-01" }, "", { v: "722,000" }, { v: `<span class="xl-good">Matched</span>` }, "", "", ""]
    ])
  ]);
}

function instructionsSheet() {
  return gridShell([
    [{ v: "<strong>HOW TO RUN THIS WORKBOOK (12 STEPS - typically 90-120 min)</strong>" }, "", "", "", "", "", "", ""],
    [{ v: "1. Log into SAP, run FBL3N for all GL accounts, export to CSV, paste into GL_Actuals tab" }, "", "", "", "", "", "", ""],
    [{ v: "2. Log into JPMorgan ACCESS, download yesterday's bank activity, paste into Bank_Feed tab" }, "", "", "", "", "", "", ""],
    [{ v: "3. Run Oracle EBS report XXAR_AGING_RPT, save as CSV, paste into AR_Aging tab" }, "", "", "", "", "", "", ""],
    [{ v: "4. Pull intercompany trial balance from HFM, paste into Intercompany tab" }, "", "", "", "", "", "", ""],
    [{ v: "5. Press Ctrl+Alt+F9 to fully recalc workbook (do NOT just press F9)" }, "", "", "", "", "", "", ""],
    [{ v: "6. Click Macros > RefreshReconciliation (runs ~20 min)" }, "", "", "", "", "", "", ""],
    [{ v: "7. Review #N/A / #REF! errors and patch by hand" }, "", "", "", "", "", "", ""],
    [{ v: "8. Re-point any moved tabs (last close: someone renamed GL_Actuals_v2 by mistake)" }, "", "", "", "", "", "", ""],
    [{ v: "9. Investigate variances > $1,000 and email controllers" }, "", "", "", "", "", "", ""],
    [{ v: "10. Print Summary tab to PDF, save to SharePoint /Finance/MonthEnd/" }, "", "", "", "", "", "", ""],
    [{ v: "11. Email PDF to assistant controller for review" }, "", "", "", "", "", "", ""],
    [{ v: "12. Re-save workbook as MonthEnd_YYYYMM_v_FINAL_FINAL_v2_REAL.xlsx" }, "", "", "", "", "", "", ""]
  ]);
}

function activeSheet() {
  switch (STATE.activeTab) {
    case "summary": return summarySheet();
    case "gl-actuals": return glSheet();
    case "bank-feed": return bankSheet();
    case "ar-aging": return arSheet();
    case "intercompany": return icSheet();
    case "instructions": return instructionsSheet();
    default: return summarySheet();
  }
}

function renderShell() {
  return `
    <div class="xl-shell">
      <div class="xl-title">
        <span>MonthEnd_Reconciliation_v_FINAL_FINAL_v2_REAL.xlsx - Excel</span>
        <div class="xl-title-actions">
          <button data-action="help">App Context (?)</button>
          <a href="../">Main</a>
        </div>
      </div>
      <div class="xl-ribbon">
        <div class="xl-ribbon-grp"><button class="xl-btn">Open</button><button class="xl-btn">Save</button><div class="xl-ribbon-grp-title">File</div></div>
        <div class="xl-ribbon-grp"><button class="xl-btn">Cut</button><button class="xl-btn">Copy</button><button class="xl-btn">Paste &#9662;</button><div class="xl-ribbon-grp-title">Clipboard</div></div>
        <div class="xl-ribbon-grp"><button class="xl-btn">B I U</button><button class="xl-btn">Fill</button><div class="xl-ribbon-grp-title">Font</div></div>
        <div class="xl-ribbon-grp"><button class="xl-btn">$</button><button class="xl-btn">%</button><button class="xl-btn">,</button><div class="xl-ribbon-grp-title">Number</div></div>
        <div class="xl-ribbon-grp"><button class="xl-btn">Sort</button><button class="xl-btn">Filter</button><div class="xl-ribbon-grp-title">Edit</div></div>
        <div class="xl-ribbon-grp"><button class="xl-btn xl-btn-action" data-action="run-macro">&#9656; Run Macro (12 steps)</button><button class="xl-btn">Refresh</button><div class="xl-ribbon-grp-title">Data</div></div>
        <div class="xl-ribbon-grp"><button class="xl-btn xl-btn-rpa" data-action="run-rpa">&#129302; Replace with RPA Bot</button><div class="xl-ribbon-grp-title">Modernize</div></div>
      </div>
      <div class="xl-formula">
        <div class="xl-namebox">B4</div>
        <span>fx</span>
        <div class="xl-formulabar">=VLOOKUP(A4,GL_Actuals!A:E,5,FALSE)+IFERROR(SUMIFS(Bank_Feed!D:D,Bank_Feed!B:B,A4),0)-SUMIFS(AR_Aging!F:F,AR_Aging!A:A,A4)</div>
      </div>
      ${activeSheet()}
      <div class="xl-tabs">
        ${TABS.map((t) => `<div class="xl-tab ${STATE.activeTab === t.id ? "active" : ""}" data-tab="${t.id}">${esc(t.name)}</div>`).join("")}
      </div>
      <div class="xl-status">
        <span>Ready &middot; ${STATE.brokenState ? "Workbook contains errors (4 #N/A, 3 #REF!)" : "Last calculated " + STATE.lastRun}</span>
        <span>Sum: $-- &middot; Count: 0 &middot; AutoCalc: ON &middot; Sheet ${TABS.findIndex((t) => t.id === STATE.activeTab) + 1} of ${TABS.length}</span>
      </div>
    </div>
  `;
}

function runMacroAnimation() {
  const steps = [
    "Step 1/12: Logging into SAP via Citrix...",
    "Step 2/12: Running FBL3N for 487 GL accounts (please wait 4 minutes)...",
    "Step 3/12: Exporting CSV to clipboard...",
    "Step 4/12: Pasting GL_Actuals tab (data length: 31,420 rows)...",
    "Step 5/12: Logging into JPMorgan ACCESS...",
    "Step 6/12: Pulling Bank_Feed for account ****1419...",
    "Step 7/12: Running Oracle EBS XXAR_AGING_RPT (timeout 5min)...",
    "Step 8/12: Pulling HFM intercompany trial balance...",
    "Step 9/12: Recalculating workbook (Ctrl+Alt+F9)...",
    "Step 10/12: Detecting #REF! errors in 4 cells (PATCHING BY HAND)...",
    "Step 11/12: Fixing renamed tab GL_Actuals_v2 -> GL_Actuals...",
    "Step 12/12: Saving as MonthEnd_202606_v_FINAL_FINAL_v3.xlsx"
  ];
  STATE.macroLog = [];
  showProgressModal(steps, () => {
    STATE.brokenState = false;
    STATE.lastRun = new Date().toLocaleString();
    saveState(STATE); render();
  });
}

function runRpaAnimation() {
  const steps = [
    "Bot connecting to SAP via secure RFC channel...",
    "Bot pulling GL_Actuals (487 accounts) - 4.2 seconds",
    "Bot pulling Bank_Feed from JPMorgan ACCESS API - 1.8 seconds",
    "Bot pulling AR_Aging from Oracle EBS via direct DB - 2.4 seconds",
    "Bot pulling Intercompany from HFM API - 0.9 seconds",
    "Bot validating data integrity (zero #REF! errors possible)...",
    "Bot computing reconciliation summary...",
    "Bot detecting variance: AR $2,700 (auto-routed to controller)",
    "Bot saving to SharePoint /Finance/MonthEnd/2026-06/ - versioned",
    "Bot emailing controller for review (with variance flagged)",
    "Bot complete. Total runtime: 14 seconds (vs ~110 minutes manual)"
  ];
  STATE.macroLog = [];
  showProgressModal(steps, () => {
    STATE.brokenState = false;
    STATE.lastRun = new Date().toLocaleString() + " (RPA bot in 14 seconds)";
    saveState(STATE); render();
  }, true);
}

function showProgressModal(steps, onDone, isRpa) {
  let i = 0;
  const m = document.createElement("div"); m.className = "xl-modal";
  const title = isRpa ? "RPA Bot Running..." : "Running Macro: RefreshReconciliation";
  function paint() {
    m.innerHTML = `<div class="xl-modal-body"><div class="xl-modal-head">${title}</div><div class="xl-modal-content">${steps.map((s, idx) => `<div class="xl-progress-row ${idx < i ? "xl-progress-done" : idx === i ? "xl-progress-active" : "xl-progress-pending"}">${idx < i ? "&#10003;" : (idx === i ? "&#9658;" : "&middot;")} ${esc(s)}</div>`).join("")}<div style="margin-top:8px;font-size:11px;color:#605e5c;">${i < steps.length ? "Please do not touch the keyboard..." : `Done! ${isRpa ? "&#127881; That took 14 seconds vs the typical 110 minutes manual run." : "Macro complete - your turn to manually patch any remaining errors."}`}</div>${i >= steps.length ? `<div style="text-align:right;margin-top:10px;"><button class="xl-btn" id="xl-close">Close</button></div>` : ""}</div></div>`;
    if (i >= steps.length) { document.getElementById("xl-close").onclick = () => { m.remove(); onDone(); }; }
  }
  document.body.appendChild(m); paint();
  const t = setInterval(() => { if (i >= steps.length) { clearInterval(t); return; } i += 1; paint(); }, isRpa ? 320 : 420);
}

function openHelp() {
  const o = document.createElement("div"); o.className = "xl-modal";
  o.innerHTML = `<div class="xl-modal-body" style="max-width:760px;"><div class="xl-modal-head">App Context</div><div class="xl-modal-content" style="white-space:pre-wrap;font-size:12px;max-height:60vh;overflow:auto;">${esc(APP_DESCRIPTION)}</div><div style="text-align:right;padding:10px;border-top:1px solid #ddd;"><button class="xl-btn" id="xl-help-close">Close</button></div></div>`;
  document.body.appendChild(o); o.onclick = (e) => { if (e.target === o) o.remove(); };
  document.getElementById("xl-help-close").onclick = () => o.remove();
}

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-tab]").forEach((d) => d.addEventListener("click", () => { STATE.activeTab = d.dataset.tab; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.action;
    if (a === "run-macro") runMacroAnimation();
    else if (a === "run-rpa") runRpaAnimation();
    else if (a === "help") openHelp();
  }));
}
render();
