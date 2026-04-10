"use client";

import { useThemeStore } from '@/lib/stores/theme-store';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    { value: 'light' as const, icon: Sun, label: '浅色' },
    { value: 'dark' as const, icon: Moon, label: '深色' },
    { value: 'system' as const, icon: Monitor, label: '跟随系统' },
  ];

  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/5 dark:bg-white/5 p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
            theme === value
              ? 'bg-brand text-white'
              : 'text-muted hover:bg-white/5 hover:text-white dark:hover:bg-white/5 dark:hover:text-white'
          }`}
          aria-label={`切换到${label}模式`}
          aria-pressed={theme === value}
        >
          <Icon size={16} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
