"use client";

import { useState, useEffect } from 'react';
import { safeStorage } from './safe-storage';

/**
 * Feature flag hook
 * 从 localStorage 读取 feature flag 状态
 *
 * 使用方法:
 * 1. 在浏览器控制台启用: window.__LR_DEBUG__.enableFeature('video_refactor')
 * 2. 在浏览器控制台禁用: window.__LR_DEBUG__.disableFeature('video_refactor')
 * 3. 刷新页面生效
 */
export function useFeatureFlag(flag: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;

    const value = safeStorage.getItem(`feature_${flag}`);
    setEnabled(value === 'true');

    // 监听 storage 事件,支持跨标签页同步
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `feature_${flag}`) {
        setEnabled(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [flag]);

  return enabled;
}

/**
 * 环境变量控制的 feature flag
 * 优先级: localStorage > 环境变量 > 默认值
 */
export function useFeatureFlagWithEnv(
  flag: string,
  envKey?: string,
  defaultValue: boolean = false
): boolean {
  const [enabled, setEnabled] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. 检查 localStorage (最高优先级)
    const localValue = safeStorage.getItem(`feature_${flag}`);
    if (localValue !== null) {
      setEnabled(localValue === 'true');
      return;
    }

    // 2. 检查环境变量
    if (envKey && process.env[envKey] !== undefined) {
      setEnabled(process.env[envKey] === 'true');
      return;
    }

    // 3. 使用默认值
    setEnabled(defaultValue);
  }, [flag, envKey, defaultValue]);

  return enabled;
}

/**
 * 调试工具接口
 */
interface DebugTools {
  enableFeature: (flag: string) => void;
  disableFeature: (flag: string) => void;
  checkFeature: (flag: string) => void;
}

declare global {
  interface Window {
    __LR_DEBUG__?: DebugTools;
  }
}

/**
 * 辅助函数: 在浏览器控制台中管理 feature flags
 *
 * 示例:
 * window.__LR_DEBUG__.enableFeature('video_refactor')
 * window.__LR_DEBUG__.disableFeature('video_refactor')
 * window.__LR_DEBUG__.checkFeature('video_refactor')
 */
if (typeof window !== 'undefined') {
  window.__LR_DEBUG__ = {
    enableFeature: (flag: string) => {
      safeStorage.setItem(`feature_${flag}`, 'true');
      console.log(`✅ Feature "${flag}" enabled. Refresh the page to apply.`);
    },

    disableFeature: (flag: string) => {
      safeStorage.setItem(`feature_${flag}`, 'false');
      console.log(`❌ Feature "${flag}" disabled. Refresh the page to apply.`);
    },

    checkFeature: (flag: string) => {
      const value = safeStorage.getItem(`feature_${flag}`);
      console.log(`Feature "${flag}": ${value === 'true' ? '✅ enabled' : '❌ disabled'}`);
    },
  };
}
