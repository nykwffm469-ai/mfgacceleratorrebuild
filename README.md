# Manufacturing Accelerator Rebuild (AI-Ready, 2026)

This repository is a modern rebuild of the 2020 Manufacturing Accelerator with the same top-level structure:

- `apps`
- `CDS.solutions`
- `documentation`

The rebuild replaces legacy SaaS assumptions with an AI-native architecture focused on:

- agent-assisted supplier qualification and onboarding
- composable APIs and typed domain contracts
- modern CI/CD and container-based development
- markdown-first documentation and infrastructure-as-code friendly assets

## Why this rebuild

The original project was Dataverse and model-driven-app heavy. This rebuild keeps the recognizable structure while introducing:

- TypeScript monorepo and package boundaries
- Next.js 15 web experience
- Fastify API service for orchestration and integrations
- domain package with Zod-validated contracts
- agent package for supplier-risk and workflow automation

## Repository structure

```text
.
|-- apps/
|   `-- samplecode/
|       |-- web/
|       |-- api/
|       |-- agents/
|       `-- packages/domain/
|-- CDS.solutions/
|   |-- Dynamics365ManufacturingAccelerator/
|   |-- Dynamics365ManufacturingAcceleratorModelDrivenApp/
|   `-- Manufacturing_Anchor/
`-- documentation/
```

## Quick start

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker (optional, for containerized local stack)

### Install and run

```bash
pnpm install
pnpm dev
```

### Lint, typecheck, test

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Environment

Copy `.env.example` to `.env` and set values as needed.

Required for AI routes:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default `gpt-4.1-mini`)

## Publishing workflow

```bash
git add .
git commit -m "Rebuild manufacturing accelerator for AI-native 2026 stack"
git push origin main
```

## Status

This is a baseline modernization scaffold intended for rapid extension by ISVs, SIs, and enterprise teams.
