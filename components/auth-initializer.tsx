"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

/**
 * 认证初始化组件
 * 在应用启动时初始化认证状态并监听变化
 */
export function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
