import type { Metadata } from 'next';
import './globals.css';

const title = "Jim's Garage — Experiments, Tools & Side Builds";
const description =
  'An interactive 3D workshop showcasing live experiments, utilities, and apps built by Jimmy Rhodes on jimsgarage.dev.';

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL('https://jimsgarage.dev'),
  openGraph: {
    title,
    description,
    url: 'https://jimsgarage.dev',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0b0d12] text-stone-100 antialiased">{children}</body>
    </html>
  );
}
