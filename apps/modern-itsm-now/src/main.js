const KEY = "modern-itsm-now";

const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - ServiceCloud Now Agent Workspace

ServiceCloud Now Agent Workspace is the modern equivalent of the 2012 Service Desk Plus / Helpdesk Ops apps in this portfolio. Service desk agents, problem managers, and major-incident commanders use it to triage incidents, manage requests, run problem investigations, and execute change records inside a single split-pane agent workspace. Common usage includes opening an incident from the queue, reviewing the timeline, accepting an AI-Agent-suggested resolution, applying a knowledge article, and closing the ticket without ever leaving the window.

This experience is inspired by ServiceNow Now Workspace, Salesforce Service Cloud Lightning, Zendesk Agent Workspace, Freshservice, and Jira Service Management. Potential RPA use cases include automated incident creation from monitoring alerts, intent classification of email-to-case submissions, similar-incident clustering, automated CMDB enrichment (asset lookup at ticket open), automated remediation runbooks for known errors (password reset, account unlock, mailbox quota expansion, VPN account creation), bot-assisted knowledge article suggestions, and SLA breach prediction with proactive escalation.`;

const INCIDENTS = [
  { id: "INC0040188", short: "Outlook crashes on launch for finance users", priority: "P2 - High", state: "In Progress", assigned: "you", caller: "marcus.allen", service: "Outlook 365", ci: "OUTLOOK-PRD-WW", openedBy: "self-service", opened: "Today 09:14", sla: "in 3h 12m", ai: "Suggested: KB0011452 'Reset Outlook profile via PowerShell' (94% match)" },
  { id: "INC0040187", short: "Cannot connect to VPN from home network", priority: "P3 - Moderate", state: "Awaiting Caller", assigned: "you", caller: "jenna.whitfield", service: "GlobalProtect VPN", ci: "VPN-CONC-01", openedBy: "phone", opened: "Today 08:42", sla: "in 22h", ai: "Suggested: KB0009921 'GlobalProtect MFA token refresh' (88% match)" },
  { id: "INC0040186", short: "SAP login error: 'license violation'", priority: "P2 - High", state: "Open", assigned: "tier2.queue", caller: "diego.romero", service: "SAP S/4 HANA", ci: "SAP-PRD-01", openedBy: "self-service", opened: "Today 08:30", sla: "in 4h", ai: "Suggested: Runbook 'SAP license pool reassign' (76% match)" },
  { id: "INC0040185", short: "Password reset - account locked after vacation", priority: "P4 - Low", state: "Resolved (auto)", assigned: "bot.svc-reset", caller: "priya.shankar", service: "Active Directory", ci: "AD-DC01", openedBy: "Virtual Agent", opened: "Today 08:14", sla: "met", ai: "Auto-resolved by 'AD-Account-Unlock-Bot' in 14 seconds" },
  { id: "INC0040184", short: "Shared mailbox: not receiving external email", priority: "P3 - Moderate", state: "In Progress", assigned: "tier2.queue", caller: "robert.chen", service: "Exchange Online", ci: "EXOL-PRD", openedBy: "email-to-case", opened: "Yesterday 17:48", sla: "in 1d 4h", ai: "Suggested: Runbook 'Transport rule diagnostic' (71% match)" },
  { id: "INC0040183", short: "Conference room TV displaying error code E-04", priority: "P4 - Low", state: "Awaiting Vendor", assigned: "facilities.queue", caller: "aisha.mohamed", service: "AV / Collaboration", ci: "CONF-ROOM-44", openedBy: "self-service", opened: "Yesterday 16:20", sla: "breached", ai: "Suggested: Open vendor case with Crestron" },
  { id: "INC0040182", short: "Printer queue 'PRINT-NYC-3F-01' stuck", priority: "P3 - Moderate", state: "Resolved (auto)", assigned: "bot.print-recover", caller: "hannah.pierce", service: "Print", ci: "PRINT-NYC-3F-01", openedBy: "monitoring alert", opened: "Yesterday 14:18", sla: "met", ai: "Auto-resolved by 'Print-Queue-Restart-Bot' in 8 seconds" }
];

function loadState() { try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.incidents) return p; } } catch (e) {} const f = { incidents: JSON.parse(JSON.stringify(INCIDENTS)), selectedId: "INC0040188", view: "my-work" }; saveState(f); return f; }
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
let STATE = loadState();

function pri(p) { const c = /P1/.test(p) ? "#c1272d" : /P2/.test(p) ? "#e07a00" : /P3/.test(p) ? "#0b6cab" : "#5a7a85"; return `<span style="background:${c};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">${esc(p)}</span>`; }
function state(s) { const m = { "Open": "#5a7a85", "In Progress": "#1f7eb6", "Awaiting Caller": "#e07a00", "Awaiting Vendor": "#a4376f", "Resolved (auto)": "#1e9c52", "Closed": "#5a7a85" }; return `<span style="background:${m[s]||"#5a7a85"};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">${esc(s)}</span>`; }

