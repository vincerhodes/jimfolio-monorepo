# Product brief: DeliveryLens

## Problem statement

Service delivery leaders often operate without a trustworthy, end-to-end view of work execution across:

- Order/provisioning workflows
- Cases/incidents and escalations
- Network performance signals
- Billing and invoice history

The result is reactive firefighting, poor predictability, and a heavy reliance on manual reporting.

## Objectives (what the demo proves)

- **Efficiency**: fewer manual status chases, clearer ownership, standardized workflow state.
- **Transparency**: a single operational truth for delivery status, risk, and bottlenecks.
- **Auditability**: every state change is explainable (who/what/when/why).

## Non-goals (to keep scope controlled)

- Not a real SD-WAN/SASE controller.
- Not real-time networking telemetry at production scale.
- Not a full ITSM replacement.

## Primary workflows

1. **Order -> Provision -> Activate**
   - milestones, dependencies, blocked reasons, lead time prediction
2. **Case handling**
   - SLA clock, handoff tracking, escalation policy
3. **Executive reporting**
   - bottlenecks by region/provider, SLA breach risk, "stuck work" view

## Key screens (MVP)

- Executive dashboard
- Portfolio map/list of sites
- Site detail page (delivery + cases + performance snapshot)
- Work items list (filter by status, blocked, owner)
- Case list (SLA clock + age + severity)

## Success criteria

- A visitor can understand "what is happening" and "what needs attention" within 30 seconds.
- A demo script can show:
  - a delayed order becoming a risk
  - an escalation triggered by policy
  - leadership views that explain the bottleneck
