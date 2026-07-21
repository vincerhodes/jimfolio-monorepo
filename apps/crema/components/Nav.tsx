"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

const SECTIONS = [
  { href: "/", label: "Generator", accent: "#c2571f" },
  { href: "/saved", label: "Saved", accent: "#5f7a52" },
  { href: "/pantry", label: "Pantry", accent: "#75742c" },
  { href: "/coffee", label: "Coffee", accent: "#4a2c1a" },
];

export default function Nav({ showLogout = false }: { showLogout?: boolean }) {
  // usePathname may include the basePath (/crema locally); strip it.
  const pathname = usePathname().replace(/^\/crema(?=\/|$)/, "") || "/";

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/logout`, { method: "POST" });
    } finally {
      window.location.href = `${API_BASE}/login`;
    }
  }

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
      {showLogout && (
        <button
          type="button"
          onClick={logout}
          className="ml-auto self-center text-sm text-[#7a6a5d] hover:text-ink hover:underline"
        >
          Log out
        </button>
      )}
    </>
  );
}
