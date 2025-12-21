import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="cx-panel rounded-3xl p-10 md:p-14">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 text-xs tracking-wide uppercase cx-muted">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Fictional showcase • Synthetic data
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Connexia
            <span className="block text-slate-600 text-2xl md:text-3xl mt-4 font-normal">
              Service delivery visibility and workflow orchestration
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
            A demonstration of how to make service delivery execution transparent for leadership: normalized workflow states,
            decision-grade dashboards, and an audit trail that explains every metric.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-5 py-3 text-sm font-medium hover:bg-blue-700 transition"
              href="/dashboard"
            >
              Open dashboard <ArrowRight size={18} />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              href="/presentation"
            >
              Walkthrough
            </Link>
          </div>

          <div className="pt-10 grid md:grid-cols-3 gap-4 text-sm">
            <div className="cx-panel rounded-2xl p-5">
              <div className="font-medium">Efficiency</div>
              <div className="cx-muted mt-2">Replace status-chasing with standardized work state and ownership.</div>
            </div>
            <div className="cx-panel rounded-2xl p-5">
              <div className="font-medium">Transparency</div>
              <div className="cx-muted mt-2">One operational truth across orders, cases, performance and billing.</div>
            </div>
            <div className="cx-panel rounded-2xl p-5">
              <div className="font-medium">Explainability</div>
              <div className="cx-muted mt-2">Dashboards link directly to the underlying work and event trail.</div>
            </div>
          </div>

          <div className="pt-10 text-xs cx-muted">
            Not affiliated with any real company. No real customer/provider data.
          </div>
        </div>
      </div>
    </main>
  );
}
