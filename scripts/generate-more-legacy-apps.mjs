import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const apps = [
  {
    slug: 'finance-ledger',
    title: 'Finance Ledger 2003',
    summary: 'General ledger posting, journal review, aging and close cycle controls.',
    namespace: 'finance-ledger',
    modules: [
      ['journals','Journals'],
      ['accounts','Accounts'],
      ['aging','Aging'],
      ['close','Period Close'],
      ['exceptions','Exceptions']
    ],
    columns: {
      journals: ['journalId','period','owner','amount','status'],
      accounts: ['accountNo','name','type','balance','status'],
      aging: ['customer','bucket30','bucket60','bucket90','status'],
      close: ['taskId','task','owner','dueDate','status'],
      exceptions: ['exceptionId','source','severity','owner','status']
    },
    seed: {
      journals: [
        { journalId:'JRN-1001', period:'2003-09', owner:'L. Drake', amount:'18920', status:'Posted' },
        { journalId:'JRN-1002', period:'2003-09', owner:'A. Nori', amount:'-6100', status:'Pending' }
      ],
      accounts: [
        { accountNo:'400100', name:'Revenue Main', type:'Income', balance:'442100', status:'Open' },
        { accountNo:'510220', name:'Travel Expense', type:'Expense', balance:'31890', status:'Open' }
      ],
      aging: [
        { customer:'Northwind Retail', bucket30:'8200', bucket60:'2100', bucket90:'500', status:'Watch' },
        { customer:'Alpine Stores', bucket30:'12200', bucket60:'0', bucket90:'0', status:'Current' }
      ],
      close: [
        { taskId:'CLS-01', task:'Bank Reconciliation', owner:'Treasury', dueDate:'2003-09-28', status:'Open' }
      ],
      exceptions: [
        { exceptionId:'EX-88', source:'AP Batch', severity:'Medium', owner:'Finance Ops', status:'Open' }
      ]
    },
    palette: {
      '--legacy-bg':'#ddd8ce',
      '--legacy-panel':'#f6f1e7',
      '--legacy-nav':'#d2cabd',
      '--legacy-grid-head':'#d8d0c3',
      '--legacy-active':'#7a4b1d'
    }
  },
  {
    slug: 'claims-desk',
    title: 'Claims Desk 2001',
    summary: 'Claims intake, adjuster assignment, reserve updates and payout queue.',
    namespace: 'claims-desk',
    modules: [
      ['intake','Intake'],
      ['adjusters','Adjusters'],
      ['reserves','Reserves'],
      ['payments','Payments'],
      ['appeals','Appeals']
    ],
    columns: {
      intake: ['claimId','policyNo','lossDate','category','status'],
      adjusters: ['adjuster','region','openClaims','tier','status'],
      reserves: ['claimId','initialReserve','currentReserve','owner','status'],
      payments: ['paymentId','claimId','payee','amount','status'],
      appeals: ['appealId','claimId','reviewer','nextStep','status']
    },
    seed: {
      intake: [
        { claimId:'CLM-4431', policyNo:'POL-22018', lossDate:'2001-04-09', category:'Property', status:'Open' },
        { claimId:'CLM-4432', policyNo:'POL-11910', lossDate:'2001-04-10', category:'Auto', status:'Queued' }
      ],
      adjusters: [
        { adjuster:'P. Mendez', region:'NW', openClaims:'19', tier:'Senior', status:'Active' },
        { adjuster:'R. Lane', region:'SE', openClaims:'27', tier:'Standard', status:'Busy' }
      ],
      reserves: [
        { claimId:'CLM-4431', initialReserve:'9000', currentReserve:'11200', owner:'P. Mendez', status:'Revised' }
      ],
      payments: [
        { paymentId:'PAY-1108', claimId:'CLM-4431', payee:'Beacon Glass', amount:'1400', status:'Pending' }
      ],
      appeals: [
        { appealId:'APL-77', claimId:'CLM-4211', reviewer:'Committee A', nextStep:'Doc Review', status:'Open' }
      ]
    },
    palette: {
      '--legacy-bg':'#d4d8df',
      '--legacy-panel':'#eef1f6',
      '--legacy-nav':'#c7cfdb',
      '--legacy-grid-head':'#cfd8e5',
      '--legacy-active':'#2c4e77'
    }
  },
  {
    slug: 'project-tracker',
    title: 'Project Tracker PMO 2004',
    summary: 'Portfolio milestones, RAID logs, dependencies and PMO action tracking.',
    namespace: 'project-tracker',
    modules: [
      ['projects','Projects'],
      ['milestones','Milestones'],
      ['risks','Risks'],
      ['issues','Issues'],
      ['dependencies','Dependencies']
    ],
    columns: {
      projects: ['projectId','name','sponsor','budget','status'],
      milestones: ['milestoneId','projectId','targetDate','owner','status'],
      risks: ['riskId','projectId','impact','owner','status'],
      issues: ['issueId','projectId','category','assignee','status'],
      dependencies: ['dependencyId','projectId','externalTeam','needBy','status']
    },
    seed: {
      projects: [
        { projectId:'PRJ-900', name:'Plant Upgrade', sponsor:'Ops VP', budget:'340000', status:'Amber' },
        { projectId:'PRJ-901', name:'Regional Rollout', sponsor:'Sales VP', budget:'220000', status:'Green' }
      ],
      milestones: [
        { milestoneId:'MS-31', projectId:'PRJ-900', targetDate:'2004-10-20', owner:'PMO', status:'Open' }
      ],
      risks: [
        { riskId:'R-12', projectId:'PRJ-900', impact:'High', owner:'Program Mgr', status:'Mitigate' }
      ],
      issues: [
        { issueId:'I-07', projectId:'PRJ-901', category:'Vendor', assignee:'S. Cho', status:'Open' }
      ],
      dependencies: [
        { dependencyId:'D-55', projectId:'PRJ-900', externalTeam:'Network', needBy:'2004-09-25', status:'Pending' }
      ]
    },
    palette: {
      '--legacy-bg':'#dadade',
      '--legacy-panel':'#f2f2f6',
      '--legacy-nav':'#cecee0',
      '--legacy-grid-head':'#d6d6e7',
      '--legacy-active':'#5f4d88'
    }
  },
  {
    slug: 'maintenance-cmms',
    title: 'CMMS Workbench 2000',
    summary: 'Work orders, preventive maintenance routes, parts bins and downtime logs.',
    namespace: 'maintenance-cmms',
    modules: [
      ['workorders','Work Orders'],
      ['pm','PM Routes'],
      ['assets','Assets'],
      ['parts','Parts Bin'],
      ['downtime','Downtime']
    ],
    columns: {
      workorders: ['woId','asset','priority','tech','status'],
      pm: ['routeId','frequency','assetClass','owner','status'],
      assets: ['assetId','name','line','criticality','status'],
      parts: ['partId','description','bin','qty','status'],
      downtime: ['eventId','asset','durationMin','cause','status']
    },
    seed: {
      workorders: [
        { woId:'WO-5001', asset:'Compressor 4', priority:'Urgent', tech:'A. Cole', status:'Assigned' },
        { woId:'WO-5002', asset:'Conveyor 2', priority:'Normal', tech:'J. Nix', status:'Open' }
      ],
      pm: [
        { routeId:'PM-A1', frequency:'Weekly', assetClass:'Hydraulic', owner:'Reliability', status:'Active' }
      ],
      assets: [
        { assetId:'AST-223', name:'Mixer 7', line:'L3', criticality:'High', status:'Running' }
      ],
      parts: [
        { partId:'PT-908', description:'Drive Belt', bin:'B12', qty:'14', status:'In Stock' }
      ],
      downtime: [
        { eventId:'DT-01', asset:'Compressor 4', durationMin:'48', cause:'Seal', status:'Closed' }
      ]
    },
    palette: {
      '--legacy-bg':'#d6ddd6',
      '--legacy-panel':'#eef4ee',
      '--legacy-nav':'#c7d3c7',
      '--legacy-grid-head':'#cedccb',
      '--legacy-active':'#3c6f3a'
    }
  },
  {
    slug: 'field-dispatch',
    title: 'Field Dispatch 2002',
    summary: 'Service board, route assignments, technician check-ins and call completion logs.',
    namespace: 'field-dispatch',
    modules: [
      ['board','Dispatch Board'],
      ['techs','Technicians'],
      ['routes','Routes'],
      ['calls','Service Calls'],
      ['checks','Check-ins']
    ],
    columns: {
      board: ['slot','region','tech','call','status'],
      techs: ['techId','name','zone','skills','status'],
      routes: ['routeId','techId','stops','eta','status'],
      calls: ['callId','customer','type','priority','status'],
      checks: ['checkId','techId','time','location','status']
    },
    seed: {
      board: [
        { slot:'08:00', region:'North', tech:'T-14', call:'C-910', status:'Assigned' },
        { slot:'08:30', region:'Central', tech:'T-09', call:'C-911', status:'Queued' }
      ],
      techs: [
        { techId:'T-14', name:'H. Quinn', zone:'North', skills:'HVAC', status:'Online' }
      ],
      routes: [
        { routeId:'R-88', techId:'T-14', stops:'6', eta:'08:20', status:'Running' }
      ],
      calls: [
        { callId:'C-910', customer:'Beacon Labs', type:'Repair', priority:'High', status:'Open' }
      ],
      checks: [
        { checkId:'K-300', techId:'T-14', time:'08:07', location:'Depot 2', status:'Received' }
      ]
    },
    palette: {
      '--legacy-bg':'#ddd6cc',
      '--legacy-panel':'#f5eee4',
      '--legacy-nav':'#d5cab9',
      '--legacy-grid-head':'#dfd2be',
      '--legacy-active':'#8a5a1f'
    }
  },
  {
    slug: 'billing-collections',
    title: 'Billing & Collections 2001',
    summary: 'Invoice batches, dunning steps, collection notes and dispute queues.',
    namespace: 'billing-collections',
    modules: [
      ['invoices','Invoices'],
      ['dunning','Dunning'],
      ['notes','Collection Notes'],
      ['disputes','Disputes'],
      ['promises','Promise to Pay']
    ],
    columns: {
      invoices: ['invoiceId','customer','amount','dueDate','status'],
      dunning: ['stepId','customer','stage','owner','status'],
      notes: ['noteId','customer','collector','summary','status'],
      disputes: ['disputeId','invoiceId','reason','owner','status'],
      promises: ['promiseId','customer','amount','promiseDate','status']
    },
    seed: {
      invoices: [
        { invoiceId:'INV-7001', customer:'Delta Foods', amount:'9200', dueDate:'2001-06-12', status:'Overdue' },
        { invoiceId:'INV-7002', customer:'Orion Supply', amount:'4100', dueDate:'2001-06-20', status:'Open' }
      ],
      dunning: [
        { stepId:'DUN-12', customer:'Delta Foods', stage:'Letter 2', owner:'Collections', status:'Active' }
      ],
      notes: [
        { noteId:'N-55', customer:'Delta Foods', collector:'M. Vega', summary:'Callback requested', status:'Open' }
      ],
      disputes: [
        { disputeId:'DSP-08', invoiceId:'INV-6902', reason:'Qty mismatch', owner:'AR Ops', status:'Pending' }
      ],
      promises: [
        { promiseId:'PTP-91', customer:'Delta Foods', amount:'3000', promiseDate:'2001-06-18', status:'Tracked' }
      ]
    },
    palette: {
      '--legacy-bg':'#d5dce2',
      '--legacy-panel':'#edf2f7',
      '--legacy-nav':'#c7d2df',
      '--legacy-grid-head':'#d0dbe8',
      '--legacy-active':'#375f89'
    }
  },
  {
    slug: 'legal-docket',
    title: 'Legal Docket 1999',
    summary: 'Case files, hearing dates, counsel assignments and evidence register.',
    namespace: 'legal-docket',
    modules: [
      ['cases','Cases'],
      ['hearings','Hearings'],
      ['counsel','Counsel'],
      ['evidence','Evidence'],
      ['filings','Filings']
    ],
    columns: {
      cases: ['caseNo','title','court','owner','status'],
      hearings: ['hearingId','caseNo','date','judge','status'],
      counsel: ['counselId','name','specialty','caseload','status'],
      evidence: ['itemId','caseNo','category','custodian','status'],
      filings: ['filingId','caseNo','type','dueDate','status']
    },
    seed: {
      cases: [
        { caseNo:'LC-2281', title:'Riverside Contract', court:'County', owner:'G. Hale', status:'Open' },
        { caseNo:'LC-2282', title:'Harbor Lease', court:'State', owner:'K. Bell', status:'Review' }
      ],
      hearings: [
        { hearingId:'H-81', caseNo:'LC-2281', date:'1999-11-02', judge:'J. Collins', status:'Scheduled' }
      ],
      counsel: [
        { counselId:'C-17', name:'E. Moran', specialty:'Commercial', caseload:'12', status:'Active' }
      ],
      evidence: [
        { itemId:'E-901', caseNo:'LC-2281', category:'Contract', custodian:'Records', status:'Filed' }
      ],
      filings: [
        { filingId:'F-300', caseNo:'LC-2282', type:'Motion', dueDate:'1999-10-18', status:'Draft' }
      ]
    },
    palette: {
      '--legacy-bg':'#d8d3cd',
      '--legacy-panel':'#f1ece6',
      '--legacy-nav':'#cbc1b8',
      '--legacy-grid-head':'#d8cbbd',
      '--legacy-active':'#6f402d'
    }
  },
  {
    slug: 'compliance-register',
    title: 'Compliance Register 2005',
    summary: 'Control catalog, findings, remediation plans and attestations.',
    namespace: 'compliance-register',
    modules: [
      ['controls','Controls'],
      ['findings','Findings'],
      ['remediation','Remediation'],
      ['attestations','Attestations'],
      ['audits','Audits']
    ],
    columns: {
      controls: ['controlId','domain','owner','frequency','status'],
      findings: ['findingId','controlId','severity','owner','status'],
      remediation: ['planId','findingId','dueDate','owner','status'],
      attestations: ['attestationId','owner','period','result','status'],
      audits: ['auditId','scope','lead','window','status']
    },
    seed: {
      controls: [
        { controlId:'CTL-101', domain:'Access', owner:'Security', frequency:'Quarterly', status:'Active' },
        { controlId:'CTL-102', domain:'Change', owner:'IT Ops', frequency:'Monthly', status:'Active' }
      ],
      findings: [
        { findingId:'FND-44', controlId:'CTL-101', severity:'High', owner:'Security', status:'Open' }
      ],
      remediation: [
        { planId:'RM-22', findingId:'FND-44', dueDate:'2005-02-15', owner:'Security', status:'In Progress' }
      ],
      attestations: [
        { attestationId:'ATT-7', owner:'IT Ops', period:'2005-Q1', result:'Pending', status:'Open' }
      ],
      audits: [
        { auditId:'AUD-91', scope:'SOX', lead:'Internal Audit', window:'Feb', status:'Planned' }
      ]
    },
    palette: {
      '--legacy-bg':'#d5d9d5',
      '--legacy-panel':'#edf1ed',
      '--legacy-nav':'#c5cec4',
      '--legacy-grid-head':'#d0d8cf',
      '--legacy-active':'#466645'
    }
  },
  {
    slug: 'fleet-ops',
    title: 'Fleet Ops Console 2000',
    summary: 'Vehicle registry, route plans, maintenance windows and fuel logs.',
    namespace: 'fleet-ops',
    modules: [
      ['vehicles','Vehicles'],
      ['routes','Routes'],
      ['service','Service'],
      ['fuel','Fuel Logs'],
      ['incidents','Incidents']
    ],
    columns: {
      vehicles: ['unitNo','type','depot','mileage','status'],
      routes: ['routeId','driver','origin','destination','status'],
      service: ['serviceId','unitNo','window','vendor','status'],
      fuel: ['logId','unitNo','gallons','date','status'],
      incidents: ['incidentId','unitNo','severity','owner','status']
    },
    seed: {
      vehicles: [
        { unitNo:'TRK-11', type:'Box Truck', depot:'West', mileage:'144220', status:'Active' },
        { unitNo:'VAN-07', type:'Van', depot:'North', mileage:'88430', status:'Service Due' }
      ],
      routes: [
        { routeId:'RTE-7', driver:'D. Wu', origin:'West Depot', destination:'Central Hub', status:'Scheduled' }
      ],
      service: [
        { serviceId:'SRV-42', unitNo:'VAN-07', window:'2000-08-14', vendor:'Metro Garage', status:'Booked' }
      ],
      fuel: [
        { logId:'FL-100', unitNo:'TRK-11', gallons:'31', date:'2000-08-01', status:'Posted' }
      ],
      incidents: [
        { incidentId:'INC-4', unitNo:'TRK-11', severity:'Low', owner:'Fleet Ops', status:'Closed' }
      ]
    },
    palette: {
      '--legacy-bg':'#d4d8dc',
      '--legacy-panel':'#edf2f6',
      '--legacy-nav':'#c6ced7',
      '--legacy-grid-head':'#cfd8e2',
      '--legacy-active':'#2f5c73'
    }
  },
  {
    slug: 'quality-audit',
    title: 'Quality Audit Station 2006',
    summary: 'Inspection lots, non-conformance records, CAPA tasks and release gates.',
    namespace: 'quality-audit',
    modules: [
      ['lots','Inspection Lots'],
      ['ncr','NCR'],
      ['capa','CAPA'],
      ['releases','Release Gates'],
      ['metrics','Metrics']
    ],
    columns: {
      lots: ['lotId','line','inspector','result','status'],
      ncr: ['ncrId','lotId','defect','owner','status'],
      capa: ['capaId','ncrId','dueDate','owner','status'],
      releases: ['gateId','product','approver','date','status'],
      metrics: ['metricId','name','value','period','status']
    },
    seed: {
      lots: [
        { lotId:'LOT-81', line:'L2', inspector:'J. Yates', result:'Pass', status:'Closed' },
        { lotId:'LOT-82', line:'L2', inspector:'J. Yates', result:'Hold', status:'Open' }
      ],
      ncr: [
        { ncrId:'NCR-19', lotId:'LOT-82', defect:'Seal offset', owner:'QA', status:'Open' }
      ],
      capa: [
        { capaId:'CAPA-4', ncrId:'NCR-19', dueDate:'2006-04-04', owner:'Process Eng', status:'In Progress' }
      ],
      releases: [
        { gateId:'REL-3', product:'Valve Kit', approver:'QA Lead', date:'2006-03-31', status:'Blocked' }
      ],
      metrics: [
        { metricId:'M-1', name:'First Pass Yield', value:'94.2', period:'2006-W13', status:'Watch' }
      ]
    },
    palette: {
      '--legacy-bg':'#d8d8d2',
      '--legacy-panel':'#f1f1eb',
      '--legacy-nav':'#ccccbe',
      '--legacy-grid-head':'#d8d8c8',
      '--legacy-active':'#6d6b30'
    }
  }
];

