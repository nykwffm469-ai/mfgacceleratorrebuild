const KEY = "edi-monitor";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - EDI Trading Partner Exception Monitor

EDI Trading Partner Exception Monitor is the operations console where B2B integration engineers and supply-chain analysts work all day to clear EDI exceptions before customer chargebacks pile up. Common usage includes triaging failed 850 (PO), 855 (PO Ack), 856 (ASN), 860 (PO Change), 810 (Invoice), and 997 (Functional Ack) transactions; resolving partner-specific data mapping errors; reprocessing rejected batches; and reaching out to the trading-partner EDI contact when their data fails our validation rules.

This experience is inspired by SPS Commerce Fulfillment, IBM Sterling B2B Integrator, OpenText TrustEdge / GXS, and Cleo Integration Cloud. Potential RPA use cases include automated retry of transient EDI failures, partner-specific transformation rule application, missing-line-item enrichment from the ERP, automated 997 acknowledgement issuance, daily reconciliation against PO/shipment/invoice activity, chargeback risk scoring (Walmart OTIF, Amazon Vendor Code violations), and exception notifications to the partner's EDI VAN contact when our system detects bad inbound data.`;

const TRANSACTIONS = [
  { id: "856-2026-44120", txn: "856 ASN", partner: "Walmart Vendor 9931", direction: "OUT", po: "PO-44120", reason: "MISSING SCC-18 PALLET TAG", reasonCode: "OTIF-RISK", amount: 184210, retries: 2, status: "Failed - Auto-Retry Pending", riskOTIF: 88 },
  { id: "856-2026-44119", txn: "856 ASN", partner: "Target VendorNet", direction: "OUT", po: "PO-44119", reason: "GTIN-14 INVALID CHECK DIGIT", reasonCode: "MAP-FAIL", amount: 88200, retries: 4, status: "Failed - Human Review", riskOTIF: 22 },
  { id: "810-2026-44118", txn: "810 Invoice", partner: "Amazon Vendor Central", direction: "OUT", po: "PO-44118", reason: "ASN-INVOICE QTY MISMATCH (10 vs 12)", reasonCode: "ARN-MM", amount: 41440, retries: 1, status: "Failed - Auto-Retry Pending", riskOTIF: 18 },
  { id: "997-2026-44117", txn: "997 Func Ack", partner: "Stark Manufacturing", direction: "IN", po: "-", reason: "MISSING - TRADING PARTNER LATE", reasonCode: "997-LATE", amount: 0, retries: 0, status: "Awaiting Partner", riskOTIF: 0 },
  { id: "855-2026-44116", txn: "855 PO Ack", partner: "Coastline Logistics", direction: "IN", po: "PO-44116", reason: "REJECTED - PRICE MISMATCH ($12.40 vs $12.65 contract)", reasonCode: "PRICE-MM", amount: 22400, retries: 0, status: "Failed - Human Review", riskOTIF: 0 },
  { id: "850-2026-44115", txn: "850 PO", partner: "Globex Industrial", direction: "IN", po: "PO-44115", reason: "UNKNOWN ITEM NUMBER GLX-7741", reasonCode: "ITEM-MISSING", amount: 88210, retries: 0, status: "Failed - Item Master Lookup", riskOTIF: 0 },
  { id: "856-2026-44114", txn: "856 ASN", partner: "Apex Manufacturing", direction: "OUT", po: "PO-44114", reason: "OK - DELIVERED ON TIME", reasonCode: "OK", amount: 412000, retries: 0, status: "Success", riskOTIF: 0 },
  { id: "810-2026-44113", txn: "810 Invoice", partner: "Bluewater Energy", direction: "OUT", po: "PO-44113", reason: "OK", reasonCode: "OK", amount: 41400, retries: 0, status: "Success", riskOTIF: 0 }
];

function loadState() { try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.txns) return p; } } catch (e) {} const f = { txns: TRANSACTIONS, selectedId: "856-2026-44120", filter: "All" }; saveState(f); return f; }
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function fmt$(n) { return "$" + Number(n).toLocaleString(); }
let STATE = loadState();

function statusBadge(s) { const m = { "Success": "#0a8a2c", "Failed - Auto-Retry Pending": "#cc6600", "Failed - Human Review": "#a01000", "Failed - Item Master Lookup": "#7a4f9c", "Awaiting Partner": "#5a6772" }; return `<span style="background:${m[s]||"#5a6772"};color:#fff;padding:3px 8px;border-radius:3px;font-size:11px;font-weight:600;">${esc(s)}</span>`; }
function otif(r) { if (r === 0) return ""; const c = r<25?"#0a8a2c":r<60?"#cc6600":"#a01000"; return `<span style="background:${c};color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:700;">OTIF RISK ${r}%</span>`; }
function dirArrow(d) { return d === "IN" ? `<span style="color:#0b6cab;">&larr;IN</span>` : `<span style="color:#0a8a2c;">OUT&rarr;</span>`; }

