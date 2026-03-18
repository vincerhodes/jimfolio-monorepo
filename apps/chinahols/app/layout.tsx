import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "China 2026 — Mark, Bec & Stan",
  description: "Our China adventure through Beijing, Xi'an, Dujiangyan, Chengdu, Wushan, and Chongqing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
