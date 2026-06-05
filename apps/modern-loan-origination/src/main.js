const STORAGE_KEY = "nb-loan-origination";

const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - NorthBank Loan Origination Workbench

NorthBank Loan Origination Workbench is a modern web application used by consumer lending operations, underwriters, and risk officers to intake loan applications, run KYC and credit checks, apply automated decisioning policy, and route exceptions to humans. Common usage includes monitoring the live intake queue, opening a borrower's application to review extracted data and document evidence, watching the RPA processing pipeline run validations in real time, overriding auto-decisions where required, and approving or declining loans with audit trail.

This experience is a modern Bootstrap 4 web app inspired by FIS, nCino, Encompass, and Salesforce Financial Services Cloud lending consoles. Potential RPA use cases include automated PDF/email intake parsing into structured application data, identity and address verification against trusted sources, automated credit bureau pulls, debt-to-income computation, fraud-rule scoring, document classification (paystubs, W2s, bank statements), automated decline letter generation, and SLA monitoring with auto-escalation for stalled applications.`;

const APPLICANTS = [
  { id: "APP-100214", name: "Marcus Allen", product: "Auto", amount: 28500, term: 60, channel: "Web", submitted: "2026-06-05 08:14", state: "FL", income: 92000, dti: 0.28, ficoBand: "720-739", risk: "Low", status: "Pending Decision", documents: ["app-form.pdf", "paystub-may.pdf", "id-license.jpg", "bank-statement.pdf"] },
  { id: "APP-100213", name: "Jenna Whitfield", product: "Personal", amount: 15000, term: 36, channel: "Mobile", submitted: "2026-06-05 07:55", state: "TX", income: 78000, dti: 0.22, ficoBand: "740-759", risk: "Low", status: "Auto-Approved", documents: ["app-form.pdf", "paystub.pdf", "id.jpg"] },
  { id: "APP-100212", name: "Diego Romero", product: "Mortgage", amount: 412000, term: 360, channel: "Branch", submitted: "2026-06-05 07:42", state: "CA", income: 168000, dti: 0.41, ficoBand: "700-719", risk: "Medium", status: "Manual Review", documents: ["app-form.pdf", "w2-2024.pdf", "w2-2025.pdf", "bank-3mo.pdf", "id-passport.jpg"] },
  { id: "APP-100211", name: "Priya Shankar", product: "Auto", amount: 19200, term: 48, channel: "Web", submitted: "2026-06-05 07:30", state: "NY", income: 64000, dti: 0.35, ficoBand: "680-699", risk: "Medium", status: "Pending Decision", documents: ["app-form.pdf", "paystub.pdf", "id.jpg", "vehicle-quote.pdf"] },
  { id: "APP-100210", name: "Robert Chen", product: "Personal", amount: 35000, term: 60, channel: "Web", submitted: "2026-06-05 07:14", state: "WA", income: 132000, dti: 0.18, ficoBand: "760+", risk: "Low", status: "Auto-Approved", documents: ["app-form.pdf", "paystub.pdf", "id.jpg"] },
  { id: "APP-100209", name: "Aisha Mohamed", product: "Mortgage", amount: 275000, term: 360, channel: "Web", submitted: "2026-06-05 06:48", state: "GA", income: 88000, dti: 0.48, ficoBand: "640-679", risk: "High", status: "Manual Review", documents: ["app-form.pdf", "w2.pdf", "bank-3mo.pdf", "id.jpg"] },
  { id: "APP-100208", name: "Liam O'Brien", product: "Auto", amount: 41000, term: 72, channel: "Branch", submitted: "2026-06-05 06:20", state: "MA", income: 105000, dti: 0.31, ficoBand: "720-739", risk: "Low", status: "Auto-Approved", documents: ["app-form.pdf", "paystub.pdf", "id.jpg", "vehicle-quote.pdf"] },
  { id: "APP-100207", name: "Sofia Bianchi", product: "Personal", amount: 8500, term: 24, channel: "Mobile", submitted: "2026-06-05 05:55", state: "IL", income: 52000, dti: 0.39, ficoBand: "640-679", risk: "Medium", status: "Auto-Declined", documents: ["app-form.pdf", "paystub.pdf", "id.jpg"], declineReason: "DTI above policy threshold" },
  { id: "APP-100206", name: "Kenji Takahashi", product: "Mortgage", amount: 520000, term: 360, channel: "Web", submitted: "2026-06-04 22:14", state: "CA", income: 245000, dti: 0.32, ficoBand: "760+", risk: "Low", status: "Approved", documents: ["app-form.pdf", "w2-2024.pdf", "bank-6mo.pdf", "id-passport.jpg"] },
  { id: "APP-100205", name: "Hannah Pierce", product: "Auto", amount: 22000, term: 60, channel: "Web", submitted: "2026-06-04 19:30", state: "OH", income: 71000, dti: 0.29, ficoBand: "700-719", risk: "Low", status: "Approved", documents: ["app-form.pdf", "paystub.pdf", "id.jpg", "vehicle-quote.pdf"] },
  { id: "APP-100204", name: "Tom Jackson", product: "Personal", amount: 12500, term: 36, channel: "Mobile", submitted: "2026-06-04 18:11", state: "AZ", income: 48000, dti: 0.44, ficoBand: "640-679", risk: "High", status: "Manual Review", documents: ["app-form.pdf", "paystub.pdf", "id.jpg"] }
];

const RPA_STEPS_BY_PRODUCT = {
  Auto: [
    { id: 1, label: "PDF intake parse", detail: "Extract structured fields from application PDF using OCR + template" },
    { id: 2, label: "Identity verification", detail: "Cross-check name/SSN/DOB against KYC vendor" },
    { id: 3, label: "Address verification", detail: "USPS + utility-data confirmation" },
    { id: 4, label: "Credit bureau pull", detail: "Soft pull from TransUnion + Experian" },
    { id: 5, label: "Income/DTI computation", detail: "Parse paystub OCR, compute DTI" },
    { id: 6, label: "Vehicle valuation", detail: "VIN lookup against NADA/KBB" },
    { id: 7, label: "Fraud rule scoring", detail: "Run 24 fraud rules; flag exceptions" },
    { id: 8, label: "Decisioning policy", detail: "Apply auto-approve/manual/decline matrix" }
  ],
  Personal: [
    { id: 1, label: "PDF intake parse", detail: "Extract structured fields from application PDF" },
    { id: 2, label: "Identity verification", detail: "KYC vendor cross-check" },
    { id: 3, label: "Credit bureau pull", detail: "Soft pull from TransUnion + Experian" },
    { id: 4, label: "Income/DTI computation", detail: "Parse paystub OCR, compute DTI" },
    { id: 5, label: "Fraud rule scoring", detail: "Run 18 fraud rules" },
    { id: 6, label: "Decisioning policy", detail: "Apply auto-approve/manual/decline matrix" }
  ],
  Mortgage: [
    { id: 1, label: "PDF intake parse", detail: "Extract structured fields from 1003 + supporting docs" },
    { id: 2, label: "Identity + address verification", detail: "KYC + utility-data confirmation" },
    { id: 3, label: "Credit bureau pull", detail: "Tri-merge from TransUnion + Experian + Equifax" },
    { id: 4, label: "Document classification", detail: "W2 / paystub / bank-statement classifier" },
    { id: 5, label: "Income/DTI computation", detail: "2-year W2 + most-recent paystub OCR" },
    { id: 6, label: "Asset verification", detail: "Bank statement parsing for liquid assets" },
    { id: 7, label: "AVM property valuation", detail: "Automated property valuation model" },
    { id: 8, label: "Fraud + AML rule scoring", detail: "Run 42 fraud + AML rules" },
    { id: 9, label: "Decisioning policy", detail: "Apply AUS recommendation + overlays" }
  ]
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.applicants) return p;
    }
  } catch (e) {}
  const fresh = {
    applicants: JSON.parse(JSON.stringify(APPLICANTS)),
    selectedId: "APP-100214",
    activeFilter: "All",
    rpaRuns: {},
    auditTrail: [],
    sla: { autoTargetMins: 4, manualTargetHrs: 2 }
  };
  saveState(fresh); return fresh;
}
function saveState(state) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }

let STATE = loadState();

function escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function fmtMoney(n) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 }); }

function statusBadge(status) {
  const map = {
    "Pending Decision": "warning",
    "Auto-Approved": "success",
    "Approved": "success",
    "Manual Review": "info",
    "Auto-Declined": "danger",
    "Declined": "danger"
  };
  return `<span class="badge badge-pill badge-${map[status] || "secondary"}">${escape(status)}</span>`;
}
function riskPill(risk) {
  const map = { "Low": "success", "Medium": "warning", "High": "danger" };
  return `<span class="badge badge-${map[risk] || "secondary"}">${escape(risk)}</span>`;
}

function kpis() {
  const apps = STATE.applicants;
  const pending = apps.filter((a) => a.status === "Pending Decision").length;
  const manual = apps.filter((a) => a.status === "Manual Review").length;
  const auto = apps.filter((a) => /Auto/.test(a.status)).length;
  const approvedToday = apps.filter((a) => /Approved/i.test(a.status)).length;
  const declined = apps.filter((a) => /Declined/i.test(a.status)).length;
  const totalVol = apps.reduce((acc, a) => acc + (/Approved/i.test(a.status) ? a.amount : 0), 0);
  return { pending, manual, auto, approvedToday, declined, totalVol };
}

function renderShell() {
  const k = kpis();
  const sel = STATE.applicants.find((a) => a.id === STATE.selectedId) || STATE.applicants[0];
  return `
    <div class="nb-shell">
      <nav class="navbar navbar-dark" style="background: linear-gradient(90deg, #0d3b66 0%, #1e5fa3 100%);">
        <div class="container-fluid">
          <a class="navbar-brand font-weight-bold" href="#">
            <span style="background: #16a085; padding: 2px 8px; border-radius: 4px; color: #fff; font-size: 16px;">NB</span>
            NorthBank <span class="text-white-50 font-weight-normal">Lending Workbench</span>
          </a>
          <div class="d-flex align-items-center text-white-50">
            <span class="mr-3 small">RPA Service: <span class="text-success">&#9679; Online</span></span>
            <span class="mr-3 small">SLA Auto-Decision: ${STATE.sla.autoTargetMins} min</span>
            <button class="btn btn-sm btn-outline-light mr-2" data-action="help">App Context (?)</button>
            <span class="small">underwriter@northbank.com</span>
          </div>
        </div>
      </nav>

      <div class="container-fluid mt-3">
        <div class="row">
          <aside class="col-md-2">
            <div class="list-group">
              <a href="#" class="list-group-item list-group-item-action active">Application Queue</a>
              <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between">Underwriting<span class="badge badge-info badge-pill">${k.manual}</span></a>
              <a href="#" class="list-group-item list-group-item-action">Decisioning Policy</a>
              <a href="#" class="list-group-item list-group-item-action">Document Vault</a>
              <a href="#" class="list-group-item list-group-item-action">Borrower 360</a>
              <a href="#" class="list-group-item list-group-item-action">Reports</a>
              <a href="#" class="list-group-item list-group-item-action">RPA Bot Logs</a>
              <a href="#" class="list-group-item list-group-item-action">Settings</a>
            </div>

            <div class="card mt-3">
              <div class="card-header bg-light"><strong>Filters</strong></div>
              <div class="list-group list-group-flush">
                ${["All","Pending Decision","Manual Review","Auto-Approved","Approved","Auto-Declined"].map((f) => `<a href="#" class="list-group-item list-group-item-action ${STATE.activeFilter === f ? "active" : ""}" data-filter="${escape(f)}">${escape(f)}</a>`).join("")}
              </div>
            </div>
          </aside>

          <main class="col-md-10">
            <div class="row mb-3">
              ${[
                { label: "Pending Decisions", value: k.pending, color: "warning" },
                { label: "Manual Review Queue", value: k.manual, color: "info" },
                { label: "Auto-Decisioned Today", value: k.auto, color: "primary" },
                { label: "Approved Volume", value: fmtMoney(k.totalVol), color: "success" },
                { label: "Declined", value: k.declined, color: "danger" }
              ].map((c) => `
                <div class="col">
                  <div class="card border-${c.color} shadow-sm">
                    <div class="card-body py-2">
                      <div class="text-muted small text-uppercase">${c.label}</div>
                      <div class="h4 mb-0 text-${c.color}">${c.value}</div>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>

            <div class="row">
              <div class="col-md-7">
                <div class="card shadow-sm">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <span><strong>Application Queue</strong> &mdash; ${STATE.applicants.length} total</span>
                    <div>
                      <button class="btn btn-sm btn-outline-primary" data-action="export">Export CSV</button>
                      <button class="btn btn-sm btn-primary" data-action="new">+ New Application</button>
                    </div>
                  </div>
                  <div class="table-responsive">
                    <table class="table table-hover table-sm mb-0">
                      <thead class="thead-light">
                        <tr>
                          <th>App ID</th><th>Borrower</th><th>Product</th><th class="text-right">Amount</th><th>FICO</th><th>Risk</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${STATE.applicants
                          .filter((a) => STATE.activeFilter === "All" || a.status === STATE.activeFilter)
                          .map((a) => `
                            <tr class="${STATE.selectedId === a.id ? "table-primary" : ""}" data-app="${a.id}" style="cursor:pointer;">
                              <td><code>${a.id}</code></td>
                              <td>${escape(a.name)}<div class="text-muted small">${escape(a.state)} &middot; ${escape(a.channel)}</div></td>
                              <td>${escape(a.product)}</td>
                              <td class="text-right">${fmtMoney(a.amount)}</td>
                              <td>${escape(a.ficoBand)}</td>
                              <td>${riskPill(a.risk)}</td>
                              <td>${statusBadge(a.status)}</td>
                            </tr>`).join("")}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="card shadow-sm mt-3">
                  <div class="card-header"><strong>RPA Decisioning Pipeline</strong> &mdash; ${escape(sel.id)} ${escape(sel.name)}</div>
                  <div class="card-body">
                    ${renderRpaPipeline(sel)}
                  </div>
                </div>
              </div>

              <div class="col-md-5">
                ${renderApplicantPanel(sel)}
              </div>
            </div>

            <div class="row mt-3">
              <div class="col">
                <div class="card shadow-sm">
                  <div class="card-header"><strong>RPA Bot Audit Trail</strong> &mdash; last ${STATE.auditTrail.length} events</div>
                  <ul class="list-group list-group-flush" style="max-height: 220px; overflow-y: auto;">
                    ${(STATE.auditTrail.length ? STATE.auditTrail.slice(-15).reverse() : [{ ts: new Date().toLocaleString(), msg: "No bot events yet. Click 'Run RPA Pipeline' on a selected application to start." }]).map((e) => `<li class="list-group-item py-2 small"><span class="text-muted mr-3">${escape(e.ts)}</span> ${escape(e.msg)}</li>`).join("")}
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </div>
        <footer class="mt-4 mb-3 text-center text-muted small">NorthBank Lending Workbench v3.4 &middot; Bootstrap 4 &middot; SOC 2 Type II audited</footer>
      </div>
    </div>
  `;
}

function renderRpaPipeline(app) {
  const steps = RPA_STEPS_BY_PRODUCT[app.product] || RPA_STEPS_BY_PRODUCT.Personal;
  const run = STATE.rpaRuns[app.id];
  const completedCount = run ? run.completedSteps : 0;
  const total = steps.length;
  const pct = Math.round((completedCount / total) * 100);
  return `
    <div class="d-flex justify-content-between mb-2">
      <div><span class="badge badge-secondary mr-2">${escape(app.product)}</span> ${total} automated steps</div>
      <div>
        <button class="btn btn-sm btn-success mr-2" data-action="run-rpa" ${run && run.completedSteps === total ? "disabled" : ""}>${run ? "Continue Pipeline" : "Run RPA Pipeline"}</button>
        <button class="btn btn-sm btn-outline-secondary" data-action="reset-rpa">Reset</button>
      </div>
    </div>
    <div class="progress mb-3" style="height: 6px;">
      <div class="progress-bar bg-success" style="width:${pct}%;"></div>
    </div>
    <div class="row">
      ${steps.map((step) => {
        const done = run && completedCount >= step.id;
        const active = run && completedCount === step.id - 1;
        return `
          <div class="col-md-6 mb-2">
            <div class="d-flex align-items-start p-2 ${done ? "bg-light" : ""}" style="border-left: 3px solid ${done ? "#28a745" : (active ? "#ffc107" : "#dee2e6")};">
              <div class="mr-2" style="width:24px; height:24px; border-radius:50%; background:${done ? "#28a745" : (active ? "#ffc107" : "#dee2e6")}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;">${done ? "&#10003;" : step.id}</div>
              <div>
                <div><strong>${escape(step.label)}</strong>${done ? ` <span class="text-success small">(done in ${(Math.random()*2 + 0.4).toFixed(1)}s)</span>` : ""}</div>
                <div class="text-muted small">${escape(step.detail)}</div>
              </div>
            </div>
          </div>`;
      }).join("")}
    </div>
  `;
}

function renderApplicantPanel(app) {
  return `
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>${escape(app.name)}</strong>
            <div class="small text-white-50">${escape(app.id)} &middot; submitted ${escape(app.submitted)}</div>
          </div>
          ${statusBadge(app.status)}
        </div>
      </div>
      <div class="card-body">
        <dl class="row mb-2 small">
          <dt class="col-5">Product</dt><dd class="col-7">${escape(app.product)}</dd>
          <dt class="col-5">Requested Amount</dt><dd class="col-7">${fmtMoney(app.amount)}</dd>
          <dt class="col-5">Term</dt><dd class="col-7">${escape(app.term)} months</dd>
          <dt class="col-5">Channel</dt><dd class="col-7">${escape(app.channel)}</dd>
          <dt class="col-5">State</dt><dd class="col-7">${escape(app.state)}</dd>
          <dt class="col-5">Annual Income</dt><dd class="col-7">${fmtMoney(app.income)}</dd>
          <dt class="col-5">DTI</dt><dd class="col-7">${(app.dti*100).toFixed(0)}%</dd>
          <dt class="col-5">FICO Band</dt><dd class="col-7">${escape(app.ficoBand)}</dd>
          <dt class="col-5">Risk Rating</dt><dd class="col-7">${riskPill(app.risk)}</dd>
          ${app.declineReason ? `<dt class="col-5">Decline Reason</dt><dd class="col-7 text-danger">${escape(app.declineReason)}</dd>` : ""}
        </dl>
        <hr/>
        <div class="mb-2"><strong class="small text-uppercase text-muted">Documents</strong></div>
        <ul class="list-group list-group-flush">
          ${app.documents.map((d) => `<li class="list-group-item py-1 px-0 d-flex justify-content-between align-items-center small"><span>&#128196; ${escape(d)}</span><span class="text-success small">verified</span></li>`).join("")}
        </ul>

        <div class="d-flex mt-3">
          <button class="btn btn-success btn-sm mr-2 flex-fill" data-action="approve">Approve</button>
          <button class="btn btn-warning btn-sm mr-2 flex-fill" data-action="manual">Send to Manual Review</button>
          <button class="btn btn-danger btn-sm flex-fill" data-action="decline">Decline</button>
        </div>
      </div>
    </div>
  `;
}

function appendAudit(msg) {
  STATE.auditTrail.push({ ts: new Date().toLocaleTimeString(), msg });
  if (STATE.auditTrail.length > 200) STATE.auditTrail = STATE.auditTrail.slice(-200);
}

function runRpaStep(appId) {
  const app = STATE.applicants.find((a) => a.id === appId);
  if (!app) return false;
  const steps = RPA_STEPS_BY_PRODUCT[app.product] || RPA_STEPS_BY_PRODUCT.Personal;
  if (!STATE.rpaRuns[appId]) STATE.rpaRuns[appId] = { completedSteps: 0 };
  const run = STATE.rpaRuns[appId];
  if (run.completedSteps >= steps.length) return false;
  const step = steps[run.completedSteps];
  run.completedSteps += 1;
  appendAudit(`[${app.id}] RPA: ${step.label} - completed`);
  if (run.completedSteps === steps.length) {
    appendAudit(`[${app.id}] RPA: Decisioning policy evaluated`);
    if (app.status === "Pending Decision") {
      if (app.risk === "Low" && app.dti < 0.35) { app.status = "Auto-Approved"; appendAudit(`[${app.id}] AUTO-APPROVED by policy (low risk, DTI ${(app.dti*100).toFixed(0)}%)`); }
      else if (app.dti > 0.45 || app.risk === "High") { app.status = "Manual Review"; appendAudit(`[${app.id}] Sent to MANUAL REVIEW (DTI ${(app.dti*100).toFixed(0)}%, risk ${app.risk})`); }
      else { app.status = "Manual Review"; appendAudit(`[${app.id}] Sent to MANUAL REVIEW for underwriter review`); }
    }
  }
  saveState(STATE);
  return true;
}

function runAllRpaSteps(appId) {
  const app = STATE.applicants.find((a) => a.id === appId);
  if (!app) return;
  const steps = RPA_STEPS_BY_PRODUCT[app.product] || RPA_STEPS_BY_PRODUCT.Personal;
  let i = STATE.rpaRuns[appId] ? STATE.rpaRuns[appId].completedSteps : 0;
  function tick() {
    if (i >= steps.length) { render(); return; }
    runRpaStep(appId);
    i += 1;
    render();
    setTimeout(tick, 380);
  }
  tick();
}

function openHelp() {
  const overlay = document.createElement("div");
  overlay.className = "nb-modal-overlay";
  overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:flex-start; justify-content:center; padding-top:80px;";
  overlay.innerHTML = `
    <div style="background:#fff; max-width:760px; border-radius:6px; box-shadow:0 4px 24px rgba(0,0,0,0.3);">
      <div style="padding:14px 18px; border-bottom:1px solid #e2e6ea; font-weight:600; color:#0d3b66;">App Context &mdash; NorthBank Loan Origination</div>
      <div style="padding:16px 18px; font-size:13px; color:#333; line-height:1.5; max-height:60vh; overflow:auto; white-space:pre-wrap;">${escape(APP_DESCRIPTION)}</div>
      <div style="padding:10px 18px; background:#f8f9fa; border-top:1px solid #e2e6ea; text-align:right;"><button class="btn btn-primary btn-sm" id="nb-modal-close">Close</button></div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.getElementById("nb-modal-close").onclick = () => overlay.remove();
}

function exportCsv() {
  const headers = ["App ID", "Borrower", "Product", "Amount", "Term", "Channel", "State", "Income", "DTI", "FICO", "Risk", "Status"];
  const rows = STATE.applicants.map((a) => [a.id, a.name, a.product, a.amount, a.term, a.channel, a.state, a.income, (a.dti*100).toFixed(0) + "%", a.ficoBand, a.risk, a.status]);
  const csv = "\uFEFF" + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `northbank-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
}

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-app]").forEach((row) => row.addEventListener("click", () => { STATE.selectedId = row.dataset.app; saveState(STATE); render(); }));
  document.querySelectorAll("[data-filter]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); STATE.activeFilter = a.dataset.filter; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const action = b.dataset.action;
    const sel = STATE.applicants.find((a) => a.id === STATE.selectedId);
    if (action === "help") openHelp();
    else if (action === "export") exportCsv();
    else if (action === "new") { appendAudit("Manual application creation dialog (demo)"); saveState(STATE); render(); }
    else if (action === "run-rpa") { runAllRpaSteps(STATE.selectedId); }
    else if (action === "reset-rpa") { delete STATE.rpaRuns[STATE.selectedId]; if (sel) sel.status = "Pending Decision"; appendAudit(`[${STATE.selectedId}] RPA pipeline reset`); saveState(STATE); render(); }
    else if (action === "approve") { if (sel) { sel.status = "Approved"; appendAudit(`[${sel.id}] Underwriter APPROVED`); saveState(STATE); render(); } }
    else if (action === "manual") { if (sel) { sel.status = "Manual Review"; appendAudit(`[${sel.id}] Routed to manual review`); saveState(STATE); render(); } }
    else if (action === "decline") { if (sel) { sel.status = "Declined"; appendAudit(`[${sel.id}] Underwriter DECLINED`); saveState(STATE); render(); } }
  }));
}

render();
