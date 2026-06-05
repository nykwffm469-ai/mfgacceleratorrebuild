import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed } from "@legacy/shared-mock-data";
import { panel } from "@legacy/shared-ui";

const namespace = "warehouse-terminal";
const APP_DESCRIPTION = `LEGACY APP DESCRIPTION - Warehouse Terminal Control 2010

Warehouse Terminal Control 2010 is a keyboard-driven operations interface used by distribution
teams for inventory lookup, shipment staging, receiving-dock processing, and terminal status review.

The interface mimics legacy RF/green-screen operational behavior with:
- function-key navigation
- high-density text grids
- process/confirm workflows
- status-line operator feedback
- dock and shipment queue management`;
const screens = ["lookup", "shipments", "receiving", "status"];
let activeScreen = "lookup";
let statusMessage = "F2 Lookup | F4 Shipments | F6 Receiving | F8 Status";

ensureSeed(namespace, () => ({
  inventory: [
    { partNo: "PRT-1001", description: "Bearing Kit", aisle: "A-14", qty: 48, status: "Available" },
    { partNo: "PRT-1002", description: "Hydraulic Seal", aisle: "C-09", qty: 12, status: "Hold" },
    { partNo: "PRT-1003", description: "Motor Assembly", aisle: "B-02", qty: 7, status: "Allocated" }
  ],
  shipments: [
    { shipNo: "SHP-7001", carrier: "RoadEx", route: "MW-01", status: "Ready" },
    { shipNo: "SHP-7002", carrier: "FreightCo", route: "SE-14", status: "Queued" }
  ],
  receipts: [
    { receiptNo: "RCV-2201", supplier: "Apex Parts", dock: "D3", status: "Pending" }
  ]
}));

function linesForScreen(data) {
  if (activeScreen === "lookup") {
    return [
      " INVENTORY LOOKUP                                  SCREEN INV-01 ",
      " --------------------------------------------------------------- ",
      " PART NO      DESCRIPTION           AISLE    QTY     STATUS      ",
      ...data.inventory.map((item) => `${item.partNo.padEnd(12)} ${item.description.padEnd(20)} ${item.aisle.padEnd(8)} ${String(item.qty).padEnd(7)} ${item.status.padEnd(10)}`)
    ];
  }

  if (activeScreen === "shipments") {
    return [
      " SHIPMENT PROCESSING                               SCREEN SHP-02 ",
      " --------------------------------------------------------------- ",
      " SHIP NO      CARRIER               ROUTE    STATUS               ",
      ...data.shipments.map((item) => `${item.shipNo.padEnd(12)} ${item.carrier.padEnd(20)} ${item.route.padEnd(8)} ${item.status.padEnd(20)}`)
    ];
  }

  if (activeScreen === "receiving") {
    return [
      " RECEIVING DOCK                                    SCREEN RCV-03 ",
      " --------------------------------------------------------------- ",
      " RECEIPT NO    SUPPLIER              DOCK     STATUS              ",
      ...data.receipts.map((item) => `${item.receiptNo.padEnd(13)} ${item.supplier.padEnd(20)} ${item.dock.padEnd(8)} ${item.status.padEnd(20)}`)
    ];
  }

  return [
    " SYSTEM STATUS                                     SCREEN OPS-04 ",
    " --------------------------------------------------------------- ",
    ` INVENTORY RECORDS : ${String(data.inventory.length).padEnd(8)} SHIPMENT QUEUE : ${String(data.shipments.length).padEnd(8)}`,
    ` RECEIVING OPEN    : ${String(data.receipts.length).padEnd(8)} TERMINAL MODE   : ONLINE `,
    ` LAST ACTION       : ${statusMessage}`
  ];
}

function openDescriptionModal(host) {
  const existing = host.querySelector(".legacy-command-modal");
  if (existing) {
    existing.remove();
    return;
  }

  const modal = document.createElement("div");
  modal.className = "legacy-command-modal";
  modal.innerHTML = `
    <div class="legacy-command-dialog legacy-description-dialog">
      <div class="legacy-command-head">Warehouse Terminal Control 2010</div>
      <div class="legacy-command-sub">Demo overview for this application</div>
      <div class="legacy-description-body">
        <pre class="legacy-description-text">${APP_DESCRIPTION}</pre>
      </div>
      <div class="legacy-command-footer">
        <button class="legacy-btn" type="button" data-close-desc="1">Close</button>
      </div>
    </div>
  `;

  host.appendChild(modal);
  modal.querySelector("[data-close-desc]")?.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
}

