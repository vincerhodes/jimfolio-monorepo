"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { API_BASE } from "@/lib/api-base";
import { BASE_PATH } from "@/lib/auth-constants";

const SECTIONS = [
  { href: "/", label: "Home", accent: "#10b981" },
  { href: "/search", label: "Search", accent: "#059669" },
  { href: "/history", label: "History", accent: "#34d399" },
  { href: "/settings", label: "Settings", accent: "#047857" },
  { href: "/account", label: "Account", accent: "#6b7280" },
];

export default function Nav({ userName = null }: { userName?: string | null }) {
  // usePathname may include the basePath (/fibr locally); strip it only
  // when a basePath is actually configured — in prod BASE_PATH is "".
  const raw = usePathname();
  const pathname =
    (BASE_PATH
      ? raw.replace(new RegExp(`^${BASE_PATH}(?=/|$)`), "")
      : raw) || "/";

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: "POST" });
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
            className={`-mb-[17px] self-stretch border-b-2 pb-3 pt-2 text-sm font-medium ${
              active ? "" : "border-transparent text-gray-500 hover:text-ink"
            }`}
            style={active ? { borderColor: accent, color: accent } : undefined}
          >
            {label}
          </Link>
        );
      })}
      <a
        href="https://jimfolio.space"
        className="ml-auto self-center text-sm text-gray-500 hover:text-ink hover:underline"
      >
        ← jimfolio.space
      </a>
      {userName && (
        <span className="self-center text-sm text-gray-500">{userName}</span>
      )}
      {userName && (
        <button
          type="button"
          onClick={logout}
          className="self-center text-sm text-gray-500 hover:text-ink hover:underline"
        >
          Log out
        </button>
      )}
    </>
  );
}
