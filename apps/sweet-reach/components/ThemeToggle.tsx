'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Droplet, Leaf } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', name: 'Light', icon: Sun, color: '#f59e0b' },
    { id: 'dark', name: 'Dark', icon: Moon, color: '#94a3b8' },
    { id: 'blue', name: 'Ocean', icon: Droplet, color: '#3b82f6' },
    { id: 'green', name: 'Forest', icon: Leaf, color: '#22c55e' }
  ];

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border transition-colors" style={{
      background: 'var(--bg-primary)',
      borderColor: 'var(--border-color)'
    }}>
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            className={`p-2 rounded transition-all ${isActive ? 'scale-110' : ''}`}
            style={{
              background: isActive ? 'var(--accent-primary)' : 'transparent',
            }}
            title={t.name}
          >
            <Icon 
              size={18} 
              style={{ 
                color: isActive ? 'var(--bg-primary)' : t.color 
              }} 
            />
          </button>
        );
      })}
    </div>
  );
}