function appMainTemplate(app) {
  return `import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "${app.namespace}";
const modules = [${app.modules.map(([id,label]) => `{ id: "${id}", label: "${label}" }`).join(', ')}];
const columns = ${JSON.stringify(app.columns, null, 2)};
const palette = ${JSON.stringify(app.palette, null, 2)};

let activeModule = modules[0].id;

ensureSeed(namespace, () => (${JSON.stringify(app.seed, null, 2)}));

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
    .map((field) => \`<label>\${field}</label><input class="legacy-field" name="\${field}" />\`)
    .join("");

  const contentHtml =
    panel("${app.summary}", grid) +
    panel("Entry Form", \`<form id="entry-form" data-module="\${activeModule}"><div class="legacy-form-grid">\${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>\`);

  document.getElementById("app").innerHTML = appShell({
    title: "${app.title}",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: \`System: \${namespace.toUpperCase()} | Session: OPERATOR-01\`,
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
        localStorage.removeItem(\`legacy-demo:\${namespace}\`);
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
`;
}

for (const app of apps) {
  const appRoot = join(root, 'apps', app.slug);
  mkdirSync(join(appRoot, 'src'), { recursive: true });

  const packageJson = {
    name: `@legacy/${app.slug}`,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build --base ./',
      test: `node -e "console.log('${app.slug}: no tests yet')"`
    },
    dependencies: {
      '@legacy/shared-legacy-styles': 'workspace:*',
      '@legacy/shared-mock-data': 'workspace:*',
      '@legacy/shared-ui': 'workspace:*'
    },
    devDependencies: {
      vite: '^6.0.0'
    }
  };

  const readme = `# ${app.slug}\n\n${app.summary}\n\nRun:\n\n\`\`\`bash\ncorepack pnpm --filter @legacy/${app.slug} dev\n\`\`\`\n`;

  const indexHtml = `<!doctype html>\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${app.title}</title>\n  </head>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="./src/main.js"></script>\n  </body>\n</html>\n`;

  writeFileSync(join(appRoot, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
  writeFileSync(join(appRoot, 'README.md'), readme);
  writeFileSync(join(appRoot, 'index.html'), indexHtml);
  writeFileSync(join(appRoot, 'src', 'main.js'), appMainTemplate(app));
}

console.log(`Generated ${apps.length} legacy app scaffolds.`);
