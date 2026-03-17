import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Power BI Fundamentals Bootcamp",
  description: "2 live sessions · Beginner-friendly · Instructor-led",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
