# Architecture

## Design principles

- **Single operational truth**: one canonical model for site/service/work/case/invoice.
- **Evented audit trail**: all state changes produce immutable events.
- **Workflow normalization**: use a small number of standardized states and reasons.
- **Explainable metrics**: dashboards must link back to the underlying work items/events.

## Domain model (conceptual)

- **Site**: a customer location / branch / facility.
- **Service**: connectivity service attached to a site (type: internet, sd-wan, security).
- **Order**: request to provision/change a service.
- **Milestone**: steps within an order (survey, circuit, install, config, handover).
- **Case**: operational issue (incident, request, problem) with SLA clock.
- **Invoice**: charges linked to site/service and a billing period.
- **Provider**: synthetic carrier / vendor.
- **Event**: append-only log of changes (order progressed, case escalated, provider updated).

## Workflow orchestration approach (demo-suitable)

- Model milestones as a **state machine**:
  - `planned` -> `in_progress` -> `blocked` -> `done`
- Model orders as a **rollup** of milestone states.
- Store blocked reasons as normalized enums:
  - `awaiting_provider`, `awaiting_customer`, `awaiting_change_window`, `unknown`

## Data & persistence

- **Prisma + SQLite**
  - easy local dev, easy to publish, deterministic seeded demo data
- Seed data must include:
  - multiple regions/providers
  - orders with different lead times
  - a few "stuck" items for exec dashboard signal

## UI architecture (Next.js App Router)

- Route groups by persona:
  - `/dashboard` (exec)
  - `/sites` and `/sites/[id]`
  - `/work` (orders/milestones)
  - `/cases`
  - `/billing`

## Observability inside the demo

- Application event log surface:
  - `/activity` shows last N events, filterable by site/order/case
- "Why" links:
  - every dashboard widget links to the underlying filtered list

## Deployment integration (planned)

This monorepo currently proxies demos via Nginx paths (e.g. `/sweet-reach` -> app on port 3001).

Planned approach for DeliveryLens:

- Add a PM2 process entry for the new app (e.g. port `3002`).
- Add an Nginx `location /delivery-lens` proxy to port `3002`.
- Add a new "Selected Work" card on the Jimfolio homepage linking to `/delivery-lens`.

(No deployment code changes are performed yet; tracked in `ROADMAP.md`.)
