import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { getSessionUser } from "@/lib/auth";
import Nav from "@/components/Nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "pantry",
  description: "Recipe generator and pantry tracker",
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
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <header className="border-b border-[#e7e0d5]">
          <nav className="mx-auto flex max-w-4xl items-baseline gap-6 p-4">
            <Link
              href="/"
              className="font-display text-xl font-semibold tracking-tight text-espresso"
            >
              pantry<span className="text-terracotta">.</span>
            </Link>
            <Nav userName={user?.name ?? null} />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
