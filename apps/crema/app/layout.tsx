import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

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
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <header className="border-b border-[#e7e0d5]">
          <nav className="mx-auto flex max-w-4xl items-baseline gap-6 p-4">
            <Link
              href="/"
              className="font-display text-xl font-semibold tracking-tight text-espresso"
            >
              crema<span className="text-terracotta">.</span>
            </Link>
            <Nav showLogout={Boolean(process.env.CREMA_PASSWORD)} />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
