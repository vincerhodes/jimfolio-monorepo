import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "crema",
  description: "Recipe generator and coffee tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-neutral-200">
          <nav className="mx-auto flex max-w-4xl items-center gap-6 p-4">
            <Link href="/" className="font-semibold">
              crema
            </Link>
            <Link href="/" className="text-sm text-neutral-600 hover:underline">
              Generator
            </Link>
            <Link href="/saved" className="text-sm text-neutral-600 hover:underline">
              Saved
            </Link>
            <Link href="/coffee" className="text-sm text-neutral-600 hover:underline">
              Coffee
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
