# Roadmap

## Phase 1: MVP (visibility + transparency)

- Executive dashboard
  - top risks (orders likely to breach)
  - bottlenecks (blocked by provider/region)
  - SLA-at-risk cases
- Site portfolio list + site detail
- Work items list (orders + milestones) with filtering
- Cases list with SLA clock + ownership
- Billing view (invoice-by-site history)
- Seeded dataset with realistic variance

## Phase 2: Workflow orchestration (process-first)

- Policy rules (demo):
  - auto-escalate when `blocked > N days`
  - auto-notify when SLA < threshold
- Handoff tracking:
  - explicit ownership changes recorded as events
- Lead time reporting:
  - cycle time per milestone by region/provider

## Phase 3: Diagnosis + explanation tooling

- Correlation timeline per site:
  - "work changed" + "case opened" + "performance degraded" view
- Root-cause helpers (heuristic):
  - provider incident flagging
  - change-window conflict detection

## Phase 4: Portfolio integration + publish

- Add path proxy `/delivery-lens` (Nginx)
- Add PM2 process (port 3002)
- Add Jimfolio homepage link card
- Add public-safe demo disclaimer page/footer
