"use client";

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/stores/theme-store';

/**
 * 主题初始化组件
 * 在应用启动时初始化主题并监听系统主题变化
 */
export function ThemeInitializer() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // 初始化时应用主题
    setTheme(theme);

    // 监听系统主题变化（仅当主题设置为 'system' 时）
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        // 触发重新应用主题
        setTheme('system');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, setTheme]);

  return null;
}
