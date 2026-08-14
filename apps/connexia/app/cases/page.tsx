import { Suspense } from "react";
import PageTitle from "@/components/ui/PageTitle";
import CasesClient from "./cases-client";

export default function CasesPage() {
  return (
    <main>
      <PageTitle
        title="Cases"
        subtitle="Open cases with SLA clocks and ownership. This makes escalation predictable and measurable."
      />
      <Suspense fallback={<div className="cx-panel rounded-2xl p-4 md:p-5 mb-6 text-sm cx-muted">Loading…</div>}>
        <CasesClient />
      </Suspense>
    </main>
  );
}
