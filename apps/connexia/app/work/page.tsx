import { Suspense } from "react";
import PageTitle from "@/components/ui/PageTitle";
import WorkClient from "./work-client";

export default function WorkPage() {
  return (
    <main>
      <PageTitle
        title="Work"
        subtitle="Orders and milestones normalized into a small, explainable state machine. This is the core of process efficiency."
      />
      <Suspense fallback={<div className="cx-panel rounded-2xl p-4 md:p-5 mb-6 text-sm cx-muted">Loading…</div>}>
        <WorkClient />
      </Suspense>
    </main>
  );
}
