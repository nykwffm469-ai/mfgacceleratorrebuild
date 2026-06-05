# Legacy Enterprise App Portfolio (2010-2012 Simulations + Modern Comparisons + Full RPA Platform)

## Last Updated

- Date: 2026-06-05
- Update: Major expansion - shipped 3 waves of new apps and a launcher overhaul to make this a complete RPA solution set:
  - **Wave 1 (Tier 1 RPA platform, 6 apps)**: `bot-orchestrator-console` (UiPath-style control room), `document-intelligence-studio` (IDP / Hyperscience-style), `mainframe-3270-emulator` (TN3270 CICS claims), `email-intake-bot` (shared-mailbox bot console), `excel-macro-lab` (multi-tab month-end workbook with broken VLOOKUPs + Replace-with-RPA button), `rpa-roi-dashboard` (executive wallboard)
  - **Wave 2 (Tier 2 vertical apps, 6 apps)**: `modern-itsm-now` (ServiceNow Now Workspace-style), `modern-salesforce-crm` (Salesforce Lightning-style), `healthcare-prior-auth` (Epic-style EHR prior-auth queue), `bank-wire-ach-ops` (OFAC repair + NACHA returns), `identity-governance` (SailPoint-style IGA with certifications + SoD violations), `edi-856-monitor` (Trading-partner B2B exception monitor with OTIF chargeback risk)
  - **Wave 3 (launcher overhaul)**: era badges (Modern/2018/2014/2010/2003/1998), RPA modernization score (1-5 stars), vendor family color tags (SAP/Oracle/IBM/Microsoft/SharePoint/ServiceNow/Salesforce/Bootstrap/Mainframe/Excel/Custom .NET), era + family filter dropdowns, and a Connected RPA Stories banner with 3 end-to-end workflow narratives (Vendor Onboarding to ERP, Invoice-to-Pay STP, Loan Origination end-to-end)

This repository is now a deterministic portfolio of fake but believable legacy enterprise front-end systems, modern comparison apps, and the full RPA platform stack (orchestrator + IDP + mainframe target + email bot + Excel pain + ROI wallboard) that illustrates where RPA fits in across every common enterprise workflow.

GitHub repository: https://github.com/nykwffm469-ai/mfgacceleratorrebuild
Live portfolio: https://ashy-water-06d69bd1e.7.azurestaticapps.net/

Purpose:

- demonstrate modernization scenarios with Power Platform, Power Automate, RPA, OCR, and workflow automation
- provide safe, seeded, local demo applications without real backend dependencies

Guardrails:

- no real backend or database connections
- no real enterprise data
- no proprietary logos or assets
- no AI features inside the apps
- all apps use seeded mock data and localStorage only

Current scale:

- **87 total listed apps on the launcher** (80 local + 7 hosted)
- Filters: business area, interface style, terminal-only, local/hosted, **era**, **vendor family**
- Each app row shows: vendor family color tag, era badge, RPA modernization score (1-5 stars)
- Top of launcher: 3 Connected RPA Stories that walk through end-to-end workflows across apps

## Monorepo layout

```text
apps/*                     # each top-level folder is one standalone app
packages/shared-legacy-styles/
packages/shared-mock-data/
packages/shared-ui/
scripts/build-portfolio-site.mjs
```

## App Catalog

### Core Legacy Apps (15)

- crm-classic: CRM accounts, contacts, opportunities, activities, dashboard
- warehouse-terminal: keyboard-first inventory, shipping, receiving terminal
- hr-portal: onboarding, approvals, policy acknowledgement tracking
- procurement-pro: requisitions, vendors, purchase orders, invoice queue
- helpdesk-ops: internal service desk queue and SLA workflow
- finance-ledger: journal posting, account review, month-close tasks
- claims-desk: intake, adjuster routing, reserve/payment tracking
- project-tracker: PMO milestone, risk, dependency management
- maintenance-cmms: work orders, preventive schedules, parts, downtime
- field-dispatch: dispatch board, routes, crews, check-ins
- billing-collections: AR dunning, disputes, promises-to-pay
- legal-docket: cases, hearings, filings, evidence tracking
- compliance-register: controls, findings, remediation and attestations
- fleet-ops: units, routes, service, fuel, incidents
- quality-audit: inspections, NCR, CAPA, release gates

