import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import { invoices, providers, sites, type Region } from "@/lib/demo-data";
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

export default async function BillingPage({ searchParams }: { searchParams?: SearchParams | Promise<SearchParams> }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const qRaw = getParam(resolvedSearchParams, "q")?.trim();
  const q = qRaw ? qRaw.toLowerCase() : undefined;
  const siteId = getParam(resolvedSearchParams, "site");
  const region = getParam(resolvedSearchParams, "region") as Region | undefined;
  const providerId = getParam(resolvedSearchParams, "provider");
  const status = getParam(resolvedSearchParams, "status") as "paid" | "due" | "disputed" | undefined;

  const baseParams = {
    q: qRaw ?? undefined,
    site: siteId ?? undefined,
    region: region ?? undefined,
    provider: providerId ?? undefined,
    status: status ?? undefined,
  };

  const providerOptions: Array<{ label: string; value?: string }> = [
    { label: "All", value: undefined },
    ...providers.map((p) => ({ label: p.name, value: p.id })),
  ];

  const regions: Array<{ label: string; value?: Region }> = [
    { label: "All", value: undefined },
    ...Array.from(new Set(sites.map((s) => s.region))).sort().map((r) => ({ label: r, value: r })),
  ];

  const statusOptions: Array<{ label: string; value?: "paid" | "due" | "disputed" }> = [
    { label: "All", value: undefined },
    { label: "Due", value: "due" },
    { label: "Disputed", value: "disputed" },
    { label: "Paid", value: "paid" },
  ];

  const base = invoices.filter((i) => {
    if (siteId && i.siteId !== siteId) return false;
    const site = sites.find((s) => s.id === i.siteId);
    if (!site) return false;
    if (region && site.region !== region) return false;
    if (providerId && site.providerId !== providerId) return false;
    return true;
  });

  const statusCounts = base.reduce(
    (acc, i) => {
      acc[i.status] += 1;
      return acc;
    },
    { paid: 0, due: 0, disputed: 0 } as Record<"paid" | "due" | "disputed", number>
  );

  const dueAmount = base.filter((i) => i.status === "due").reduce((acc, i) => acc + i.amountGbp, 0);
  const disputedAmount = base.filter((i) => i.status === "disputed").reduce((acc, i) => acc + i.amountGbp, 0);

  const filtered = base
    .filter((i) => {
      if (status && i.status !== status) return false;

      if (q) {
        const site = sites.find((s) => s.id === i.siteId);
        const providerName = site ? getProviderName(site.providerId) : "";
        const haystack = `${i.id} ${i.siteId} ${site?.name ?? ""} ${site?.customer ?? ""} ${providerName} ${i.period} ${i.status}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    })
    .slice()
    .sort((a, b) => b.period.localeCompare(a.period));

  return (
    <main>
      <PageTitle
        title="Billing"
        subtitle="Invoice-by-site history. This page exists to highlight transparency and anomaly surfacing for service delivery leadership."
      />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Due invoices" value={String(statusCounts.due)} tone={statusCounts.due ? "warning" : "success"} subtitle={statusCounts.due ? `£${dueAmount.toLocaleString()} outstanding` : "No outstanding invoices"} />
        <StatCard title="Disputed invoices" value={String(statusCounts.disputed)} tone={statusCounts.disputed ? "risk" : "success"} subtitle={statusCounts.disputed ? `£${disputedAmount.toLocaleString()} disputed` : "No disputes"} />
        <StatCard title="Invoices in view" value={String(filtered.length)} subtitle={(region || providerId || siteId) ? "Filtered by portfolio" : "All invoices"} />
      </div>

      <div className="cx-panel rounded-2xl p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form action="/billing" method="get" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="site" value={siteId ?? ""} />
            <input type="hidden" name="region" value={region ?? ""} />
            <input type="hidden" name="provider" value={providerId ?? ""} />
            <input type="hidden" name="status" value={status ?? ""} />

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={qRaw ?? ""}
                placeholder="Search invoices, sites, customers…"
                className="h-9 w-[280px] max-w-[70vw] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
            <button type="submit" className="h-9 inline-flex items-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 transition">
              Search
            </button>
          </form>

          {(qRaw || siteId || region || providerId || status) ? (
            <Link href="/billing" className="text-sm cx-link">
              Clear filters
            </Link>
          ) : null}
        </div>

        {siteId ? (
          <div className="mt-3 text-xs cx-muted">
            Scoped to site: <Link className="cx-link" href={`/sites/${siteId}`}>{sites.find((s) => s.id === siteId)?.name ?? siteId}</Link>
            <span className="px-2">•</span>
            <Link className="cx-link" href="/billing">Clear scope</Link>
          </div>
        ) : null}

        <div className="mt-4 grid lg:grid-cols-3 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Region</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {regions.map((r) => {
                const active = (r.value ?? undefined) === (region ?? undefined);
                const href = buildHref("/billing", baseParams, { region: r.value });
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
                const href = buildHref("/billing", baseParams, { provider: p.value });
                return (
                  <Link key={p.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {p.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Status</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {statusOptions.map((s) => {
                const active = (s.value ?? undefined) === (status ?? undefined);
                const label =
                  s.value === "due"
                    ? `${s.label} • ${statusCounts.due}`
                    : s.value === "disputed"
                      ? `${s.label} • ${statusCounts.disputed}`
                      : s.value === "paid"
                        ? `${s.label} • ${statusCounts.paid}`
                        : "All";
                const href = buildHref("/billing", baseParams, { status: s.value });
                return (
                  <Link key={s.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs cx-muted">Showing {filtered.length} invoices.</div>
      </div>

      <Table>
        <table>
          <thead>
            <tr>
              <th className="text-left">Invoice</th>
              <th className="text-left">Site</th>
              <th className="text-left">Provider</th>
              <th className="text-left">Period</th>
              <th className="text-left">Status</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => {
              const site = sites.find((s) => s.id === i.siteId);
              return (
                <tr key={i.id}>
                  <td className="font-mono text-xs text-slate-500">{i.id}</td>
                  <td>
                    <Link className="cx-link" href={`/sites/${i.siteId}`}>
                      {site?.name ?? i.siteId}
                    </Link>
                    {site ? <div className="text-xs cx-muted mt-1">{site.customer} • {site.region}</div> : null}
                  </td>
                  <td>{site ? getProviderName(site.providerId) : "—"}</td>
                  <td>{i.period}</td>
                  <td>
                    <Badge tone={i.status === "paid" ? "success" : i.status === "due" ? "warning" : "risk"}>{i.status}</Badge>
                  </td>
                  <td className="text-right">£{i.amountGbp.toLocaleString()}</td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm cx-muted" colSpan={6}>
                  No invoices match the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Table>
    </main>
  );
}
