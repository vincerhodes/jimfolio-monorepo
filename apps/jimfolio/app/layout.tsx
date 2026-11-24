import type { Metadata } from 'next';
import './globals.css';

const title = "Jim's Garage — Experiments, Tools & Side Builds";
const description =
  'An interactive 3D workshop showcasing live experiments, utilities, and apps built by Jimmy Rhodes on jimsgarage.dev.';

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL('https://jimsgarage.dev'),
  authors: [{ name: 'Jimmy Rhodes', url: 'https://jimsgarage.dev' }],
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: 'https://jimsgarage.dev',
    siteName: "Jim's Garage",
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Jim's Garage — Interactive 3D Workshop by Jimmy Rhodes",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
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
