const KEY = "wire-ach-ops";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - Wire / ACH Exception Operations

Wire / ACH Exception Operations is the back-office queue that wire-room and ACH-ops analysts work all day to clear payment exceptions before cutoff. Common usage includes triaging the OFAC repair queue, repairing beneficiary information on stopped wires, processing NACHA return codes on ACH items, resolving Fedwire IMAD/OMAD discrepancies, and approving repaired items for resend before the daily Fedwire/ACH cutoff window.

This experience is inspired by Fundtech / Finastra Global PAYplus, ACI Wires, FIS IBS Wire, NACHA Risk Management Portal, and Bottomline Cyber Fraud & Risk Management. Potential RPA use cases include automated OFAC repair (false-positive routing), NACHA R-code disposition (R01 NSF, R02 account closed, R03 no account, R04 invalid account number) with auto-reissue logic, beneficiary OCR/correction, return-item posting, fraud-pattern detection, automated daily reconciliation against the GL, and exception SLA monitoring with auto-escalation.`;

const ITEMS = [
  { id: "WIR-2026-44120", type: "Wire OUT", amount: 184210.00, currency: "USD", debtor: "CONTOSO MFG INC", beneficiary: "ACME INDUSTRIAL SUPPLY", benefBank: "WELLS FARGO 121000248", reason: "OFAC POTENTIAL MATCH", reasonCode: "OFAC-FP", riskScore: 28, dueBy: "Today 16:00 ET", initiated: "08:14 ET", status: "OFAC Hold" },
  { id: "WIR-2026-44119", type: "Wire OUT", amount: 48210.00, currency: "USD", debtor: "CONTOSO MFG INC", beneficiary: "COASTLINE LOGISTCS LLC", benefBank: "JPMORGAN 021000021", reason: "BENEFICIARY NAME MISMATCH", reasonCode: "BENF-MM", riskScore: 14, dueBy: "Today 16:00 ET", initiated: "07:55 ET", status: "Awaiting Repair" },
  { id: "ACH-2026-44118", type: "ACH Return", amount: 4880.00, currency: "USD", debtor: "TRADE PARTNER A", beneficiary: "CONTOSO MFG INC", benefBank: "JPMORGAN 021000021", reason: "R01 - INSUFFICIENT FUNDS", reasonCode: "R01", riskScore: 8, dueBy: "Today 15:30 ET", initiated: "07:42 ET", status: "Return Received" },
  { id: "ACH-2026-44117", type: "ACH Return", amount: 1240.00, currency: "USD", debtor: "TRADE PARTNER B", beneficiary: "CONTOSO MFG INC", benefBank: "JPMORGAN 021000021", reason: "R02 - ACCOUNT CLOSED", reasonCode: "R02", riskScore: 88, dueBy: "Today 15:30 ET", initiated: "07:30 ET", status: "Return Received" },
  { id: "WIR-2026-44116", type: "Wire IN", amount: 920000.00, currency: "USD", debtor: "MEGACORP CUSTOMER", beneficiary: "CONTOSO MFG INC", benefBank: "JPMORGAN 021000021", reason: "OUR REFERENCE MISSING - UNAPPLIED CASH", reasonCode: "UNAPPL", riskScore: 12, dueBy: "EOD", initiated: "Yesterday 14:18", status: "Unapplied" },
  { id: "WIR-2026-44115", type: "Wire OUT", amount: 88000.00, currency: "EUR", debtor: "CONTOSO MFG INC", beneficiary: "GLOBEX HOSTING GMBH", benefBank: "DEUTSCHE BANK DEUTDEFF", reason: "FX RATE TOLERANCE BREACH", reasonCode: "FX-TOL", riskScore: 18, dueBy: "Today 12:00 ET", initiated: "07:14 ET", status: "Awaiting Repair" },
  { id: "ACH-2026-44114", type: "ACH Return", amount: 22400.00, currency: "USD", debtor: "TRADE PARTNER C", beneficiary: "CONTOSO MFG INC", benefBank: "JPMORGAN 021000021", reason: "R03 - NO ACCOUNT/UNABLE TO LOCATE", reasonCode: "R03", riskScore: 24, dueBy: "Today 15:30 ET", initiated: "06:55 ET", status: "Return Received" },
  { id: "WIR-2026-44113", type: "Wire OUT", amount: 14000.00, currency: "USD", debtor: "CONTOSO MFG INC", beneficiary: "HELIOS SOLAR LTD", benefBank: "INDUSTRIAL BANK OF CHINA SHIBHKHH", reason: "OFAC POTENTIAL MATCH + COUNTRY RISK", reasonCode: "OFAC-CR", riskScore: 91, dueBy: "Today 16:00 ET", initiated: "06:48 ET", status: "OFAC Hold" }
];

function loadState() { try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.items) return p; } } catch (e) {} const f = { items: ITEMS, selectedId: "WIR-2026-44120", filter: "All" }; saveState(f); return f; }
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function fmt$(n, c) { return (c || "$") + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 }); }
let STATE = loadState();

function statusBadge(s) { const m = { "OFAC Hold": "#a01000", "Awaiting Repair": "#cc6600", "Return Received": "#7a4f9c", "Unapplied": "#0b6cab", "Released": "#0a8a2c", "Rejected": "#5a6772" }; return `<span style="background:${m[s]||"#5a6772"};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;">${esc(s)}</span>`; }
function riskBar(r) { const c = r<25?"#0a8a2c":r<60?"#cc6600":"#a01000"; return `<div style="background:#e0e0e0;height:6px;border-radius:3px;width:90px;display:inline-block;vertical-align:middle;"><div style="background:${c};width:${r}%;height:100%;border-radius:3px;"></div></div> <span style="font-weight:700;color:${c};">${r}</span>`; }

