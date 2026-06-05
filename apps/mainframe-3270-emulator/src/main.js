const KEY = "tn3270-claims";

const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - Mainframe 3270 Claims Terminal

Mainframe 3270 Claims Terminal is a TN3270 emulator-style interface to a CICS application that property and casualty insurance claims adjusters, customer-service reps, and back-office processors use every day. Common usage includes looking up a policy or claim by number, navigating with PF (function) keys (PF3 to exit, PF7/PF8 to page up/down, PF5 to search, PF12 to cancel), entering claim notes, adjudicating reserves, and authorizing payment. The screens are dense, keyboard-first, and unchanged in look since the 1980s because that's how the actual systems still operate inside many Fortune 500 carriers.

This experience is inspired by IBM TN3270 / 5250, Hogan, CSC Vantage, Guidewire ClaimCenter legacy hosts, and the CICS / IMS green-screen apps that still run banking core, insurance claims, hospital ADT, airline reservations, and government benefits systems. Potential RPA use cases include screen-scrape data integration where no API exists, surrogate-field automation using terminal coordinates rather than DOM IDs, automated claim status lookups against legacy hosts, batch reconciliation of payment files, account-balance retrieval for digital banking front ends, automated 24x7 monitoring scripts, and front-end modernization where an RPA bot becomes the integration layer between legacy CICS and modern microservices.`;

const CLAIMS = [
  { id: "CLM-2026-441998", policy: "POL-984412", claimant: "ALLEN, MARCUS J", losDate: "2026-05-12", status: "PENDING ADJUDICATION", reserve: 4250, paid: 0, type: "AUTO COLLISION", adjuster: "S.PARKER", lastNote: "PHOTOS RECEIVED; AWAITING APPRAISAL" },
  { id: "CLM-2026-441997", policy: "POL-771203", claimant: "WHITFIELD, JENNA", losDate: "2026-05-04", status: "OPEN-INVESTIGATING", reserve: 18400, paid: 2200, type: "HOMEOWNERS LOSS", adjuster: "L.KIM", lastNote: "FIELD INSPECTION SCHEDULED 06/08" },
  { id: "CLM-2026-441996", policy: "POL-220114", claimant: "ROMERO, DIEGO", losDate: "2026-04-22", status: "PAID-CLOSED", reserve: 0, paid: 8810, type: "AUTO COLLISION", adjuster: "S.PARKER", lastNote: "FINAL PAYMENT ISSUED 05/30" },
  { id: "CLM-2026-441995", policy: "POL-664422", claimant: "SHANKAR, PRIYA", losDate: "2026-04-19", status: "OPEN-ADJUSTING", reserve: 3200, paid: 0, type: "AUTO COMPREHENSIVE", adjuster: "M.HARRIS", lastNote: "POLICY COVERAGE CONFIRMED" },
  { id: "CLM-2026-441994", policy: "POL-541009", claimant: "CHEN, ROBERT", losDate: "2026-04-11", status: "PAID-CLOSED", reserve: 0, paid: 14200, type: "HOMEOWNERS LOSS", adjuster: "L.KIM", lastNote: "PAYMENT ISSUED 05/18; CLOSED" },
  { id: "CLM-2026-441993", policy: "POL-882140", claimant: "MOHAMED, AISHA", losDate: "2026-03-30", status: "DENIED", reserve: 0, paid: 0, type: "AUTO COLLISION", adjuster: "S.PARKER", lastNote: "DENIED-POLICY LAPSED 03/22" }
];

function loadState() {
  try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); if (p && p.claims) return p; } } catch (e) {}
  const fresh = { claims: JSON.parse(JSON.stringify(CLAIMS)), screen: "logon", session: "TSO0014", lu: "L77TCP14", appl: "CICSPROD", claimId: "", searchKey: "", msg: " READY                                                            ", noteBuffer: "", payAmount: "" };
  saveState(fresh); return fresh;
}
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function pad(s, n, c) { s = String(s == null ? "" : s); c = c || " "; while (s.length < n) s += c; return s.length > n ? s.substring(0, n) : s; }
function padL(s, n, c) { s = String(s == null ? "" : s); c = c || " "; while (s.length < n) s = c + s; return s.length > n ? s.substring(s.length - n, s.length) : s; }
function fmt$(n) { return "$" + Number(n || 0).toLocaleString("en-US"); }
function center(s, n) { const pad = Math.floor((n - s.length) / 2); return " ".repeat(Math.max(0, pad)) + s + " ".repeat(Math.max(0, n - s.length - pad)); }

let STATE = loadState();

const HEADER_LINE = (title) => `   ${pad(title, 60)}  ${pad("CICS APPL " + STATE.appl, 12)}`;

function screenLogon() {
  return [
    "                                                                                ",
    "                  CICS LOGON SCREEN          " + new Date().toLocaleString(),
    "                                                                                ",
    "                  +---------------------------------------+",
    "                  |                                       |",
    "                  |    CONTOSO INSURANCE CICS REGION     |",
    "                  |                                       |",
    "                  |    APPLID  ===>  " + pad(STATE.appl, 16) + "        |",
    "                  |    LU NAME ===>  " + pad(STATE.lu, 16) + "        |",
    "                  |    USERID  ===>  TSO0014_              |",
    "                  |    PASSWRD ===>  ********              |",
    "                  |                                       |",
    "                  |    Press ENTER to logon               |",
    "                  |                                       |",
    "                  +---------------------------------------+",
    "                                                                                ",
    "                                                                                ",
    "                                                                                ",
    "                                                                                ",
    "                                                                                ",
    "                                                                                ",
    " " + STATE.msg
  ].join("\n");
}

function screenMenu() {
  return [
    HEADER_LINE("CICS - CLAIMS MAIN MENU"),
    "                                                                                ",
    "   +--------------------------------------------------------------------------+",
    "   |                                                                          |",
    "   |   1 ====> CLM SEARCH         Search and display claim records            |",
    "   |   2 ====> POL SEARCH         Search and display policy records           |",
    "   |   3 ====> CLM ENTRY          Create a new claim (FNOL)                   |",
    "   |   4 ====> CLM PAY            Authorize payment on a claim                |",
    "   |   5 ====> CLM RESV           Reserve adjustment                          |",
    "   |   6 ====> CLM NOTE           Add note to claim file                      |",
    "   |   7 ====> REPORTS            Daily, weekly, statutory reporting          |",
    "   |   X ====> EXIT               Sign off CICS region                        |",
    "   |                                                                          |",
    "   |   COMMAND ===> _                                                         |",
    "   |                                                                          |",
    "   +--------------------------------------------------------------------------+",
    "                                                                                ",
    "   PF1 HELP   PF3 EXIT   PF5 SRCH   PF7 UP     PF8 DN     PF10 MENU            ",
    "                                                                                ",
    "   SESSION " + STATE.session + "    LU " + STATE.lu + "    " + new Date().toLocaleString(),
    "                                                                                ",
    "                                                                                ",
    " " + STATE.msg
  ].join("\n");
}

function screenSearch() {
  const filtered = STATE.searchKey ? STATE.claims.filter((c) => c.id.includes(STATE.searchKey.toUpperCase()) || c.policy.includes(STATE.searchKey.toUpperCase()) || c.claimant.includes(STATE.searchKey.toUpperCase())) : STATE.claims;
  const rows = filtered.slice(0, 10).map((c, i) => `   ${pad(String(i+1), 3)} ${pad(c.id, 18)} ${pad(c.policy, 12)} ${pad(c.claimant, 22)} ${pad(c.type, 18)}`);
  while (rows.length < 10) rows.push("                                                                            ");
  return [
    HEADER_LINE("CICS - CLAIM SEARCH"),
    "                                                                                ",
    "   SEARCH KEY ===> " + pad(STATE.searchKey + "_", 30) + "  (CLM#, POL#, OR CLAIMANT)",
    "                                                                                ",
    "   NUM CLAIM NO           POLICY       CLAIMANT               TYPE",
    "   --- ------------------ ------------ ---------------------- ------------------",
    ...rows,
    "                                                                                ",
    "   ROWS DISPLAYED: " + pad(String(filtered.length), 4) + "    TYPE NUMBER + ENTER TO OPEN CLAIM",
    "                                                                                ",
    "   CMD ===> _                                                                   ",
    "                                                                                ",
    "   PF1 HELP   PF3 RETURN  PF5 NEW SRCH PF7 UP  PF8 DN  PF12 CANCEL              ",
    " " + STATE.msg
  ].join("\n");
}

function screenClaim() {
  const c = STATE.claims.find((x) => x.id === STATE.claimId) || STATE.claims[0];
  return [
    HEADER_LINE("CICS - CLAIM RECORD DETAIL"),
    "                                                                                ",
    "   CLAIM NO    : " + pad(c.id, 22) + "STATUS      : " + pad(c.status, 22),
    "   POLICY NO   : " + pad(c.policy, 22) + "DOL         : " + pad(c.losDate, 22),
    "   CLAIMANT    : " + pad(c.claimant, 22) + "TYPE        : " + pad(c.type, 22),
    "   ADJUSTER    : " + pad(c.adjuster, 22) + "                                  ",
    "                                                                                ",
    "   --- FINANCIAL ---                                                            ",
    "   RESERVE     : " + padL(fmt$(c.reserve), 14) + "      PAID         : " + padL(fmt$(c.paid), 14),
    "   OUTSTANDING : " + padL(fmt$(c.reserve - c.paid), 14),
    "                                                                                ",
    "   --- LATEST NOTE ---                                                          ",
    "   " + pad(c.lastNote, 75),
    "                                                                                ",
    "   COMMAND ===> _                                                               ",
    "                                                                                ",
    "   ACTIONS:                                                                     ",
    "      6 ===> ADD NOTE      4 ===> AUTH PAYMENT     5 ===> ADJUST RESERVE        ",
    "                                                                                ",
    "   PF1 HELP   PF3 RETURN   PF6 NOTE   PF4 PAY   PF5 RESV   PF12 CANCEL         ",
    " " + STATE.msg
  ].join("\n");
}

function screenNote() {
  const c = STATE.claims.find((x) => x.id === STATE.claimId);
  return [
    HEADER_LINE("CICS - ADD CLAIM NOTE"),
    "                                                                                ",
    "   CLAIM NO    : " + (c ? c.id : ""),
    "   CLAIMANT    : " + (c ? c.claimant : ""),
    "                                                                                ",
    "   NOTE TEXT (75 CHAR MAX):                                                     ",
    "   " + pad(STATE.noteBuffer + "_", 75),
    "                                                                                ",
    "   PRESS ENTER TO SAVE NOTE  -  PF3 TO CANCEL                                   ",
    "                                                                                ",
    "                                                                                ",
    "   PF1 HELP   PF3 RETURN   PF12 CANCEL                                          ",
    " " + STATE.msg
  ].join("\n");
}

function screenPay() {
  const c = STATE.claims.find((x) => x.id === STATE.claimId);
  return [
    HEADER_LINE("CICS - AUTHORIZE PAYMENT"),
    "                                                                                ",
    "   CLAIM NO    : " + (c ? c.id : ""),
    "   CLAIMANT    : " + (c ? c.claimant : ""),
    "   CURRENT RESERVE: " + (c ? fmt$(c.reserve) : "") + "    PAID TO DATE: " + (c ? fmt$(c.paid) : ""),
    "                                                                                ",
    "   PAYMENT AMOUNT (USD, NO COMMAS) ===> " + pad(STATE.payAmount + "_", 14),
    "   PAYEE                            ===> " + (c ? pad(c.claimant, 30) : ""),
    "                                                                                ",
    "   PRESS ENTER TO AUTHORIZE  -  AMOUNT MUST NOT EXCEED RESERVE                  ",
    "                                                                                ",
    "                                                                                ",
    "                                                                                ",
    "   PF1 HELP   PF3 RETURN   PF12 CANCEL                                          ",
    " " + STATE.msg
  ].join("\n");
}

function screenSignoff() {
  return [
    "                                                                                ",
    "                                                                                ",
    "                                                                                ",
    "                  +---------------------------------------+",
    "                  |                                       |",
    "                  |          CICS REGION CICSPROD         |",
    "                  |                                       |",
    "                  |       USER TSO0014 SIGNED OFF         |",
    "                  |                                       |",
    "                  |   Press ENTER to logon again          |",
    "                  |                                       |",
    "                  +---------------------------------------+",
    "                                                                                ",
    " " + STATE.msg
  ].join("\n");
}

function activeScreen() {
  if (STATE.screen === "logon" || STATE.screen === "signoff") return STATE.screen === "logon" ? screenLogon() : screenSignoff();
  if (STATE.screen === "menu") return screenMenu();
  if (STATE.screen === "search") return screenSearch();
  if (STATE.screen === "claim") return screenClaim();
  if (STATE.screen === "note") return screenNote();
  if (STATE.screen === "pay") return screenPay();
  return "";
}

function setMsg(m) { STATE.msg = m; }

function handleEnter() {
  if (STATE.screen === "logon") { STATE.screen = "menu"; setMsg("LOGON ACCEPTED. WELCOME TO " + STATE.appl); }
  else if (STATE.screen === "menu") {
    const v = (document.getElementById("tn-input").value || "").trim().toUpperCase();
    if (v === "1") { STATE.screen = "search"; setMsg("ENTER SEARCH KEY"); }
    else if (v === "5") { STATE.screen = "search"; setMsg("ENTER SEARCH KEY"); }
    else if (v === "4" || v === "6") { setMsg("YOU MUST SELECT A CLAIM FIRST. USE OPTION 1."); }
    else if (v === "X") { STATE.screen = "signoff"; setMsg("SIGNED OFF"); }
    else { setMsg("UNKNOWN COMMAND " + v + " - ENTER 1, 2, 3, 4, 5, 6, 7, OR X"); }
  }
  else if (STATE.screen === "search") {
    const v = (document.getElementById("tn-input").value || "").trim().toUpperCase();
    if (/^\d+$/.test(v)) {
      const i = parseInt(v, 10) - 1;
      const filtered = STATE.searchKey ? STATE.claims.filter((c) => c.id.includes(STATE.searchKey.toUpperCase()) || c.policy.includes(STATE.searchKey.toUpperCase()) || c.claimant.includes(STATE.searchKey.toUpperCase())) : STATE.claims;
      const c = filtered[i];
      if (c) { STATE.claimId = c.id; STATE.screen = "claim"; setMsg("CLAIM " + c.id + " LOADED"); }
      else setMsg("ROW NUMBER OUT OF RANGE");
    } else {
      STATE.searchKey = v; setMsg("SEARCH KEY APPLIED: " + (v || "(NONE)"));
    }
  }
  else if (STATE.screen === "claim") {
    const v = (document.getElementById("tn-input").value || "").trim().toUpperCase();
    if (v === "4") { STATE.screen = "pay"; STATE.payAmount = ""; setMsg("ENTER PAYMENT AMOUNT"); }
    else if (v === "5") { setMsg("RESERVE ADJUSTMENT NOT IMPLEMENTED IN DEMO"); }
    else if (v === "6") { STATE.screen = "note"; STATE.noteBuffer = ""; setMsg("ENTER NOTE TEXT"); }
    else setMsg("UNKNOWN COMMAND " + v + " - USE 4 (PAY), 5 (RESV), 6 (NOTE) OR PF3 TO RETURN");
  }
  else if (STATE.screen === "note") {
    const c = STATE.claims.find((x) => x.id === STATE.claimId);
    if (c) { c.lastNote = STATE.noteBuffer.toUpperCase() || "(EMPTY NOTE)"; STATE.noteBuffer = ""; STATE.screen = "claim"; setMsg("NOTE ADDED TO " + c.id); }
  }
  else if (STATE.screen === "pay") {
    const c = STATE.claims.find((x) => x.id === STATE.claimId);
    const amt = parseFloat(STATE.payAmount || "0");
    if (!c) { setMsg("NO CLAIM SELECTED"); }
    else if (!amt || amt <= 0) { setMsg("INVALID AMOUNT"); }
    else if (amt > (c.reserve - c.paid)) { setMsg("AMOUNT EXCEEDS REMAINING RESERVE - SUPERVISOR OVERRIDE REQUIRED"); }
    else {
      c.paid += amt;
      if (c.paid >= c.reserve) { c.status = "PAID-CLOSED"; c.lastNote = "FINAL PAYMENT " + fmt$(amt) + " ISSUED"; }
      else { c.lastNote = "PARTIAL PAYMENT " + fmt$(amt) + " ISSUED"; }
      STATE.screen = "claim"; STATE.payAmount = "";
      setMsg("PAYMENT " + fmt$(amt) + " AUTHORIZED FOR " + c.id);
    }
  }
  else if (STATE.screen === "signoff") {
    STATE.screen = "logon"; setMsg("RECONNECTING...");
  }
  saveState(STATE); render();
}

function pf(key) {
  if (key === 3) {
    if (STATE.screen === "claim" || STATE.screen === "search") { STATE.screen = "menu"; setMsg("RETURNED TO MAIN MENU"); }
    else if (STATE.screen === "note" || STATE.screen === "pay") { STATE.screen = "claim"; setMsg("CANCELLED - RETURN TO CLAIM"); }
    else if (STATE.screen === "menu") { STATE.screen = "signoff"; setMsg("SIGNED OFF"); }
  }
  else if (key === 1) { setMsg("HELP: PF3=EXIT  PF5=SEARCH  PF7/8=UP/DN  PF12=CANCEL  PF10=MENU"); }
  else if (key === 5) { STATE.screen = "search"; STATE.searchKey = ""; setMsg("READY FOR NEW SEARCH"); }
  else if (key === 10) { STATE.screen = "menu"; setMsg("MENU"); }
  else if (key === 12) { STATE.screen = STATE.screen === "claim" ? "menu" : "claim"; setMsg("CANCELLED"); }
  saveState(STATE); render();
}

function render() {
  const screen = activeScreen();
  document.getElementById("app").innerHTML = `
    <div class="tn-shell" style="padding:20px; max-width:920px; margin:0 auto;">
      <pre style="background:#000; color:#7CFC00; padding:14px; border:2px solid #2f5f2f; min-height:520px; text-shadow:0 0 4px rgba(124,252,0,0.45); box-shadow:inset 0 0 24px rgba(38,160,38,0.2); font-size:13px; line-height:1.25; margin:0;">${esc(screen)}</pre>
      <div style="display:flex; gap:6px; margin-top:8px;">
        <input id="tn-input" type="text" placeholder="enter command here, then press ENTER" autofocus
          value="${esc(STATE.screen === "search" ? STATE.searchKey : (STATE.screen === "note" ? STATE.noteBuffer : (STATE.screen === "pay" ? STATE.payAmount : "")))}"
          style="flex:1; background:#000; color:#7CFC00; border:1px solid #2f5f2f; padding:6px 8px; font-family:inherit; font-size:13px; text-transform:uppercase;" />
        <button id="tn-enter" style="background:#0e1f0e; color:#7CFC00; border:1px solid #2f5f2f; padding:6px 12px; cursor:pointer; font-family:inherit;">[ENTER]</button>
      </div>
      <div style="display:flex; gap:4px; margin-top:8px; flex-wrap:wrap;">
        ${[1,3,5,7,8,10,12].map((k) => `<button data-pf="${k}" style="background:#0e1f0e; color:#7CFC00; border:1px solid #2f5f2f; padding:4px 10px; cursor:pointer; font-family:inherit;">[PF${k}]</button>`).join("")}
      </div>
      <div style="margin-top:10px; color:#558855; font-size:11px;">
        PF KEY GUIDE:  PF1=HELP  PF3=EXIT  PF5=SEARCH  PF7=UP  PF8=DN  PF10=MENU  PF12=CANCEL
      </div>
    </div>
  `;
  const inp = document.getElementById("tn-input");
  if (inp) {
    inp.addEventListener("input", (e) => {
      if (STATE.screen === "search") STATE.searchKey = e.target.value;
      else if (STATE.screen === "note") STATE.noteBuffer = e.target.value;
      else if (STATE.screen === "pay") STATE.payAmount = e.target.value;
    });
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); handleEnter(); }
      else if (e.key === "Escape") { e.preventDefault(); pf(3); }
      else if (/^F\d+$/.test(e.key)) { e.preventDefault(); pf(parseInt(e.key.substring(1), 10)); }
    });
    inp.focus();
  }
  document.getElementById("tn-enter").onclick = handleEnter;
  document.querySelectorAll("[data-pf]").forEach((b) => b.addEventListener("click", () => pf(parseInt(b.dataset.pf, 10))));
}

document.getElementById("tn-help").onclick = function () {
  const o = document.createElement("div");
  o.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;";
  o.innerHTML = `<div style="background:#fff;max-width:760px;border-radius:4px;color:#222;font-family:-apple-system,sans-serif;"><div style="padding:14px 18px;border-bottom:1px solid #ddd;font-weight:600;">App Context &mdash; Mainframe 3270 Claims Terminal</div><div style="padding:16px 18px;font-size:13px;line-height:1.5;max-height:60vh;overflow:auto;white-space:pre-wrap;">${esc(APP_DESCRIPTION)}</div><div style="padding:10px 18px;background:#f8f9fa;border-top:1px solid #ddd;text-align:right;"><button id="tnc" style="background:#1f497d;color:#fff;border:0;padding:6px 14px;cursor:pointer;">Close</button></div></div>`;
  document.body.appendChild(o); o.onclick = (e) => { if (e.target === o) o.remove(); };
  document.getElementById("tnc").onclick = () => o.remove();
};

render();
