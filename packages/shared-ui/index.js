const FAMILY_STYLES = [
  {
    family: "webforms",
    navPattern: "sidebar-buttons",
    density: "normal",
    buttonStyle: "bevel",
    gridStyle: "classic",
    font: "Tahoma, Verdana, Arial, sans-serif",
    vars: {
      "--legacy-bg": "#d9dde2",
      "--legacy-panel": "#f2f3f5",
      "--legacy-border": "#808a96",
      "--legacy-text": "#1a1f26",
      "--legacy-muted": "#4e5a66",
      "--legacy-nav": "#c9d2dc",
      "--legacy-toolbar-top": "#fefefe",
      "--legacy-toolbar-bottom": "#bcc7d2",
      "--legacy-button-top": "#ffffff",
      "--legacy-button-bottom": "#c0cad5",
      "--legacy-active": "#234f84",
      "--legacy-grid-head": "#d2dae3",
      "--legacy-grid-row": "#f6f8fa",
      "--legacy-grid-row-alt": "#edf1f5"
    }
  },
  {
    family: "winforms",
    navPattern: "tree-list",
    density: "compact",
    buttonStyle: "flat",
    gridStyle: "dense",
    font: "Segoe UI, Tahoma, Arial, sans-serif",
    vars: {
      "--legacy-bg": "#d5d9de",
      "--legacy-panel": "#eceff3",
      "--legacy-border": "#7d8792",
      "--legacy-text": "#12161b",
      "--legacy-muted": "#47515c",
      "--legacy-nav": "#c2ccd7",
      "--legacy-toolbar-top": "#e3e8ee",
      "--legacy-toolbar-bottom": "#c1c9d4",
      "--legacy-button-top": "#f5f8fb",
      "--legacy-button-bottom": "#cfd7e2",
      "--legacy-active": "#1e4a74",
      "--legacy-grid-head": "#ccd6e2",
      "--legacy-grid-row": "#f4f7fb",
      "--legacy-grid-row-alt": "#e8eef5"
    }
  },
  {
    family: "oracle",
    navPattern: "sidebar-list",
    density: "compact",
    buttonStyle: "square",
    gridStyle: "striped",
    font: "\"MS Sans Serif\", Tahoma, Arial, sans-serif",
    vars: {
      "--legacy-bg": "#d8d5cf",
      "--legacy-panel": "#f0ece5",
      "--legacy-border": "#877d70",
      "--legacy-text": "#1f1a16",
      "--legacy-muted": "#5e5143",
      "--legacy-nav": "#d0c4b2",
      "--legacy-toolbar-top": "#efe3d1",
      "--legacy-toolbar-bottom": "#ccb79d",
      "--legacy-button-top": "#fff8ef",
      "--legacy-button-bottom": "#dcc5a6",
      "--legacy-active": "#8b4f1f",
      "--legacy-grid-head": "#dbc7af",
      "--legacy-grid-row": "#f8f2ea",
      "--legacy-grid-row-alt": "#efe4d7"
    }
  },
  {
    family: "sharepoint",
    navPattern: "top-tabs",
    density: "normal",
    buttonStyle: "rounded",
    gridStyle: "soft",
    font: "Calibri, Arial, sans-serif",
    vars: {
      "--legacy-bg": "#dbe3eb",
      "--legacy-panel": "#f0f5fa",
      "--legacy-border": "#7a8a9b",
      "--legacy-text": "#1c2b3b",
      "--legacy-muted": "#556476",
      "--legacy-nav": "#c8d7e6",
      "--legacy-toolbar-top": "#f5f9fd",
      "--legacy-toolbar-bottom": "#c7d7e8",
      "--legacy-button-top": "#ffffff",
      "--legacy-button-bottom": "#d5e3f2",
      "--legacy-active": "#2d5f93",
      "--legacy-grid-head": "#d4e1ef",
      "--legacy-grid-row": "#f6fafe",
      "--legacy-grid-row-alt": "#edf4fb"
    }
  },
  {
    family: "bootstrap2",
    navPattern: "menu-compact",
    density: "normal",
    buttonStyle: "pill",
    gridStyle: "bordered",
    font: "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
    vars: {
      "--legacy-bg": "#d8d8d8",
      "--legacy-panel": "#f2f2f2",
      "--legacy-border": "#9a9a9a",
      "--legacy-text": "#222222",
      "--legacy-muted": "#666666",
      "--legacy-nav": "#cecece",
      "--legacy-toolbar-top": "#f7f7f7",
      "--legacy-toolbar-bottom": "#d2d2d2",
      "--legacy-button-top": "#ffffff",
      "--legacy-button-bottom": "#d9d9d9",
      "--legacy-active": "#0f5b9c",
      "--legacy-grid-head": "#e1e1e1",
      "--legacy-grid-row": "#f9f9f9",
      "--legacy-grid-row-alt": "#efefef"
    }
  },
  {
    family: "inhouse",
    navPattern: "sidebar-buttons",
    density: "cozy",
    buttonStyle: "sunken",
    gridStyle: "hard",
    font: "Verdana, Tahoma, Arial, sans-serif",
    vars: {
      "--legacy-bg": "#d9e0d9",
      "--legacy-panel": "#eff5ef",
      "--legacy-border": "#748674",
      "--legacy-text": "#1b261b",
      "--legacy-muted": "#4f5f4f",
      "--legacy-nav": "#c8d6c8",
      "--legacy-toolbar-top": "#f5faf5",
      "--legacy-toolbar-bottom": "#c4d4c4",
      "--legacy-button-top": "#f9fff9",
      "--legacy-button-bottom": "#c6d9c6",
      "--legacy-active": "#2f6a2f",
      "--legacy-grid-head": "#d5e2d5",
      "--legacy-grid-row": "#f5fbf5",
      "--legacy-grid-row-alt": "#ebf4eb"
    }
  },
  {
    family: "outsourced",
    navPattern: "top-tabs",
    density: "compact",
    buttonStyle: "outline",
    gridStyle: "striped",
    font: "Trebuchet MS, Arial, sans-serif",
    vars: {
      "--legacy-bg": "#e0dad2",
      "--legacy-panel": "#f6f0e9",
      "--legacy-border": "#8f7f6d",
      "--legacy-text": "#2d2116",
      "--legacy-muted": "#6b5b49",
      "--legacy-nav": "#d7cabc",
      "--legacy-toolbar-top": "#fdf7f1",
      "--legacy-toolbar-bottom": "#d9c7b5",
      "--legacy-button-top": "#fffdf9",
      "--legacy-button-bottom": "#e5d2bd",
      "--legacy-active": "#7b4a24",
      "--legacy-grid-head": "#e4d2bf",
      "--legacy-grid-row": "#fcf7f2",
      "--legacy-grid-row-alt": "#f3e8dc"
    }
  }
];

