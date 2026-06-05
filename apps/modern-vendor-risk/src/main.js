const STORAGE_KEY = "vp-vendor-risk";

const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - VendorPulse Risk Cockpit

VendorPulse Risk Cockpit is a modern web application used by procurement, third-party risk management, and compliance teams to onboard new vendors and continuously monitor vendor risk posture. Common usage includes intake of vendor self-service registration packets, document validation, OFAC/sanctions screening, tier-based due diligence (SOC 2, financial health, cyber posture), and pushing approved vendor masters to the ERP for invoice eligibility.

This experience is a modern Bootstrap 4 web app inspired by Coupa Risk Aware, ProcessUnity, OneTrust Vendor Risk, and ServiceNow Vendor Risk Management. Potential RPA use cases include automated W9 / EIN validation, COI (insurance certificate) parsing and expiration tracking, bank account verification via micro-deposit or Plaid, OFAC and sanctions list screening, SOC 2 report ingestion and control evidence extraction, ERP master data push with three-way reconciliation, scheduled vendor refresh campaigns, and risk-tier downgrade alerts when SLA or KPI breaches occur.`;

const VENDORS = [
  { id: "VEN-44120", name: "Apex Industrial Supply Co.", country: "USA", tier: "Tier 1", category: "Direct Material", spend: 4250000, status: "Active", risk: 22, ofac: "Clear", w9: "Valid", coi: { state: "Valid", expires: "2026-11-30" }, soc2: "Verified", lastReview: "2026-04-12", contact: "supplier-ops@apex-industrial.com" },
  { id: "VEN-44119", name: "Coastline Logistics LLC", country: "USA", tier: "Tier 2", category: "Freight", spend: 1880000, status: "Active", risk: 38, ofac: "Clear", w9: "Valid", coi: { state: "Expiring Soon", expires: "2026-06-22" }, soc2: "Not Required", lastReview: "2026-03-04", contact: "ar@coastlinelog.com" },
  { id: "VEN-44118", name: "Globex Hosting Services GmbH", country: "Germany", tier: "Tier 1", category: "IT Services / Hosting", spend: 2160000, status: "Pending Renewal", risk: 27, ofac: "Clear", w9: "N/A (W8-BEN-E)", coi: { state: "Valid", expires: "2027-02-14" }, soc2: "Verified", lastReview: "2026-02-28", contact: "compliance@globex-hosting.de" },
  { id: "VEN-44117", name: "Bluewater Marketing Partners", country: "USA", tier: "Tier 3", category: "Marketing", spend: 220000, status: "Active", risk: 19, ofac: "Clear", w9: "Valid", coi: { state: "Valid", expires: "2026-08-04" }, soc2: "Not Required", lastReview: "2026-05-10", contact: "billing@bluewatermktg.com" },
  { id: "VEN-44116", name: "Stark Manufacturing Group", country: "USA", tier: "Tier 1", category: "Direct Material", spend: 6740000, status: "Active", risk: 31, ofac: "Clear", w9: "Valid", coi: { state: "Valid", expires: "2026-12-31" }, soc2: "Verified", lastReview: "2026-04-30", contact: "ap@stark-mfg.com" },
  { id: "VEN-44115", name: "Northwind Industrial Lubricants", country: "Canada", tier: "Tier 2", category: "MRO", spend: 412000, status: "Onboarding", risk: 0, ofac: "Pending", w9: "Pending", coi: { state: "Pending", expires: "" }, soc2: "Not Required", lastReview: "", contact: "newaccounts@northwindlube.ca" },
  { id: "VEN-44114", name: "Vertex Cyber Defense Inc.", country: "USA", tier: "Tier 1", category: "Cybersecurity Services", spend: 1640000, status: "Active", risk: 33, ofac: "Clear", w9: "Valid", coi: { state: "Valid", expires: "2027-01-12" }, soc2: "Verified", lastReview: "2026-04-21", contact: "msp-billing@vertexcyber.com" },
  { id: "VEN-44113", name: "Helios Solar Components", country: "China", tier: "Tier 2", category: "Direct Material", spend: 980000, status: "Risk Hold", risk: 71, ofac: "Hit - Review", w9: "N/A (W8-BEN-E)", coi: { state: "Expired", expires: "2026-04-18" }, soc2: "Not Required", lastReview: "2026-02-04", contact: "international.sales@helios-solar.cn" },
  { id: "VEN-44112", name: "Quantum Analytics Studio", country: "USA", tier: "Tier 3", category: "Consulting", spend: 168000, status: "Onboarding", risk: 0, ofac: "Pending", w9: "Pending", coi: { state: "Pending", expires: "" }, soc2: "Pending", lastReview: "", contact: "ops@quantumanalytics.io" },
  { id: "VEN-44111", name: "Pioneer Trucking Co", country: "USA", tier: "Tier 2", category: "Freight", spend: 720000, status: "Active", risk: 41, ofac: "Clear", w9: "Valid", coi: { state: "Expiring Soon", expires: "2026-06-18" }, soc2: "Not Required", lastReview: "2026-03-19", contact: "remittance@pioneertrucking.com" },
  { id: "VEN-44110", name: "Allied Office Supplies LLC", country: "USA", tier: "Tier 3", category: "Indirect / Office", spend: 84000, status: "Inactive", risk: 12, ofac: "Clear", w9: "Valid", coi: { state: "Not Required", expires: "" }, soc2: "Not Required", lastReview: "2025-11-08", contact: "ar@alliedoffice.com" }
];

const RPA_STEPS = [
  { id: 1, label: "W9 / EIN validation", detail: "Validate W9 form fields and IRS EIN lookup" },
  { id: 2, label: "Bank account verification", detail: "Plaid / micro-deposit ACH routing + account check" },
  { id: 3, label: "OFAC + sanctions screening", detail: "Screen against OFAC SDN, EU consolidated, UK HMT lists" },
  { id: 4, label: "COI insurance parse", detail: "Parse certificate of insurance PDF for coverage limits and expiration" },
  { id: 5, label: "SOC 2 / cyber posture intake", detail: "Ingest SOC 2 report, extract CC controls and exceptions" },
  { id: 6, label: "Financial health score", detail: "Dun & Bradstreet PAYDEX + Experian Business Credit pull" },
  { id: 7, label: "Tier classification", detail: "Apply spend / criticality / data-access matrix" },
  { id: 8, label: "ERP master push", detail: "Create vendor master record in SAP / Oracle and route for AP eligibility" }
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const p = JSON.parse(raw); if (p && p.vendors) return p; }
  } catch (e) {}
  const fresh = { vendors: JSON.parse(JSON.stringify(VENDORS)), selectedId: "VEN-44115", activeFilter: "All", rpaRuns: {}, auditTrail: [] };
  saveState(fresh); return fresh;
}
function saveState(state) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }

let STATE = loadState();

function escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function fmtMoney(n) { return "$" + Number(n).toLocaleString("en-US"); }

function statusBadge(status) {
  const map = { "Active": "success", "Pending Renewal": "warning", "Onboarding": "info", "Risk Hold": "danger", "Inactive": "secondary" };
  return `<span class="badge badge-${map[status] || "secondary"}">${escape(status)}</span>`;
}
function tierPill(tier) {
  const map = { "Tier 1": "danger", "Tier 2": "warning", "Tier 3": "info" };
  return `<span class="badge badge-${map[tier] || "secondary"}">${escape(tier)}</span>`;
}
function riskBar(score) {
  const color = score === 0 ? "secondary" : score < 30 ? "success" : score < 50 ? "warning" : "danger";
  const label = score === 0 ? "Not scored" : score < 30 ? "Low" : score < 50 ? "Medium" : "High";
  return `
    <div class="d-flex align-items-center">
      <div class="progress flex-grow-1 mr-2" style="height: 6px;">
        <div class="progress-bar bg-${color}" style="width: ${score}%;"></div>
      </div>
      <span class="badge badge-${color}">${score}&nbsp;${label}</span>
    </div>
  `;
}
function docBadge(state, expires) {
  const cls = state === "Valid" ? "success" : state === "Expiring Soon" ? "warning" : state === "Expired" ? "danger" : state === "Pending" ? "info" : "secondary";
  return `<span class="badge badge-${cls}">${escape(state)}${expires ? ` &middot; exp ${escape(expires)}` : ""}</span>`;
}

function kpis() {
  const v = STATE.vendors;
  const active = v.filter((x) => x.status === "Active").length;
  const onboarding = v.filter((x) => x.status === "Onboarding").length;
  const hold = v.filter((x) => x.status === "Risk Hold").length;
  const expiring = v.filter((x) => x.coi.state === "Expiring Soon" || x.coi.state === "Expired").length;
  const high = v.filter((x) => x.risk >= 50).length;
  const totalSpend = v.reduce((acc, x) => acc + (x.status === "Active" ? x.spend : 0), 0);
  return { active, onboarding, hold, expiring, high, totalSpend };
}

function renderShell() {
  const k = kpis();
  const sel = STATE.vendors.find((v) => v.id === STATE.selectedId) || STATE.vendors[0];
  return `
    <div class="vp-shell">
      <nav class="navbar navbar-dark" style="background: linear-gradient(90deg, #1c2541 0%, #3a506b 100%);">
        <div class="container-fluid">
          <a class="navbar-brand font-weight-bold" href="#">
            <span style="background:#5bc0be; padding:2px 8px; border-radius:4px; color:#0b132b; font-size:16px;">VP</span>
            VendorPulse <span class="text-white-50 font-weight-normal">Risk Cockpit</span>
          </a>
          <div class="d-flex align-items-center text-white-50">
            <span class="mr-3 small">RPA Bot: <span class="text-success">&#9679; Online</span></span>
            <span class="mr-3 small">OFAC list: 06/04/2026</span>
            <button class="btn btn-sm btn-outline-light mr-2" data-action="help">App Context (?)</button>
            <span class="small">risk-officer@contoso.com</span>
          </div>
        </div>
      </nav>

      <div class="container-fluid mt-3">
        <div class="row mb-3">
          ${[
            { label: "Active Vendors", value: k.active, color: "success" },
            { label: "In Onboarding", value: k.onboarding, color: "info" },
            { label: "Risk Hold", value: k.hold, color: "danger" },
            { label: "Expiring COI", value: k.expiring, color: "warning" },
            { label: "High Risk", value: k.high, color: "danger" },
            { label: "Active Spend / yr", value: fmtMoney(k.totalSpend), color: "primary" }
          ].map((c) => `
            <div class="col">
              <div class="card shadow-sm border-${c.color}">
                <div class="card-body py-2">
                  <div class="text-muted small text-uppercase">${c.label}</div>
                  <div class="h5 mb-0 text-${c.color}">${c.value}</div>
                </div>
              </div>
            </div>`).join("")}
        </div>

        <div class="row">
          <div class="col-md-7">
            <div class="card shadow-sm">
              <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>Vendor Registry</strong> &mdash; ${STATE.vendors.length} total
                  <div class="btn-group btn-group-sm ml-3">
                    ${["All","Onboarding","Active","Risk Hold","Pending Renewal","Inactive"].map((f) => `<button type="button" class="btn btn-outline-secondary ${STATE.activeFilter === f ? "active" : ""}" data-filter="${escape(f)}">${escape(f)}</button>`).join("")}
                  </div>
                </div>
                <div>
                  <button class="btn btn-sm btn-outline-primary mr-1" data-action="export">Export</button>
                  <button class="btn btn-sm btn-primary" data-action="new">+ Invite Vendor</button>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table table-hover table-sm mb-0">
                  <thead class="thead-light">
                    <tr><th>Vendor</th><th>Country</th><th>Tier</th><th>Category</th><th class="text-right">Spend / yr</th><th>Risk</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    ${STATE.vendors
                      .filter((v) => STATE.activeFilter === "All" || v.status === STATE.activeFilter)
                      .map((v) => `
                        <tr class="${STATE.selectedId === v.id ? "table-primary" : ""}" data-vendor="${v.id}" style="cursor:pointer;">
                          <td><div>${escape(v.name)}</div><div class="text-muted small"><code>${v.id}</code></div></td>
                          <td>${escape(v.country)}</td>
                          <td>${tierPill(v.tier)}</td>
                          <td class="small">${escape(v.category)}</td>
                          <td class="text-right">${fmtMoney(v.spend)}</td>
                          <td style="min-width:160px;">${riskBar(v.risk)}</td>
                          <td>${statusBadge(v.status)}</td>
                        </tr>`).join("")}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="card shadow-sm mt-3">
              <div class="card-header"><strong>RPA Onboarding Pipeline</strong> &mdash; ${escape(sel.id)} ${escape(sel.name)}</div>
              <div class="card-body">${renderRpaPipeline(sel)}</div>
            </div>
          </div>

          <div class="col-md-5">${renderVendorPanel(sel)}</div>
        </div>

        <div class="row mt-3">
          <div class="col">
            <div class="card shadow-sm">
              <div class="card-header"><strong>RPA Bot Audit Trail</strong></div>
              <ul class="list-group list-group-flush" style="max-height: 220px; overflow-y: auto;">
                ${(STATE.auditTrail.length ? STATE.auditTrail.slice(-15).reverse() : [{ ts: new Date().toLocaleString(), msg: "No events yet. Select a vendor and click 'Run RPA Pipeline'." }]).map((e) => `<li class="list-group-item py-2 small"><span class="text-muted mr-3">${escape(e.ts)}</span> ${escape(e.msg)}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>
        <footer class="mt-4 mb-3 text-center text-muted small">VendorPulse Risk Cockpit v2.7 &middot; Bootstrap 4 &middot; SOC 2 + ISO 27001</footer>
      </div>
    </div>
  `;
}

function renderRpaPipeline(vendor) {
  const run = STATE.rpaRuns[vendor.id];
  const completedCount = run ? run.completedSteps : 0;
  const total = RPA_STEPS.length;
  const pct = Math.round((completedCount / total) * 100);
  return `
    <div class="d-flex justify-content-between mb-2">
      <div>${total} automated steps to onboard or refresh a vendor</div>
      <div>
        <button class="btn btn-sm btn-success mr-2" data-action="run-rpa" ${run && run.completedSteps === total ? "disabled" : ""}>${run ? "Continue Pipeline" : "Run RPA Pipeline"}</button>
        <button class="btn btn-sm btn-outline-secondary" data-action="reset-rpa">Reset</button>
      </div>
    </div>
    <div class="progress mb-3" style="height: 6px;">
      <div class="progress-bar bg-success" style="width:${pct}%;"></div>
    </div>
    <div class="row">
      ${RPA_STEPS.map((step) => {
        const done = run && completedCount >= step.id;
        const active = run && completedCount === step.id - 1;
        return `
          <div class="col-md-6 mb-2">
            <div class="d-flex align-items-start p-2 ${done ? "bg-light" : ""}" style="border-left: 3px solid ${done ? "#28a745" : (active ? "#ffc107" : "#dee2e6")};">
              <div class="mr-2" style="width:24px; height:24px; border-radius:50%; background:${done ? "#28a745" : (active ? "#ffc107" : "#dee2e6")}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;">${done ? "&#10003;" : step.id}</div>
              <div>
                <div><strong>${escape(step.label)}</strong>${done ? ` <span class="text-success small">(done in ${(Math.random()*2 + 0.3).toFixed(1)}s)</span>` : ""}</div>
                <div class="text-muted small">${escape(step.detail)}</div>
              </div>
            </div>
          </div>`;
      }).join("")}
    </div>
  `;
}

function renderVendorPanel(vendor) {
  return `
    <div class="card shadow-sm">
      <div class="card-header" style="background:#0b132b; color:#fff;">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>${escape(vendor.name)}</strong>
            <div class="small text-white-50">${escape(vendor.id)} &middot; ${escape(vendor.country)} &middot; ${escape(vendor.category)}</div>
          </div>
          ${statusBadge(vendor.status)}
        </div>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <div class="small text-muted text-uppercase">Risk Score</div>
          ${riskBar(vendor.risk)}
        </div>

        <dl class="row mb-2 small">
          <dt class="col-5">Tier</dt><dd class="col-7">${tierPill(vendor.tier)}</dd>
          <dt class="col-5">Annual Spend</dt><dd class="col-7">${fmtMoney(vendor.spend)}</dd>
          <dt class="col-5">Primary Contact</dt><dd class="col-7"><a href="#">${escape(vendor.contact)}</a></dd>
          <dt class="col-5">Last Review</dt><dd class="col-7">${escape(vendor.lastReview || "-")}</dd>
        </dl>
        <hr/>
        <div class="mb-2"><strong class="small text-uppercase text-muted">Document Validation</strong></div>
        <table class="table table-sm table-borderless small mb-0">
          <tr><td class="text-muted">W9 / Tax</td><td>${docBadge(vendor.w9, "")}</td></tr>
          <tr><td class="text-muted">OFAC / Sanctions</td><td>${docBadge(vendor.ofac, "")}</td></tr>
          <tr><td class="text-muted">Insurance (COI)</td><td>${docBadge(vendor.coi.state, vendor.coi.expires)}</td></tr>
          <tr><td class="text-muted">SOC 2 Report</td><td>${docBadge(vendor.soc2, "")}</td></tr>
        </table>

        <div class="d-flex mt-3">
          <button class="btn btn-success btn-sm mr-2 flex-fill" data-action="approve">Approve Onboarding</button>
          <button class="btn btn-warning btn-sm mr-2 flex-fill" data-action="hold">Place on Risk Hold</button>
          <button class="btn btn-outline-danger btn-sm flex-fill" data-action="inactivate">Inactivate</button>
        </div>
      </div>
    </div>
  `;
}

function appendAudit(msg) {
  STATE.auditTrail.push({ ts: new Date().toLocaleTimeString(), msg });
  if (STATE.auditTrail.length > 200) STATE.auditTrail = STATE.auditTrail.slice(-200);
}

function runRpaStep(vendorId) {
  const vendor = STATE.vendors.find((v) => v.id === vendorId);
  if (!vendor) return false;
  if (!STATE.rpaRuns[vendorId]) STATE.rpaRuns[vendorId] = { completedSteps: 0 };
  const run = STATE.rpaRuns[vendorId];
  if (run.completedSteps >= RPA_STEPS.length) return false;
  const step = RPA_STEPS[run.completedSteps];
  run.completedSteps += 1;
  appendAudit(`[${vendor.id}] RPA: ${step.label} - completed`);

  // simulate side effects per step
  if (step.id === 1) { vendor.w9 = vendor.w9 === "Pending" ? "Valid" : vendor.w9; }
  if (step.id === 3) { vendor.ofac = vendor.ofac === "Pending" ? "Clear" : vendor.ofac; }
  if (step.id === 4) { if (vendor.coi.state === "Pending") { vendor.coi = { state: "Valid", expires: "2027-06-30" }; } }
  if (step.id === 5) { if (vendor.soc2 === "Pending") vendor.soc2 = "Verified"; }
  if (step.id === 6) { vendor.risk = Math.max(15, Math.round((vendor.spend > 1_000_000 ? 28 : 18) + Math.random() * 10)); }
  if (run.completedSteps === RPA_STEPS.length) {
    appendAudit(`[${vendor.id}] RPA: ERP master created (SAP MM)`);
    if (vendor.status === "Onboarding") { vendor.status = "Active"; appendAudit(`[${vendor.id}] Vendor status -> ACTIVE (auto-onboarded)`); }
  }
  saveState(STATE);
  return true;
}

function runAllRpa(vendorId) {
  let i = STATE.rpaRuns[vendorId] ? STATE.rpaRuns[vendorId].completedSteps : 0;
  function tick() {
    if (i >= RPA_STEPS.length) { render(); return; }
    runRpaStep(vendorId);
    i += 1;
    render();
    setTimeout(tick, 360);
  }
  tick();
}

function openHelp() {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:flex-start; justify-content:center; padding-top:80px;";
  overlay.innerHTML = `
    <div style="background:#fff; max-width:760px; border-radius:6px; box-shadow:0 4px 24px rgba(0,0,0,0.3);">
      <div style="padding:14px 18px; border-bottom:1px solid #e2e6ea; font-weight:600; color:#0b132b;">App Context &mdash; VendorPulse Risk Cockpit</div>
      <div style="padding:16px 18px; font-size:13px; color:#333; line-height:1.5; max-height:60vh; overflow:auto; white-space:pre-wrap;">${escape(APP_DESCRIPTION)}</div>
      <div style="padding:10px 18px; background:#f8f9fa; border-top:1px solid #e2e6ea; text-align:right;"><button class="btn btn-primary btn-sm" id="vp-modal-close">Close</button></div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.getElementById("vp-modal-close").onclick = () => overlay.remove();
}

function exportCsv() {
  const headers = ["Vendor ID", "Vendor Name", "Country", "Tier", "Category", "Annual Spend", "Risk Score", "OFAC", "W9", "COI State", "COI Expires", "SOC 2", "Status"];
  const rows = STATE.vendors.map((v) => [v.id, v.name, v.country, v.tier, v.category, v.spend, v.risk, v.ofac, v.w9, v.coi.state, v.coi.expires, v.soc2, v.status]);
  const csv = "\uFEFF" + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `vendorpulse-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
}

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-vendor]").forEach((row) => row.addEventListener("click", () => { STATE.selectedId = row.dataset.vendor; saveState(STATE); render(); }));
  document.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); STATE.activeFilter = b.dataset.filter; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const action = b.dataset.action;
    const sel = STATE.vendors.find((v) => v.id === STATE.selectedId);
    if (action === "help") openHelp();
    else if (action === "export") exportCsv();
    else if (action === "new") { appendAudit("Vendor invite email sent (demo)"); saveState(STATE); render(); }
    else if (action === "run-rpa") runAllRpa(STATE.selectedId);
    else if (action === "reset-rpa") { delete STATE.rpaRuns[STATE.selectedId]; appendAudit(`[${STATE.selectedId}] RPA pipeline reset`); saveState(STATE); render(); }
    else if (action === "approve") { if (sel) { sel.status = "Active"; appendAudit(`[${sel.id}] Approved by risk officer`); saveState(STATE); render(); } }
    else if (action === "hold") { if (sel) { sel.status = "Risk Hold"; appendAudit(`[${sel.id}] Placed on Risk Hold`); saveState(STATE); render(); } }
    else if (action === "inactivate") { if (sel) { sel.status = "Inactive"; appendAudit(`[${sel.id}] Inactivated`); saveState(STATE); render(); } }
  }));
}

render();
