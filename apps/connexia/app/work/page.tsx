import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { providers, sites, type Region } from "@/lib/demo-data";
import { fromNow } from "@/lib/format";
import { getAtRiskOrders, getOrderStatus, getOrdersFiltered, getProviderName } from "@/lib/metrics";
import { Search } from "lucide-react";

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

export default async function WorkPage({ searchParams }: { searchParams?: SearchParams | Promise<SearchParams> }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const qRaw = getParam(resolvedSearchParams, "q")?.trim();
  const q = qRaw ? qRaw.toLowerCase() : undefined;
  const siteId = getParam(resolvedSearchParams, "site");
  const scopedSite = siteId ? sites.find((s) => s.id === siteId) : undefined;
  const providerId = getParam(resolvedSearchParams, "provider");
  const region = getParam(resolvedSearchParams, "region") as Region | undefined;
  const status = getParam(resolvedSearchParams, "status") as "blocked" | "in_progress" | "done" | "planned" | undefined;
  const blockedReason = getParam(resolvedSearchParams, "blockedReason");
  const serviceType = getParam(resolvedSearchParams, "serviceType") as "internet" | "sd-wan" | "security" | undefined;
  const blockedOwnerTeam = getParam(resolvedSearchParams, "blockedOwnerTeam") as "Service Delivery" | "Provider" | "Customer" | "NOC" | undefined;
  const atRisk = getParam(resolvedSearchParams, "atRisk") === "1";

  const baseParams = {
    q: qRaw ?? undefined,
    site: siteId ?? undefined,
    provider: providerId ?? undefined,
    region: region ?? undefined,
    status: status ?? undefined,
    blockedReason: blockedReason ?? undefined,
    serviceType: serviceType ?? undefined,
    blockedOwnerTeam: blockedOwnerTeam ?? undefined,
    atRisk: atRisk ? "1" : undefined,
  };

  const regions: Array<{ label: string; value?: Region }> = [
    { label: "All", value: undefined },
    ...Array.from(new Set(sites.map((s) => s.region))).sort().map((r) => ({ label: r, value: r })),
  ];

  const providerOptions: Array<{ label: string; value?: string }> = [
    { label: "All", value: undefined },
    ...providers.map((p) => ({ label: p.name, value: p.id })),
  ];

  const statusOptions: Array<{ label: string; value?: "blocked" | "in_progress" | "planned" | "done" }> = [
    { label: "All", value: undefined },
    { label: "Blocked", value: "blocked" },
    { label: "In progress", value: "in_progress" },
    { label: "Planned", value: "planned" },
    { label: "Done", value: "done" },
  ];

  const serviceOptions: Array<{ label: string; value?: "internet" | "sd-wan" | "security" }> = [
    { label: "All", value: undefined },
    { label: "Internet", value: "internet" },
    { label: "SD-WAN", value: "sd-wan" },
    { label: "Security", value: "security" },
  ];

  const blockedReasonOptions: Array<{ label: string; value?: string }> = [
    { label: "All", value: undefined },
    { label: "Awaiting provider", value: "awaiting_provider" },
    { label: "Awaiting customer", value: "awaiting_customer" },
    { label: "Awaiting change window", value: "awaiting_change_window" },
    { label: "Unknown", value: "unknown" },
  ];

  const ownerOptions: Array<{ label: string; value?: "Service Delivery" | "Provider" | "Customer" | "NOC" }> = [
    { label: "All", value: undefined },
    { label: "Service Delivery", value: "Service Delivery" },
    { label: "Provider", value: "Provider" },
    { label: "Customer", value: "Customer" },
    { label: "NOC", value: "NOC" },
  ];

  const baseForStatusCounts = getOrdersFiltered({ providerId, region, blockedReason, serviceType, blockedOwnerTeam }).filter((o) =>
    siteId ? o.siteId === siteId : true
  );
  const statusCounts = baseForStatusCounts.reduce(
    (acc, o) => {
      const s = getOrderStatus(o.id).state;
      acc[s] += 1;
      return acc;
    },
    { blocked: 0, in_progress: 0, planned: 0, done: 0 } as Record<"blocked" | "in_progress" | "planned" | "done", number>
  );
  const atRiskOrderIds = new Set(getAtRiskOrders().map((o) => o.orderId));
  const atRiskCount = baseForStatusCounts.filter((o) => atRiskOrderIds.has(o.id)).length;

  const all = getOrdersFiltered({ providerId, region, status, blockedReason, serviceType, blockedOwnerTeam }).filter((o) =>
    siteId ? o.siteId === siteId : true
  );
  const filteredByRisk = atRisk ? all.filter((o) => atRiskOrderIds.has(o.id)) : all;
  const filtered = q
    ? filteredByRisk.filter((o) => {
        const site = sites.find((s) => s.id === o.siteId);
        const status = getOrderStatus(o.id);
        const provider = site ? getProviderName(site.providerId) : "";
        const haystack = `${o.id} ${o.siteId} ${site?.name ?? ""} ${site?.customer ?? ""} ${provider} ${o.serviceType} ${status.state} ${status.blockedReason ?? ""}`.toLowerCase();
        return haystack.includes(q);
      })
    : filteredByRisk;

  return (
    <main>
      <PageTitle
        title="Work"
        subtitle="Orders and milestones normalized into a small, explainable state machine. This is the core of process efficiency."
      />

      <div className="cx-panel rounded-2xl p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form action="/work" method="get" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="site" value={siteId ?? ""} />
            <input type="hidden" name="provider" value={providerId ?? ""} />
            <input type="hidden" name="region" value={region ?? ""} />
            <input type="hidden" name="status" value={status ?? ""} />
            <input type="hidden" name="blockedReason" value={blockedReason ?? ""} />
            <input type="hidden" name="serviceType" value={serviceType ?? ""} />
            <input type="hidden" name="blockedOwnerTeam" value={blockedOwnerTeam ?? ""} />
            <input type="hidden" name="atRisk" value={atRisk ? "1" : ""} />
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={qRaw ?? ""}
                placeholder="Search orders, sites, customers…"
                className="h-9 w-[280px] max-w-[70vw] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
            <button type="submit" className="h-9 inline-flex items-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 transition">
              Search
            </button>
          </form>

          {(qRaw || providerId || region || status || blockedReason || serviceType || blockedOwnerTeam || atRisk || siteId) ? (
            <Link
              href={siteId ? `/work?site=${encodeURIComponent(siteId)}` : "/work"}
              className="text-sm cx-link"
            >
              Clear filters
            </Link>
          ) : null}
        </div>

        {siteId ? (
          <div className="mt-3 text-xs cx-muted">
            Scoped to site: <Link className="cx-link" href={`/sites/${siteId}`}>{scopedSite?.name ?? siteId}</Link>
            <span className="px-2">•</span>
            <Link className="cx-link" href="/work">Clear scope</Link>
          </div>
        ) : null}

        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Region</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {regions.map((r) => {
                const active = (r.value ?? undefined) === (region ?? undefined);
                const href = buildHref("/work", baseParams, { region: r.value });
                return (
                  <Link key={r.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {r.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 text-xs uppercase tracking-wide cx-muted">Provider</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {providerOptions.map((p) => {
                const active = (p.value ?? undefined) === (providerId ?? undefined);
                const href = buildHref("/work", baseParams, { provider: p.value });
                return (
                  <Link key={p.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {p.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Queue</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {statusOptions.map((s) => {
                const active = (s.value ?? undefined) === (status ?? undefined);
                const label =
                  s.value === "blocked"
                    ? `${s.label} • ${statusCounts.blocked}`
                    : s.value === "in_progress"
                      ? `${s.label} • ${statusCounts.in_progress}`
                      : s.value === "planned"
                        ? `${s.label} • ${statusCounts.planned}`
                        : s.value === "done"
                          ? `${s.label} • ${statusCounts.done}`
                          : "All";

                const href = buildHref(
                  "/work",
                  baseParams,
                  s.value === "blocked"
                    ? { status: s.value }
                    : { status: s.value, blockedReason: undefined, blockedOwnerTeam: undefined }
                );

                return (
                  <Link key={s.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 text-xs uppercase tracking-wide cx-muted">Service</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {serviceOptions.map((s) => {
                const active = (s.value ?? undefined) === (serviceType ?? undefined);
                const href = buildHref("/work", baseParams, { serviceType: s.value });
                return (
                  <Link key={s.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {s.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 text-xs uppercase tracking-wide cx-muted">At-risk</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href={buildHref("/work", baseParams, { atRisk: undefined })}
                className={!atRisk ? "cx-chip cx-chip-active" : "cx-chip"}
              >
                All
              </Link>
              <Link
                href={buildHref("/work", baseParams, { atRisk: "1" })}
                className={atRisk ? "cx-chip cx-chip-active" : "cx-chip"}
              >
                At-risk • {atRiskCount}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Blocked reason</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {blockedReasonOptions.map((r) => {
                const active = (r.value ?? undefined) === (blockedReason ?? undefined);
                const href = buildHref("/work", baseParams, { status: r.value ? "blocked" : status, blockedReason: r.value });
                return (
                  <Link key={r.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {r.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Blocked owner</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ownerOptions.map((o) => {
                const active = (o.value ?? undefined) === (blockedOwnerTeam ?? undefined);
                const href = buildHref("/work", baseParams, { status: o.value ? "blocked" : status, blockedOwnerTeam: o.value });
                return (
                  <Link key={o.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {o.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs cx-muted">Showing {filtered.length} work items.</div>
      </div>

      <Table>
        <table>
          <thead>
            <tr>
              <th className="text-left">Order</th>
              <th className="text-left">Site</th>
              <th className="text-left">Provider</th>
              <th className="text-left">Service</th>
              <th className="text-left">Status</th>
              <th className="text-right">Milestones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const site = sites.find((s) => s.id === o.siteId);
              const status = getOrderStatus(o.id);
              const tone = status.state === "blocked" ? "warning" : status.state === "done" ? "success" : "neutral";
              const lastUpdatedAt = o.milestones.reduce((acc, m) => (new Date(m.updatedAt).getTime() > new Date(acc).getTime() ? m.updatedAt : acc), o.createdAt);
              return (
                <tr key={o.id} className="align-top">
                  <td className="font-mono text-xs text-slate-500">{o.id}</td>
                  <td>
                    <Link className="cx-link" href={`/sites/${o.siteId}`}>
                      {site?.name ?? o.siteId}
                    </Link>
                    <div className="text-xs cx-muted mt-1">Target: {o.targetDate.slice(0, 10)} • Updated {fromNow(lastUpdatedAt)}</div>
                  </td>
                  <td>{site ? getProviderName(site.providerId) : "—"}</td>
                  <td>{o.serviceType}</td>
                  <td>
                    <div className="grid gap-1">
                      <Badge tone={tone}>{status.state}{status.blockedReason ? ` • ${status.blockedReason}` : ""}</Badge>
                      {status.state === "blocked" ? (
                        <div className="text-xs cx-muted">
                          Next action: {status.blockedReason === "awaiting_provider" ? "Request committed delivery date" : status.blockedReason === "awaiting_customer" ? "Confirm booking / access" : status.blockedReason === "awaiting_change_window" ? "Secure change window" : "Triage and assign owner"}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex flex-col items-end gap-2">
                      <div className="text-xs cx-muted">{o.milestones.filter((m) => m.state === "done").length}/{o.milestones.length} done</div>
                      <div className="flex flex-col gap-1 text-xs">
                        {o.milestones.map((m) => (
                          <div key={m.id} className="flex items-center justify-end gap-2">
                            <span className="cx-muted">{m.name}</span>
                            <Badge tone={m.state === "blocked" ? "warning" : m.state === "done" ? "success" : "neutral"}>{m.state}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm cx-muted" colSpan={6}>
                  No work items match the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Table>
    </main>
  );
}
