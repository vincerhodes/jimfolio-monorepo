import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jimfolio — Jimmy Rhodes",
  description:
    "Apps, experiments and data stories by Jimmy Rhodes. A hub for every live project on jimfolio.space.",
};

// No-FOUC theme init: default light, apply saved dark choice before first paint.
const themeInit = `try{if(localStorage.getItem('jimfolio-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
