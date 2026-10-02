"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

const COLORS = [
  { id: "brand", label: "Brand orange (default)", value: "#F59F0A" },
  { id: "foreground", label: "Warm White", value: "#FBF7F0" },
  { id: "neutral", label: "Neutral White", value: "#E5E5E5" },
  { id: "live", label: "Live Green", value: "#33B277" },
];

/**
 * Wraps the icon sections and provides a colour switcher. The chosen colour
 * is published as --icon-color, which .icon-slot inherits (all icons use
 * currentColor). The live-dot demo stays red — it's a status element.
 */
export default function IconsPreview({ children }: { children: ReactNode }) {
  const [color, setColor] = useState(COLORS[0].value);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Icon colour
        </span>
        {COLORS.map((c) => {
          const active = c.value === color;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setColor(c.value)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                active
                  ? "border-neutral-400 bg-neutral-900 text-neutral-100"
                  : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full ${
                  active ? "ring-2 ring-neutral-400 ring-offset-2 ring-offset-neutral-950" : ""
                }`}
                style={{ backgroundColor: c.value }}
              />
              {c.label}
            </button>
          );
        })}
      </div>
      <div style={{ "--icon-color": color } as CSSProperties}>{children}</div>
    </>
  );
}
