export function appShell({ title, modules, activeModule, toolbarButtons, statusText, contentHtml }) {
  const navHtml = modules
    .map(
      (mod) =>
        `<button class=\"legacy-nav-item ${mod.id === activeModule ? "active" : ""}\" data-module=\"${mod.id}\">${mod.label}</button>`
    )
    .join("");

  const toolbarHtml = toolbarButtons
    .map((btn) => `<button class=\"legacy-btn\" data-action=\"${btn.id}\">${btn.label}</button>`)
    .join("");

  return `
    <div class=\"legacy-window\">
      <div class="legacy-titlebar">
        <span>${title}</span>
        <a class="legacy-backlink" href="../" aria-label="Back to main page">Main</a>
      </div>
      <div class=\"legacy-toolbar\">${toolbarHtml}</div>
      <div class=\"legacy-layout\">
        <aside class=\"legacy-nav\">${navHtml}</aside>
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
