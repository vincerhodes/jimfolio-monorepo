import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";

function Slide({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="cx-panel rounded-3xl p-8 md:p-10">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PresentationPage() {
  return (
    <main>
      <PageTitle
        title="Connexia walkthrough"
        subtitle="A presentation-style narrative that explains the architecture and why it makes service delivery faster, calmer, and more predictable."
        right={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/journey"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              Journey
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
            >
              Jump to dashboard
            </Link>
          </div>
        }
      />

      <div className="grid gap-6">
        <Slide title="1) The problem: delivery becomes chaotic when work is invisible">
          <div>
            When service delivery spans providers, regions, change windows and handoffs, the system becomes noisy.
            The true cost isn’t just outages—it’s the manual effort to answer basic questions:
            <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
              <div className="cx-panel rounded-2xl p-4">What’s blocked, where, and who owns the next action?</div>
              <div className="cx-panel rounded-2xl p-4">Which orders are at risk of breaching target dates?</div>
              <div className="cx-panel rounded-2xl p-4">Which cases will breach SLA unless escalated now?</div>
              <div className="cx-panel rounded-2xl p-4">Where is cost drift happening by site/service?</div>
            </div>
          </div>
        </Slide>

        <Slide title="2) The remedy: normalize workflow state + make it auditable">
          <div>
            Connexia uses a small, explainable state machine for milestones:
            <div className="mt-4 cx-panel rounded-2xl p-4 text-sm">
              planned → in_progress → blocked → done
            </div>
            <div className="mt-4">
              Blocked is only useful when it includes a standardized reason (awaiting provider, awaiting customer,
              awaiting change window) and a visible ownership model.
            </div>
          </div>
        </Slide>

        <Slide title="3) Dashboards must link to evidence">
          <div>
            Metrics without drill-through create debate. Connexia is designed so every widget links to the filtered list of
            work items behind it, and every work item is backed by an event trail.
            <div className="mt-4">
              <Link className="cx-link" href="/activity">
                See the event trail
              </Link>
            </div>
          </div>
        </Slide>

        <Slide title="4) The path: how you get from today to the north star">
          <div>
            This isn’t a “big bang dashboard project.” It’s a phased operating model change:
            <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
              <div className="cx-panel rounded-2xl p-4">Phase 0: define the model + vocabulary</div>
              <div className="cx-panel rounded-2xl p-4">Phase 1: make work visible + measurable</div>
              <div className="cx-panel rounded-2xl p-4">Phase 2: introduce policy + orchestration</div>
              <div className="cx-panel rounded-2xl p-4">Phase 3: optimize providers + scale improvement</div>
            </div>
            <div className="mt-4">
              <Link className="cx-link" href="/journey">
                Open the Journey page (interview narrative)
              </Link>
            </div>
          </div>
        </Slide>

        <Slide title="5) Leadership outcomes: fewer surprises, faster escalations">
          <div>
            The goal is not more data. The goal is fewer escalations that arrive late.
            <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
              <div className="cx-panel rounded-2xl p-4">Reduce status chasing</div>
              <div className="cx-panel rounded-2xl p-4">Expose bottlenecks by provider/region</div>
              <div className="cx-panel rounded-2xl p-4">Make SLA risk visible early</div>
            </div>
          </div>
        </Slide>

        <Slide title="6) How to explore the demo">
          <div>
            <div className="mt-2 grid md:grid-cols-2 gap-3 text-sm">
              <Link className="cx-panel rounded-2xl p-4 hover:bg-slate-50 transition" href="/dashboard">
                Dashboard
              </Link>
              <Link className="cx-panel rounded-2xl p-4 hover:bg-slate-50 transition" href="/work">
                Work (orders + milestones)
              </Link>
              <Link className="cx-panel rounded-2xl p-4 hover:bg-slate-50 transition" href="/sites">
                Sites (portfolio drilldown)
              </Link>
              <Link className="cx-panel rounded-2xl p-4 hover:bg-slate-50 transition" href="/billing">
                Billing transparency
              </Link>
            </div>
          </div>
        </Slide>
      </div>

      <div className="mt-10 text-xs cx-muted">
        Connexia is fictional. Data is synthetic. No affiliation with any real vendor, customer, or employer.
      </div>
    </main>
  );
}
