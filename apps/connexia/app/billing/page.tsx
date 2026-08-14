import { Suspense } from "react";
import PageTitle from "@/components/ui/PageTitle";
import BillingClient from "./billing-client";

export default function BillingPage() {
  return (
    <main>
      <PageTitle
        title="Billing"
        subtitle="Invoice-by-site history. This page exists to highlight transparency and anomaly surfacing for service delivery leadership."
      />
      <Suspense fallback={<div className="cx-panel rounded-2xl p-4 md:p-5 mb-6 text-sm cx-muted">Loading…</div>}>
        <BillingClient />
      </Suspense>
    </main>
  );
}
