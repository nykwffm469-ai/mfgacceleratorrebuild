# Legacy Enterprise App Portfolio (2010-2012 Simulations)

This repository is a deterministic portfolio of fake but believable legacy enterprise front-end systems.

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

- 72 total listed apps on the launcher
- 65 local legacy simulations plus 7 hosted companion apps
- homepage filtering by business area, interface style, console/terminal-only, and local/hosted type

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

### RPA Challenge App (1)

- rpa-challenge: same field set on every run, with field order scrambled on each submit to test RPA resilience and self-healing selector strategies

## Azure Hosting

- Portfolio root: https://ashy-water-06d69bd1e.7.azurestaticapps.net/
- App route pattern: https://ashy-water-06d69bd1e.7.azurestaticapps.net/<app-slug>/

Examples:

- https://ashy-water-06d69bd1e.7.azurestaticapps.net/crm-classic/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/vendor-onboarding-desk/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/order-hold-release/
- https://ashy-water-06d69bd1e.7.azurestaticapps.net/customer-cloud-hub/
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
