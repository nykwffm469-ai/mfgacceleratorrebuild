const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - RPA Program ROI Dashboard

RPA Program ROI Dashboard is the executive-facing wallboard that quantifies the value of an automation program. CFO, COO, automation COE leaders, and business sponsors use it to see hours saved, FTE-equivalent capacity returned, dollars saved, transactions automated, accuracy lift, SLA performance, and bot fleet utilization. Common usage includes the monthly steering committee meeting, quarterly business reviews, and the close-of-pitch slide where a sponsor decides whether to fund the next wave of automation.

This experience is inspired by UiPath Insights, Power BI executive wallboards, Blue Prism Decipher, Automation Anywhere Bot Insight, and ServiceNow Now Assist Performance Analytics. Potential RPA use cases include automated metric collection from the orchestrator and bot logs, FTE-equivalent calculation from runtime telemetry, savings models (avg salary x hours saved), pipeline forecasting (bots in dev x avg savings per bot), exception trend analysis, SLA breach root-cause clustering, citizen-developer leaderboards, and what-if scenario planning for executive sponsors.`;

const BOT_PERFORMANCE = [
  { name: "ap-invoice-extractor", txMonth: 4820, hoursSaved: 1610, savings: 96600, success: 96.8 },
  { name: "loan-decision-engine", txMonth: 12440, hoursSaved: 2074, savings: 124400, success: 98.4 },
  { name: "shared-mailbox-triage", txMonth: 38120, hoursSaved: 3175, savings: 190500, success: 94.2 },
  { name: "3270-claims-status", txMonth: 91200, hoursSaved: 1520, savings: 91200, success: 99.7 },
  { name: "vendor-master-onboarding", txMonth: 1140, hoursSaved: 884, savings: 53000, success: 99.1 },
  { name: "wire-ofac-screening", txMonth: 2640, hoursSaved: 528, savings: 31700, success: 97.2 },
  { name: "monthend-recon-macro", txMonth: 12, hoursSaved: 396, savings: 23800, success: 91.3 },
  { name: "edi-856-asn-monitor", txMonth: 2840, hoursSaved: 284, savings: 17000, success: 88.7 },
  { name: "tax-rate-refresh", txMonth: 30, hoursSaved: 60, savings: 3600, success: 100 }
];

const PIPELINE = [
  { stage: "Idea", count: 28 }, { stage: "Assessed", count: 14 }, { stage: "In Dev", count: 6 }, { stage: "UAT", count: 3 }, { stage: "Live (this quarter)", count: 9 }
];

function fmt$(n) { return "$" + Number(n).toLocaleString("en-US"); }
function fmtH(n) { return Number(n).toLocaleString("en-US") + " hrs"; }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function totals() {
  const tx = BOT_PERFORMANCE.reduce((a, b) => a + b.txMonth, 0);
  const hrs = BOT_PERFORMANCE.reduce((a, b) => a + b.hoursSaved, 0);
  const sav = BOT_PERFORMANCE.reduce((a, b) => a + b.savings, 0);
  const fte = (hrs / 173).toFixed(1);
  const avgSucc = (BOT_PERFORMANCE.reduce((a, b) => a + b.success, 0) / BOT_PERFORMANCE.length).toFixed(1);
  return { tx, hrs, sav, fte, avgSucc };
}

function trendBars(values, max) {
  const w = 12; const gap = 4;
  return `<svg viewBox="0 0 ${values.length * (w + gap)} 60" style="width:100%;height:60px;">${values.map((v, i) => { const h = Math.round((v / max) * 56); return `<rect x="${i * (w + gap)}" y="${60 - h}" width="${w}" height="${h}" fill="#42a5f5" rx="2" />`; }).join("")}</svg>`;
}

function renderShell() {
  const t = totals();
  const leader = [...BOT_PERFORMANCE].sort((a, b) => b.savings - a.savings);
  const maxSav = Math.max(...leader.map((b) => b.savings));
  return `
    <div style="min-height:100vh;">
      <nav class="navbar" style="background:linear-gradient(90deg,#0d2440 0%,#1565c0 100%); border-bottom:2px solid #42a5f5;">
        <div class="container-fluid">
          <span class="navbar-brand text-white font-weight-bold"><span style="background:#ff9800; padding:2px 8px; border-radius:4px; color:#0d2440;">ROI</span> Automation Program <span class="text-white-50 font-weight-normal">Executive Wallboard</span></span>
          <div class="d-flex align-items-center">
            <span class="text-white-50 small mr-3">Period: <strong class="text-white">June 2026</strong></span>
            <span class="text-white-50 small mr-3">Bot fleet: <strong class="text-white">${BOT_PERFORMANCE.length}</strong> active</span>
            <button class="btn btn-sm btn-outline-light mr-2" data-action="help">App Context (?)</button>
            <a href="../" class="text-white">Main</a>
          </div>
        </div>
      </nav>

      <div class="container-fluid mt-3">
        <div class="row mb-3">
          ${[
            { l: "Transactions Automated (mo)", v: t.tx.toLocaleString(), s: "+18% vs last month", c: "info" },
            { l: "Hours Returned (mo)", v: fmtH(t.hrs), s: `&asymp; ${t.fte} FTE equivalents`, c: "success" },
            { l: "Cost Savings (mo)", v: fmt$(t.sav), s: "Annualized: " + fmt$(t.sav * 12), c: "warning" },
            { l: "Avg Bot Success Rate", v: t.avgSucc + "%", s: `&Delta; +2.4 pts QoQ`, c: "primary" }
          ].map((c) => `
            <div class="col">
              <div class="card text-light" style="background:#102a43; border:1px solid #243b53; border-top:4px solid var(--bs-${c.c}, #42a5f5);">
                <div class="card-body py-3">
                  <div class="small text-info text-uppercase">${c.l}</div>
                  <div class="display-4 text-${c.c}" style="font-weight:700; line-height:1.1;">${c.v}</div>
                  <div class="small" style="color:#90caf9;">${c.s}</div>
                </div>
              </div>
            </div>`).join("")}
        </div>

        <div class="row mb-3">
          <div class="col-md-8">
            <div class="card text-light" style="background:#102a43; border:1px solid #243b53;">
              <div class="card-header" style="background:#0d2440; border-bottom:1px solid #243b53;"><strong>Top Bots by Cost Savings (Jun 2026)</strong></div>
              <div class="card-body p-0">
                <table class="table table-dark table-borderless mb-0">
                  <thead style="background:#0d2440;"><tr><th>#</th><th>Bot</th><th class="text-right">Transactions</th><th class="text-right">Hours Saved</th><th class="text-right">Savings</th><th>Success</th><th style="width:240px;">Savings Mix</th></tr></thead>
                  <tbody>
                    ${leader.map((b, i) => `
                      <tr>
                        <td>${i + 1}</td>
                        <td><strong>${esc(b.name)}</strong></td>
                        <td class="text-right">${b.txMonth.toLocaleString()}</td>
                        <td class="text-right">${b.hoursSaved.toLocaleString()}</td>
                        <td class="text-right text-warning">${fmt$(b.savings)}</td>
                        <td><span class="badge badge-${b.success > 95 ? "success" : b.success > 90 ? "info" : "warning"}">${b.success}%</span></td>
                        <td><div class="progress" style="height:8px; background:#0d2440;"><div class="progress-bar bg-warning" style="width:${Math.round(b.savings / maxSav * 100)}%;"></div></div></td>
                      </tr>`).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-light" style="background:#102a43; border:1px solid #243b53;">
              <div class="card-header" style="background:#0d2440; border-bottom:1px solid #243b53;"><strong>Automation Pipeline</strong></div>
              <div class="card-body">
                ${PIPELINE.map((p) => `
                  <div class="mb-2">
                    <div class="d-flex justify-content-between small"><span>${esc(p.stage)}</span><strong class="text-info">${p.count}</strong></div>
                    <div class="progress" style="height:8px; background:#0d2440;"><div class="progress-bar bg-info" style="width:${Math.min(100, p.count * 4)}%;"></div></div>
                  </div>`).join("")}
                <hr style="border-color:#243b53;"/>
                <div class="small text-muted">Projected FY26 savings if pipeline ships:</div>
                <div class="h3 text-warning mb-0">${fmt$(Math.round(t.sav * 12 * 1.65))}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <div class="card text-light" style="background:#102a43; border:1px solid #243b53;">
              <div class="card-header" style="background:#0d2440; border-bottom:1px solid #243b53;"><strong>12-Month Transaction Trend</strong></div>
              <div class="card-body">
                ${trendBars([28400, 32000, 38200, 42100, 51400, 58800, 64200, 72400, 81200, 92000, 108400, 153242], 160000)}
                <div class="text-center small text-info mt-2">From 28K transactions/mo (Jul 25) to 153K transactions/mo (Jun 26)</div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card text-light" style="background:#102a43; border:1px solid #243b53;">
              <div class="card-header" style="background:#0d2440; border-bottom:1px solid #243b53;"><strong>12-Month Savings Trend</strong></div>
              <div class="card-body">
                ${trendBars([78000, 88000, 102000, 118000, 144000, 168000, 188000, 218000, 252000, 298000, 358000, 631800], 700000)}
                <div class="text-center small text-info mt-2">June savings $631K (8x vs program inception)</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-4">
            <div class="card text-light" style="background:#102a43; border:1px solid #243b53;">
              <div class="card-header" style="background:#0d2440;"><strong>SLA Performance</strong></div>
              <div class="card-body text-center">
                <div class="display-3 text-success" style="font-weight:700;">99.7%</div>
                <div class="small text-info">Auto-decisions within SLA this month</div>
                <hr style="border-color:#243b53;"/>
                <div class="row small">
                  <div class="col"><div class="text-warning h4">4</div><div>SLA breaches</div></div>
                  <div class="col"><div class="text-success h4">62%</div><div>vs manual SLA</div></div>
                  <div class="col"><div class="text-primary h4">18&times;</div><div>faster than human</div></div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-light" style="background:#102a43; border:1px solid #243b53;">
              <div class="card-header" style="background:#0d2440;"><strong>Quality &amp; Accuracy</strong></div>
              <div class="card-body text-center">
                <div class="display-3 text-info" style="font-weight:700;">${totals().avgSucc}%</div>
                <div class="small text-info">Avg first-pass success across bot fleet</div>
                <hr style="border-color:#243b53;"/>
                <div class="row small">
                  <div class="col"><div class="text-success h4">+2.4</div><div>pts QoQ</div></div>
                  <div class="col"><div class="text-warning h4">99.92%</div><div>uptime</div></div>
                  <div class="col"><div class="text-primary h4">5x</div><div>fewer errors vs human</div></div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-light" style="background:#102a43; border:1px solid #243b53;">
              <div class="card-header" style="background:#0d2440;"><strong>Capacity Returned to People</strong></div>
              <div class="card-body text-center">
                <div class="display-3 text-warning" style="font-weight:700;">${totals().fte}</div>
                <div class="small text-info">FTE-equivalents redirected to higher-value work</div>
                <hr style="border-color:#243b53;"/>
                <div class="row small">
                  <div class="col"><div class="text-success h4">${fmtH(Math.round(totals().hrs / 22))}</div><div>per business day</div></div>
                  <div class="col"><div class="text-info h4">0</div><div>jobs eliminated</div></div>
                  <div class="col"><div class="text-primary h4">8</div><div>roles re-skilled</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col">
            <div class="card text-light" style="background:linear-gradient(90deg,#1565c0 0%,#0d2440 100%); border:1px solid #1565c0;">
              <div class="card-body text-center">
                <div class="small text-info">PROJECTED FY27 RUN-RATE SAVINGS (assuming pipeline ships)</div>
                <div class="display-2 text-warning" style="font-weight:700;">${fmt$(Math.round(totals().sav * 12 * 1.85))}</div>
                <div class="text-info">at current per-bot economics + 28 ideas in pipeline + 6 in dev</div>
              </div>
            </div>
          </div>
        </div>

        <footer class="text-center small mb-3" style="color:#7da7d9;">RPA Program ROI Dashboard &middot; Last refreshed ${new Date().toLocaleString()} &middot; Source: Orchestrator + bot telemetry feeds</footer>
      </div>
    </div>
  `;
}

function openHelp() {
  const o = document.createElement("div");
  o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;";
  o.innerHTML = `<div style="background:#fff;color:#222;max-width:760px;border-radius:6px;"><div style="padding:14px 18px;border-bottom:1px solid #e2e6ea;font-weight:600;">App Context &mdash; RPA Program ROI Dashboard</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #e2e6ea;text-align:right;"><button class="btn btn-primary btn-sm" id="rmc">Close</button></div></div>`;
  document.body.appendChild(o); o.addEventListener("click", (e) => { if (e.target === o) o.remove(); });
  document.getElementById("rmc").onclick = () => o.remove();
}

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => { if (b.dataset.action === "help") openHelp(); }));
}
render();
