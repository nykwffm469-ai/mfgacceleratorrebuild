const KEY = "iga";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - SailPilot Identity Governance

SailPilot Identity Governance is an identity-governance-and-administration (IGA) workbench used by security, audit, and IT operations teams to provision and certify user access, run quarterly access-review campaigns, mine roles, and detect separation-of-duties violations. Common usage includes opening the campaign dashboard, working a manager's certification queue, certifying or revoking user entitlements, raising an exception for a high-risk SoD violation, and watching joiner / mover / leaver workflows execute automatically when HR triggers fire.

This experience is inspired by SailPoint IdentityIQ and IdentityNow, Saviynt, Microsoft Entra ID Governance, and Okta Workflows. Potential RPA use cases include automated joiner provisioning across SAP / Active Directory / Okta / Salesforce / Workday, leaver de-provisioning at termination, mover transitions during department changes, mining entitlements to role-based access patterns, SoD violation detection at the entitlement-pair level, automated CIDR/MAC firewall rules from HR location data, certification campaign chasing of stalled managers, and audit-quality evidence collection for SOX ITGC-04 controls.`;

const CAMPAIGNS = [
  { id: "CAMP-2026-Q2", name: "Q2 2026 Privileged Access Review", scope: "All Domain Admins, DBA, SAP Basis (88 users / 412 entitlements)", due: "2026-06-15", progress: 64, ownerCt: 22, stalledCt: 4 },
  { id: "CAMP-2026-AP", name: "AP / Finance Annual Review", scope: "All AP and Finance system access (218 users / 1,840 entitlements)", due: "2026-07-31", progress: 28, ownerCt: 48, stalledCt: 12 },
  { id: "CAMP-2026-CONTR", name: "Contractor Quarterly Re-Cert", scope: "All contractor accounts (62 users / 244 entitlements)", due: "2026-06-30", progress: 91, ownerCt: 14, stalledCt: 1 }
];

const ACCESS_ITEMS = [
  { user: "marcus.allen", role: "SAP Admin (Basis)", system: "SAP S/4 HANA Prod", granted: "2024-11-08", lastUsed: "2 hrs ago", risk: "High", reviewer: "you", recommendation: "Recertify - high usage" },
  { user: "marcus.allen", role: "Domain Admin", system: "Active Directory Prod", granted: "2025-01-22", lastUsed: "1 day ago", risk: "Critical", reviewer: "you", recommendation: "Recertify - high usage" },
  { user: "jenna.whitfield", role: "AP Approver Tier 3 (>$25K)", system: "Oracle EBS AP", granted: "2024-09-14", lastUsed: "5 days ago", risk: "High", reviewer: "you", recommendation: "Recertify - role matches HR title" },
  { user: "jenna.whitfield", role: "AP Approver Tier 2 (>$10K)", system: "Oracle EBS AP", granted: "2024-09-14", lastUsed: "1 day ago", risk: "Medium", reviewer: "you", recommendation: "Recertify - role matches HR title" },
  { user: "diego.romero", role: "AR Receiving Cash Apply", system: "Oracle EBS AR", granted: "2024-12-04", lastUsed: "Today", risk: "High", reviewer: "you", recommendation: "&#9888; SoD VIOLATION with 'AR Adjust' - REVOKE one" },
  { user: "diego.romero", role: "AR Adjust", system: "Oracle EBS AR", granted: "2025-03-18", lastUsed: "4 days ago", risk: "High", reviewer: "you", recommendation: "&#9888; SoD VIOLATION with 'Cash Apply' - REVOKE one" },
  { user: "priya.shankar", role: "GL Journal Approver", system: "Oracle EBS GL", granted: "2023-04-22", lastUsed: "21 days ago", risk: "Medium", reviewer: "you", recommendation: "Recertify - usage below threshold" },
  { user: "robert.chen", role: "Wire Initiator", system: "FIS IBS Wire", granted: "2024-08-19", lastUsed: "31 days ago", risk: "Critical", reviewer: "you", recommendation: "REVOKE - mover event from Treasury -> FP&A" },
  { user: "hannah.pierce", role: "Domain Admin", system: "Active Directory Prod", granted: "2022-06-30", lastUsed: "Never", risk: "Critical", reviewer: "you", recommendation: "REVOKE - dormant 4+ years, no business need" },
  { user: "tom.jackson", role: "Vendor Master Maintain", system: "SAP MM", granted: "2025-02-14", lastUsed: "Today", risk: "High", reviewer: "you", recommendation: "&#9888; SoD VIOLATION with 'AP Pay' - REVOKE one" }
];

function loadState() { try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.campaigns) return p; } } catch (e) {} const f = { campaigns: CAMPAIGNS, items: ACCESS_ITEMS, decisions: {}, activeCamp: "CAMP-2026-Q2" }; saveState(f); return f; }
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
let STATE = loadState();

function risk(r) { const c = r==="Critical"?"danger":r==="High"?"warning":r==="Medium"?"info":"secondary"; return `<span class="badge badge-${c}">${esc(r)}</span>`; }

function renderShell() {
  const camp = STATE.campaigns.find((c) => c.id === STATE.activeCamp) || STATE.campaigns[0];
  return `
    <div style="min-height:100vh;">
      <nav class="navbar navbar-dark" style="background:linear-gradient(90deg,#1d3557 0%,#457b9d 100%);">
        <div class="container-fluid">
          <span class="navbar-brand font-weight-bold"><span style="background:#f1c40f;color:#1d3557;padding:2px 8px;border-radius:4px;">SP</span> SailPilot <span class="text-white-50">Identity Governance</span></span>
          <div class="d-flex align-items-center text-white-50">
            <span class="mr-3 small">Open campaigns: <strong class="text-white">${STATE.campaigns.length}</strong></span>
            <span class="mr-3 small">SoD violations: <strong class="text-warning">3</strong></span>
            <button data-action="help" class="btn btn-sm btn-outline-light mr-2">App Context (?)</button>
            <a href="../" class="text-white">Main</a>
          </div>
        </div>
      </nav>

      <div class="container-fluid mt-3">
        <div class="row mb-3">
          ${STATE.campaigns.map((c) => `
            <div class="col-md-4">
              <div class="card shadow-sm ${STATE.activeCamp===c.id?"border-primary":""}" data-camp="${c.id}" style="cursor:pointer;">
                <div class="card-body">
                  <div class="small text-uppercase text-muted">${esc(c.id)}</div>
                  <h6 class="font-weight-bold">${esc(c.name)}</h6>
                  <div class="small text-muted">${esc(c.scope)}</div>
                  <div class="d-flex justify-content-between small mt-2"><span>Due ${esc(c.due)}</span><span>${c.progress}% complete</span></div>
                  <div class="progress" style="height:5px;"><div class="progress-bar bg-success" style="width:${c.progress}%;"></div></div>
                  <div class="d-flex justify-content-between small mt-2"><span class="text-muted">${c.ownerCt} reviewers</span><span class="text-warning">${c.stalledCt} stalled</span></div>
                </div>
              </div>
            </div>`).join("")}
        </div>

        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center"><strong>Certification Queue: ${esc(camp.name)}</strong> <span class="badge badge-secondary">${STATE.items.length} items to review</span></div>
          <table class="table table-hover table-sm mb-0">
            <thead class="thead-light">
              <tr><th>User</th><th>Role / Entitlement</th><th>System</th><th>Granted</th><th>Last Used</th><th>Risk</th><th>Bot Recommendation</th><th class="text-right">Action</th></tr>
            </thead>
            <tbody>
              ${STATE.items.map((it, idx) => {
                const d = STATE.decisions[idx];
                return `<tr style="${d?"opacity:0.6;":""}">
                  <td><strong>${esc(it.user)}</strong></td>
                  <td>${esc(it.role)}</td>
                  <td><code>${esc(it.system)}</code></td>
                  <td>${esc(it.granted)}</td>
                  <td>${esc(it.lastUsed)}</td>
                  <td>${risk(it.risk)}</td>
                  <td style="font-size:11px;">${it.recommendation}</td>
                  <td class="text-right">
                    ${d ? `<span class="badge badge-${d==="approved"?"success":"danger"}">${d.toUpperCase()}</span>` : `
                      <button class="btn btn-sm btn-success" data-cert="${idx}" data-decide="approved">&#10003; Certify</button>
                      <button class="btn btn-sm btn-danger" data-cert="${idx}" data-decide="revoked">&#10007; Revoke</button>
                    `}
                  </td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div class="row mt-3">
          <div class="col-md-7">
            <div class="card shadow-sm">
              <div class="card-header"><strong>RPA Bot Joiner / Mover / Leaver Activity</strong></div>
              <ul class="list-group list-group-flush" style="max-height:200px;overflow:auto;">
                ${[
                  { ts:"09:14", msg:"JOINER bot: provisioned hannah.pierce in AD, Okta, Salesforce, SAP, Concur (5 systems, 14 entitlements) in 22s" },
                  { ts:"08:42", msg:"MOVER bot: robert.chen moved Treasury -> FP&A. De-provisioned 3 wire-initiator entitlements, granted 4 FP&A entitlements" },
                  { ts:"07:55", msg:"LEAVER bot: tom.jackson terminated. Disabled 9 accounts, archived mailbox, revoked 22 entitlements in 18s" },
                  { ts:"07:30", msg:"SoD ENGINE: detected new violation: diego.romero (AR Cash Apply + AR Adjust)" },
                  { ts:"yesterday", msg:"CAMPAIGN bot: chased 12 stalled managers. 8 completed within 4 hours." }
                ].map((e) => `<li class="list-group-item small py-1"><span class="text-muted mr-2">${esc(e.ts)}</span> ${esc(e.msg)}</li>`).join("")}
              </ul>
            </div>
          </div>
          <div class="col-md-5">
            <div class="card shadow-sm">
              <div class="card-header"><strong>SoD Violations (Critical)</strong></div>
              <div class="card-body">
                ${[
                  { user:"diego.romero", a:"AR Cash Apply", b:"AR Adjust", risk:"Critical" },
                  { user:"tom.jackson", a:"Vendor Master Maintain", b:"AP Pay", risk:"Critical" },
                  { user:"sofia.bianchi", a:"GL Post", b:"GL Approve", risk:"High" }
                ].map((v) => `<div class="border-left border-danger pl-2 mb-2"><strong>${esc(v.user)}</strong> ${risk(v.risk)}<div class="small">'${esc(v.a)}' + '${esc(v.b)}' violates SoD policy</div></div>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openHelp() { const o = document.createElement("div"); o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;"; o.innerHTML = `<div style="background:#fff;max-width:760px;border-radius:6px;"><div style="padding:14px 18px;border-bottom:1px solid #e2e6ea;font-weight:600;">App Context</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #e2e6ea;text-align:right;"><button id="ic" class="btn btn-primary btn-sm">Close</button></div></div>`; document.body.appendChild(o); o.onclick = (e) => { if (e.target === o) o.remove(); }; document.getElementById("ic").onclick = () => o.remove(); }

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-camp]").forEach((c) => c.addEventListener("click", () => { STATE.activeCamp = c.dataset.camp; saveState(STATE); render(); }));
  document.querySelectorAll("[data-cert]").forEach((b) => b.addEventListener("click", () => { STATE.decisions[b.dataset.cert] = b.dataset.decide; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => { if (b.dataset.action === "help") openHelp(); }));
}
render();
