"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { providers, sites, type Region } from "@/lib/demo-data";
import { getProviderName } from "@/lib/metrics";
import { Search } from "lucide-react";

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

export default function SitesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const getParam = (key: string) => searchParams.get(key) ?? undefined;

  const qRaw = getParam("q")?.trim();
  const q = qRaw ? qRaw.toLowerCase() : undefined;
  const region = getParam("region") as Region | undefined;
  const providerId = getParam("provider");
  const criticality = getParam("criticality") as "standard" | "critical" | undefined;

  const filtered = sites.filter((s) => {
    if (region && s.region !== region) return false;
    if (providerId && s.providerId !== providerId) return false;
    if (criticality && s.criticality !== criticality) return false;

    if (q) {
      const providerName = getProviderName(s.providerId).toLowerCase();
      const haystack = `${s.id} ${s.name} ${s.customer} ${s.country} ${s.region} ${providerName}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const regions: Array<{ label: string; value?: Region }> = [
    { label: "All", value: undefined },
    ...Array.from(new Set(sites.map((s) => s.region))).sort().map((r) => ({ label: r, value: r })),
  ];

  const providerOptions: Array<{ label: string; value?: string }> = [
    { label: "All", value: undefined },
    ...providers.map((p) => ({ label: p.name, value: p.id })),
  ];

  const criticalityOptions: Array<{ label: string; value?: "standard" | "critical" }> = [
    { label: "All", value: undefined },
    { label: "Critical", value: "critical" },
    { label: "Standard", value: "standard" },
  ];

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("q");
    const trimmed = (typeof value === "string" ? value : "").trim();
    router.replace(
      buildHref(
        "/sites",
        {
          region: region ?? undefined,
          provider: providerId ?? undefined,
          criticality: criticality ?? undefined,
        },
        { q: trimmed ? trimmed : undefined }
      )
    );
  }

  return (
    <>
      <div className="cx-panel rounded-2xl p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={onSearchSubmit} className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                key={qRaw ?? ""}
                name="q"
                defaultValue={qRaw ?? ""}
                placeholder="Search sites, customers…"
                className="h-9 w-[280px] max-w-[70vw] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
            <button type="submit" className="h-9 inline-flex items-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 transition">
              Search
            </button>
          </form>

          {(qRaw || region || providerId || criticality) ? (
            <Link href="/sites" className="text-sm cx-link">
              Clear filters
            </Link>
          ) : null}
        </div>

        <div className="mt-4 grid lg:grid-cols-3 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Region</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {regions.map((r) => {
                const active = (r.value ?? undefined) === (region ?? undefined);
                const href = buildHref(
                  "/sites",
                  {
                    q: qRaw ?? undefined,
                    region: region ?? undefined,
                    provider: providerId ?? undefined,
                    criticality: criticality ?? undefined,
                  },
                  {
                    region: r.value,
                  }
                );

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
                const href = buildHref(
                  "/sites",
                  {
                    q: qRaw ?? undefined,
                    region: region ?? undefined,
                    provider: providerId ?? undefined,
                    criticality: criticality ?? undefined,
                  },
                  {
                    provider: p.value,
                  }
                );

                return (
                  <Link key={p.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {p.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide cx-muted">Criticality</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {criticalityOptions.map((c) => {
                const active = (c.value ?? undefined) === (criticality ?? undefined);
                const href = buildHref(
                  "/sites",
                  {
                    q: qRaw ?? undefined,
                    region: region ?? undefined,
                    provider: providerId ?? undefined,
                    criticality: criticality ?? undefined,
                  },
                  {
                    criticality: c.value,
                  }
                );

                return (
                  <Link key={c.label} href={href} className={active ? "cx-chip cx-chip-active" : "cx-chip"}>
                    {c.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {(qRaw || region || providerId || criticality) ? (
          <div className="mt-4 text-xs cx-muted">Showing {filtered.length} of {sites.length} sites. Drill-through keeps this context.</div>
        ) : (
          <div className="mt-4 text-xs cx-muted">Showing {filtered.length} sites.</div>
        )}
      </div>

      <Table>
        <table>
          <thead>
            <tr>
              <th className="text-left">Site</th>
              <th className="text-left">Customer</th>
              <th className="text-left">Region</th>
              <th className="text-left">Provider</th>
              <th className="text-left">Criticality</th>
              <th className="text-right">Open</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs cx-muted">{s.country} • {s.id}</div>
                </td>
                <td>
                  <div className="font-medium">{s.customer}</div>
                </td>
                <td>{s.region}</td>
                <td>{getProviderName(s.providerId)}</td>
                <td>
                  <Badge tone={s.criticality === "critical" ? "warning" : "neutral"}>{s.criticality}</Badge>
                </td>
                <td className="text-right">
                  <Link className="cx-link" href={`/sites/${s.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-sm cx-muted">
                  No sites match the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Table>

      <div className="mt-6 text-xs cx-muted">
        Providers in dataset: {providers.map((p) => p.name).join(", ")}
      </div>
    </>
  );
}