function renderShell() {
  const sel = STATE.txns.find((t) => t.id === STATE.selectedId);
  const filtered = STATE.txns.filter((t) => STATE.filter === "All" || (STATE.filter === "Failed" && /Failed/.test(t.status)) || t.status === STATE.filter);
  const counts = { failed: STATE.txns.filter((t)=>/Failed/.test(t.status)).length, success: STATE.txns.filter((t)=>t.status==="Success").length, waiting: STATE.txns.filter((t)=>t.status==="Awaiting Partner").length, otifRisk: STATE.txns.filter((t)=>t.riskOTIF>50).length };
  return `
    <div style="min-height:100vh;">
      <header style="background:#1a1a2e;color:#fff;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;">
        <div><strong style="font-size:16px;">&#8693; EDI Trading Partner Monitor</strong> <span style="opacity:0.7;">| Real-time B2B integration</span></div>
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="font-size:11px;opacity:0.85;">Partner connections: <strong style="color:#5cdbd3;">82 active</strong></span>
          <button data-action="help" style="background:#5cdbd3;color:#1a1a2e;border:0;padding:5px 12px;border-radius:3px;cursor:pointer;font-size:11px;font-weight:600;">App Context (?)</button>
          <a href="../" style="color:#fff;text-decoration:none;font-size:12px;">Main</a>
        </div>
      </header>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#dadada;">
        ${[
          { l:"Failed Today", v:counts.failed, c:"#a01000" },
          { l:"Successful Today", v:counts.success, c:"#0a8a2c" },
          { l:"Awaiting Partner", v:counts.waiting, c:"#5a6772" },
          { l:"OTIF Risk Items", v:counts.otifRisk, c:"#cc6600" }
        ].map((c) => `<div style="background:#fff;padding:14px 18px;border-top:3px solid ${c.c};"><div style="font-size:11px;text-transform:uppercase;color:#666;">${c.l}</div><div style="font-size:26px;font-weight:700;color:${c.c};">${c.v}</div></div>`).join("")}
      </div>

      <div style="display:grid;grid-template-columns:1fr 360px;">
        <div>
          <div style="padding:10px 16px;background:#fff;border-bottom:1px solid #ddd;display:flex;gap:6px;">
            ${["All","Failed","Success","Awaiting Partner"].map((f) => `<button data-filter="${esc(f)}" style="border:1px solid #c0c0c0;background:${STATE.filter===f?"#1a1a2e":"#fff"};color:${STATE.filter===f?"#fff":"#1a1a2e"};padding:4px 12px;border-radius:3px;font-size:11px;cursor:pointer;">${esc(f)}</button>`).join("")}
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;">
            <thead style="background:#f3f4f5;font-size:11px;text-transform:uppercase;color:#666;">
              <tr><th style="text-align:left;padding:8px 14px;">Transaction</th><th style="text-align:left;padding:8px 14px;">Type</th><th style="text-align:left;padding:8px 14px;">Partner</th><th style="text-align:left;padding:8px 14px;">Dir</th><th style="text-align:right;padding:8px 14px;">Amt</th><th style="text-align:left;padding:8px 14px;">Reason</th><th style="text-align:left;padding:8px 14px;">Status</th><th style="text-align:left;padding:8px 14px;">OTIF</th></tr>
            </thead>
            <tbody>${filtered.map((t) => `
              <tr data-tx="${t.id}" style="border-bottom:1px solid #f3f4f5;cursor:pointer;${STATE.selectedId===t.id?"background:#e3f1ff;":""}">
                <td style="padding:8px 14px;font-family:Consolas,monospace;font-weight:600;color:#1a1a2e;">${esc(t.id)}</td>
                <td style="padding:8px 14px;">${esc(t.txn)}</td>
                <td style="padding:8px 14px;">${esc(t.partner)}</td>
                <td style="padding:8px 14px;">${dirArrow(t.direction)}</td>
                <td style="padding:8px 14px;text-align:right;font-weight:600;">${t.amount?fmt$(t.amount):"-"}</td>
                <td style="padding:8px 14px;font-size:11px;">${esc(t.reason)}</td>
                <td style="padding:8px 14px;">${statusBadge(t.status)}</td>
                <td style="padding:8px 14px;">${otif(t.riskOTIF)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>

        <aside style="background:#f7f8fa;border-left:1px solid #ddd;padding:14px;">
          ${sel ? `
            <div style="background:#fff;border:1px solid #ddd;padding:12px;border-radius:4px;margin-bottom:12px;">
              <div style="font-size:11px;color:#666;text-transform:uppercase;">Transaction</div>
              <div style="font-family:Consolas,monospace;font-weight:700;color:#1a1a2e;">${esc(sel.id)}</div>
              <table style="width:100%;font-size:12px;margin-top:6px;">
                <tr><td style="color:#666;width:40%;padding:2px 0;">Type</td><td><strong>${esc(sel.txn)}</strong></td></tr>
                <tr><td style="color:#666;padding:2px 0;">Partner</td><td>${esc(sel.partner)}</td></tr>
                <tr><td style="color:#666;padding:2px 0;">Direction</td><td>${dirArrow(sel.direction)}</td></tr>
                <tr><td style="color:#666;padding:2px 0;">PO</td><td><code>${esc(sel.po)}</code></td></tr>
                <tr><td style="color:#666;padding:2px 0;">Amount</td><td><strong>${sel.amount?fmt$(sel.amount):"-"}</strong></td></tr>
                <tr><td style="color:#666;padding:2px 0;">Reason</td><td style="color:${sel.reasonCode==="OK"?"#0a8a2c":"#a01000"};">${esc(sel.reason)}</td></tr>
                <tr><td style="color:#666;padding:2px 0;">Reason Code</td><td><code>${esc(sel.reasonCode)}</code></td></tr>
                <tr><td style="color:#666;padding:2px 0;">Retries</td><td>${sel.retries}</td></tr>
                <tr><td style="color:#666;padding:2px 0;">Status</td><td>${statusBadge(sel.status)}</td></tr>
                ${sel.riskOTIF ? `<tr><td style="color:#666;padding:2px 0;">OTIF Risk</td><td>${otif(sel.riskOTIF)}</td></tr>` : ""}
              </table>
            </div>

            <div style="background:linear-gradient(135deg,#5cdbd3 0%,#13c2c2 100%);color:#003a52;padding:12px;border-radius:4px;margin-bottom:12px;">
              <div style="font-size:11px;text-transform:uppercase;opacity:0.85;">&#129302; Bot Disposition</div>
              <div style="margin-top:4px;font-size:12px;line-height:1.4;">${/^(MISSING|MAP-FAIL|ITEM-MISSING|ARN-MM)/.test(sel.reasonCode) ? `Bot can auto-recover. Will look up missing data in ERP/item master, re-transform, and resend within 30 seconds.` : sel.reasonCode==="OK" ? `Success - no action needed.` : `Manual review required. Bot recommends opening partner case with their EDI contact.`}</div>
              <button data-action="auto-recover" style="background:#fff;color:#003a52;border:0;padding:6px 12px;border-radius:3px;margin-top:8px;font-weight:600;cursor:pointer;font-size:11px;">Trigger Bot Recovery</button>
            </div>

            <div style="background:#fff;border:1px solid #ddd;padding:12px;border-radius:4px;">
              <div style="font-weight:700;font-size:11px;text-transform:uppercase;color:#666;margin-bottom:8px;">Recent Partner Health (30d)</div>
              <table style="width:100%;font-size:11px;">
                <tr><td style="color:#666;padding:2px 0;">Success rate</td><td style="text-align:right;color:#0a8a2c;font-weight:700;">94.2%</td></tr>
                <tr><td style="color:#666;padding:2px 0;">OTIF compliance</td><td style="text-align:right;color:#cc6600;font-weight:700;">87.1%</td></tr>
                <tr><td style="color:#666;padding:2px 0;">Chargebacks (mo)</td><td style="text-align:right;color:#a01000;font-weight:700;">$28,400</td></tr>
                <tr><td style="color:#666;padding:2px 0;">Avg cycle time</td><td style="text-align:right;">14.2 hrs</td></tr>
              </table>
            </div>
          ` : ""}
        </aside>
      </div>
    </div>
  `;
}

function openHelp() { const o = document.createElement("div"); o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;"; o.innerHTML = `<div style="background:#fff;max-width:760px;border-radius:6px;"><div style="padding:14px 18px;border-bottom:1px solid #e2e6ea;font-weight:600;">App Context</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #e2e6ea;text-align:right;"><button id="ec" style="background:#1a1a2e;color:#fff;border:0;padding:6px 14px;border-radius:4px;cursor:pointer;">Close</button></div></div>`; document.body.appendChild(o); o.onclick = (e) => { if (e.target === o) o.remove(); }; document.getElementById("ec").onclick = () => o.remove(); }

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-tx]").forEach((r) => r.addEventListener("click", () => { STATE.selectedId = r.dataset.tx; saveState(STATE); render(); }));
  document.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => { STATE.filter = b.dataset.filter; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.action; const sel = STATE.txns.find((t) => t.id === STATE.selectedId);
    if (a === "help") openHelp();
    else if (a === "auto-recover" && sel) { if (/^(MISSING|MAP-FAIL|ITEM-MISSING|ARN-MM)/.test(sel.reasonCode)) { sel.status = "Success"; sel.reasonCode = "OK"; sel.reason = "OK - Bot auto-recovered"; sel.riskOTIF = 0; } saveState(STATE); render(); }
  }));
}
render();
