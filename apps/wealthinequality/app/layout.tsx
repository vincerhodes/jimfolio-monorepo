import type { Metadata } from 'next';
import './globals.css';
import GlobalNav from '@/components/GlobalNav';

const jimfolioHref =
  process.env.NEXT_PUBLIC_JIMFOLIO_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3100' : '/');

export const metadata: Metadata = {
  title: 'Wealth Inequality in the UK | A Data Story',
  description: 'An interactive exploration of rising wealth inequality in the UK, from post-war prosperity to today\'s crisis, and the solutions that can fix it.',
  keywords: ['wealth inequality', 'UK economy', 'wealth tax', 'economic justice', 'data visualization'],
  authors: [{ name: 'Jim Rhodes' }],
  openGraph: {
    title: 'Wealth Inequality in the UK | A Data Story',
    description: 'An interactive exploration of rising wealth inequality in the UK',
    type: 'website',
    siteName: 'Jimfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wealth Inequality in the UK | A Data Story',
    description: 'An interactive exploration of rising wealth inequality in the UK',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <a
          href={jimfolioHref}
          className="fixed left-4 bottom-4 z-50 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur hover:bg-white hover:text-slate-900"
        >
          ← Jimfolio
        </a>
        <GlobalNav />
        {children}
      </body>
    </html>
  );
}
