/**
 * 字幕缓存管理器
 * 实现字幕预加载和缓存策略
 */

import { safeStorage } from './safe-storage';

interface CachedSubtitle {
  videoId: string;
  data: any;
  timestamp: number;
  size: number;
}

const CACHE_KEY_PREFIX = 'subtitle-cache-';
const MAX_CACHE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 天
const DEBUG = process.env.NODE_ENV === 'development';

class SubtitleCacheManager {
  private memoryCache: Map<string, CachedSubtitle> = new Map();

  /**
   * 获取缓存的字幕
   */
  async get(videoId: string): Promise<any | null> {
    // 先检查内存缓存
    const memCached = this.memoryCache.get(videoId);
    if (memCached && Date.now() - memCached.timestamp < MAX_CACHE_AGE) {
      return memCached.data;
    }

    // 检查 localStorage 缓存
    const key = CACHE_KEY_PREFIX + videoId;
    const result = safeStorage.getJSON<CachedSubtitle>(key);

    if (result.success && result.data) {
      const parsed = result.data;
      if (Date.now() - parsed.timestamp < MAX_CACHE_AGE) {
        // 恢复到内存缓存
        this.memoryCache.set(videoId, parsed);
        return parsed.data;
      } else {
        // 过期，删除
        safeStorage.removeItem(key);
      }
    }

    return null;
  }

  /**
   * 缓存字幕数据
   */
  async set(videoId: string, data: any): Promise<void> {
    const size = JSON.stringify(data).length;
    const cached: CachedSubtitle = {
      videoId,
      data,
      timestamp: Date.now(),
      size,
    };

    // 存入内存缓存
    this.memoryCache.set(videoId, cached);

    // 存入 localStorage
    await this.ensureCacheSpace(size);
    const key = CACHE_KEY_PREFIX + videoId;
    safeStorage.setJSON(key, cached);
  }

  /**
   * 预加载字幕
   */
  async preload(videoId: string, fetchFn: () => Promise<any>): Promise<void> {
    // 检查是否已缓存
    const cached = await this.get(videoId);
    if (cached) {
      if (DEBUG) {
        console.log('[SubtitleCache] Already cached:', videoId);
      }
      return;
    }

    // 后台获取并缓存
    try {
      if (DEBUG) {
        console.log('[SubtitleCache] Preloading:', videoId);
      }
      const data = await fetchFn();
      await this.set(videoId, data);
      if (DEBUG) {
        console.log('[SubtitleCache] Preloaded:', videoId);
      }
    } catch (error) {
      console.error('[SubtitleCache] Preload failed:', videoId, error);
    }
  }

  /**
   * 确保有足够的缓存空间
   */
  private async ensureCacheSpace(requiredSize: number): Promise<void> {
    const currentSize = this.getCurrentCacheSize();

    if (currentSize + requiredSize <= MAX_CACHE_SIZE) {
      return;
    }

    // 需要清理空间，按时间戳排序
    const entries: CachedSubtitle[] = [];
    const keys = safeStorage.keys();

    for (const key of keys) {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        const result = safeStorage.getJSON<CachedSubtitle>(key);
        if (result.success && result.data) {
          entries.push(result.data);
        }
      }
    }

    entries.sort((a, b) => a.timestamp - b.timestamp);

    // 删除最旧的条目直到有足够空间
    let freedSpace = 0;
    for (const entry of entries) {
      if (currentSize - freedSpace + requiredSize <= MAX_CACHE_SIZE) {
        break;
      }
      const key = CACHE_KEY_PREFIX + entry.videoId;
      safeStorage.removeItem(key);
      this.memoryCache.delete(entry.videoId);
      freedSpace += entry.size;
    }
  }

  /**
   * 获取当前缓存大小
   */
  private getCurrentCacheSize(): number {
    let totalSize = 0;
    const keys = safeStorage.keys();

    for (const key of keys) {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        const result = safeStorage.getJSON<CachedSubtitle>(key);
        if (result.success && result.data) {
          totalSize += result.data.size;
        }
      }
    }
    return totalSize;
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    const keys = safeStorage.keys();

    for (const key of keys) {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        safeStorage.removeItem(key);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { count: number; size: number; sizeFormatted: string } {
    const size = this.getCurrentCacheSize();
    const count = this.memoryCache.size;
    const sizeFormatted = size > 1024 * 1024
      ? `${(size / 1024 / 1024).toFixed(2)} MB`
      : `${(size / 1024).toFixed(2)} KB`;

    return { count, size, sizeFormatted };
  }
}

// 单例实例
export const subtitleCache = new SubtitleCacheManager();
