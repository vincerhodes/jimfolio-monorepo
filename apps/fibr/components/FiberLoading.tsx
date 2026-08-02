"use client";

// Loading indicator with a spinner and rotating fiber-themed phrases, so
// longer waits (e.g. USDA live search) feel alive instead of static.
import { useEffect, useState } from "react";

const DEFAULT_PHRASES = [
  "Chewing through the USDA database…",
  "Counting chickpeas…",
  "Rummaging the legume aisle…",
  "Weighing the wheat bran…",
  "Consulting the oat council…",
  "Sifting the seeds & nuts…",
  "Measuring the roughage…",
];

export default function FiberLoading({
  phrases = DEFAULT_PHRASES,
  intervalMs = 1400,
}: {
  phrases?: string[];
  intervalMs?: number;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % phrases.length), intervalMs);
    return () => clearInterval(t);
  }, [phrases.length, intervalMs]);

  return (
    <div className="flex items-center justify-center gap-2.5 pt-8 text-gray-400">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5 animate-spin text-primary"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span key={i} className="text-sm">{phrases[i]}</span>
    </div>
  );
}
