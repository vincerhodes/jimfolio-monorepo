# Demo script (5–7 minutes)

## Setup (what the viewer should know)

- DeliveryLens is a **fictional** service-delivery control tower.
- Data is synthetic but modeled after real operational constraints:
  - multiple providers, variable lead times, cases with SLA clocks

## Scene 1: Executive view (30s)

- Open `/dashboard`.
- Show:
  - "At-risk orders" widget
  - "Blocked by provider" breakdown
  - "SLA at risk" cases

Narration focus: "This replaces status-chasing. Everything links to evidence."

## Scene 2: Find the bottleneck (60–90s)

- Click the top bottleneck provider.
- Land on a filtered work list.
- Open a specific order.

Show:
- milestone state machine
- blocked reason + age
- audit trail events

## Scene 3: Handoff + escalation (60–90s)

- Show a case that is nearing SLA breach.
- Show ownership handoff event.
- Demonstrate an auto-escalation rule (even if simulated).

## Scene 4: Transparency to cost (60s)

- Navigate to billing.
- Show invoice history for the same site.
- Highlight anomaly (e.g., duplicate charge) and how it links back to the service/order.

## Close (30s)

- Recap architecture points:
  - canonical model
  - evented audit trail
  - workflow normalization
  - dashboards that explain themselves
