import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import StatCard from "@/components/ui/StatCard";
import { cases, invoices, orders, sites } from "@/lib/demo-data";
import { getOrderStatus, getProviderName } from "@/lib/metrics";

export default function SiteDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const nowMs = new Date().getTime();
  const site = sites.find((s) => s.id === id);

  if (!site) {
    return (
      <main>
        <PageTitle title="Site not found" subtitle="The demo dataset does not include this site ID." />
        <Link className="cx-link" href="/sites">
          Back to sites
        </Link>
      </main>
    );
  }

  const siteOrders = orders.filter((o) => o.siteId === id);
  const siteCases = cases.filter((c) => c.siteId === id);
  const siteInvoices = invoices.filter((i) => i.siteId === id);

  const blockedMilestones = siteOrders.reduce((acc, o) => acc + o.milestones.filter((m) => m.state === "blocked").length, 0);
  const openCases = siteCases.filter((c) => c.status !== "resolved").length;
  const slaAtRisk = siteCases.filter((c) => c.status !== "resolved").filter((c) => {
    const dueInHours = Math.round((new Date(c.slaDueAt).getTime() - nowMs) / (60 * 60 * 1000));
    return dueInHours <= 8;
  }).length;
  const disputedInvoices = siteInvoices.filter((i) => i.status === "disputed").length;

  return (
    <main>
      <PageTitle
        title={site.name}
        subtitle={`${site.customer} • ${site.country} • ${site.region} • Provider: ${getProviderName(site.providerId)} • ${site.id}`}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={site.criticality === "critical" ? "warning" : "neutral"}>{site.criticality}</Badge>
            <Link
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              href="/sites"
            >
              Back
            </Link>
          </div>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Active orders" value={String(siteOrders.length)} />
        <StatCard title="Blocked milestones" value={String(blockedMilestones)} tone={blockedMilestones ? "warning" : "success"} />
        <StatCard title="Open cases" value={String(openCases)} tone={openCases ? "warning" : "success"} />
        <StatCard title="SLA at risk" value={String(slaAtRisk)} tone={slaAtRisk ? "risk" : "success"} />
        <StatCard title="Disputed invoices" value={String(disputedInvoices)} tone={disputedInvoices ? "risk" : "success"} />
      </div>

      <div className="cx-panel rounded-2xl p-4 md:p-5 mt-6">
        <div className="text-xs uppercase tracking-wide cx-muted">Quick actions</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="cx-chip cx-chip-active" href={`/work?site=${encodeURIComponent(site.id)}`}>Work queue</Link>
          <Link className="cx-chip" href={`/cases?site=${encodeURIComponent(site.id)}`}>Cases</Link>
          <Link className="cx-chip" href={`/billing?site=${encodeURIComponent(site.id)}`}>Billing</Link>
          <Link className="cx-chip" href={`/activity?site=${encodeURIComponent(site.id)}`}>Activity</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <section>
          <PageTitle title="Delivery work" subtitle="Orders and their normalized state." />
          <Table>
            <table>
              <thead>
                <tr>
                  <th className="text-left">Order</th>
                  <th className="text-left">Service</th>
                  <th className="text-left">Status</th>
                  <th className="text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {siteOrders.map((o) => {
                  const s = getOrderStatus(o.id);
                  const tone = s.state === "blocked" ? "warning" : s.state === "done" ? "success" : "neutral";
                  return (
                    <tr key={o.id}>
                      <td className="font-mono text-xs text-slate-500">{o.id}</td>
                      <td>{o.serviceType}</td>
                      <td>
                        <Badge tone={tone}>{s.state}{s.blockedReason ? ` • ${s.blockedReason}` : ""}</Badge>
                      </td>
                      <td className="text-right">
                        <Link className="cx-link" href={`/work?site=${encodeURIComponent(site.id)}&q=${encodeURIComponent(o.id)}`}>
                          Drill-through
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {siteOrders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm cx-muted" colSpan={4}>
                      No orders for this site in the demo dataset.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Table>
        </section>

        <section>
          <PageTitle title="Cases" subtitle="Operational issues with SLA clocks and ownership." />
          <Table>
            <table>
              <thead>
                <tr>
                  <th className="text-left">Case</th>
                  <th className="text-left">Severity</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Owner</th>
                </tr>
              </thead>
              <tbody>
                {siteCases.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-mono text-xs text-slate-500">{c.id}</div>
                      <div className="mt-1 font-medium">{c.title}</div>
                      <div className="mt-1">
                        <Link className="cx-link" href={`/cases?site=${encodeURIComponent(site.id)}&q=${encodeURIComponent(c.id)}`}>
                          Drill-through
                        </Link>
                      </div>
                    </td>
                    <td>
                      <Badge tone={c.severity === "sev1" ? "risk" : c.severity === "sev2" ? "warning" : "neutral"}>{c.severity}</Badge>
                    </td>
                    <td>{c.status}</td>
                    <td>{c.ownerTeam}</td>
                  </tr>
                ))}
                {siteCases.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm cx-muted" colSpan={4}>
                      No cases for this site in the demo dataset.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Table>
        </section>
      </div>

      <section className="mt-8">
        <PageTitle title="Billing" subtitle="Invoice history by site (transparency + anomaly surfacing)." />
        <Table>
          <table>
            <thead>
              <tr>
                <th className="text-left">Invoice</th>
                <th className="text-left">Period</th>
                <th className="text-left">Status</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {siteInvoices.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div className="font-mono text-xs text-slate-500">{i.id}</div>
                    <div className="mt-1">
                      <Link className="cx-link" href={`/billing?site=${encodeURIComponent(site.id)}&q=${encodeURIComponent(i.id)}`}>
                        Drill-through
                      </Link>
                    </div>
                  </td>
                  <td>{i.period}</td>
                  <td>
                    <Badge tone={i.status === "disputed" ? "risk" : i.status === "due" ? "warning" : "success"}>{i.status}</Badge>
                  </td>
                  <td className="text-right">£{i.amountGbp.toLocaleString()}</td>
                </tr>
              ))}
              {siteInvoices.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm cx-muted" colSpan={4}>
                    No invoices for this site in the demo dataset.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Table>
      </section>
    </main>
  );
}
