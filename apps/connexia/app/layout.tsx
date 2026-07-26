import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Connexia",
  description: "Fictional service delivery visibility and workflow orchestration showcase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a
          href="https://jimfolio.space"
          className="fixed left-4 bottom-4 z-50 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur hover:bg-white hover:text-slate-900"
        >
          ← jimfolio.space
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
