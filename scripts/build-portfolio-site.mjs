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
  "rpa-roi-dashboard": { area: "Automation Platform", interface: "Executive Wallboard", displayTitle: "RPA Program ROI Dashboard" },
  "modern-itsm-now": { area: "IT Operations", interface: "Modern Web (ServiceNow-style)", displayTitle: "ServiceCloud Now (Modern ITSM)" },
  "modern-salesforce-crm": { area: "Sales", interface: "Modern Web (Salesforce Lightning-style)", displayTitle: "NimbusCRM Lightning (Modern CRM)" },
  "healthcare-prior-auth": { area: "Healthcare", interface: "EHR Worklist", displayTitle: "EHR Prior Authorization Queue" },
  "bank-wire-ach-ops": { area: "Banking & Treasury", interface: "Treasury Operations", displayTitle: "Wire / ACH Exception Ops" },
  "identity-governance": { area: "Security & Identity", interface: "Modern Web (Bootstrap)", displayTitle: "SailPilot Identity Governance" },
  "edi-856-monitor": { area: "Supply Chain", interface: "B2B / EDI Monitor", displayTitle: "EDI Trading Partner Monitor" }
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

function getAppMeta(id) {
  const families = {
    SAP: { color: "#0d3b66", bg: "#dbe7f3" },
    Oracle: { color: "#c74634", bg: "#f8dad4" },
    IBM: { color: "#1f70c1", bg: "#d9e9f7" },
    Microsoft: { color: "#0078d4", bg: "#d6ebf9" },
    SharePoint: { color: "#1f497d", bg: "#dde7f4" },
    ServiceNow: { color: "#62d84e", bg: "#e0f4dc" },
    Salesforce: { color: "#0070d2", bg: "#d6ebf9" },
    Bootstrap: { color: "#563d7c", bg: "#e7e0f0" },
    Mainframe: { color: "#0a0a0a", bg: "#d6d6d6" },
    "Custom .NET": { color: "#5a6772", bg: "#e8ebee" },
    Excel: { color: "#107c41", bg: "#dbeed5" },
    Other: { color: "#7a4f9c", bg: "#ece1f3" }
  };
  const m = {
    // Modern apps (built post-2018 or modern frameworks)
    "modern-loan-origination": { era: "Modern", score: 1, family: "Bootstrap" },
    "modern-vendor-risk": { era: "Modern", score: 1, family: "Bootstrap" },
    "modern-itsm-now": { era: "Modern", score: 1, family: "ServiceNow" },
    "modern-salesforce-crm": { era: "Modern", score: 1, family: "Salesforce" },
    "bot-orchestrator-console": { era: "Modern", score: 1, family: "Bootstrap" },
    "document-intelligence-studio": { era: "Modern", score: 1, family: "Bootstrap" },
    "email-intake-bot": { era: "Modern", score: 1, family: "Microsoft" },
    "rpa-roi-dashboard": { era: "Modern", score: 1, family: "Bootstrap" },
    "healthcare-prior-auth": { era: "2018", score: 2, family: "Custom .NET" },
    "bank-wire-ach-ops": { era: "2014", score: 3, family: "Custom .NET" },
    "identity-governance": { era: "Modern", score: 1, family: "Bootstrap" },
    "edi-856-monitor": { era: "Modern", score: 2, family: "Bootstrap" },
    "sharepoint-doc-center": { era: "2010", score: 4, family: "SharePoint" },
    "excel-macro-lab": { era: "2003", score: 5, family: "Excel" },
    // Mainframe
    "mainframe-3270-emulator": { era: "1998", score: 5, family: "Mainframe" },
    "warehouse-terminal": { era: "1998", score: 5, family: "Mainframe" },
    "erp-tcode-workbench": { era: "2003", score: 5, family: "SAP" },
    "erp-command-center": { era: "2010", score: 4, family: "SAP" },
    // SharePoint-ish
    "chargeback-response-workbench": { era: "2010", score: 4, family: "SharePoint" },
    "hr-portal": { era: "2010", score: 4, family: "SharePoint" },
    "project-tracker": { era: "2010", score: 4, family: "SharePoint" },
    // Salesforce-ish CRM
    "crm-classic": { era: "2010", score: 4, family: "Salesforce" },
    "customer-cloud-hub": { era: "2010", score: 3, family: "Salesforce" },
    // ServiceNow-style ITSM
    "service-desk-plus": { era: "2010", score: 4, family: "ServiceNow" },
    "helpdesk-ops": { era: "2010", score: 4, family: "ServiceNow" },
    // Oracle Forms style
    "procurement-pro": { era: "2010", score: 4, family: "Oracle" },
    "finance-ledger": { era: "2010", score: 4, family: "Oracle" },
    "claims-desk": { era: "2003", score: 5, family: "Oracle" },
    "ap-statement-reconciliation": { era: "2010", score: 4, family: "Oracle" },
    "finance-close-studio": { era: "2014", score: 3, family: "Oracle" },
    // IBM mainframe-adjacent
    "loan-servicing-collections": { era: "2003", score: 5, family: "IBM" },
    "legal-docket": { era: "2010", score: 4, family: "IBM" },
    // Microsoft Dynamics-ish
    "field-service-workbench": { era: "2014", score: 3, family: "Microsoft" },
    "maintenance-cmms": { era: "2014", score: 3, family: "Microsoft" },
    "fleet-ops": { era: "2014", score: 3, family: "Microsoft" }
  };
  const meta = m[id] || { era: "2014", score: 3, family: "Custom .NET" };
  meta.familyStyle = families[meta.family] || families.Other;
  return meta;
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
    const meta = getAppMeta(id);
    return {
      id,
      title,
      displayTitle: profile.displayTitle,
      subtitle,
      area: profile.area,
      interface: profile.interface,
      era: meta.era,
      score: meta.score,
      family: meta.family,
      familyStyle: meta.familyStyle,
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
  "Banking & Treasury",
  "Third-Party Risk",
  "Automation Platform",
  "Mainframe / Legacy Host",
  "Healthcare",
  "Security & Identity"
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
    (app, index) => {
      const eraColor = app.era === "Modern" ? "#00a878" : app.era === "2018" ? "#5b9bd5" : app.era === "2014" ? "#a4a4a4" : app.era === "2010" ? "#d4a93c" : app.era === "2003" ? "#c66833" : "#8b1a1a";
      const scoreColor = app.score === 1 ? "#0a8a2c" : app.score === 2 ? "#5cb85c" : app.score === 3 ? "#cc6600" : app.score === 4 ? "#d9534f" : "#8b1a1a";
      return `
      <tr class="app-row" data-kind="local" data-area="${app.area}" data-interface="${app.interface}" data-era="${app.era}" data-family="${app.family}" data-score="${app.score}" data-search="${`${app.displayTitle} ${app.title} ${app.subtitle} ${app.id} ${app.area} ${app.interface} ${app.family} ${app.era}`.toLowerCase()}">
        <td>${index + 1}</td>
        <td><a href="./${app.id}/">${app.displayTitle}</a></td>
        <td>${app.subtitle}</td>
        <td>${app.area}</td>
        <td>${app.interface}</td>
        <td><span style="background:${app.familyStyle.bg};color:${app.familyStyle.color};border:1px solid ${app.familyStyle.color};padding:1px 6px;font-weight:600;font-size:10px;border-radius:2px;">${app.family}</span></td>
        <td><span style="background:${eraColor};color:#fff;padding:1px 6px;font-weight:700;font-size:10px;border-radius:2px;">${app.era}</span></td>
        <td><span title="${app.score === 1 ? "Already modernized" : app.score === 5 ? "Highest RPA / replacement opportunity" : "Mid-tier modernization candidate"}" style="background:${scoreColor};color:#fff;padding:1px 6px;font-weight:700;font-size:10px;border-radius:2px;">${"&#9733;".repeat(app.score)}</span></td>
        <td><code>/${app.id}/</code></td>
      </tr>`;
    }
  )
  .join("");

const hostedCards = hostedApps
  .map(
    (app, index) => `
      <tr class="app-row" data-kind="hosted" data-area="${app.area}" data-interface="${app.interface}" data-era="Modern" data-family="External" data-score="0" data-search="${`${app.title} ${app.subtitle} ${app.url} ${app.area} ${app.interface}`.toLowerCase()}">
        <td>${apps.length + index + 1}</td>
        <td><a href="${app.url}" target="_blank" rel="noreferrer">${app.title}</a></td>
        <td>${app.subtitle}</td>
        <td>${app.area}</td>
        <td>${app.interface}</td>
        <td><span style="background:#e8ebee;color:#5a6772;border:1px solid #5a6772;padding:1px 6px;font-weight:600;font-size:10px;border-radius:2px;">External</span></td>
        <td><span style="background:#00a878;color:#fff;padding:1px 6px;font-weight:700;font-size:10px;border-radius:2px;">Hosted</span></td>
        <td>-</td>
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
        <select id="era-filter" aria-label="Filter by era">
          <option value="">All Eras</option>
          <option value="Modern">Modern</option>
          <option value="2018">2018</option>
          <option value="2014">2014</option>
          <option value="2010">2010</option>
          <option value="2003">2003</option>
          <option value="1998">1998</option>
        </select>
        <select id="family-filter" aria-label="Filter by vendor family">
          <option value="">All Families</option>
          <option value="SAP">SAP</option>
          <option value="Oracle">Oracle</option>
          <option value="IBM">IBM</option>
          <option value="Microsoft">Microsoft</option>
          <option value="SharePoint">SharePoint</option>
          <option value="ServiceNow">ServiceNow</option>
          <option value="Salesforce">Salesforce</option>
          <option value="Bootstrap">Modern Web (Bootstrap)</option>
          <option value="Mainframe">Mainframe</option>
          <option value="Excel">Excel</option>
          <option value="Custom .NET">Custom .NET</option>
        </select>
      </div>
      <div class="content">
        <div class="panel" style="border-left:4px solid #1f497d;">
          <h2 style="background:linear-gradient(to bottom,#dde7f4 0%,#9bb8d8 100%);">Connected RPA Stories - Click any step to see how the platform connects</h2>
          <div class="body">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
              <div style="background:#f0f7ff;border:1px solid #b3c4d8;padding:8px;border-radius:4px;">
                <div style="font-weight:700;color:#1f497d;margin-bottom:4px;">&#129534; Vendor Onboarding to ERP-Eligible</div>
                <ol style="margin:0;padding-left:18px;font-size:11px;line-height:1.6;">
                  <li><a href="./vendor-onboarding-desk/">Vendor Onboarding Desk</a> (intake W9 + bank)</li>
                  <li><a href="./email-intake-bot/">AP/AR Email Bot</a> (parses incoming COI)</li>
                  <li><a href="./modern-vendor-risk/">VendorPulse Risk Cockpit</a> (RPA validates W9/OFAC/COI)</li>
                  <li><a href="./bot-orchestrator-console/">Orchestrator</a> (pushes to ERP master)</li>
                  <li><a href="./erp-command-center/">ERP Command Center</a> (vendor now AP-eligible)</li>
                </ol>
              </div>
              <div style="background:#f0f7ff;border:1px solid #b3c4d8;padding:8px;border-radius:4px;">
                <div style="font-weight:700;color:#1f497d;margin-bottom:4px;">&#129534; Invoice-to-Pay Straight-Through</div>
                <ol style="margin:0;padding-left:18px;font-size:11px;line-height:1.6;">
                  <li><a href="./email-intake-bot/">Email Bot</a> (receives invoice PDF)</li>
                  <li><a href="./document-intelligence-studio/">IDP Studio</a> (OCR + extract fields)</li>
                  <li><a href="./payable-batch-uploader/">Payable Batch Uploader</a> (3-way match)</li>
                  <li><a href="./ap-statement-reconciliation/">AP Recon</a> (reconcile + post)</li>
                  <li><a href="./bank-wire-ach-ops/">Wire/ACH Ops</a> (payment runs)</li>
                </ol>
              </div>
              <div style="background:#f0f7ff;border:1px solid #b3c4d8;padding:8px;border-radius:4px;">
                <div style="font-weight:700;color:#1f497d;margin-bottom:4px;">&#129534; Loan Origination End-to-End</div>
                <ol style="margin:0;padding-left:18px;font-size:11px;line-height:1.6;">
                  <li><a href="./modern-loan-origination/">NorthBank Origination</a> (intake + decision)</li>
                  <li><a href="./document-intelligence-studio/">IDP Studio</a> (parse W2 + paystubs)</li>
                  <li><a href="./loan-servicing-collections/">Loan Servicing</a> (booked + serviced)</li>
                  <li><a href="./bot-orchestrator-console/">Orchestrator</a> (servicing exceptions)</li>
                  <li><a href="./rpa-roi-dashboard/">ROI Dashboard</a> (savings tracking)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div class="panel">
          <h2>Purpose</h2>
          <div class="body">
            This site hosts ${apps.length} fake but believable legacy enterprise front-end simulations plus ${hostedApps.length} related hosted apps in the same Azure/GitHub environment. Every app shows a real-world workflow that RPA, IDP, or modern SaaS can transform. The launcher tags each app with its <strong>era</strong>, <strong>vendor family</strong>, and a <strong>modernization-candidate score (1-5 stars)</strong> - higher stars indicate higher RPA / replacement opportunity. All local portfolio data is seeded and stored in browser localStorage only.
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
                  <th title="Vendor family the UI imitates">Family</th>
                  <th title="Era the app represents">Era</th>
                  <th title="Modernization / RPA candidate score: 1=already modernized, 5=highest opportunity">RPA Score</th>
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
        const eraFilter = document.getElementById("era-filter");
        const familyFilter = document.getElementById("family-filter");
        const rows = Array.from(document.querySelectorAll(".app-row"));
        const countLabel = document.getElementById("app-count-label");
        const total = rows.length;

        function applyFilter() {
          const query = (input.value || "").trim().toLowerCase();
          const areaValue = areaFilter.value;
          const interfaceValue = interfaceFilter.value;
          const kindValue = kindFilter.value;
          const eraValue = eraFilter.value;
          const familyValue = familyFilter.value;
          const isConsoleOnly = consoleFilter.checked;
          let visible = 0;

          rows.forEach((row) => {
            const haystack = row.getAttribute("data-search") || "";
            const rowArea = row.getAttribute("data-area") || "";
            const rowInterface = row.getAttribute("data-interface") || "";
            const rowKind = row.getAttribute("data-kind") || "";
            const rowEra = row.getAttribute("data-era") || "";
            const rowFamily = row.getAttribute("data-family") || "";
            const queryMatch = !query || haystack.includes(query);
            const areaMatch = !areaValue || rowArea === areaValue;
            const interfaceMatch = !interfaceValue || rowInterface === interfaceValue;
            const kindMatch = !kindValue || rowKind === kindValue;
            const eraMatch = !eraValue || rowEra === eraValue;
            const familyMatch = !familyValue || rowFamily === familyValue;
            const consoleMatch = !isConsoleOnly || rowInterface === "Console/Terminal";
            const match = queryMatch && areaMatch && interfaceMatch && kindMatch && consoleMatch && eraMatch && familyMatch;
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
        eraFilter.addEventListener("change", applyFilter);
        familyFilter.addEventListener("change", applyFilter);
      })();
    </script>
  </body>
</html>`;

writeFileSync(join(outputRoot, "index.html"), html);
console.log(`Portfolio site generated at ${outputRoot}`);
