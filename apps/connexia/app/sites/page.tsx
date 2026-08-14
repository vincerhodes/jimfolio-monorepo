import { Suspense } from "react";
import PageTitle from "@/components/ui/PageTitle";
import SitesClient from "./sites-client";

export default function SitesPage() {
  return (
    <main>
      <PageTitle
        title="Sites"
        subtitle="Portfolio view. This is the entry point for drilling into delivery, cases, performance signals and billing by site."
      />
      <Suspense fallback={<div className="cx-panel rounded-2xl p-4 md:p-5 mb-6 text-sm cx-muted">Loading…</div>}>
        <SitesClient />
      </Suspense>
    </main>
  );
}
