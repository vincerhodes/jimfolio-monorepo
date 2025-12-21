import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { BarChart, ChartCard, DonutChart } from "@/components/ui/Charts";
import { cases, invoices, orders, providers, sites, type MilestoneState, type Region } from "@/lib/demo-data";
import {
  getOrderStatus,
  getProviderName,
  getSiteName,
} from "@/lib/metrics";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams | undefined, key: string): string | undefined {
  const value = searchParams?.[key];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(path: string, base: Record<string, string | undefined>, overrides?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...base, ...(overrides ?? {}) };
  for (const [k, v] of Object.entries(merged)) {
    if (!v) continue;
    params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

function withSlicers(href: string, slicers: Record<string, string | undefined>) {
  const [path, raw] = href.split("?");
  const params = new URLSearchParams(raw ?? "");
  for (const [k, v] of Object.entries(slicers)) {
    if (!v) continue;
    if (!params.has(k)) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

function countBlockedMilestones(inputOrders: typeof orders): number {
  return inputOrders.reduce(
    (acc, o) => acc + o.milestones.filter((m) => m.state === ("blocked" as MilestoneState)).length,
    0
  );
}

function countOrdersByStatus(inputOrders: typeof orders) {
  const counts: Record<"blocked" | "in_progress" | "done" | "planned", number> = {
    blocked: 0,
    in_progress: 0,
    done: 0,
    planned: 0,
  };

  for (const o of inputOrders) {
    const status = getOrderStatus(o.id);
    counts[status.state] += 1;
  }

  return [
    { status: "blocked" as const, count: counts.blocked },
    { status: "in_progress" as const, count: counts.in_progress },
    { status: "planned" as const, count: counts.planned },
    { status: "done" as const, count: counts.done },
  ];
}

function countOrdersByServiceType(inputOrders: typeof orders) {
  const counts: Record<"internet" | "sd-wan" | "security", number> = { "internet": 0, "sd-wan": 0, "security": 0 };
  for (const o of inputOrders) counts[o.serviceType] += 1;
  return [
    { serviceType: "internet" as const, count: counts["internet"] },
    { serviceType: "sd-wan" as const, count: counts["sd-wan"] },
    { serviceType: "security" as const, count: counts["security"] },
  ];
}

function countCasesBySeverity(inputCases: typeof cases) {
  const counts: Record<"sev1" | "sev2" | "sev3", number> = { sev1: 0, sev2: 0, sev3: 0 };
  for (const c of inputCases) counts[c.severity] += 1;
  return [
    { severity: "sev1" as const, count: counts.sev1 },
    { severity: "sev2" as const, count: counts.sev2 },
    { severity: "sev3" as const, count: counts.sev3 },
  ];
}

function countBlockedByOwnerTeam(inputOrders: typeof orders) {
  const counts: Record<"Service Delivery" | "Provider" | "Customer" | "NOC", number> = {
    "Service Delivery": 0,
    Provider: 0,
    Customer: 0,
    NOC: 0,
  };

  for (const o of inputOrders) {
    for (const m of o.milestones) {
      if (m.state !== "blocked") continue;
      counts[m.ownerTeam] += 1;
    }
  }

  const result: Array<{ ownerTeam: "Service Delivery" | "Provider" | "Customer" | "NOC"; count: number }> = [
    { ownerTeam: "Provider", count: counts.Provider },
    { ownerTeam: "Customer", count: counts.Customer },
    { ownerTeam: "Service Delivery", count: counts["Service Delivery"] },
    { ownerTeam: "NOC", count: counts.NOC },
  ];

  return result.slice().sort((a, b) => b.count - a.count);
}

function countBlockedReasons(inputOrders: typeof orders) {
  const counts = new Map<string, number>();
  for (const order of inputOrders) {
    for (const m of order.milestones) {
      if (m.state !== "blocked") continue;
      const reason = m.blockedReason ?? "unspecified";
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

function countByProviderBlockedMilestones(inputOrders: typeof orders) {
  const counts = new Map<string, number>();
  for (const order of inputOrders) {
    const site = sites.find((s) => s.id === order.siteId);
    if (!site) continue;
    const blocked = order.milestones.filter((m) => m.state === "blocked").length;
    if (blocked === 0) continue;
    counts.set(site.providerId, (counts.get(site.providerId) ?? 0) + blocked);
  }
  return Array.from(counts.entries())
    .map(([providerId, blocked]) => ({ providerId, providerName: getProviderName(providerId), blocked }))
    .sort((a, b) => b.blocked - a.blocked);
}

function countByRegionBlockedMilestones(inputOrders: typeof orders) {
  const counts = new Map<string, number>();
  for (const order of inputOrders) {
    const site = sites.find((s) => s.id === order.siteId);
    if (!site) continue;
    const blocked = order.milestones.filter((m) => m.state === "blocked").length;
    if (blocked === 0) continue;
    counts.set(site.region, (counts.get(site.region) ?? 0) + blocked);
  }
  return Array.from(counts.entries())
    .map(([region, blocked]) => ({ region, blocked }))
    .sort((a, b) => b.blocked - a.blocked);
}

function getAtRiskOrders(inputOrders: typeof orders, now = new Date()): Array<{ orderId: string; siteId: string; reason: string }> {
  const riskWindowDays = 6;
  const riskWindowMs = riskWindowDays * 24 * 60 * 60 * 1000;

  return inputOrders
    .map((o) => {
      const status = getOrderStatus(o.id);
      const target = new Date(o.targetDate);
      const timeLeft = target.getTime() - now.getTime();

      if (status.state === "blocked") {
        return {
          orderId: o.id,
          siteId: o.siteId,
          reason: `Blocked: ${status.blockedReason ?? "unspecified"}`,
        };
      }

      if (timeLeft < riskWindowMs) {
        return {
          orderId: o.id,
          siteId: o.siteId,
          reason: `Target date approaching (${riskWindowDays}d window)`,
        };
      }

      return null;
    })
    .filter((x): x is { orderId: string; siteId: string; reason: string } => Boolean(x));
}

function getSlaAtRiskCases(inputCases: typeof cases, now = new Date()): Array<{ caseId: string; siteId: string; dueInHours: number }> {
  const riskHours = 8;

  return inputCases
    .filter((c) => c.status !== "resolved")
    .map((c) => {
      const due = new Date(c.slaDueAt);
      const deltaMs = due.getTime() - now.getTime();
      return { caseId: c.id, siteId: c.siteId, dueInHours: Math.round(deltaMs / (60 * 60 * 1000)) };
    })
    .filter((x) => x.dueInHours <= riskHours)
    .sort((a, b) => a.dueInHours - b.dueInHours);
}

export default async function DashboardPage({ searchParams }: { searchParams?: SearchParams | Promise<SearchParams> }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const region = getParam(resolvedSearchParams, "region") as Region | undefined;
  const providerId = getParam(resolvedSearchParams, "provider");

  const slicers = {
    region,
    provider: providerId,
  };

  const filteredSites = sites.filter((s) => {
    if (region && s.region !== region) return false;
    if (providerId && s.providerId !== providerId) return false;
    return true;
  });

  const filteredSiteIds = new Set(filteredSites.map((s) => s.id));
  const filteredOrders = orders.filter((o) => filteredSiteIds.has(o.siteId));
  const filteredCases = cases.filter((c) => filteredSiteIds.has(c.siteId));
  const filteredInvoices = invoices.filter((i) => filteredSiteIds.has(i.siteId));

  const summary = {
    totalSites: filteredSites.length,
    totalOrders: filteredOrders.length,
    blockedMilestones: countBlockedMilestones(filteredOrders),
    openCases: filteredCases.filter((c) => c.status !== "resolved").length,
    disputedInvoices: filteredInvoices.filter((i) => i.status === "disputed").length,
  };

  const atRisk = getAtRiskOrders(filteredOrders);
  const slaRisk = getSlaAtRiskCases(filteredCases);
  const blockedByProvider = countByProviderBlockedMilestones(filteredOrders);
  const blockedByRegion = countByRegionBlockedMilestones(filteredOrders);
  const blockedReasons = countBlockedReasons(filteredOrders);
  const ordersByStatus = countOrdersByStatus(filteredOrders);
  const ordersByServiceType = countOrdersByServiceType(filteredOrders);
  const casesBySeverity = countCasesBySeverity(filteredCases);
  const blockedByOwnerTeam = countBlockedByOwnerTeam(filteredOrders);

  const regions: Array<{ label: string; value?: Region }> = [
    { label: "All", value: undefined },
    ...Array.from(new Set(sites.map((s) => s.region))).sort().map((r) => ({ label: r, value: r })),
  ];

  const providerOptions: Array<{ label: string; value?: string }> = [
    { label: "All", value: undefined },
    ...providers.map((p) => ({ label: p.name, value: p.id })),
  ];

  return (
    <main>
      <PageTitle
        title="Executive dashboard"
        subtitle="Decision-grade visibility for service delivery leadership. Every widget links to evidence."
        right={
          <Link
            href="/presentation"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            Walkthrough
          </Link>
        }
      />

      <div className="cx-panel rounded-2xl p-4 md:p-5 mb-6">
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Region</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {regions.map((r) => {
                const active = (r.value ?? undefined) === (region ?? undefined);
                const href = buildHref("/dashboard", { region: region ?? undefined, provider: providerId ?? undefined }, { region: r.value, provider: providerId ?? undefined });
                return (
                  <Link
                    key={r.label}
                    href={href}
                    className={
                      active ? "cx-chip cx-chip-active" : "cx-chip"
                    }
                  >
                    {r.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Provider</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {providerOptions.map((p) => {
                const active = (p.value ?? undefined) === (providerId ?? undefined);
                const href = buildHref("/dashboard", { region: region ?? undefined, provider: providerId ?? undefined }, { region: region ?? undefined, provider: p.value });
                return (
                  <Link
                    key={p.label}
                    href={href}
                    className={
                      active ? "cx-chip cx-chip-active" : "cx-chip"
                    }
                  >
                    {p.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {(region || providerId) ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs cx-muted">Filtered view applied. Drill-through links keep this context.</div>
            <Link
              href="/dashboard"
              className="text-xs cx-link"
            >
              Clear slicers
            </Link>
          </div>
        ) : null}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Sites" value={String(summary.totalSites)} />
        <StatCard title="Orders" value={String(summary.totalOrders)} />
        <StatCard title="Blocked milestones" value={String(summary.blockedMilestones)} tone={summary.blockedMilestones ? "warning" : "success"} />
        <StatCard title="Open cases" value={String(summary.openCases)} tone={summary.openCases ? "warning" : "success"} />
        <StatCard title="Disputed invoices" value={String(summary.disputedInvoices)} tone={summary.disputedInvoices ? "risk" : "neutral"} />
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard title="Orders by status" subtitle="A leadership-ready snapshot of delivery health." right={<Link className="text-xs cx-link" href={withSlicers("/work", slicers)}>View work</Link>}>
          <DonutChart
            centerLabel={{ title: String(summary.totalOrders), subtitle: "orders" }}
            data={ordersByStatus.map((s) => {
              const color = s.status === "blocked" ? "#f59e0b" : s.status === "in_progress" ? "#38bdf8" : s.status === "done" ? "#22c55e" : "rgba(15, 23, 42, 0.10)";
              return {
                label: s.status,
                value: s.count,
                color,
                href: withSlicers(`/work?status=${encodeURIComponent(s.status)}`, slicers),
              };
            })}
          />
        </ChartCard>

        <ChartCard title="Blocked by provider" subtitle="Shows which partner needs escalation (click to drill-through).">
          <BarChart
            data={blockedByProvider.slice(0, 8).map((p) => ({
              label: p.providerName,
              value: p.blocked,
              color: "#f59e0b",
              href: withSlicers(`/work?status=blocked&provider=${encodeURIComponent(p.providerId)}`, slicers),
            }))}
          />
        </ChartCard>

        <ChartCard title="Cases by severity" subtitle="SLA risk becomes proactive when severity is visible." right={<Link className="text-xs cx-link" href={withSlicers("/cases", slicers)}>View cases</Link>}>
          <DonutChart
            centerLabel={{ title: String(summary.openCases), subtitle: "open" }}
            data={casesBySeverity.map((s) => {
              const color = s.severity === "sev1" ? "#ef4444" : s.severity === "sev2" ? "#f59e0b" : "rgba(15, 23, 42, 0.10)";
              return {
                label: s.severity,
                value: s.count,
                color,
                href: withSlicers(`/cases?severity=${encodeURIComponent(s.severity)}`, slicers),
              };
            })}
          />
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard title="Orders by service" subtitle="Useful for capacity planning and provider mix." right={<Link className="text-xs cx-link" href={withSlicers("/work", slicers)}>All work</Link>}>
          <BarChart
            data={ordersByServiceType.map((s) => ({
              label: s.serviceType,
              value: s.count,
              color: s.serviceType === "security" ? "#a78bfa" : s.serviceType === "sd-wan" ? "#38bdf8" : "#22c55e",
              href: withSlicers(`/work?serviceType=${encodeURIComponent(s.serviceType)}`, slicers),
            }))}
          />
        </ChartCard>

        <ChartCard title="Blocked by owner" subtitle="Clarifies who owns the next action (reduces status chasing).">
          <BarChart
            data={blockedByOwnerTeam.map((o) => ({
              label: o.ownerTeam,
              value: o.count,
              color: "#f59e0b",
              href: withSlicers(`/work?status=blocked&blockedOwnerTeam=${encodeURIComponent(o.ownerTeam)}`, slicers),
            }))}
          />
        </ChartCard>

        <ChartCard title="Blocked by region" subtitle="Where execution risk clusters geographically.">
          <BarChart
            data={blockedByRegion.map((r) => ({
              label: r.region,
              value: r.blocked,
              color: "#f59e0b",
              href: withSlicers(`/work?status=blocked&region=${encodeURIComponent(r.region)}`, slicers),
            }))}
          />
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard title="Blocked reasons" subtitle="Standard reasons enable consistent escalation paths.">
          <BarChart
            data={blockedReasons.slice(0, 8).map((r) => ({
              label: r.reason,
              value: r.count,
              color: "#f59e0b",
              href: withSlicers(`/work?status=blocked&blockedReason=${encodeURIComponent(r.reason)}`, slicers),
            }))}
            maxLabelWidth={220}
          />
        </ChartCard>

        <ChartCard title="SLA at risk" subtitle="Click into cases nearing breach for fast escalation." right={<Link className="text-xs cx-link" href={withSlicers("/cases?slaRisk=1", slicers)}>View SLA risk</Link>}>
          <div className="grid gap-2">
            {slaRisk.slice(0, 6).map((c) => (
              <Link
                key={c.caseId}
                href={withSlicers("/cases?slaRisk=1", slicers)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-mono">{c.caseId}</div>
                  <Badge tone={c.dueInHours <= 0 ? "risk" : "warning"}>{`${c.dueInHours}h`}</Badge>
                </div>
                <div className="mt-1 text-sm text-slate-700">{getSiteName(c.siteId)}</div>
              </Link>
            ))}
            {slaRisk.length === 0 ? <div className="text-sm cx-muted">No SLA-at-risk cases.</div> : null}
          </div>
        </ChartCard>

        <ChartCard title="At-risk orders" subtitle="Blocked work and near-target deliveries that need intervention." right={<Link className="text-xs cx-link" href={withSlicers("/work?atRisk=1", slicers)}>View at-risk</Link>}>
          <div className="grid gap-2">
            {atRisk.slice(0, 6).map((r) => (
              <Link
                key={r.orderId}
                href={withSlicers("/work?atRisk=1", slicers)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-mono">{r.orderId}</div>
                  <Badge tone={r.reason.startsWith("Blocked") ? "warning" : "neutral"}>{r.reason}</Badge>
                </div>
                <div className="mt-1 text-sm text-slate-700">{getSiteName(r.siteId)}</div>
              </Link>
            ))}
            {atRisk.length === 0 ? <div className="text-sm cx-muted">No at-risk orders.</div> : null}
          </div>
        </ChartCard>
      </div>
    </main>
  );
}
