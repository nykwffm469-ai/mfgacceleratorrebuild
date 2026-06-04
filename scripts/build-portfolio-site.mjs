import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const outputRoot = join(root, "portfolio-dist");

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

const appsRoot = join(root, "apps");
const apps = readdirSync(appsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "samplecode")
  .map((entry) => {
    const id = entry.name;
    const appRoot = join(appsRoot, id);
    return {
      id,
      title: toTitleCase(id),
      subtitle: readAppSummary(appRoot),
      distPath: join(appRoot, "dist")
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

const hostedApps = [
  {
    title: "ConsoleApp",
    subtitle: "Companion static app hosted in the same Azure resource group.",
    url: "https://thankful-meadow-04346941e.7.azurestaticapps.net/"
  },
  {
    title: "LegacyCRM",
    subtitle: "Legacy CRM deployment in the shared Azure/GitHub environment.",
    url: "https://blue-mushroom-0b3ccdf1e.7.azurestaticapps.net/"
  },
  {
    title: "sample-fluent-app",
    subtitle: "Sample app deployment in the same Static Web Apps subscription.",
    url: "https://lively-ground-06a5b600f.7.azurestaticapps.net/"
  },
  {
    title: "sample-hello-world",
    subtitle: "Sample hello-world static app from the shared repository environment.",
    url: "https://proud-mushroom-075a41d0f.7.azurestaticapps.net/"
  },
  {
    title: "sample-static-asset-tracker",
    subtitle: "Sample static asset tracker app hosted in the same Azure tenant.",
    url: "https://lively-tree-02acf510f.7.azurestaticapps.net/"
  },
  {
    title: "sample-tanstack-app",
    subtitle: "Sample TanStack app deployment available in the shared environment.",
    url: "https://calm-forest-0e41e330f.7.azurestaticapps.net/"
  },
  {
    title: "SupplierPortal",
    subtitle: "Supplier-facing portal hosted alongside the legacy portfolio apps.",
    url: "https://agreeable-bush-06e58e71e.7.azurestaticapps.net/"
  }
].sort((a, b) => a.title.localeCompare(b.title));

const totalAppCount = apps.length + hostedApps.length;

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
      <tr class="app-row" data-kind="local" data-search="${`${app.title} ${app.subtitle} ${app.id}`.toLowerCase()}">
        <td>${index + 1}</td>
        <td><a href="./${app.id}/">${app.title}</a></td>
        <td>${app.subtitle}</td>
        <td>Local</td>
        <td><code>/${app.id}/</code></td>
      </tr>`
  )
  .join("");

const hostedCards = hostedApps
  .map(
    (app, index) => `
      <tr class="app-row" data-kind="hosted" data-search="${`${app.title} ${app.subtitle} ${app.url}`.toLowerCase()}">
        <td>${apps.length + index + 1}</td>
        <td><a href="${app.url}" target="_blank" rel="noreferrer">${app.title}</a></td>
        <td>${app.subtitle}</td>
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
        width: 280px;
        background: #fcfdff;
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
        <input id="app-search" type="search" placeholder="Search apps, workflow, or URL..." aria-label="Search applications" />
      </div>
      <div class="content">
        <div class="panel">
          <h2>Purpose</h2>
          <div class="body">
            This site hosts ${apps.length} fake but believable legacy enterprise front-end simulations plus ${hostedApps.length} related hosted apps in the same Azure/GitHub environment. All local portfolio data is seeded and stored in browser localStorage only.
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
        const rows = Array.from(document.querySelectorAll(".app-row"));
        const countLabel = document.getElementById("app-count-label");
        const total = rows.length;

        function applyFilter() {
          const query = (input.value || "").trim().toLowerCase();
          let visible = 0;

          rows.forEach((row) => {
            const haystack = row.getAttribute("data-search") || "";
            const match = !query || haystack.includes(query);
            row.style.display = match ? "" : "none";
            if (match) visible += 1;
          });

          countLabel.textContent = "Showing " + visible + " of " + total + " apps";
        }

        input.addEventListener("input", applyFilter);
      })();
    </script>
  </body>
</html>`;

writeFileSync(join(outputRoot, "index.html"), html);
console.log(`Portfolio site generated at ${outputRoot}`);
