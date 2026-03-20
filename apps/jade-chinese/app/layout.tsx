import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JADE Chinese — Learn Mandarin",
  description: "Learn Mandarin the smart way with flashcards, quizzes, and vocabulary tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">{children}</body>
    </html>
  );
}
