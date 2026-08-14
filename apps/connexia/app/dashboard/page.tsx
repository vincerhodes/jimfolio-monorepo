import Link from "next/link";
import { Suspense } from "react";
import PageTitle from "@/components/ui/PageTitle";
import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
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
      <Suspense fallback={<div className="cx-panel rounded-2xl p-4 md:p-5 mb-6 text-sm cx-muted">Loading…</div>}>
        <DashboardClient />
      </Suspense>
    </main>
  );
}