### RPA-Target Apps (18)

- vendor-onboarding-desk: W-9 intake, tax/bank validation, vendor master entry
- contract-renewal-tracker: deadline checks, clause packets, approvals
- customer-refund-processing: eligibility checks, reversals, notices
- utility-bill-reconciliation: bill ingestion, usage variance, batch prep
- timesheet-exception-resolver: missing punch/overtime correction workflow
- travel-expense-audit: receipt matching, policy checks, escalations
- freight-invoice-match: PO/BOL/invoice matching and dispute handling
- coi-monitor: insurance certificate expiry and compliance locking
- new-hire-provisioning: account/access/hardware onboarding queue
- license-permit-renewal: filing packet and renewal deadline management
- collections-ptp-monitor: promise-to-pay follow-up and default escalation
- chargeback-response-workbench: evidence packet and response deadline workflow
- product-data-syndication: catalog mapping, export, error/retry queue
- supplier-scorecard-consolidator: KPI normalization and score distribution
- warranty-claim-triage: entitlement checks and service assignment flow
- training-attestation-hub: completion attestations and overdue handling
- ap-statement-reconciliation: open-item matching and discrepancy cases
- order-hold-release: credit/fraud hold review and release approvals

### Platform-Style Faux Apps (15)

- customer-cloud-hub: CRM-like pipeline, account, and activity execution suite
- service-desk-plus: ITSM-like incident, request, and change operations desk
- data-warehouse-ops: Snowflake-style warehouse and query operations console
- erp-command-center: SAP/Oracle-style cross-functional ERP operations cockpit
- finance-close-studio: period-close orchestration and journal approval workflow
- procurement-sourcing-suite: sourcing events, bid scoring, and award flow
- subscription-revenue-studio: subscription lifecycle, billing, and retention actions
- field-service-workbench: dispatch, route, parts, and closure management
- lowcode-flow-studio: flow registry, connectors, and run-history operations
- process-mining-lab: event-log mining, bottleneck discovery, and action backlog
- integration-gateway-manager: route maps, queue health, transform and replay tools
- master-data-governor: golden record stewardship and publish governance
- portfolio-work-boards: Smartsheet-like row/dependency portfolio execution
- hr-case-lifecycle: employee case intake, routing, approvals, and history
- compliance-automation-center: control testing, evidence, and audit response

### Modern Comparison Apps (5)

- sharepoint-doc-center: pixel-faithful SharePoint 2010 Document Center clone with site Quick Launch, blue ribbon and yellow contextual Library Tools (Documents + Library tabs), document libraries (Contracts, Policies, Month End Workpapers, SOX Evidence), check-in/check-out with major/minor versioning, version history, edit properties, workflows (Standard Approval, SOX Evidence), document permissions, upload + delete + export-to-Excel
- modern-loan-origination: Bootstrap 4 NorthBank Lending Workbench with live 8-step RPA decisioning pipeline (PDF intake -> KYC -> credit pull -> DTI -> fraud -> policy decision)
- modern-vendor-risk: Bootstrap 4 VendorPulse Risk Cockpit with 8-step RPA onboarding pipeline (W9 -> bank verify -> OFAC -> COI parse -> SOC 2 -> ERP master push)
- modern-itsm-now: ServiceNow Now Workspace-style agent console with AI suggested resolutions, runbook suggestions, similar-incident clustering, and SLA clock
- modern-salesforce-crm: Salesforce Lightning-style sales console with account 360, opportunity kanban, Einstein AI insights, and pipeline forecasting

