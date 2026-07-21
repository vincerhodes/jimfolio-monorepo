"use client";

import { useState } from "react";

interface BeanSearchProps {
  initialQuery: string;
  view: string;
}

export default function BeanSearch({ initialQuery, view }: BeanSearchProps) {
  const [pending, setPending] = useState(false);

  return (
    <form method="get" className="flex gap-2" onSubmit={() => setPending(true)}>
      {view === "archived" && <input type="hidden" name="view" value="archived" />}
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder="Search name, roaster, origin…"
        aria-label="Search beans"
        className="input sm:max-w-xs"
      />
      <button
        type="submit"
        disabled={pending}
        className="btn-primary"
      >
        {pending ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
