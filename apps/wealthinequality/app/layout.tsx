import type { Metadata } from 'next';
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import GlobalNav from '@/components/GlobalNav';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

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
      <body className={`${inter.variable} ${poppins.variable} ${jetbrains.variable} antialiased`}>
        <GlobalNav />
        {children}
      </body>
    </html>
  );
}
