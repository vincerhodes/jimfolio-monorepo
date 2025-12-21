# DeliveryLens (Showcase)

DeliveryLens is a fictional service-delivery visibility and workflow orchestration showcase built to demonstrate architectural approaches for improving operational efficiency and data transparency.

This project is **not affiliated with any real company**. Brand, data, and scenarios are synthetic.

## Why this exists

Service delivery in global network environments tends to become chaotic when:

- Multiple vendors/providers must be coordinated per site
- Lead times vary by region and provider
- Work is tracked across disconnected tools (tickets, spreadsheets, monitoring, invoicing)
- Leadership lacks a single, reliable view of execution risk and bottlenecks

DeliveryLens aims to demonstrate a pragmatic architecture for:

- Making work visible (audit trail + state transitions)
- Standardizing workflow state and ownership
- Providing decision-grade reporting (risk, bottlenecks, SLA clocks)

## Target persona

- Global Director of Service Delivery / Process owner

## Planned UX (high level)

- Executive dashboard (risk + bottlenecks)
- Site portfolio view (health + delivery status)
- Work item tracker (orders / milestones / blocks)
- Case view (open cases, SLA clocks, handoffs)
- Billing transparency (invoice-by-site history, anomalies)

## Tech constraints (aligned with this monorepo)

- Next.js (App Router), React, TypeScript
- TailwindCSS + Lucide icons
- Prisma + SQLite for fast local dev and a publishable demo

## Planning docs

- `BRANDING.md`
- `PRODUCT_BRIEF.md`
- `ARCHITECTURE.md`
- `ROADMAP.md`
- `DEMO_SCRIPT.md`

## Portfolio integration

This showcase is intended to be linked from the main `apps/jimfolio` site under "Selected Work".

Planned URL shape (to match existing pattern like `/sweet-reach`):

- `https://jimfolio.space/delivery-lens`

Deployment planning is documented in `ARCHITECTURE.md`.
