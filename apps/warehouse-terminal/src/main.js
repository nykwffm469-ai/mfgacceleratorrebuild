import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed } from "@legacy/shared-mock-data";
import { panel } from "@legacy/shared-ui";

const namespace = "warehouse-terminal";
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

function render() {
  const data = loadSeed(namespace, () => ({}));
  const terminalLines = linesForScreen(data).map((line) => `<div class="line">${line}</div>`).join("");

  document.getElementById("app").innerHTML = `
    <div class="legacy-window">
      <div class="legacy-titlebar">Warehouse Terminal Control 2010</div>
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
}

document.addEventListener("keydown", (event) => {
  if (event.key === "F2") activeScreen = "lookup";
  if (event.key === "F4") activeScreen = "shipments";
  if (event.key === "F6") activeScreen = "receiving";
  if (event.key === "F8") activeScreen = "status";
  render();
});

render();
