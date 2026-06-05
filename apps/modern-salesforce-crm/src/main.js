const KEY = "modern-sf-crm";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - NimbusCRM Lightning Sales Console

NimbusCRM Lightning Sales Console is a Salesforce Lightning-style sales workspace used by account executives, sales managers, sales ops, and CSMs to run their book. Common usage includes reviewing the daily activity feed, working the opportunity pipeline kanban, qualifying inbound MQLs, logging meeting notes, sending personalized outreach, and reviewing Einstein AI's account-health and propensity-to-close scoring before customer calls.

This experience is inspired by Salesforce Sales Cloud Lightning, HubSpot Sales Hub, Microsoft Dynamics 365 Sales, and Pipedrive. Potential RPA use cases include lead enrichment from external data sources (ZoomInfo, Clearbit, LinkedIn), auto-logging of email and calendar activity, opportunity stage-gate validation, quote generation from product catalog rules, CPQ orchestration, ERP order push on closed-won, customer-health alerting from product telemetry, and renewal-risk scoring across the install base.`;

const ACCOUNTS = [
  { id: "001A-101", name: "Globex Industrial Corp", tier: "Enterprise", arr: 2400000, owner: "Sarah Parker", health: 78, nps: 8.2, contacts: 22, openOpps: 3, lastTouch: "2 days ago", logo: "GI" },
  { id: "001A-102", name: "Apex Manufacturing", tier: "Enterprise", arr: 1850000, owner: "Liam O'Brien", health: 92, nps: 9.1, contacts: 18, openOpps: 2, lastTouch: "yesterday", logo: "AM" },
  { id: "001A-103", name: "Stark Logistics", tier: "Mid-Market", arr: 620000, owner: "Maria Diaz", health: 64, nps: 6.8, contacts: 12, openOpps: 1, lastTouch: "5 days ago", logo: "SL" },
  { id: "001A-104", name: "Bluewater Energy", tier: "Mid-Market", arr: 880000, owner: "Sarah Parker", health: 88, nps: 8.8, contacts: 14, openOpps: 2, lastTouch: "today", logo: "BE" },
  { id: "001A-105", name: "Helios Aerospace", tier: "Enterprise", arr: 3100000, owner: "Tom Jackson", health: 71, nps: 7.4, contacts: 28, openOpps: 4, lastTouch: "3 days ago", logo: "HA" }
];

const OPPORTUNITIES = [
  { id: "006A-9001", name: "Globex Industrial - Renewal FY27", account: "001A-101", stage: "Negotiation", amount: 2640000, close: "2026-08-15", probability: 75 },
  { id: "006A-9002", name: "Globex - Add-on: Analytics module", account: "001A-101", stage: "Proposal", amount: 380000, close: "2026-09-30", probability: 50 },
  { id: "006A-9003", name: "Apex - Multi-year expansion", account: "001A-102", stage: "Negotiation", amount: 1200000, close: "2026-07-31", probability: 80 },
  { id: "006A-9004", name: "Apex - Professional Services pkg", account: "001A-102", stage: "Qualification", amount: 220000, close: "2026-10-15", probability: 35 },
  { id: "006A-9005", name: "Stark Logistics - Renewal", account: "001A-103", stage: "Discovery", amount: 680000, close: "2026-11-30", probability: 25 },
  { id: "006A-9006", name: "Bluewater - Platform upgrade", account: "001A-104", stage: "Proposal", amount: 410000, close: "2026-08-31", probability: 60 },
  { id: "006A-9007", name: "Bluewater - Training contract", account: "001A-104", stage: "Closed Won", amount: 88000, close: "2026-06-04", probability: 100 },
  { id: "006A-9008", name: "Helios - Tier 1 expansion", account: "001A-105", stage: "Negotiation", amount: 1840000, close: "2026-09-15", probability: 70 },
  { id: "006A-9009", name: "Helios - Cybersecurity add", account: "001A-105", stage: "Proposal", amount: 520000, close: "2026-10-31", probability: 45 },
  { id: "006A-9010", name: "Helios - Implementation phase 2", account: "001A-105", stage: "Qualification", amount: 1100000, close: "2026-12-15", probability: 30 },
  { id: "006A-9011", name: "Helios - Renewal core", account: "001A-105", stage: "Discovery", amount: 2200000, close: "2027-02-28", probability: 20 }
];
const STAGES = ["Discovery", "Qualification", "Proposal", "Negotiation", "Closed Won"];

function loadState() { try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.accounts) return p; } } catch (e) {} const f = { accounts: ACCOUNTS, opps: OPPORTUNITIES, selectedAcct: "001A-105", view: "account" }; saveState(f); return f; }
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function fmt$(n) { return "$" + Number(n).toLocaleString(); }
let STATE = loadState();

function healthBadge(h) { const c = h>=85?"#04844b":h>=70?"#fe9339":"#c23934"; return `<span style="background:${c};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">Health ${h}</span>`; }

function renderShell() {
  const acct = STATE.accounts.find((a) => a.id === STATE.selectedAcct);
  const opps = STATE.opps.filter((o) => o.account === acct.id);
  const totalPipeline = STATE.opps.filter((o) => !/Closed/.test(o.stage)).reduce((a, o) => a + o.amount, 0);
  return `
    <div style="min-height:100vh;background:#f3f3f3;">
      <nav style="background:#16325c;color:#fff;padding:0 20px;display:flex;justify-content:space-between;align-items:center;height:48px;">
        <div style="display:flex;align-items:center;gap:18px;">
          <div style="background:#0070d2;width:32px;height:32px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:700;">N</div>
          <strong>NimbusCRM <span style="opacity:0.7;font-weight:400;">| Lightning Sales</span></strong>
          <div style="display:flex;gap:14px;">
            ${["Home","Accounts","Opportunities","Leads","Contacts","Reports","Dashboards"].map((t,i)=>`<a href="#" style="color:${i===1?"#fff":"#a8b9d1"};text-decoration:none;font-weight:${i===1?600:400};border-bottom:${i===1?"3px solid #00a1e0":"none"};padding:14px 4px;">${t}</a>`).join("")}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          <input type="search" placeholder="Search Nimbus..." style="border:0;border-radius:4px;padding:6px 12px;width:280px;background:#1d4380;color:#fff;" />
          <button data-action="help" style="background:#00a1e0;color:#fff;border:0;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:11px;">App Context (?)</button>
          <a href="../" style="color:#a8b9d1;text-decoration:none;">Main</a>
          <div style="width:32px;height:32px;border-radius:50%;background:#00a1e0;display:flex;align-items:center;justify-content:center;font-weight:700;">SP</div>
        </div>
      </nav>

      <div style="background:#fff;padding:14px 24px;border-bottom:1px solid #dddbda;display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:48px;height:48px;border-radius:50%;background:#0070d2;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;">${esc(acct.logo)}</div>
          <div>
            <div style="font-size:12px;color:#706e6b;">Account</div>
            <h2 style="margin:0;color:#080707;">${esc(acct.name)}</h2>
          </div>
        </div>
        <div style="display:flex;gap:24px;align-items:center;">
          <div><div style="font-size:11px;color:#706e6b;text-transform:uppercase;">ARR</div><div style="font-size:18px;font-weight:600;color:#04844b;">${fmt$(acct.arr)}</div></div>
          <div><div style="font-size:11px;color:#706e6b;text-transform:uppercase;">Tier</div><div style="font-size:18px;font-weight:600;">${esc(acct.tier)}</div></div>
          <div><div style="font-size:11px;color:#706e6b;text-transform:uppercase;">Owner</div><div style="font-size:14px;font-weight:600;">${esc(acct.owner)}</div></div>
          <div>${healthBadge(acct.health)}</div>
          <button style="background:#0070d2;color:#fff;border:0;padding:6px 16px;border-radius:4px;cursor:pointer;">+ New Opportunity</button>
        </div>
      </div>

      <div style="padding:20px 24px;display:grid;grid-template-columns:280px 1fr 320px;gap:18px;">
        <aside>
          <div style="background:#fff;border:1px solid #dddbda;border-radius:6px;padding:0;overflow:hidden;">
            <div style="background:#f3f3f3;padding:10px 14px;font-weight:600;border-bottom:1px solid #dddbda;">My Accounts</div>
            ${STATE.accounts.map((a) => `
              <div data-acct="${a.id}" style="padding:10px 14px;border-bottom:1px solid #f3f3f3;cursor:pointer;${STATE.selectedAcct===a.id?"background:#e3f3ff;border-left:3px solid #0070d2;":""}">
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="width:28px;height:28px;border-radius:50%;background:#0070d2;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${esc(a.logo)}</div>
                  <div style="flex:1;"><div style="font-weight:600;font-size:13px;">${esc(a.name)}</div><div style="font-size:11px;color:#706e6b;">${esc(a.tier)} &middot; ${fmt$(a.arr)}</div></div>
                </div>
              </div>`).join("")}
          </div>
        </aside>

        <main>
          <div style="background:#fff;border:1px solid #dddbda;border-radius:6px;overflow:hidden;margin-bottom:18px;">
            <div style="background:#f3f3f3;padding:10px 14px;font-weight:600;border-bottom:1px solid #dddbda;display:flex;justify-content:space-between;">
              <span>Opportunities (${opps.length})</span><span style="color:#706e6b;font-weight:400;">Total: ${fmt$(opps.reduce((a,o)=>a+o.amount,0))}</span>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <thead style="background:#fafaf9;">
                <tr><th style="padding:8px 14px;text-align:left;font-weight:600;font-size:12px;color:#706e6b;border-bottom:1px solid #dddbda;">Opportunity</th><th style="padding:8px 14px;text-align:left;font-size:12px;color:#706e6b;">Stage</th><th style="padding:8px 14px;text-align:right;font-size:12px;color:#706e6b;">Amount</th><th style="padding:8px 14px;text-align:right;font-size:12px;color:#706e6b;">Prob</th><th style="padding:8px 14px;font-size:12px;color:#706e6b;">Close</th></tr>
              </thead>
              <tbody>${opps.map((o) => `
                <tr style="border-bottom:1px solid #f3f3f3;">
                  <td style="padding:8px 14px;color:#0070d2;font-weight:600;">${esc(o.name)}</td>
                  <td style="padding:8px 14px;"><span style="background:${o.stage==="Closed Won"?"#04844b":"#dddbda"};color:${o.stage==="Closed Won"?"#fff":"#181818"};padding:2px 8px;border-radius:3px;font-size:11px;">${esc(o.stage)}</span></td>
                  <td style="padding:8px 14px;text-align:right;font-weight:600;">${fmt$(o.amount)}</td>
                  <td style="padding:8px 14px;text-align:right;">${o.probability}%</td>
                  <td style="padding:8px 14px;">${esc(o.close)}</td>
                </tr>`).join("")}
              </tbody>
            </table>
          </div>

          <div style="background:#fff;border:1px solid #dddbda;border-radius:6px;padding:14px;margin-bottom:18px;">
            <div style="font-weight:600;margin-bottom:10px;">Pipeline Kanban (org-wide, ${fmt$(totalPipeline)})</div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">
              ${STAGES.map((s) => {
                const cards = STATE.opps.filter((o) => o.stage === s);
                const total = cards.reduce((a, o) => a + o.amount, 0);
                return `<div style="background:#fafaf9;border-radius:4px;padding:8px;">
                  <div style="font-weight:600;font-size:11px;text-transform:uppercase;color:#706e6b;border-bottom:2px solid ${s==="Closed Won"?"#04844b":"#0070d2"};padding-bottom:4px;margin-bottom:6px;">${esc(s)} (${cards.length})</div>
                  <div style="font-size:11px;color:#706e6b;margin-bottom:6px;">${fmt$(total)}</div>
                  ${cards.slice(0, 3).map((c) => `<div style="background:#fff;border:1px solid #dddbda;padding:6px;border-radius:3px;font-size:11px;margin-bottom:4px;"><div style="font-weight:600;color:#0070d2;">${esc(c.name).substring(0, 28)}${c.name.length>28?"...":""}</div><div>${fmt$(c.amount)}</div></div>`).join("")}
                </div>`;
              }).join("")}
            </div>
          </div>

          <div style="background:#fff;border:1px solid #dddbda;border-radius:6px;padding:14px;">
            <div style="font-weight:600;margin-bottom:10px;">Activity Timeline</div>
            <ul style="list-style:none;padding-left:0;margin:0;">
              ${[
                { icon:"&#9742;", who:"Sarah Parker", what:"Logged call with CIO - discussed renewal terms and timing", ts:"2h ago" },
                { icon:"&#9993;", who:"Sarah Parker", what:"Email sent: 'Renewal proposal v3 attached'", ts:"yesterday" },
                { icon:"&#10024;", who:"Einstein AI", what:"Account-health dropped from 84 to 71 - usage drop in module A detected", ts:"yesterday" },
                { icon:"&#128197;", who:"Sarah Parker", what:"Meeting: 'Executive QBR with Helios CISO'", ts:"3 days ago" },
                { icon:"&#9742;", who:"Tom Jackson", what:"Logged call with CFO - budget signed", ts:"5 days ago" }
              ].map((e) => `<li style="padding:10px 0;border-bottom:1px solid #f3f3f3;"><span style="display:inline-block;width:30px;text-align:center;color:#0070d2;font-size:16px;">${e.icon}</span><strong>${esc(e.who)}</strong> &middot; <span style="color:#706e6b;font-size:12px;">${esc(e.ts)}</span><div style="margin-left:30px;">${esc(e.what)}</div></li>`).join("")}
            </ul>
          </div>
        </main>

        <aside>
          <div style="background:linear-gradient(135deg,#0070d2 0%,#00a1e0 100%);color:#fff;padding:14px;border-radius:6px;margin-bottom:14px;">
            <div style="font-size:11px;text-transform:uppercase;opacity:0.85;">&#10024; Einstein AI Insights</div>
            <div style="margin-top:6px;font-size:13px;line-height:1.4;">Account health <strong>71</strong> (down 13 pts in 30d). Driven by module-A usage drop and 5d gap in exec engagement. Propensity-to-renew: <strong>67%</strong>. Recommend executive sync within 7 days.</div>
          </div>

          <div style="background:#fff;border:1px solid #dddbda;border-radius:6px;padding:14px;margin-bottom:14px;">
            <div style="font-weight:600;font-size:11px;text-transform:uppercase;color:#706e6b;">Key Contacts</div>
            ${["John Powell (CISO)","Sarah Kim (VP Finance)","Diego Lee (Procurement)","Aisha Patel (Champion)"].map((c) => `<div style="padding:6px 0;border-bottom:1px dotted #ececec;font-size:12px;">${esc(c)}</div>`).join("")}
          </div>

          <div style="background:#fff;border:1px solid #dddbda;border-radius:6px;padding:14px;">
            <div style="font-weight:600;font-size:11px;text-transform:uppercase;color:#706e6b;margin-bottom:8px;">Quick Actions</div>
            <button style="background:#0070d2;color:#fff;border:0;padding:8px;border-radius:4px;width:100%;margin-bottom:6px;cursor:pointer;">Log a Call</button>
            <button style="background:#fff;color:#181818;border:1px solid #dddbda;padding:8px;border-radius:4px;width:100%;margin-bottom:6px;cursor:pointer;">Send Email</button>
            <button style="background:#fff;color:#181818;border:1px solid #dddbda;padding:8px;border-radius:4px;width:100%;margin-bottom:6px;cursor:pointer;">Schedule Meeting</button>
            <button style="background:#fff;color:#181818;border:1px solid #dddbda;padding:8px;border-radius:4px;width:100%;cursor:pointer;">Generate Quote (CPQ)</button>
          </div>
        </aside>
      </div>
    </div>
  `;
}

function openHelp() {
  const o = document.createElement("div"); o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;";
  o.innerHTML = `<div style="background:#fff;max-width:760px;border-radius:6px;"><div style="padding:14px 18px;border-bottom:1px solid #e2e6ea;font-weight:600;">App Context</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #e2e6ea;text-align:right;"><button id="nc" style="background:#0070d2;color:#fff;border:0;padding:6px 14px;border-radius:4px;cursor:pointer;">Close</button></div></div>`;
  document.body.appendChild(o); o.onclick = (e) => { if (e.target === o) o.remove(); };
  document.getElementById("nc").onclick = () => o.remove();
}

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-acct]").forEach((r) => r.addEventListener("click", () => { STATE.selectedAcct = r.dataset.acct; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => { if (b.dataset.action === "help") openHelp(); }));
}
render();
