import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const outputRoot = join(root, "portfolio-dist");
const repoUrl = "https://github.com/nykwffm469-ai/mfgacceleratorrebuild";

function toTitleCase(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readAppSummary(appRoot) {
  const readmePath = join(appRoot, "README.md");
  if (!existsSync(readmePath)) {
    return "Legacy enterprise simulation module.";
  }

  const lines = readFileSync(readmePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const summary = lines.find((line) => !line.startsWith("#") && line !== "Run:" && !line.startsWith("```"));
  return summary || "Legacy enterprise simulation module.";
}

const appProfiles = {
  "crm-classic": { area: "Sales", interface: "Vendor Web", displayTitle: "CRM Classic" },
  "hr-portal": { area: "Human Resources", interface: "SharePoint Portal", displayTitle: "HR Portal" },
  "helpdesk-ops": { area: "IT Operations", interface: "Vendor Web", displayTitle: "Helpdesk Ops" },
  "procurement-pro": { area: "Procurement", interface: "Oracle Forms Hybrid", displayTitle: "Procurement Pro" },
  "ap-statement-reconciliation": { area: "Finance", interface: "Workbench", displayTitle: "AP Recon Workbench" },
  "billing-collections": { area: "Finance", interface: "Collections Console", displayTitle: "Billing Collections" },
  "warehouse-terminal": { area: "Logistics", interface: "Console/Terminal", displayTitle: "Warehouse RF System" },
  "field-dispatch": { area: "Field Service", interface: "Dispatch Board", displayTitle: "Field Dispatch" },
  "finance-ledger": { area: "Finance", interface: "ERP Web", displayTitle: "Finance Ledger" },
  "legal-docket": { area: "Legal", interface: "Government Web", displayTitle: "Legal Docket" },
  "maintenance-cmms": { area: "Manufacturing", interface: "Industrial CMMS", displayTitle: "Maintenance CMMS" },
  "project-tracker": { area: "PMO", interface: "SharePoint/Excel", displayTitle: "Project Tracker" },
  "travel-expense-audit": { area: "Finance", interface: "Audit Web", displayTitle: "Travel Expense Audit" },
  "hr-case-lifecycle": { area: "Public Sector", interface: "Intranet Forms", displayTitle: "Government Case Manager" },
  "fleet-ops": { area: "Transportation", interface: "Desktop-style Web", displayTitle: "Fleet Operations" },
  "supplier-scorecard-consolidator": { area: "Supply Chain", interface: "Excel-heavy Portal", displayTitle: "Supplier Scorecard" },
  "new-hire-provisioning": { area: "IT Operations", interface: "Admin Portal", displayTitle: "New Hire Provisioning" },
  "claims-desk": { area: "Insurance", interface: "Desktop-style Web", displayTitle: "Insurance Claims Desk" },
  "quality-audit": { area: "Manufacturing", interface: "Intranet Grid", displayTitle: "Quality Audit Hub" },
  "order-hold-release": { area: "Distribution", interface: "ERP Workbench", displayTitle: "Order Hold Release" },
  "erp-tcode-workbench": { area: "ERP Operations", interface: "Console/Terminal", displayTitle: "ERP T-Code Workbench" },
  "sharepoint-doc-center": { area: "ECM / Compliance", interface: "SharePoint 2010 Clone", displayTitle: "SharePoint Document Center" },
  "modern-loan-origination": { area: "Banking & Lending", interface: "Modern Web (Bootstrap)", displayTitle: "NorthBank Loan Origination" },
  "modern-vendor-risk": { area: "Third-Party Risk", interface: "Modern Web (Bootstrap)", displayTitle: "VendorPulse Risk Cockpit" },
  "bot-orchestrator-console": { area: "Automation Platform", interface: "Modern Web (Bootstrap)", displayTitle: "Bot Orchestrator Control Room" },
  "document-intelligence-studio": { area: "Automation Platform", interface: "Modern Web (Bootstrap)", displayTitle: "Document Intelligence Studio (IDP)" },
  "mainframe-3270-emulator": { area: "Mainframe / Legacy Host", interface: "TN3270 / Green Screen", displayTitle: "Mainframe 3270 Claims Terminal" },
  "email-intake-bot": { area: "Automation Platform", interface: "Modern Web (Outlook-style)", displayTitle: "AP/AR Shared Mailbox Bot" },
  "excel-macro-lab": { area: "Automation Platform", interface: "Excel Macro Workbook", displayTitle: "Excel Macro Replacement Lab" },
  "rpa-roi-dashboard": { area: "Automation Platform", interface: "Executive Wallboard", displayTitle: "RPA Program ROI Dashboard" }
};

function getAppProfile(id, title, subtitle) {
  const explicit = appProfiles[id];
  if (explicit) return explicit;

  const text = `${id} ${title} ${subtitle}`.toLowerCase();
  if (text.includes("terminal") || text.includes("tcode") || text.includes("command")) {
    return { area: "Operations", interface: "Console/Terminal", displayTitle: title };
  }
  if (text.includes("portal") || text.includes("sharepoint")) {
    return { area: "Operations", interface: "SharePoint Portal", displayTitle: title };
  }
  if (text.includes("dispatch") || text.includes("route") || text.includes("fleet")) {
    return { area: "Operations", interface: "Scheduler Console", displayTitle: title };
  }
  if (text.includes("finance") || text.includes("ledger") || text.includes("billing") || text.includes("ap ")) {
    return { area: "Finance", interface: "Workbench", displayTitle: title };
  }
  if (text.includes("warehouse") || text.includes("inventory") || text.includes("shipment")) {
    return { area: "Logistics", interface: "Operational Grid", displayTitle: title };
  }

  return { area: "Operations", interface: "Legacy Web", displayTitle: title };
}

const appsRoot = join(root, "apps");
const apps = readdirSync(appsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "samplecode")
  .map((entry) => {
    const id = entry.name;
    const appRoot = join(appsRoot, id);
    const title = toTitleCase(id);
    const subtitle = readAppSummary(appRoot);
    const profile = getAppProfile(id, title, subtitle);
    return {
      id,
      title,
      displayTitle: profile.displayTitle,
      subtitle,
      area: profile.area,
      interface: profile.interface,
      distPath: join(appRoot, "dist")
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

const hostedApps = [
  {
    title: "ConsoleApp",
    subtitle: "Companion static app hosted in the same Azure resource group.",
    url: "https://thankful-meadow-04346941e.7.azurestaticapps.net/",
    area: "External",
    interface: "Console/Terminal"
  },
  {
    title: "LegacyCRM",
    subtitle: "Legacy CRM deployment in the shared Azure/GitHub environment.",
    url: "https://blue-mushroom-0b3ccdf1e.7.azurestaticapps.net/",
    area: "External",
    interface: "Vendor Web"
  },
  {
    title: "sample-fluent-app",
    subtitle: "Sample app deployment in the same Static Web Apps subscription.",
    url: "https://lively-ground-06a5b600f.7.azurestaticapps.net/",
    area: "External",
    interface: "Modern Sample"
  },
  {
    title: "sample-hello-world",
    subtitle: "Sample hello-world static app from the shared repository environment.",
    url: "https://proud-mushroom-075a41d0f.7.azurestaticapps.net/",
    area: "External",
    interface: "Modern Sample"
  },
  {
    title: "sample-static-asset-tracker",
    subtitle: "Sample static asset tracker app hosted in the same Azure tenant.",
    url: "https://lively-tree-02acf510f.7.azurestaticapps.net/",
    area: "External",
    interface: "Modern Sample"
  },
  {
    title: "sample-tanstack-app",
    subtitle: "Sample TanStack app deployment available in the shared environment.",
    url: "https://calm-forest-0e41e330f.7.azurestaticapps.net/",
    area: "External",
    interface: "Modern Sample"
  },
  {
    title: "SupplierPortal",
    subtitle: "Supplier-facing portal hosted alongside the legacy portfolio apps.",
    url: "https://agreeable-bush-06e58e71e.7.azurestaticapps.net/",
    area: "External",
    interface: "Portal"
  }
].sort((a, b) => a.title.localeCompare(b.title));

const totalAppCount = apps.length + hostedApps.length;
const legacyBusinessAreas = [
  "Sales",
  "Human Resources",
  "IT Operations",
  "Procurement",
  "Finance",
  "Logistics",
  "Field Service",
  "Legal",
  "Public Sector",
  "Manufacturing",
  "PMO",
  "Transportation",
  "Supply Chain",
  "Insurance",
  "Distribution",
  "ERP Operations",
  "ECM / Compliance",
  "Banking & Lending",
  "Third-Party Risk",
  "Automation Platform",
  "Mainframe / Legacy Host"
];

const areaCounts = legacyBusinessAreas
  .map((area) => ({ area, count: apps.filter((app) => app.area === area).length }))
  .filter((entry) => entry.count > 0);

const interfaceOptions = [...new Set([...apps.map((app) => app.interface), ...hostedApps.map((app) => app.interface)])].sort();

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

for (const app of apps) {
  if (!existsSync(app.distPath)) {
    throw new Error(`Missing build output for ${app.id}: ${app.distPath}`);
  }

  cpSync(app.distPath, join(outputRoot, app.id), { recursive: true });
}

const cards = apps
  .map(
    (app, index) => `
      <tr class="app-row" data-kind="local" data-area="${app.area}" data-interface="${app.interface}" data-search="${`${app.displayTitle} ${app.title} ${app.subtitle} ${app.id} ${app.area} ${app.interface}`.toLowerCase()}">
        <td>${index + 1}</td>
        <td><a href="./${app.id}/">${app.displayTitle}</a></td>
        <td>${app.subtitle}</td>
        <td>${app.area}</td>
        <td>${app.interface}</td>
        <td>Local</td>
        <td><code>/${app.id}/</code></td>
      </tr>`
  )
  .join("");

const hostedCards = hostedApps
  .map(
    (app, index) => `
      <tr class="app-row" data-kind="hosted" data-area="${app.area}" data-interface="${app.interface}" data-search="${`${app.title} ${app.subtitle} ${app.url} ${app.area} ${app.interface}`.toLowerCase()}">
        <td>${apps.length + index + 1}</td>
        <td><a href="${app.url}" target="_blank" rel="noreferrer">${app.title}</a></td>
        <td>${app.subtitle}</td>
        <td>${app.area}</td>
        <td>${app.interface}</td>
        <td>Hosted</td>
        <td><code>${app.url}</code></td>
      </tr>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Legacy Enterprise Portfolio</title>
    <style>
      body {
        margin: 0;
        font-family: Tahoma, Verdana, Arial, sans-serif;
        font-size: 12px;
        color: #1a1f26;
        background: #d9dde2;
      }
      .window {
        margin: 10px;
        border: 1px solid #6d7885;
        background: #f1f3f5;
      }
      .titlebar {
        padding: 7px 9px;
        font-weight: 700;
        background: linear-gradient(to bottom, #e9eef4 0%, #b8c5d4 100%);
        border-bottom: 1px solid #7d8893;
      }
      .toolbar {
        padding: 4px;
        border-bottom: 1px solid #7d8893;
        background: linear-gradient(to bottom, #fff 0%, #c2ccd7 100%);
      }
      .toolbar span {
        display: inline-block;
        margin-right: 8px;
        border: 1px solid #6f7b87;
        padding: 3px 8px;
        background: linear-gradient(to bottom, #fff 0%, #c0cad5 100%);
      }
      .toolbar input {
        border: 1px solid #6f7b87;
        padding: 3px 6px;
        font-size: 11px;
        width: 260px;
        background: #fcfdff;
      }
      .toolbar a {
        color: #123d6b;
        text-decoration: none;
        font-weight: 700;
      }
      .toolbar select, .toolbar label {
        border: 1px solid #6f7b87;
        padding: 3px 6px;
        font-size: 11px;
        background: linear-gradient(to bottom, #fff 0%, #d4dde7 100%);
      }
      .filterbar {
        padding: 5px 6px;
        border-top: 1px solid #e2e7ed;
        border-bottom: 1px solid #7d8893;
        background: linear-gradient(to bottom, #f7f9fb 0%, #d7e0ea 100%);
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .filterbar .filter-label {
        font-weight: 700;
        margin-right: 2px;
      }
      .filterbar input {
        border: 1px solid #6f7b87;
        padding: 3px 6px;
        font-size: 11px;
        width: 320px;
        background: #fcfdff;
      }
      .filterbar select, .filterbar label {
        border: 1px solid #6f7b87;
        padding: 3px 6px;
        font-size: 11px;
        background: linear-gradient(to bottom, #fff 0%, #d4dde7 100%);
        margin-right: 6px;
        display: inline-flex;
        align-items: center;
      }
      .filterbar label input {
        margin-right: 4px;
      }
      .filterbar .filter-compact {
        padding: 3px 5px;
        margin-right: 0;
      }
      .content {
        padding: 10px;
      }
      .panel {
        border: 1px solid #7e8894;
        background: #f6f8fa;
        margin-bottom: 10px;
      }
      .panel h2 {
        margin: 0;
        padding: 6px 8px;
        font-size: 12px;
        background: linear-gradient(to bottom, #e7edf3 0%, #c2ceda 100%);
        border-bottom: 1px solid #7e8995;
      }
      .panel .body {
        padding: 8px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      th, td {
        border: 1px solid #8a94a1;
        padding: 5px 6px;
        text-align: left;
      }
      th {
        background: #d2dae3;
      }
      tr:nth-child(odd) td {
        background: #f6f8fa;
      }
      tr:nth-child(even) td {
        background: #edf1f5;
      }
      code { background: #e9edf2; padding: 1px 4px; }
      a { color: #123d6b; text-decoration: none; }
      .muted { color: #4e5a66; font-size: 11px; }
      .area-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .area-pill {
        border: 1px solid #6f7b87;
        background: linear-gradient(to bottom, #f5f8fb 0%, #ccd7e2 100%);
        padding: 2px 8px;
        white-space: nowrap;
      }
    </style>
  </head>
  <body>
    <div class="window">
      <div class="titlebar">Legacy Enterprise Application Portfolio</div>
      <div class="toolbar">
        <span>Environment: Demo</span>
        <span>Hosting: Azure Static Web Apps</span>
        <span>Mode: Read/Write localStorage</span>
        <span>Total Apps: ${totalAppCount}</span>
        <span>Source: <a href="${repoUrl}" target="_blank" rel="noreferrer">GitHub Repo</a></span>
      </div>
      <div class="filterbar">
        <span class="filter-label">Search & Filters:</span>
        <input id="app-search" type="search" placeholder="Search apps, workflow, or URL..." aria-label="Search applications" />
        <select id="area-filter" aria-label="Filter by business area">
          <option value="">All Areas</option>
          ${areaCounts.map((entry) => `<option value="${entry.area}">${entry.area} (${entry.count})</option>`).join("")}
        </select>
        <select id="interface-filter" aria-label="Filter by interface style">
          <option value="">All Interfaces</option>
          ${interfaceOptions.map((value) => `<option value="${value}">${value}</option>`).join("")}
        </select>
        <label class="filter-compact"><input id="console-filter" type="checkbox" />Terminal</label>
        <select id="kind-filter" aria-label="Filter by app hosting kind">
          <option value="">Local + Hosted</option>
          <option value="local">Local only</option>
          <option value="hosted">Hosted only</option>
        </select>
      </div>
      <div class="content">
        <div class="panel">
          <h2>Purpose</h2>
          <div class="body">
            This site hosts ${apps.length} fake but believable legacy enterprise front-end simulations plus ${hostedApps.length} related hosted apps in the same Azure/GitHub environment. All local portfolio data is seeded and stored in browser localStorage only.
          </div>
        </div>
        <div class="panel">
          <h2>Business Areas</h2>
          <div class="body">
            <div class="area-strip">
              ${areaCounts.map((entry) => `<span class="area-pill">${entry.area}: ${entry.count}</span>`).join("")}
            </div>
          </div>
        </div>
        <div class="panel">
          <h2>Applications</h2>
          <div class="body">
            <div class="muted" id="app-count-label">Showing ${totalAppCount} of ${totalAppCount} apps</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Application</th>
                  <th>Description</th>
                  <th>Area</th>
                  <th>Interface</th>
                  <th>Type</th>
                  <th>Path</th>
                </tr>
              </thead>
              <tbody>${cards}${hostedCards}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <script>
      (function () {
        const input = document.getElementById("app-search");
        const areaFilter = document.getElementById("area-filter");
        const interfaceFilter = document.getElementById("interface-filter");
        const consoleFilter = document.getElementById("console-filter");
        const kindFilter = document.getElementById("kind-filter");
        const rows = Array.from(document.querySelectorAll(".app-row"));
        const countLabel = document.getElementById("app-count-label");
        const total = rows.length;

        function applyFilter() {
          const query = (input.value || "").trim().toLowerCase();
          const areaValue = areaFilter.value;
          const interfaceValue = interfaceFilter.value;
          const kindValue = kindFilter.value;
          const isConsoleOnly = consoleFilter.checked;
          let visible = 0;

          rows.forEach((row) => {
            const haystack = row.getAttribute("data-search") || "";
            const rowArea = row.getAttribute("data-area") || "";
            const rowInterface = row.getAttribute("data-interface") || "";
            const rowKind = row.getAttribute("data-kind") || "";
            const queryMatch = !query || haystack.includes(query);
            const areaMatch = !areaValue || rowArea === areaValue;
            const interfaceMatch = !interfaceValue || rowInterface === interfaceValue;
            const kindMatch = !kindValue || rowKind === kindValue;
            const consoleMatch = !isConsoleOnly || rowInterface === "Console/Terminal";
            const match = queryMatch && areaMatch && interfaceMatch && kindMatch && consoleMatch;
            row.style.display = match ? "" : "none";
            if (match) visible += 1;
          });

          countLabel.textContent = "Showing " + visible + " of " + total + " apps";
        }

        input.addEventListener("input", applyFilter);
        areaFilter.addEventListener("change", applyFilter);
        interfaceFilter.addEventListener("change", applyFilter);
        consoleFilter.addEventListener("change", applyFilter);
        kindFilter.addEventListener("change", applyFilter);
      })();
    </script>
  </body>
</html>`;

writeFileSync(join(outputRoot, "index.html"), html);
console.log(`Portfolio site generated at ${outputRoot}`);
