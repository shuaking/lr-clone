/**
 * 词汇保存系统
 * 管理用户保存的单词和短语
 */

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
 * 获取所有保存的词汇
 */
export function getSavedVocabulary(): SavedVocabulary[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load vocabulary:', error);
    return [];
  }
}

/**
 * 保存新词汇
 */
export function saveVocabulary(item: Omit<SavedVocabulary, 'id' | 'savedAt'>): SavedVocabulary {
  const vocabulary = getSavedVocabulary();

  const newItem: SavedVocabulary = {
    ...item,
    id: `${item.videoId}-${item.word}-${Date.now()}`,
    savedAt: Date.now()
  };

  vocabulary.unshift(newItem); // 最新的在前面

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabulary));
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('STORAGE_QUOTA_EXCEEDED');
      } else if (error.name === 'SecurityError') {
        throw new Error('STORAGE_DISABLED');
      }
    }
    throw new Error('STORAGE_UNKNOWN_ERROR');
  }

  return newItem;
}

/**
 * 删除词汇
 */
export function removeVocabulary(id: string): void {
  const vocabulary = getSavedVocabulary();
  const filtered = vocabulary.filter(item => item.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('STORAGE_QUOTA_EXCEEDED');
      } else if (error.name === 'SecurityError') {
        throw new Error('STORAGE_DISABLED');
      }
    }
    throw new Error('STORAGE_UNKNOWN_ERROR');
  }
}

/**
 * 检查单词是否已保存
 */
export function isWordSaved(word: string, videoId: string): boolean {
  const vocabulary = getSavedVocabulary();
  return vocabulary.some(item =>
    item.word.toLowerCase() === word.toLowerCase() &&
    item.videoId === videoId
  );
}

/**
 * 按视频 ID 获取词汇
 */
export function getVocabularyByVideo(videoId: string): SavedVocabulary[] {
  const vocabulary = getSavedVocabulary();
  return vocabulary.filter(item => item.videoId === videoId);
}
