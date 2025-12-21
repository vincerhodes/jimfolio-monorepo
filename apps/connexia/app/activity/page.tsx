import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { events, providers, sites, type Event, type Region } from "@/lib/demo-data";
import { formatIsoDate } from "@/lib/format";
import { getProviderName } from "@/lib/metrics";
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

export default async function ActivityPage({ searchParams }: { searchParams?: SearchParams | Promise<SearchParams> }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const qRaw = getParam(resolvedSearchParams, "q")?.trim();
  const q = qRaw ? qRaw.toLowerCase() : undefined;
  const siteId = getParam(resolvedSearchParams, "site");
  const region = getParam(resolvedSearchParams, "region") as Region | undefined;
  const providerId = getParam(resolvedSearchParams, "provider");
  const group = getParam(resolvedSearchParams, "group") as "orders" | "cases" | "billing" | undefined;

  const baseParams = {
    q: qRaw ?? undefined,
    site: siteId ?? undefined,
    region: region ?? undefined,
    provider: providerId ?? undefined,
    group: group ?? undefined,
  };

  const providerOptions: Array<{ label: string; value?: string }> = [
    { label: "All", value: undefined },
    ...providers.map((p) => ({ label: p.name, value: p.id })),
  ];

  const regions: Array<{ label: string; value?: Region }> = [
    { label: "All", value: undefined },
    ...Array.from(new Set(sites.map((s) => s.region))).sort().map((r) => ({ label: r, value: r })),
  ];

  const groupOptions: Array<{ label: string; value?: "orders" | "cases" | "billing" }> = [
    { label: "All", value: undefined },
    { label: "Orders", value: "orders" },
    { label: "Cases", value: "cases" },
    { label: "Billing", value: "billing" },
  ];

  const base = events
    .filter((e) => {
      if (siteId && e.siteId !== siteId) return false;
      if (region || providerId) {
        const site = e.siteId ? sites.find((s) => s.id === e.siteId) : undefined;
        if (!site) return false;
        if (region && site.region !== region) return false;
        if (providerId && site.providerId !== providerId) return false;
      }
      return true;
    })
    .slice();

  const groupCounts = base.reduce(
    (acc, e) => {
      const g = e.kind.includes("invoice") ? "billing" : e.kind.includes("case") ? "cases" : "orders";
      acc[g] += 1;
      return acc;
    },
    { orders: 0, cases: 0, billing: 0 } as Record<"orders" | "cases" | "billing", number>
  );

  const filtered = base
    .filter((e) => {
      if (group) {
        if (group === "orders" && e.kind.includes("case")) return false;
        if (group === "orders" && e.kind.includes("invoice")) return false;
        if (group === "cases" && !e.kind.includes("case")) return false;
        if (group === "billing" && !e.kind.includes("invoice")) return false;
      }

      if (q) {
        const site = e.siteId ? sites.find((s) => s.id === e.siteId) : undefined;
        const providerName = site ? getProviderName(site.providerId) : "";
        const haystack = `${e.id} ${e.kind} ${e.siteId ?? ""} ${site?.name ?? ""} ${site?.customer ?? ""} ${providerName} ${e.orderId ?? ""} ${e.caseId ?? ""} ${e.summary}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  function buildReferenceLink(e: Event): { label: string; href: string } | null {
    if (e.kind.includes("case") && e.caseId) {
      const qs = new URLSearchParams();
      if (e.siteId) qs.set("site", e.siteId);
      qs.set("q", e.caseId);
      return { label: e.caseId, href: `/cases?${qs.toString()}` };
    }

    if (e.orderId) {
      const qs = new URLSearchParams();
      if (e.siteId) qs.set("site", e.siteId);
      qs.set("q", e.orderId);
      return { label: e.orderId, href: `/work?${qs.toString()}` };
    }

    if (e.kind.includes("invoice")) {
      const qs = new URLSearchParams();
      if (e.siteId) qs.set("site", e.siteId);
      if (e.kind === "invoice_disputed") qs.set("status", "disputed");
      return { label: e.kind, href: `/billing?${qs.toString()}` };
    }

    return null;
  }

  return (
    <main>
      <PageTitle
        title="Activity"
        subtitle="Append-only event trail. This is the backbone of explainable dashboards and auditability."
      />

      <div className="cx-panel rounded-2xl p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form action="/activity" method="get" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="site" value={siteId ?? ""} />
            <input type="hidden" name="region" value={region ?? ""} />
            <input type="hidden" name="provider" value={providerId ?? ""} />
            <input type="hidden" name="group" value={group ?? ""} />

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={qRaw ?? ""}
                placeholder="Search events, sites, references…"
                className="h-9 w-[280px] max-w-[70vw] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
            <button type="submit" className="h-9 inline-flex items-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 transition">
              Search
            </button>
          </form>

          {(qRaw || siteId || region || providerId || group) ? (
            <Link href="/activity" className="text-sm cx-link">
              Clear filters
            </Link>
          ) : null}
        </div>

        {siteId ? (
          <div className="mt-3 text-xs cx-muted">
            Scoped to site: <Link className="cx-link" href={`/sites/${siteId}`}>{sites.find((s) => s.id === siteId)?.name ?? siteId}</Link>
            <span className="px-2">•</span>
            <Link className="cx-link" href="/activity">Clear scope</Link>
          </div>
        ) : null}

        <div className="mt-4 grid lg:grid-cols-3 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Region</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {regions.map((r) => {
                const active = (r.value ?? undefined) === (region ?? undefined);
                const href = buildHref("/activity", baseParams, { region: r.value });
                return (
                  <Link key={r.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
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
                const href = buildHref("/activity", baseParams, { provider: p.value });
                return (
                  <Link key={p.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {p.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Stream</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {groupOptions.map((g) => {
                const active = (g.value ?? undefined) === (group ?? undefined);
                const label =
                  g.value === "orders"
                    ? `${g.label} • ${groupCounts.orders}`
                    : g.value === "cases"
                      ? `${g.label} • ${groupCounts.cases}`
                      : g.value === "billing"
                        ? `${g.label} • ${groupCounts.billing}`
                        : "All";
                const href = buildHref("/activity", baseParams, { group: g.value });
                return (
                  <Link key={g.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs cx-muted">Showing {filtered.length} events.</div>
      </div>

      <Table>
        <table>
          <thead>
            <tr>
              <th className="text-left">Time</th>
              <th className="text-left">Type</th>
              <th className="text-left">Site</th>
              <th className="text-left">Ref</th>
              <th className="text-left">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const tone = e.kind.includes("invoice") ? "warning" : e.kind.includes("case") ? "risk" : "neutral";
              const site = e.siteId ? sites.find((s) => s.id === e.siteId) : undefined;
              const ref = buildReferenceLink(e);

              return (
                <tr key={e.id}>
                  <td className="cx-muted">{formatIsoDate(e.at)}</td>
                  <td>
                    <Badge tone={tone}>{e.kind}</Badge>
                  </td>
                  <td>
                    {e.siteId ? (
                      <Link className="cx-link" href={`/sites/${e.siteId}`}>
                        {site?.name ?? e.siteId}
                      </Link>
                    ) : (
                      <span className="cx-muted">—</span>
                    )}
                  </td>
                  <td>
                    {ref ? (
                      <Link className="cx-link" href={ref.href}>
                        {ref.label}
                      </Link>
                    ) : (
                      <span className="cx-muted">—</span>
                    )}
                  </td>
                  <td>{e.summary}</td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-sm cx-muted">
                  No events match the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Table>
    </main>
  );
}
