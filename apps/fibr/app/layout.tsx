import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import Nav from "@/components/Nav";
import Icon from "@/components/Icon";
import "./globals.css";

export const metadata: Metadata = {
  title: "fibr",
  description: "Daily fiber tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  return (
    <html lang="en">
      <body>
        <header className="border-b border-gray-100">
          <nav className="mx-auto flex max-w-4xl items-baseline gap-3 overflow-x-auto whitespace-nowrap p-4 sm:gap-6 sm:overflow-x-visible">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 text-xl font-extrabold tracking-tight text-ink"
            >
              <span>
                fibr<span className="text-primary">.</span>
              </span>
              <Icon name="wheat" className="h-5 w-5 text-primary" />
            </Link>
            <Nav userName={user?.displayName || user?.name || null} />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