function renderShell() {
  const sel = STATE.items.find((i) => i.id === STATE.selectedId);
  const filtered = STATE.items.filter((i) => STATE.filter === "All" || i.status === STATE.filter);
  const totals = { ofac: STATE.items.filter((i)=>i.status==="OFAC Hold").length, repair: STATE.items.filter((i)=>i.status==="Awaiting Repair").length, return: STATE.items.filter((i)=>i.status==="Return Received").length, unapp: STATE.items.filter((i)=>i.status==="Unapplied").length };
  return `
    <div style="min-height:100vh;background:#fff;">
      <header style="background:#0b3954;color:#fff;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;">
        <div><strong>TREASURY OPS</strong> <span style="opacity:0.75;">| Wire &amp; ACH Exception Repair</span></div>
        <div style="display:flex;align-items:center;gap:14px;font-size:11px;">
          <span style="background:#fa3b1d;padding:2px 8px;border-radius:3px;font-weight:700;">CUTOFF 16:00 ET</span>
          <span>Logged in: <strong>wire.ops@contoso.com</strong></span>
          <button data-action="help" style="background:#0a8a2c;color:#fff;border:0;padding:5px 12px;border-radius:3px;cursor:pointer;">App Context (?)</button>
          <a href="../" style="color:#fff;text-decoration:none;">Main</a>
        </div>
      </header>

      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:#dadada;">
        ${[
          { l: "OFAC Holds", v: totals.ofac, c: "#a01000" },
          { l: "Repair Queue", v: totals.repair, c: "#cc6600" },
          { l: "ACH Returns", v: totals.return, c: "#7a4f9c" },
          { l: "Unapplied Cash", v: totals.unapp, c: "#0b6cab" },
          { l: "Time to Cutoff", v: "3h 12m", c: "#fa3b1d" }
        ].map((c) => `<div style="background:#fff;padding:10px 14px;border-top:3px solid ${c.c};"><div style="font-size:10px;text-transform:uppercase;color:#5a5a5a;">${c.l}</div><div style="font-size:22px;font-weight:700;color:${c.c};">${c.v}</div></div>`).join("")}
      </div>

      <div style="display:grid;grid-template-columns:1fr 380px;">
        <div>
          <div style="padding:10px 14px;background:#f3f3f3;border-bottom:1px solid #dadada;display:flex;gap:6px;align-items:center;">
            <strong>Exception queue:</strong>
            ${["All","OFAC Hold","Awaiting Repair","Return Received","Unapplied"].map((f) => `<a href="#" data-filter="${esc(f)}" style="padding:3px 8px;border:1px solid #c0c0c0;border-radius:3px;background:${STATE.filter===f?"#0b3954":"#fff"};color:${STATE.filter===f?"#fff":"#0b3954"};text-decoration:none;font-size:11px;">${esc(f)} (${STATE.items.filter((i)=>f==="All"||i.status===f).length})</a>`).join("")}
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead style="background:#e6edf3;font-size:11px;">
              <tr><th style="text-align:left;padding:6px 10px;">Item ID</th><th style="text-align:left;padding:6px 10px;">Type</th><th style="text-align:right;padding:6px 10px;">Amount</th><th style="text-align:left;padding:6px 10px;">Beneficiary</th><th style="text-align:left;padding:6px 10px;">Reason</th><th style="text-align:left;padding:6px 10px;">Risk</th><th style="text-align:left;padding:6px 10px;">Status</th></tr>
            </thead>
            <tbody>${filtered.map((i) => `
              <tr data-itm="${i.id}" style="border-bottom:1px solid #f0f0f0;cursor:pointer;${STATE.selectedId===i.id?"background:#fff8d8;":""}">
                <td style="padding:8px 10px;font-family:Consolas,monospace;color:#0b3954;font-weight:600;">${esc(i.id)}</td>
                <td style="padding:8px 10px;">${esc(i.type)}</td>
                <td style="padding:8px 10px;text-align:right;font-weight:700;">${fmt$(i.amount, i.currency==="USD"?"$":i.currency==="EUR"?"&euro;":i.currency+" ")}</td>
                <td style="padding:8px 10px;"><div>${esc(i.beneficiary)}</div><div style="font-size:10px;color:#666;">${esc(i.benefBank)}</div></td>
                <td style="padding:8px 10px;"><div style="font-size:11px;">${esc(i.reason)}</div><div style="font-size:10px;color:#666;">${esc(i.reasonCode)}</div></td>
                <td style="padding:8px 10px;">${riskBar(i.riskScore)}</td>
                <td style="padding:8px 10px;">${statusBadge(i.status)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>

        <aside style="background:#f7fafc;border-left:1px solid #dadada;padding:14px;">
          ${sel ? `
            <div style="background:#fff;border:1px solid #dadada;padding:12px;margin-bottom:12px;">
              <div style="font-size:11px;color:#5a5a5a;text-transform:uppercase;">Item Detail</div>
              <div style="font-size:14px;font-weight:700;color:#0b3954;font-family:Consolas,monospace;">${esc(sel.id)}</div>
              <table style="width:100%;font-size:12px;margin-top:8px;">
                <tr><td style="color:#5a5a5a;width:40%;padding:2px 0;">Amount</td><td><strong>${fmt$(sel.amount, sel.currency==="USD"?"$":sel.currency==="EUR"?"&euro;":sel.currency+" ")}</strong></td></tr>
                <tr><td style="color:#5a5a5a;padding:2px 0;">Type</td><td>${esc(sel.type)}</td></tr>
                <tr><td style="color:#5a5a5a;padding:2px 0;">Debtor</td><td>${esc(sel.debtor)}</td></tr>
                <tr><td style="color:#5a5a5a;padding:2px 0;">Beneficiary</td><td>${esc(sel.beneficiary)}</td></tr>
                <tr><td style="color:#5a5a5a;padding:2px 0;">Benef Bank</td><td><code>${esc(sel.benefBank)}</code></td></tr>
                <tr><td style="color:#5a5a5a;padding:2px 0;">Reason</td><td><strong style="color:#a01000;">${esc(sel.reason)}</strong></td></tr>
                <tr><td style="color:#5a5a5a;padding:2px 0;">Reason Code</td><td><code>${esc(sel.reasonCode)}</code></td></tr>
                <tr><td style="color:#5a5a5a;padding:2px 0;">Risk Score</td><td>${riskBar(sel.riskScore)}</td></tr>
                <tr><td style="color:#5a5a5a;padding:2px 0;">Due By</td><td><strong style="color:#fa3b1d;">${esc(sel.dueBy)}</strong></td></tr>
              </table>
            </div>

            <div style="background:linear-gradient(135deg,#0a8a2c 0%,#067a23 100%);color:#fff;padding:12px;border-radius:4px;margin-bottom:12px;">
              <div style="font-size:11px;text-transform:uppercase;opacity:0.85;">&#129302; RPA Bot Disposition</div>
              <div style="margin-top:4px;font-size:12px;line-height:1.4;">
                ${sel.riskScore < 25 ? `Likely false positive (risk ${sel.riskScore}). Bot can auto-repair and release based on prior beneficiary history.` : sel.riskScore < 60 ? `Medium risk. Bot can pre-fill repair fields and queue for analyst review.` : `HIGH RISK. Bot recommends BSA officer review before release.`}
              </div>
              <button data-action="auto-repair" style="background:#fff;color:#0a8a2c;border:0;padding:6px 12px;border-radius:3px;margin-top:8px;font-weight:600;cursor:pointer;font-size:11px;">${sel.riskScore < 25 ? "Auto-Repair &amp; Release" : "Pre-Fill Repair"}</button>
            </div>

            <div style="background:#fff;border:1px solid #dadada;padding:12px;">
              <div style="font-weight:700;font-size:11px;text-transform:uppercase;color:#5a5a5a;margin-bottom:8px;">Actions</div>
              <button data-action="release" style="background:#0a8a2c;color:#fff;border:0;padding:8px;border-radius:3px;width:100%;margin-bottom:6px;cursor:pointer;">Release / Resend</button>
              <button data-action="repair" style="background:#fff;color:#0b3954;border:1px solid #0b3954;padding:8px;border-radius:3px;width:100%;margin-bottom:6px;cursor:pointer;">Open Repair Form</button>
              <button data-action="bsa" style="background:#fff;color:#a01000;border:1px solid #a01000;padding:8px;border-radius:3px;width:100%;margin-bottom:6px;cursor:pointer;">Escalate to BSA Officer</button>
              <button data-action="reject" style="background:#fff;color:#5a5a5a;border:1px solid #5a5a5a;padding:8px;border-radius:3px;width:100%;cursor:pointer;">Reject &amp; Return</button>
            </div>
          ` : ""}
        </aside>
      </div>
    </div>
  `;
}

function openHelp() { const o = document.createElement("div"); o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;"; o.innerHTML = `<div style="background:#fff;max-width:760px;border-radius:6px;"><div style="padding:14px 18px;border-bottom:1px solid #e2e6ea;font-weight:600;">App Context</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #e2e6ea;text-align:right;"><button id="wc" style="background:#0b3954;color:#fff;border:0;padding:6px 14px;border-radius:4px;cursor:pointer;">Close</button></div></div>`; document.body.appendChild(o); o.onclick = (e) => { if (e.target === o) o.remove(); }; document.getElementById("wc").onclick = () => o.remove(); }

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-itm]").forEach((r) => r.addEventListener("click", () => { STATE.selectedId = r.dataset.itm; saveState(STATE); render(); }));
  document.querySelectorAll("[data-filter]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); STATE.filter = a.dataset.filter; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.action;
    const sel = STATE.items.find((i) => i.id === STATE.selectedId);
    if (a === "help") openHelp();
    else if (a === "release" && sel) { sel.status = "Released"; saveState(STATE); render(); }
    else if (a === "reject" && sel) { sel.status = "Rejected"; saveState(STATE); render(); }
    else if (a === "auto-repair" && sel) { sel.status = sel.riskScore < 25 ? "Released" : "Awaiting Repair"; saveState(STATE); render(); }
  }));
}
render();
