/**
 * 安全的 localStorage 包装器
 * 统一处理存储错误(隐私模式、配额超限等)
 */

export type StorageError =
  | 'QUOTA_EXCEEDED'
  | 'SECURITY_ERROR'
  | 'NOT_AVAILABLE'
  | 'UNKNOWN_ERROR';

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
}

class SafeStorageManager {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  /**
   * 检查 localStorage 是否可用
   */
  private checkAvailability(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取存储项
   */
  getItem(key: string): string | null {
    if (!this.isAvailable) {
      console.warn('[SafeStorage] localStorage not available');
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[SafeStorage] getItem failed:', key, error);
      return null;
    }
  }

  /**
   * 获取并解析 JSON
   */
  getJSON<T>(key: string): StorageResult<T> {
    const item = this.getItem(key);

    if (item === null) {
      return { success: false, error: 'NOT_AVAILABLE' };
    }

    try {
      const data = JSON.parse(item) as T;
      return { success: true, data };
    } catch (error) {
      console.error('[SafeStorage] JSON parse failed:', key, error);
      return { success: false, error: 'UNKNOWN_ERROR' };
    }
  }

  /**
   * 设置存储项
   */
  setItem(key: string, value: string): StorageResult<void> {
    if (!this.isAvailable) {
      console.warn('[SafeStorage] localStorage not available');
      return { success: false, error: 'NOT_AVAILABLE' };
    }

    try {
      localStorage.setItem(key, value);
      return { success: true };
    } catch (error: any) {
      let storageError: StorageError = 'UNKNOWN_ERROR';

      if (error?.name === 'QuotaExceededError') {
        console.error('[SafeStorage] Quota exceeded for key:', key);
        storageError = 'QUOTA_EXCEEDED';
      } else if (error?.name === 'SecurityError') {
        console.error('[SafeStorage] Access denied (private mode?):', key);
        storageError = 'SECURITY_ERROR';
      } else {
        console.error('[SafeStorage] setItem failed:', key, error);
      }

      return { success: false, error: storageError };
    }
  }

  /**
   * 设置 JSON 数据
   */
  setJSON<T>(key: string, value: T): StorageResult<void> {
    try {
      const json = JSON.stringify(value);
      return this.setItem(key, json);
    } catch (error) {
      console.error('[SafeStorage] JSON stringify failed:', key, error);
      return { success: false, error: 'UNKNOWN_ERROR' };
    }
  }

  /**
   * 删除存储项
   */
  removeItem(key: string): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[SafeStorage] removeItem failed:', key, error);
    }
  }

  /**
   * 清空所有存储
   */
  clear(): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.error('[SafeStorage] clear failed:', error);
    }
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    if (!this.isAvailable) {
      return [];
    }

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('[SafeStorage] keys failed:', error);
      return [];
    }
  }

  /**
   * 检查键是否存在
   */
  hasKey(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * 获取存储大小(字节)
   */
  getSize(): number {
    if (!this.isAvailable) {
      return 0;
    }

    try {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            size += key.length + value.length;
          }
        }
      }
      return size;
    } catch (error) {
      console.error('[SafeStorage] getSize failed:', error);
      return 0;
    }
  }

  /**
   * 获取格式化的存储大小
   */
  getSizeFormatted(): string {
    const size = this.getSize();
    if (size > 1024 * 1024) {
      return `${(size / 1024 / 1024).toFixed(2)} MB`;
    } else if (size > 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${size} B`;
    }
  }
}

// 单例实例
export const safeStorage = new SafeStorageManager();

// 向后兼容的简单接口
export const storage = {
  get: (key: string) => safeStorage.getItem(key),
  set: (key: string, value: string) => safeStorage.setItem(key, value).success,
  remove: (key: string) => safeStorage.removeItem(key),
  getJSON: <T>(key: string) => safeStorage.getJSON<T>(key).data ?? null,
  setJSON: <T>(key: string, value: T) => safeStorage.setJSON(key, value).success,
};
