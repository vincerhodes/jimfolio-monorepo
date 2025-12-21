"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, Compass, CreditCard, FileText, LayoutGrid, ListChecks, Search, ShieldAlert } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/sites", label: "Sites", icon: LayoutGrid },
  { href: "/work", label: "Work", icon: ListChecks },
  { href: "/cases", label: "Cases", icon: ShieldAlert },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/journey", label: "Journey", icon: Compass },
  { href: "/presentation", label: "Presentation", icon: FileText },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1680px] px-4 md:px-6 py-6">
        <div className="cx-panel rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
            <aside className="border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold tracking-tight">Connexia</div>
                  <div className="text-xs cx-muted mt-1">Fictional service delivery showcase</div>
                </div>
                <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600">
                  Synthetic
                </div>
              </div>

              <nav className="mt-8 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        active
                          ? "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium bg-blue-600 text-white"
                          : "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                      }
                    >
                      <Icon size={18} className={active ? "text-white" : "text-slate-500"} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-10 text-xs cx-muted leading-relaxed">
                Dashboards link to evidence. Every state change is recorded.
              </div>
            </aside>

            <div className="min-w-0">
              <header className="px-4 md:px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="text-sm text-slate-600">
                  Public URL: <span className="text-slate-900">/connexia</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form action="/sites" method="get" className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="q"
                        placeholder="Search sites, customers…"
                        className="h-9 w-[260px] max-w-[70vw] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-9 inline-flex items-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                      Search
                    </button>
                  </form>
                  <Link href="/" className="h-9 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50 transition">
                    Home
                  </Link>
                </div>
              </header>
              <div className="p-4 md:p-6 lg:p-8">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
