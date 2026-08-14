import { Suspense } from "react";
import PageTitle from "@/components/ui/PageTitle";
import ActivityClient from "./activity-client";

export default function ActivityPage() {
  return (
    <main>
      <PageTitle
        title="Activity"
        subtitle="Append-only event trail. This is the backbone of explainable dashboards and auditability."
      />
      <Suspense fallback={<div className="cx-panel rounded-2xl p-4 md:p-5 mb-6 text-sm cx-muted">Loading…</div>}>
        <ActivityClient />
      </Suspense>
    </main>
  );
}
