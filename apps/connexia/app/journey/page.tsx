import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="cx-panel rounded-3xl p-7 md:p-9">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 text-sm md:text-base text-slate-600 leading-relaxed">{children}</div>
    </section>
  );
}

function Step({
  index,
  title,
  bullets,
  proof,
}: {
  index: string;
  title: string;
  bullets: string[];
  proof: { label: string; href: string }[];
}) {
  return (
    <div className="cx-panel rounded-3xl p-7 md:p-9">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide cx-muted">Phase {index}</div>
          <h3 className="mt-2 text-xl md:text-2xl font-semibold tracking-tight">{title}</h3>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600">
          North-star path
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div className="cx-panel rounded-2xl p-5">
          <div className="text-sm font-medium">What you change</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="cx-panel rounded-2xl p-5">
          <div className="text-sm font-medium">How you prove it (in Connexia)</div>
          <div className="mt-3 grid gap-2">
            {proof.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm hover:bg-slate-100 transition"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JourneyPage() {
  return (
    <main>
      <PageTitle
        title="Journey to data-driven service delivery"
        subtitle="This is the interview narrative: how you go from today’s operational chaos to decision-grade visibility and predictable execution. The goal is not dashboards; the goal is an operating model that uses data to drive action."
        right={
          <Link
            href="/presentation"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            Presentation
          </Link>
        }
      />

      <div className="grid gap-6">
        <Card title="Current state (common reality)">
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="cx-panel rounded-2xl p-4">Status is reconstructed manually from tickets, spreadsheets, and tribal knowledge.</div>
            <div className="cx-panel rounded-2xl p-4">Leadership asks: “what’s blocked?” and teams answer with stories, not evidence.</div>
            <div className="cx-panel rounded-2xl p-4">Handoffs are opaque; ownership is implied; escalations happen late.</div>
            <div className="cx-panel rounded-2xl p-4">Providers and regions are hard to compare; cycle times aren’t measurable.</div>
          </div>
        </Card>

        <Card title="North star (end goal)">
          <div className="text-sm">
            Decision-grade visibility with drill-through:
            <div className="mt-3 grid md:grid-cols-3 gap-3">
              <div className="cx-panel rounded-2xl p-4">A single normalized workflow model for all delivery work.</div>
              <div className="cx-panel rounded-2xl p-4">An event trail that makes every metric explainable.</div>
              <div className="cx-panel rounded-2xl p-4">Policies that trigger the right escalation at the right time.</div>
            </div>
          </div>
        </Card>

        <Step
          index="0"
          title="Stabilize and define the model (2–4 weeks)"
          bullets={[
            "Define a canonical vocabulary: site, service, order, milestone, case, invoice.",
            "Agree on the milestone state machine: planned → in_progress → blocked → done.",
            "Introduce standardized blocked reasons and ownership (provider/customer/NOC/SD).",
            "Start capturing an event trail for key changes (even if manual at first).",
          ]}
          proof={[
            { label: "See the workflow model in Work", href: "/work" },
            { label: "See audit trail in Activity", href: "/activity" },
          ]}
        />

        <Step
          index="1"
          title="Make work visible (4–8 weeks)"
          bullets={[
            "Build a portfolio view: what’s blocked, where, and why.",
            "Create decision-grade dashboards that link to evidence.",
            "Track aging: how long items stay blocked and which queues accumulate.",
            "Start reporting cycle times by provider/region and milestone step.",
          ]}
          proof={[
            { label: "Executive dashboard", href: "/dashboard" },
            { label: "Sites portfolio", href: "/sites" },
          ]}
        />

        <Step
          index="2"
          title="Introduce policy + orchestration (8–12 weeks)"
          bullets={[
            "Define escalation policies: e.g., blocked > N days triggers provider escalation.",
            "Automate ownership routing for common states.",
            "Prevent surprises: SLA-at-risk and target-date-at-risk become proactive queues.",
            "Make the system teach the process (templates + playbooks).",
          ]}
          proof={[
            { label: "SLA-at-risk cases", href: "/cases" },
            { label: "At-risk orders", href: "/dashboard" },
          ]}
        />

        <Step
          index="3"
          title="Optimize and scale (ongoing)"
          bullets={[
            "Use trend data to renegotiate provider SLAs and improve lead time predictability.",
            "Run continuous improvement: bottleneck removal becomes measurable.",
            "Tie cost transparency to service performance and delivery outcomes.",
            "Instrument reliability: correlate incidents, changes, and delivery work.",
          ]}
          proof={[
            { label: "Billing transparency", href: "/billing" },
            { label: "Provider bottlenecks (dashboard)", href: "/dashboard" },
          ]}
        />
      </div>

      <div className="mt-10 text-xs cx-muted">
        Interview tip: narrate this as an operating model change (people + process + data), with software enabling consistency and measurement.
      </div>
    </main>
  );
}
