import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "customer-refund-processing";
const modules = [
  {
    "id": "requests",
    "label": "Requests"
  },
  {
    "id": "eligibility",
    "label": "Eligibility"
  },
  {
    "id": "payments",
    "label": "Payment Reversal"
  },
  {
    "id": "gl",
    "label": "GL Adjustments"
  },
  {
    "id": "notices",
    "label": "Customer Notices"
  }
];
const columns = {
  "requests": [
    "refundId",
    "customer",
    "orderNo",
    "amount",
    "status"
  ],
  "eligibility": [
    "caseId",
    "refundId",
    "policyRule",
    "reviewer",
    "status"
  ],
  "payments": [
    "paymentId",
    "refundId",
    "gateway",
    "postedDate",
    "status"
  ],
  "gl": [
    "journalId",
    "refundId",
    "account",
    "owner",
    "status"
  ],
  "notices": [
    "noticeId",
    "refundId",
    "template",
    "channel",
    "status"
  ]
};
const palette = {
  "--legacy-bg": "#dadade",
  "--legacy-panel": "#f2f2f6",
  "--legacy-nav": "#cecee0",
  "--legacy-grid-head": "#d6d6e7",
  "--legacy-active": "#5f4d88"
};

let activeModule = modules[0].id;

ensureSeed(namespace, () => ({
  "requests": [
    {
      "refundId": "RF-1102",
      "customer": "Beacon Retail",
      "orderNo": "SO-78110",
      "amount": "219.00",
      "status": "New"
    }
  ],
  "eligibility": [
    {
      "caseId": "EL-67",
      "refundId": "RF-1102",
      "policyRule": "30-day return",
      "reviewer": "CS Lead",
      "status": "Pass"
    }
  ],
  "payments": [
    {
      "paymentId": "PM-551",
      "refundId": "RF-1102",
      "gateway": "Chase Paymentech",
      "postedDate": "2009-03-18",
      "status": "Queued"
    }
  ],
  "gl": [
    {
      "journalId": "JRN-312",
      "refundId": "RF-1102",
      "account": "402200",
      "owner": "AR Ops",
      "status": "Open"
    }
  ],
  "notices": [
    {
      "noticeId": "NT-90",
      "refundId": "RF-1102",
      "template": "Refund Approved",
      "channel": "Email",
      "status": "Pending"
    }
  ]
}));

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function render() {
  applyPalette();
  const data = loadSeed(namespace, () => ({}));
  const moduleColumns = columns[activeModule];
  const rows = data[activeModule].map((row) => moduleColumns.map((key) => row[key]));
  const grid = dataGrid(moduleColumns, rows);

  const formFields = moduleColumns
    .map((field) => `<label>${field}</label><input class="legacy-field" name="${field}" />`)
    .join("");

  const contentHtml =
    panel("Refund eligibility checks, payment reversals, GL adjustments, and customer notices.", grid) +
    panel("Entry Form", `<form id="entry-form" data-module="${activeModule}"><div class="legacy-form-grid">${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>`);

  document.getElementById("app").innerHTML = appShell({
    title: "Customer Refund Processing 2009",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: `System: ${namespace.toUpperCase()} | Session: OPERATOR-01`,
    contentHtml
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const latest = loadSeed(namespace, () => ({}));

      if (action === "toggle-first" && latest[activeModule][0]) {
        const first = latest[activeModule][0];
        if (first.status) {
          first.status = first.status === "Open" ? "Closed" : first.status === "Pending" ? "Approved" : "Open";
        }
        saveSeed(namespace, latest);
      }

      if (action === "delete-last" && latest[activeModule].length > 0) {
        latest[activeModule].pop();
        saveSeed(namespace, latest);
      }

      if (action === "seed-reset") {
        localStorage.removeItem(`legacy-demo:${namespace}`);
      }

      render();
    });
  });

  const form = document.getElementById("entry-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const moduleName = form.getAttribute("data-module");
    const moduleKeys = columns[moduleName];
    const row = {};
    const keyField = moduleKeys[0];

    moduleKeys.forEach((field) => {
      row[field] = formData.get(field)?.toString() || "";
    });

    if (!row[keyField]) {
      row[keyField] = makeId(moduleName.slice(0, 3).toUpperCase());
    }

    const latest = loadSeed(namespace, () => ({}));
    const index = latest[moduleName].findIndex((item) => item[keyField] === row[keyField]);
    if (index >= 0) {
      latest[moduleName][index] = row;
    } else {
      latest[moduleName].push(row);
    }

    saveSeed(namespace, latest);
    render();
  });
}

render();
