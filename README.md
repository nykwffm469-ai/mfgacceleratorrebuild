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
```

3. Build all apps:

```bash
corepack pnpm build
```

## Persistence model

Each app seeds fake data on first run and persists to `localStorage` per app namespace.
