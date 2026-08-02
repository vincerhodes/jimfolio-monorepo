import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kickoff Logo Lab",
  description: "KickoffHQ logo generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
