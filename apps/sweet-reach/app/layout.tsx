import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const jimfolioHref =
  process.env.NEXT_PUBLIC_JIMFOLIO_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3100" : "/");

export const metadata: Metadata = {
  title: "SweetReach Insight",
  description: "Global Insight Gathering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen antialiased">
        <a
          href={jimfolioHref}
          className="fixed left-4 bottom-4 z-50 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur hover:bg-white hover:text-slate-900"
        >
          ← Jimfolio
        </a>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
