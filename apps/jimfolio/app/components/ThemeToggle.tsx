'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'jimfolio-theme';

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // storage unavailable — theme just won't persist
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-full border border-stone-300 dark:border-white/15 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-white/10 transition-colors"
    >
      {/* render a stable placeholder until mounted to avoid hydration mismatch */}
      {dark === null ? (
        <span className="block w-[18px] h-[18px]" />
      ) : dark ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}