function hashText(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function iconForLabel(label) {
  const first = label?.trim()?.charAt(0)?.toUpperCase() || "M";
  return `[${first}]`;
}

function buildLegacyIdentity({ title, modules, identityKey }) {
  const seed = identityKey || `${title}|${modules.map((m) => m.id).join("|")}`;
  const hash = hashText(seed);
  const family = FAMILY_STYLES[hash % FAMILY_STYLES.length];
  const hueShift = hash % 22;
  const titleShade = 100 - (hash % 8) * 4;
  const menuVerb = ["Admin", "Records", "Queues", "Actions", "Tools", "Reports", "Window", "Help"][hash % 8];

  const vars = {
    ...family.vars,
    "--legacy-hue-shift": `${hueShift}deg`,
    "--legacy-title-shade": `${titleShade}%`,
    "--legacy-font": family.font
  };

  return {
    ...family,
    vars,
    menuVerb
  };
}

function styleVarsToInline(vars) {
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}

function renderNav({ modules, activeModule, navPattern }) {
  if (navPattern === "tree-list") {
    return modules
      .map(
        (mod, index) =>
          `<button class=\"legacy-nav-item ${mod.id === activeModule ? "active" : ""}\" data-module=\"${mod.id}\">${index % 2 === 0 ? "[+]" : "[-]"} ${mod.label}</button>`
      )
      .join("");
  }

  if (navPattern === "sidebar-list") {
    return `<ul class=\"legacy-list-nav\">${modules
      .map(
        (mod) =>
          `<li><button class=\"legacy-nav-item ${mod.id === activeModule ? "active" : ""}\" data-module=\"${mod.id}\">${mod.label}</button></li>`
      )
      .join("")}</ul>`;
  }

  if (navPattern === "menu-compact") {
    return modules
      .map(
        (mod) =>
          `<button class=\"legacy-nav-item compact ${mod.id === activeModule ? "active" : ""}\" data-module=\"${mod.id}\">${iconForLabel(mod.label)} ${mod.label}</button>`
      )
      .join("");
  }

  return modules
    .map(
      (mod) =>
        `<button class=\"legacy-nav-item ${mod.id === activeModule ? "active" : ""}\" data-module=\"${mod.id}\">${mod.label}</button>`
    )
    .join("");
}

