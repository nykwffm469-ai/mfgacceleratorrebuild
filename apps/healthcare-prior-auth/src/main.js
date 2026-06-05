const KEY = "ehr-pa";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - EHR Prior Authorization Queue

EHR Prior Authorization Queue is the worklist that medical-office staff, financial counselors, and prior-auth specialists work every day to obtain payer approval before scheduled procedures and high-cost medications. Common usage includes opening the queue, reviewing patient and order context, verifying eligibility, locating the payer's medical-necessity criteria, gathering clinical documentation (chart notes, imaging, labs), submitting via payer portal or fax, and following up daily until determination.

This experience is inspired by Epic Resolute Prior Authorization, Cerner Charge Services, Availity, ChangeHealthcare InterQual, and the proprietary payer portals (Aetna Availity, UHC OptumRx, CVS Caremark) that staff still log into one at a time. Potential RPA use cases include automated eligibility verification (270/271 EDI), CPT/ICD-10 code validation, payer-portal screen scraping where no real API exists, attaching clinical documentation, status polling, denial reason extraction, peer-to-peer appeal scheduling, and SLA monitoring on outstanding authorizations.`;

const QUEUE = [
  { id: "PA-44120", patient: "MARCUS J ALLEN", mrn: "MRN-441-2299", dob: "1986-03-14", payer: "Aetna PPO", procedure: "MRI Lumbar Spine w/o Contrast", cpt: "72148", icd: "M54.16", provider: "Dr. Hannah Pierce", urgency: "Routine", scheduled: "2026-06-12", status: "Pending Submission", aiScore: 92, route: "ePA - Availity" },
  { id: "PA-44119", patient: "JENNA WHITFIELD", mrn: "MRN-441-2300", dob: "1991-08-22", payer: "BCBS PPO", procedure: "Cardiac CT Angiography", cpt: "75574", icd: "I20.9", provider: "Dr. Robert Chen", urgency: "Routine", scheduled: "2026-06-14", status: "Submitted", aiScore: 88, route: "ePA - Availity" },
  { id: "PA-44118", patient: "DIEGO ROMERO", mrn: "MRN-441-2301", dob: "1978-11-30", payer: "Cigna HMO", procedure: "Knee Arthroscopy", cpt: "29881", icd: "M23.301", provider: "Dr. Tom Jackson", urgency: "Routine", scheduled: "2026-06-22", status: "Approved", aiScore: 96, route: "ePA - Availity", authNumber: "AUTH-9921-44A" },
  { id: "PA-44117", patient: "PRIYA SHANKAR", mrn: "MRN-441-2302", dob: "1982-04-05", payer: "UnitedHealthcare", procedure: "Specialty Drug: Humira 40mg", cpt: "J0135", icd: "L40.50", provider: "Dr. Sarah Parker", urgency: "Routine", scheduled: "2026-06-30", status: "Pending Clinical Docs", aiScore: 74, route: "OptumRx Portal" },
  { id: "PA-44116", patient: "ROBERT CHEN", mrn: "MRN-441-2303", dob: "1965-09-18", payer: "Medicare Advantage Aetna", procedure: "Bone Density Scan (DEXA)", cpt: "77080", icd: "M81.0", provider: "Dr. Maria Diaz", urgency: "Routine", scheduled: "2026-07-08", status: "Denied", aiScore: 41, route: "ePA - Availity", denialReason: "Medical necessity not established; appeal eligible" },
  { id: "PA-44115", patient: "AISHA MOHAMED", mrn: "MRN-441-2304", dob: "1988-12-02", payer: "BCBS HMO", procedure: "Sleep Study (in-lab)", cpt: "95810", icd: "G47.33", provider: "Dr. Liam OBrien", urgency: "Urgent", scheduled: "2026-06-08", status: "Pending Submission", aiScore: 84, route: "ePA - Availity" },
  { id: "PA-44114", patient: "HANNAH PIERCE", mrn: "MRN-441-2305", dob: "1979-07-19", payer: "Cigna PPO", procedure: "Pet Scan - Oncology", cpt: "78815", icd: "C50.911", provider: "Dr. Tom Jackson", urgency: "STAT", scheduled: "2026-06-06", status: "Approved", aiScore: 99, route: "ePA - Availity", authNumber: "AUTH-9914-22B" },
  { id: "PA-44113", patient: "TOM JACKSON", mrn: "MRN-441-2306", dob: "1972-02-11", payer: "Aetna PPO", procedure: "Colonoscopy w/ Polypectomy", cpt: "45385", icd: "Z12.11", provider: "Dr. Robert Chen", urgency: "Routine", scheduled: "2026-07-15", status: "Submitted", aiScore: 91, route: "ePA - Availity" }
];

function loadState() { try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.queue) return p; } } catch (e) {} const f = { queue: QUEUE, selectedId: "PA-44120", filter: "All" }; saveState(f); return f; }
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
let STATE = loadState();

function statusBadge(s) { const m = { "Approved": "#0a8a2c", "Denied": "#c93131", "Submitted": "#0b6cab", "Pending Submission": "#cc6600", "Pending Clinical Docs": "#7a4f9c" }; return `<span style="background:${m[s]||"#5a7a85"};color:#fff;padding:3px 10px;border-radius:3px;font-size:11px;font-weight:600;">${esc(s)}</span>`; }
function urg(u) { const m = { "STAT": "#c93131", "Urgent": "#cc6600", "Routine": "#5a7a85" }; return `<span style="background:${m[u]||"#5a7a85"};color:#fff;padding:1px 8px;border-radius:3px;font-size:10px;font-weight:600;">${esc(u)}</span>`; }

