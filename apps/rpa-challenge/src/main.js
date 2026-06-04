import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "rpa-challenge";
const modules = [
  { id: "challenge", label: "Challenge Form" },
  { id: "submissions", label: "Submissions" },
  { id: "telemetry", label: "Telemetry" }
];
const columns = {
  challenge: ["field", "currentOrder", "note", "seed", "status"],
  submissions: ["submissionId", "firstName", "lastName", "email", "company"],
  telemetry: ["eventId", "eventType", "detail", "eventTime", "status"]
};
const allFields = [
  {
    "key": "firstName",
    "label": "First Name"
  },
  {
    "key": "lastName",
    "label": "Last Name"
  },
  {
    "key": "email",
    "label": "Email"
  },
  {
    "key": "company",
    "label": "Company"
  },
  {
    "key": "role",
    "label": "Role"
  },
  {
    "key": "phone",
    "label": "Phone"
  },
  {
    "key": "city",
    "label": "City"
  },
  {
    "key": "country",
    "label": "Country"
  },
  {
    "key": "startDate",
    "label": "Start Date"
  },
  {
    "key": "referenceId",
    "label": "Reference ID"
  }
];
let activeModule = "challenge";

ensureSeed(namespace, () => ({
  challenge: allFields.map((f, idx) => ({ field: f.label, currentOrder: String(idx + 1), note: "Initial", seed: "static", status: "Ready" })),
  submissions: [],
  telemetry: [{ eventId: "EV-1", eventType: "Init", detail: "Field map loaded", eventTime: new Date().toISOString(), status: "OK" }],
  fieldOrder: allFields.map((f) => f.key)
}));

function shuffle(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function challengeForm(data) {
  const order = data.fieldOrder || allFields.map((f) => f.key);
  const byKey = Object.fromEntries(allFields.map((f) => [f.key, f]));
  const rows = order
    .map((key) => byKey[key])
    .filter(Boolean)
    .map((f) => `<label for="fld-${f.key}">${f.label}</label><input class="legacy-field" id="fld-${f.key}" name="${f.key}" />`)
    .join("");

  return `<form id="challenge-form"><div class="legacy-form-grid">${rows}</div><div style="margin-top:8px;display:flex;gap:4px;"><button class="legacy-btn" type="submit">Submit + Scramble</button></div></form>`;
}

function render() {
  const data = loadSeed(namespace, () => ({}));
  const gridRows = data[activeModule].map((row) => columns[activeModule].map((key) => row[key]));
  const grid = dataGrid(columns[activeModule], gridRows);

  let content = panel("RPA Challenge Data", grid);
  if (activeModule === "challenge") {
    content += panel("Form", challengeForm(data));
  }

  document.getElementById("app").innerHTML = appShell({
    title: "RPA Challenge 1.0",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "scramble", label: "Scramble Now" },
      { id: "reset", label: "Reset Seed" }
    ],
    statusText: "Purpose: self-healing selector and resilient automation testing",
    contentHtml: content
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const latest = loadSeed(namespace, () => ({}));
      const action = button.getAttribute("data-action");
      if (action === "scramble") {
        latest.fieldOrder = shuffle(latest.fieldOrder || allFields.map((f) => f.key));
        latest.challenge = latest.fieldOrder.map((k, idx) => {
          const f = allFields.find((x) => x.key === k);
          return { field: f?.label || k, currentOrder: String(idx + 1), note: "Scrambled", seed: "dynamic", status: "Ready" };
        });
        latest.telemetry.unshift({ eventId: makeId("EV"), eventType: "Scramble", detail: "Manual scramble", eventTime: new Date().toISOString(), status: "OK" });
      }
      if (action === "reset") {
        localStorage.removeItem(`legacy-demo:${namespace}`);
      } else {
        saveSeed(namespace, latest);
      }
      render();
    });
  });

  const form = document.getElementById("challenge-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const latest = loadSeed(namespace, () => ({}));
      const fd = new FormData(form);
      const row = {
        submissionId: makeId("SUB"),
        firstName: fd.get("firstName")?.toString() || "",
        lastName: fd.get("lastName")?.toString() || "",
        email: fd.get("email")?.toString() || "",
        company: fd.get("company")?.toString() || ""
      };
      latest.submissions.unshift(row);
      latest.fieldOrder = shuffle(latest.fieldOrder || allFields.map((f) => f.key));
      latest.challenge = latest.fieldOrder.map((k, idx) => {
        const f = allFields.find((x) => x.key === k);
        return { field: f?.label || k, currentOrder: String(idx + 1), note: "Scrambled on submit", seed: "dynamic", status: "Ready" };
      });
      latest.telemetry.unshift({ eventId: makeId("EV"), eventType: "Submit", detail: "Form submitted and fields scrambled", eventTime: new Date().toISOString(), status: "OK" });
      saveSeed(namespace, latest);
      activeModule = "challenge";
      render();
    });
  }
}

render();