function renderShell() {
  const sel = STATE.incidents.find((i) => i.id === STATE.selectedId) || STATE.incidents[0];
  return `
    <div style="display:flex;min-height:100vh;background:#f3f4f5;">
      <aside style="width:54px;background:#293e40;color:#fff;display:flex;flex-direction:column;align-items:center;padding-top:14px;">
        <div style="background:#62d84e;color:#293e40;width:34px;height:34px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;">SC</div>
        ${["&#9776;","&#9742;","&#10006;","&#9881;","&#127919;","&#128172;"].map((i,idx)=>`<div style="margin-top:18px;font-size:18px;cursor:pointer;${idx===0?"color:#62d84e;":"color:#aab8b8;"}">${i}</div>`).join("")}
      </aside>
      <div style="flex:1;display:flex;flex-direction:column;">
        <header style="background:#fff;padding:8px 16px;border-bottom:1px solid #dce3e3;display:flex;justify-content:space-between;align-items:center;">
          <div><strong style="color:#293e40;font-size:18px;">ServiceCloud Now</strong> <span style="color:#5a7a85;">Agent Workspace</span></div>
          <div style="display:flex;align-items:center;gap:14px;">
            <input type="search" placeholder="Search incidents, KB, CIs, users..." style="border:1px solid #c3cccc;border-radius:4px;padding:5px 10px;width:340px;font-size:13px;" />
            <button data-action="help" style="background:#1f497d;color:#fff;border:0;padding:5px 12px;border-radius:4px;font-size:11px;cursor:pointer;">App Context (?)</button>
            <a href="../" style="color:#1f497d;text-decoration:none;font-size:13px;">Main</a>
            <div style="width:32px;height:32px;border-radius:50%;background:#62d84e;color:#293e40;display:flex;align-items:center;justify-content:center;font-weight:700;">YA</div>
          </div>
        </header>

        <div style="display:grid;grid-template-columns:300px 1fr 360px;flex:1;">
          <aside style="background:#fff;border-right:1px solid #dce3e3;overflow:auto;">
            <div style="padding:10px 14px;border-bottom:1px solid #dce3e3;background:#f8f9fa;"><strong>My Open Work</strong> <span style="color:#5a7a85;">${STATE.incidents.filter((i)=>i.assigned==="you").length}</span></div>
            ${STATE.incidents.map((i) => `
              <div data-inc="${i.id}" style="padding:10px 14px;border-bottom:1px solid #ececec;cursor:pointer;${STATE.selectedId===i.id?"background:#e3f1ff;border-left:3px solid #1f7eb6;":""}">
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#5a7a85;"><span>${esc(i.id)}</span><span>${esc(i.opened)}</span></div>
                <div style="font-weight:600;color:#293e40;margin:2px 0;">${esc(i.short)}</div>
                <div style="display:flex;gap:6px;align-items:center;">${pri(i.priority)} ${state(i.state)}</div>
                <div style="color:#5a7a85;font-size:11px;margin-top:4px;">caller: <strong>${esc(i.caller)}</strong> &middot; ${esc(i.service)}</div>
              </div>`).join("")}
          </aside>

          <main style="background:#fff;overflow:auto;">
            <div style="padding:18px 24px;border-bottom:1px solid #dce3e3;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-size:12px;color:#5a7a85;">Incident</div>
                  <h2 style="margin:0;color:#293e40;">${esc(sel.id)} <span style="font-weight:400;color:#5a7a85;font-size:16px;">${esc(sel.short)}</span></h2>
                </div>
                <div>${state(sel.state)}</div>
              </div>
              <div style="display:flex;gap:24px;margin-top:14px;color:#293e40;font-size:13px;">
                <div><span style="color:#5a7a85;">Priority:</span> ${pri(sel.priority)}</div>
                <div><span style="color:#5a7a85;">Service:</span> <strong>${esc(sel.service)}</strong></div>
                <div><span style="color:#5a7a85;">CI:</span> <code>${esc(sel.ci)}</code></div>
                <div><span style="color:#5a7a85;">Caller:</span> <strong>${esc(sel.caller)}</strong></div>
                <div><span style="color:#5a7a85;">SLA:</span> <strong style="${/breached/.test(sel.sla)?"color:#c1272d;":""}">${esc(sel.sla)}</strong></div>
              </div>
            </div>

            <div style="padding:18px 24px;">
              <div style="display:flex;gap:6px;border-bottom:1px solid #dce3e3;padding-bottom:0;margin-bottom:14px;">
                ${["Details","Notes","Timeline","Related Records","KB"].map((t, i) => `<div style="padding:6px 14px;border-bottom:2px solid ${i===0?"#62d84e":"transparent"};color:${i===0?"#293e40":"#5a7a85"};font-weight:${i===0?600:400};cursor:pointer;">${t}</div>`).join("")}
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
                <div>
                  <h6 style="color:#5a7a85;text-transform:uppercase;font-size:11px;margin-bottom:8px;">Caller Information</h6>
                  <table style="width:100%;font-size:13px;">
                    <tr><td style="color:#5a7a85;width:40%;padding:3px 0;">Name</td><td><strong>${esc(sel.caller)}</strong></td></tr>
                    <tr><td style="color:#5a7a85;padding:3px 0;">Department</td><td>Finance</td></tr>
                    <tr><td style="color:#5a7a85;padding:3px 0;">Location</td><td>New York HQ - Floor 3</td></tr>
                    <tr><td style="color:#5a7a85;padding:3px 0;">Manager</td><td>Sofia Bianchi</td></tr>
                    <tr><td style="color:#5a7a85;padding:3px 0;">Contact</td><td>${esc(sel.caller)}@contoso.com</td></tr>
                  </table>
                </div>
                <div>
                  <h6 style="color:#5a7a85;text-transform:uppercase;font-size:11px;margin-bottom:8px;">Configuration Item</h6>
                  <table style="width:100%;font-size:13px;">
                    <tr><td style="color:#5a7a85;width:40%;padding:3px 0;">CI Name</td><td><code>${esc(sel.ci)}</code></td></tr>
                    <tr><td style="color:#5a7a85;padding:3px 0;">CI Class</td><td>Application Service</td></tr>
                    <tr><td style="color:#5a7a85;padding:3px 0;">Owner</td><td>Workplace IT</td></tr>
                    <tr><td style="color:#5a7a85;padding:3px 0;">Business Service</td><td><strong>${esc(sel.service)}</strong></td></tr>
                    <tr><td style="color:#5a7a85;padding:3px 0;">Last Change</td><td>CHG0008814 (5d ago)</td></tr>
                  </table>
                </div>
              </div>

              <div style="margin-top:18px;">
                <h6 style="color:#5a7a85;text-transform:uppercase;font-size:11px;margin-bottom:8px;">Description</h6>
                <div style="background:#f8f9fa;padding:14px;border-left:3px solid #1f7eb6;font-size:13px;">${esc(sel.short)}. User reports issue started this morning. No recent changes from user perspective. Multiple users in finance org reporting the same issue starting around 8:30 AM.</div>
              </div>

              <div style="margin-top:18px;">
                <h6 style="color:#5a7a85;text-transform:uppercase;font-size:11px;margin-bottom:8px;">Activity Timeline</h6>
                <ul style="list-style:none;padding-left:0;border-left:2px solid #dce3e3;margin-left:6px;">
                  ${[
                    { ts: sel.opened, who: sel.caller, msg: `Incident submitted via ${sel.openedBy}`, kind: "i" },
                    { ts: "09:15", who: "system", msg: "Auto-categorized: Outlook / Email Client", kind: "s" },
                    { ts: "09:15", who: "Virtual Agent AI", msg: sel.ai, kind: "a" },
                    { ts: "09:16", who: "you", msg: "Assigned to me. Reviewing CI graph for related changes.", kind: "u" },
                    { ts: "09:18", who: "system", msg: "CMDB enriched: 12 affected users in same Outlook profile group", kind: "s" }
                  ].map((e) => `
                    <li style="padding:8px 0 8px 16px;position:relative;">
                      <div style="position:absolute;left:-7px;top:12px;width:12px;height:12px;border-radius:50%;background:${e.kind==="a"?"#62d84e":e.kind==="s"?"#aab8b8":"#1f7eb6"};"></div>
                      <div style="font-size:11px;color:#5a7a85;">${esc(e.ts)} &middot; <strong>${esc(e.who)}</strong></div>
                      <div style="font-size:13px;">${esc(e.msg)}</div>
                    </li>`).join("")}
                </ul>
              </div>
            </div>
          </main>

          <aside style="background:#f8f9fa;border-left:1px solid #dce3e3;padding:16px;overflow:auto;">
            <div style="background:linear-gradient(135deg,#62d84e 0%,#1f9c52 100%);color:#fff;padding:14px;border-radius:8px;margin-bottom:14px;">
              <div style="font-size:11px;text-transform:uppercase;opacity:0.85;">&#10024; AI Agent</div>
              <div style="font-weight:700;margin:4px 0;">Resolution Suggestion</div>
              <div style="font-size:12px;line-height:1.4;">${esc(sel.ai)}</div>
              <button style="background:#fff;color:#1f9c52;border:0;padding:6px 12px;border-radius:4px;margin-top:10px;font-weight:600;cursor:pointer;" data-action="accept-ai">Accept &amp; Apply</button>
            </div>

            <div style="background:#fff;border:1px solid #dce3e3;border-radius:8px;padding:14px;margin-bottom:14px;">
              <div style="font-size:11px;color:#5a7a85;text-transform:uppercase;font-weight:600;">SLA Clock</div>
              <div style="font-size:24px;color:#1f7eb6;font-weight:700;">${esc(sel.sla)}</div>
              <div style="background:#e3f1ff;height:6px;border-radius:3px;margin-top:6px;"><div style="background:#1f7eb6;width:62%;height:100%;border-radius:3px;"></div></div>
            </div>

            <div style="background:#fff;border:1px solid #dce3e3;border-radius:8px;padding:14px;margin-bottom:14px;">
              <div style="font-size:11px;color:#5a7a85;text-transform:uppercase;font-weight:600;margin-bottom:8px;">Similar Incidents (last 30d)</div>
              ${[
                { id: "INC0039998", short: "Outlook crashes after Office update", count: 14 },
                { id: "INC0039722", short: "Outlook profile corrupted - PowerShell fix", count: 8 },
                { id: "INC0038411", short: "Cached Exchange Mode causing crash", count: 6 }
              ].map((s) => `<div style="padding:6px 0;border-bottom:1px dotted #ececec;font-size:12px;"><div style="color:#1f7eb6;font-weight:600;">${esc(s.id)}</div><div>${esc(s.short)}</div><div style="font-size:11px;color:#5a7a85;">${s.count} related tickets</div></div>`).join("")}
            </div>

            <div style="background:#fff;border:1px solid #dce3e3;border-radius:8px;padding:14px;">
              <div style="font-size:11px;color:#5a7a85;text-transform:uppercase;font-weight:600;margin-bottom:8px;">Suggested Runbooks</div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                <button style="background:#1f497d;color:#fff;border:0;padding:8px;border-radius:4px;text-align:left;font-size:12px;cursor:pointer;">&#9658; Reset Outlook profile (PowerShell)</button>
                <button style="background:#fff;color:#293e40;border:1px solid #c3cccc;padding:8px;border-radius:4px;text-align:left;font-size:12px;cursor:pointer;">&#9658; Repair OST file</button>
                <button style="background:#fff;color:#293e40;border:1px solid #c3cccc;padding:8px;border-radius:4px;text-align:left;font-size:12px;cursor:pointer;">&#9658; Clear Office credentials cache</button>
              </div>
            </div>

            <div style="margin-top:14px;display:flex;flex-direction:column;gap:6px;">
              <button style="background:#1e9c52;color:#fff;border:0;padding:10px;border-radius:4px;font-weight:600;cursor:pointer;" data-action="resolve">Resolve Incident</button>
              <button style="background:#fff;color:#293e40;border:1px solid #c3cccc;padding:10px;border-radius:4px;font-weight:600;cursor:pointer;">Escalate to Tier 3</button>
              <button style="background:#fff;color:#293e40;border:1px solid #c3cccc;padding:10px;border-radius:4px;font-weight:600;cursor:pointer;">Open Change Request</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `;
}

function openHelp() {
  const o = document.createElement("div"); o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;";
  o.innerHTML = `<div style="background:#fff;max-width:760px;border-radius:6px;"><div style="padding:14px 18px;border-bottom:1px solid #e2e6ea;font-weight:600;">App Context</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #e2e6ea;text-align:right;"><button id="sc" style="background:#1f497d;color:#fff;border:0;padding:6px 14px;border-radius:4px;cursor:pointer;">Close</button></div></div>`;
  document.body.appendChild(o); o.onclick = (e) => { if (e.target === o) o.remove(); };
  document.getElementById("sc").onclick = () => o.remove();
}

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-inc]").forEach((r) => r.addEventListener("click", () => { STATE.selectedId = r.dataset.inc; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.action;
    const sel = STATE.incidents.find((i) => i.id === STATE.selectedId);
    if (a === "help") openHelp();
    else if (a === "resolve" && sel) { sel.state = "Resolved (auto)"; sel.sla = "met"; saveState(STATE); render(); }
    else if (a === "accept-ai" && sel) { sel.state = "Resolved (auto)"; sel.sla = "met"; sel.ai = "AI suggestion accepted; runbook executed; incident resolved."; saveState(STATE); render(); }
  }));
}
render();