### RPA Platform Apps (6)

- bot-orchestrator-console: UiPath / Power Automate Cloud / Blue Prism style control room - bot fleet inventory, work queues, schedules, asset vault, live activity stream
- document-intelligence-studio: Hyperscience / ABBYY / Azure Form Recognizer style split-screen IDP with PDF viewer, confidence-scored extracted fields, human-in-the-loop validation
- mainframe-3270-emulator: TN3270 CICS claims terminal with PF-key navigation, BMS-map screens, claims search/detail/notes/payment workflow
- email-intake-bot: Outlook-style shared-mailbox bot console with auto-classified intents, attachment routing, and confidence-based human-review queue
- excel-macro-lab: Multi-tab month-end recon workbook with broken VLOOKUPs (#N/A, #REF!), 12-step manual macro animation, and a one-click "Replace with RPA Bot" simulation that runs the same work in 14 seconds
- rpa-roi-dashboard: Executive wallboard - hours saved, FTE-equivalents, $$ saved, transactions automated, bot leaderboard, 12-month trends, FY27 projected savings

### Vertical / Industry Apps (6)

- healthcare-prior-auth: Epic Resolute-style EHR prior-authorization queue with patient context, CPT / ICD-10, payer rules, and bot-recommended auto-submission for high-confidence cases
- bank-wire-ach-ops: Treasury wire and ACH exception queue with OFAC repair, NACHA return-code disposition, beneficiary correction, and bot risk scoring
- identity-governance: SailPoint IdentityIQ / Saviynt-style IGA with certification campaigns, SoD violation detection, and joiner / mover / leaver bot activity
- edi-856-monitor: SPS Commerce / IBM B2B Sterling style EDI trading-partner exception monitor (850/855/856/810/997) with OTIF chargeback risk and bot auto-recovery

### RPA Challenge App (1)

- rpa-challenge: same field set on every run, with field order scrambled on each submit to test RPA resilience and self-healing selector strategies

## Azure Hosting

- Portfolio root: https://ashy-water-06d69bd1e.7.azurestaticapps.net/
- App route pattern: https://ashy-water-06d69bd1e.7.azurestaticapps.net/<app-slug>/

Examples:

- https://ashy-water-06d69bd1e.7.azurestaticapps.net/bot-orchestrator-console/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/document-intelligence-studio/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/mainframe-3270-emulator/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/email-intake-bot/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/excel-macro-lab/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/rpa-roi-dashboard/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/modern-itsm-now/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/modern-salesforce-crm/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/healthcare-prior-auth/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/bank-wire-ach-ops/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/identity-governance/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/edi-856-monitor/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/sharepoint-doc-center/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/modern-loan-origination/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/modern-vendor-risk/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/mainframe-3270-emulator/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/rpa-challenge/

## Run locally

1. Install dependencies

```bash
corepack pnpm install
```

2. Run a specific app

```bash
corepack pnpm --filter @legacy/crm-classic dev
corepack pnpm --filter @legacy/vendor-onboarding-desk dev
```

3. Build all apps

```bash
corepack pnpm build
```

4. Build Azure deployment bundle

```bash
corepack pnpm build:site
```

## Persistence model

Each app seeds fake data on first run and persists to localStorage per app namespace.

## 2026-06 Legacy Suite Build Notes

Focused second-pass upgrades were applied to the following apps:

- data-warehouse-ops
- dealer-incentive-settlement
- dock-appointment-scheduler
- document-imaging-queue
- erp-command-center
- export-compliance-screening

Implemented behaviors in this pass:

- row selection highlight and edit-selected workflow
- deterministic toggle-sort workflow on queue keys
- denser operational widgets and domain calculators per app
- richer side panels describing queue context and RPA candidate flows
- app-specific modal flows for audit history, retry failures, supervisor review, and print/export preview
- expanded seeded records for queue lifecycle, exceptions, and approvals
