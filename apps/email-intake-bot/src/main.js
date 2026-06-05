const KEY = "email-bot";

const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - AP/AR Shared Mailbox Bot Console

AP/AR Shared Mailbox Bot Console is a hybrid view that combines an Outlook-style shared mailbox with a real-time RPA telemetry pane. Operations analysts and the COE use it to see exactly what the email bot is doing - which messages it auto-classified, which it extracted data from, which it routed to downstream systems (AP, vendor master, customer service, IDP queue), and which it kicked out to a human reviewer. Common usage includes spot-checking the auto-classified queue every morning, retraining the classifier on misclassified samples, fixing a stuck routing rule, and clearing a backlog after a bot outage.

This experience is inspired by Microsoft Outlook 2016/M365 shared mailboxes, Power Automate Cloud email triggers, UiPath Email automation, and Zendesk-style ticket triage. Potential RPA use cases include automated parsing of incoming invoices, vendor statements, customer status inquiries, COI renewals, payment remittance advices, EDI fallback messages, intent classification (status request / dispute / new invoice / unsubscribe / wrong-recipient), attachment routing to IDP for OCR, auto-replies with template responses, SLA tracking, and triage of out-of-office bounces.`;

const FOLDERS = [
  { id: "inbox", name: "Inbox", count: 12 },
  { id: "ap-invoices", name: "AP-Invoices (auto)", count: 87 },
  { id: "vendor-status", name: "Vendor-Status-Requests (auto)", count: 41 },
  { id: "customer-care", name: "Customer-Care (auto)", count: 28 },
  { id: "coi-renewals", name: "COI-Renewals (auto)", count: 9 },
  { id: "human-review", name: "Human Review Required", count: 5 },
  { id: "spam", name: "Spam / Bounces", count: 33 }
];

const MESSAGES = [
  { id: "M-1042", folder: "inbox", from: "billing@acme-industrial.com", subj: "Invoice INV-78214 attached", preview: "Hi team, please find attached our latest invoice for the month of May. Net 30 as usual. Reach out with any questions.", received: "9:14 AM", attachment: "INV-78214.pdf", intent: "Invoice (new)", confidence: 99, route: "IDP > AP Inbox", status: "Auto-Routed", actions: ["Open IDP", "View Audit"] },
  { id: "M-1041", folder: "inbox", from: "ar@coastlinelog.com", subj: "Statement of account as of 5/31", preview: "Attached is your statement showing open invoices totaling $48,210. Please remit by July 1.", received: "9:08 AM", attachment: "Coastline_Stmt_May.pdf", intent: "Vendor Statement", confidence: 96, route: "AP Recon Workbench", status: "Auto-Routed", actions: ["Open AP Recon"] },
  { id: "M-1040", folder: "inbox", from: "marcus.allen@gmail.com", subj: "Loan APP-100214 status?", preview: "Hi, I submitted an auto loan application earlier today. Can you tell me where it is in your process? Thanks - Marcus", received: "8:55 AM", attachment: "", intent: "Status Inquiry", confidence: 94, route: "Loan Origination > Auto-reply + log", status: "Auto-Routed", actions: ["View Auto-Reply"] },
  { id: "M-1039", folder: "inbox", from: "compliance@globex-hosting.de", subj: "Renewed COI - effective July 1", preview: "Please find attached our renewed certificate of insurance, replacing the prior policy that expires 6/30.", received: "8:48 AM", attachment: "Globex_COI_2026-07.pdf", intent: "COI Renewal", confidence: 98, route: "Vendor Risk > Risk Cockpit + IDP", status: "Auto-Routed", actions: ["Open IDP"] },
  { id: "M-1038", folder: "inbox", from: "newaccounts@northwindlube.ca", subj: "Vendor onboarding W9 and bank details", preview: "We just received your vendor invite. Attached are our W9, voided check, and W8-BEN-E for Canadian withholding.", received: "8:30 AM", attachment: "Northwind_packet.pdf (3 docs)", intent: "Vendor Onboarding", confidence: 99, route: "Vendor Onboarding Desk", status: "Auto-Routed", actions: ["Open Vendor Desk"] },
  { id: "M-1037", folder: "inbox", from: "ofac.alerts@treasury-svc.com", subj: "DAILY SDN LIST UPDATE - 06/04", preview: "Daily Specially Designated Nationals list update is now available for download.", received: "8:14 AM", attachment: "SDN_2026-06-04.csv", intent: "Sanctions List Update", confidence: 99, route: "Wire OFAC Repair > rules refresh", status: "Auto-Routed", actions: ["View Audit"] },
  { id: "M-1036", folder: "inbox", from: "noreply@docusign.com", subj: "Completed: MSA - Acme Industrial v3", preview: "Your document has been completed by all parties. Click below to download the signed copy.", received: "7:58 AM", attachment: "MSA_Acme_v3_signed.pdf", intent: "Signed Contract", confidence: 97, route: "SharePoint > Contracts library", status: "Auto-Routed", actions: ["Open SharePoint"] },
  { id: "M-1035", folder: "inbox", from: "jhopkins@stark-mfg.com", subj: "Re: PO-44120 - shipped tracking", preview: "PO-44120 shipped yesterday via UPS Ground. Tracking: 1Z999AA10123456784. ETA 6/9.", received: "7:42 AM", attachment: "", intent: "Shipment Notification", confidence: 91, route: "Dock Scheduler > inbound", status: "Auto-Routed", actions: [] },
  { id: "M-1034", folder: "inbox", from: "mailer-daemon@contoso.com", subj: "Undelivered: payment confirmation", preview: "Your message to bob.smith@oldvendor.com was not delivered. The address could not be found.", received: "7:30 AM", attachment: "", intent: "Bounce / Wrong Recipient", confidence: 88, route: "Spam / Bounces", status: "Auto-Filed", actions: [] },
  { id: "M-1033", folder: "inbox", from: "supplier-portal@stark-mfg.com", subj: "Action needed: bank account change confirmation", preview: "We have updated our remittance bank account effective 6/15. Please confirm receipt and update your records.", received: "7:14 AM", attachment: "StarkMfg_BankChangeForm.pdf", intent: "Bank Account Change", confidence: 64, route: "HUMAN REVIEW (potential fraud)", status: "Held for Human", actions: ["Approve", "Reject", "Verify Caller"] },
  { id: "M-1032", folder: "inbox", from: "billing-disputes@megacorp-customer.com", subj: "Dispute on invoice INV-44119", preview: "We are disputing invoice INV-44119 for $4,840. The item was returned on 5/22. RMA-7714 attached.", received: "6:55 AM", attachment: "RMA-7714.pdf", intent: "AR Dispute", confidence: 92, route: "Billing Collections > Dispute queue", status: "Auto-Routed", actions: [] },
  { id: "M-1031", folder: "inbox", from: "ceo@contoso.com", subj: "URGENT: please process this invoice", preview: "Hi - can you please process this invoice today? It's for the consulting work I had done last quarter. Thanks!", received: "6:42 AM", attachment: "Invoice_ConsultingWork.pdf", intent: "Invoice (new) - exec request", confidence: 71, route: "HUMAN REVIEW (exec override risk)", status: "Held for Human", actions: ["Approve", "Reject"] }
];

function loadState() {
  try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.messages) return p; } } catch (e) {}
  const fresh = { messages: JSON.parse(JSON.stringify(MESSAGES)), folders: JSON.parse(JSON.stringify(FOLDERS)), activeFolder: "inbox", selectedId: "M-1042", botActivity: [], stats: { processedToday: 1191, routedAuto: 1106, sentToHuman: 27, classifierAccuracy: 96.4 } };
  saveState(fresh); return fresh;
}
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
let STATE = loadState();
function pushBot(msg) { STATE.botActivity.unshift({ ts: new Date().toLocaleTimeString(), msg }); if (STATE.botActivity.length > 50) STATE.botActivity = STATE.botActivity.slice(0, 50); }

function intentBadge(intent, confidence) {
  const c = confidence >= 90 ? "success" : confidence >= 80 ? "info" : confidence >= 70 ? "warning" : "danger";
  return `<span class="badge badge-${c}" title="confidence ${confidence}%">${esc(intent)} &middot; ${confidence}%</span>`;
}
function statusBadge(s) {
  const m = { "Auto-Routed": "success", "Auto-Filed": "info", "Held for Human": "warning", "Manual": "secondary" };
  return `<span class="badge badge-${m[s] || "secondary"}">${esc(s)}</span>`;
}

function renderShell() {
  const filtered = STATE.messages.filter((m) => m.folder === STATE.activeFolder);
  const sel = STATE.messages.find((m) => m.id === STATE.selectedId) || filtered[0] || STATE.messages[0];
  return `
    <div class="em-shell">
      <nav class="navbar navbar-dark" style="background:#003a70;">
        <div class="container-fluid">
          <span class="navbar-brand font-weight-bold">&#9993; AP/AR Shared Mailbox <span class="text-white-50 small">+ RPA bot</span></span>
          <div class="d-flex align-items-center text-white-50">
            <span class="mr-3 small">Bot: <span class="text-success">&#9679; Online</span></span>
            <span class="mr-3 small">Processed today: <strong class="text-white">${STATE.stats.processedToday.toLocaleString()}</strong></span>
            <span class="mr-3 small">Classifier accuracy: <strong class="text-white">${STATE.stats.classifierAccuracy}%</strong></span>
            <button class="btn btn-sm btn-outline-light mr-2" data-action="help">App Context (?)</button>
            <span class="small">ap-team@contoso.com</span>
          </div>
        </div>
      </nav>

      <div class="container-fluid mt-2">
        <div class="row no-gutters" style="border:1px solid #c8c8c8; background:#fff; min-height:560px;">
          <div class="col-md-2" style="background:#f7f7f7; border-right:1px solid #c8c8c8;">
            <div class="p-2 small text-muted text-uppercase font-weight-bold">Folders</div>
            ${STATE.folders.map((f) => `
              <a href="#" data-folder="${f.id}" class="d-flex justify-content-between align-items-center px-3 py-2 ${STATE.activeFolder === f.id ? "bg-primary text-white" : "text-dark"}" style="text-decoration:none; border-bottom:1px solid #ececec;">
                <span>${esc(f.name)}</span>
                <span class="badge badge-${STATE.activeFolder === f.id ? "light" : "secondary"}">${f.count}</span>
              </a>`).join("")}
          </div>
          <div class="col-md-4" style="border-right:1px solid #c8c8c8;">
            <div class="p-2 d-flex justify-content-between align-items-center" style="background:#f7f7f7; border-bottom:1px solid #ececec;">
              <strong>${esc(STATE.folders.find((f) => f.id === STATE.activeFolder)?.name)}</strong>
              <span class="small text-muted">${filtered.length} shown</span>
            </div>
            <div style="max-height:540px; overflow-y:auto;">
              ${filtered.length ? filtered.map((m) => `
                <div data-msg="${m.id}" class="${STATE.selectedId === m.id ? "bg-info text-white" : ""}" style="padding:8px 12px; border-bottom:1px solid #ececec; cursor:pointer;">
                  <div class="d-flex justify-content-between"><strong style="font-size:12px;">${esc(m.from)}</strong><span class="small">${esc(m.received)}</span></div>
                  <div style="font-size:13px;">${esc(m.subj)}</div>
                  <div class="small ${STATE.selectedId === m.id ? "text-white-50" : "text-muted"}" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(m.preview)}</div>
                  <div class="mt-1">${intentBadge(m.intent, m.confidence)} ${statusBadge(m.status)} ${m.attachment ? '<span class="badge badge-light">&#128206; attachment</span>' : ""}</div>
                </div>`).join("") : `<div class="p-3 text-muted text-center">Folder is empty.</div>`}
            </div>
          </div>
          <div class="col-md-6">
            ${sel ? `
              <div class="p-3" style="border-bottom:1px solid #ececec; background:#fafafa;">
                <div class="d-flex justify-content-between">
                  <h5 class="mb-1">${esc(sel.subj)}</h5>
                  ${statusBadge(sel.status)}
                </div>
                <div class="small text-muted">From: <strong>${esc(sel.from)}</strong> &middot; Received: ${esc(sel.received)} &middot; ${sel.attachment ? `Attachment: <strong>${esc(sel.attachment)}</strong>` : "No attachment"}</div>
              </div>
              <div class="p-3" style="white-space:pre-wrap; font-size:13px;">${esc(sel.preview)}</div>
              <div class="p-3" style="background:#f3f7fa; border-top:1px solid #ececec; border-bottom:1px solid #ececec;">
                <div class="small text-muted text-uppercase mb-2"><strong>RPA Bot Analysis</strong></div>
                <table class="table table-sm mb-0">
                  <tr><td class="text-muted" style="width:35%;">Intent Classification</td><td>${intentBadge(sel.intent, sel.confidence)}</td></tr>
                  <tr><td class="text-muted">Routing Decision</td><td><strong>${esc(sel.route)}</strong></td></tr>
                  <tr><td class="text-muted">Disposition</td><td>${statusBadge(sel.status)}</td></tr>
                </table>
                ${sel.actions && sel.actions.length ? `<div class="mt-3">${sel.actions.map((a) => `<button class="btn btn-sm btn-outline-primary mr-1">${esc(a)}</button>`).join("")}</div>` : ""}
              </div>
            ` : `<div class="p-5 text-center text-muted">Select a message</div>`}
            <div class="p-2" style="background:#fafafa; border-top:1px solid #ececec;">
              <button class="btn btn-sm btn-success" data-action="simulate-bot">Simulate Bot Run (process 6 new emails)</button>
            </div>
          </div>
        </div>

        <div class="row mt-3">
          <div class="col-md-7">
            <div class="card shadow-sm">
              <div class="card-header"><strong>Bot Activity Log</strong></div>
              <ul class="list-group list-group-flush" style="max-height:220px;overflow:auto;">
                ${(STATE.botActivity.length ? STATE.botActivity.slice(0, 14) : [{ ts: new Date().toLocaleTimeString(), msg: "Bot idle. Click 'Simulate Bot Run' to see new email processing." }]).map((e) => `<li class="list-group-item py-1 small"><span class="text-muted mr-2">${esc(e.ts)}</span> ${esc(e.msg)}</li>`).join("")}
              </ul>
            </div>
          </div>
          <div class="col-md-5">
            <div class="card shadow-sm">
              <div class="card-header"><strong>Today's KPIs</strong></div>
              <div class="card-body py-2">
                <div class="row text-center">
                  <div class="col"><div class="h5 mb-0 text-primary">${STATE.stats.processedToday.toLocaleString()}</div><div class="small text-muted">Processed</div></div>
                  <div class="col"><div class="h5 mb-0 text-success">${STATE.stats.routedAuto.toLocaleString()}</div><div class="small text-muted">Auto-Routed</div></div>
                  <div class="col"><div class="h5 mb-0 text-warning">${STATE.stats.sentToHuman.toLocaleString()}</div><div class="small text-muted">Human</div></div>
                  <div class="col"><div class="h5 mb-0 text-info">${STATE.stats.classifierAccuracy}%</div><div class="small text-muted">Accuracy</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer class="mt-3 mb-3 text-center text-muted small">AP/AR Shared Mailbox v3.0 &middot; Bot uptime 99.92% &middot; ${new Date().toLocaleString()}</footer>
      </div>
    </div>
  `;
}

const SIM_NEW = [
  { from: "billing@new-vendor.com", subj: "Invoice INV-22191", intent: "Invoice (new)", confidence: 96, route: "IDP > AP Inbox" },
  { from: "ar@globex-hosting.de", subj: "Statement of account", intent: "Vendor Statement", confidence: 94, route: "AP Recon Workbench" },
  { from: "patient@cigna-portal.com", subj: "EOB attached", intent: "Healthcare EOB", confidence: 87, route: "Patient Acct > Posting" },
  { from: "noreply@trinity-banking.com", subj: "Wire confirmation 884-22", intent: "Wire Confirmation", confidence: 91, route: "Treasury > Reconciliation" },
  { from: "no-reply@docusign.com", subj: "Completed: NDA Bluewater", intent: "Signed Contract", confidence: 95, route: "SharePoint > Contracts library" },
  { from: "unknown@external.io", subj: "RE: please call me", intent: "Unknown intent", confidence: 41, route: "HUMAN REVIEW (low confidence)" }
];

function simulateBot() {
  let i = 0;
  const t = setInterval(() => {
    const sim = SIM_NEW[i];
    pushBot(`Received: ${sim.subj} from ${sim.from}`);
    setTimeout(() => { pushBot(`Classifier: ${sim.intent} (${sim.confidence}% confidence)`); saveState(STATE); render(); }, 120);
    setTimeout(() => { pushBot(`Routed: -> ${sim.route}`); STATE.stats.processedToday += 1; if (sim.confidence >= 70) STATE.stats.routedAuto += 1; else STATE.stats.sentToHuman += 1; saveState(STATE); render(); }, 280);
    i += 1;
    if (i >= SIM_NEW.length) clearInterval(t);
  }, 400);
}

function openHelp() {
  const o = document.createElement("div");
  o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;";
  o.innerHTML = `<div style="background:#fff;max-width:760px;border-radius:6px;"><div style="padding:14px 18px;border-bottom:1px solid #e2e6ea;font-weight:600;">App Context &mdash; AP/AR Shared Mailbox Bot</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #e2e6ea;text-align:right;"><button class="btn btn-primary btn-sm" id="emc">Close</button></div></div>`;
  document.body.appendChild(o); o.addEventListener("click", (e) => { if (e.target === o) o.remove(); });
  document.getElementById("emc").onclick = () => o.remove();
}

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-folder]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); STATE.activeFolder = a.dataset.folder; const first = STATE.messages.find((m) => m.folder === STATE.activeFolder); if (first) STATE.selectedId = first.id; saveState(STATE); render(); }));
  document.querySelectorAll("[data-msg]").forEach((d) => d.addEventListener("click", () => { STATE.selectedId = d.dataset.msg; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.action;
    if (a === "help") openHelp();
    else if (a === "simulate-bot") simulateBot();
  }));
}
render();
