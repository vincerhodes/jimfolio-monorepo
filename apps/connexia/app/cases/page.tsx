import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { cases, providers, sites, type Region } from "@/lib/demo-data";
import { fromNow } from "@/lib/format";
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

export default async function CasesPage({ searchParams }: { searchParams?: SearchParams | Promise<SearchParams> }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const now = new Date();
  const nowMs = now.getTime();

  const qRaw = getParam(resolvedSearchParams, "q")?.trim();
  const q = qRaw ? qRaw.toLowerCase() : undefined;
  const siteId = getParam(resolvedSearchParams, "site");
  const slaRisk = getParam(resolvedSearchParams, "slaRisk") === "1";
  const severity = getParam(resolvedSearchParams, "severity") as "sev1" | "sev2" | "sev3" | undefined;
  const status = getParam(resolvedSearchParams, "status") as "open" | "investigating" | "waiting" | "resolved" | undefined;
  const ownerTeam = getParam(resolvedSearchParams, "owner") as "NOC" | "Service Delivery" | "Provider" | undefined;
  const region = getParam(resolvedSearchParams, "region") as Region | undefined;
  const providerId = getParam(resolvedSearchParams, "provider");

  const baseParams = {
    q: qRaw ?? undefined,
    site: siteId ?? undefined,
    region: region ?? undefined,
    provider: providerId ?? undefined,
    slaRisk: slaRisk ? "1" : undefined,
    severity: severity ?? undefined,
    status: status ?? undefined,
    owner: ownerTeam ?? undefined,
  };

  const providerOptions: Array<{ label: string; value?: string }> = [
    { label: "All", value: undefined },
    ...providers.map((p) => ({ label: p.name, value: p.id })),
  ];

  const regions: Array<{ label: string; value?: Region }> = [
    { label: "All", value: undefined },
    ...Array.from(new Set(sites.map((s) => s.region))).sort().map((r) => ({ label: r, value: r })),
  ];

  const severityOptions: Array<{ label: string; value?: "sev1" | "sev2" | "sev3" }> = [
    { label: "All", value: undefined },
    { label: "Sev1", value: "sev1" },
    { label: "Sev2", value: "sev2" },
    { label: "Sev3", value: "sev3" },
  ];

  const statusOptions: Array<{ label: string; value?: "open" | "investigating" | "waiting" | "resolved" }> = [
    { label: "All", value: undefined },
    { label: "Open", value: "open" },
    { label: "Investigating", value: "investigating" },
    { label: "Waiting", value: "waiting" },
    { label: "Resolved", value: "resolved" },
  ];

  const ownerOptions: Array<{ label: string; value?: "NOC" | "Service Delivery" | "Provider" }> = [
    { label: "All", value: undefined },
    { label: "NOC", value: "NOC" },
    { label: "Service Delivery", value: "Service Delivery" },
    { label: "Provider", value: "Provider" },
  ];

  const base = cases.filter((c) => {
    if (siteId && c.siteId !== siteId) return false;
    const site = sites.find((s) => s.id === c.siteId);
    if (!site) return false;
    if (region && site.region !== region) return false;
    if (providerId && site.providerId !== providerId) return false;
    return true;
  });

  const severityCounts = base.reduce(
    (acc, c) => {
      acc[c.severity] += 1;
      return acc;
    },
    { sev1: 0, sev2: 0, sev3: 0 } as Record<"sev1" | "sev2" | "sev3", number>
  );

  const statusCounts = base.reduce(
    (acc, c) => {
      acc[c.status] += 1;
      return acc;
    },
    { open: 0, investigating: 0, waiting: 0, resolved: 0 } as Record<"open" | "investigating" | "waiting" | "resolved", number>
  );

  const filtered = base
    .filter((c) => {
      if (severity && c.severity !== severity) return false;
      if (status && c.status !== status) return false;
      if (ownerTeam && c.ownerTeam !== ownerTeam) return false;
      if (slaRisk) {
        if (c.status === "resolved") return false;
        const hoursLeft = Math.round((new Date(c.slaDueAt).getTime() - nowMs) / (60 * 60 * 1000));
        if (hoursLeft > 8) return false;
      }

      if (q) {
        const site = sites.find((s) => s.id === c.siteId);
        const providerName = site ? getProviderName(site.providerId) : "";
        const haystack = `${c.id} ${c.title} ${c.siteId} ${site?.name ?? ""} ${site?.customer ?? ""} ${providerName} ${c.status} ${c.ownerTeam} ${c.severity}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    })
    .slice()
    .sort((a, b) => new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime());

  return (
    <main>
      <PageTitle
        title="Cases"
        subtitle="Open cases with SLA clocks and ownership. This makes escalation predictable and measurable."
      />

      <div className="cx-panel rounded-2xl p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form action="/cases" method="get" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="site" value={siteId ?? ""} />
            <input type="hidden" name="region" value={region ?? ""} />
            <input type="hidden" name="provider" value={providerId ?? ""} />
            <input type="hidden" name="slaRisk" value={slaRisk ? "1" : ""} />
            <input type="hidden" name="severity" value={severity ?? ""} />
            <input type="hidden" name="status" value={status ?? ""} />
            <input type="hidden" name="owner" value={ownerTeam ?? ""} />

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={qRaw ?? ""}
                placeholder="Search cases, sites, customers…"
                className="h-9 w-[280px] max-w-[70vw] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
            <button type="submit" className="h-9 inline-flex items-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 transition">
              Search
            </button>
          </form>

          {(qRaw || siteId || region || providerId || slaRisk || severity || status || ownerTeam) ? (
            <Link href="/cases" className="text-sm cx-link">
              Clear filters
            </Link>
          ) : null}
        </div>

        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Severity</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {severityOptions.map((s) => {
                const active = (s.value ?? undefined) === (severity ?? undefined);
                const label =
                  s.value === "sev1"
                    ? `${s.label} • ${severityCounts.sev1}`
                    : s.value === "sev2"
                      ? `${s.label} • ${severityCounts.sev2}`
                      : s.value === "sev3"
                        ? `${s.label} • ${severityCounts.sev3}`
                        : "All";
                const href = buildHref("/cases", baseParams, { severity: s.value });
                return (
                  <Link key={s.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 text-xs uppercase tracking-wide cx-muted">SLA risk</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href={buildHref("/cases", baseParams, { slaRisk: undefined })} className={!slaRisk ? "cx-chip cx-chip-active" : "cx-chip"}>
                All
              </Link>
              <Link href={buildHref("/cases", baseParams, { slaRisk: "1" })} className={slaRisk ? "cx-chip cx-chip-active" : "cx-chip"}>
                SLA at-risk (8h)
              </Link>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Status</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {statusOptions.map((s) => {
                const active = (s.value ?? undefined) === (status ?? undefined);
                const label =
                  s.value === "open"
                    ? `${s.label} • ${statusCounts.open}`
                    : s.value === "investigating"
                      ? `${s.label} • ${statusCounts.investigating}`
                      : s.value === "waiting"
                        ? `${s.label} • ${statusCounts.waiting}`
                        : s.value === "resolved"
                          ? `${s.label} • ${statusCounts.resolved}`
                          : "All";
                const href = buildHref("/cases", baseParams, { status: s.value });
                return (
                  <Link key={s.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 text-xs uppercase tracking-wide cx-muted">Owner</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ownerOptions.map((o) => {
                const active = (o.value ?? undefined) === (ownerTeam ?? undefined);
                const href = buildHref("/cases", baseParams, { owner: o.value });
                return (
                  <Link key={o.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {o.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Region</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {regions.map((r) => {
                const active = (r.value ?? undefined) === (region ?? undefined);
                const href = buildHref("/cases", baseParams, { region: r.value });
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
                const href = buildHref("/cases", baseParams, { provider: p.value });
                return (
                  <Link key={p.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {p.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs cx-muted">Showing {filtered.length} cases.</div>
      </div>

      <Table>
        <table>
          <thead>
            <tr>
              <th className="text-left">Case</th>
              <th className="text-left">Site</th>
              <th className="text-left">Severity</th>
              <th className="text-left">Status</th>
              <th className="text-left">Owner</th>
              <th className="text-left">Opened</th>
              <th className="text-left">SLA due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const site = sites.find((s) => s.id === c.siteId);
              const dueInHours = Math.round((new Date(c.slaDueAt).getTime() - nowMs) / (60 * 60 * 1000));
              const slaTone = dueInHours <= 0 ? "risk" : dueInHours <= 8 ? "warning" : "neutral";
              const statusTone = c.status === "resolved" ? "success" : c.status === "waiting" ? "warning" : "neutral";
              return (
                <tr key={c.id}>
                  <td>
                    <div className="font-mono text-xs text-slate-500">{c.id}</div>
                    <div className="mt-1 font-medium">{c.title}</div>
                  </td>
                  <td>
                    <Link className="cx-link" href={`/sites/${c.siteId}`}>
                      {site?.name ?? c.siteId}
                    </Link>
                    {site ? <div className="text-xs cx-muted mt-1">{site.customer} • {site.region}</div> : null}
                  </td>
                  <td>
                    <Badge tone={c.severity === "sev1" ? "risk" : c.severity === "sev2" ? "warning" : "neutral"}>{c.severity}</Badge>
                  </td>
                  <td>
                    <Badge tone={statusTone}>{c.status}</Badge>
                  </td>
                  <td>{c.ownerTeam}</td>
                  <td className="cx-muted">{fromNow(c.openedAt, now)}</td>
                  <td>
                    <Badge tone={slaTone}>{fromNow(c.slaDueAt, now)}</Badge>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm cx-muted" colSpan={7}>
                  No cases match the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Table>
    </main>
  );
}
