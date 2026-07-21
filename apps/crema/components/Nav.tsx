"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/", label: "Generator", accent: "#c2571f" },
  { href: "/saved", label: "Saved", accent: "#5f7a52" },
  { href: "/pantry", label: "Pantry", accent: "#75742c" },
  { href: "/coffee", label: "Coffee", accent: "#4a2c1a" },
];

export default function Nav() {
  // usePathname may include the basePath (/crema locally); strip it.
  const pathname = usePathname().replace(/^\/crema(?=\/|$)/, "") || "/";

  return (
    <>
      {SECTIONS.map(({ href, label, accent }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`-mb-[17px] self-stretch border-b-2 pb-3 pt-1 text-sm font-medium ${
              active ? "" : "border-transparent text-[#7a6a5d] hover:text-ink"
            }`}
            style={active ? { borderColor: accent, color: accent } : undefined}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
