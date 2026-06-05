const KEY = "bot-orchestrator";

const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - Bot Orchestrator Control Room

Bot Orchestrator Control Room is the central command-and-control plane for an automation program. RPA developers, COE leads, ops engineers, and business owners use it to deploy bots, schedule unattended runs, monitor work queues, triage exceptions, manage credentials in the asset vault, and audit every transaction the bot fleet has processed. Common usage includes monitoring the live activity feed during business hours, intervening when a queue stalls, retrying failed items, holding a misbehaving bot, and rotating service-account passwords.

This experience is inspired by UiPath Orchestrator, Microsoft Power Automate Cloud, Blue Prism Control Room, and Automation Anywhere Control Room. Potential RPA use cases are the orchestration product itself: queue-based work distribution, attended vs unattended scheduling, multi-tenant environments (Dev/UAT/Prod), bot license management, credential vaulting (CyberArk-style), SLA monitoring with auto-escalation, intelligent retry logic for transient failures, and lineage from any business transaction back to the bot run and source document.`;

const BOTS = [
  { id: "BOT-001", name: "ap-invoice-extractor", process: "AP Invoice IDP + GL Coding", host: "PRD-RT-01", env: "Prod", state: "Running", lastRun: "00:00:04 ago", successRate: 96.8, txToday: 184, avgSec: 18 },
  { id: "BOT-002", name: "vendor-master-onboarding", process: "Vendor Onboarding (W9/OFAC/COI/ERP push)", host: "PRD-RT-02", env: "Prod", state: "Running", lastRun: "00:02:11 ago", successRate: 99.1, txToday: 38, avgSec: 142 },
  { id: "BOT-003", name: "loan-decision-engine", process: "NorthBank Loan Decisioning", host: "PRD-RT-03", env: "Prod", state: "Running", lastRun: "00:00:42 ago", successRate: 98.4, txToday: 412, avgSec: 12 },
  { id: "BOT-004", name: "shared-mailbox-triage", process: "AP / AR Email Triage + Classify", host: "PRD-RT-01", env: "Prod", state: "Running", lastRun: "00:00:08 ago", successRate: 94.2, txToday: 1240, avgSec: 4 },
  { id: "BOT-005", name: "monthend-recon-macro", process: "Monthly Recon Workbook Refresh", host: "PRD-RT-04", env: "Prod", state: "Idle", lastRun: "06:18:00 ago", successRate: 91.3, txToday: 0, avgSec: 1840 },
  { id: "BOT-006", name: "3270-claims-status", process: "Mainframe Claims Status Lookup", host: "PRD-RT-05", env: "Prod", state: "Running", lastRun: "00:00:01 ago", successRate: 99.7, txToday: 3214, avgSec: 2 },
  { id: "BOT-007", name: "edi-856-asn-monitor", process: "EDI 856 ASN Exception Recovery", host: "PRD-RT-06", env: "Prod", state: "Exception", lastRun: "00:04:33 ago", successRate: 88.7, txToday: 92, avgSec: 22 },
  { id: "BOT-008", name: "tax-rate-refresh", process: "Avalara Sales Tax Rate Sync", host: "PRD-RT-04", env: "Prod", state: "Stopped", lastRun: "1d 04:22 ago", successRate: 100, txToday: 0, avgSec: 320 },
  { id: "BOT-009", name: "wire-ofac-screening", process: "Wire OFAC Repair Queue Triage", host: "PRD-RT-07", env: "Prod", state: "Running", lastRun: "00:00:18 ago", successRate: 97.2, txToday: 88, avgSec: 9 },
  { id: "BOT-010", name: "rpa-challenge-resilient", process: "RPA Challenge - Self-healing Selector", host: "UAT-RT-01", env: "UAT", state: "Disabled", lastRun: "12:00:00 ago", successRate: 100, txToday: 0, avgSec: 6 }
];

const QUEUES = [
  { id: "Q-AP-INV", name: "AP Invoice Inbox", pending: 24, processing: 3, success: 161, failed: 4, retries: 7, sla: "2h", bot: "BOT-001" },
  { id: "Q-VENDOR", name: "Vendor Onboarding", pending: 6, processing: 1, success: 31, failed: 1, retries: 2, sla: "24h", bot: "BOT-002" },
  { id: "Q-LOAN", name: "Loan Applications", pending: 18, processing: 4, success: 388, failed: 6, retries: 4, sla: "4m", bot: "BOT-003" },
  { id: "Q-MAIL", name: "AP/AR Shared Mailbox", pending: 47, processing: 2, success: 1191, failed: 5, retries: 12, sla: "15m", bot: "BOT-004" },
  { id: "Q-EDI", name: "EDI 856 ASN Exceptions", pending: 33, processing: 0, success: 76, failed: 14, retries: 9, sla: "1h", bot: "BOT-007" },
  { id: "Q-WIRE", name: "Wire OFAC Repair", pending: 4, processing: 1, success: 83, failed: 1, retries: 2, sla: "30m", bot: "BOT-009" }
];

const SCHEDULES = [
  { id: "S-01", name: "AP Invoice IDP", cron: "*/5 * * * *", next: "in 3m", lastFire: "2m ago", bot: "BOT-001", env: "Prod", state: "Enabled" },
  { id: "S-02", name: "Vendor Onboarding Polling", cron: "*/15 * * * *", next: "in 11m", lastFire: "4m ago", bot: "BOT-002", env: "Prod", state: "Enabled" },
  { id: "S-03", name: "Mailbox Sweep", cron: "* * * * *", next: "in 38s", lastFire: "22s ago", bot: "BOT-004", env: "Prod", state: "Enabled" },
  { id: "S-04", name: "Month-end Recon", cron: "0 2 1 * *", next: "26d 18h", lastFire: "12d ago", bot: "BOT-005", env: "Prod", state: "Enabled" },
  { id: "S-05", name: "Tax Rate Refresh", cron: "0 4 * * *", next: "tomorrow 04:00", lastFire: "yesterday 04:00", bot: "BOT-008", env: "Prod", state: "Disabled" },
  { id: "S-06", name: "3270 Claims Refresh", cron: "*/2 * * * *", next: "in 18s", lastFire: "1m ago", bot: "BOT-006", env: "Prod", state: "Enabled" }
];

const ASSETS = [
  { name: "SAP_S4_SVC_USR", type: "Credential", scope: "Prod", lastRotated: "12d ago", owner: "COE-Identity" },
  { name: "OUTLOOK_API_KEY", type: "API Key", scope: "Prod", lastRotated: "4d ago", owner: "COE-Integrations" },
  { name: "MAINFRAME_3270_SVC", type: "Credential", scope: "Prod", lastRotated: "62d ago", owner: "COE-Mainframe" },
  { name: "EXPERIAN_API_TOKEN", type: "API Key", scope: "Prod", lastRotated: "9d ago", owner: "COE-Decisioning" },
  { name: "SLACK_WEBHOOK_PRD", type: "Webhook", scope: "Prod", lastRotated: "33d ago", owner: "COE-Ops" },
  { name: "VENDOR_DB_CONN", type: "DB Connection", scope: "Prod", lastRotated: "21d ago", owner: "COE-Data" }
];

const ACTIVITY_TEMPLATES = [
  (b) => `[${b}] Transaction completed (txn ${rnd("TX-",100000)})`,
  (b) => `[${b}] Pulled work item from queue`,
  (b) => `[${b}] Asset CRED rotation requested (auto-renew)`,
  (b) => `[${b}] SLA threshold check: OK`,
  (b) => `[${b}] Element selector match: 100%`,
  (b) => `[${b}] Retrying transient HTTP 503...`,
  (b) => `[${b}] Routed exception to human reviewer (Q-AP-INV)`,
  (b) => `[${b}] Updated downstream system: SAP MM (vendor master)`,
  (b) => `[${b}] Closed bot session (cleanup OK)`,
  (b) => `[${b}] Started new run (trigger: schedule)`
];

function rnd(p, n) { return p + Math.floor(Math.random() * n); }

function loadState() {
  try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.bots) return p; } } catch (e) {}
  const fresh = { bots: JSON.parse(JSON.stringify(BOTS)), queues: JSON.parse(JSON.stringify(QUEUES)), schedules: JSON.parse(JSON.stringify(SCHEDULES)), assets: JSON.parse(JSON.stringify(ASSETS)), activeTab: "dashboard", activity: [], envFilter: "All" };
  saveState(fresh); return fresh;
}
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

let STATE = loadState();
function pushActivity(msg) { STATE.activity.unshift({ ts: new Date().toLocaleTimeString(), msg }); if (STATE.activity.length > 80) STATE.activity = STATE.activity.slice(0, 80); }

function botStateBadge(state) {
  const m = { Running: "success", Idle: "secondary", Exception: "danger", Stopped: "warning", Disabled: "dark" };
  return `<span class="badge badge-${m[state] || "secondary"}">${esc(state)}</span>`;
}

function dashboard() {
  const fleet = STATE.bots;
  const running = fleet.filter((b) => b.state === "Running").length;
  const exception = fleet.filter((b) => b.state === "Exception").length;
  const totalTx = fleet.reduce((a, b) => a + b.txToday, 0);
  const avgSuccess = (fleet.reduce((a, b) => a + b.successRate, 0) / fleet.length).toFixed(1);
  const totalQueued = STATE.queues.reduce((a, q) => a + q.pending, 0);
  return `
    <div class="row mb-3">
      ${[
        { l: "Bots Online", v: `${running}/${fleet.length}`, c: "success", i: "&#9679;" },
        { l: "Exceptions", v: exception, c: exception ? "danger" : "secondary", i: "&#9888;" },
        { l: "Transactions Today", v: totalTx.toLocaleString(), c: "primary", i: "&#8635;" },
        { l: "Avg Success Rate", v: `${avgSuccess}%`, c: avgSuccess > 95 ? "success" : "warning", i: "&#10004;" },
        { l: "Queued Items", v: totalQueued, c: "info", i: "&#9776;" },
        { l: "Active Schedules", v: STATE.schedules.filter((s) => s.state === "Enabled").length, c: "primary", i: "&#128338;" }
      ].map((c) => `
        <div class="col">
          <div class="card bg-secondary text-light shadow border-${c.c}">
            <div class="card-body py-2">
              <div class="small text-uppercase" style="opacity:0.7;">${c.l}</div>
              <div class="h4 mb-0 text-${c.c}">${c.i} ${c.v}</div>
            </div>
          </div>
        </div>`).join("")}
    </div>

    <div class="row">
      <div class="col-md-8">
        <div class="card bg-secondary text-light shadow mb-3">
          <div class="card-header"><strong>Live Bot Fleet</strong></div>
          <div class="table-responsive">
            <table class="table table-sm table-dark mb-0">
              <thead><tr><th>Bot</th><th>Process</th><th>Env</th><th>Host</th><th>State</th><th>Last Run</th><th class="text-right">Tx Today</th><th class="text-right">Success</th></tr></thead>
              <tbody>
                ${fleet.map((b) => `
                  <tr>
                    <td><strong>${esc(b.name)}</strong><div class="small text-muted"><code>${b.id}</code></div></td>
                    <td>${esc(b.process)}</td>
                    <td><span class="badge badge-${b.env === "Prod" ? "primary" : "info"}">${b.env}</span></td>
                    <td><code>${esc(b.host)}</code></td>
                    <td>${botStateBadge(b.state)}</td>
                    <td>${esc(b.lastRun)}</td>
                    <td class="text-right">${b.txToday.toLocaleString()}</td>
                    <td class="text-right">${b.successRate}%</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-secondary text-light shadow">
          <div class="card-header d-flex justify-content-between">
            <strong>Live Activity Stream</strong>
            <button class="btn btn-sm btn-outline-success" data-action="simulate-activity">Simulate</button>
          </div>
          <ul class="list-group list-group-flush" style="max-height:380px; overflow:auto;">
            ${(STATE.activity.length ? STATE.activity.slice(0, 30) : [{ ts: new Date().toLocaleTimeString(), msg: "No activity yet. Click 'Simulate' to generate bot telemetry." }]).map((a) => `<li class="list-group-item bg-dark text-light small py-1"><span class="text-muted mr-2">${esc(a.ts)}</span> ${esc(a.msg)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;
}

function queuesTab() {
  return `
    <div class="card bg-secondary text-light shadow">
      <div class="card-header"><strong>Work Queues</strong> &mdash; ${STATE.queues.length} queues</div>
      <table class="table table-dark table-sm mb-0">
        <thead><tr><th>Queue</th><th>Owner Bot</th><th>SLA</th><th class="text-right">Pending</th><th class="text-right">In Progress</th><th class="text-right">Success</th><th class="text-right">Failed</th><th class="text-right">Retries</th><th></th></tr></thead>
        <tbody>
          ${STATE.queues.map((q) => `
            <tr>
              <td><strong>${esc(q.name)}</strong><div class="small text-muted"><code>${q.id}</code></div></td>
              <td><code>${esc(q.bot)}</code></td>
              <td><span class="badge badge-info">${esc(q.sla)}</span></td>
              <td class="text-right">${q.pending}</td>
              <td class="text-right">${q.processing}</td>
              <td class="text-right text-success">${q.success}</td>
              <td class="text-right text-danger">${q.failed}</td>
              <td class="text-right text-warning">${q.retries}</td>
              <td><button class="btn btn-sm btn-outline-warning" data-retry-queue="${q.id}">Retry All Failed</button></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function schedulesTab() {
  return `
    <div class="card bg-secondary text-light shadow">
      <div class="card-header"><strong>Schedules &amp; Triggers</strong></div>
      <table class="table table-dark table-sm mb-0">
        <thead><tr><th>Schedule</th><th>Bot</th><th>Env</th><th>CRON</th><th>Last Fire</th><th>Next Fire</th><th>State</th><th></th></tr></thead>
        <tbody>
          ${STATE.schedules.map((s) => `
            <tr>
              <td><strong>${esc(s.name)}</strong><div class="small text-muted"><code>${s.id}</code></div></td>
              <td><code>${esc(s.bot)}</code></td>
              <td><span class="badge badge-${s.env === "Prod" ? "primary" : "info"}">${s.env}</span></td>
              <td><code>${esc(s.cron)}</code></td>
              <td>${esc(s.lastFire)}</td>
              <td>${esc(s.next)}</td>
              <td><span class="badge badge-${s.state === "Enabled" ? "success" : "secondary"}">${s.state}</span></td>
              <td><button class="btn btn-sm btn-outline-success" data-fire-schedule="${s.id}">Run Now</button></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function assetsTab() {
  return `
    <div class="card bg-secondary text-light shadow">
      <div class="card-header d-flex justify-content-between align-items-center"><strong>Asset Vault</strong> <span class="badge badge-dark">CyberArk-integrated</span></div>
      <table class="table table-dark table-sm mb-0">
        <thead><tr><th>Asset</th><th>Type</th><th>Scope</th><th>Last Rotated</th><th>Owner</th><th></th></tr></thead>
        <tbody>
          ${STATE.assets.map((a) => `
            <tr>
              <td><strong>${esc(a.name)}</strong></td>
              <td>${esc(a.type)}</td>
              <td>${esc(a.scope)}</td>
              <td>${esc(a.lastRotated)}${/^\d+d/.test(a.lastRotated) && parseInt(a.lastRotated) > 30 ? ' <span class="badge badge-warning ml-1">rotation due</span>' : ""}</td>
              <td>${esc(a.owner)}</td>
              <td><button class="btn btn-sm btn-outline-info" data-rotate="${esc(a.name)}">Rotate Credential</button></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderShell() {
  let body = "";
  if (STATE.activeTab === "dashboard") body = dashboard();
  else if (STATE.activeTab === "queues") body = queuesTab();
  else if (STATE.activeTab === "schedules") body = schedulesTab();
  else if (STATE.activeTab === "assets") body = assetsTab();

  return `
    <div class="bo-shell">
      <nav class="navbar navbar-dark" style="background:linear-gradient(90deg,#080d1a 0%,#0d2438 100%); border-bottom:2px solid #1e5fa3;">
        <div class="container-fluid">
          <a class="navbar-brand font-weight-bold" href="#">
            <span style="background:#16a085; padding:2px 8px; border-radius:4px; color:#fff;">RPA</span>
            Orchestrator <span class="text-white-50 font-weight-normal">Control Room</span>
          </a>
          <ul class="nav nav-pills">
            ${[["dashboard","Dashboard"],["queues","Queues"],["schedules","Schedules"],["assets","Asset Vault"]].map(([k,l])=>`<li class="nav-item"><a class="nav-link ${STATE.activeTab===k?"active":""}" href="#" data-tab="${k}">${l}</a></li>`).join("")}
          </ul>
          <div class="d-flex align-items-center text-white-50">
            <span class="mr-3 small">Tenant: <strong class="text-white">Contoso COE</strong></span>
            <button class="btn btn-sm btn-outline-light mr-2" data-action="help">App Context (?)</button>
            <span class="small">coe-admin@contoso.com</span>
          </div>
        </div>
      </nav>

      <div class="container-fluid mt-3">${body}</div>

      <footer class="mt-4 mb-3 text-center small" style="color:#7d8590;">Orchestrator v22.4 &middot; Bot fleet 10 robots &middot; Last sync ${new Date().toLocaleTimeString()}</footer>
    </div>
  `;
}

function openHelp() {
  const o = document.createElement("div");
  o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;";
  o.innerHTML = `<div style="background:#fff;max-width:760px;border-radius:6px;color:#222;"><div style="padding:14px 18px;border-bottom:1px solid #ddd;font-weight:600;">App Context &mdash; Bot Orchestrator</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #ddd;text-align:right;"><button class="btn btn-primary btn-sm" id="bo-mc">Close</button></div></div>`;
  document.body.appendChild(o);
  o.addEventListener("click", (e) => { if (e.target === o) o.remove(); });
  document.getElementById("bo-mc").onclick = () => o.remove();
}

function simulateActivity() {
  const running = STATE.bots.filter((b) => b.state === "Running");
  if (!running.length) return;
  let i = 0;
  const t = setInterval(() => {
    const b = running[Math.floor(Math.random() * running.length)];
    pushActivity(ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)](b.name));
    saveState(STATE); render();
    if (++i >= 12) clearInterval(t);
  }, 350);
}

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-tab]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); STATE.activeTab = a.dataset.tab; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.action;
    if (a === "help") openHelp();
    else if (a === "simulate-activity") simulateActivity();
  }));
  document.querySelectorAll("[data-retry-queue]").forEach((btn) => btn.addEventListener("click", () => {
    const id = btn.dataset.retryQueue;
    const q = STATE.queues.find((x) => x.id === id);
    if (q && q.failed > 0) { q.retries += q.failed; q.pending += q.failed; pushActivity(`Retried ${q.failed} failed items in ${q.name}`); q.failed = 0; saveState(STATE); render(); }
  }));
  document.querySelectorAll("[data-fire-schedule]").forEach((btn) => btn.addEventListener("click", () => {
    const id = btn.dataset.fireSchedule;
    const s = STATE.schedules.find((x) => x.id === id);
    if (s) { s.lastFire = "just now"; pushActivity(`Manually fired schedule '${s.name}' (${s.bot})`); saveState(STATE); render(); }
  }));
  document.querySelectorAll("[data-rotate]").forEach((btn) => btn.addEventListener("click", () => {
    const name = btn.dataset.rotate;
    const a = STATE.assets.find((x) => x.name === name);
    if (a) { a.lastRotated = "just now"; pushActivity(`Credential rotated: ${a.name}`); saveState(STATE); render(); }
  }));
}

render();