function render() {
  const data = loadSeed(namespace, () => ({}));
  const terminalLines = linesForScreen(data).map((line) => `<div class="line">${line}</div>`).join("");

  document.getElementById("app").innerHTML = `
    <style>
      .legacy-window {
        border-color: #2e5d2e;
        background: radial-gradient(circle at top, #0f230f 0%, #060906 70%);
        color: #8eff8e;
        font-family: "Lucida Console", "Courier New", monospace;
      }
      .legacy-titlebar,
      .legacy-toolbar,
      .legacy-statusbar {
        background: linear-gradient(to bottom, #143314 0%, #081408 100%);
        color: #90ff90;
        border-color: #2f5f2f;
      }
      .legacy-window .legacy-btn,
      .legacy-window .legacy-help-icon,
      .legacy-window .legacy-backlink {
        font-family: "Lucida Console", "Courier New", monospace;
        background: #0d220d;
        color: #9dff9d;
        border-color: #3a6f3a;
      }
      .legacy-window .legacy-btn:hover,
      .legacy-window .legacy-help-icon:hover {
        background: #173617;
      }
      .legacy-window .legacy-panel,
      .legacy-window .legacy-panel-head,
      .legacy-window .legacy-panel-body {
        border-color: #2f5f2f;
      }
      .legacy-window .legacy-panel-head {
        background: #123412;
        color: #adffad;
      }
      .legacy-window .legacy-panel-body {
        background: #081008;
      }
      .legacy-terminal {
        background: #020602;
        color: #8fff8f;
        border: 1px solid #2f5f2f;
        padding: 8px;
        line-height: 1.22;
        text-shadow: 0 0 5px rgba(100, 255, 100, 0.32);
        box-shadow: inset 0 0 24px rgba(38, 160, 38, 0.16);
        min-height: 320px;
      }
      .legacy-terminal .line {
        font-family: "Lucida Console", "Courier New", monospace;
        white-space: pre;
      }
      .legacy-window .legacy-statusbar {
        text-shadow: 0 0 5px rgba(100, 255, 100, 0.35);
      }
    </style>
    <div class="legacy-window">
      <div class="legacy-titlebar">
        <span>Warehouse Terminal Control 2010</span>
        <div style="display:inline-flex; align-items:center; gap:6px;">
          <button class="legacy-help-icon" type="button" data-action="legacy-app-help" aria-label="Open app description" title="App context">?</button>
          <a class="legacy-backlink" href="../" aria-label="Back to main page">Main</a>
        </div>
      </div>
      <div class="legacy-toolbar">
        <button class="legacy-btn" data-screen="lookup">F2 Lookup</button>
        <button class="legacy-btn" data-screen="shipments">F4 Shipments</button>
        <button class="legacy-btn" data-screen="receiving">F6 Receiving</button>
        <button class="legacy-btn" data-screen="status">F8 Status</button>
        <button class="legacy-btn" data-action="process">Enter / Process</button>
      </div>
      ${panel("Terminal Session", `<div class="legacy-terminal">${terminalLines}</div>`)}
      <div class="legacy-statusbar">${statusMessage}</div>
    </div>
  `;

  document.querySelectorAll("[data-screen]").forEach((button) => {
    button.addEventListener("click", () => {
      activeScreen = button.getAttribute("data-screen");
      statusMessage = `Switched to ${activeScreen.toUpperCase()} screen`;
      render();
    });
  });

  const process = document.querySelector("[data-action='process']");
  process.addEventListener("click", () => {
    if (activeScreen === "shipments" && data.shipments[0]) {
      data.shipments[0].status = data.shipments[0].status === "Ready" ? "Confirmed" : "Ready";
    }
    if (activeScreen === "receiving" && data.receipts[0]) {
      data.receipts[0].status = data.receipts[0].status === "Pending" ? "Received" : "Pending";
    }
    saveSeed(namespace, data);
    statusMessage = `Processed screen ${activeScreen.toUpperCase()} at ${new Date().toLocaleTimeString()}`;
    render();
  });

  document.querySelector("[data-action='legacy-app-help']")?.addEventListener("click", () => {
    openDescriptionModal(document.getElementById("app"));
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "F2") activeScreen = "lookup";
  if (event.key === "F4") activeScreen = "shipments";
  if (event.key === "F6") activeScreen = "receiving";
  if (event.key === "F8") activeScreen = "status";
  render();
});

render();