function renderShell() {
  const sel = STATE.queue.find((q) => q.id === STATE.selectedId);
  const filtered = STATE.queue.filter((q) => STATE.filter === "All" || q.status === STATE.filter);
  return `
    <div style="min-height:100vh;display:flex;flex-direction:column;">
      <header style="background:#0a2342;color:#fff;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;">
        <div><strong>&#9877; ContosoHealth EHR</strong> <span style="opacity:0.7;">| Prior Authorization Queue</span></div>
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="font-size:11px;opacity:0.85;">Logged in as: <strong>pa.specialist@contosohealth.org</strong></span>
          <button data-action="help" style="background:#0a8a2c;color:#fff;border:0;padding:5px 12px;border-radius:3px;cursor:pointer;font-size:11px;">App Context (?)</button>
          <a href="../" style="color:#fff;text-decoration:none;font-size:11px;">Main</a>
        </div>
      </header>

      <div style="background:#0b6cab;color:#fff;padding:8px 20px;font-size:11px;display:flex;gap:18px;">
        ${["Worklist","Patient","Encounter","Orders","Authorizations","Claims","Reporting"].map((t,i)=>`<a href="#" style="color:${i===4?"#ffd24a":"#cce4ff"};text-decoration:none;font-weight:${i===4?700:400};border-bottom:${i===4?"2px solid #ffd24a":"none"};padding-bottom:2px;">${t}</a>`).join("")}
      </div>

      <div style="flex:1;display:grid;grid-template-columns:260px 1fr 340px;background:#fff;">
        <aside style="border-right:1px solid #d0d7de;background:#f7fafc;">
          <div style="padding:8px 12px;border-bottom:1px solid #d0d7de;font-weight:700;">Worklist Filters</div>
          ${["All","Pending Submission","Pending Clinical Docs","Submitted","Approved","Denied"].map((f) => `<a href="#" data-filter="${esc(f)}" style="display:block;padding:7px 12px;border-bottom:1px solid #ececec;color:${STATE.filter===f?"#fff":"#0a2342"};background:${STATE.filter===f?"#0b6cab":"transparent"};text-decoration:none;font-size:12px;">${esc(f)} <span style="float:right;opacity:0.75;">${STATE.queue.filter((q)=>f==="All"||q.status===f).length}</span></a>`).join("")}
          <div style="padding:14px 12px;font-size:11px;color:#5a6772;border-top:1px solid #d0d7de;">
            <strong>Queue stats today</strong><br/>
            Total: ${STATE.queue.length}<br/>
            Auto-submitted by bot: <strong>${STATE.queue.filter((q)=>q.aiScore>=90).length}</strong><br/>
            SLA at risk: <strong>${STATE.queue.filter((q)=>q.urgency==="STAT"||q.urgency==="Urgent").length}</strong>
          </div>
        </aside>

        <main style="overflow:auto;">
          <div style="padding:12px;border-bottom:1px solid #d0d7de;background:#f7fafc;display:flex;justify-content:space-between;">
            <span><strong>${filtered.length}</strong> authorizations shown</span>
            <button style="background:#0a8a2c;color:#fff;border:0;padding:5px 12px;border-radius:3px;cursor:pointer;font-size:11px;">+ New Auth</button>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead style="background:#e6edf3;font-size:11px;">
              <tr><th style="text-align:left;padding:6px 10px;">Auth ID</th><th style="text-align:left;padding:6px 10px;">Patient / MRN</th><th style="text-align:left;padding:6px 10px;">Procedure</th><th style="text-align:left;padding:6px 10px;">Payer</th><th style="text-align:left;padding:6px 10px;">Sched</th><th style="text-align:left;padding:6px 10px;">Urg</th><th style="text-align:left;padding:6px 10px;">Status</th><th style="text-align:right;padding:6px 10px;">AI Score</th></tr>
            </thead>
            <tbody>${filtered.map((q) => `
              <tr data-pa="${q.id}" style="border-bottom:1px solid #f0f3f6;cursor:pointer;${STATE.selectedId===q.id?"background:#fff8d8;":""}">
                <td style="padding:8px 10px;color:#0b6cab;font-weight:600;">${esc(q.id)}</td>
                <td style="padding:8px 10px;"><div><strong>${esc(q.patient)}</strong></div><div style="font-size:11px;color:#5a6772;">${esc(q.mrn)} &middot; DOB ${esc(q.dob)}</div></td>
                <td style="padding:8px 10px;"><div>${esc(q.procedure)}</div><div style="font-size:11px;color:#5a6772;">CPT ${esc(q.cpt)} / ICD-10 ${esc(q.icd)}</div></td>
                <td style="padding:8px 10px;">${esc(q.payer)}</td>
                <td style="padding:8px 10px;">${esc(q.scheduled)}</td>
                <td style="padding:8px 10px;">${urg(q.urgency)}</td>
                <td style="padding:8px 10px;">${statusBadge(q.status)}</td>
                <td style="padding:8px 10px;text-align:right;color:${q.aiScore>=90?"#0a8a2c":q.aiScore>=70?"#cc6600":"#c93131"};font-weight:700;">${q.aiScore}%</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </main>

        <aside style="border-left:1px solid #d0d7de;background:#f7fafc;padding:14px;overflow:auto;">
          ${sel ? `
            <div style="background:#fff;border:1px solid #d0d7de;padding:12px;border-radius:4px;margin-bottom:12px;">
              <div style="font-size:11px;color:#5a6772;">Patient</div>
              <div style="font-weight:700;font-size:14px;">${esc(sel.patient)}</div>
              <div style="font-size:11px;color:#5a6772;">${esc(sel.mrn)} &middot; DOB ${esc(sel.dob)}</div>
              <hr style="border-color:#ececec;"/>
              <table style="width:100%;font-size:12px;">
                <tr><td style="color:#5a6772;width:40%;padding:2px 0;">Auth ID</td><td><strong>${esc(sel.id)}</strong></td></tr>
                <tr><td style="color:#5a6772;padding:2px 0;">Payer</td><td>${esc(sel.payer)}</td></tr>
                <tr><td style="color:#5a6772;padding:2px 0;">Provider</td><td>${esc(sel.provider)}</td></tr>
                <tr><td style="color:#5a6772;padding:2px 0;">Procedure</td><td>${esc(sel.procedure)}</td></tr>
                <tr><td style="color:#5a6772;padding:2px 0;">CPT</td><td><code>${esc(sel.cpt)}</code></td></tr>
                <tr><td style="color:#5a6772;padding:2px 0;">ICD-10</td><td><code>${esc(sel.icd)}</code></td></tr>
                <tr><td style="color:#5a6772;padding:2px 0;">Scheduled</td><td>${esc(sel.scheduled)}</td></tr>
                <tr><td style="color:#5a6772;padding:2px 0;">Urgency</td><td>${urg(sel.urgency)}</td></tr>
                <tr><td style="color:#5a6772;padding:2px 0;">Status</td><td>${statusBadge(sel.status)}</td></tr>
                ${sel.authNumber ? `<tr><td style="color:#5a6772;padding:2px 0;">Auth #</td><td><strong>${esc(sel.authNumber)}</strong></td></tr>` : ""}
                ${sel.denialReason ? `<tr><td style="color:#5a6772;padding:2px 0;">Denial</td><td style="color:#c93131;">${esc(sel.denialReason)}</td></tr>` : ""}
              </table>
            </div>

            <div style="background:linear-gradient(135deg,#0a8a2c 0%,#067a23 100%);color:#fff;padding:12px;border-radius:6px;margin-bottom:12px;">
              <div style="font-size:11px;text-transform:uppercase;opacity:0.85;">&#129302; RPA Bot Recommendation</div>
              <div style="margin-top:4px;font-size:12px;line-height:1.4;">${sel.aiScore >= 90 ? `Auto-submit eligible. Bot can submit to ${esc(sel.route)} in &lt;30 seconds with 92% success rate.` : sel.aiScore >= 70 ? `Documentation gap detected. Bot recommends collecting chart notes before submission.` : `Auto-decision unlikely. Recommend peer-to-peer review or appeal pathway.`}</div>
              <button data-action="bot-submit" style="background:#fff;color:#0a8a2c;border:0;padding:6px 12px;border-radius:3px;margin-top:8px;font-weight:600;cursor:pointer;font-size:11px;">${sel.aiScore >= 90 ? "Run Bot Submission" : "Open Review"}</button>
            </div>

            <div style="background:#fff;border:1px solid #d0d7de;padding:12px;border-radius:4px;">
              <div style="font-weight:700;font-size:11px;text-transform:uppercase;color:#5a6772;margin-bottom:8px;">Clinical Documentation</div>
              ${[
                { doc:"Chart note - 2026-05-28", ok:true },
                { doc:"X-ray report - 2026-05-30", ok:true },
                { doc:"Conservative therapy 6+ weeks documented", ok:sel.aiScore>=85 },
                { doc:"Payer medical-necessity criteria matched", ok:sel.aiScore>=90 }
              ].map((d) => `<div style="padding:4px 0;border-bottom:1px dotted #ececec;font-size:11px;">${d.ok?"&#10003;":"&#10007;"} ${esc(d.doc)} <span style="color:${d.ok?"#0a8a2c":"#c93131"};float:right;">${d.ok?"OK":"missing"}</span></div>`).join("")}
            </div>
          ` : ""}
        </aside>
      </div>
    </div>
  `;
}

function openHelp() { const o = document.createElement("div"); o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;"; o.innerHTML = `<div style="background:#fff;max-width:760px;border-radius:6px;"><div style="padding:14px 18px;border-bottom:1px solid #e2e6ea;font-weight:600;">App Context</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #e2e6ea;text-align:right;"><button id="hc" style="background:#0a2342;color:#fff;border:0;padding:6px 14px;border-radius:4px;cursor:pointer;">Close</button></div></div>`; document.body.appendChild(o); o.onclick = (e) => { if (e.target === o) o.remove(); }; document.getElementById("hc").onclick = () => o.remove(); }

function render() {
  document.getElementById("app").innerHTML = renderShell();
  document.querySelectorAll("[data-pa]").forEach((r) => r.addEventListener("click", () => { STATE.selectedId = r.dataset.pa; saveState(STATE); render(); }));
  document.querySelectorAll("[data-filter]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); STATE.filter = a.dataset.filter; saveState(STATE); render(); }));
  document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.action;
    const sel = STATE.queue.find((q) => q.id === STATE.selectedId);
    if (a === "help") openHelp();
    else if (a === "bot-submit" && sel) { if (sel.aiScore >= 90) { sel.status = "Submitted"; sel.authNumber = "PEND-" + Math.floor(Math.random()*900000+100000); } saveState(STATE); render(); }
  }));
}
render();
