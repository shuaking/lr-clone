/**
 * 词汇保存系统
 * 管理用户保存的单词和短语
 * 支持混合存储：已登录用户使用云端，未登录用户使用 localStorage
 */

import { isSupabaseConfigured } from './supabase/client';
import { getCurrentUser } from './supabase/auth';
import {
  getCloudVocabulary,
  saveCloudVocabulary,
  removeCloudVocabulary,
  isWordSavedInCloud,
  getCloudVocabularyByVideo,
} from './supabase/vocabulary-sync';
import { safeStorage } from './safe-storage';

export interface SavedVocabulary {
  id: string;
  word: string;
  translation: string;
  context: string; // 完整的字幕句子
  timestamp: number; // 视频时间戳
  videoId: string;
  savedAt: number; // 保存时间
}

const STORAGE_KEY = 'lr-saved-vocabulary';

/**
 * 检查是否应该使用云端存储
 */
async function shouldUseCloud(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch {
    return false;
  }
}

/**
 * 获取所有保存的词汇（混合存储）
 */
export async function getSavedVocabulary(): Promise<SavedVocabulary[]> {
  if (typeof window === 'undefined') return [];

  try {
    // 检查是否使用云端
    if (await shouldUseCloud()) {
      return await getCloudVocabulary();
    }

    // 使用本地存储
    const result = safeStorage.getJSON<SavedVocabulary[]>(STORAGE_KEY);
    return result.success && result.data ? result.data : [];
  } catch (error) {
    console.error('Failed to load vocabulary:', error);
    // 降级到本地存储
    const result = safeStorage.getJSON<SavedVocabulary[]>(STORAGE_KEY);
    return result.success && result.data ? result.data : [];
  }
}

/**
 * 获取所有保存的词汇（同步版本，仅用于向后兼容）
 * @deprecated 使用异步版本 getSavedVocabulary()
 */
export function getSavedVocabularySync(): SavedVocabulary[] {
  if (typeof window === 'undefined') return [];

  const result = safeStorage.getJSON<SavedVocabulary[]>(STORAGE_KEY);
  return result.success && result.data ? result.data : [];
}

/**
 * 保存新词汇（混合存储）
 */
export async function saveVocabulary(item: Omit<SavedVocabulary, 'id' | 'savedAt'>): Promise<SavedVocabulary> {
  try {
    // 检查是否使用云端
    if (await shouldUseCloud()) {
      return await saveCloudVocabulary(item);
    }

    // 使用本地存储
    return saveVocabularyLocal(item);
  } catch (error) {
    console.error('Failed to save vocabulary to cloud, falling back to local:', error);
    // 降级到本地存储
    return saveVocabularyLocal(item);
  }
}

/**
 * 保存到本地存储（内部函数）
 */
function saveVocabularyLocal(item: Omit<SavedVocabulary, 'id' | 'savedAt'>): SavedVocabulary {
  const vocabulary = getSavedVocabularySync();

  const newItem: SavedVocabulary = {
    ...item,
    id: `${item.videoId}-${item.word}-${Date.now()}`,
    savedAt: Date.now()
  };

  vocabulary.unshift(newItem); // 最新的在前面

  const result = safeStorage.setJSON(STORAGE_KEY, vocabulary);

  if (!result.success) {
    if (result.error === 'QUOTA_EXCEEDED') {
      throw new Error('STORAGE_QUOTA_EXCEEDED');
    } else if (result.error === 'SECURITY_ERROR') {
      throw new Error('STORAGE_DISABLED');
    }
    throw new Error('STORAGE_UNKNOWN_ERROR');
  }

  return newItem;
}

/**
 * 删除词汇（混合存储）
 */
export async function removeVocabulary(id: string): Promise<void> {
  try {
    // 检查是否使用云端
    if (await shouldUseCloud()) {
      await removeCloudVocabulary(id);
      return;
    }

    // 使用本地存储
    removeVocabularyLocal(id);
  } catch (error) {
    console.error('Failed to remove vocabulary from cloud, falling back to local:', error);
    // 降级到本地存储
    removeVocabularyLocal(id);
  }
}

/**
 * 从本地存储删除（内部函数）
 */
function removeVocabularyLocal(id: string): void {
  const vocabulary = getSavedVocabularySync();
  const filtered = vocabulary.filter(item => item.id !== id);

  const result = safeStorage.setJSON(STORAGE_KEY, filtered);

  if (!result.success) {
    if (result.error === 'QUOTA_EXCEEDED') {
      throw new Error('STORAGE_QUOTA_EXCEEDED');
    } else if (result.error === 'SECURITY_ERROR') {
      throw new Error('STORAGE_DISABLED');
    }
    throw new Error('STORAGE_UNKNOWN_ERROR');
  }
}

/**
 * 检查单词是否已保存（混合存储）
 */
export async function isWordSaved(word: string, videoId: string): Promise<boolean> {
  try {
    // 检查是否使用云端
    if (await shouldUseCloud()) {
      return await isWordSavedInCloud(word, videoId);
    }

    // 使用本地存储
    const vocabulary = getSavedVocabularySync();
    return vocabulary.some(item =>
      item.word.toLowerCase() === word.toLowerCase() &&
      item.videoId === videoId
    );
  } catch (error) {
    console.error('Failed to check word in cloud, falling back to local:', error);
    // 降级到本地存储
    const vocabulary = getSavedVocabularySync();
    return vocabulary.some(item =>
      item.word.toLowerCase() === word.toLowerCase() &&
      item.videoId === videoId
    );
  }
}

/**
 * 按视频 ID 获取词汇（混合存储）
 */
export async function getVocabularyByVideo(videoId: string): Promise<SavedVocabulary[]> {
  try {
    // 检查是否使用云端
    if (await shouldUseCloud()) {
      return await getCloudVocabularyByVideo(videoId);
    }

    // 使用本地存储
    const vocabulary = getSavedVocabularySync();
    return vocabulary.filter(item => item.videoId === videoId);
  } catch (error) {
    console.error('Failed to get vocabulary from cloud, falling back to local:', error);
    // 降级到本地存储
    const vocabulary = getSavedVocabularySync();
    return vocabulary.filter(item => item.videoId === videoId);
  }
}