function renderTopTabs({ modules, activeModule }) {
  return `<div class=\"legacy-top-tabs\">${modules
    .map(
      (mod) =>
        `<button class=\"legacy-top-tab ${mod.id === activeModule ? "active" : ""}\" data-module=\"${mod.id}\">${mod.label}</button>`
    )
    .join("")}</div>`;
}

function renderMenuBar({ modules, menuVerb }) {
  const staticMenus = ["File", "Edit", "View", menuVerb, "Admin", "Help"];
  const dynamic = modules.slice(0, 2).map((mod) => mod.label);
  return `<div class=\"legacy-menubar\">${[...staticMenus, ...dynamic]
    .map((item) => `<span class=\"legacy-menu-item\">${item}</span>`)
    .join("")}</div>`;
}

export function appShell({ title, modules, activeModule, toolbarButtons, statusText, contentHtml, identityKey }) {
  const identity = buildLegacyIdentity({ title, modules, identityKey });
  const navHtml = renderNav({ modules, activeModule, navPattern: identity.navPattern });
  const toolbarHtml = toolbarButtons
    .map((btn) => `<button class=\"legacy-btn\" data-action=\"${btn.id}\">${btn.label}</button>`)
    .join("");

  return `
    <div class=\"legacy-window legacy-family-${identity.family}\" data-nav-pattern=\"${identity.navPattern}\" data-density=\"${identity.density}\" data-button-style=\"${identity.buttonStyle}\" data-grid-style=\"${identity.gridStyle}\" style=\"${styleVarsToInline(identity.vars)}\">
      <div class=\"legacy-titlebar\">
        <span>${title}</span>
        <a class=\"legacy-backlink\" href=\"../\" aria-label=\"Back to main page\">Main</a>
      </div>
      ${renderMenuBar({ modules, menuVerb: identity.menuVerb })}
      <div class=\"legacy-toolbar\">${toolbarHtml}</div>
      ${identity.navPattern === "top-tabs" ? renderTopTabs({ modules, activeModule }) : ""}
      <div class=\"legacy-layout\">
        ${identity.navPattern === "top-tabs" ? "" : `<aside class=\"legacy-nav\">${navHtml}</aside>`}
        <main class=\"legacy-main\">${contentHtml}</main>
      </div>
      <div class=\"legacy-statusbar\">${statusText}</div>
    </div>
  `;
}

export function panel(title, body) {
  return `
    <section class=\"legacy-panel\">
      <div class=\"legacy-panel-head\">${title}</div>
      <div class=\"legacy-panel-body\">${body}</div>
    </section>
  `;
}

export function dataGrid(columns, rows) {
  const head = columns.map((col) => `<th>${col}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell ?? ""}</td>`).join("")}</tr>`)
    .join("");

  return `<table class=\"legacy-grid\"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export function tabs(items, activeId) {
  return `
    <div class=\"legacy-tabs\">
      ${items
        .map(
          (item) =>
            `<button class=\"legacy-tab ${item.id === activeId ? "active" : ""}\" data-tab=\"${item.id}\">${item.label}</button>`
        )
        .join("")}
    </div>
  `;
}
