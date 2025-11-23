'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import Sidebar from './Sidebar';
import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8" style={{ background: 'var(--bg-tertiary)' }}>
          {children}
        </main>
      </>
    </ThemeProvider>
  );
}
