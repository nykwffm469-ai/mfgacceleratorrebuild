const KEY = "idp-studio";

const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - Document Intelligence Studio

Document Intelligence Studio is the human-in-the-loop validation surface for intelligent document processing pipelines. Operations analysts and validators use it to review documents the bot processed, accept or correct extracted fields, retrain the classifier on misclassified samples, and route validated documents to downstream business systems. Common usage includes triaging the daily document queue, validating low-confidence fields on a split-screen PDF viewer, marking samples for retraining, and watching auto-classification + extraction confidence rise over time.

This experience is inspired by ABBYY FlexiCapture, Hyperscience, AWS Textract, Azure Form Recognizer / Document Intelligence, and Kofax Capture. Potential RPA use cases include automatic intake from email, fax, scanner, or SharePoint drop folders, document type classification (invoices, W2s, EOBs, COIs, paystubs, BOLs), structured/semi-structured/unstructured extraction, confidence-based routing to STP (straight-through processing) or to human review, validation workflow with audit trail, training-data capture from human corrections, and structured handoff to ERP / CRM / claims systems.`;

const DOCUMENTS = [
  { id: "DOC-9001", name: "Acme-Industrial-Invoice-78214.pdf", type: "Invoice", classification: "Invoice (vendor)", classConfidence: 99.2, source: "shared-mailbox/ap-inbox", received: "06/05 09:14", pages: 2, status: "Pending Validation", route: "AP > Payable Batch Uploader",
    fields: [
      { name: "Vendor Name", value: "Acme Industrial Supply Co.", confidence: 99 },
      { name: "Invoice Number", value: "INV-78214", confidence: 100 },
      { name: "Invoice Date", value: "2026-05-31", confidence: 99 },
      { name: "Due Date", value: "2026-07-15", confidence: 95 },
      { name: "PO Number", value: "PO-4422-19", confidence: 98 },
      { name: "Subtotal", value: "$12,480.00", confidence: 99 },
      { name: "Tax", value: "$748.80", confidence: 92 },
      { name: "Total Due", value: "$13,228.80", confidence: 99 },
      { name: "Remit-to ABA", value: "021000021", confidence: 88 },
      { name: "Remit-to Account", value: "**** 4419", confidence: 78 }
    ]
  },
  { id: "DOC-9002", name: "Allen_Marcus_W2_2025.pdf", type: "W2", classification: "IRS W-2 (employee tax)", classConfidence: 97.8, source: "loan-orig/upload", received: "06/05 09:02", pages: 1, status: "Pending Validation", route: "Lending > Loan Origination",
    fields: [
      { name: "Employee SSN", value: "***-**-4419", confidence: 96 },
      { name: "Employee Name", value: "Marcus J. Allen", confidence: 99 },
      { name: "Employer EIN", value: "84-2241099", confidence: 99 },
      { name: "Employer Name", value: "Globex Hosting Services", confidence: 98 },
      { name: "Box 1 Wages", value: "$92,140.00", confidence: 99 },
      { name: "Box 2 Federal Tax Withheld", value: "$18,022.00", confidence: 97 },
      { name: "Box 3 Social Security Wages", value: "$92,140.00", confidence: 99 },
      { name: "Tax Year", value: "2025", confidence: 100 }
    ]
  },
  { id: "DOC-9003", name: "Helios_COI_Acord25.pdf", type: "COI", classification: "Certificate of Insurance (ACORD 25)", classConfidence: 98.9, source: "vendor-portal/upload", received: "06/05 08:48", pages: 1, status: "Validated", route: "Vendor Risk > COI Monitor",
    fields: [
      { name: "Insured", value: "Helios Solar Components Ltd.", confidence: 99 },
      { name: "Producer", value: "Marsh & McLennan", confidence: 96 },
      { name: "Policy Number GL", value: "GL-44-2299-A", confidence: 95 },
      { name: "General Liability Limit", value: "$2,000,000", confidence: 99 },
      { name: "Workers Comp Limit", value: "Statutory", confidence: 92 },
      { name: "Expiration Date", value: "2026-04-18", confidence: 99 }
    ]
  },
  { id: "DOC-9004", name: "Coastline_Logistics_BOL_8814.pdf", type: "BOL", classification: "Bill of Lading", classConfidence: 96.4, source: "edi-fallback", received: "06/05 08:14", pages: 1, status: "Pending Validation", route: "Logistics > Dock Scheduler",
    fields: [
      { name: "BOL Number", value: "BOL-8814-99", confidence: 100 },
      { name: "Carrier", value: "Coastline Logistics LLC", confidence: 98 },
      { name: "SCAC", value: "CLCL", confidence: 92 },
      { name: "Origin", value: "Memphis, TN", confidence: 99 },
      { name: "Destination", value: "Phoenix, AZ", confidence: 99 },
      { name: "Weight", value: "18,420 lb", confidence: 96 },
      { name: "Pieces", value: "12", confidence: 99 },
      { name: "Ship Date", value: "2026-06-03", confidence: 98 }
    ]
  },
  { id: "DOC-9005", name: "Patient_EOB_Cigna_44012.pdf", type: "EOB", classification: "Explanation of Benefits (EOB)", classConfidence: 87.2, source: "patient-portal-upload", received: "06/05 07:55", pages: 3, status: "Low Confidence - Needs Review", route: "Patient Acct > Posting",
    fields: [
      { name: "Member ID", value: "U9921-4488", confidence: 92 },
      { name: "Payer", value: "Cigna PPO", confidence: 99 },
      { name: "Claim Number", value: "CLM-30099-A", confidence: 96 },
      { name: "Service Date", value: "2026-05-19", confidence: 98 },
      { name: "Billed Amount", value: "$1,884.00", confidence: 92 },
      { name: "Allowed Amount", value: "$1,124.00", confidence: 78 },
      { name: "Plan Paid", value: "$899.20", confidence: 64 },
      { name: "Patient Responsibility", value: "$224.80", confidence: 72 }
    ]
  },
  { id: "DOC-9006", name: "Stark-Mfg-Paystub-2026-05-30.pdf", type: "Paystub", classification: "Employee Paystub", classConfidence: 99.4, source: "loan-orig/upload", received: "06/05 07:18", pages: 1, status: "Validated", route: "Lending > Loan Origination",
    fields: [
      { name: "Employee Name", value: "Hannah Pierce", confidence: 99 },
      { name: "Employer", value: "Stark Manufacturing Group", confidence: 99 },
      { name: "Pay Period", value: "2026-05-17 to 2026-05-30", confidence: 98 },
      { name: "Gross Pay", value: "$2,730.00", confidence: 99 },
      { name: "Federal Tax", value: "$418.00", confidence: 97 },
      { name: "Net Pay", value: "$2,012.55", confidence: 99 },
      { name: "YTD Gross", value: "$32,824.00", confidence: 98 }
    ]
  },
  { id: "DOC-9007", name: "scan-unclassified-9921.pdf", type: "Unknown", classification: "Classifier uncertain", classConfidence: 42.1, source: "scanner-mfp-3F", received: "06/05 06:48", pages: 4, status: "Awaiting Classification", route: "(unrouted)",
    fields: []
  },
  { id: "DOC-9008", name: "Vertex_Cyber_SOC2_2026.pdf", type: "SOC 2", classification: "SOC 2 Type II Report", classConfidence: 95.6, source: "vendor-portal/upload", received: "06/04 19:42", pages: 78, status: "Pending Validation", route: "Vendor Risk > Risk Cockpit",
    fields: [
      { name: "Service Org", value: "Vertex Cyber Defense Inc.", confidence: 99 },
      { name: "Auditor", value: "Deloitte & Touche LLP", confidence: 97 },
      { name: "Report Period", value: "2025-04-01 to 2026-03-31", confidence: 98 },
      { name: "Report Type", value: "SOC 2 Type II", confidence: 99 },
      { name: "Trust Service Criteria", value: "Security, Availability, Confidentiality", confidence: 92 },
      { name: "Exceptions Noted", value: "2 (CC6.3, CC7.2)", confidence: 71 }
    ]
  }
];

function loadState() {
  try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.docs) return p; } } catch (e) {}
  const fresh = { docs: JSON.parse(JSON.stringify(DOCUMENTS)), selectedId: "DOC-9001", filter: "All", audit: [] };
  saveState(fresh); return fresh;
}
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

let STATE = loadState();
function pushAudit(msg) { STATE.audit.unshift({ ts: new Date().toLocaleTimeString(), msg }); if (STATE.audit.length > 50) STATE.audit = STATE.audit.slice(0, 50); }

function confidenceBadge(c) {
  const color = c >= 95 ? "success" : c >= 85 ? "info" : c >= 70 ? "warning" : "danger";
  return `<span class="badge badge-${color}">${c}%</span>`;
}
function statusBadge(s) {
  const m = { "Pending Validation": "warning", "Validated": "success", "Low Confidence - Needs Review": "danger", "Awaiting Classification": "secondary" };
  return `<span class="badge badge-${m[s] || "secondary"}">${esc(s)}</span>`;
}

function fakePdfViewer(doc) {
  return `
    <div style="background:#1d2733; padding:6px 10px; color:#cdd9e5; font-size:11px; display:flex; justify-content:space-between;">
      <span>${esc(doc.name)} - Page 1 of ${doc.pages}</span>
      <span>Zoom 100% | Rotate | Fit</span>
    </div>
    <div style="background:#525864; padding:14px; min-height:560px;">
      <div style="background:#fff; max-width:520px; margin:0 auto; min-height:540px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.4); font-family:'Times New Roman', serif; color:#222;">
        <div style="border-bottom:2px solid #333; padding-bottom:8px; margin-bottom:12px;">
          <div style="font-size:18px; font-weight:700;">${esc(doc.fields.find(f=>/vendor|employer|insured|carrier|service org|payer|employer name/i.test(f.name))?.value || doc.type)}</div>
          <div style="font-size:11px; color:#666;">${esc(doc.type)} document</div>
        </div>
        ${doc.fields.length ? doc.fields.map((f) => `
          <div style="display:flex; padding:4px 0; border-bottom:1px dotted #ccc; font-size:12px;">
            <div style="flex:0 0 180px; color:#666; font-style:italic;">${esc(f.name)}:</div>
            <div style="flex:1; font-weight:600;${f.confidence < 80 ? ' background:#fff3cd; padding:2px 4px;' : ''}">${esc(f.value)}</div>
          </div>`).join("") : `<div style="padding:40px; text-align:center; color:#999;">[scanned page contents - awaiting classification]</div>`}
        <div style="margin-top:30px; padding-top:10px; border-top:1px solid #ccc; font-size:9px; color:#999; text-align:center;">--- end of page 1 ---</div>
      </div>
    </div>
  `;
}

function renderShell() {
  const sel = STATE.docs.find((d) => d.id === STATE.selectedId) || STATE.docs[0];
  const filtered = STATE.docs.filter((d) => STATE.filter === "All" || d.status === STATE.filter);
  return `
    <div class="idp-shell">
      <nav class="navbar navbar-dark" style="background:linear-gradient(90deg,#1a237e 0%,#283593 100%);">
        <div class="container-fluid">
          <a class="navbar-brand font-weight-bold" href="#">
            <span style="background:#f57f17; padding:2px 8px; border-radius:4px; color:#fff;">IDP</span>
            Document Intelligence <span class="text-white-50 font-weight-normal">Studio</span>
          </a>
          <div class="d-flex align-items-center text-white-50">
            <span class="mr-3 small">Model: <strong class="text-white">v4.2 (Hyperscience Trio)</strong></span>
            <span class="mr-3 small">Queue: <strong class="text-white">${filtered.length}</strong></span>
            <button class="btn btn-sm btn-outline-light mr-2" data-action="help">App Context (?)</button>
            <span class="small">validator@contoso.com</span>
          </div>
        </div>
      </nav>

      <div class="container-fluid mt-3">
        <div class="row">
          <aside class="col-md-3">
            <div class="card shadow-sm mb-3">
              <div class="card-header bg-light"><strong>Inbox</strong></div>
              <div class="list-group list-group-flush">
                ${["All","Pending Validation","Low Confidence - Needs Review","Awaiting Classification","Validated"].map((f) => `<a href="#" class="list-group-item list-group-item-action ${STATE.filter === f ? "active" : ""}" data-filter="${esc(f)}">${esc(f)} <span class="badge badge-secondary float-right">${STATE.docs.filter((d)=>f==="All"||d.status===f).length}</span></a>`).join("")}
              </div>
            </div>
            <div class="card shadow-sm">
              <div class="card-header bg-light"><strong>Documents</strong></div>
              <div style="max-height:520px; overflow-y:auto;">
                ${filtered.map((d) => `
                  <div class="${STATE.selectedId === d.id ? "bg-primary text-white" : ""}" style="padding:8px 12px; border-bottom:1px solid #eee; cursor:pointer;" data-doc="${d.id}">
                    <div class="small"><strong>${esc(d.type)}</strong> &middot; ${esc(d.id)}</div>
                    <div style="font-size:11px; opacity:0.85; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(d.name)}</div>
                    <div class="small">${statusBadge(d.status)} ${confidenceBadge(d.classConfidence)}</div>
                  </div>`).join("")}
              </div>
            </div>
          </aside>

          <main class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-header d-flex justify-content-between align-items-center">
                <div><strong>${esc(sel.name)}</strong><div class="small text-muted">Source: ${esc(sel.source)} &middot; Received ${esc(sel.received)}</div></div>
                <div>${statusBadge(sel.status)}</div>
              </div>
              ${fakePdfViewer(sel)}
            </div>
          </main>

          <aside class="col-md-3">
            <div class="card shadow-sm mb-3">
              <div class="card-header bg-light"><strong>Classification</strong></div>
              <div class="card-body py-2">
                <div class="small text-muted">Predicted document type:</div>
                <div class="h6">${esc(sel.classification)}</div>
                <div>${confidenceBadge(sel.classConfidence)}</div>
                <hr/>
                <div class="small text-muted">Routing destination:</div>
                <div class="small"><strong>${esc(sel.route)}</strong></div>
              </div>
            </div>

            <div class="card shadow-sm">
              <div class="card-header bg-light d-flex justify-content-between align-items-center"><strong>Extracted Fields</strong><span class="badge badge-light">${sel.fields.length} fields</span></div>
              <div class="card-body p-0">
                ${sel.fields.length ? sel.fields.map((f, i) => `
                  <div style="padding:8px 12px; border-bottom:1px solid #eee;">
                    <div class="small text-muted">${esc(f.name)}</div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="${f.confidence < 80 ? 'text-warning' : ''}">${esc(f.value)}</span>
                      ${confidenceBadge(f.confidence)}
                    </div>
                    ${f.confidence < 90 ? `<button class="btn btn-sm btn-link p-0 small" data-validate="${i}">Validate</button>` : ""}
                  </div>`).join("") : `<div class="p-3 text-center text-muted">No fields extracted yet. Run classifier first.</div>`}
              </div>
            </div>

            <div class="mt-3">
              ${sel.status === "Awaiting Classification" ? `<button class="btn btn-warning btn-block" data-action="classify">Run Classifier</button>` : ""}
              <button class="btn btn-success btn-block" data-action="validate-all">Validate All Fields &amp; Route Downstream</button>
              <button class="btn btn-outline-secondary btn-block" data-action="train">Mark for Classifier Retraining</button>
            </div>
          </aside>
        </div>

        <div class="row mt-3">
          <div class="col">
            <div class="card shadow-sm">
              <div class="card-header"><strong>IDP Bot Audit Trail</strong></div>
              <ul class="list-group list-group-flush" style="max-height:180px;overflow:auto;">
                ${(STATE.audit.length ? STATE.audit.slice(0, 12) : [{ ts: new Date().toLocaleTimeString(), msg: "No actions yet. Click 'Validate' on low-confidence fields or 'Validate All' to route downstream." }]).map((a) => `<li class="list-group-item py-1 small"><span class="text-muted mr-2">${esc(a.ts)}</span> ${esc(a.msg)}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>
        <footer class="mt-3 mb-3 text-center text-muted small">Document Intelligence Studio v4.2 &middot; Hyperscience Trio model &middot; 99.1% straight-through this week</footer>
      </div>
    </div>
  `;
}

function openHelp() {
  const o = document.createElement("div");
  o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;";
  o.innerHTML = `<div style="background:#fff;max-width:760px;border-radius:6px;"><div style="padding:14px 18px;border-bottom:1px solid #e2e6ea;font-weight:600;">App Context &mdash; Document Intelligence Studio</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #e2e6ea;text-align:right;"><button class="btn btn-primary btn-sm" id="ip-mc">Close</button></div></div>`;
  document.body.appendChild(o); o.addEventListener("click", (e) => { if (e.target === o) o.remove(); });
  document.getElementById("ip-mc").onclick = () => o.remove();
}

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-doc]").forEach((r) => r.addEventListener("click", () => { STATE.selectedId = r.dataset.doc; saveState(STATE); render(); }));
  document.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); STATE.filter = b.dataset.filter; saveState(STATE); render(); }));
  document.querySelectorAll("[data-validate]").forEach((b) => b.addEventListener("click", () => {
    const i = parseInt(b.dataset.validate, 10);
    const sel = STATE.docs.find((d) => d.id === STATE.selectedId);
    if (sel && sel.fields[i]) { sel.fields[i].confidence = 100; pushAudit(`[${sel.id}] Human validated field '${sel.fields[i].name}' -> 100%`); saveState(STATE); render(); }
  }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.action;
    const sel = STATE.docs.find((d) => d.id === STATE.selectedId);
    if (a === "help") openHelp();
    else if (a === "validate-all" && sel) { sel.fields.forEach((f) => f.confidence = 100); sel.status = "Validated"; pushAudit(`[${sel.id}] All fields validated. Routed to ${sel.route}`); saveState(STATE); render(); }
    else if (a === "train" && sel) { pushAudit(`[${sel.id}] Marked for classifier retraining (model v4.3 batch)`); saveState(STATE); render(); }
    else if (a === "classify" && sel) {
      sel.classification = "Invoice (vendor) [auto-classified]"; sel.classConfidence = 88.4;
      sel.fields = [{ name: "Document Type", value: "Invoice", confidence: 88 }, { name: "Detected Pages", value: String(sel.pages), confidence: 100 }];
      sel.status = "Pending Validation"; sel.route = "AP > Payable Batch Uploader";
      pushAudit(`[${sel.id}] Classifier ran -> Invoice (88.4%)`);
      saveState(STATE); render();
    }
  }));
}
render();
