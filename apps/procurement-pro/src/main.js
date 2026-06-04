import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel, tabs } from "@legacy/shared-ui";

const namespace = "procurement-pro";
const modules = [
  { id: "requisitions", label: "Requisitions" },
  { id: "vendors", label: "Vendors" },
  { id: "purchaseOrders", label: "Purchase Orders" },
  { id: "invoiceQueue", label: "Invoice Queue" },
  { id: "approvals", label: "Approvals" }
];
let activeModule = "requisitions";

ensureSeed(namespace, () => ({
  requisitions: [
    { reqId: "REQ-1001", requester: "M. Jones", category: "MRO", amount: "4500", status: "Submitted" }
  ],
  vendors: [
    { vendorId: "VEN-2010", name: "Atlas Industrial", type: "Preferred", score: "86" }
  ],
  purchaseOrders: [
    { poId: "PO-7781", vendor: "Atlas Industrial", amount: "12000", buyer: "K. Ruiz", status: "Approved" }
  ],
  invoiceQueue: [
    { invoiceId: "INV-9901", vendor: "Atlas Industrial", amount: "11840", status: "Match Exception" }
  ],
  approvals: [
    { approvalId: "APR-8801", document: "REQ-1001", approver: "Director Ops", status: "Pending" }
  ]
}));

const columns = {
  requisitions: ["reqId", "requester", "category", "amount", "status"],
  vendors: ["vendorId", "name", "type", "score"],
  purchaseOrders: ["poId", "vendor", "amount", "buyer", "status"],
  invoiceQueue: ["invoiceId", "vendor", "amount", "status"],
  approvals: ["approvalId", "document", "approver", "status"]
};

function renderContent(data) {
  const grid = dataGrid(
    columns[activeModule],
    data[activeModule].map((row) => columns[activeModule].map((key) => row[key]))
  );

  const formFields = columns[activeModule]
    .map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`)
    .join("");

  return tabs(modules.map((item) => ({ id: item.id, label: item.label })), activeModule) +
    panel("Transaction Workspace", grid) +
    panel("Quick Entry", `<form id="entry-form"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px;"><button class="legacy-btn" type="submit">Insert</button></div></form>`);
}

function render() {
  const data = loadSeed(namespace, () => ({}));
  document.getElementById("app").innerHTML = appShell({
    title: "Procurement Pro 10.4",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "approve-first", label: "Approve First" },
      { id: "reset", label: "Reset Seed" }
    ],
    statusText: "Entity: DEMO HOLDINGS | Fiscal Period: 2011-08 | Mode: Purchasing",
    contentHtml: renderContent(data)
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-tab");
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const latest = loadSeed(namespace, () => ({}));
      const action = button.getAttribute("data-action");
      if (action === "approve-first" && latest[activeModule][0] && latest[activeModule][0].status) {
        latest[activeModule][0].status = "Approved";
        saveSeed(namespace, latest);
      }
      if (action === "reset") {
        localStorage.removeItem(`legacy-demo:${namespace}`);
      }
      render();
    });
  });

  document.getElementById("entry-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const latest = loadSeed(namespace, () => ({}));
    const row = {};
    columns[activeModule].forEach((field, index) => {
      row[field] = formData.get(field)?.toString() || (index === 0 ? makeId(activeModule.slice(0, 3).toUpperCase()) : "");
    });
    latest[activeModule].push(row);
    saveSeed(namespace, latest);
    render();
  });
}

render();
