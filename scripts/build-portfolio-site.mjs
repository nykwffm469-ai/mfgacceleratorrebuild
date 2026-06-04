import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const outputRoot = join(root, "portfolio-dist");

const apps = [
  {
    id: "crm-classic",
    title: "CRM Classic",
    subtitle: "2008-2011 style CRM for accounts, contacts, opportunities, activities, and dashboard views.",
    distPath: join(root, "apps", "crm-classic", "dist")
  },
  {
    id: "warehouse-terminal",
    title: "Warehouse Terminal",
    subtitle: "AS/400-inspired inventory and shipment terminal with fixed-width status screens.",
    distPath: join(root, "apps", "warehouse-terminal", "dist")
  },
  {
    id: "hr-portal",
    title: "HR Portal",
    subtitle: "SharePoint-era onboarding and internal approvals portal with task and policy tracking.",
    distPath: join(root, "apps", "hr-portal", "dist")
  },
  {
    id: "procurement-pro",
    title: "Procurement Pro",
    subtitle: "Legacy purchasing workspace for requisitions, vendors, POs, invoice queues, and approvals.",
    distPath: join(root, "apps", "procurement-pro", "dist")
  },
  {
    id: "helpdesk-ops",
    title: "Helpdesk Ops",
    subtitle: "Internal service desk with ticket queues, SLA tracking, assignments, and knowledge items.",
    distPath: join(root, "apps", "helpdesk-ops", "dist")
  },
  {
    id: "finance-ledger",
    title: "Finance Ledger",
    subtitle: "Journal posting, account balances, aging, period-close tasks, and exception queues.",
    distPath: join(root, "apps", "finance-ledger", "dist")
  },
  {
    id: "claims-desk",
    title: "Claims Desk",
    subtitle: "Claims intake, adjuster routing, reserve tracking, payments, and appeal handling.",
    distPath: join(root, "apps", "claims-desk", "dist")
  },
  {
    id: "project-tracker",
    title: "Project Tracker",
    subtitle: "PMO-style projects, milestones, risks, issues, and dependency management.",
    distPath: join(root, "apps", "project-tracker", "dist")
  },
  {
    id: "maintenance-cmms",
    title: "Maintenance CMMS",
    subtitle: "Work order control, preventive maintenance, assets, parts, and downtime history.",
    distPath: join(root, "apps", "maintenance-cmms", "dist")
  },
  {
    id: "field-dispatch",
    title: "Field Dispatch",
    subtitle: "Dispatch board, technician assignment, route logs, and check-in records.",
    distPath: join(root, "apps", "field-dispatch", "dist")
  },
  {
    id: "billing-collections",
    title: "Billing Collections",
    subtitle: "Invoice queues, dunning workflow, dispute tracking, and payment promise logs.",
    distPath: join(root, "apps", "billing-collections", "dist")
  },
  {
    id: "legal-docket",
    title: "Legal Docket",
    subtitle: "Case dockets, hearings, counsel workload, evidence tracking, and filing calendars.",
    distPath: join(root, "apps", "legal-docket", "dist")
  },
  {
    id: "compliance-register",
    title: "Compliance Register",
    subtitle: "Controls inventory, findings, remediation plans, attestations, and audit windows.",
    distPath: join(root, "apps", "compliance-register", "dist")
  },
  {
    id: "fleet-ops",
    title: "Fleet Ops",
    subtitle: "Vehicle units, dispatch routes, service bookings, fuel logs, and incident records.",
    distPath: join(root, "apps", "fleet-ops", "dist")
  },
  {
    id: "quality-audit",
    title: "Quality Audit",
    subtitle: "Inspection lots, NCR records, CAPA actions, release gates, and quality metrics.",
    distPath: join(root, "apps", "quality-audit", "dist")
  }
];

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
    (app) => `
      <tr>
        <td><a href="./${app.id}/">${app.title}</a></td>
        <td>${app.subtitle}</td>
        <td><code>/${app.id}/</code></td>
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
    </style>
  </head>
  <body>
    <div class="window">
      <div class="titlebar">Legacy Enterprise Application Portfolio</div>
      <div class="toolbar">
        <span>Environment: Demo</span>
        <span>Hosting: Azure Static Web Apps</span>
        <span>Mode: Read/Write localStorage</span>
      </div>
      <div class="content">
        <div class="panel">
          <h2>Purpose</h2>
          <div class="body">
            This site hosts fifteen fake but believable legacy enterprise front-end simulations designed for modernization demos. All data is seeded locally and stored in browser localStorage only.
          </div>
        </div>
        <div class="panel">
          <h2>Applications</h2>
          <div class="body">
            <table>
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Description</th>
                  <th>Path</th>
                </tr>
              </thead>
              <tbody>${cards}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

writeFileSync(join(outputRoot, "index.html"), html);
console.log(`Portfolio site generated at ${outputRoot}`);
