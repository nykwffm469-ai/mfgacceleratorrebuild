# Legacy Enterprise App Portfolio (2010-2012 Simulations)

This repository is a deterministic portfolio of fake but believable legacy enterprise front-end systems.

Purpose:

- demonstrate modernization scenarios later with Power Platform, Power Automate, RPA, OCR, and workflow automation
- provide safe, seeded, local demo applications without real backend dependencies

Guardrails in this repo:

- no real backend or database connections
- no real enterprise data
- no proprietary logos or assets
- no AI features inside the apps
- all apps use seeded mock data and local storage only

## Monorepo layout

```text
apps/
	crm-classic/
	warehouse-terminal/
	hr-portal/
	procurement-pro/
	helpdesk-ops/
	finance-ledger/
	claims-desk/
	project-tracker/
	maintenance-cmms/
	field-dispatch/
	billing-collections/
	legal-docket/
	compliance-register/
	fleet-ops/
	quality-audit/
packages/
	shared-legacy-styles/
	shared-mock-data/
	shared-ui/
```

## Apps

- `crm-classic`: CRM-style dense line-of-business interface with Accounts, Contacts, Opportunities, Activities, Dashboard
- `warehouse-terminal`: keyboard-first warehouse terminal simulation with inventory lookup and shipment processing screens
- `hr-portal`: internal onboarding and approvals portal inspired by old intranet systems
- `procurement-pro`: requisitions, vendors, POs, invoice queue, and approvals in legacy purchasing style
- `helpdesk-ops`: service desk queues, SLA tracking, assignment and escalation simulation
- `finance-ledger`: old accounting and close-workbench experience with journals, aging, and exception queues
- `claims-desk`: claims intake and adjuster desk with reserve and payment processing flows
- `project-tracker`: PMO tracker for projects, milestones, risks, and dependencies
- `maintenance-cmms`: work-order driven plant maintenance and preventive schedule system
- `field-dispatch`: route/crew assignment console for dispatch operations
- `billing-collections`: AR collections queue with dunning and dispute handling
- `legal-docket`: legal operations docket, hearing, and filings tracker
- `compliance-register`: controls, findings, remediation, and attestation register
- `fleet-ops`: vehicle fleet operations, routing, service, and fuel logs
- `quality-audit`: inspection, NCR, CAPA, and release gate tracking

## App Showcase

### 1. crm-classic

Believable 2008-2011 CRM experience with dense navigation, tabbed workspace, record editor, grid views, and legacy toolbar actions.

- Modules: Dashboard, Accounts, Contacts, Opportunities, Activities
- Behavior: seeded localStorage data, record create/update, last-record delete, reset seed
- Local path: [apps/crm-classic](apps/crm-classic)

### 2. warehouse-terminal

Keyboard-first warehouse operations simulation with terminal styling, fixed-width screens, shipment processing, receiving, and inventory lookup views.

- Screens: Lookup, Shipments, Receiving, Status
- Behavior: F-key style screen switching and simulated shipment/receipt processing
- Local path: [apps/warehouse-terminal](apps/warehouse-terminal)

### 3. hr-portal

Old intranet HR portal modeled after 2010-era internal collaboration systems with onboarding packets, approvals, and policy acknowledgement tracking.

- Modules: Onboarding, Equipment Requests, Approvals, Policy Ack, Task Tracker
- Behavior: seeded fake employee workflow data with status toggles and add-row forms
- Local path: [apps/hr-portal](apps/hr-portal)

### 4. procurement-pro

Legacy procurement suite with requisitions, vendor records, purchase orders, invoice queues, and approvals in a high-density transaction UI.

- Modules: Requisitions, Vendors, Purchase Orders, Invoice Queue, Approvals
- Behavior: seeded purchasing transactions, approval actions, quick-entry forms
- Local path: [apps/procurement-pro](apps/procurement-pro)

### 5. helpdesk-ops

Internal support desk simulation with queue views, ticket states, SLA visibility, assignments, and knowledge article tracking.

- Modules: Tickets, Queues, SLAs, Assignments, Knowledge
- Behavior: seeded support operations data with escalation actions and quick-add forms
- Local path: [apps/helpdesk-ops](apps/helpdesk-ops)

## Azure Demo Hosting

This portfolio is packaged for Azure Static Web Apps Free tier using a generated multi-app static bundle.

- Portfolio root: https://ashy-water-06d69bd1e.7.azurestaticapps.net/
- CRM Classic: https://ashy-water-06d69bd1e.7.azurestaticapps.net/crm-classic/
- Warehouse Terminal: https://ashy-water-06d69bd1e.7.azurestaticapps.net/warehouse-terminal/
- HR Portal: https://ashy-water-06d69bd1e.7.azurestaticapps.net/hr-portal/
- Procurement Pro: https://ashy-water-06d69bd1e.7.azurestaticapps.net/procurement-pro/
- Helpdesk Ops: https://ashy-water-06d69bd1e.7.azurestaticapps.net/helpdesk-ops/
- Finance Ledger: https://ashy-water-06d69bd1e.7.azurestaticapps.net/finance-ledger/
- Claims Desk: https://ashy-water-06d69bd1e.7.azurestaticapps.net/claims-desk/
- Project Tracker: https://ashy-water-06d69bd1e.7.azurestaticapps.net/project-tracker/
- Maintenance CMMS: https://ashy-water-06d69bd1e.7.azurestaticapps.net/maintenance-cmms/
- Field Dispatch: https://ashy-water-06d69bd1e.7.azurestaticapps.net/field-dispatch/
- Billing Collections: https://ashy-water-06d69bd1e.7.azurestaticapps.net/billing-collections/
- Legal Docket: https://ashy-water-06d69bd1e.7.azurestaticapps.net/legal-docket/
- Compliance Register: https://ashy-water-06d69bd1e.7.azurestaticapps.net/compliance-register/
- Fleet Ops: https://ashy-water-06d69bd1e.7.azurestaticapps.net/fleet-ops/
- Quality Audit: https://ashy-water-06d69bd1e.7.azurestaticapps.net/quality-audit/

## Run locally

1. Install dependencies:

```bash
corepack pnpm install
```

2. Run an app:

```bash
corepack pnpm dev:crm
corepack pnpm dev:warehouse
corepack pnpm dev:hr
corepack pnpm dev:procurement
corepack pnpm dev:helpdesk
corepack pnpm dev:finance
corepack pnpm dev:claims
corepack pnpm dev:projects
corepack pnpm dev:cmms
corepack pnpm dev:dispatch
corepack pnpm dev:billing
corepack pnpm dev:legal
corepack pnpm dev:compliance
corepack pnpm dev:fleet
corepack pnpm dev:quality
```

3. Build all apps:

```bash
corepack pnpm build
```

4. Build the Azure deployment bundle:

```bash
corepack pnpm build:site
```

## Persistence model

Each app seeds fake data on first run and persists to `localStorage` per app namespace.
